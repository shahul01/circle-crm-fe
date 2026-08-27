import {
  createSlice,
  createEntityAdapter,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Customer, CustomerStatus } from '@/types';

interface CustomerUI {
  search: string;
  statusFilter: CustomerStatus | 'All';
  sortField: keyof Pick<
    Customer,
    'name' | 'email' | 'company' | 'status' | 'createdAt'
  >;
  sortDir: 'asc' | 'desc';
  page: number;
  perPage: number;
  selectedIds: string[];
}

interface CustomerState {
  entities: Record<string, Customer>;
  ids: string[];
  ui: CustomerUI;
}

const customerAdapter = createEntityAdapter<Customer>({
  sortComparer: (a, b) => a.createdAt.localeCompare(b.createdAt),
});

const initialState: CustomerState = {
  entities: {},
  ids: [],
  ui: {
    search: '',
    statusFilter: 'All',
    sortField: 'createdAt',
    sortDir: 'desc',
    page: 1,
    perPage: 10,
    selectedIds: [],
  },
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    addCustomer: customerAdapter.addOne,
    addManyCustomers: customerAdapter.addMany,
    updateCustomer: customerAdapter.updateOne,
    removeCustomer: customerAdapter.removeOne,
    removeManyCustomers: customerAdapter.removeMany,
    setCustomerSearch(state, action: PayloadAction<string>) {
      state.ui.search = action.payload;
      state.ui.page = 1;
    },
    setCustomerStatusFilter(
      state,
      action: PayloadAction<CustomerStatus | 'All'>
    ) {
      state.ui.statusFilter = action.payload;
      state.ui.page = 1;
    },
    setCustomerSort(
      state,
      action: PayloadAction<{
        field: CustomerUI['sortField'];
        dir: 'asc' | 'desc';
      }>
    ) {
      state.ui.sortField = action.payload.field;
      state.ui.sortDir = action.payload.dir;
    },
    setCustomerPage(state, action: PayloadAction<number>) {
      state.ui.page = action.payload;
    },
    setCustomerPerPage(state, action: PayloadAction<number>) {
      state.ui.perPage = action.payload;
      state.ui.page = 1;
    },
    toggleCustomerSelection(state, action: PayloadAction<string>) {
      const idx = state.ui.selectedIds.indexOf(action.payload);
      if (idx === -1) {
        state.ui.selectedIds.push(action.payload);
      } else {
        state.ui.selectedIds.splice(idx, 1);
      }
    },
    toggleSelectAllCustomers(state) {
      if (state.ui.selectedIds.length === state.ids.length) {
        state.ui.selectedIds = [];
      } else {
        state.ui.selectedIds = [...state.ids];
      }
    },
    clearCustomerSelection(state) {
      state.ui.selectedIds = [];
    },
    addNoteToCustomer(
      state,
      action: PayloadAction<{ customerId: string; content: string }>
    ) {
      const customer = state.entities[action.payload.customerId];
      if (customer) {
        customer.notes.push({
          id: `note-${Date.now()}`,
          content: action.payload.content,
          createdAt: new Date().toISOString(),
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      'customers/@@HYDRATE',
      (_state, action) => (action as any).payload
    );
  },
});

export const {
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
  addNoteToCustomer,
} = customerSlice.actions;

export default customerSlice.reducer;

// Selectors
const selectCustomerState = (state: { customers: CustomerState }) =>
  state.customers;
const adapterSelectors = customerAdapter.getSelectors(selectCustomerState);
export const selectAllCustomers = adapterSelectors.selectAll;
export const selectCustomerById = adapterSelectors.selectById;
export const selectCustomerIds = adapterSelectors.selectIds;
export const selectCustomerSearch = (state: { customers: CustomerState }) =>
  state.customers.ui.search;
export const selectCustomerStatusFilter = (state: {
  customers: CustomerState;
}) => state.customers.ui.statusFilter;
export const selectCustomerSort = (state: { customers: CustomerState }) => ({
  field: state.customers.ui.sortField,
  dir: state.customers.ui.sortDir,
});
export const selectCustomerPage = (state: { customers: CustomerState }) =>
  state.customers.ui.page;
export const selectCustomerPerPage = (state: { customers: CustomerState }) =>
  state.customers.ui.perPage;
export const selectSelectedCustomerIds = (state: {
  customers: CustomerState;
}) => state.customers.ui.selectedIds;

// Derived selectors
export const selectFilteredCustomers = (state: {
  customers: CustomerState;
}) => {
  const { entities, ids, ui } = state.customers;
  let filtered = ids.map((id) => entities[id]).filter(Boolean);

  if (ui.search) {
    const q = ui.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
    );
  }

  if (ui.statusFilter !== 'All') {
    filtered = filtered.filter((c) => c.status === ui.statusFilter);
  }

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[ui.sortField] as string;
    const bVal = b[ui.sortField] as string;
    const cmp = aVal.localeCompare(bVal);
    return ui.sortDir === 'asc' ? cmp : -cmp;
  });

  return sorted;
};

export const selectPaginatedCustomers = (state: {
  customers: CustomerState;
}) => {
  const filtered = selectFilteredCustomers(state);
  const { page, perPage } = state.customers.ui;
  const start = (page - 1) * perPage;
  return {
    items: filtered.slice(start, start + perPage),
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / perPage) || 1,
  };
};

export const selectTotalCustomers = (state: { customers: CustomerState }) =>
  state.customers.ids.length;
