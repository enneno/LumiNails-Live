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
    test('home-mobile hero keeps the full 16:9 image composed and the actions below it', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('body')).not.toHaveClass(/tartalom-toltes/);
        await page.locator('#vendegertesito').evaluate((notice) => {
            notice.hidden = false;
            notice.querySelector('.vendegertesito-szoveg').textContent = 'Kedves vendégeim.\n\nHa online nincs elérhető időpont, Instagramon akkor is tudunk egyeztetni.';
        });

        const metrics = await page.evaluate(() => {
            const hero = document.querySelector('#hero');
            const card = hero.querySelector('.hero-visual');
            const image = card.querySelector('.hero-kep');
            const label = card.querySelector('.hero-visual-cimke');
            const copy = hero.querySelector('.hero-copy');
            const benefits = hero.querySelector('.hero-bizalom');
            const actions = hero.querySelector('.hero-actions');
            const notice = document.querySelector('#vendegertesito');
            const bookingHeading = document.querySelector('#kapcsolat h2');
            const bookingHeadingRange = document.createRange();
            bookingHeadingRange.selectNodeContents(bookingHeading);
            const imageRect = image.getBoundingClientRect();
            const labelRect = label.getBoundingClientRect();
            const copyRect = copy.getBoundingClientRect();
            const benefitsRect = benefits.getBoundingClientRect();
            const actionsRect = actions.getBoundingClientRect();
            return {
                imageRatio: imageRect.width / imageRect.height,
                imageFit: getComputedStyle(image).objectFit,
                imageIsFullWidth: Math.abs(imageRect.width - window.innerWidth) <= 1,
                copyInsideImage: copyRect.top >= imageRect.top - 1
                    && copyRect.bottom <= imageRect.bottom + 1,
                benefitsInsideImage: benefitsRect.top >= imageRect.top - 1
                    && benefitsRect.bottom <= imageRect.bottom + 1,
                labelBelowImage: Math.abs(labelRect.top - imageRect.bottom) <= 1,
                actionsBelowLabel: actionsRect.top >= labelRect.bottom,
                actionColumns: getComputedStyle(actions).gridTemplateColumns.split(' ').filter(Boolean).length,
                galleryLabelHeight: labelRect.height,
                benefitsCentered: Array.from(benefits.children).every(item =>
                    getComputedStyle(item).textAlign === 'center'
                ),
                copyUsesSeparateBlocks: Array.from(copy.children).some(element =>
                    getComputedStyle(element).backgroundColor !== 'rgba(0, 0, 0, 0)'
                ),
                readabilityLayer: getComputedStyle(card, '::after').backgroundImage,
                noticeHeight: notice.getBoundingClientRect().height,
                bookingHeadingLineCount: bookingHeadingRange.getClientRects().length,
                accountRecommendationAbsent: !document.querySelector('#fiok-ajanlo'),
                overflow: document.documentElement.scrollWidth - window.innerWidth
            };
        });

        expect(metrics.imageRatio).toBeCloseTo(16 / 9, 2);
        expect(metrics.imageFit).toBe('contain');
        expect(metrics.imageIsFullWidth).toBe(true);
        expect(metrics.copyInsideImage).toBe(true);
        expect(metrics.benefitsInsideImage).toBe(true);
        expect(metrics.labelBelowImage).toBe(true);
        expect(metrics.actionsBelowLabel).toBe(true);
        expect(metrics.actionColumns).toBe(2);
        expect(metrics.galleryLabelHeight).toBeLessThanOrEqual(48);
        expect(metrics.benefitsCentered).toBe(true);
        expect(metrics.copyUsesSeparateBlocks).toBe(false);
        expect(metrics.readabilityLayer).toContain('linear-gradient');
        expect(metrics.noticeHeight).toBeLessThanOrEqual(100);
        expect(metrics.bookingHeadingLineCount).toBeLessThanOrEqual(2);
        expect(metrics.accountRecommendationAbsent).toBe(true);
        expect(metrics.overflow).toBeLessThanOrEqual(1);
    });

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

    test('homepage layout uses one gutter system and keeps the hero inside its section', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('body')).not.toHaveClass(/tartalom-toltes/);

        const desktop = await page.evaluate(() => {
            const hero = document.querySelector('#hero');
            const visual = hero.querySelector('.hero-visual');
            const intro = document.querySelector('.bemutatkozas-belso');
            const introText = intro.querySelector('.bemutatkozas-szoveg');
            const introParagraph = introText.querySelector('p');
            const services = document.querySelector('.szolgaltatasok-belso');
            const gallery = document.querySelector('.galeria-showcase-fej');
            const heroRect = hero.getBoundingClientRect();
            const visualRect = visual.getBoundingClientRect();
            const introRect = intro.getBoundingClientRect();
            const introTextRect = introText.getBoundingClientRect();
            const paragraphRect = introParagraph.getBoundingClientRect();
            const introImage = intro.querySelector('.bemutatkozas-kep img');

            return {
                heroWidth: Math.round(heroRect.width),
                heroRadius: Number.parseFloat(getComputedStyle(hero).borderRadius),
                visualInsideHero: visualRect.top >= heroRect.top - 1
                    && visualRect.bottom <= heroRect.bottom + 1,
                introSharesContentWidth: Math.abs(introRect.width - services.getBoundingClientRect().width) <= 1,
                introFitsContentHeight: Math.abs(introRect.height - Math.max(introTextRect.height, introImage.getBoundingClientRect().height)) <= 1,
                serviceColumns: getComputedStyle(document.querySelector('.szolgaltatas-lista')).gridTemplateColumns.split(' ').length,
                headingIsSans: getComputedStyle(hero.querySelector('h1')).fontFamily.includes('DM Sans'),
                introImageShowsFullFrame: getComputedStyle(introImage).objectFit === 'contain',
                introTextHasBreathingRoom: introTextRect.left > introRect.left + 40,
                sharedContentLeftEdges: Math.abs(
                    services.getBoundingClientRect().left - gallery.getBoundingClientRect().left
                ) <= 1,
                introParagraphIsReadable: paragraphRect.width <= 760,
                documentWidth: document.documentElement.scrollWidth
            };
        });

        expect(desktop.heroWidth).toBe(1440);
        expect(desktop.heroRadius).toBe(0);
        expect(desktop.visualInsideHero).toBe(true);
        expect(desktop.introSharesContentWidth).toBe(true);
        expect(desktop.introFitsContentHeight).toBe(true);
        expect(desktop.serviceColumns).toBe(4);
        expect(desktop.headingIsSans).toBe(true);
        expect(desktop.introImageShowsFullFrame).toBe(true);
        expect(desktop.introTextHasBreathingRoom).toBe(true);
        expect(desktop.sharedContentLeftEdges).toBe(true);
        expect(desktop.introParagraphIsReadable).toBe(true);
        expect(desktop.documentWidth).toBe(1440);

        await page.setViewportSize({ width: 390, height: 844 });
        const mobile = await page.evaluate(() => {
            const hero = document.querySelector('#hero');
            const hamburger = document.querySelector('.hamburger');
            const lines = Array.from(hamburger.querySelectorAll('span'));
            const introImage = document.querySelector('#bemutatkozas .bemutatkozas-kep img');
            return {
                heroBackground: getComputedStyle(hero).backgroundColor,
                surfaceToken: getComputedStyle(document.documentElement).getPropertyValue('--ui-surface').trim(),
                hamburgerColor: getComputedStyle(hamburger).color,
                inkToken: getComputedStyle(document.documentElement).getPropertyValue('--ui-off-black').trim(),
                introImageShowsFullFrame: getComputedStyle(introImage).objectFit === 'contain',
                linesVisible: lines.every((line) => {
                    const rect = line.getBoundingClientRect();
                    return rect.width >= 18 && rect.height >= 1;
                }),
                documentWidth: document.documentElement.scrollWidth
            };
        });

        expect(mobile.heroBackground).toBe('rgb(255, 255, 255)');
        expect(mobile.surfaceToken).toBe('#ffffff');
        expect(mobile.hamburgerColor).toBe('rgb(24, 33, 44)');
        expect(mobile.inkToken).toBe('#18212c');
        expect(mobile.introImageShowsFullFrame).toBe(true);
        expect(mobile.linesVisible).toBe(true);
        expect(mobile.documentWidth).toBe(390);
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

    test('homepage CTA stays readable and the shared footer stays compact', async ({ page }, testInfo) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('body')).not.toHaveClass(/tartalom-toltes/);

        const metrics = await page.evaluate(() => {
            const cta = document.querySelector('.szolgaltatas-zaras .gomb');
            const bookingSection = document.querySelector('#kapcsolat');
            const footer = document.querySelector('.site-footer');
            const activeGalleryCard = document.querySelector('.galeria-kartya-lapozo img[data-aktiv="true"]');
            const galleryControls = document.querySelector('.galeria-kartya-vezerlok');
            const galleryStage = document.querySelector('.galeria-kartya-lapozo');
            const galleryBridge = document.querySelector('.galeria-atvezeto-szoveg');
            const styles = getComputedStyle(cta);
            return {
                ctaText: cta.textContent.trim(),
                ctaColor: styles.color,
                ctaBackground: styles.backgroundColor,
                bookingSectionBackground: getComputedStyle(bookingSection).backgroundColor,
                footerHeight: footer.getBoundingClientRect().height,
                activeGalleryShadow: getComputedStyle(activeGalleryCard).boxShadow,
                galleryControlsShadow: getComputedStyle(galleryControls).boxShadow,
                galleryGlowVisible: getComputedStyle(galleryStage, '::before').display !== 'none',
                galleryBridgeHeight: galleryBridge.getBoundingClientRect().height,
                redundantGalleryHeadingAbsent: !galleryBridge.querySelector('h2')
            };
        });

        expect(metrics.ctaText).not.toBe('');
        expect(metrics.ctaBackground).toBe('rgb(49, 85, 198)');
        expect(metrics.bookingSectionBackground).toBe('rgb(237, 241, 247)');
        expect(metrics.ctaColor).not.toBe(metrics.ctaBackground);
        // The shared hours note adds useful content without a separate padded section.
        await expect(page.locator('.footer-idorend')).toContainText('Nem minden nap van szabad időpont');
        // Navigation adds four compact link rows without separate padded sections.
        expect(metrics.footerHeight).toBeLessThan(430);
        const footerNav = page.getByRole('navigation', { name: 'Lábléc navigáció' });
        const expectedLinks = [
            ['Kezdőlap', '/'], ['Szolgáltatások', '/#szolgaltatasok'],
            ['Árlista', '/arlista/'], ['Galéria', '/galeria/'],
            ['Fiókom', '/fiokom/'], ['Foglalás', '/foglalas/'],
            ['Műköröm építés és töltés', '/mukorom-epites-toltes/'],
            ['Gél lakk', '/gel-lakk-tatabanya/'],
            ['Körömdíszítés / Nail Art', '/korom-diszites-nail-art-tatabanya/'],
            ['Manikűr', '/manikur-tatabanya/']
        ];
        for (const [name, href] of expectedLinks) {
            await expect(footerNav.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
        }
        await page.evaluate(() => document.fonts.ready);
        await page.locator('.site-footer').screenshot({ path: testInfo.outputPath('footer-mobile.png') });
        expect(metrics.activeGalleryShadow).toBe('none');
        expect(metrics.galleryControlsShadow).toBe('none');
        expect(metrics.galleryGlowVisible).toBe(false);
        expect(metrics.galleryBridgeHeight).toBeLessThanOrEqual(64);
        expect(metrics.redundantGalleryHeadingAbsent).toBe(true);

        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.reload({ waitUntil: 'domcontentloaded' });
        const desktopFooterHeight = await page.locator('.site-footer').evaluate(
            footer => footer.getBoundingClientRect().height
        );
        expect(desktopFooterHeight).toBeLessThan(260);
        await page.locator('.site-footer').screenshot({ path: testInfo.outputPath('footer-desktop.png') });

        await page.setViewportSize({ width: 320, height: 844 });
        await expect(footerNav).toBeVisible();
        const navigationFits = await footerNav.evaluate(nav => {
            const rect = nav.getBoundingClientRect();
            return [...nav.querySelectorAll('a')].every(link => {
                const box = link.getBoundingClientRect();
                return box.height >= 44 && box.left >= rect.left && box.right <= rect.right + 1;
            });
        });
        expect(navigationFits).toBe(true);
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
        expect(booking.cardBackground).toBe('rgb(255, 255, 255)');
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
