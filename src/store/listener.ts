import { logActivity } from './slices/activity-slice';

let prevCustomerIds: string[] = [];
let prevLeadIds: string[] = [];
let prevTaskIds: string[] = [];

interface CreatedDiff {
  addedIds: string[];
  nextIds: string[];
}

function diffCreated(prevIds: string[], currentIds: string[]): CreatedDiff {
  const nextIds = [...currentIds];
  return {
    addedIds: nextIds.filter((id) => !prevIds.includes(id)),
    nextIds,
  };
}

function dispatchCreated(
  dispatch: (action: any) => any,
  addedIds: string[],
  entities: Record<string, any>,
  entityType: 'customer' | 'lead' | 'task',
  nameField: string
) {
  for (const id of addedIds) {
    const entity = entities[id];
    if (entity) {
      dispatch(
        logActivity({
          entityType,
          entityName: entity[nameField] ?? 'Unknown',
          entityId: id,
          action: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} created`,
        })
      );
    }
  }
}

export function setupActivityTracking(api: {
  getState: () => Record<string, any>;
  dispatch: (action: any) => any;
  subscribe: (listener: () => void) => () => void;
}) {
  const initState = api.getState();
  prevCustomerIds = [...(initState.customers?.ids ?? [])];
  prevLeadIds = [...(initState.leads?.ids ?? [])];
  prevTaskIds = [...(initState.tasks?.ids ?? [])];

  api.subscribe(() => {
    const state = api.getState();

    const customers = diffCreated(prevCustomerIds, state.customers?.ids ?? []);
    const leads = diffCreated(prevLeadIds, state.leads?.ids ?? []);
    const tasks = diffCreated(prevTaskIds, state.tasks?.ids ?? []);

    // Update tracked ids before dispatching so the logActivity actions
    // re-entering this listener are no-ops instead of an infinite loop.
    prevCustomerIds = customers.nextIds;
    prevLeadIds = leads.nextIds;
    prevTaskIds = tasks.nextIds;

    dispatchCreated(
      api.dispatch,
      customers.addedIds,
      state.customers?.entities ?? {},
      'customer',
      'name'
    );
    dispatchCreated(
      api.dispatch,
      leads.addedIds,
      state.leads?.entities ?? {},
      'lead',
      'name'
    );
    dispatchCreated(
      api.dispatch,
      tasks.addedIds,
      state.tasks?.entities ?? {},
      'task',
      'title'
    );
  });
}
