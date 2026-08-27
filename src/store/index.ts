import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth-slice';
import customerReducer from './slices/customer-slice';
import leadReducer from './slices/lead-slice';
import taskReducer from './slices/task-slice';
import notificationReducer from './slices/notification-slice';
import uiReducer from './slices/ui-slice';
import activityReducer from './slices/activity-slice';
import { loadState, saveState, type PersistedState } from '@/services/storage';
import { setupActivityTracking } from './listener';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    leads: leadReducer,
    tasks: taskReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    activity: activityReducer,
  },
});

// Hydrate from localStorage
const persisted = loadState();
if (persisted) {
  if (persisted.auth)
    store.dispatch({ type: 'auth/@@HYDRATE', payload: persisted.auth });
  if (persisted.customers)
    store.dispatch({
      type: 'customers/@@HYDRATE',
      payload: persisted.customers,
    });
  if (persisted.leads)
    store.dispatch({ type: 'leads/@@HYDRATE', payload: persisted.leads });
  if (persisted.tasks)
    store.dispatch({ type: 'tasks/@@HYDRATE', payload: persisted.tasks });
  if (persisted.ui)
    store.dispatch({ type: 'ui/@@HYDRATE', payload: persisted.ui });
  if (persisted.activity)
    store.dispatch({ type: 'activity/@@HYDRATE', payload: persisted.activity });
}

// Debounced persistence
let saveTimer: ReturnType<typeof setTimeout> | null = null;
store.subscribe(() => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const s = store.getState();
    const toSave: PersistedState = {
      version: 1,
      timestamp: Date.now(),
      customers: s.customers,
      leads: s.leads,
      tasks: s.tasks,
      auth: s.auth,
      ui: s.ui,
      activity: s.activity,
    };
    saveState(toSave);
  }, 500);
});

setupActivityTracking(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
