import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assignedEmployeeId: z.string().min(1, 'Employee assignment is required'),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['Todo', 'In Progress', 'Completed']),
  relatedCustomerId: z.string().optional(),
});

export type TaskForm = z.infer<typeof taskSchema>;
