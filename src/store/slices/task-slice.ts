import {
  createSlice,
  createEntityAdapter,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Task, TaskStatus, TaskPriority } from '@/types';
import { employeeDisplayName } from '@/services/employees';

interface TaskUI {
  search: string;
  statusFilter: TaskStatus | 'All';
  priorityFilter: TaskPriority | 'All';
  sortField:
    | keyof Pick<
        Task,
        'title' | 'status' | 'priority' | 'dueDate' | 'createdAt'
      >
    | 'assignedEmployeeId'
    | 'board';
  sortDir: 'asc' | 'desc';
  page: number;
  perPage: number;
  selectedIds: string[];
}

export interface TaskState {
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
    page: 1,
    perPage: 10,
    selectedIds: [],
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
      state.ui.page = 1;
    },
    setTaskStatusFilter(state, action: PayloadAction<TaskStatus | 'All'>) {
      state.ui.statusFilter = action.payload;
      state.ui.page = 1;
    },
    setTaskPriorityFilter(state, action: PayloadAction<TaskPriority | 'All'>) {
      state.ui.priorityFilter = action.payload;
      state.ui.page = 1;
    },
    setTaskSort(
      state,
      action: PayloadAction<{ field: TaskUI['sortField']; dir: 'asc' | 'desc' }>
    ) {
      state.ui.sortField = action.payload.field;
      state.ui.sortDir = action.payload.dir;
    },
    setTaskPage(state, action: PayloadAction<number>) {
      state.ui.page = action.payload;
    },
    toggleTaskSelection(state, action: PayloadAction<string>) {
      const idx = state.ui.selectedIds.indexOf(action.payload);
      if (idx === -1) {
        state.ui.selectedIds.push(action.payload);
      } else {
        state.ui.selectedIds.splice(idx, 1);
      }
    },
    toggleSelectAllTasks(state) {
      if (state.ui.selectedIds.length === state.ids.length) {
        state.ui.selectedIds = [];
      } else {
        state.ui.selectedIds = [...state.ids];
      }
    },
    clearTaskSelection(state) {
      state.ui.selectedIds = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase('tasks/@@HYDRATE', (_state, action) => {
      const persisted = (action as any).payload;
      return {
        ...initialState,
        ...persisted,
        ui: { ...initialState.ui, ...(persisted.ui ?? {}) },
      };
    });
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
  setTaskPage,
  toggleTaskSelection,
  toggleSelectAllTasks,
  clearTaskSelection,
} = taskSlice.actions;

export default taskSlice.reducer;

// Selectors
const selectTaskState = (state: { tasks: TaskState }) => state.tasks;
const adapterSelectors = taskAdapter.getSelectors(selectTaskState);
export const selectAllTasks = adapterSelectors.selectAll;
export const selectTaskById = adapterSelectors.selectById;

const BOARD_STATUS_ORDER: Record<TaskStatus, number> = {
  Todo: 0,
  'In Progress': 1,
  Completed: 2,
};

function compareTasksBySort(
  a: Task,
  b: Task,
  field: TaskUI['sortField']
): number {
  if (field === 'board') {
    const orderDiff =
      BOARD_STATUS_ORDER[a.status] - BOARD_STATUS_ORDER[b.status];
    if (orderDiff !== 0) return orderDiff;
    const aPos = a.position ?? Number.MAX_SAFE_INTEGER;
    const bPos = b.position ?? Number.MAX_SAFE_INTEGER;
    if (aPos !== bPos) return aPos - bPos;
    return a.createdAt.localeCompare(b.createdAt);
  }
  if (field === 'assignedEmployeeId') {
    return employeeDisplayName(a.assignedEmployeeId).localeCompare(
      employeeDisplayName(b.assignedEmployeeId)
    );
  }
  return String(a[field] ?? '').localeCompare(String(b[field] ?? ''));
}

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
    const cmp = compareTasksBySort(a, b, ui.sortField);
    return ui.sortDir === 'asc' ? cmp : -cmp;
  });
};

export const selectPaginatedTasks = (state: { tasks: TaskState }) => {
  const filtered = selectFilteredTasks(state);
  const { page, perPage } = state.tasks.ui;
  const start = (page - 1) * perPage;
  return {
    items: filtered.slice(start, start + perPage),
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / perPage) || 1,
  };
};

export const selectTaskPage = (state: { tasks: TaskState }) =>
  state.tasks.ui.page;
export const selectTaskSearch = (state: { tasks: TaskState }) =>
  state.tasks.ui.search;
export const selectSelectedTaskIds = (state: { tasks: TaskState }) =>
  state.tasks.ui.selectedIds;
export const selectTaskStatusFilter = (state: { tasks: TaskState }) =>
  state.tasks.ui.statusFilter;
export const selectTaskPriorityFilter = (state: { tasks: TaskState }) =>
  state.tasks.ui.priorityFilter;
export const selectTaskSort = (state: { tasks: TaskState }) => ({
  field: state.tasks.ui.sortField,
  dir: state.tasks.ui.sortDir,
});

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
