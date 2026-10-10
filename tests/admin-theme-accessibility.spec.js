const { test, expect } = require('playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Share the established isolated fixture without exposing real client data or writing remotely.
const source = fs.readFileSync(path.join(__dirname, 'admin-production-redesign.spec.js'), 'utf8');
const fixture = vm.createContext({ require, console, process, setTimeout, clearTimeout, URL });
vm.runInContext(source.slice(0, source.indexOf("test.describe('production admin redesign'")), fixture);

for (const theme of ['light', 'dark']) {
  test(`authenticated dashboard contrast: ${theme}, desktop and phone`, async ({ page }, testInfo) => {
    await fixture.openAdmin(page, { width: 1440, height: 1000 });
    await page.evaluate(theme => document.documentElement.dataset.adminTheme = theme, theme);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      const report = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      await testInfo.attach(`${theme}-${width}-contrast`, { body: Buffer.from(JSON.stringify(report.violations)), contentType: 'application/json' });
      expect(report.violations).toEqual([]);
    }
  });
}
