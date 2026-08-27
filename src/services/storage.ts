const STORAGE_KEY = 'circle_crm_state_v1';
const STORAGE_VERSION = 1;

export interface PersistedState {
  version: number;
  timestamp: number;
  customers: unknown;
  leads: unknown;
  tasks: unknown;
  auth: unknown;
  ui: unknown;
  activity: unknown;
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded — silently fail
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export { STORAGE_VERSION };
