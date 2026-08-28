import { z } from 'zod';
import type { LeadStatus } from '@/types';

export const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  'New',
  'Contacted',
  'Follow-up',
  'Qualified',
  'Converted',
  'Lost',
];

export const leadSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  email: z.email('Invalid email address'),
  phone: z.string().min(7, 'Phone is required'),
  company: z.string().min(3, 'Company is required'),
  status: z.enum(LEAD_STATUS_OPTIONS),
  assignedEmployeeId: z.string().min(3, 'Employee assignment is required'),
});

export type LeadForm = z.infer<typeof leadSchema>;
