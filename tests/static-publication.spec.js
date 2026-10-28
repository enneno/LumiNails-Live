const { test, expect } = require('playwright/test');

test.skip(process.env.LUMI_TEST_DIST !== '1', 'This check targets the built dist release.');

test.beforeEach(async ({ page }) => {
    await page.route('https://**', route => route.abort());
    await page.addInitScript(() => {
        window.__publicTables = [];
        window.supabase = { createClient: () => ({
            auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
            from: table => {
                window.__publicTables.push(table);
                const query = new Proxy({}, { get: (_, key) => key === 'then'
                    ? (resolve, reject) => Promise.resolve({ data: [], error: null }).then(resolve, reject)
                    : () => query });
                return query;
            }
        }) };
    });
});

test('built public page shares one static JSON request and loads hashed dynamic assets without database content reads', async ({ page }) => {
    const snapshots = [], failures = [], assets = [];
    page.on('request', request => { if (new URL(request.url()).pathname === '/adatok.json') snapshots.push(request.url()); });
    page.on('response', response => { if (response.url().includes('/assets/')) { assets.push(response.url()); if (!response.ok()) failures.push(response.url()); } });
    await page.goto('/arlista/', { waitUntil: 'networkidle' });
    expect(await page.locator('.arlista-sor').count()).toBeGreaterThan(0);
    expect(snapshots).toHaveLength(1);
    expect(await page.evaluate(() => window.__publicTables)).not.toContain('services');
    expect(await page.evaluate(() => window.__publicTables)).not.toContain('site_settings');
    expect(assets.some(url => /\/assets\/typography-tuning\.[a-f0-9]{16}\.css$/.test(url))).toBe(true);
    expect(failures).toEqual([]);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('failed static JSON preserves the prerendered release and source SQL is absent', async ({ page, request }) => {
    await page.route('**/adatok.json', route => route.abort());
    await page.goto('/arlista/', { waitUntil: 'networkidle' });
    expect(await page.locator('.arlista-sor').count()).toBeGreaterThan(0);
    const manifest = await (await request.get('/deployment.json')).json();
    await expect(page.locator('html')).toHaveAttribute('data-lumi-content-fingerprint', manifest.contentHash);
    expect((await request.get('/supabase-schema.sql')).status()).toBe(404);
    expect((await request.get('/src/admin/00-bootstrap-auth-calendar.js')).status()).toBe(404);
});
