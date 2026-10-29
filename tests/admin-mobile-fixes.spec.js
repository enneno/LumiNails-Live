const { test, expect } = require('playwright/test');
const { fixtures, installSupabaseBoundaryMock } = require('./helpers/admin-reference-boundary');

async function openAdmin(page, seed = {}) {
  await page.route('https://*.supabase.co/**', route => route.abort('blockedbyclient'));
  await installSupabaseBoundaryMock(page, seed);
  await page.addInitScript(() => Object.defineProperty(navigator, 'standalone', { get: () => true }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/admin/?tab=bookings');
  await expect(page.locator('[data-admin-shell]')).toBeVisible();
  await expect(page.getByText('Adatok betöltése…', { exact: true })).toHaveCount(0);
}

test('mobile fix: dock and menu fit the visible standalone viewport after keyboard and rotation', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.addInitScript(() => {
    window.__visibleAdminHeight = 793;
    Object.defineProperty(window.visualViewport, 'height', { get: () => window.__visibleAdminHeight });
  });
  await openAdmin(page);
  const dock = page.getByRole('navigation', { name: 'Mobil admin eszköztár', exact: true });
  async function expectDockInsideVisibleFrame() {
    await expect(dock).toBeVisible();
    await expect(dock.getByRole('button')).toHaveCount(5);
    await expect.poll(async () => {
      const box = await dock.boundingBox();
      return box.y + box.height;
    }).toBeLessThanOrEqual(await page.evaluate(() => window.visualViewport.height));
  }
  await expectDockInsideVisibleFrame();
  await dock.getByRole('button', { name: 'Továbbiak', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Továbbiak', exact: true });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('button', { name: 'Árlista', exact: true })).toBeVisible();
  await menu.getByRole('button', { name: 'Panel bezárása', exact: true }).click();
  await expect(menu).not.toBeVisible();
  await page.getByRole('searchbox').focus();
  await page.evaluate(() => { window.__visibleAdminHeight = 500; window.visualViewport.dispatchEvent(new Event('resize')); });
  await expect(dock).not.toBeVisible();
  await page.getByRole('searchbox').blur();
  await page.evaluate(() => { window.__visibleAdminHeight = 793; window.visualViewport.dispatchEvent(new Event('resize')); });
  await expectDockInsideVisibleFrame();
  await page.screenshot({ path: '.impeccable/review/mobile-fix-dock-393.png' });
  await page.setViewportSize({ width: 852, height: 393 });
  await page.evaluate(() => { window.__visibleAdminHeight = 349; window.visualViewport.dispatchEvent(new Event('resize')); });
  await expectDockInsideVisibleFrame();
});

test('mobile fix: two fingers zoom the calendar timeline while standalone page zoom stays disabled', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdmin(page);
  await page.getByRole('button', { name: 'Hét', exact: true }).click();
  const calendar = page.locator('[aria-label="Mobil heti foglalási naptár"]:visible');
  const timeline = calendar.locator(':scope > div > div');
  const originalWidth = await timeline.evaluate(element => element.getBoundingClientRect().width);
  async function pinch(from, to) {
    return calendar.evaluate((element, { from, to }) => {
      const scroller = element.firstElementChild;
      const box = scroller.getBoundingClientRect();
      const center = box.left + Math.min(box.width / 2 + 20, box.width - 90);
      // Windows WebKit exposes Touch but does not allow its constructor.
      // Dispatch the same TouchList shape through real bubbling DOM events.
      const touches = distance => [center - distance / 2, center + distance / 2].map((clientX, identifier) => ({
        identifier, target: scroller, clientX, clientY: box.top + 70,
      }));
      const start = touches(from), end = touches(to);
      const emit = (type, active, changed) => {
        active.item = index => active[index] || null;
        changed.item = index => changed[index] || null;
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperties(event, {
          touches: { value: active }, targetTouches: { value: active }, changedTouches: { value: changed },
        });
        return scroller.dispatchEvent(event);
      };
      const nativeStartPrevented = !emit('touchstart', start, start);
      const nativeMovePrevented = !emit('touchmove', end, end);
      emit('touchend', [], end);
      return { nativeStartPrevented, nativeMovePrevented };
    }, { from, to });
  }
  expect(await pinch(100, 180)).toEqual({ nativeStartPrevented: true, nativeMovePrevented: true });
  await expect.poll(() => timeline.evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThan(originalWidth * 1.4);
  const zoomedWidth = await timeline.evaluate(element => element.getBoundingClientRect().width);
  await pinch(180, 90);
  await expect.poll(() => timeline.evaluate(element => element.getBoundingClientRect().width)).toBeLessThan(zoomedWidth * 0.8);
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /maximum-scale=1, user-scalable=no/);
  expect(await page.evaluate(() => window.visualViewport.scale)).toBe(1);
  expect(await page.evaluate(() => window.__adminLastRpc)).toBeUndefined();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.screenshot({ path: '.impeccable/review/mobile-fix-calendar-390.png' });
});

test('mobile fix: online cancellation labels stay distinct and only owner cancellation requests an email', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdmin(page);
  const articles = page.locator('#admin-reference-root main article');
  const customerCancelled = articles.filter({ hasText: 'Farkas Petra' });
  await expect(customerCancelled.getByText('A vendég lemondta · nyugtázás szükséges', { exact: true })).toBeVisible();
  await expect(customerCancelled.getByRole('button', { name: /Farkas Petra foglalási állapota/ })).toContainText('Vendég mondta le');
  await page.evaluate(() => {
    const client = window.supabase.createClient();
    const originalRpc = client.rpc.bind(client), originalInvoke = client.functions.invoke.bind(client.functions);
    window.__testEmailCalls = [];
    client.rpc = async (name, args) => {
      const result = await originalRpc(name, args);
      if (name === 'apply_admin_booking_changes' && window.__testEmailJob) result.data.email_jobs = [window.__testEmailJob];
      return result;
    };
    client.functions.invoke = async (name, options) => {
      window.__testEmailCalls.push({ name, options });
      return originalInvoke(name, options);
    };
    const booking = window.__referenceSeed().bookings.find(row => row.customer_name === 'Toth Luca');
    window.__testEmailJob = { booking_id: booking.id, id: 'synthetic-owner-cancel-email' };
  });
  const ownerCancelled = articles.filter({ hasText: 'Toth Luca' });
  await ownerCancelled.getByRole('button', { name: /Toth Luca foglalási állapota/ }).click();
  await expect(page.getByRole('option', { name: 'Vendég mondta le', exact: true })).toBeVisible();
  await page.getByRole('option', { name: 'Általam lemondva', exact: true }).click();
  await page.locator('[data-admin-save]').click();
  await expect(page.locator('[data-admin-save]')).toHaveCount(0);
  const ownerChange = await page.evaluate(() => window.__adminLastRpc.args.p_changes[0]);
  expect(ownerChange.status).toBe('cancelled');
  expect(ownerChange.email_notification).toMatchObject({ status: 'cancelled', status_changed: true });
  expect(await page.evaluate(() => window.__testEmailCalls.filter(call => call.name === 'send-booking-update-email').length)).toBe(1);
  await page.evaluate(() => { window.__testEmailJob = null; });
  const guestCancelled = articles.filter({ hasText: 'Nagy Anna' });
  await guestCancelled.getByRole('button', { name: /Nagy Anna foglalási állapota/ }).click();
  await page.getByRole('option', { name: 'Vendég mondta le', exact: true }).click();
  await page.locator('[data-admin-save]').click();
  await expect(page.locator('[data-admin-save]')).toHaveCount(0);
  const guestChange = await page.evaluate(() => window.__adminLastRpc.args.p_changes[0]);
  expect(guestChange.status).toBe('cancelled_by_customer');
  expect(guestChange.email_notification).toBeNull();
  expect(await page.evaluate(() => window.__testEmailCalls.filter(call => call.name === 'send-booking-update-email').length)).toBe(1);
  await page.evaluate(() => window.LumiAdminBackend.load('bookings', true));
  await expect(guestCancelled.getByRole('button', { name: /Nagy Anna foglalási állapota/ })).toContainText('Vendég mondta le');
  await expect(ownerCancelled.getByRole('button', { name: /Toth Luca foglalási állapota/ })).toContainText('Általam lemondva');
  await page.screenshot({ path: '.impeccable/review/mobile-fix-cancellation-390.png' });
});


test('full review: overview includes a later appointment today', async ({page}) => {
 const seed=fixtures();seed.bookings=seed.bookings.slice(0,1);seed.bookings[0].starts_at='2026-10-29T09:30:00Z';seed.bookings[0].ends_at='2026-10-29T11:30:00Z';seed.blocked_times=[];
 await page.clock.setFixedTime(new Date('2026-10-29T08:00:00Z'));await page.setViewportSize({width:390,height:844});await openAdmin(page,seed);await page.goto('/admin/?tab=overview');await expect(page.getByRole('button',{name:/^Következő vendég/}).filter({hasText:'Nagy Anna'})).toBeVisible();
});

test('full review: guest swipe and shrinking guest/log pages retain valid records', async ({page}) => {
 const seed=fixtures();seed.admin_registered_customer_profiles=Array.from({length:21},(_,i)=>({...seed.admin_registered_customer_profiles[0],user_id:'synthetic-'+i,customer_name:'Vendeg '+i}));seed.booking_events=Array.from({length:21},(_,i)=>({...seed.booking_events[0],id:'event-'+i,title:'Esemeny '+i}));
 await page.setViewportSize({width:390,height:844});await openAdmin(page,seed);await page.goto('/admin/?tab=guests');await expect(page.getByRole('button',{name:/Vendeg 0 /})).toBeVisible();
 await page.locator('#admin-reference-root main section').evaluate(element=>{const make=x=>Object.assign([{identifier:1,clientX:x,clientY:200}],{item(i){return this[i]}});for(const [type,touches,changed] of [['touchstart',make(300),make(300)],['touchmove',make(150),make(150)],['touchend',[],make(20)]]){const e=new Event(type,{bubbles:true,cancelable:true});Object.defineProperties(e,{touches:{value:touches},changedTouches:{value:changed}});element.dispatchEvent(e);}});
 await expect(page.getByRole('button',{name:/Vendeg 10 /})).toBeVisible();await page.evaluate(async()=>{const seed=window.__referenceSeed();window.__adminReplaceRows('admin_registered_customer_profiles',seed.admin_registered_customer_profiles.slice(0,1));await window.LumiAdminBackend.load('guests',true);});await expect(page.getByRole('button',{name:/Vendeg 0 /})).toBeVisible();
 await page.goto('/admin/?tab=logs');await expect(page.getByRole('heading',{name:'Esemeny 0',exact:true})).toBeVisible();await page.getByRole('button',{name:/Következő oldal/}).click();await expect(page.getByRole('heading',{name:'Esemeny 10',exact:true})).toBeVisible();await page.evaluate(async()=>{const seed=window.__referenceSeed();window.__adminReplaceRows('booking_events',seed.booking_events.slice(0,1));await window.LumiAdminBackend.load('logs',true);});await expect(page.getByRole('heading',{name:'Esemeny 0',exact:true})).toBeVisible();
});

test('full review: LAN clipboard fallback reports both success and failure', async ({page}) => {
 await page.setViewportSize({width:390,height:844});await openAdmin(page);await page.goto('/admin/?tab=logs');await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true});document.execCommand=()=>true;});await page.getByRole('button',{name:'Jelentés másolása',exact:true}).click();await expect(page.getByText('Jelentés másolva.',{exact:true})).toBeVisible();await page.evaluate(()=>document.execCommand=()=>false);await page.getByRole('button',{name:'Jelentés másolása',exact:true}).click();await expect(page.getByText(/A másolás nem sikerült/)).toBeVisible();
});

test('login fits without overscroll but permits scrolling when space is limited',async({page})=>{
 await page.setViewportSize({width:390,height:844});await openAdmin(page);await page.evaluate(()=>window.__adminEmitAuth('SIGNED_OUT',null));const login=page.locator('#admin-reference-root main');await expect(page.locator('#admin-reference-root #admin-password')).toBeVisible();expect(await login.evaluate(e=>({scroll:e.scrollHeight,client:e.clientHeight,overflow:getComputedStyle(e).overflowY}))).toMatchObject({scroll:844,client:844,overflow:'hidden'});await page.setViewportSize({width:390,height:240});await expect.poll(()=>login.evaluate(e=>e.scrollHeight>e.clientHeight)).toBe(true);await login.getByRole('button',{name:'Belépés',exact:true}).scrollIntoViewIfNeeded();await expect(login.getByRole('button',{name:'Belépés',exact:true})).toBeInViewport();
});

test('monthly schedule restores an existing interval without duplicates and rejects invalid times before writes',async({page})=>{
 const seed=fixtures(),month=new Date().toLocaleDateString('sv-SE').slice(0,7),date=month+'-01';seed.availability_windows=[{id:'original-window',work_date:date,start_time:'09:00',end_time:'18:00',slot_step_minutes:20,active:true}];await page.setViewportSize({width:390,height:844});await openAdmin(page,seed);await page.goto('/admin/?tab=schedule');await page.locator('[data-schedule-date="'+date+'"]').click();let dialog=page.locator('dialog[open]');page.once('dialog',d=>d.accept());await dialog.locator('[data-window-id="original-window"]').getByRole('button',{name:/idősáv törlése/}).click();await dialog.getByRole('button',{name:'Bezárás',exact:true}).click();await page.getByRole('button',{name:'Több nap kijelölése',exact:true}).click();await page.locator('[data-schedule-date="'+date+'"]').click();await page.getByRole('button',{name:'1 nap beállítása',exact:true}).click();await dialog.getByRole('button',{name:'Mentés',exact:true}).click();await expect(dialog).not.toBeVisible();expect(await page.evaluate(()=>window.__referenceSeed().availability_windows.map(row=>row.id))).toEqual(['original-window']);
 await page.locator('[data-schedule-date="'+month+'-02"]').click();await dialog.getByRole('button',{name:'+ Új idősáv',exact:true}).click();await dialog.locator('[data-selected-date]').getByLabel('Vége',{exact:true}).fill('08:00');await dialog.getByRole('button',{name:'Mentés',exact:true}).click();await expect(dialog).toBeVisible();expect(await page.evaluate(()=>window.__referenceSeed().availability_windows.length)).toBe(1);expect(await page.evaluate(()=>window.__referenceSeed().bookings)).toEqual(seed.bookings);
});

test('schedule calendar uses the shared mobile and desktop sheets without exposing the long form',async({page})=>{
 const seed=fixtures(),date=new Date().toLocaleDateString('sv-SE');seed.availability_windows=[{id:'test-window',work_date:date,start_time:'09:00',end_time:'18:00',slot_step_minutes:20,active:true}];await page.setViewportSize({width:320,height:900});await openAdmin(page,seed);await page.goto('/admin/?tab=schedule');const main=page.locator('#admin-reference-root main');await expect(main.locator('[data-window-id]')).toHaveCount(0);await expect(main.getByLabel('Közös kezdés')).toHaveCount(0);expect(await page.evaluate(()=>window.__adminLastRpc)).toBeUndefined();for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});await main.locator('[data-schedule-date="'+date+'"]').click();const dialog=page.locator('dialog[open]');await expect(dialog.locator('[data-window-id="test-window"]')).toBeVisible();const box=await dialog.locator(':scope > div').boundingBox();if(width===320)expect(Math.abs(box.y+box.height-900)).toBeLessThan(2);if(width===1440)expect(box.x).toBeGreaterThan(720);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'.impeccable/review/schedule-sheet-'+width+'.png'});await dialog.getByRole('button',{name:'Bezárás',exact:true}).click();await expect(dialog).not.toBeVisible();await page.screenshot({path:'.impeccable/review/schedule-calendar-'+width+'.png'});}expect(await page.evaluate(()=>window.__referenceSeed().availability_windows)).toEqual(seed.availability_windows);
});
