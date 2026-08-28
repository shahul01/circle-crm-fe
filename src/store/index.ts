import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth-slice';
import customerReducer from './slices/customer-slice';
import leadReducer from './slices/lead-slice';
import taskReducer from './slices/task-slice';
import notificationReducer from './slices/notification-slice';
import uiReducer from './slices/ui-slice';
import activityReducer from './slices/activity-slice';
import { loadState } from '@/services/storage';
import { setupActivityTracking } from './listener';
import { setupPersistence } from './persistence';

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

setupPersistence(store);
setupActivityTracking(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
