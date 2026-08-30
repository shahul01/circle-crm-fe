import { test, expect } from './fixtures/base';
import { CUSTOMER_COUNT } from '../src/services/seed';

test.describe('Authentication', () => {
  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('.text-destructive').first()).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@circlecrm.com').fill('wrong@email.com');
    await page.getByPlaceholder('Password').fill('WrongPass');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('should login as admin and load seed data', async ({
    loginAsAdmin,
    page,
  }) => {
    await loginAsAdmin();
    await expect(
      page.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible();
    await expect(page.getByText(String(CUSTOMER_COUNT)).first()).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});
