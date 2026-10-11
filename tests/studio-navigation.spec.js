const { test, expect } = require('playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// Public read-only navigation: no authentication or booking/database mutation.
test.beforeEach(async ({ page }) => {
  await page.route('https://*.supabase.co/rest/**', route => route.abort());
});

test('studio section links support keyboard, deep links and mobile menu without hiding content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#bemutatkozas');
  await expect(page.locator('#bemutatkozas')).toBeInViewport();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  for (const id of ['hero', 'szolgaltatasok', 'bemutatkozas', 'kapcsolat']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
    await expect(page.locator(`#${id}`)).not.toHaveAttribute('hidden');
  }
  await expect(page.locator('h1')).toHaveText('Lumi Nails');
  await page.locator('#studio-tab-services').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#szolgaltatasok')).toBeFocused();
  await expect(page.locator('#szolgaltatasok')).toBeInViewport();
  await expect(page.locator('#studio-tab-services')).toHaveAttribute('aria-current', 'location');
  await page.getByRole('button', { name: 'Menü megnyitása' }).click();
  await page.locator('#mobil-nav a[href="/#szolgaltatasok"]').click();
  await expect(page.locator('#mobil-nav')).not.toHaveClass(/open/);
  await expect(page.locator('#szolgaltatasok')).toBeInViewport();
  const heading = await page.locator('#szolgaltatasok-cim').boundingBox();
  const header = await page.locator('.site-header').boundingBox();
  expect(heading.y).toBeGreaterThanOrEqual(header.height);
  await page.locator('#studio-tab-works').click();
  await expect(page.locator('#galeria-atvezeto')).toBeInViewport();
  await documentFonts(page);
  const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(report.violations, 'accessibility: all homepage sections').toEqual([]);
  await expect(page.locator('#kapcsolat .gomb')).toHaveAttribute('href', '/foglalas/');
  await expect(page.locator('#kapcsolat h2')).not.toBeEmpty();
});

async function documentFonts(page) {
  await page.evaluate(() => document.fonts.ready);
}

test('public overlays stop background scrolling and restore the previous position', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await documentFonts(page);
  await expect(page.locator('.studio-thumbnail')).toHaveCount(5);
  await page.evaluate(() => scrollTo({ top: 500, behavior: 'instant' }));
  const position = await page.evaluate(() => scrollY);
  const heroTop = await page.locator('#hero').evaluate(el => el.getBoundingClientRect().top);
  const menuButton = await page.getByRole('button', { name: 'Menü megnyitása' }).boundingBox();
  await page.mouse.click(menuButton.x + menuButton.width / 2, menuButton.y + menuButton.height / 2);
  await expect(page.locator('#mobil-nav')).toHaveClass(/open/);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(180);
  expect(await page.locator('#hero').evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(heroTop, 0);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, 0);
  await page.getByRole('button', { name: 'Menü megnyitása' }).click();
  await page.locator('#mobil-nav a[href="/#szolgaltatasok"]').click();
  await expect(page.locator('#szolgaltatasok')).toBeInViewport();
  await expect(page.locator('#szolgaltatasok')).toBeFocused();

  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/galeria/');
    const button = page.locator('.galeria-kep-gomb').first();
    await button.scrollIntoViewIfNeeded();
    const before = await button.evaluate(el => ({ y: scrollY, top: el.getBoundingClientRect().top }));
    await button.click();
    await expect(page.locator('#galeria-lightbox')).toBeVisible();
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(180);
    expect(await button.evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(before.top, 0);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#galeria-lightbox img')).toHaveAttribute('src', await page.locator('.galeria-kep-gomb').nth(1).getAttribute('data-src'));
    await page.getByRole('button', { name: 'Galéria bezárása' }).click();
    await expect(button).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(before.y, 0);
  }
});

test('booking confirmation popup locks scrolling without submitting a booking', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/foglalas/');
  await page.evaluate(() => scrollTo({ top: 400, behavior: 'instant' }));
  const before = await page.locator('main').evaluate(el => ({ y: scrollY, top: el.getBoundingClientRect().top }));
  // Show only the confirmation UI; no booking is sent or written.
  await page.evaluate(() => document.getElementById('sikeres-popup').style.display = 'flex');
  await expect(page.locator('#sikeres-popup')).toBeVisible();
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(180);
  expect(await page.locator('main').evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(before.top, 0);
  await page.locator('#popup-bezaras').click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(before.y, 0);
});

test('homepage works open in the shared viewer and a failed image retains the last good photo', async ({ page }) => {
  await page.goto('/');
  const image = page.locator('#hero .hero-kep');
  const original = await image.getAttribute('src');
  const viewer = page.locator('#galeria-lightbox');
  const largeImage = viewer.locator('img');
  const buttons = page.locator('.studio-thumbnail');
  await expect(buttons).toHaveCount(5);
  await buttons.first().click();
  await expect(viewer).toBeVisible();
  await expect(largeImage).toHaveAttribute('src', await buttons.first().locator('img').getAttribute('data-full-src'));
  await expect(image).toHaveAttribute('src', original);
  await page.keyboard.press('ArrowRight');
  await expect(largeImage).toHaveAttribute('alt', await buttons.nth(1).locator('img').getAttribute('alt'));
  const previous = await largeImage.getAttribute('src');
  await page.keyboard.press('Escape');
  await expect(buttons.first()).toBeFocused();
  await page.evaluate(() => document.querySelectorAll('.studio-thumbnail img')[1].dataset.fullSrc = '/not-a-real-image.jpg');
  await buttons.nth(1).click();
  await expect(page.locator('[data-studio-image-status]')).toContainText('nem tölthető be');
  await expect(largeImage).toHaveAttribute('src', previous);
  await expect(viewer).not.toBeVisible();
  await expect(buttons.nth(1)).not.toHaveAttribute('aria-busy', 'true');
  await buttons.nth(4).click();
  await expect(viewer).toBeVisible();
  await expect(largeImage).toHaveAttribute('alt', await buttons.nth(4).locator('img').getAttribute('alt'));
});

test('studio has no viewport overflow and the phone opening photograph is uncut 16:9', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 375, 390, 414, 768, 1024, 1280, 1440, 1536]) {
    await page.setViewportSize({ width, height: 900 });
      const metrics = await page.evaluate(() => {
        const tabs = document.querySelector('.studio-view-tabs').getBoundingClientRect();
        const visual = document.querySelector('.hero-visual').getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          tabsInside: tabs.left >= 0 && tabs.right <= innerWidth + 1,
          ratio: visual.width / visual.height,
          fit: getComputedStyle(document.querySelector('.hero-kep')).objectFit,
          sections: ['hero', 'szolgaltatasok', 'bemutatkozas', 'kapcsolat'].map(id => {
            const section = document.getElementById(id);
            return { hidden: section.hidden, height: section.offsetHeight, top: section.offsetTop };
          }),
          pageHeight: document.documentElement.scrollHeight
        };
      });
      expect(metrics.overflow, `${width}`).toBeLessThanOrEqual(1);
      expect(metrics.tabsInside, `${width}`).toBe(true);
      expect(metrics.pageHeight).toBeGreaterThan(2000);
      for (const section of metrics.sections) {
        expect(section.hidden).toBe(false);
        expect(section.height).toBeGreaterThan(0);
      }
      expect(metrics.sections.map(s => s.top)).toEqual([...metrics.sections.map(s => s.top)].sort((a, b) => a - b));
      if (width <= 768) {
        expect(metrics.ratio).toBeCloseTo(16 / 9, 2);
        expect(metrics.fit).toBe('contain');
      }
  }
});

test('without JavaScript factual panels, photos and every public footer destination remain available', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/`);
  for (const selector of ['#hero', '#szolgaltatasok', '#bemutatkozas', '#kapcsolat']) await expect(page.locator(selector)).toBeVisible();
  await expect(page.locator('h1')).toHaveText('Lumi Nails');
  await expect(page.locator('#kapcsolat h2')).not.toBeEmpty();
  await expect(page.locator('#kapcsolat .gomb')).toHaveAttribute('href', '/foglalas/');
  await expect(page.locator('.galeria-atvezeto-kepek img')).toHaveCount(5);
  await expect(page.locator('.studio-gallery-item[href]')).toHaveCount(5);
  expect((await page.locator('#galeria-atvezeto').boundingBox()).width).toBeGreaterThan(300);
  for (const route of ['/arlista/', '/galeria/', '/foglalas/', '/fiokom/', '/adatkezeles/', '/mukorom-epites-toltes/', '/gel-lakk-tatabanya/', '/korom-diszites-nail-art-tatabanya/', '/manikur-tatabanya/']) {
    await expect(page.locator(`.footer-navigacio a[href="${route}"]`)).toBeVisible();
  }
  await context.close();
});
