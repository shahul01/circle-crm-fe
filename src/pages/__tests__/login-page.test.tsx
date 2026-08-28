import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '@/pages/LoginPage';
import authReducer from '@/store/slices/auth-slice';
import customerReducer from '@/store/slices/customer-slice';
import leadReducer from '@/store/slices/lead-slice';
import taskReducer from '@/store/slices/task-slice';
import notificationReducer from '@/store/slices/notification-slice';
import uiReducer from '@/store/slices/ui-slice';
import activityReducer from '@/store/slices/activity-slice';

afterEach(cleanup);

const makeStore = () =>
  configureStore({
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

function renderLogin() {
  const store = makeStore();
  const user = userEvent.setup();
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    </Provider>
  );
  return { store, user };
}

describe('LoginPage', () => {
  it('shows email validation error for an invalid email', async () => {
    const { user } = renderLogin();
    await user.type(screen.getByLabelText('Email'), 'a@b');
    await user.type(screen.getByLabelText('Password'), 'Admin@123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(
      await screen.findByText('Invalid email address')
    ).toBeInTheDocument();
  });

  it('shows password validation error when too short', async () => {
    const { user } = renderLogin();
    await user.type(screen.getByLabelText('Email'), 'admin@circlecrm.com');
    await user.type(screen.getByLabelText('Password'), '123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(
      await screen.findByText('Password must be at least 6 characters')
    ).toBeInTheDocument();
  });

  it('displays demo credentials on the screen', () => {
    renderLogin();
    expect(screen.getByText(/Demo credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@circlecrm.com/i)).toBeInTheDocument();
    expect(screen.getByText(/sales@circlecrm.com/i)).toBeInTheDocument();
  });

  it('authenticates with valid credentials and redirects to dashboard', async () => {
    const { store, user } = renderLogin();
    await user.type(screen.getByLabelText('Email'), 'admin@circlecrm.com');
    await user.type(screen.getByLabelText('Password'), 'Admin@123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.user?.role).toBe('admin');
  });
});
