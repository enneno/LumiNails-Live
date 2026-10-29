const { test, expect } = require('playwright/test');
const rules = require('../supabase/functions/_shared/house-rules.json');
const serviceId = '00000000-0000-4000-8000-000000000011';
const bookingId = '00000000-0000-4000-8000-000000000012';
const appointment = () => new Date(Date.now() + 3 * 86400000).toISOString();

async function installBoundary(page) {
  await page.route('https://**', route => route.abort());
  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.route('**/adatok.json', route => route.fulfill({ json: {
    schemaVersion: 1, siteContent: {}, phoneVisible: false, services: [{ id: serviceId, name: 'Manikűr', description: 'Manikűr',
      duration_minutes: 60, active: true, booking_enabled: true, price_amount: 5000, price_text: '5 000 Ft', price_unit: 'Ft' }],
  } }));
  await page.addInitScript(({ serviceId, bookingId }) => {
    window.__rulesRequests = [];
    const services = [{ id: serviceId, name: 'Manikűr', description: 'Manikűr', duration_minutes: 60, active: true, booking_enabled: true, price_amount: 5000, price_text: '5 000 Ft', price_unit: 'Ft' }];
    const query = table => {
      const result = { data: table === 'services' ? services : [], error: null };
      const chain = new Proxy({}, { get: (_, key) => key === 'then' ? (resolve, reject) => Promise.resolve(result).then(resolve, reject) : () => chain });
      return chain;
    };
    window.supabase = { createClient: () => ({
      from: query,
      auth: { getSession: async () => ({ data: { session: null } }), getUser: async () => ({ data: { user: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
      rpc: async () => ({ data: [], error: null }),
      functions: { invoke: async (name, options) => {
        window.__rulesRequests.push({ name, body: options.body });
        return { data: { ok: true, booking_id: bookingId, booking_reference: 'LUMI-ABCD', email: { ok: true } }, error: null };
      } },
    }) };
  }, { serviceId, bookingId });
}

test('house rules: standalone page has all supplied sections and no mobile overflow', async ({ page }) => {
  await installBoundary(page);
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: width === 320 ? 740 : 900 });
    await page.goto('/hazirend/');
    await expect(page.getByRole('heading', { name: 'Házirend', exact: true })).toBeVisible();
    await expect(page.locator('[data-house-rules-page] .house-rules-section')).toHaveCount(rules.sections.length);
    for (const section of rules.sections) for (const paragraph of section.paragraphs) await expect(page.locator('[data-house-rules-page]')).toContainText(paragraph);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/house-rules-page-${width}.png` });
  }
});

test('house rules: booking requires an unchecked explicit consent; modal is readable and does not check it', async ({ page }) => {
  await installBoundary(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/foglalas/');
  const consent = page.locator('#foglalas-hazirend');
  await expect(consent).not.toBeChecked();
  const link = page.locator('.house-rules-consent').getByRole('link', { name: 'házirendet', exact: true });
  await link.click();
  const modal = page.getByRole('dialog', { name: 'Házirend', exact: true });
  await expect(modal.locator('.house-rules-section')).toHaveCount(9);
  await expect(modal).toContainText('Allergia/érzékenység');
  expect(await modal.locator('.house-rules-dialog-body').evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  await page.screenshot({ path: '.impeccable/review/house-rules-modal-390.png' });
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
  await expect(link).toBeFocused();
  await expect(consent).not.toBeChecked();
  await page.evaluate(({ serviceId, startsAt }) => {
    const service = document.getElementById('foglalas-szolgatatas'); service.replaceChildren(new Option('Manikűr', serviceId)); service.value = serviceId;
    const date = document.getElementById('foglalas-datum'); date.disabled = false; date.replaceChildren(new Option(startsAt.slice(0, 10), startsAt.slice(0, 10)));
    const time = document.getElementById('foglalas-ido'); time.disabled = false; time.replaceChildren(new Option('10:00', startsAt));
    document.querySelector('input[name="korom-stilus"]').checked = true;
  }, { serviceId, startsAt: appointment() });
  await page.locator('#foglalas-nev').fill('Szintetikus Vendég');
  await page.locator('#foglalas-tel').fill('201234567');
  await page.locator('#foglalas-email').fill('guest@example.test');
  await page.locator('#foglalas-kuldes').click();
  await expect(page.locator('#foglalas-status')).toContainText('fogadd el a házirendet');
  expect(await page.evaluate(() => window.__rulesRequests)).toHaveLength(0);
  await consent.check();
  await page.locator('#foglalas-kuldes').click();
  await expect(page.locator('#foglalas-status')).not.toContainText('Kérlek');
  await expect.poll(() => page.evaluate(() => window.__rulesRequests.length)).toBe(1);
  expect(await page.evaluate(() => window.__rulesRequests[0].body)).toMatchObject({ house_rules_accepted: true, house_rules_version: rules.version });
  await expect(consent).not.toBeChecked();
});

test('house rules: verified-contact cancellation shows only its clause and cannot bypass consent', async ({ page }) => {
  await installBoundary(page);
  let cancelled = false;
  const requests = [];
  await page.route('**/functions/v1/manage-booking', async route => {
    const body = route.request().postDataJSON(); requests.push(body);
    if (body.action === 'cancel') { cancelled = true; return route.fulfill({ json: { ok: true, code: 'cancelled', message: 'Sikeres lemondás.' } }); }
    return route.fulfill({ json: { ok: true, booking: { public_reference: 'LUMI-ABCD', service_name: 'Manikűr', customer_name: 'Szintetikus Vendég',
      starts_at: appointment(), ends_at: appointment(), status: cancelled ? 'cancelled_by_customer' : 'confirmed', can_cancel: !cancelled, cancellation_note_required: false } } });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/foglalas/');
  await page.locator('#foglalas-azonosito').fill('LUMI-ABCD');
  await page.locator('#foglalas-elerhetoseg').fill('guest@example.test');
  const lookup = page.getByRole('button', { name: 'Foglalás lekérése', exact: true });
  await lookup.click();
  const consent = page.locator('#foglalas-lemondas-hazirend');
  await expect(consent).toBeVisible();
  await page.locator('#foglalas-lemondas').click();
  expect(requests.filter(body => body.action === 'cancel')).toHaveLength(0);
  const link = page.locator('#foglalas-ellenorzes-eredmeny').getByRole('link', { name: 'lemondási feltételeket', exact: true });
  await link.click();
  const modal = page.getByRole('dialog', { name: 'Lemondási feltételek', exact: true });
  await expect(modal).toContainText('24 órán belüli lemondás');
  await expect(modal.locator('.house-rules-section')).toHaveCount(1);
  await expect(modal).not.toContainText('Betegség');
  await expect(modal).not.toContainText('legfeljebb 5 perccel');
  await modal.getByRole('button', { name: 'Házirend bezárása', exact: true }).click();
  await expect(consent).not.toBeChecked();
  await consent.check();
  await lookup.click();
  await expect(consent).not.toBeChecked();
  await consent.check();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#foglalas-lemondas').click();
  await expect.poll(() => requests.filter(body => body.action === 'cancel').length).toBe(1);
  expect(requests.find(body => body.action === 'cancel')).toMatchObject({ house_rules_accepted: true, house_rules_version: rules.version });
  await expect(consent).not.toBeVisible();
});
