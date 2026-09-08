const { test, expect } = require('playwright/test');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const css = () => fs.readFileSync(path.join(root, 'admin-v2.css'), 'utf8');
const source = () => fs.readFileSync(path.join(root, 'src/admin-styles/20-workspace.css'), 'utf8');
const markup = () => fs.readFileSync(path.join(root, 'admin/index.html'), 'utf8');

test('login layout is owned by the canonical auth panel selector', async () => {
  expect(markup()).toContain('class="admin-fejlec admin-auth-panel"');
  expect(source()).toContain('.admin-body.admin-v2 .admin-auth-panel:not([hidden]) {');
  expect(source()).not.toContain('.admin-body.admin-v2 .admin-login-panel {');
  expect(source()).toContain('--admin-ui-field-height: 44px');
  expect(source()).toContain('--admin-ui-button-height: 44px');
  expect(source()).not.toContain('!important');
});

test('authenticated state hides the login panel on desktop and mobile', async ({ page }) => {
  await page.setContent(`<!doctype html><html><head><style>${css()}</style></head><body class="admin-body admin-v2"><main class="admin-oldal"><section id="admin-bejelentkezes-panel" class="admin-fejlec admin-auth-panel" hidden><div class="admin-auth-content">Bejelentkezés</div></section><div id="admin-tartalom" class="admin-vedett">Irányítópult</div></main></body></html>`);

  const panel = page.locator('#admin-bejelentkezes-panel');
  await expect(panel).toBeHidden();
  expect(await panel.evaluate(element => getComputedStyle(element).display)).toBe('none');
  expect(await panel.boundingBox()).toBeNull();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await panel.evaluate(element => getComputedStyle(element).display)).toBe('none');
  expect(await panel.boundingBox()).toBeNull();
});

test('mobile login is a centered compact card with accessible controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setContent(`<!doctype html><html><head><style>${css()}</style></head><body class="admin-body admin-v2"><main class="admin-oldal"><section id="admin-bejelentkezes-panel" class="admin-fejlec admin-auth-panel"><p class="admin-eyebrow">Lumi Nails admin</p><h1 class="admin-cim">Bejelentkezés</h1><p class="admin-leiras">Az online foglalások és idősávok kezeléséhez jelentkezz be.</p><form class="admin-login-form"><label class="admin-mezo-cimke"><span>Jelszó</span><input class="urlap-mezo" type="password"></label><button class="gomb admin-gomb" type="submit">Belépés</button></form><p class="admin-status"></p></section></main></body></html>`);

  const panel = page.locator('#admin-bejelentkezes-panel');
  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeLessThan(390);
  expect(Math.abs((box.x * 2 + box.width) - 390)).toBeLessThanOrEqual(2);

  const titleSize = parseFloat(await page.locator('.admin-cim').evaluate(el => getComputedStyle(el).fontSize));
  expect(titleSize).toBeLessThanOrEqual(42);
  expect(titleSize).toBeGreaterThanOrEqual(30);

  const inputBox = await page.locator('.urlap-mezo').boundingBox();
  const buttonBox = await page.locator('.admin-gomb').boundingBox();
  expect(inputBox.height).toBeGreaterThanOrEqual(44);
  expect(buttonBox.height).toBeGreaterThanOrEqual(44);
  expect(Math.abs(inputBox.width - buttonBox.width)).toBeLessThanOrEqual(1);
});
