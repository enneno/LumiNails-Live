const { test, expect } = require('playwright/test');

test.use({ javaScriptEnabled: false });

test('a fontos publikus tartalom JavaScript nélkül is olvasható', async ({ page }) => {
    const servicePages = [
        '/mukorom-epites-toltes/',
        '/gel-lakk-tatabanya/',
        '/manikur-tatabanya/',
        '/korom-diszites-nail-art-tatabanya/'
    ];

    for (const route of servicePages) {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('.site-header')).toBeVisible();
        await expect(page.locator('.site-footer')).toBeVisible();
        await expect(page.locator('.seo-szolgaltatas-oldal h1')).not.toHaveText('');
        await expect(page.locator('.seo-szolgaltatas-hero-kep img')).toHaveAttribute('src', /.+/);
        await expect(page.locator('a[href="/foglalas/"]').first()).toBeAttached();
    }

    await page.goto('/arlista/', { waitUntil: 'domcontentloaded' });
    expect(await page.locator('.arlista-sor').count()).toBeGreaterThan(0);
    await expect(page.locator('.arlista-allapot')).toHaveCount(0);

    await page.goto('/galeria/', { waitUntil: 'domcontentloaded' });
    expect(await page.locator('.galeria-racs img').count()).toBeGreaterThan(0);
    await expect(page.locator('.galeria-racs img').first()).toHaveAttribute('alt', /.+/);

    const notFound = await page.goto('/nem-letezo-oldal-20260912/', { waitUntil: 'domcontentloaded' });
    expect(notFound?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    await expect(page.locator('#hibas-oldal-cim')).toHaveText('Ezt az oldalt nem találjuk.');
});
