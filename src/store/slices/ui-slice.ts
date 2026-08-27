import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

const initialState: UiState = {
  theme: 'light',
  sidebarOpen: true,
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
  },
  extraReducers: (builder) => {
    builder.addCase(
      'ui/@@HYDRATE',
      (_state, action) => (action as any).payload
    );
  },
});

export const { toggleTheme, setTheme, toggleSidebar, setSidebarOpen } =
  uiSlice.actions;
export default uiSlice.reducer;

export const selectTheme = (state: { ui: UiState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UiState }) =>
  state.ui.sidebarOpen;
