const { test, expect } = require('playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.beforeEach(async ({ page }) => {
  await page.route('https://*.supabase.co/rest/**', route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('compact shared footer keeps all ten destinations and usable phone targets', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  // One metadata row now also holds the required Icons8 credit, with a 44px phone target.
  for (const [width, maxHeight] of [[320, 441], [390, 321], [1440, 174]]) {
    await page.setViewportSize({ width, height: 844 });
    const footer = page.locator('.site-footer');
    await expect(footer.locator('.footer-navigacio a')).toHaveCount(10);
    await expect(footer.locator('.footer-ikon-forras')).toBeVisible();
    await expect(footer.locator('.footer-ikon-forras')).toHaveAttribute('href', 'https://icons8.com');
    const metrics = await footer.evaluate(el => ({
      height: el.getBoundingClientRect().height,
      overflow: document.documentElement.scrollWidth - innerWidth,
      targets: [...el.querySelectorAll('.footer-navigacio a, .social-gomb, .footer-kapcsolat a:not([hidden]), .footer-ikon-forras')].map(a => a.getBoundingClientRect().height)
    }));
    expect(metrics.height, `${width}px`).toBeLessThanOrEqual(maxHeight);
    expect(metrics.overflow).toBeLessThanOrEqual(1);
    expect(Math.min(...metrics.targets)).toBeGreaterThanOrEqual(width < 900 ? 44 : 30);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.screenshot({ path: `output/playwright/footer-compact-${width}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const report = await new AxeBuilder({ page }).include('.site-footer').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(report.violations).toEqual([]);
  // Same owning footer on a representative inner page, no booking submission.
  await page.goto('/arlista/');
  await expect(page.locator('.footer-navigacio a')).toHaveCount(10);
  await expect(page.locator('.footer-ikon-forras')).toBeVisible();
  expect((await page.locator('.site-footer').boundingBox()).height).toBeLessThanOrEqual(321);
});

test('homepage services use four local Icons8 images with and without JavaScript', async ({ page, browser }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.szolgaltatas-kartya-ikon')).toHaveCount(4);
  await page.locator('#studio-tab-services').click();
  // Exercise the same CMS renderer used by the next prerender, without database writes.
  await page.evaluate(() => {
    const kartyak = [...document.querySelectorAll('.szolgaltatas-kartya')].map(el => ({
      cim: el.querySelector('h3').textContent,
      leiras: el.querySelector('p').textContent,
      linkSzoveg: 'Részletek'
    }));
    szolgaltatasKartyakRenderelese({ kartyak });
  });
  await expect(page.locator('.szolgaltatas-kartya-ikon')).toHaveCount(4);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('#szolgaltatasok').scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('.szolgaltatas-kartya-ikon').evaluateAll(images => images.every(img => img.complete && img.naturalWidth === 100 && img.naturalHeight === 100))).toBe(true);
    const rows = await page.locator('.szolgaltatas-kartya').evaluateAll(elements => elements.map(el => ({
      image: getComputedStyle(el, '::before').backgroundImage,
      inlinePhoto: el.style.getPropertyValue('--service-image'),
      iconHidden: el.querySelector('img.szolgaltatas-kartya-ikon').getAttribute('aria-hidden'),
      iconAlt: el.querySelector('img.szolgaltatas-kartya-ikon').alt,
      iconSource: el.querySelector('img.szolgaltatas-kartya-ikon').getAttribute('src'),
      left: el.getBoundingClientRect().left,
      right: el.getBoundingClientRect().right,
      width: innerWidth
    })));
    for (const row of rows) {
      expect(row.image).toBe('none');
      expect(row.inlinePhoto).toBe('');
      expect(row.iconHidden).toBe('true');
      expect(row.iconAlt).toBe('');
      expect(row.iconSource).toMatch(/^\/kepek\/ikonok\/(epites|diszites|gel-lakk|manikur)\.png$/);
      expect(row.left).toBeGreaterThanOrEqual(0);
      expect(row.right).toBeLessThanOrEqual(row.width);
    }
    expect(new Set(rows.map(row => row.iconSource)).size).toBe(4);
    await page.locator('#szolgaltatasok').screenshot({ path: `output/playwright/services-icons-${width}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const report = await new AxeBuilder({ page }).include('#szolgaltatasok').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(report.violations).toEqual([]);
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await context.newPage();
  await staticPage.goto('http://127.0.0.1:8101/');
  await expect(staticPage.locator('.szolgaltatas-kartya-ikon')).toHaveCount(4);
  await staticPage.locator('#szolgaltatasok').scrollIntoViewIfNeeded();
  await expect.poll(() => staticPage.locator('.szolgaltatas-kartya-ikon').evaluateAll(images => images.every(img => img.complete && img.naturalWidth === 100))).toBe(true);
  const staticSources = await staticPage.locator('.szolgaltatas-kartya-ikon').evaluateAll(images => images.map(img => img.getAttribute('src')));
  expect(staticSources).toEqual(['/kepek/ikonok/epites.png', '/kepek/ikonok/diszites.png', '/kepek/ikonok/gel-lakk.png', '/kepek/ikonok/manikur.png']);
  await expect(staticPage.locator('.footer-navigacio a')).toHaveCount(10);
  await expect(staticPage.locator('.footer-ikon-forras')).toHaveAttribute('href', 'https://icons8.com');
  await context.close();
});
