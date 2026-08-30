import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvertLeadDialog } from '@/components/leads/convert-lead-dialog';
import type { Lead } from '@/types';

afterEach(cleanup);

const lead: Lead = {
  id: 'l1',
  name: 'Meridian Corp',
  email: 'sales@meridian.com',
  phone: '(555) 678-9012',
  company: 'Meridian Corp',
  status: 'Qualified',
  assignedEmployeeId: 'emp-1',
  createdAt: '2025-06-01T08:00:00Z',
};

function renderDialog(onConvert = (_lead: Lead, _location: string) => {}) {
  const user = userEvent.setup();
  render(
    <ConvertLeadDialog
      lead={lead}
      onOpenChange={() => {}}
      onConvert={onConvert}
    />
  );
  return { user };
}

describe('ConvertLeadDialog', () => {
  it('shows a validation error when converting without a location', async () => {
    const { user } = renderDialog();
    await user.click(screen.getByRole('button', { name: /convert/i }));
    expect(
      screen.getByText('Location is required (min 3 characters)')
    ).toBeInTheDocument();
  });

  it('calls onConvert with the entered location', async () => {
    const onConvert = vi.fn();
    const { user } = renderDialog(onConvert);
    await user.type(screen.getByLabelText('Location'), 'Austin, TX');
    await user.click(screen.getByRole('button', { name: /convert/i }));
    expect(onConvert).toHaveBeenCalledWith(lead, 'Austin, TX');
  });
});
