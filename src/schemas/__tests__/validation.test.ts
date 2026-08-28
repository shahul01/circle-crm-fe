import { describe, it, expect } from 'vitest';
import { loginSchema } from '@/schemas/auth';
import { customerSchema } from '@/schemas/customer';
import { leadSchema } from '@/schemas/lead';
import { taskSchema } from '@/schemas/task';

describe('loginSchema validation', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@circlecrm.com',
      password: 'Admin@123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'Admin@123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid email address');
    }
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({
      email: 'admin@circlecrm.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Password must be at least 6 characters'
      );
    }
  });
});

describe('customerSchema validation', () => {
  const valid: Record<string, unknown> = {
    name: 'Acme Corp',
    email: 'info@acme.com',
    phone: '(555) 123-4567',
    company: 'Acme Corp',
    location: 'New York, NY',
    status: 'Active',
    assignedEmployeeId: 'emp-1',
  };

  it('accepts a valid customer', () => {
    expect(customerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a missing name', () => {
    const result = customerSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name is required');
    }
  });

  it('rejects an invalid email', () => {
    const result = customerSchema.safeParse({ ...valid, email: 'bad' });
    expect(result.success).toBe(false);
  });

  it('rejects an unassigned employee', () => {
    const result = customerSchema.safeParse({
      ...valid,
      assignedEmployeeId: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid status value', () => {
    const result = customerSchema.safeParse({ ...valid, status: 'Paused' });
    expect(result.success).toBe(false);
  });
});

describe('leadSchema validation', () => {
  const valid: Record<string, unknown> = {
    name: 'Meridian Corp',
    email: 'sales@meridian.com',
    phone: '(555) 678-9012',
    company: 'Meridian Corp',
    status: 'New',
    assignedEmployeeId: 'emp-1',
  };

  it('accepts all valid lead statuses', () => {
    for (const status of [
      'New',
      'Contacted',
      'Follow-up',
      'Qualified',
      'Converted',
      'Lost',
    ]) {
      expect(leadSchema.safeParse({ ...valid, status }).success).toBe(true);
    }
  });

  it('rejects an unknown lead status', () => {
    const result = leadSchema.safeParse({ ...valid, status: 'Won' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing company', () => {
    const result = leadSchema.safeParse({ ...valid, company: '' });
    expect(result.success).toBe(false);
  });
});

describe('taskSchema validation', () => {
  const valid: Record<string, unknown> = {
    title: 'Follow up',
    description: 'Send proposal',
    assignedEmployeeId: 'emp-1',
    priority: 'Medium',
    dueDate: '2025-07-01',
    status: 'Todo',
  };

  it('accepts a valid task', () => {
    expect(taskSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a missing title', () => {
    const result = taskSchema.safeParse({ ...valid, title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Title is required');
    }
  });

  it('rejects an invalid priority', () => {
    const result = taskSchema.safeParse({ ...valid, priority: 'Urgent' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid status', () => {
    const result = taskSchema.safeParse({ ...valid, status: 'Done' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing due date', () => {
    const result = taskSchema.safeParse({ ...valid, dueDate: '' });
    expect(result.success).toBe(false);
  });
});
