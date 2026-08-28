import { test, expect } from './fixtures/base';

test.describe('Task Management', () => {
  test('should display task list with seed data', async ({
    seedAndLogin,
    page,
  }) => {
    await seedAndLogin();
    await page.goto('/tasks');
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
    await expect(page.getByText('15 tasks total')).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount(10);
  });

  test('should search tasks', async ({ seedAndLogin, page }) => {
    await seedAndLogin();
    await page.goto('/tasks');
    await page.getByPlaceholder('Search tasks...').fill('Acme');
    await page.waitForTimeout(500);
    await expect(
      page.getByText('Follow up with Acme Corp').first()
    ).toBeVisible();
    await expect(page.getByText('Prepare onboarding deck')).not.toBeVisible();
  });

  test('should filter tasks by status', async ({ seedAndLogin, page }) => {
    await seedAndLogin();
    await page.goto('/tasks');
    const statusTrigger = page
      .locator('button')
      .filter({ hasText: 'All Statuses' })
      .first();
    await statusTrigger.click();
    await page.getByRole('option', { name: 'Todo' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('6 tasks total')).toBeVisible();
  });

  test('should add a new task', async ({ seedAndLogin, page }) => {
    await seedAndLogin();
    await page.goto('/tasks');
    await page.getByRole('button', { name: /create task/i }).click();
    await expect(
      page.getByRole('heading', { name: 'Create Task' })
    ).toBeVisible();

    await page.getByLabel('Title').fill('New E2E Task');
    await page.getByLabel('Description').fill('Created by Playwright');
    await page.getByLabel('Due Date').fill('2025-08-15');

    await page.locator('#priority').click();
    await page.getByRole('option', { name: 'High' }).click();

    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Todo' }).click();

    await page.locator('#assignedEmployeeId').click();
    await page.getByRole('option', { name: /Sarah Johnson/ }).click();

    await page.getByRole('button', { name: /^create task$/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('16 tasks total')).toBeVisible();
    await expect(page.getByText('New E2E Task').first()).toBeVisible();
  });

  test('should toggle between list and kanban view', async ({
    seedAndLogin,
    page,
  }) => {
    await seedAndLogin();
    await page.goto('/tasks');
    await expect(page.locator('table')).toBeVisible();

    await page.getByRole('button', { name: 'Kanban' }).click();
    await page.waitForTimeout(2000);

    await expect(page.locator('table')).toHaveCount(0);
    await expect(
      page.locator('[class*="rounded-lg border"]').first()
    ).toBeVisible();

    await page.getByRole('button', { name: 'List View' }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('should delete a task', async ({ seedAndLogin, page }) => {
    await seedAndLogin();
    await page.goto('/tasks');
    const checkbox = page
      .locator('table tbody tr')
      .first()
      .locator('input[type="checkbox"]');
    await checkbox.click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: /delete \(1\)/i }).click();
    await expect(
      page.getByRole('heading', { name: 'Delete tasks' })
    ).toBeVisible();
    await page.getByRole('button', { name: /delete all/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('14 tasks total')).toBeVisible();
  });
});
