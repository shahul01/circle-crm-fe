import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer, {
  setTasksView,
  selectTasksView,
  setTheme,
  selectTheme,
} from '../ui-slice';

const makeStore = () =>
  configureStore({
    reducer: { ui: uiReducer },
  });

describe('uiSlice tasks view', () => {
  it('defaults to list view', () => {
    const store = makeStore();
    expect(selectTasksView(store.getState())).toBe('list');
  });

  it('switches to kanban view', () => {
    const store = makeStore();
    store.dispatch(setTasksView('kanban'));
    expect(selectTasksView(store.getState())).toBe('kanban');
  });

  it('switches back to list view', () => {
    const store = makeStore();
    store.dispatch(setTasksView('kanban'));
    store.dispatch(setTasksView('list'));
    expect(selectTasksView(store.getState())).toBe('list');
  });

  it('restores tasks view and theme from persisted state (hydration)', () => {
    const store = makeStore();
    store.dispatch({
      type: 'ui/@@HYDRATE',
      payload: { theme: 'dark', sidebarOpen: false, tasksView: 'kanban' },
    });
    const state = store.getState().ui;
    expect(selectTasksView(store.getState())).toBe('kanban');
    expect(selectTheme(store.getState())).toBe('dark');
    expect(state.sidebarOpen).toBe(false);
  });

  it('fills missing fields with defaults on hydration', () => {
    const store = makeStore();
    store.dispatch({
      type: 'ui/@@HYDRATE',
      payload: { theme: 'dark' },
    });
    const state = store.getState().ui;
    expect(state.tasksView).toBe('list');
    expect(state.sidebarOpen).toBe(true);
    expect(state.theme).toBe('dark');
  });

  it('keeps unrelated ui state when switching tasks view', () => {
    const store = makeStore();
    store.dispatch(setTheme('dark'));
    store.dispatch(setTasksView('kanban'));
    const state = store.getState().ui;
    expect(state.theme).toBe('dark');
    expect(state.tasksView).toBe('kanban');
  });
});
