const { test, expect } = require('playwright/test');
const { installSupabaseBoundaryMock, fixtures } = require('./helpers/admin-reference-boundary');

test('admin login submits with Enter and click while preserving native password validation', async ({ page }) => {
  await page.route('https://**', route => route.abort());
  for (const file of ['admin-supabase.js', 'admin-content.js', 'admin-export.js']) {
    await page.route(`**/${file}*`, route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  }
  await page.addInitScript(() => {
    window.__reviewLoginCalls = 0;
    window.LumiAdminBackend = {
      snapshot: () => ({ authorized: false, ready: true, pending: false }),
      subscribe: () => () => {},
      authEmail: () => 'admin@example.test',
      signIn: async () => { window.__reviewLoginCalls++; return { error: { code: 'invalid_credentials' } }; },
    };
  });
  await page.goto('/admin/');
  const password = page.locator('#admin-password');
  await password.fill('short');
  await password.press('Enter');
  expect(await page.evaluate(() => window.__reviewLoginCalls)).toBe(0);
  await password.fill('Synthetic-password-1');
  await password.press('Enter');
  await expect.poll(() => page.evaluate(() => window.__reviewLoginCalls)).toBe(1);
  await expect(page.getByRole('alert')).toContainText('A belépési adatok nem megfelelőek.');
  await page.getByRole('button', { name: 'Belépés', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__reviewLoginCalls)).toBe(2);
});

test('a newer schedule edit made during a pending dialog save stays as an unsaved draft', async ({ page }) => {
  const seed = fixtures(), date = new Date().toLocaleDateString('sv-SE');
  seed.availability_windows = [{ id: 'window-review', work_date: date, start_time: '09:00', end_time: '18:00', slot_step_minutes: 30, active: true }];
  await page.route('https://*.supabase.co/**', route => route.abort());
  await installSupabaseBoundaryMock(page, seed);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin/?tab=schedule');
  await expect(page.locator('[data-admin-shell]')).toBeVisible();
  await page.locator(`[data-schedule-date="${date}"]`).click();
  const dialog = page.locator('dialog[open]');
  const end = dialog.locator('[data-window-id="window-review"]').getByLabel('Vége', { exact: true });
  await end.fill('17:30');
  await page.evaluate(() => {
    const backend = window.LumiAdminBackend, original = backend.saveWindows.bind(backend);
    backend.saveWindows = (...args) => new Promise((resolve, reject) => {
      window.__finishReviewScheduleSave = () => original(...args).then(resolve, reject);
    });
  });
  await dialog.getByRole('button', { name: 'Mentés', exact: true }).click();
  await expect.poll(() => page.evaluate(() => typeof window.__finishReviewScheduleSave)).toBe('function');
  // Native modal content stays interactive even when the workspace behind it is inert.
  await expect(end).toBeEnabled();
  await end.fill('17:00');
  await page.evaluate(() => window.__finishReviewScheduleSave());
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(() => window.__referenceSeed().availability_windows[0].end_time)).toMatch(/^17:30/);
  await expect(page.locator('[data-admin-save]')).toBeVisible();
  await page.locator(`[data-schedule-date="${date}"]`).click();
  await expect(page.locator('dialog[open] [data-window-id="window-review"]').getByLabel('Vége', { exact: true })).toHaveValue('17:00');
});
