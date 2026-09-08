const { test, expect } = require('playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const auditedViews = [
    {
        name: 'home-mobile',
        path: '/',
        ready: '#hero',
        maximumKnownViolations: { 'color-contrast': 0, 'target-size': 2 }
    },
    {
        name: 'booking-mobile',
        path: '/foglalas/',
        ready: '#foglalas-urlap',
        maximumKnownViolations: { 'color-contrast': 0, 'target-size': 2 }
    },
    {
        name: 'admin-mobile',
        path: '/admin/',
        ready: '#admin-bejelentkezes-panel',
        maximumKnownViolations: { 'color-contrast': 0 }
    }
];

test.describe('kritikus accessibility ratchet', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    for (const view of auditedViews) {
        test(view.name, async ({ page }, testInfo) => {
            await page.goto(view.path, { waitUntil: 'domcontentloaded' });
            await expect(page.locator(view.ready)).toBeVisible();
            await expect(page.locator('body')).not.toHaveClass(/tartalom-toltes/);
            await page.evaluate(() => document.fonts.ready);

            const results = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
                .analyze();

            await testInfo.attach(`${view.name} axe report`, {
                body: Buffer.from(JSON.stringify(results, null, 2)),
                contentType: 'application/json'
            });

            const counts = Object.fromEntries(
                results.violations.map(violation => [violation.id, violation.nodes.length])
            );
            const unexpectedRules = Object.keys(counts)
                .filter(rule => !(rule in view.maximumKnownViolations));

            expect(unexpectedRules, 'Új accessibility szabálysértés-típus jelent meg').toEqual([]);
            for (const [rule, maximum] of Object.entries(view.maximumKnownViolations)) {
                expect(counts[rule] || 0, `${rule} eltérések száma nőtt`).toBeLessThanOrEqual(maximum);
            }
        });
    }
});
