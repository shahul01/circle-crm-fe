import { test as base, expect, type Page } from '@playwright/test';
import { buildSeedPayload } from './helpers/seed';

/**
 * Mobile regression tests.
 *
 * Guards against page-level horizontal overflow on small viewports, which used
 * to push the header/content wider than the screen (cutting off the theme
 * toggle and table row actions, breaking taps, and shifting dialogs off-center).
 */
const test = base.extend<{ mobile: Page }>({
  mobile: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
    });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.evaluate((payload) => {
      localStorage.setItem('circle_crm_state_v1', JSON.stringify(payload));
    }, buildSeedPayload());
    await page.goto('/');
    await page.waitForURL('/');
    // oxlint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture use(), not React hook
    await use(page);
    await ctx.close();
  },
});

const ROUTES = ['/', '/customers', '/leads', '/tasks', '/customers/cust-1'];

test.describe('Mobile layout & taps', () => {
  test('pages do not scroll horizontally', async ({ mobile: page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForTimeout(250);
      const { cw, sw, mainWidth } = await page.evaluate(() => ({
        cw: document.documentElement.clientWidth,
        sw: document.documentElement.scrollWidth,
        mainWidth: document.querySelector('main')?.getBoundingClientRect()
          .width,
      }));
      expect(sw, `${route} overflows horizontally`).toBeLessThanOrEqual(cw + 1);
      expect(
        mainWidth,
        `${route} main is wider than viewport`
      ).toBeLessThanOrEqual(cw + 1);
    }
  });

  test('sidebar toggle opens and closes on tap', async ({ mobile: page }) => {
    const overlay = page.locator('.fixed.inset-0.z-30');
    await expect(overlay).toHaveCount(0);

    await page.locator('header button').first().tap();
    await expect(page.locator('aside')).toHaveClass(/translate-x-0/);
    await expect(overlay).toHaveCount(1);

    await page.locator('aside button').first().tap();
    await expect(overlay).toHaveCount(0);
  });

  test('theme toggle fits the viewport and responds to tap', async ({
    mobile: page,
  }) => {
    const themeBtn = page.locator('header button').last();
    const box = await themeBtn.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.x + box!.width).toBeLessThanOrEqual(390.5);

    await themeBtn.tap();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('customer row action buttons are on-screen and tappable', async ({
    mobile: page,
  }) => {
    await page.goto('/customers');
    await page.waitForTimeout(250);
    const rows = await page.evaluate(() =>
      [...document.querySelectorAll('tbody tr')].slice(0, 3).map((tr) =>
        [...tr.querySelectorAll('button')].map((b) => {
          const r = b.getBoundingClientRect();
          const hit = document.elementFromPoint(
            r.x + r.width / 2,
            r.y + r.height / 2
          );
          return {
            right: Math.round(r.right),
            visible: r.right <= window.innerWidth + 1 && r.x >= -1,
            hit: !!hit && hit.closest('button') === b,
          };
        })
      )
    );
    rows.forEach((rowBtns, i) =>
      rowBtns.forEach((b, j) => {
        expect(b.visible, `row ${i} button ${j} visible`).toBe(true);
        expect(b.hit, `row ${i} button ${j} tappable`).toBe(true);
      })
    );
  });

  test('signout dialog is centered and its buttons are tappable', async ({
    mobile: page,
  }) => {
    await page.locator('header button').first().tap();
    await page
      .locator('aside button')
      .filter({ has: page.locator('svg.lucide-log-out') })
      .tap();
    const dlg = page.getByRole('dialog');
    await dlg.waitFor({ state: 'visible' });

    const { centerDelta, buttons } = await page.evaluate(() => {
      const r = document
        .querySelector('[role="dialog"]')!
        .getBoundingClientRect();
      const buttons = [
        ...document.querySelectorAll('[role="dialog"] button'),
      ].map((b) => {
        const br = b.getBoundingClientRect();
        const hit = document.elementFromPoint(
          br.x + br.width / 2,
          br.y + br.height / 2
        );
        return !!hit && hit.closest('button') === b;
      });
      return {
        centerDelta: Math.abs(r.x + r.width / 2 - window.innerWidth / 2),
        buttons,
      };
    });
    expect(centerDelta).toBeLessThan(2);
    buttons.forEach((ok) => expect(ok).toBe(true));
  });

  test('seed dialog on login is centered', async ({ mobile: page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page
      .getByPlaceholder('admin@circlecrm.com')
      .fill('admin@circlecrm.com');
    await page.getByPlaceholder('Password').fill('Admin@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });

    const centerDelta = await page.evaluate(() => {
      const r = document
        .querySelector('[role="dialog"]')!
        .getBoundingClientRect();
      return Math.abs(r.x + r.width / 2 - window.innerWidth / 2);
    });
    expect(centerDelta).toBeLessThan(2);
  });
});
