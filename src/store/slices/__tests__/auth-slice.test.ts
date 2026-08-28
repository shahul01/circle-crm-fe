import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  logout,
  clearAuthError,
  selectIsAuthenticated,
  selectUser,
  selectIsAdmin,
  selectAuthError,
  selectAuthLoading,
} from '../auth-slice';

const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer },
  });

describe('authSlice login thunk', () => {
  it('logs in a valid admin user', async () => {
    const store = makeStore();
    await store.dispatch(
      login({ email: 'admin@circlecrm.com', password: 'Admin@123' })
    );
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('admin@circlecrm.com');
    expect(state.user?.role).toBe('admin');
    expect(state.user).not.toHaveProperty('password');
    expect(state.error).toBeNull();
  });

  it('logs in a valid sales user', async () => {
    const store = makeStore();
    await store.dispatch(
      login({ email: 'sales@circlecrm.com', password: 'Sales@123' })
    );
    expect(store.getState().auth.user?.role).toBe('sales');
  });

  it('rejects invalid credentials and sets an error', async () => {
    const store = makeStore();
    await store.dispatch(
      login({ email: 'admin@circlecrm.com', password: 'Wrong@123' })
    );
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Invalid email or password');
  });

  it('rejects an unknown email', async () => {
    const store = makeStore();
    await store.dispatch(
      login({ email: 'nobody@example.com', password: 'Admin@123' })
    );
    expect(store.getState().auth.error).toBe('Invalid email or password');
  });
});

describe('authSlice reducers', () => {
  it('logs out and clears auth state', () => {
    const store = makeStore();
    store.dispatch({
      type: 'auth/login/fulfilled',
      payload: { id: 'u-1', name: 'A', email: 'a@b.com', role: 'admin' },
    });
    store.dispatch(logout());
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('clears the auth error', () => {
    const store = makeStore();
    store.dispatch({
      type: 'auth/login/rejected',
      payload: 'Invalid email or password',
    });
    store.dispatch(clearAuthError());
    expect(store.getState().auth.error).toBeNull();
  });
});

describe('authSlice selectors', () => {
  it('selects admin authentication state', () => {
    const store = makeStore();
    store.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        id: 'u-1',
        name: 'Admin',
        email: 'admin@circlecrm.com',
        role: 'admin',
      },
    });
    const state = store.getState();
    expect(selectIsAuthenticated(state)).toBe(true);
    expect(selectUser(state)?.email).toBe('admin@circlecrm.com');
    expect(selectIsAdmin(state)).toBe(true);
  });

  it('returns false for admin role when user is sales', async () => {
    const store = makeStore();
    await store.dispatch(
      login({ email: 'sales@circlecrm.com', password: 'Sales@123' })
    );
    expect(selectIsAdmin(store.getState())).toBe(false);
  });

  it('selects loading and error', () => {
    const store = makeStore();
    store.dispatch({ type: 'auth/login/pending' });
    expect(selectAuthLoading(store.getState())).toBe(true);
    store.dispatch({ type: 'auth/login/rejected', payload: 'boom' });
    expect(selectAuthError(store.getState())).toBe('boom');
  });
});
