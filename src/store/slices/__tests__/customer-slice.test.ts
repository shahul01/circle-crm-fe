import { describe, it, expect } from 'vitest';
import customerReducer, {
  addCustomer,
  addManyCustomers,
  updateCustomer,
  removeCustomer,
  removeManyCustomers,
  setCustomerSearch,
  setCustomerStatusFilter,
  setCustomerSort,
  setCustomerPage,
  setCustomerPerPage,
  toggleCustomerSelection,
  toggleSelectAllCustomers,
  clearCustomerSelection,
  selectAllCustomers,
  selectFilteredCustomers,
  selectPaginatedCustomers,
  selectTotalCustomers,
  selectCustomerById,
  type CustomerState,
} from '../customer-slice';
import type { Customer } from '@/types';

const makeCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  id: `c-${Math.random().toString(36).slice(2, 8)}`,
  name: 'Acme Corp',
  email: 'info@acme.com',
  phone: '(555) 000-0000',
  company: 'Acme Corp',
  location: 'New York, NY',
  status: 'Active',
  assignedEmployeeId: 'emp-1',
  createdAt: '2025-01-01T00:00:00Z',
  notes: [],
  ...overrides,
});

const makeState = (customers: Customer[]): CustomerState => ({
  entities: Object.fromEntries(customers.map((c) => [c.id, c])),
  ids: customers.map((c) => c.id),
  ui: {
    search: '',
    statusFilter: 'All',
    sortField: 'createdAt',
    sortDir: 'desc',
    page: 1,
    perPage: 10,
    selectedIds: [],
  },
});

describe('customerSlice CRUD', () => {
  it('adds a customer', () => {
    const customer = makeCustomer({ id: 'c1', name: 'Alpha' });
    const state = customerReducer(makeState([]), addCustomer(customer));
    expect(state.ids).toEqual(['c1']);
    expect(state.entities.c1.name).toBe('Alpha');
    expect(selectTotalCustomers({ customers: state })).toBe(1);
  });

  it('adds many customers', () => {
    const customers = [makeCustomer({ id: 'c1' }), makeCustomer({ id: 'c2' })];
    const state = customerReducer(makeState([]), addManyCustomers(customers));
    expect(selectAllCustomers({ customers: state })).toHaveLength(2);
  });

  it('updates a customer without duplicating', () => {
    const customer = makeCustomer({ id: 'c1', name: 'Old' });
    let state = customerReducer(makeState([]), addCustomer(customer));
    state = customerReducer(
      state,
      updateCustomer({ id: 'c1', changes: { name: 'New', status: 'Inactive' } })
    );
    expect(state.ids).toHaveLength(1);
    expect(state.entities.c1.name).toBe('New');
    expect(state.entities.c1.status).toBe('Inactive');
  });

  it('deletes a customer', () => {
    const customers = [makeCustomer({ id: 'c1' }), makeCustomer({ id: 'c2' })];
    const state = customerReducer(makeState(customers), removeCustomer('c1'));
    expect(state.ids).toEqual(['c2']);
  });

  it('bulk deletes customers', () => {
    const customers = [
      makeCustomer({ id: 'c1' }),
      makeCustomer({ id: 'c2' }),
      makeCustomer({ id: 'c3' }),
    ];
    const state = customerReducer(
      makeState(customers),
      removeManyCustomers(['c1', 'c3'])
    );
    expect(state.ids).toEqual(['c2']);
  });
});

describe('customerSlice search/filter/sort/pagination', () => {
  const customers = [
    makeCustomer({
      id: 'c1',
      name: 'Alpha LLC',
      status: 'Active',
      createdAt: '2025-03-01T00:00:00Z',
      company: 'One',
    }),
    makeCustomer({
      id: 'c2',
      name: 'Beta Inc',
      status: 'Inactive',
      createdAt: '2025-01-01T00:00:00Z',
      company: 'Two',
    }),
    makeCustomer({
      id: 'c3',
      name: 'Gamma Ltd',
      status: 'Active',
      createdAt: '2025-02-01T00:00:00Z',
      company: 'Three',
    }),
  ];
  const base = makeState(customers);

  it('filters customers by search text (case-insensitive)', () => {
    const state = customerReducer(base, setCustomerSearch('beta'));
    const result = selectFilteredCustomers({ customers: state });
    expect(result.map((c) => c.id)).toEqual(['c2']);
  });

  it('resets page to 1 when a search is set', () => {
    let state = customerReducer(base, setCustomerPage(3));
    state = customerReducer(state, setCustomerSearch('x'));
    expect(state.ui.page).toBe(1);
  });

  it('filters customers by status', () => {
    const state = customerReducer(base, setCustomerStatusFilter('Inactive'));
    const result = selectFilteredCustomers({ customers: state });
    expect(result.map((c) => c.id)).toEqual(['c2']);
    expect(state.ui.page).toBe(1);
  });

  it('sorts customers by name ascending', () => {
    const state = customerReducer(
      base,
      setCustomerSort({ field: 'name', dir: 'asc' })
    );
    const result = selectFilteredCustomers({ customers: state });
    expect(result.map((c) => c.name)).toEqual([
      'Alpha LLC',
      'Beta Inc',
      'Gamma Ltd',
    ]);
  });

  it('sorts customers by name descending', () => {
    const state = customerReducer(
      base,
      setCustomerSort({ field: 'name', dir: 'desc' })
    );
    const result = selectFilteredCustomers({ customers: state });
    expect(result.map((c) => c.name)).toEqual([
      'Gamma Ltd',
      'Beta Inc',
      'Alpha LLC',
    ]);
  });

  it('paginates customers', () => {
    let state = customerReducer(base, setCustomerPerPage(1));
    let page = selectPaginatedCustomers({ customers: state });
    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(3);
    expect(page.totalPages).toBe(3);

    state = customerReducer(state, setCustomerPage(2));
    page = selectPaginatedCustomers({ customers: state });
    expect(page.items).toHaveLength(1);
    expect(page.totalPages).toBe(3);
  });
});

describe('customerSlice bulk selection', () => {
  const customers = [
    makeCustomer({ id: 'c1' }),
    makeCustomer({ id: 'c2' }),
    makeCustomer({ id: 'c3' }),
  ];
  const base = makeState(customers);

  it('toggles an individual selection', () => {
    let state = customerReducer(base, toggleCustomerSelection('c1'));
    expect(state.ui.selectedIds).toEqual(['c1']);
    state = customerReducer(state, toggleCustomerSelection('c1'));
    expect(state.ui.selectedIds).toEqual([]);
  });

  it('selects all then clears all', () => {
    let state = customerReducer(base, toggleSelectAllCustomers());
    expect(state.ui.selectedIds).toHaveLength(3);
    state = customerReducer(state, toggleSelectAllCustomers());
    expect(state.ui.selectedIds).toEqual([]);
  });

  it('clears selection', () => {
    let state = customerReducer(base, toggleSelectAllCustomers());
    state = customerReducer(state, clearCustomerSelection());
    expect(state.ui.selectedIds).toEqual([]);
  });
});

describe('customerSlice selectors', () => {
  it('selects a customer by id', () => {
    const state = makeState([makeCustomer({ id: 'c1' })]);
    expect(selectCustomerById({ customers: state }, 'c1')?.id).toBe('c1');
    expect(selectCustomerById({ customers: state }, 'nope')).toBeUndefined();
  });

  it('counts total customers', () => {
    const state = makeState([
      makeCustomer({ id: 'c1' }),
      makeCustomer({ id: 'c2' }),
    ]);
    expect(selectTotalCustomers({ customers: state })).toBe(2);
  });
});
