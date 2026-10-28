const { test, expect } = require('playwright/test');

async function readyRow(page) {
    await page.route('https://*.supabase.co/rest/**', route => route.abort());
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const strip = page.getByRole('region', { name: 'Munkaképek, húzható képsor' });
    await expect(strip.locator('.studio-thumbnail')).toHaveCount(5);
    await strip.scrollIntoViewIfNeeded();
    await strip.locator('img').evaluateAll(images => {
        images.forEach(image => { image.loading = 'eager'; });
        return Promise.all(images.map(image => image.decode()));
    });
    return strip;
}

for (const width of [390, 1440]) {
    test.describe('draggable homepage row at ' + width + 'px', () => {
        test.use({ viewport: { width, height: width === 390 ? 844 : 900 }, hasTouch: width === 390, reducedMotion: 'reduce' });
        test('drag, swipe, keyboard and enlargement preserve the original photos and spacing', async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'reduce' });
            const strip = await readyRow(page);
            expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
            const photos = strip.locator('.studio-thumbnail');
            await expect(page.locator('.home-gallery-controls, .home-gallery-step')).toHaveCount(0);
            await expect(strip).toHaveCSS('scrollbar-width', 'none');
            await expect(page.locator('.home-gallery-pause')).toHaveCount(0);
            const spacing = await page.evaluate(() => document.querySelector('#fiok-ajanlo').getBoundingClientRect().top - document.querySelector('#home-gallery-strip').getBoundingClientRect().bottom);
            expect(spacing).toBeGreaterThanOrEqual(48);
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
            const firstAlt = await photos.first().locator('img').getAttribute('alt');
            const box = await strip.boundingBox();
            const y = box.y + 140, startX = box.x + Math.min(240, box.width - 30);
            await page.mouse.move(startX, y);
            await page.mouse.down();
            await page.mouse.move(startX - 170, y, { steps: 12 });
            await page.mouse.up();
            await expect.poll(() => strip.evaluate(element => element.scrollLeft)).toBeGreaterThan(100);
            await expect(page.locator('#galeria-lightbox')).not.toHaveClass(/nyitva/);
            if (width === 390) {
                const beforeSwipe = await strip.evaluate(element => element.scrollLeft);
                const cdp = await page.context().newCDPSession(page);
                await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y }] });
                for (const dx of [25, 50, 90, 130]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: startX - dx, y }] });
                await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
                expect(await strip.evaluate(element => element.scrollLeft)).toBeGreaterThan(beforeSwipe + 50);
                await expect(page.locator('#galeria-lightbox')).not.toHaveClass(/nyitva/);
            }
            await strip.focus();
            // Cross the loop boundary; no duplicate pictures or focusable clones are needed.
            for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowLeft');
            await expect(photos).toHaveCount(5);
            expect(await photos.first().locator('img').getAttribute('alt')).not.toBe(firstAlt);
            await page.waitForTimeout(280); // A drag must not turn its pointer-up into a photo click.
            const opener = photos.nth(1);
            const expectedAlt = await opener.locator('img').getAttribute('alt');
            await opener.click();
            await expect(page.locator('#galeria-lightbox')).toHaveClass(/nyitva/);
            await expect(page.locator('#galeria-lightbox img')).toHaveAttribute('alt', expectedAlt);
            await page.keyboard.press('Escape');
            await expect(opener).toBeFocused();
            await expect(page.locator('#galeria-lightbox')).not.toHaveClass(/nyitva/);
            await page.evaluate(() => document.activeElement.blur());
            await page.mouse.move(0, 0);
            const anchor = await opener.elementHandle();
            const before = await anchor.evaluate(element => element.getBoundingClientRect().left);
            await page.waitForTimeout(350);
            expect(await anchor.evaluate(element => element.getBoundingClientRect().left)).toBeCloseTo(before, 0);
        });
    });
}

for (const width of [390, 1440]) {
    test.describe('faster motion at ' + width + 'px', () => {
        test.use({ viewport: { width, height: width === 390 ? 844 : 900 }, hasTouch: width === 390 });
        test('resumes automatically after manual input while the pointer and focus stay on the row', async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'no-preference' });
            await page.mouse.move(0, 0);
            const strip = await readyRow(page);
            await expect(page.locator('.home-gallery-pause')).toHaveCount(0);
            const index = width === 390 ? 1 : 2;
            let photo = await strip.locator('.studio-thumbnail').nth(index).elementHandle();
            const initial = await photo.evaluate(element => ({ x: element.getBoundingClientRect().left, time: performance.now() }));
            await page.waitForTimeout(500);
            const moved = await photo.evaluate(element => ({ x: element.getBoundingClientRect().left, time: performance.now() }));
            const speed = (moved.x - initial.x) * 1000 / (moved.time - initial.time);
            expect(speed).toBeGreaterThan(88);
            expect(speed).toBeLessThan(115);
            console.log('Measured left-to-right speed at ' + width + 'px: ' + speed.toFixed(1) + 'px/s');

            async function expectResume() {
                photo = await strip.locator('.studio-thumbnail').nth(index).elementHandle();
                const before = await photo.evaluate(element => element.getBoundingClientRect().left);
                await expect.poll(() => photo.evaluate(element => element.getBoundingClientRect().left), { timeout: 650, intervals: [16, 32, 64, 128] }).toBeGreaterThan(before + 8);
            }
            const box = await strip.boundingBox();
            const x = box.x + Math.min(240, box.width - 30), y = box.y + 140;
            if (width === 390) {
                const cdp = await page.context().newCDPSession(page);
                await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
                for (const dx of [25, 60, 100, 140]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - dx, y }] });
                await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
                await expectResume();
            } else {
                await strip.hover();
                await page.mouse.wheel(180, 0);
                await expectResume(); // Keep the pointer hovering over the images.
                await page.mouse.move(x, y);
                await page.mouse.down();
                await page.mouse.move(x - 170, y, { steps: 12 });
                await page.mouse.up();
                await expect(page.locator('#galeria-lightbox')).not.toHaveClass(/nyitva/);
                expect(await page.evaluate(() => document.activeElement.classList.contains('studio-thumbnail'))).toBe(true);
                await expectResume(); // Do not blur the photo or move the pointer away.
                await page.waitForTimeout(260); // Let only the separate accidental drag-click guard expire.
                // A real pointer click does not wait for this deliberately moving target to settle.
                const target = await strip.locator('.studio-thumbnail').nth(2).boundingBox();
                await page.mouse.click(target.x + target.width / 2, target.y + target.height / 2);
                await expect(page.locator('#galeria-lightbox')).toHaveClass(/nyitva/);
                await page.keyboard.press('Escape');
                await expect(page.locator('#galeria-lightbox')).not.toHaveClass(/nyitva/);
                await expectResume();
            }
        });
    });
}

test('without JavaScript the original links remain manually scrollable', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:' + (process.env.LUMI_TEST_PORT || '8101') + '/');
    await expect(page.locator('#home-gallery-strip a.studio-gallery-item')).toHaveCount(5);
    await expect(page.locator('#home-gallery-strip')).toHaveCSS('overflow-x', 'auto');
    await expect(page.locator('.home-gallery-pause')).toHaveCount(0);
    await context.close();
});
