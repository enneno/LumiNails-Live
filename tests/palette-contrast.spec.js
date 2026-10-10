const { test, expect } = require('playwright/test');
const fs = require('node:fs');
const path = require('node:path');

test('public beige actions and selected booking options stay readable, including hover', async ({ page }) => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
  await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body>
    <main>
      <button class="gomb" id="primary">Foglalás</button>
      <nav class="menu-pontok"><a href="#">Kezdőlap</a><a id="nav-action" href="#">Foglalás</a></nav>
      <button class="foglalas-valaszto-kartya aktiv" id="selected">Kiválasztott szolgáltatás</button>
      <section class="seo-szolgaltatas-zaras"><button class="gomb" id="service-action">Időpontot foglalok</button></section>
    </main>
  </body></html>`);

  for (const selector of ['#primary', '#nav-action', '#selected', '#service-action']) {
    for (const state of ['default', 'hover']) {
      if (state === 'hover') {
        await page.locator(selector).hover();
        await page.waitForTimeout(250);
      } else {
        await page.mouse.move(0, 0);
      }
      const ratio = await page.locator(selector).evaluate(element => {
        const luminance = color => {
          const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
            const channel = value / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          });
          return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        };
        const style = getComputedStyle(element);
        const values = [luminance(style.color), luminance(style.backgroundColor)];
        return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
      });
      expect(ratio, `${selector} ${state}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});

test('booking enclosure stays flat while selectable controls retain their affordance', async ({ page }) => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body>
      <main class="foglalas-oldal">
        <a class="foglalas-ut-kartya" href="#form">Kapcsolat</a>
        <section class="foglalas-asszisztens-szekcio" id="form">
          <section class="foglalas-lepes">
            <button class="foglalas-valaszto-kartya aktiv">Választott szolgáltatás</button>
            <div class="foglalas-osszefoglalo">Foglalás összegzése</div>
          </section>
        </section>
      </main>
    </body></html>`);
    for (const selector of ['.foglalas-ut-kartya', '.foglalas-asszisztens-szekcio', '.foglalas-lepes', '.foglalas-osszefoglalo']) {
      await expect(page.locator(selector)).toHaveCSS('box-shadow', 'none');
      await expect(page.locator(selector)).toHaveCSS('border-radius', '0px');
      await expect(page.locator(selector)).toHaveCSS('border-left-width', '0px');
      await expect(page.locator(selector)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    }
    await expect(page.locator('.foglalas-lepes')).toHaveCSS('overflow', 'visible');
    await expect(page.locator('.foglalas-valaszto-kartya')).toHaveCSS('background-color', 'rgb(226, 217, 208)');
  }
});
