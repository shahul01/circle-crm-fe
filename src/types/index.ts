export type UserRole = 'admin' | 'sales';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type CustomerStatus = 'Active' | 'Inactive';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  status: CustomerStatus;
  assignedEmployeeId: string;
  createdAt: string;
  notes: Note[];
}

export type LeadStatus =
  'New' | 'Contacted' | 'Follow-up' | 'Qualified' | 'Converted' | 'Lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  assignedEmployeeId: string;
  createdAt: string;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedEmployeeId: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  relatedCustomerId?: string;
  createdAt: string;
  /** Column ordering for the kanban board. Absent on legacy/persisted tasks. */
  position?: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  entityType: 'customer' | 'lead' | 'task';
  entityName: string;
  entityId: string;
  action: string;
  timestamp: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
}
