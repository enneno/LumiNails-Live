const { test, expect } = require('playwright/test');

const criticalViews = [
    {
        name: 'home-desktop',
        path: '/',
        viewport: { width: 1440, height: 1000 },
        ready: '#hero'
    },
    {
        name: 'home-mobile',
        path: '/',
        viewport: { width: 390, height: 844 },
        ready: '#hero'
    },
    {
        name: 'booking-mobile',
        path: '/foglalas/',
        viewport: { width: 390, height: 844 },
        ready: '#foglalas-urlap'
    },
    {
        name: 'booking-desktop',
        path: '/foglalas/',
        viewport: { width: 1440, height: 1000 },
        ready: '#foglalas-azonosito'
    },
    {
        name: 'account-desktop',
        path: '/fiokom/',
        viewport: { width: 1440, height: 1000 },
        ready: '#fiok-auth-panel'
    },
    {
        name: 'admin-desktop',
        path: '/admin/',
        viewport: { width: 1440, height: 1000 },
        ready: '#admin-bejelentkezes-panel'
    },
    {
        name: 'admin-mobile',
        path: '/admin/',
        viewport: { width: 390, height: 844 },
        ready: '#admin-bejelentkezes-panel'
    }
];

async function waitForImages(page) {
    await page.evaluate(async () => {
        const images = Array.from(document.images);
        images.forEach(image => { image.loading = 'eager'; });
        await Promise.all(images.map(image => new Promise(resolve => {
            if (image.complete) {
                image.decode?.().catch(() => {}).finally(resolve);
                return;
            }
            const finish = () => resolve();
            image.addEventListener('load', finish, { once: true });
            image.addEventListener('error', finish, { once: true });
            window.setTimeout(finish, 3000);
        })));
    });
}

test.describe('kritikus vizuális nézetek', () => {
    test('mobile public fields prevent focus zoom without disabling page zoom', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });

        for (const path of ['/foglalas/', '/fiokom/']) {
            await page.goto(path, { waitUntil: 'domcontentloaded' });
            await expect(page.locator('body')).not.toHaveClass(/tartalom-toltes/);

            const metrics = await page.evaluate(() => {
                const viewport = document.querySelector('meta[name="viewport"]')?.content || '';
                const fields = Array.from(document.querySelectorAll(
                    'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="file"]):not([type="range"]):not([type="color"]), select, textarea'
                ));
                return {
                    fieldCount: fields.length,
                    minimumFontSize: Math.min(...fields.map(field => Number.parseFloat(getComputedStyle(field).fontSize))),
                    fieldsUseNaturalGlyphScale: fields.every(field => getComputedStyle(field).fontSizeAdjust === 'none'),
                    fieldsKeepFullTextScale: fields.every(field => getComputedStyle(field).textSizeAdjust === '100%'),
                    disablesZoom: /maximum-scale|user-scalable\s*=\s*no/i.test(viewport)
                };
            });

            expect(metrics.fieldCount).toBeGreaterThan(0);
            expect(metrics.minimumFontSize).toBeGreaterThanOrEqual(16);
            expect(metrics.fieldsUseNaturalGlyphScale).toBe(true);
            expect(metrics.fieldsKeepFullTextScale).toBe(true);
            expect(metrics.disablesZoom).toBe(false);
        }
    });

    test('mobile service pages keep their content inside the viewport', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        const paths = [
            '/mukorom-epites-toltes/',
            '/gel-lakk-tatabanya/',
            '/manikur-tatabanya/',
            '/korom-diszites-nail-art-tatabanya/'
        ];

        for (const path of paths) {
            await page.goto(path, { waitUntil: 'domcontentloaded' });
            await expect(page.locator('body')).not.toHaveClass(/tartalom-toltes/);

            const metrics = await page.evaluate(() => {
                const main = document.querySelector('.seo-szolgaltatas-oldal');
                const hero = document.querySelector('.seo-szolgaltatas-hero');
                const heroImage = hero.querySelector('img');
                const mainRect = main.getBoundingClientRect();
                const heroRect = hero.getBoundingClientRect();
                const imageRect = heroImage.getBoundingClientRect();
                const contentFits = Array.from(main.querySelectorAll('h1, h2, h3, p, a'))
                    .every(element => {
                        const rect = element.getBoundingClientRect();
                        return rect.left >= -1 && rect.right <= window.innerWidth + 1;
                    });
                const paragraphs = Array.from(main.querySelectorAll('p'));
                return {
                    documentWidth: document.documentElement.scrollWidth,
                    mainLeft: Math.round(mainRect.left),
                    mainRight: Math.round(mainRect.right),
                    heroLeft: Math.round(heroRect.left),
                    heroRight: Math.round(heroRect.right),
                    heroHeight: heroRect.height,
                    imageRatio: imageRect.width / imageRect.height,
                    imageFit: getComputedStyle(heroImage).objectFit,
                    mobileTintRemoved: getComputedStyle(hero.querySelector('.seo-szolgaltatas-hero-kep'), '::after').content === 'none',
                    paragraphsAreJustified: paragraphs.every(paragraph => getComputedStyle(paragraph).textAlign === 'justify'),
                    paragraphsDoNotHyphenate: paragraphs.every(paragraph => getComputedStyle(paragraph).hyphens === 'none'),
                    contentFits
                };
            });

            expect(metrics.documentWidth, path).toBe(390);
            expect(metrics.mainLeft, path).toBe(16);
            expect(metrics.mainRight, path).toBe(374);
            expect(metrics.heroLeft, path).toBe(16);
            expect(metrics.heroRight, path).toBe(374);
            expect(metrics.heroHeight, path).toBeLessThan(650);
            expect(metrics.imageRatio, path).toBeCloseTo(3 / 2, 2);
            expect(metrics.imageFit, path).toBe('contain');
            expect(metrics.mobileTintRemoved, path).toBe(true);
            expect(metrics.paragraphsAreJustified, path).toBe(true);
            expect(metrics.paragraphsDoNotHyphenate, path).toBe(true);
            expect(metrics.contentFits, path).toBe(true);
        }
    });

    test('studio gallery controls and shared footer stay compact with all page links', async ({ page }) => {
        for (const width of [390, 1440, 320]) {
            await page.setViewportSize({ width, height: 844 });
            await page.goto('/', { waitUntil: 'domcontentloaded' });
            await expect(page.locator('.studio-thumbnail')).toHaveCount(5);
            await expect(page.locator('.footer-idorend')).toContainText('Nem minden nap van szabad időpont');
            const footer = page.getByRole('navigation', { name: 'Lábléc navigáció' });
            await expect(footer.locator('a')).toHaveCount(10);
            const metrics = await footer.evaluate(nav => {
                const rect = nav.getBoundingClientRect();
                return [...nav.querySelectorAll('a')].every(link => {
                    const box = link.getBoundingClientRect();
                    return box.height >= 44 && box.left >= rect.left && box.right <= rect.right + 1;
                });
            });
            expect(metrics).toBe(true);
            const footerHeight = await page.locator('.site-footer').evaluate(element => element.getBoundingClientRect().height);
            if (width === 1440) expect(footerHeight).toBeLessThan(260);
            if (width === 390) expect(footerHeight).toBeLessThan(430);
            await expect(page.locator('#fiok-ajanlo')).toHaveCount(0);
            await expect(page.locator('.galeria-atvezeto-szoveg h2')).toHaveCount(0);
        }
    });

    test('desktop account and booking verification retain desktop proportions', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto('/fiokom/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('#fiok-auth-panel')).toBeVisible();

        const account = await page.locator('#fiok-auth-panel').evaluate((panel) => ({
            columns: getComputedStyle(panel).gridTemplateColumns.split(' ').filter(Boolean).length,
            width: Math.round(panel.getBoundingClientRect().width),
            documentWidth: document.documentElement.scrollWidth
        }));
        expect(account.columns).toBe(2);
        expect(account.width).toBeGreaterThanOrEqual(1100);
        expect(account.documentWidth).toBe(1440);

        await page.goto('/foglalas/', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#foglalas-elerhetoseg');
        const booking = await page.evaluate(() => {
            const section = document.querySelector('#foglalas-ellenorzes');
            const input = document.querySelector('#foglalas-elerhetoseg');
            const card = input.closest('.foglalas-kezelo-kartya');
            const inputStyle = getComputedStyle(input);
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = inputStyle.font;
            const placeholderWidth = context.measureText(input.placeholder).width;
            return {
                sectionBackground: getComputedStyle(section).backgroundColor,
                cardBackground: getComputedStyle(card).backgroundColor,
                surfacesAreDistinct: getComputedStyle(section).backgroundColor
                    !== getComputedStyle(card).backgroundColor,
                inputWidth: input.clientWidth,
                placeholderFits: placeholderWidth + 32 <= input.clientWidth,
                documentWidth: document.documentElement.scrollWidth
            };
        });
        expect(booking.cardBackground).toBe('rgb(246, 243, 238)');
        expect(booking.surfacesAreDistinct).toBe(true);
        expect(booking.inputWidth).toBeGreaterThanOrEqual(280);
        expect(booking.placeholderFits).toBe(true);
        expect(booking.documentWidth).toBe(1440);
    });

    for (const view of criticalViews) {
        test(view.name, async ({ page }, testInfo) => {
            const pageErrors = [];
            page.on('pageerror', error => pageErrors.push(error.message));

            await page.setViewportSize(view.viewport);
            await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });

            const response = await page.goto(view.path, { waitUntil: 'domcontentloaded' });
            expect(response, `${view.path} nem adott választ`).not.toBeNull();
            expect(response.status()).toBeLessThan(400);
            await expect(page.locator(view.ready)).toBeVisible();
            await expect(page.locator('body')).not.toHaveClass(/tartalom-toltes/);
            await page.evaluate(() => document.fonts.ready);
            await waitForImages(page);

            const screenshotPath = testInfo.outputPath(`${view.name}.png`);
            await page.screenshot({
                path: screenshotPath,
                fullPage: true,
                caret: 'hide'
            });
            await testInfo.attach(`${view.name} screenshot`, {
                path: screenshotPath,
                contentType: 'image/png'
            });

            expect(pageErrors).toEqual([]);
        });
    }
});
