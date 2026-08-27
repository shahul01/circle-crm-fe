import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

interface NotificationState {
  items: Notification[];
}

const initialState: NotificationState = {
  items: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: {
      reducer(state, action: PayloadAction<Notification>) {
        state.items.push(action.payload);
      },
      prepare(
        title: string,
        description?: string,
        variant?: 'default' | 'success' | 'error'
      ) {
        return {
          payload: {
            id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title,
            description,
            variant,
          },
        };
      },
    },
    dismissNotification(state, action: PayloadAction<string>) {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      'notifications/@@HYDRATE',
      (_state, action) => (action as any).payload
    );
  },
});

export const { addNotification, dismissNotification, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;

export const selectNotifications = (state: {
  notifications: NotificationState;
}) => state.notifications.items;
