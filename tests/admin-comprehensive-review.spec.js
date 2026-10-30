const { test, expect } = require('playwright/test');
const { installSupabaseBoundaryMock } = require('./helpers/admin-reference-boundary');

test('review: all admin sections remain usable with empty datasets at narrow phone width', async ({ page }) => {
  await page.route('https://**', route => route.abort('blockedbyclient'));
  await installSupabaseBoundaryMock(page, {
    bookings: [], blocked_times: [], availability_windows: [], services: [], coupons: [],
    booking_events: [], admin_error_events: [], admin_registered_customer_profiles: [],
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 844 });
  for (const tab of ['overview', 'bookings', 'schedule', 'content', 'prices', 'gallery', 'guests', 'coupons', 'calculator', 'logs', 'settings']) {
    await page.goto('/admin/?tab=' + tab);
    await expect(page.locator('[data-admin-shell]')).toBeVisible();
    const main = page.locator('#admin-reference-root main');
    await expect(main.getByText('Adatok betöltése…', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), tab).toBe(true);
    await expect(page.getByRole('navigation', { name: 'Mobil admin eszköztár', exact: true })).toBeInViewport();
    await expect(main.getByText(/Golden Studio|Golden Shine/i)).toHaveCount(0);
    await page.screenshot({ path: '.impeccable/review/admin-empty-' + tab + '-320.png' });
  }
  expect(errors).toEqual([]);
});

test('review: pending authentication keeps the own loading identity at phone and desktop sizes', async ({ page }) => {
  await page.route('https://**', route => route.abort('blockedbyclient'));
  // Hold the own adapter back to observe the transient real React loading screen.
  await page.route('**/admin-supabase.js*', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  for (const width of [320, 1440]) {
    await page.emulateMedia({ colorScheme: width === 320 ? 'dark' : 'light' });
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/admin/');
    const root = page.locator('#admin-reference-root');
    await expect(root.getByText('LumiNails', { exact: true })).toBeVisible();
    await expect(root.getByRole('heading', { name: 'Admin adatok betöltése…', exact: true })).toBeVisible();
    await expect(root.getByText(/Golden Studio|Golden Shine/i)).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: '.impeccable/review/admin-pending-' + width + '.png' });
  }
});
