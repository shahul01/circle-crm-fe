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

  test('changing a lead status to Contacted must not create a customer', async ({
    seedAndLogin,
    page,
    waitForPersisted,
  }) => {
    await seedAndLogin();
    await page.goto('/leads');

    const customerCount = () =>
      page.evaluate(() => {
        const raw = localStorage.getItem('circle_crm_state_v1');
        const state = raw ? JSON.parse(raw) : null;
        return state ? (state.customers?.ids ?? []).length : 0;
      });

    const before = await customerCount();

    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('td').last().locator('button').first().click();
    await expect(
      page.getByRole('heading', { name: 'Edit Lead' })
    ).toBeVisible();

    await page.locator('#status').click();
    await page
      .getByRole('option', { name: 'Contacted', exact: true })
      .first()
      .click();
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(
      page.getByRole('heading', { name: 'Edit Lead' })
    ).not.toBeVisible();
    await waitForPersisted((s) => s.customers.ids.length === before);

    await page.reload();
    expect(await customerCount()).toBe(before);
  });

  test('converting the same lead twice does not duplicate the customer', async ({
    seedAndLogin,
    page,
    waitForPersisted,
  }) => {
    await seedAndLogin();
    await page.goto('/leads');

    const customerCount = () =>
      page.evaluate(() => {
        const raw = localStorage.getItem('circle_crm_state_v1');
        const state = raw ? JSON.parse(raw) : null;
        return state ? (state.customers?.ids ?? []).length : 0;
      });

    const SEED_CUSTOMERS = 15;
    const leadRow = page.locator('table tbody tr').first();

    await leadRow.locator('td').last().locator('button').first().click();
    await expect(
      page.getByRole('heading', { name: 'Edit Lead' })
    ).toBeVisible();
    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Converted', exact: true }).click();
    await page.getByLabel('Location').fill('Austin, TX');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForURL('**/customers', { timeout: 5000 });
    await waitForPersisted(
      (s) => s.customers.ids.length === SEED_CUSTOMERS + 1
    );
    expect(await customerCount()).toBe(SEED_CUSTOMERS + 1);

    await page.goto('/leads');
    const revertedRow = page.locator('table tbody tr').first();
    await revertedRow.locator('td').last().locator('button').first().click();
    await expect(
      page.getByRole('heading', { name: 'Edit Lead' })
    ).toBeVisible();
    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Qualified', exact: true }).click();
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(
      page.getByRole('heading', { name: 'Edit Lead' })
    ).not.toBeVisible();
    await expect(
      revertedRow.locator('button[title="Convert to customer"]')
    ).toBeVisible();

    await revertedRow.locator('button[title="Convert to customer"]').click();
    await expect(
      page.getByRole('heading', { name: 'Convert lead to customer' })
    ).toBeVisible();
    await page.getByLabel('Location').fill('Austin, TX');
    await page.getByRole('button', { name: /convert/i }).click();
    await waitForPersisted(
      (s) => s.customers.ids.length === SEED_CUSTOMERS + 1
    );
    await page.waitForTimeout(500);
    expect(await customerCount()).toBe(SEED_CUSTOMERS + 1);
  });
});
