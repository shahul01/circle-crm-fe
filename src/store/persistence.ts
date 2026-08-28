import { saveState, type PersistedState } from '@/services/storage';

const DEBOUNCE_MS = 500;

let getState: (() => Record<string, any>) | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function buildState(state: Record<string, any>): PersistedState {
  return {
    version: 1,
    timestamp: Date.now(),
    customers: state.customers,
    leads: state.leads,
    tasks: state.tasks,
    auth: state.auth,
    ui: state.ui,
    activity: state.activity,
  };
}

function persistCurrent() {
  if (getState) saveState(buildState(getState()));
}

export function setupPersistence(api: {
  getState: () => Record<string, any>;
  subscribe: (listener: () => void) => () => void;
}) {
  getState = api.getState;

  api.subscribe(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(persistCurrent, DEBOUNCE_MS);
  });
}

// Force-write the latest state immediately, cancelling any pending debounce.
// Used so critical changes (e.g. form submissions) are flushed to localStorage
// before the UI proceeds, preventing loss if the user reloads/leaves early.
export function flushPersistence() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  persistCurrent();
}
