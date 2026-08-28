import { test, expect } from './fixtures/base';

test.describe('Dashboard', () => {
  test('should display stat cards with correct counts', async ({
    seedAndLogin,
    page,
  }) => {
    await seedAndLogin();
    await page.goto('/');

    await expect(page.getByText('Total Customers').first()).toBeVisible();
    await expect(page.getByText('Total Leads').first()).toBeVisible();
    await expect(page.getByText('Converted Leads').first()).toBeVisible();
    await expect(page.getByText('Pending Tasks').first()).toBeVisible();
    await expect(page.getByText('Completed Tasks').first()).toBeVisible();
  });

  test('should display charts', async ({ seedAndLogin, page }) => {
    await seedAndLogin();
    await page.goto('/');

    await expect(page.getByText('Lead Pipeline')).toBeVisible();
    await expect(page.getByText('Task Status')).toBeVisible();
    await expect(page.getByText('Customer Growth')).toBeVisible();

    const svgs = page.locator('.recharts-surface');
    await expect(svgs.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show recent customers and activities', async ({
    seedAndLogin,
    page,
  }) => {
    await seedAndLogin();
    await page.goto('/');

    await expect(page.getByText('Recent Customers')).toBeVisible();
    await expect(page.getByText('Recent Activities')).toBeVisible();

    await expect(
      page.locator('text=Lighthouse Education').first()
    ).toBeVisible();
  });
});
