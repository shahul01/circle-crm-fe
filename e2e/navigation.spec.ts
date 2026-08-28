import { test, expect } from './fixtures/base';

test.describe('Navigation & Theme', () => {
  test('should navigate between all routes', async ({ seedAndLogin, page }) => {
    await seedAndLogin();
    await page.goto('/');

    await page.getByRole('link', { name: /customers/i }).click();
    await page.waitForURL('/customers');
    await expect(
      page.getByRole('heading', { name: 'Customers' })
    ).toBeVisible();

    await page.getByRole('link', { name: /leads/i }).click();
    await page.waitForURL('/leads');
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible();

    await page.getByRole('link', { name: /tasks/i }).click();
    await page.waitForURL('/tasks');
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();

    await page.getByRole('link', { name: /dashboard/i }).click();
    await page.waitForURL('/');
    await expect(
      page.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible();
  });

  test('should toggle dark mode', async ({ seedAndLogin, page }) => {
    await seedAndLogin();
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);

    const themeBtn = page.locator('header button').last();
    await themeBtn.click();
    await page.waitForTimeout(300);

    await expect(html).toHaveClass(/dark/);

    await themeBtn.click();
    await page.waitForTimeout(300);
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should logout', async ({ seedAndLogin, page }) => {
    await seedAndLogin();
    await page.goto('/');

    const logoutBtn = page
      .locator('aside button')
      .filter({ has: page.locator('svg.lucide-log-out') });
    await logoutBtn.click();

    await expect(page.getByRole('heading', { name: 'Sign out' })).toBeVisible();
    await page.getByRole('button', { name: /sign out/i }).click();

    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});
