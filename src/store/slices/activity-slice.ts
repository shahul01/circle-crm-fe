import {
  createSlice,
  createEntityAdapter,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Activity } from '@/types';

interface ActivityState {
  entities: Record<string, Activity>;
  ids: string[];
}

const activityAdapter = createEntityAdapter<Activity>({
  sortComparer: (a, b) => b.timestamp.localeCompare(a.timestamp),
});

const initialState: ActivityState = {
  entities: {},
  ids: [],
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    logActivity: {
      reducer(state, action: PayloadAction<Activity>) {
        activityAdapter.addOne(state, action.payload);
      },
      prepare(params: Omit<Activity, 'id' | 'timestamp'>) {
        return {
          payload: {
            id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            ...params,
            timestamp: new Date().toISOString(),
          },
        };
      },
    },
    clearActivities(state) {
      activityAdapter.removeAll(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      'activity/@@HYDRATE',
      (_state, action) => (action as any).payload
    );
  },
});

export const { logActivity, clearActivities } = activitySlice.actions;
export default activitySlice.reducer;

// Selectors
const selectActivityState = (state: { activity: ActivityState }) =>
  state.activity;
const adapterSelectors = activityAdapter.getSelectors(selectActivityState);
export const selectAllActivities = adapterSelectors.selectAll;
export const selectRecentActivities =
  (limit: number) => (state: { activity: ActivityState }) => {
    return selectAllActivities(state).slice(0, limit);
  };
export const selectActivitiesByEntity =
  (entityId: string) => (state: { activity: ActivityState }) => {
    return selectAllActivities(state).filter((a) => a.entityId === entityId);
  };
