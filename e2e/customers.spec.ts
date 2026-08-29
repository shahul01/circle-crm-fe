import { test, expect } from './fixtures/base';

test.describe('Customer Management', () => {
  test('should display customer list with seed data', async ({
    seedAndLogin,
    page,
  }) => {
    await seedAndLogin();
    await page.goto('/customers');
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Customers' })
    ).toBeVisible();
    await expect(page.getByText('15 customers total')).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount(10);
  });

  test('should search customers', async ({
    seedAndLogin,
    page,
    waitForPersisted,
  }) => {
    await seedAndLogin();
    await page.goto('/customers');
    await page.getByPlaceholder('Search customers...').fill('Iron Peak');
    await waitForPersisted((s) => s.customers.ui.search === 'Iron Peak');
    await page.reload();
    await expect(
      page.getByText('Iron Peak Construction').first()
    ).toBeVisible();
    await expect(page.getByText('TechStart Inc')).not.toBeVisible();
  });

  test('should filter customers by status', async ({
    seedAndLogin,
    page,
    waitForPersisted,
  }) => {
    await seedAndLogin();
    await page.goto('/customers');
    const trigger = page
      .locator('button')
      .filter({ hasText: 'All Statuses' })
      .first();
    await trigger.click();
    await page.getByRole('option', { name: 'Inactive' }).click();
    await waitForPersisted((s) => s.customers.ui.statusFilter === 'Inactive');
    await page.reload();
    await expect(page.getByText('4 customers total')).toBeVisible();
    await expect(page.getByText('BlueSky Logistics').first()).toBeVisible();
  });

  test('should add a new customer', async ({
    seedAndLogin,
    page,
    waitForPersisted,
  }) => {
    await seedAndLogin();
    await page.goto('/customers');
    await page.getByRole('button', { name: /add customer/i }).click();
    await expect(
      page.getByRole('heading', { name: 'Add Customer' })
    ).toBeVisible();

    await page.getByLabel('Name').fill('Test Corp');
    await page.getByLabel('Email').fill('test@testcorp.com');
    await page.getByLabel('Phone').fill('(555) 999-0000');
    await page.getByLabel('Company').fill('Test Corp');
    await page.getByLabel('Location').fill('Test City');

    await page.locator('#assignedEmployeeId').click();
    await page.getByRole('option', { name: /Sarah Johnson/ }).click();

    await page.getByRole('button', { name: /^add customer$/i }).click();
    await waitForPersisted((s) => s.customers.ids.length === 16);
    await page.reload();
    await expect(page.getByText('16 customers total')).toBeVisible();
    await expect(page.getByText('Test Corp').first()).toBeVisible();
  });

  test('should edit a customer', async ({
    seedAndLogin,
    page,
    waitForPersisted,
  }) => {
    await seedAndLogin();
    await page.goto('/customers');
    const editButtons = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-pencil') });
    await editButtons.first().click();
    await expect(
      page.getByRole('heading', { name: 'Edit Customer' })
    ).toBeVisible();
    await page.getByLabel('Name').fill('Iron Peak Updated');
    await page.getByRole('button', { name: /save changes/i }).click();
    await waitForPersisted((s) =>
      Object.values(s.customers.entities).some(
        (c) => c?.name === 'Iron Peak Updated'
      )
    );
    await page.reload();
    await expect(page.getByText('Iron Peak Updated').first()).toBeVisible();
  });

  test('should delete a customer', async ({
    seedAndLogin,
    page,
    waitForPersisted,
  }) => {
    await seedAndLogin();
    await page.goto('/customers');
    const deleteButtons = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-trash-2') });
    await deleteButtons.first().click();
    await expect(
      page.getByRole('heading', { name: 'Delete customer' })
    ).toBeVisible();
    await page.getByRole('button', { name: /^delete$/i }).click();
    await waitForPersisted((s) => s.customers.ids.length === 14);
    await page.reload();
    await expect(page.getByText('14 customers total')).toBeVisible();
  });

  test('should view customer detail page', async ({ seedAndLogin, page }) => {
    await seedAndLogin();
    await page.goto('/customers/cust-1');
    await page.reload();
    await expect(page.getByText('info@acme.com')).toBeVisible();
    await expect(page.getByText('(555) 123-4567')).toBeVisible();
    await expect(page.getByRole('tab', { name: /info/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /notes/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /tasks/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /activity/i })).toBeVisible();
  });
});
