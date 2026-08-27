import {
  createSlice,
  createEntityAdapter,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Task, TaskStatus, TaskPriority } from '@/types';

interface TaskUI {
  search: string;
  statusFilter: TaskStatus | 'All';
  priorityFilter: TaskPriority | 'All';
  sortField: keyof Pick<
    Task,
    'title' | 'status' | 'priority' | 'dueDate' | 'createdAt'
  >;
  sortDir: 'asc' | 'desc';
}

interface TaskState {
  entities: Record<string, Task>;
  ids: string[];
  ui: TaskUI;
}

const taskAdapter = createEntityAdapter<Task>({
  sortComparer: (a, b) => a.createdAt.localeCompare(b.createdAt),
});

const initialState: TaskState = {
  entities: {},
  ids: [],
  ui: {
    search: '',
    statusFilter: 'All',
    priorityFilter: 'All',
    sortField: 'createdAt',
    sortDir: 'desc',
  },
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: taskAdapter.addOne,
    addManyTasks: taskAdapter.addMany,
    updateTask: taskAdapter.updateOne,
    removeTask: taskAdapter.removeOne,
    removeManyTasks: taskAdapter.removeMany,
    setTaskStatus(
      state,
      action: PayloadAction<{ taskId: string; status: TaskStatus }>
    ) {
      const task = state.entities[action.payload.taskId];
      if (task) {
        task.status = action.payload.status;
      }
    },
    setTaskSearch(state, action: PayloadAction<string>) {
      state.ui.search = action.payload;
    },
    setTaskStatusFilter(state, action: PayloadAction<TaskStatus | 'All'>) {
      state.ui.statusFilter = action.payload;
    },
    setTaskPriorityFilter(state, action: PayloadAction<TaskPriority | 'All'>) {
      state.ui.priorityFilter = action.payload;
    },
    setTaskSort(
      state,
      action: PayloadAction<{ field: TaskUI['sortField']; dir: 'asc' | 'desc' }>
    ) {
      state.ui.sortField = action.payload.field;
      state.ui.sortDir = action.payload.dir;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      'tasks/@@HYDRATE',
      (_state, action) => (action as any).payload
    );
  },
});

export const {
  addTask,
  addManyTasks,
  updateTask,
  removeTask,
  removeManyTasks,
  setTaskStatus,
  setTaskSearch,
  setTaskStatusFilter,
  setTaskPriorityFilter,
  setTaskSort,
} = taskSlice.actions;

export default taskSlice.reducer;

// Selectors
const selectTaskState = (state: { tasks: TaskState }) => state.tasks;
const adapterSelectors = taskAdapter.getSelectors(selectTaskState);
export const selectAllTasks = adapterSelectors.selectAll;
export const selectTaskById = adapterSelectors.selectById;

export const selectFilteredTasks = (state: { tasks: TaskState }) => {
  const { entities, ids, ui } = state.tasks;
  let filtered = ids.map((id) => entities[id]).filter(Boolean);

  if (ui.search) {
    const q = ui.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }

  if (ui.statusFilter !== 'All') {
    filtered = filtered.filter((t) => t.status === ui.statusFilter);
  }

  if (ui.priorityFilter !== 'All') {
    filtered = filtered.filter((t) => t.priority === ui.priorityFilter);
  }

  return [...filtered].sort((a, b) => {
    const aVal = a[ui.sortField] as string;
    const bVal = b[ui.sortField] as string;
    const cmp = aVal.localeCompare(bVal);
    return ui.sortDir === 'asc' ? cmp : -cmp;
  });
};

export const selectTotalTasks = (state: { tasks: TaskState }) =>
  state.tasks.ids.length;
export const selectPendingTasks = (state: { tasks: TaskState }) => {
  return Object.values(state.tasks.entities).filter(
    (t) => t && t.status !== 'Completed'
  ).length;
};
export const selectCompletedTasks = (state: { tasks: TaskState }) => {
  return Object.values(state.tasks.entities).filter(
    (t) => t && t.status === 'Completed'
  ).length;
};
export const selectTasksByCustomerId =
  (customerId: string) => (state: { tasks: TaskState }) => {
    return Object.values(state.tasks.entities).filter(
      (t) => t && t.relatedCustomerId === customerId
    );
  };
