import { saveState, type PersistedState } from '@/services/storage';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function setupPersistence(api: {
  getState: () => Record<string, any>;
  subscribe: (listener: () => void) => () => void;
}) {
  api.subscribe(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const state = api.getState();
      const toSave: PersistedState = {
        version: 1,
        timestamp: Date.now(),
        customers: state.customers,
        leads: state.leads,
        tasks: state.tasks,
        auth: state.auth,
        ui: state.ui,
        activity: state.activity,
      };
      saveState(toSave);
    }, 500);
  });
}
