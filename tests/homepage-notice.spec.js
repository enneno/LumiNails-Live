const { test, expect } = require('playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// Only local public UI: no database writes or real booking operations.
test.beforeEach(async ({ page }) => {
  await page.route('https://*.supabase.co/rest/**', route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('current information leads the page and remains readable while scrolling and navigating', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.studio-thumbnail')).toHaveCount(5);
  await page.evaluate(() => document.fonts.ready);
  const notice = page.locator('#vendegertesito');
  await expect(notice.locator('summary')).toHaveCount(0);
  await expect(notice.locator('.vendegertesito-szoveg')).toBeVisible();
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => scrollTo(0, 0));
    await expect.poll(() => page.evaluate(() => Number.parseFloat(document.documentElement.style.getPropertyValue('--ui-header-clearance')))).toBeCloseTo((await page.locator('.home-sticky-header').boundingBox()).height, 0);
    const metrics = await page.evaluate(() => {
      const notice = document.getElementById('vendegertesito');
      return {
        top: notice.getBoundingClientRect().top,
        noticeBottom: notice.getBoundingClientRect().bottom,
        headerTop: document.querySelector('.site-header').getBoundingClientRect().top,
        shellBottom: document.querySelector('.home-sticky-header').getBoundingClientRect().bottom,
        mainTop: document.getElementById('fo-tartalom').getBoundingClientRect().top,
        overflow: document.documentElement.scrollWidth - innerWidth,
        clipped: notice.scrollHeight > notice.clientHeight + 1
      };
    });
    expect(metrics.top).toBe(0);
    expect(metrics.headerTop).toBeCloseTo(metrics.noticeBottom, 0);
    expect(metrics.mainTop).toBeGreaterThanOrEqual(metrics.shellBottom);
    expect(metrics.overflow).toBeLessThanOrEqual(1);
    expect(metrics.clipped).toBe(false);
    await page.screenshot({ path: `output/playwright/notice-${width}.png` });
    await page.evaluate(() => scrollTo(0, 1200));
    await expect(notice).toBeInViewport();
    expect((await notice.boundingBox()).y).toBe(0);
    await page.locator('#studio-tab-services').click();
    await expect(page.locator('#szolgaltatasok')).toBeFocused();
    const title = await page.locator('#szolgaltatasok-cim').boundingBox();
    const shell = await page.locator('.home-sticky-header').boundingBox();
    expect(title.y).toBeGreaterThanOrEqual(shell.height);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Menü megnyitása' }).click();
  const menu = await page.locator('#mobil-nav').boundingBox();
  const shell = await page.locator('.home-sticky-header').boundingBox();
  expect(menu.y).toBeCloseTo(shell.height, 0);
  await page.locator('#mobil-nav a[href="/#szolgaltatasok"]').click();
  await expect(page.locator('#mobil-nav')).not.toHaveClass(/open/);
  const report = await new AxeBuilder({ page }).include('#vendegertesito').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(report.violations).toEqual([]);
});

test('disabled, empty and long information adapt the shell without gaps or overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await expect(page.locator('.studio-thumbnail')).toHaveCount(5);
  for (const info of [{ aktiv: false, szoveg: 'Elrejtett üzenet' }, { aktiv: true, szoveg: '' }]) {
    await page.evaluate(info => vendegertesitoAlkalmazasa(info), info);
    await expect(page.locator('#vendegertesito')).toBeHidden();
    expect((await page.locator('.home-sticky-header').boundingBox()).height).toBe(68);
  }
  await page.evaluate(() => vendegertesitoAlkalmazasa({ aktiv: true, cimke: 'Fontos tudnivaló', szoveg: 'Hosszabb tájékoztatás. '.repeat(80) + 'Utolsó mondat.' }));
  const notice = page.locator('#vendegertesito');
  await expect(notice).toBeVisible();
  const metrics = await notice.evaluate(el => ({ height: el.clientHeight, content: el.scrollHeight, overflow: document.documentElement.scrollWidth - innerWidth }));
  expect(metrics.height).toBeLessThanOrEqual(142);
  expect(metrics.content).toBeGreaterThan(metrics.height);
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  await notice.focus();
  await page.keyboard.press('End');
  await expect.poll(() => notice.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await page.goto('/arlista/');
  expect((await page.locator('.site-header').boundingBox()).y).toBe(0);
  await expect(page.locator('#vendegertesito')).toHaveCount(0);
});

test('prerendered information remains open and sticky without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8101/');
  const notice = page.locator('#vendegertesito');
  await expect(notice.locator('.vendegertesito-szoveg')).toContainText('Instagramon');
  await expect(notice).toBeInViewport();
  await page.locator('#studio-tab-services').click();
  await expect(notice).toBeInViewport();
  expect((await notice.boundingBox()).y).toBe(0);
  const title = await page.locator('#szolgaltatasok-cim').boundingBox();
  const shell = await page.locator('.home-sticky-header').boundingBox();
  expect(title.y).toBeGreaterThanOrEqual(shell.height);
  await context.close();
});
