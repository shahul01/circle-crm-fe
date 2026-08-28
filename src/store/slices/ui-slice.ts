import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type TasksView = 'list' | 'kanban';

interface UiState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  tasksView: TasksView;
}

const initialState: UiState = {
  theme: 'light',
  sidebarOpen: true,
  tasksView: 'list',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setTasksView(state, action: PayloadAction<TasksView>) {
      state.tasksView = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase('ui/@@HYDRATE', (_state, action) => {
      const persisted = (action as any).payload;
      return { ...initialState, ...(persisted ?? {}) };
    });
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setTasksView,
} = uiSlice.actions;
export default uiSlice.reducer;

export const selectTheme = (state: { ui: UiState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UiState }) =>
  state.ui.sidebarOpen;
export const selectTasksView = (state: { ui: UiState }) => state.ui.tasksView;
