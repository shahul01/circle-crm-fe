import type { Customer, Lead } from '@/types';

/** Case-insensitive lookup of an existing customer by email. */
export function findCustomerByEmail(
  customers: Customer[],
  email: string
): Customer | undefined {
  const needle = email.trim().toLowerCase();
  if (!needle) return undefined;
  return customers.find((c) => c.email.trim().toLowerCase() === needle);
}

/** Builds a new customer record from a lead (unique id, no side effects). */
export function buildCustomerFromLead(lead: Lead, location: string): Customer {
  return {
    id: `cust-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    location,
    status: 'Active',
    assignedEmployeeId: lead.assignedEmployeeId,
    createdAt: new Date().toISOString(),
    notes: [],
  };
}
