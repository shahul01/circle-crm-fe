import { describe, it, expect } from 'vitest';
import leadReducer, {
  addLead,
  updateLead,
  removeLead,
  markLeadConverted,
  setLeadSearch,
  setLeadStatusFilter,
  setLeadSort,
  setLeadPage,
  toggleLeadSelection,
  selectFilteredLeads,
  selectConvertedLeads,
  selectTotalLeads,
  type LeadState,
} from '../lead-slice';
import type { Lead } from '@/types';

const makeLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: `l-${Math.random().toString(36).slice(2, 8)}`,
  name: 'Meridian Corp',
  email: 'sales@meridian.com',
  phone: '(555) 678-9012',
  company: 'Meridian Corp',
  status: 'New',
  assignedEmployeeId: 'emp-1',
  createdAt: '2025-06-01T08:00:00Z',
  ...overrides,
});

const makeState = (leads: Lead[]): LeadState => ({
  entities: Object.fromEntries(leads.map((l) => [l.id, l])),
  ids: leads.map((l) => l.id),
  ui: {
    search: '',
    statusFilter: 'All',
    sortField: 'createdAt',
    sortDir: 'desc',
    page: 1,
    perPage: 10,
    selectedIds: [] as string[],
  },
});

describe('leadSlice CRUD', () => {
  it('adds a lead', () => {
    const lead = makeLead({ id: 'l1' });
    const state = leadReducer(makeState([]), addLead(lead));
    expect(state.ids).toEqual(['l1']);
    expect(selectTotalLeads({ leads: state })).toBe(1);
  });

  it('updates and changes lead status', () => {
    const lead = makeLead({ id: 'l1', status: 'New' });
    let state = leadReducer(makeState([]), addLead(lead));
    state = leadReducer(
      state,
      updateLead({ id: 'l1', changes: { status: 'Contacted' } })
    );
    expect(state.entities.l1.status).toBe('Contacted');
  });

  it('deletes a lead', () => {
    const leads = [makeLead({ id: 'l1' }), makeLead({ id: 'l2' })];
    const state = leadReducer(makeState(leads), removeLead('l1'));
    expect(state.ids).toEqual(['l2']);
  });
});

describe('leadSlice conversion', () => {
  it('marks a lead as Converted', () => {
    const lead = makeLead({ id: 'l1', status: 'Qualified' });
    let state = leadReducer(makeState([lead]), markLeadConverted('l1'));
    expect(state.entities.l1.status).toBe('Converted');
    expect(selectConvertedLeads({ leads: state })).toBe(1);
  });

  it('does nothing when converting an unknown lead', () => {
    const state = leadReducer(makeState([]), markLeadConverted('missing'));
    expect(state.ids).toEqual([]);
  });

  it('counts converted leads only', () => {
    const leads = [
      makeLead({ id: 'l1', status: 'Converted' }),
      makeLead({ id: 'l2', status: 'New' }),
      makeLead({ id: 'l3', status: 'Converted' }),
    ];
    const state = makeState(leads);
    expect(selectConvertedLeads({ leads: state })).toBe(2);
  });
});

describe('leadSlice search/filter/sort/pagination', () => {
  const leads = [
    makeLead({
      id: 'l1',
      name: 'Alpha',
      status: 'New',
      createdAt: '2025-03-01T00:00:00Z',
      company: 'One',
    }),
    makeLead({
      id: 'l2',
      name: 'Beta',
      status: 'Contacted',
      createdAt: '2025-01-01T00:00:00Z',
      company: 'Two',
    }),
    makeLead({
      id: 'l3',
      name: 'Gamma',
      status: 'Qualified',
      createdAt: '2025-02-01T00:00:00Z',
      company: 'Three',
    }),
  ];
  const base = makeState(leads);

  it('filters by search and status', () => {
    let state = leadReducer(base, setLeadStatusFilter('Contacted'));
    let result = selectFilteredLeads({ leads: state });
    expect(result.map((l) => l.id)).toEqual(['l2']);

    state = leadReducer(base, setLeadSearch('gamma'));
    result = selectFilteredLeads({ leads: state });
    expect(result.map((l) => l.id)).toEqual(['l3']);
  });

  it('sorts leads by status ascending', () => {
    const state = leadReducer(
      base,
      setLeadSort({ field: 'status', dir: 'asc' })
    );
    const result = selectFilteredLeads({ leads: state });
    expect(result.map((l) => l.status)).toEqual([
      'Contacted',
      'New',
      'Qualified',
    ]);
  });

  it('resets page on search', () => {
    let state = leadReducer(base, setLeadPage(3));
    state = leadReducer(state, setLeadSearch('x'));
    expect(state.ui.page).toBe(1);
  });
});

describe('leadSlice bulk selection', () => {
  it('toggles selection', () => {
    let state = leadReducer(
      makeState([makeLead({ id: 'l1' })]),
      toggleLeadSelection('l1')
    );
    expect(state.ui.selectedIds).toEqual(['l1']);
    state = leadReducer(state, toggleLeadSelection('l1'));
    expect(state.ui.selectedIds).toEqual([]);
  });
});
