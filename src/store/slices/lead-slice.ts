import {
  createSlice,
  createEntityAdapter,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Lead, LeadStatus } from '@/types';

interface LeadUI {
  search: string;
  statusFilter: LeadStatus | 'All';
  sortField: keyof Pick<
    Lead,
    'name' | 'email' | 'company' | 'status' | 'createdAt'
  >;
  sortDir: 'asc' | 'desc';
  page: number;
  perPage: number;
  selectedIds: string[];
}

interface LeadState {
  entities: Record<string, Lead>;
  ids: string[];
  ui: LeadUI;
}

const leadAdapter = createEntityAdapter<Lead>({
  sortComparer: (a, b) => a.createdAt.localeCompare(b.createdAt),
});

const initialState: LeadState = {
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

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    addLead: leadAdapter.addOne,
    addManyLeads: leadAdapter.addMany,
    updateLead: leadAdapter.updateOne,
    removeLead: leadAdapter.removeOne,
    removeManyLeads: leadAdapter.removeMany,
    markLeadConverted(state, action: PayloadAction<string>) {
      const lead = state.entities[action.payload];
      if (lead) {
        lead.status = 'Converted';
      }
    },
    setLeadSearch(state, action: PayloadAction<string>) {
      state.ui.search = action.payload;
      state.ui.page = 1;
    },
    setLeadStatusFilter(state, action: PayloadAction<LeadStatus | 'All'>) {
      state.ui.statusFilter = action.payload;
      state.ui.page = 1;
    },
    setLeadSort(
      state,
      action: PayloadAction<{ field: LeadUI['sortField']; dir: 'asc' | 'desc' }>
    ) {
      state.ui.sortField = action.payload.field;
      state.ui.sortDir = action.payload.dir;
    },
    setLeadPage(state, action: PayloadAction<number>) {
      state.ui.page = action.payload;
    },
    toggleLeadSelection(state, action: PayloadAction<string>) {
      const idx = state.ui.selectedIds.indexOf(action.payload);
      if (idx === -1) {
        state.ui.selectedIds.push(action.payload);
      } else {
        state.ui.selectedIds.splice(idx, 1);
      }
    },
    toggleSelectAllLeads(state) {
      if (state.ui.selectedIds.length === state.ids.length) {
        state.ui.selectedIds = [];
      } else {
        state.ui.selectedIds = [...state.ids];
      }
    },
    clearLeadSelection(state) {
      state.ui.selectedIds = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      'leads/@@HYDRATE',
      (_state, action) => (action as any).payload
    );
  },
});

export const {
  addLead,
  addManyLeads,
  updateLead,
  removeLead,
  removeManyLeads,
  markLeadConverted,
  setLeadSearch,
  setLeadStatusFilter,
  setLeadSort,
  setLeadPage,
  toggleLeadSelection,
  toggleSelectAllLeads,
  clearLeadSelection,
} = leadSlice.actions;

export default leadSlice.reducer;

// Selectors
const selectLeadState = (state: { leads: LeadState }) => state.leads;
const adapterSelectors = leadAdapter.getSelectors(selectLeadState);
export const selectAllLeads = adapterSelectors.selectAll;
export const selectLeadById = adapterSelectors.selectById;
export const selectLeadSearch = (state: { leads: LeadState }) =>
  state.leads.ui.search;
export const selectLeadStatusFilter = (state: { leads: LeadState }) =>
  state.leads.ui.statusFilter;
export const selectLeadSort = (state: { leads: LeadState }) => ({
  field: state.leads.ui.sortField,
  dir: state.leads.ui.sortDir,
});
export const selectLeadPage = (state: { leads: LeadState }) =>
  state.leads.ui.page;

export const selectFilteredLeads = (state: { leads: LeadState }) => {
  const { entities, ids, ui } = state.leads;
  let filtered = ids.map((id) => entities[id]).filter(Boolean);

  if (ui.search) {
    const q = ui.search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q)
    );
  }

  if (ui.statusFilter !== 'All') {
    filtered = filtered.filter((l) => l.status === ui.statusFilter);
  }

  return [...filtered].sort((a, b) => {
    const aVal = a[ui.sortField] as string;
    const bVal = b[ui.sortField] as string;
    const cmp = aVal.localeCompare(bVal);
    return ui.sortDir === 'asc' ? cmp : -cmp;
  });
};

export const selectPaginatedLeads = (state: { leads: LeadState }) => {
  const filtered = selectFilteredLeads(state);
  const { page, perPage } = state.leads.ui;
  const start = (page - 1) * perPage;
  return {
    items: filtered.slice(start, start + perPage),
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / perPage) || 1,
  };
};

export const selectTotalLeads = (state: { leads: LeadState }) =>
  state.leads.ids.length;
export const selectConvertedLeads = (state: { leads: LeadState }) => {
  return Object.values(state.leads.entities).filter(
    (l) => l?.status === 'Converted'
  ).length;
};
