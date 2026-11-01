const { test, expect } = require('playwright/test');
const { installSupabaseBoundaryMock, fixtures } = require('./helpers/admin-reference-boundary');

for (const alreadyRead of [true, false]) {
  test(`notification count waits for read status (${alreadyRead ? 'read' : 'unread'})`, async ({ page }) => {
    const seed = fixtures();
    seed.bookings = [seed.bookings[1]];
    seed.blocked_times = [];
    seed.admin_registered_customer_profiles = [];
    seed.booking_events = alreadyRead ? [{
      id: 'read-marker', event_type: 'admin_notifications_read', created_at: new Date().toISOString(),
      metadata: { admin_user_id: 'admin-demo', read_notice_ids: [`new:booking:${seed.bookings[0].id}`] }
    }] : [];
    await page.addInitScript(() => { window.__adminNotificationReadsGate = new Promise(resolve => { window.__releaseNotificationReads = resolve; }); });
    await installSupabaseBoundaryMock(page, seed);
    await page.goto('/admin/?tab=bookings');
    const bell = page.getByRole('button', { name: /^Értesítések/ });
    await expect(bell).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LumiAdminBackend?.snapshot().bookings?.length)).toBe(1);
    await expect(bell).toHaveAttribute('aria-label', 'Értesítések');
    await expect(page.locator('#admin-reference-root main article')).toHaveCount(0);
    await page.evaluate(() => window.__releaseNotificationReads());
    await expect(page.locator('#admin-reference-root main article')).toHaveCount(1);
    await expect(bell).toHaveAttribute('aria-label', alreadyRead ? 'Értesítések' : 'Értesítések, 1 jelzés');
  });
}

for (const width of [390, 1280]) {
 test(`refresh indicator floats above the page without moving its content (${width})`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await installSupabaseBoundaryMock(page);
  await page.goto('/admin/?tab=bookings');
  const heading = page.locator('#admin-reference-root main h1');
  await expect(heading).toBeVisible();
  await expect(page.getByText('Adatok betöltése…', { exact: true })).toHaveCount(0);
  const before = await heading.boundingBox();
  await page.evaluate(() => { window.__adminBookingsGate = new Promise(resolve => { window.__releaseBookings = resolve; }); });
  await page.getByRole('button', { name: 'Foglalások frissítése' }).click();
  const indicator = page.getByText('Adatok betöltése…', { exact: true });
  await expect(indicator).toBeVisible();
  expect(await indicator.evaluate(el => getComputedStyle(el.parentElement).position)).toBe('fixed');
  expect(await indicator.evaluate(el => {
    const box = el.getBoundingClientRect();
    const target = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return target === el || el.contains(target);
  })).toBe(false);
  expect((await heading.boundingBox()).y).toBeCloseTo(before.y, 0);
  await page.screenshot({ path: `output/playwright/admin-refresh-${width}.png` });
  await page.evaluate(() => window.__releaseBookings());
  await expect(indicator).toHaveCount(0);
  expect((await heading.boundingBox()).y).toBeCloseTo(before.y, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 });
}

test('failed initial load shows a retry instead of empty booking data', async ({ page }) => {
  await page.addInitScript(() => { window.__adminBookingsLoadFailure = true; });
  await installSupabaseBoundaryMock(page);
  await page.goto('/admin/?tab=bookings');
  await expect(page.getByRole('heading', { name: 'Az adminadatok nem töltődtek be' })).toBeVisible();
  await expect(page.locator('#admin-reference-root main article')).toHaveCount(0);
  await page.evaluate(() => { window.__adminBookingsLoadFailure = false; });
  await page.getByRole('button', { name: 'Újrapróbálás' }).click();
  await expect(page.locator('#admin-reference-root main article')).toHaveCount(6);
});

function withAcknowledgedCancellation() {
  const seed = fixtures();
  seed.booking_events.find(row => row.event_type === 'customer_cancelled').created_at = '2026-01-01T10:00:00Z';
  seed.booking_events.push({ id: 'acknowledged', booking_id: seed.bookings[3].id, event_type: 'customer_cancellation_acknowledged', channel: 'admin', created_at: '2026-01-01T11:00:00Z', metadata: {} });
  return seed;
}

test('acknowledged cancellations do not flash as new during initial loading', async ({ page }) => {
  await page.addInitScript(() => { window.__adminCancellationsGate = new Promise(resolve => { window.__releaseCancellations = resolve; }); });
  await installSupabaseBoundaryMock(page, withAcknowledgedCancellation());
  await page.goto('/admin/?tab=overview');
  await expect.poll(() => page.evaluate(() => window.__adminCancellationWaiting)).toBe(true);
  expect(await page.evaluate(() => window.LumiAdminBackend.snapshot().bookings.length)).toBe(0);
  await expect(page.getByText('Lemondás nyugtázása')).toHaveCount(0);
  await page.evaluate(() => window.__releaseCancellations());
  await expect(page.getByRole('heading', { name: 'A szalon ma' })).toBeVisible();
  await expect(page.getByText('Lemondás nyugtázása')).toHaveCount(0);
  expect(await page.evaluate(() => window.LumiAdminBackend.snapshot().bookings.find(row => row.guestName === 'Farkas Petra').cancellationAcknowledgedAt)).toBe('2026-01-01T11:00:00Z');
});

test('refresh keeps acknowledged cancellations stable while their events load', async ({ page }) => {
  await installSupabaseBoundaryMock(page, withAcknowledgedCancellation());
  await page.goto('/admin/?tab=overview');
  await expect(page.getByRole('heading', { name: 'A szalon ma' })).toBeVisible();
  await page.evaluate(() => { window.__adminCancellationsGate = new Promise(resolve => { window.__releaseCancellations = resolve; }); });
  await page.getByRole('button', { name: 'Áttekintés frissítése' }).click();
  await expect.poll(() => page.evaluate(() => window.__adminCancellationWaiting)).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('lumi:admin-data')));
  await expect(page.getByText('Lemondás nyugtázása')).toHaveCount(0);
  expect(await page.evaluate(() => window.LumiAdminBackend.snapshot().bookings.find(row => row.guestName === 'Farkas Petra').cancellationAcknowledgedAt)).toBe('2026-01-01T11:00:00Z');
  await page.evaluate(() => window.__releaseCancellations());
  await expect(page.getByText('Adatok betöltése…', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Lemondás nyugtázása')).toHaveCount(0);
});

test('failure to load cancellation events keeps the previous state and reports the error', async ({ page }) => {
  await installSupabaseBoundaryMock(page, withAcknowledgedCancellation());
  await page.goto('/admin/?tab=overview');
  await expect(page.getByRole('heading', { name: 'A szalon ma' })).toBeVisible();
  await page.evaluate(() => { window.__adminCancellationLoadFailure = true; });
  await page.getByRole('button', { name: 'Áttekintés frissítése' }).click();
  await expect(page.locator('#admin-reference-root').getByText('Nem sikerült betölteni a lemondások állapotát. Próbáld újra.')).toBeVisible();
  await expect(page.getByText('Lemondás nyugtázása')).toHaveCount(0);
  expect(await page.evaluate(() => window.LumiAdminBackend.snapshot().bookings.find(row => row.guestName === 'Farkas Petra').cancellationAcknowledgedAt)).toBe('2026-01-01T11:00:00Z');
});
