const { test, expect } = require('playwright/test');
const { installSupabaseBoundaryMock } = require('./helpers/admin-reference-boundary');

test('review: failed payment stays visibly unsaved and can be retried without changing the stored booking', async ({ page }) => {
    await page.route('https://*.supabase.co/**', route => route.abort('blockedbyclient'));
    await installSupabaseBoundaryMock(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/admin/?tab=bookings');
    await expect(page.locator('#admin-reference-root [data-admin-shell]')).toBeVisible();
    const card = page.locator('#admin-reference-root main article').filter({ hasText: 'Nagy Anna' });
    await card.getByRole('button', { name: /10:00/ }).click();
    const payment = page.getByLabel('Fizetett összeg', { exact: true });
    const inputId = await payment.getAttribute('id');
    await page.evaluate(() => window.__adminBookingConflict = true);
    await payment.fill('7500');
    await payment.press('Enter');
    await expect(payment).toBeEnabled();
    await expect(page.locator(`#${inputId}-error`)).toHaveText('A mentés nem sikerült. Próbáld újra.');
    await expect(payment).toHaveAttribute('aria-invalid', 'true');
    await expect(payment).toHaveValue('7500');
    expect(await page.evaluate(() => window.__referenceSeed().bookings.find(row => row.customer_name === 'Nagy Anna'))).toMatchObject({ paid_amount: 6500, status: 'confirmed' });
    await page.evaluate(() => window.__adminBookingConflict = false);
    await payment.focus();
    await payment.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__referenceSeed().bookings.find(row => row.customer_name === 'Nagy Anna').paid_amount)).toBe(7500);
    expect(await page.evaluate(() => window.__referenceSeed().bookings.find(row => row.customer_name === 'Nagy Anna').status)).toBe('done');
    await expect(page.locator(`#${inputId}-error`)).toHaveCount(0);
});
