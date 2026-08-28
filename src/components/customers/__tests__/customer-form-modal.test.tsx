import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CustomerFormModal } from '@/components/customers/customer-form-modal';
import customerReducer, {
  selectAllCustomers,
} from '@/store/slices/customer-slice';
import notificationReducer from '@/store/slices/notification-slice';
import type { Customer } from '@/types';

afterEach(cleanup);

const makeStore = () =>
  configureStore({
    reducer: {
      customers: customerReducer,
      notifications: notificationReducer,
    },
  });

function renderModal(
  store: ReturnType<typeof makeStore>,
  props: { open?: boolean; customer?: Customer | null } = {}
) {
  const user = userEvent.setup();
  const onOpenChange = (_open: boolean) => {};
  render(
    <Provider store={store}>
      <CustomerFormModal
        open={props.open ?? true}
        onOpenChange={onOpenChange}
        customer={props.customer ?? null}
      />
    </Provider>
  );
  return { store, user };
}

const fillAddForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Name'), 'Nova Industries');
  await user.type(screen.getByLabelText('Email'), 'hello@nova.io');
  await user.type(screen.getByLabelText('Phone'), '(555) 111-2222');
  await user.type(screen.getByLabelText('Company'), 'Nova Industries');
  await user.type(screen.getByLabelText('Location'), 'Austin, TX');
  await user.selectOptions(screen.getByLabelText('Assigned Employee'), 'emp-2');
};

describe('CustomerFormModal', () => {
  it('shows validation errors for required fields', async () => {
    const { store, user } = renderModal(makeStore());
    await user.click(screen.getByRole('button', { name: /add customer/i }));
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Phone is required')).toBeInTheDocument();
    expect(screen.getByText('Company is required')).toBeInTheDocument();
    expect(screen.getByText('Location is required')).toBeInTheDocument();
    expect(
      screen.getByText('Employee assignment is required')
    ).toBeInTheDocument();
    expect(
      selectAllCustomers({ customers: store.getState().customers })
    ).toHaveLength(0);
  });

  it('adds a customer with valid data', async () => {
    const { store, user } = renderModal(makeStore());
    await fillAddForm(user);
    await user.click(screen.getByRole('button', { name: /add customer/i }));
    const customers = selectAllCustomers({
      customers: store.getState().customers,
    });
    expect(customers).toHaveLength(1);
    expect(customers[0].name).toBe('Nova Industries');
    expect(customers[0].assignedEmployeeId).toBe('emp-2');
    expect(customers[0].status).toBe('Active');
  });

  it('pre-fills and updates a customer when editing', async () => {
    const customer: Customer = {
      id: 'cust-edit',
      name: 'Existing Co',
      email: 'old@existing.com',
      phone: '(555) 000-1111',
      company: 'Existing Co',
      location: 'Boston, MA',
      status: 'Active',
      assignedEmployeeId: 'emp-3',
      createdAt: '2025-01-01T00:00:00Z',
      notes: [],
    };
    const store = makeStore();
    store.dispatch({
      type: 'customers/@@HYDRATE',
      payload: {
        entities: { [customer.id]: customer },
        ids: [customer.id],
        ui: {
          search: '',
          statusFilter: 'All',
          sortField: 'createdAt',
          sortDir: 'desc',
          page: 1,
          perPage: 10,
          selectedIds: [],
        },
      },
    });
    const { user } = renderModal(store, { customer });
    expect(screen.getByLabelText('Name')).toHaveValue('Existing Co');
    expect(screen.getByLabelText('Email')).toHaveValue('old@existing.com');

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Renamed Co');
    await user.selectOptions(screen.getByLabelText('Status'), 'Inactive');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    const customers = selectAllCustomers({
      customers: store.getState().customers,
    });
    expect(customers).toHaveLength(1);
    expect(customers[0].id).toBe('cust-edit');
    expect(customers[0].name).toBe('Renamed Co');
    expect(customers[0].status).toBe('Inactive');
  });
});
