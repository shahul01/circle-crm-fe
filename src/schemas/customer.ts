import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  status: z.enum(['Active', 'Inactive']),
  assignedEmployeeId: z.string().min(1, 'Employee assignment is required'),
});

export type CustomerForm = z.infer<typeof customerSchema>;
