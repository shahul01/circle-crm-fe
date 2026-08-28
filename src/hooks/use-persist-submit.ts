import { useCallback, useState } from 'react';
import { flushPersistence } from '@/store/persistence';

const MIN_PERSIST_WAIT_MS = 400;

/**
 * Handles submitting a form that must survive a page reload.
 *
 * Dispatches the state-changing work synchronously, force-flushes the latest
 * state to localStorage, then keeps the UI in a disabled "saving" state for at
 * least MIN_PERSIST_WAIT_MS so the user cannot close/reload before the data
 * has actually been persisted.
 */
export function usePersistSubmit() {
  const [saving, setSaving] = useState(false);

  const run = useCallback(async (work: () => void) => {
    setSaving(true);
    work();
    const started = performance.now();
    flushPersistence();
    const elapsed = performance.now() - started;
    const remaining = Math.max(0, MIN_PERSIST_WAIT_MS - elapsed);
    await new Promise((resolve) => setTimeout(resolve, remaining));
    setSaving(false);
  }, []);

  return { saving, run };
}
