import type { Customer, Lead } from '@/types';
import { EMPLOYEES } from './employees';

const CSV_HEADERS = [
  'Name',
  'Email',
  'Phone',
  'Company',
  'Location',
  'Status',
  'Assigned Employee',
  'Created Date',
];

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportCustomersToCsv(customers: Customer[]): void {
  const employeeMap = new Map(EMPLOYEES.map((e) => [e.id, e.name]));

  const rows = customers.map((c) => [
    escapeCsv(c.name),
    escapeCsv(c.email),
    escapeCsv(c.phone),
    escapeCsv(c.company),
    escapeCsv(c.location),
    escapeCsv(c.status),
    escapeCsv(employeeMap.get(c.assignedEmployeeId) ?? 'Unassigned'),
    escapeCsv(new Date(c.createdAt).toLocaleDateString()),
  ]);

  const csv = [CSV_HEADERS.join(','), ...rows.map((r) => r.join(','))].join(
    '\n'
  );

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const LEAD_CSV_HEADERS = [
  'Name',
  'Email',
  'Phone',
  'Company',
  'Status',
  'Assigned Employee',
  'Created Date',
];

export function exportLeadsToCsv(leads: Lead[]): void {
  const employeeMap = new Map(EMPLOYEES.map((e) => [e.id, e.name]));

  const rows = leads.map((l) => [
    escapeCsv(l.name),
    escapeCsv(l.email),
    escapeCsv(l.phone),
    escapeCsv(l.company),
    escapeCsv(l.status),
    escapeCsv(employeeMap.get(l.assignedEmployeeId) ?? 'Unassigned'),
    escapeCsv(new Date(l.createdAt).toLocaleDateString()),
  ]);

  const csv = [
    LEAD_CSV_HEADERS.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
