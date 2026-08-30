import { test, expect } from './fixtures/base';

test.describe('Lead Management', () => {
  test('should display lead list with seed data', async ({
    seedAndLogin,
    page,
  }) => {
    await seedAndLogin();
    await page.goto('/leads');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible();
    await expect(page.getByText('15 leads total')).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount(10);
  });

  test('should search leads', async ({
    seedAndLogin,
    page,
    waitForPersisted,
  }) => {
    await seedAndLogin();
    await page.goto('/leads');
    await page.getByPlaceholder('Search leads...').fill('Meridian');
    await waitForPersisted((s) => s.leads.ui.search === 'Meridian');
    await page.reload();
    await expect(page.getByText('Meridian Corp').first()).toBeVisible();
    await expect(page.getByText('Vantage Point')).not.toBeVisible();
  });

  test('should filter leads by status', async ({
    seedAndLogin,
    page,
    waitForPersisted,
  }) => {
    await seedAndLogin();
    await page.goto('/leads');
    const trigger = page
      .locator('button')
      .filter({ hasText: 'All Statuses' })
      .first();
    await trigger.click();
    await page.getByRole('option', { name: 'New' }).click();
    await waitForPersisted((s) => s.leads.ui.statusFilter === 'New');
    await page.reload();
    await expect(page.getByText('4 leads total')).toBeVisible();
    await expect(page.getByText('Meridian Corp').first()).toBeVisible();
  });

  test('should add a new lead', async ({
    seedAndLogin,
    page,
    waitForPersisted,
  }) => {
    await seedAndLogin();
    await page.goto('/leads');
    await page.getByRole('button', { name: /add lead/i }).click();
    await expect(page.getByRole('heading', { name: 'Add Lead' })).toBeVisible();

    await page.getByLabel('Name').fill('New Test Lead');
    await page.getByLabel('Email').fill('new@lead.com');
    await page.getByLabel('Phone').fill('(555) 111-2222');
    await page.getByLabel('Company').fill('New Lead Co');

    await page.locator('#assignedEmployeeId').click();
    await page.getByRole('option', { name: /Sarah Johnson/ }).click();

    await page.getByRole('button', { name: /^add lead$/i }).click();
    await waitForPersisted((s) => s.leads.ids.length === 16);
    await page.reload();
    await expect(page.getByText('16 leads total')).toBeVisible();
    await expect(page.getByText('New Test Lead').first()).toBeVisible();
  });

  test('should convert lead to customer', async ({
    seedAndLogin,
    page,
    waitForPersisted,
  }) => {
    await seedAndLogin();
    await page.goto('/leads');
    const convertButtons = page.locator('button[title="Convert to customer"]');
    await convertButtons.first().click();
    await expect(
      page.getByRole('heading', { name: 'Convert lead to customer' })
    ).toBeVisible();
    await page.getByLabel('Location').fill('Austin, TX');
    await page.getByRole('button', { name: /convert/i }).click();
    await page.waitForURL('**/customers', { timeout: 5000 });
    await waitForPersisted(
      (s) =>
        s.customers.ids.length === 16 &&
        Object.values(s.customers.entities).some(
          (c) => c.location === 'Austin, TX'
        )
    );
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Customers' })
    ).toBeVisible();
    await expect(page.getByText('16 customers total')).toBeVisible();
  });
});
