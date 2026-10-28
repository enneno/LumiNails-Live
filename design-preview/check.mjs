import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const target = 'http://127.0.0.1:8118';
const evidence = path.resolve('.impeccable/review/editorial-malyva-20261028');
await fs.mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.LUMI_BROWSER_EXECUTABLE, headless: true });
const report = { layout: 'header, large hero, immediate introduction', views: [], interactions: [] };
try {
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 640 ? 844 : 900 }, reducedMotion: 'reduce' });
    const external = [];
    context.on('request', request => { if (!request.url().startsWith(target)) external.push(request.url()); });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(target, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      document.querySelectorAll('img[src]').forEach(image => { image.loading = 'eager'; });
      await document.fonts.ready;
      await Promise.all([...document.querySelectorAll('img[src]')].map(image => image.decode()));
    });
    const actual = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, order: document.querySelector('.hero-opening').nextElementSibling.id, broken: [...document.querySelectorAll('img[src]')].filter(x => !x.naturalWidth).length, heroBottom: document.querySelector('.hero-opening').getBoundingClientRect().bottom, viewportHeight: innerHeight, imageFit: getComputedStyle(document.querySelector('.hero-photo img')).objectFit }));
    assert.ok(actual.scroll <= actual.width, 'Horizontal overflow at ' + width);
    assert.equal(actual.order, 'szofi', 'Introduction must directly follow the hero');
    assert.equal(actual.broken, 0);
    assert.ok(Math.abs(actual.heroBottom - actual.viewportHeight) <= 2, 'Hero must fill the opening viewport');
    assert.equal(actual.imageFit, 'cover');
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    assert.equal(await page.locator('.site-head').count(), 1);
    assert.equal(await page.locator('.hero-photo img').getAttribute('src'), '/assets/work-1.jpg');
    assert.equal(await page.locator('.concepts, .palette-controls').count(), 0);
    assert.equal((await page.locator('h1').textContent()).replace(/\s+/g, ' ').trim(), 'Lumi Nails');
    if (width === 1440) for (const name of ['about-band', 'services', 'gallery-section']) await page.locator('.' + name).screenshot({ path: path.join(evidence, name + '.png') });
    await page.evaluate(() => scrollTo(0, 0));
    if ([390, 1440].includes(width)) {
      await page.screenshot({ path: path.join(evidence, 'home-' + width + '.png'), fullPage: true });
      await page.screenshot({ path: path.join(evidence, 'home-' + width + '-first.png') });
    }
    if (width === 390) {
      await page.getByLabel('Menü megnyitása').click();
      assert.ok(await page.getByRole('navigation', { name: 'Mobil navigáció' }).isVisible());
      await page.getByRole('navigation', { name: 'Mobil navigáció' }).getByRole('link', { name: 'Szofi', exact: true }).click();
      assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null);
      report.interactions.push('mobile menu navigation and close');
      const photo = page.locator('[data-photo]').first();
      await photo.click();
      assert.ok(await page.getByRole('dialog').isVisible());
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('dialog').isVisible(), false);
      assert.ok(await photo.evaluate(element => element === document.activeElement));
      report.interactions.push('image enlargement, Escape and focus return');
    }
    await page.locator('.site-foot').scrollIntoViewIfNeeded();
    assert.ok(Math.abs(await page.locator('.site-head').evaluate(element => element.getBoundingClientRect().top)) <= 1, 'Header must remain visible');
    report.views.push({ width, overflow: false, externalRequests: 0, brokenImages: 0, heroThenIntroduction: true });
    await context.close();
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(target, { waitUntil: 'networkidle' });
  const expectedAbout = JSON.parse(await fs.readFile('adatok.json', 'utf8')).siteContent.fooldal.bemutatkozas.bekezdesek.join(' ').replace(/\s+/g, ' ').trim();
  const actualAbout = (await page.locator('.about-body p').allTextContents()).join(' ').replace(/\s+/g, ' ').trim();
  assert.equal(actualAbout, expectedAbout, 'Introduction text must be preserved');
  await page.goto(target + '/arlista/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.price-lines > div').count(), 19);
  const rows = JSON.parse(await fs.readFile('adatok.json', 'utf8')).services;
  const actualPrices = (await page.locator('.price-lines').allTextContents()).join('\n');
  for (const row of rows) assert.ok(actualPrices.includes(row.name) && actualPrices.includes(row.price_text), 'Missing current price: ' + row.name);
  assert.equal((await page.request.get(target + '/supabase/migrations/20261028160120_static_publication.sql')).status(), 404);
  assert.equal((await page.request.get(target + '/a/')).status(), 404);
  report.interactions.push('19 unchanged prices and private/rejected route exclusion');
  await context.close();
  await fs.writeFile(path.join(evidence, 'checks.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, ...report }));
} finally { await browser.close(); }
