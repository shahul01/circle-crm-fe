import { test as base } from '@playwright/test';
import { buildSeedPayload, ADMIN_USER, SALES_USER } from '../helpers/seed';

type TestFixtures = {
  loginAsAdmin: (opts?: { withSeed?: boolean }) => Promise<void>;
  loginAsSales: () => Promise<void>;
  seedAndLogin: () => Promise<void>;
};

export const test = base.extend<TestFixtures>({
  loginAsAdmin: async ({ page }, use) => {
    // oxlint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture use(), not React hook
    await use(async (opts?: { withSeed?: boolean }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.goto('/login');
      await page.getByPlaceholder('admin@circlecrm.com').fill(ADMIN_USER.email);
      await page.getByPlaceholder('Password').fill('Admin@123');
      await page.getByRole('button', { name: /sign in/i }).click();

      const withSeed = opts?.withSeed ?? true;
      if (withSeed) {
        const seedBtn = page.getByRole('button', { name: /load demo data/i });
        await seedBtn.waitFor({ state: 'visible', timeout: 5000 });
        await seedBtn.click();
      } else {
        const startEmpty = page.getByRole('button', { name: /start empty/i });
        const visible = await startEmpty.isVisible().catch(() => false);
        if (visible) {
          await startEmpty.click();
        }
      }

      await page.waitForURL('/', { timeout: 5000 });
    });
  },

  loginAsSales: async ({ page }, use) => {
    // oxlint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture use(), not React hook
    await use(async () => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.goto('/login');
      await page.getByPlaceholder('admin@circlecrm.com').fill(SALES_USER.email);
      await page.getByPlaceholder('Password').fill('Sales@123');
      await page.getByRole('button', { name: /sign in/i }).click();

      const seedBtn = page.getByRole('button', { name: /load demo data/i });
      await seedBtn.waitFor({ state: 'visible', timeout: 5000 });
      await seedBtn.click();

      await page.waitForURL('/', { timeout: 5000 });
    });
  },

  seedAndLogin: async ({ page }, use) => {
    // oxlint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture use(), not React hook
    await use(async () => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.evaluate((payload) => {
        localStorage.setItem('circle_crm_state_v1', JSON.stringify(payload));
      }, buildSeedPayload());
      await page.goto('/');
      await page.waitForURL('/', { timeout: 5000 });
    });
  },
});

export { expect } from '@playwright/test';
