import { describe, it, expect } from 'vitest';
import taskReducer, {
  addTask,
  updateTask,
  removeTask,
  setTaskStatus,
  setTaskSearch,
  setTaskStatusFilter,
  setTaskPriorityFilter,
  selectFilteredTasks,
  selectPendingTasks,
  selectCompletedTasks,
  selectTotalTasks,
  selectTasksByCustomerId,
  type TaskState,
} from '../task-slice';
import type { Task } from '@/types';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: `t-${Math.random().toString(36).slice(2, 8)}`,
  title: 'Follow up with client',
  description: 'Send proposal',
  assignedEmployeeId: 'emp-1',
  priority: 'Medium',
  dueDate: '2025-07-01',
  status: 'Todo',
  createdAt: '2025-06-15T08:00:00Z',
  ...overrides,
});

const makeState = (tasks: Task[]): TaskState => ({
  entities: Object.fromEntries(tasks.map((t) => [t.id, t])),
  ids: tasks.map((t) => t.id),
  ui: {
    search: '',
    statusFilter: 'All',
    priorityFilter: 'All',
    sortField: 'createdAt',
    sortDir: 'desc',
    page: 1,
    perPage: 10,
    selectedIds: [] as string[],
  },
});

describe('taskSlice CRUD', () => {
  it('adds a task', () => {
    const task = makeTask({ id: 't1' });
    const state = taskReducer(makeState([]), addTask(task));
    expect(state.ids).toEqual(['t1']);
    expect(selectTotalTasks({ tasks: state })).toBe(1);
  });

  it('updates a task', () => {
    const task = makeTask({ id: 't1', priority: 'Low' });
    let state = taskReducer(makeState([]), addTask(task));
    state = taskReducer(
      state,
      updateTask({
        id: 't1',
        changes: { priority: 'High', dueDate: '2025-08-01' },
      })
    );
    expect(state.entities.t1.priority).toBe('High');
    expect(state.entities.t1.dueDate).toBe('2025-08-01');
  });

  it('deletes a task', () => {
    const state = taskReducer(
      makeState([makeTask({ id: 't1' })]),
      removeTask('t1')
    );
    expect(state.ids).toEqual([]);
  });
});

describe('taskSlice status updates', () => {
  it('updates task status via setTaskStatus', () => {
    const task = makeTask({ id: 't1', status: 'Todo' });
    let state = taskReducer(
      makeState([task]),
      setTaskStatus({ taskId: 't1', status: 'In Progress' })
    );
    expect(state.entities.t1.status).toBe('In Progress');
    state = taskReducer(
      state,
      setTaskStatus({ taskId: 't1', status: 'Completed' })
    );
    expect(state.entities.t1.status).toBe('Completed');
  });

  it('ignores status updates for unknown tasks', () => {
    const state = taskReducer(
      makeState([]),
      setTaskStatus({ taskId: 'missing', status: 'Completed' })
    );
    expect(state.ids).toEqual([]);
  });

  it('counts pending and completed tasks', () => {
    const tasks = [
      makeTask({ id: 't1', status: 'Todo' }),
      makeTask({ id: 't2', status: 'In Progress' }),
      makeTask({ id: 't3', status: 'Completed' }),
    ];
    const state = makeState(tasks);
    expect(selectPendingTasks({ tasks: state })).toBe(2);
    expect(selectCompletedTasks({ tasks: state })).toBe(1);
  });
});

describe('taskSlice search/filter/customer', () => {
  const tasks = [
    makeTask({
      id: 't1',
      title: 'Alpha call',
      status: 'Todo',
      priority: 'High',
      relatedCustomerId: 'c1',
    }),
    makeTask({
      id: 't2',
      title: 'Beta deck',
      status: 'In Progress',
      priority: 'Low',
    }),
    makeTask({
      id: 't3',
      title: 'Gamma report',
      status: 'Completed',
      priority: 'Medium',
      relatedCustomerId: 'c1',
    }),
  ];
  const base = makeState(tasks);

  it('filters tasks by search', () => {
    const state = taskReducer(base, setTaskSearch('deck'));
    expect(selectFilteredTasks({ tasks: state }).map((t) => t.id)).toEqual([
      't2',
    ]);
  });

  it('filters tasks by status', () => {
    const state = taskReducer(base, setTaskStatusFilter('Completed'));
    expect(selectFilteredTasks({ tasks: state }).map((t) => t.id)).toEqual([
      't3',
    ]);
  });

  it('filters tasks by priority', () => {
    const state = taskReducer(base, setTaskPriorityFilter('High'));
    expect(selectFilteredTasks({ tasks: state }).map((t) => t.id)).toEqual([
      't1',
    ]);
  });

  it('selects tasks related to a customer', () => {
    expect(
      selectTasksByCustomerId('c1')({ tasks: base }).map((t) => t.id)
    ).toEqual(['t1', 't3']);
  });
});
