import { describe, it, expect } from 'vitest';
import {
  findCustomerByEmail,
  buildCustomerFromLead,
} from '@/services/lead-conversion';
import type { Customer, Lead } from '@/types';

const customer: Customer = {
  id: 'cust-1',
  name: 'Acme Corporation',
  email: '  Sales@Acme.Com  ',
  phone: '(555) 123-4567',
  company: 'Acme Corporation',
  location: 'New York, NY',
  status: 'Active',
  assignedEmployeeId: 'emp-1',
  createdAt: '2025-01-15T08:00:00Z',
  notes: [],
};

const lead: Lead = {
  id: 'lead-1',
  name: 'Meridian Corp',
  email: 'sales@acme.com',
  phone: '(555) 678-9012',
  company: 'Meridian Corp',
  status: 'Qualified',
  assignedEmployeeId: 'emp-1',
  createdAt: '2025-06-01T08:00:00Z',
};

describe('findCustomerByEmail', () => {
  it('finds an existing customer ignoring case and whitespace', () => {
    expect(findCustomerByEmail([customer], 'Sales@Acme.Com')).toBe(customer);
    expect(findCustomerByEmail([customer], '  sales@acme.com  ')).toBe(
      customer
    );
  });

  it('returns undefined when no customer matches', () => {
    expect(
      findCustomerByEmail([customer], 'nobody@nowhere.com')
    ).toBeUndefined();
  });

  it('returns undefined for an empty email', () => {
    expect(findCustomerByEmail([customer], '')).toBeUndefined();
    expect(findCustomerByEmail([customer], '   ')).toBeUndefined();
  });
});

describe('buildCustomerFromLead', () => {
  it('maps lead fields into an Active customer record', () => {
    const created = buildCustomerFromLead(lead, 'Austin, TX');
    expect(created).toMatchObject({
      name: lead.name,
      email: 'sales@acme.com',
      phone: lead.phone,
      company: lead.company,
      location: 'Austin, TX',
      status: 'Active',
      assignedEmployeeId: lead.assignedEmployeeId,
      notes: [],
    });
    expect(created.createdAt).toBeTruthy();
  });

  it('generates a unique customer id per conversion', () => {
    const a = buildCustomerFromLead(lead, 'Austin, TX');
    const b = buildCustomerFromLead(lead, 'Dallas, TX');
    expect(a.id).not.toBe(b.id);
    expect(a.id).toMatch(/^cust-/);
  });
});
