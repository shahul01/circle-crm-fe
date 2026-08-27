import { logActivity } from './slices/activity-slice';

let prevCustomerIds: string[] = [];
let prevLeadIds: string[] = [];
let prevTaskIds: string[] = [];

function trackCreates(
  dispatch: (action: any) => any,
  prevIds: string[],
  currentIds: string[],
  entities: Record<string, any>,
  entityType: 'customer' | 'lead' | 'task',
  nameField: string
): string[] {
  const added = currentIds.filter((id) => !prevIds.includes(id));
  for (const id of added) {
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
  return [...currentIds];
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

    if (
      JSON.stringify(state.customers?.ids) !== JSON.stringify(prevCustomerIds)
    ) {
      prevCustomerIds = trackCreates(
        api.dispatch,
        prevCustomerIds,
        state.customers.ids,
        state.customers.entities,
        'customer',
        'name'
      );
    }

    if (JSON.stringify(state.leads?.ids) !== JSON.stringify(prevLeadIds)) {
      prevLeadIds = trackCreates(
        api.dispatch,
        prevLeadIds,
        state.leads.ids,
        state.leads.entities,
        'lead',
        'name'
      );
    }

    if (JSON.stringify(state.tasks?.ids) !== JSON.stringify(prevTaskIds)) {
      prevTaskIds = trackCreates(
        api.dispatch,
        prevTaskIds,
        state.tasks.ids,
        state.tasks.entities,
        'task',
        'title'
      );
    }
  });
}
