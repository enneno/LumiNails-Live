const { test, expect } = require('playwright/test');
const fs = require('fs');

test('full studio create: the same manual editor opens from desktop and mobile',async({page})=>{
    const errors=await openAdmin(page,{width:1440,height:1000});
    await page.locator('.studio-desktop-create').click();
    const sheet=page.locator('dialog.admin-editor-sheet[open]');
    await expect(sheet.locator('#admin-tiltas-form')).toBeVisible();
    await expect(page.locator('.admin-workspace-main')).toHaveCSS('overflow','hidden');
    await sheet.locator('#admin-tiltas-datum').fill('2026-11-20');
    await page.keyboard.press('Escape');await expect(sheet).toHaveCount(0);
    await expect(page.locator('.admin-workspace-main')).toHaveCSS('overflow','auto');
    await page.setViewportSize({width:390,height:844});
    await page.locator('.admin-v2-mobile-dock [data-studio-new]').click();
    await expect(sheet.locator('#admin-tiltas-form')).toBeVisible();
    await expect(sheet.locator('#admin-tiltas-datum')).toHaveValue('2026-11-20');
    await page.keyboard.press('Escape');await expect(sheet).toHaveCount(0);
    expect(errors).toEqual([]);
});

for(const width of [390,768,1440]){
    test(`full studio card verdict: ${width}`,async({page})=>{
        await openAdmin(page,{width,height:1000});
        await page.locator(`${width<1024?'.admin-v2-mobile-dock':'.admin-sidebar'} [data-admin-v2-nav="foglalasok"]`).click();
        const row=page.locator('#admin-foglalas-lista .admin-foglalas-fosor').first();
        const geometry=await row.evaluate(row=>{const time=row.querySelector('.admin-foglalas-idopont').getBoundingClientRect(),details=row.querySelector('.admin-foglalas-nev-blokk').getBoundingClientRect();return{gap:details.left-time.right,grow:getComputedStyle(row.querySelector('.admin-foglalas-nev-blokk')).flexGrow};});
        expect(geometry.grow).toBe('1');expect(geometry.gap).toBeLessThanOrEqual(17);
        await page.screenshot({path:`.impeccable/review/admin-full-bookings-${width}.png`});
    });
}

test('full studio content: conflicts, auth refresh and saved/publication states remain separate',async({page})=>{
    await openAdmin(page,{width:1440,height:1000});
    await page.locator('.admin-sidebar [data-admin-v2-nav="weboldal"]').click();
    await page.locator('[data-cms-section]').first().click();
    const sheet=page.locator('dialog.admin-editor-sheet[open]');
    const field=sheet.locator('input[data-cms-path]:not([type="checkbox"]):not([type="hidden"])').first();
    await field.fill('Kizárólag helyi tesztadat');
    const reads=await page.evaluate(()=>window.__adminReads.filter(table=>table==='site_settings').length);
    await page.evaluate(()=>{window.__adminEmitAuth('TOKEN_REFRESHED');window.__adminSaveConflict=true;});
    await expect(field).toHaveValue('Kizárólag helyi tesztadat');
    expect(await page.evaluate(()=>window.__adminReads.filter(table=>table==='site_settings').length)).toBe(reads);
    await sheet.locator('[data-editor-save]').click();
    await expect(sheet.locator('.admin-editor-sheet-status')).toContainText('közben módosult');
    await page.evaluate(()=>{window.__adminSaveConflict=false;});
    await sheet.locator('[data-editor-save]').click();
    await expect(sheet.locator('.admin-editor-sheet-status')).toContainText('mentve');
    await expect(page.locator('#admin-publication-status')).toHaveAttribute('data-publication-state','pending');
    await page.keyboard.press('Escape');await expect(sheet).toHaveCount(0);
    await page.locator('[data-studio-refresh]').click();
    await page.locator('[data-cms-section]').first().click();
    await expect(field).toHaveValue('Kizárólag helyi tesztadat');
});

for (const width of [390, 768, 1440]) {
    test(`full studio: reference structure and core flows at ${width}`, async ({ page }) => {
        fs.mkdirSync('.impeccable/review', { recursive: true });
        const errors = await openAdmin(page, { width, height: 1000 });
        const capture = async name => page.screenshot({ path: `.impeccable/review/admin-full-${name}-${width}.png` });
        const nav = async group => {
            if(width < 1024){
                const direct=page.locator(`.admin-v2-mobile-dock [data-admin-v2-nav="${group}"]`);
                if(await direct.count()) await direct.click();
                else { await page.getByRole('button',{name:'További menüpontok',exact:true}).click(); if(group==='arlista'){await expect(page.locator('dialog[open]')).not.toHaveAttribute('data-entering','');await capture('more');} await page.locator(`.admin-studio-more [data-admin-v2-nav="${group}"]`).click(); await expect(page.locator('dialog[open]')).toHaveCount(0); }
            }else await page.locator(`.admin-sidebar [data-admin-v2-nav="${group}"]`).click();
        };
        await expect(page.getByRole('heading',{name:'A szalon ma',exact:true})).toBeVisible();
        await expect(page.locator('[data-studio-revenue-week]')).toContainText('Ft');
        await capture('overview');
        await page.locator('.admin-workspace-main').evaluate(element=>element.scrollTop=element.scrollHeight);
        await capture('statistics');
        await page.locator('.admin-workspace-main').evaluate(element=>element.scrollTop=0);
        await nav('foglalasok');
        await capture('bookings');
        await page.locator('[data-foglalas-nezet="naptar"]').click();
        await capture('month');
        await page.locator('[data-foglalas-nezet="het"]').click();
        await expect(page.locator('#admin-studio-week')).toBeVisible();
        await expect(page.locator('.studio-week-day-heading')).toHaveCount(7);
        await capture('week');
        const event=page.locator('.studio-week-event:visible, .studio-mobile-week-event:visible').first();
        if(await event.count()){
            await event.click();
            await expect(page.locator('dialog.admin-editor-sheet[open]')).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(page.locator('dialog[open]')).toHaveCount(0);
        }
        await nav('munkaido');
        await expect(page.locator('.studio-schedule-day')).toHaveCount(7);
        await capture('schedule');
        await page.locator('.studio-schedule-day').first().click();
        await expect(page.locator('dialog.admin-editor-sheet[open]')).toBeVisible();
        await expect(page.locator('dialog[open]')).not.toHaveAttribute('data-entering','');
        await capture('day-editor');
        await page.keyboard.press('Escape');
        await expect(page.locator('dialog[open]')).toHaveCount(0);
        await nav('arlista');
        await expect(page.locator('#admin-szolgaltatas-lista .admin-db-kartya')).toHaveCount(4);
        await capture('prices');
        await nav('weboldal');
        await capture('content');
        await nav('galeria');
        await expect(page.locator('#admin-cms-root')).toHaveAttribute('data-lumi-cms-gallery-context','images');
        await capture('gallery');
        await nav('kuponok');
        await capture('coupons');
        await nav('beallitasok');
        await capture('settings');
        await page.locator('[data-admin-v2-dark-mode]').check();
        await nav('attekintes');
        await capture('dark');
        expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
        expect(errors).toEqual([]);
    });
}

test('full studio: capture source reference without connecting its backend', async ({ page }) => {
    const root='local-backups/admin-studio/reference';
    await page.route('**/__studio-reference', route=>route.fulfill({contentType:'text/html',body:fs.readFileSync(`${root}/index.html`)}));
    for(const file of ['script.js','script.css','reference.css']) await page.route(`**/${file}`,route=>route.fulfill({contentType:file.endsWith('.js')?'text/javascript':'text/css',body:fs.readFileSync(`${root}/${file}`)}));
    await page.goto('/__studio-reference');
    await page.getByRole('heading',{name:'A szalon ma'}).waitFor();
    for(const width of [390,1440]) {await page.setViewportSize({width,height:1000});await page.screenshot({path:`.impeccable/review/admin-source-overview-${width}.png`});}
});

test('full studio: saves booking and date availability through the existing boundaries in PWA', async ({ page }) => {
    const errors=await openAdmin(page,{width:390,height:844},{standalone:true});
    const go=async group=>{const direct=page.locator(`.admin-v2-mobile-dock [data-admin-v2-nav="${group}"]`);if(await direct.count())await direct.click();else{await page.getByRole('button',{name:'További menüpontok',exact:true}).click();await page.locator(`.admin-studio-more [data-admin-v2-nav="${group}"]`).click();await expect(page.locator('dialog[open]')).toHaveCount(0);}};
    await expect(page.locator('.admin-v2-mobile-dock')).toBeVisible();
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content',/user-scalable=no/);
    await go('foglalasok');
    const card=page.locator('#admin-foglalas-lista .admin-foglalas-kartya').filter({hasText:'Nagy Anna'});
    await card.locator('[data-foglalas-szerkesztes]').click();
    const sheet=page.locator('dialog.admin-editor-sheet[open]');
    await sheet.locator('[data-idopont-mezo="paid_amount"]').fill('7500');
    await sheet.locator('[data-editor-save]').click();
    await expect.poll(()=>page.evaluate(()=>window.__adminLastRpc?.args?.p_changes?.some(item=>item.paid_amount===7500))).toBe(true);
    await expect(sheet).toHaveCount(0);
    await card.locator('[data-foglalas-szerkesztes]').click();
    await expect(sheet.locator('[data-idopont-mezo="paid_amount"]')).toHaveValue('7500');
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await go('munkaido');
    const day=page.locator('.studio-schedule-day').first();
    const date=await day.getAttribute('data-studio-schedule-day');
    await day.click();
    await sheet.locator('[data-day-start]').fill('08:30');
    await sheet.locator('[data-day-end]').fill('17:00');
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await day.click();
    expect(errors).toEqual([]);
    await expect(sheet.locator('[data-day-start]')).toHaveValue('08:30');
    await sheet.locator('[data-editor-save]').click();
    await expect(sheet).toHaveCount(0);
    await expect(page.locator(`.studio-schedule-day[data-studio-schedule-day="${date}"]`)).toContainText('08:30–17:00');
    await day.click();
    await sheet.locator('[data-mezo="start_time"]').fill('09:15');
    await sheet.locator('[data-editor-save]').click();
    await expect(sheet).toHaveCount(0);
    await expect(day).toContainText('09:15–17:00');
    await page.screenshot({path:'.impeccable/review/admin-full-populated-schedule-pwa-390.png'});
    await go('galeria');
    await expect(page.locator('#admin-cms-root')).toHaveAttribute('data-lumi-cms-gallery-context','images');
    await expect(page.locator('.cms-gallery-editor')).toBeVisible();
    await go('weboldal');
    await expect(page.locator('#admin-cms-root')).not.toHaveAttribute('data-lumi-cms-gallery-context','images');
    expect(errors).toEqual([]);
});

function isoAt(dayOffset, hour, minute = 0) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
}

function dateKey(dayOffset) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function fixtures() {
    return {
        bookings: [
            {
                id: '00000000-0000-4000-8000-000000000001',
                public_reference: 'LUMI-DEMO1',
                customer_name: 'Nagy Anna',
                customer_phone: '+36 30 111 2233',
                customer_email: 'anna.nagy@example.test',
                note: 'Francia kormot szeretne.',
                starts_at: isoAt(0, 10),
                ends_at: isoAt(0, 12),
                status: 'confirmed',
                created_at: isoAt(-4, 12),
                paid_amount: 6500,
                coupon_code: '',
                coupon_title: '',
                nail_style: 'Francia',
                nail_style_note: '',
                inspiration_images: [],
                services: { name: 'Erositett gel lakk', price_text: '6 500 Ft' }
            },
            {
                id: '00000000-0000-4000-8000-000000000002',
                public_reference: 'LUMI-DEMO2',
                customer_name: 'Kiss Dorka',
                customer_phone: '+36 20 222 3344',
                customer_email: 'dorka.kiss@example.test',
                note: '',
                starts_at: isoAt(0, 14),
                ends_at: isoAt(0, 16),
                status: 'pending',
                created_at: isoAt(-1, 16),
                coupon_code: 'UJ10',
                coupon_title: 'Uj vendeg kedvezmeny',
                nail_style: 'Mandula',
                nail_style_note: '',
                inspiration_images: [],
                services: { name: 'Mukorom toltes - M', price_text: '8 000 Ft' }
            },
            {
                id: '00000000-0000-4000-8000-000000000003',
                public_reference: 'LUMI-DEMO3',
                customer_name: 'Toth Luca',
                customer_phone: '+36 70 333 4455',
                customer_email: 'luca.toth@example.test',
                note: '',
                starts_at: isoAt(1, 9),
                ends_at: isoAt(1, 11),
                status: 'confirmed',
                created_at: isoAt(-2, 11),
                coupon_code: '',
                coupon_title: '',
                nail_style: 'Kocka',
                nail_style_note: '',
                inspiration_images: [],
                services: { name: 'Gel lakk', price_text: '5 500 Ft' }
            },
            {
                id: '00000000-0000-4000-8000-000000000004',
                public_reference: 'LUMI-DEMO4',
                customer_name: 'Farkas Petra',
                customer_phone: '+36 30 444 5566',
                customer_email: 'petra.farkas@example.test',
                note: 'Korabbi vendeglemondas.',
                starts_at: isoAt(2, 13),
                ends_at: isoAt(2, 15),
                status: 'cancelled_by_customer',
                created_at: isoAt(-3, 13),
                coupon_code: '',
                coupon_title: '',
                nail_style: '',
                nail_style_note: '',
                inspiration_images: [],
                services: { name: 'Epites - S', price_text: '9 000 Ft' }
            }
        ],
        admin_registered_customer_profiles: [
            { user_id: 'customer-anna', customer_name: 'Nagy Anna', customer_email: 'anna.nagy@example.test', customer_phone: '+36 30 111 2233' },
            { user_id: 'customer-dorka', customer_name: 'Kiss Dorka', customer_email: 'dorka.kiss@example.test', customer_phone: '+36 20 222 3344' },
            { user_id: 'customer-luca', customer_name: 'Toth Luca', customer_email: 'luca.toth@example.test', customer_phone: '+36 70 333 4455' },
            { user_id: 'customer-petra', customer_name: 'Farkas Petra', customer_email: 'petra.farkas@example.test', customer_phone: '+36 30 444 5566' }
        ],
        blocked_times: [
            {
                id: '00000000-0000-4000-8000-000000000100',
                starts_at: isoAt(0, 8),
                ends_at: isoAt(0, 9),
                reason: 'Adminisztracio',
                service_id: 'service-1',
                services: { name: 'Erositett gel lakk', description: '', price_text: '6 500 Ft', duration_minutes: 120 },
                status: 'active',
                created_at: isoAt(-1, 9)
            },
            {
                id: '00000000-0000-4000-8000-000000000101',
                starts_at: isoAt(3, 12),
                ends_at: isoAt(3, 14),
                reason: 'Szemelyes program',
                status: 'active',
                created_at: isoAt(-1, 10)
            }
        ],
        booking_events: [
            {
                id: 'event-1',
                booking_id: '00000000-0000-4000-8000-000000000001',
                event_type: 'confirmation_email',
                channel: 'email',
                status: 'success',
                title: 'Foglalas visszaigazolva',
                message: 'A visszaigazolo email sikeresen elkuldve.',
                metadata: {},
                created_at: isoAt(0, 10)
            },
            {
                id: 'event-2',
                booking_id: '00000000-0000-4000-8000-000000000002',
                event_type: 'booking_email',
                channel: 'email',
                status: 'failed',
                title: 'Email kuldesi hiba',
                message: 'A level kuldese sikertelen, ujraprobalas szukseges.',
                metadata: {},
                created_at: isoAt(0, 11)
            },
            {
                id: 'event-3',
                booking_id: '00000000-0000-4000-8000-000000000004',
                event_type: 'customer_cancelled',
                channel: 'system',
                status: 'success',
                title: 'Vendeg lemondta',
                message: 'Csaladi program miatt.',
                metadata: { cancellation_note: 'Csaladi program miatt.' },
                created_at: isoAt(0, 12)
            }
        ],
        services: [
            {
                id: 'service-1',
                name: 'Erositett gel lakk',
                category: 'Gel lakk',
                price_text: '6 500 Ft',
                price_amount: 6500,
                price_unit: 'Ft',
                duration_minutes: 120,
                active: true,
                sort_order: 1
            },
            {
                id: 'service-2',
                name: 'Mukorom toltes - M',
                category: 'Toltes',
                price_text: '8 000 Ft',
                price_amount: 8000,
                price_unit: 'Ft',
                duration_minutes: 120,
                active: true,
                sort_order: 2
            },
            {
                id: 'service-3',
                name: 'Díszítés - Francia',
                description: 'Francia',
                price_text: '1 000 Ft / db',
                price_amount: 1000,
                price_unit: 'Ft / db',
                duration_minutes: 15,
                active: true,
                sort_order: 3
            },
            {
                id: 'service-4',
                name: 'Díszítés - Kövek',
                description: 'Kövek',
                price_text: '500-800 Ft / db',
                price_amount: null,
                price_unit: 'Ft / db',
                duration_minutes: 15,
                active: true,
                sort_order: 4
            }
        ],
        coupons: [
            {
                id: 'coupon-1',
                code: 'UJ10',
                title: 'Uj vendeg kedvezmeny',
                description: '10% kedvezmeny elso alkalommal.',
                discount_type: 'percent',
                discount_value: 10,
                discount_basis: 'total',
                active: true,
                starts_at: isoAt(-30, 0),
                ends_at: isoAt(30, 23),
                sort_order: 1
            },
            {
                id: 'coupon-2',
                code: 'SZOLG1000',
                title: 'Szolgáltatás kedvezmény',
                description: '1 000 Ft kedvezmény az alapszolgáltatásból.',
                discount_type: 'fixed',
                discount_value: 1000,
                discount_basis: 'service',
                active: true,
                sort_order: 2
            },
            {
                id: 'coupon-3',
                code: 'DISZ50',
                title: 'Díszítés kedvezmény',
                description: '50% kedvezmény a díszítésekből.',
                discount_type: 'percent',
                discount_value: 50,
                discount_basis: 'decoration',
                active: true,
                sort_order: 3
            }
        ],
        availability_windows: [
            {
                id: 'window-1',
                work_date: dateKey(7),
                starts_at: isoAt(7, 9),
                ends_at: isoAt(7, 17),
                active: true
            },
            {
                id: 'window-2',
                work_date: dateKey(30),
                starts_at: isoAt(30, 9),
                ends_at: isoAt(30, 17),
                active: true
            }
        ],
        site_settings: [
            { key: 'phone_visible', value: { visible: true } },
            { key: 'site_content', value: {} }
        ]
    };
}

async function installSupabaseBoundaryMock(page) {
    const data = fixtures();

    await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({
        status: 200,
        contentType: 'text/javascript; charset=utf-8',
        body: ''
    }));
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({
        status: 200,
        contentType: 'text/css; charset=utf-8',
        body: ''
    }));

    await page.addInitScript((seed) => {
        const clone = (value) => JSON.parse(JSON.stringify(value));
        window.__adminReads = [];
        window.__adminRpcs = [];
        const authListeners = [];

        class Query {
            constructor(table) {
                this.table = table;
                this.filters = [];
                this.singleResult = false;
            }

            select() { return this; }
            order() { return this; }
            limit() { return this; }
            range() { return this; }
            abortSignal() { return this; }
            throwOnError() { return this; }
            insert(values) {
                const records = (Array.isArray(values) ? values : [values]).map((value, index) => {
                    const record = clone(value);
                    if (!record.id) record.id = `mock-${this.table}-${Date.now()}-${index}`;
                    if (this.table === 'blocked_times' && record.service_id) {
                        const service = seed.services.find(item => item.id === record.service_id);
                        if (service) record.services = clone(service);
                    }
                    return record;
                });
                seed[this.table] = [...(seed[this.table] || []), ...records];
                window.__adminLastInsert = clone({ table: this.table, values });
                return this;
            }
            update(value) { this.patch = clone(value); return this; }
            upsert(values, options = {}) {
                for (const value of Array.isArray(values) ? values : [values]) {
                    const keys = (options.onConflict || 'id').split(',');
                    const row = (seed[this.table] || []).find(row => keys.every(key => row[key] === value[key]));
                    if (row) Object.assign(row, clone(value));
                    else this.insert(value);
                }
                return this;
            }
            delete() { this.deleting=true;return this; }

            eq(key, value) {
                this.filters.push(row => String(row?.[key]) === String(value));
                return this;
            }

            neq(key, value) {
                this.filters.push(row => String(row?.[key]) !== String(value));
                return this;
            }

            in(key, values) {
                this.filters.push(row => values.map(String).includes(String(row?.[key])));
                return this;
            }

            is(key, value) {
                this.filters.push(row => row?.[key] === value);
                return this;
            }

            gte(key, value) {
                this.filters.push(row => String(row?.[key] || '') >= String(value));
                return this;
            }

            lte(key, value) {
                this.filters.push(row => String(row?.[key] || '') <= String(value));
                return this;
            }

            gt(key, value) {
                this.filters.push(row => String(row?.[key] || '') > String(value));
                return this;
            }

            lt(key, value) {
                this.filters.push(row => String(row?.[key] || '') < String(value));
                return this;
            }

            or() { return this; }
            not() { return this; }
            contains() { return this; }

            single() {
                this.singleResult = true;
                return this;
            }

            maybeSingle() {
                this.singleResult = true;
                return this;
            }

            execute() {
                if (this.patch) {
                    for (const row of seed[this.table] || []) if (this.filters.every(filter => filter(row))) Object.assign(row, this.patch);
                    this.patch = null;
                }
                if(this.deleting){window.__adminLastDelete={table:this.table};seed[this.table]=(seed[this.table]||[]).filter(row=>!this.filters.every(filter=>filter(row)));this.deleting=false;}
                let rows = clone(seed[this.table] || []);
                for (const filter of this.filters) rows = rows.filter(filter);
                return {
                    data: this.singleResult ? (rows[0] || null) : rows,
                    error: null,
                    count: rows.length
                };
            }

            then(resolve, reject) {
                return Promise.resolve(this.execute()).then(resolve, reject);
            }
        }

        const session = {
            access_token: 'demo-access-token',
            user: { id: 'admin-demo', email: 'admin@example.test' }
        };

        const client = {
            auth: {
                getSession: async () => ({ data: { session }, error: null }),
                onAuthStateChange: callback => {
                    authListeners.push(callback);
                    return { data: { subscription: { unsubscribe() {} } } };
                },
                signInWithPassword: async () => ({ data: { session }, error: null }),
                signOut: async () => ({ error: null }),
                updateUser: async () => ({ data: { user: session.user }, error: null })
            },
            from: table => { window.__adminReads.push(table); return new Query(table); },
            rpc: async (name, args) => {
                window.__adminRpcs.push({ name, args: clone(args || {}) });
                if (name === 'save_public_site_content') {
                    if (window.__adminSaveConflict) return { data: null, error: { code: '40001' } };
                    const version = '2026-10-28T12:00:00+00:00';
                    const row = seed.site_settings.find(item => item.key === 'site_content');
                    row.value = clone(args.p_content); row.updated_at = version;
                    return { data: version, error: null };
                }
                if (name === 'is_lumi_admin') {
                    return { data: true, error: null };
                }
                if (name === 'save_public_services') {
                    if (window.__adminServicesConflict) return { data: null, error: { code: '40001' } };
                    for (const item of args.p_items) {
                        const row = seed.services.find(service => service.id === item.id);
                        if (row) Object.assign(row, clone(item.payload));
                    }
                    return { data: [], error: null };
                }
                if (name === 'admin_registered_customer_profiles') {
                    return { data: clone(seed.admin_registered_customer_profiles), error: null };
                }
                if (name === 'apply_admin_booking_changes') {
                    window.__adminLastRpc = clone({ name, args });
                    for (const change of args?.p_changes || []) {
                        const rows = change.type === 'blocked' ? seed.blocked_times : seed.bookings;
                        const row = rows.find(item => item.id === change.id);
                        if (!row) continue;
                        row.status = change.status;
                        row.starts_at = change.starts_at;
                        row.ends_at = change.ends_at;
                        row.paid_amount = change.paid_amount;
                        if (change.type === 'blocked') row.reason = change.reason;
                    }
                    return { data: { email_jobs: [] }, error: null };
                }
                return { data: [], error: null };
            },
            functions: {
                invoke: async (_name, options) => ({ data: { ok: true, published: false, state: options?.body?.action === 'status' ? 'unpublished' : 'pending' }, error: null })
            },
            storage: {
                from: () => ({
                    list: async () => ({ data: [], error: null }),
                    upload: async () => ({ data: {}, error: null }),
                    remove: async () => ({ data: [], error: null }),
                    createSignedUrl: async () => ({ data: { signedUrl: '' }, error: null })
                })
            }
        };

        window.supabase = { createClient: () => client };
        window.__adminEmitAuth = event => authListeners.forEach(callback => callback(event, session));
    }, data);
}

async function openAdmin(page, viewport, { standalone = false } = {}) {
    await page.setViewportSize(viewport);
    if (standalone) {
        await page.addInitScript(() => {
            Object.defineProperty(window.navigator, 'standalone', {
                configurable: true,
                value: true
            });
        });
    }
    const browserErrors = [];
    page.on('pageerror', error => browserErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') browserErrors.push(message.text());
    });

    await installSupabaseBoundaryMock(page);
    const response = await page.goto('/admin/', { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBeLessThan(400);
    await expect(page.locator('#admin-tartalom')).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/admin-v2/);
    await expect(page.locator('#admin-v2-stat-today')).toHaveText('3');

    return browserErrors;
}

async function collectAdminHeadingTops(page) {
    const groups = ['attekintes', 'foglalasok', 'arkalkulator', 'vendegek', 'munkaido', 'weboldal', 'kommunikacio', 'beallitasok'];
    return page.evaluate(async groupsToMeasure => {
        const result = {};
        for (const group of groupsToMeasure) {
            const button = document.querySelector(`.admin-sidebar [data-admin-v2-nav="${group}"]`);
            if (!button) throw new Error(`Missing admin navigation for ${group}`);
            button.click();
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const heading = document.querySelector('.admin-db-panel.aktiv > .admin-v2-page-heading');
            if (!heading) throw new Error(`Missing active page heading for ${group}`);
            result[group] = heading.getBoundingClientRect().top;
        }
        return result;
    }, groups);
}

function expectHeadingTopsAligned(tops) {
    const values = Object.values(tops);
    expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
}

for (const width of [390, 768, 1440]) {
    test(`studio reference: editor flow at ${width}px`, async ({ page }) => {
        fs.mkdirSync('local-backups/admin-studio', { recursive: true });
        const errors = await openAdmin(page, { width, height: 1000 });
        const go = async group => {
            if (width <= 900) {
                const dock = page.locator(`.admin-v2-mobile-dock [data-admin-v2-nav="${group}"]`);
                if (await dock.count()) { await dock.click(); return; }
                await page.getByRole('button', { name: 'További menüpontok', exact: true }).click();
            }
            await page.locator(`.admin-v2-sidebar .admin-v2-nav-item[data-admin-v2-nav="${group}"]`).click();
        };
        await page.screenshot({ path: `local-backups/admin-studio/overview-${width}.png` });
        await go('weboldal');
        await expect(page.locator('.cms-section-index')).toBeVisible();
        await page.locator('[data-cms-section]').first().click();
        const dialog = page.locator('dialog.admin-editor-sheet[open]');
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('h2')).toBeFocused();
        const field = dialog.locator('input[data-cms-path]:not([type="checkbox"]):not([type="hidden"])').first();
        await field.fill('Helyi szerkesztési próba');
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await page.locator('[data-cms-section]').first().click();
        await expect(field).toHaveValue('Helyi szerkesztési próba');
        await dialog.locator('[data-editor-save]').click();
        await expect(dialog.locator('.admin-editor-sheet-status')).toContainText('mentve');
        await page.screenshot({ path: `local-backups/admin-studio/content-${width}.png` });
        await dialog.locator('[data-editor-close]').click();
        await expect(dialog).toHaveCount(0);
        await page.locator('#admin-panel-szovegek [data-admin-v2-panel="szolgaltatasok"]').click();
        const first = page.locator('#admin-szolgaltatas-lista .admin-db-kartya').first();
        await first.locator('[data-admin-kartya-toggle]').click();
        await expect(dialog).toBeVisible();
        await expect(dialog).not.toHaveAttribute('data-entering', '');
        await dialog.locator('[data-mezo="price_amount"]').fill('7200');
        await page.screenshot({ path: `local-backups/admin-studio/price-${width}.png` });
        const geometry = await dialog.locator('.admin-editor-sheet-body').boundingBox();
        expect(geometry.x).toBeGreaterThanOrEqual(0);
        expect(geometry.x + geometry.width).toBeLessThanOrEqual(width + 1);
        expect(await dialog.locator('.admin-editor-sheet-content').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
        await dialog.locator('[data-editor-save]').click();
        await expect.poll(() => page.evaluate(() => window.__adminRpcs.filter(call => call.name === 'save_public_services').length)).toBe(1);
        await expect(dialog).toHaveCount(0);
        await first.locator('[data-admin-kartya-toggle]').click();
        await expect(dialog.locator('[data-mezo="price_amount"]')).toHaveValue('7200');
        await expect(dialog).not.toHaveAttribute('data-entering', '');
        if (width === 390) {
            const header = await dialog.locator('header').boundingBox();
            await page.mouse.move(header.x + 30, header.y + 25);
            await page.mouse.down();
            await page.mouse.move(header.x + 30, header.y + 180, { steps: 8 });
            await page.mouse.up();
        } else await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await expect(first.locator('[data-admin-kartya-toggle]')).toBeFocused();
        await go('foglalasok');
        const booking = page.locator('#admin-foglalas-lista .admin-foglalas-kartya').first();
        await booking.locator('[data-foglalas-szerkesztes]').click();
        await expect(dialog.locator('[data-idopont-mezo="date"]')).toBeEnabled();
        await expect(dialog).not.toHaveAttribute('data-entering', '');
        await expect(dialog.locator('[data-foglalas-statusz]')).toBeVisible();
        await page.screenshot({ path: `local-backups/admin-studio/booking-${width}.png` });
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await go('beallitasok');
        await page.locator('[data-admin-v2-dark-mode]').check();
        await go('weboldal');
        await page.screenshot({ path: `local-backups/admin-studio/dark-${width}.png` });
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
        expect(errors).toEqual([]);
    });
}

test('studio reference: gallery, nested preview and standalone preserve their controls', async ({ page }) => {
    const errors = await openAdmin(page, { width: 390, height: 844 }, { standalone: true });
    await page.evaluate(() => document.querySelector('.admin-sidebar [data-admin-v2-nav="weboldal"]').click());
    await page.locator('[data-cms-section]').nth(2).click();
    const sheet = page.locator('dialog.admin-editor-sheet[open]');
    const preview = sheet.locator('.cms-image-preview').first();
    await preview.evaluate(node => {
        node.innerHTML = '<img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2280%22%3E%3Crect width=%2260%22 height=%2280%22 fill=%22%23d9aaa7%22/%3E%3C/svg%3E" alt="Helyi tesztkép">';
    });
    await expect(preview).toHaveAttribute('role', 'button');
    const imageGroup = preview.locator('xpath=ancestor::details[1]');
    if (await imageGroup.count() && await imageGroup.getAttribute('open') === null) await imageGroup.locator('summary').click();
    await preview.click();
    await expect(page.locator('#cms-image-lightbox')).toBeVisible();
    await expect(page.locator('dialog[open]')).toHaveCount(2);
    await page.keyboard.press('Escape');
    await expect(page.locator('#cms-image-lightbox')).toBeHidden();
    await expect(sheet).toBeVisible();
    await expect(preview).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await page.locator('[data-lumi-cms-gallery-tab]').click();
    await expect(page.locator('#admin-cms-root')).toHaveAttribute('data-lumi-cms-gallery-context', 'images');
    await expect(page.locator('.cms-gallery-editor')).toBeVisible();
    await expect(page.locator('.cms-section-index')).toBeHidden();
    await page.locator('#admin-panel-szovegek [data-admin-v2-panel="kuponok"]').click();
    const coupon = page.locator('#admin-kupon-lista .admin-db-kartya').first();
    await coupon.locator('[data-admin-kartya-toggle]').click();
    await expect(sheet.locator('[data-mezo="code"]')).toBeVisible();
    await expect(sheet).not.toHaveAttribute('data-entering', '');
    expect(await sheet.locator('.admin-editor-sheet-content').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: 'local-backups/admin-studio/coupon-pwa.png' });
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(page.locator('.pwa-admin-toolbar-dock')).toBeVisible();
    await expect(page.locator('.admin-v2-mobile-dock')).toBeHidden();
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /user-scalable=no/);
    expect(errors).toEqual([]);
});

test.describe('production admin redesign', () => {
    test('publication: admin loads opened panels only and retains editor drafts across token refreshes', async ({ page }) => {
        await openAdmin(page, { width: 1440, height: 1000 });
        const initialReads = await page.evaluate(() => window.__adminReads);
        expect(initialReads).not.toContain('services');
        expect(initialReads).not.toContain('coupons');
        expect(initialReads).not.toContain('site_settings');
        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="weboldal"]').click();
        await page.locator('[data-cms-section]').first().click();
        const field = page.locator('#admin-cms-root input[data-cms-path]:not([type="checkbox"]):not([type="hidden"])').first();
        await field.fill('Helyi szerkesztési próba');
        const readCount = await page.evaluate(() => window.__adminReads.length);
        const roleChecks = await page.evaluate(() => window.__adminRpcs.filter(call => call.name === 'is_lumi_admin').length);
        await page.evaluate(() => window.__adminEmitAuth('TOKEN_REFRESHED'));
        await page.keyboard.press('Escape');
        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="attekintes"]').click();
        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="weboldal"]').click();
        await page.locator('[data-cms-section]').first().click();
        await expect(field).toHaveValue('Helyi szerkesztési próba');
        expect(await page.evaluate(() => window.__adminReads.filter(table => table === 'site_settings').length)).toBe(1);
        expect(await page.evaluate(() => window.__adminRpcs.filter(call => call.name === 'is_lumi_admin').length)).toBe(roleChecks);
        expect(readCount).toBeGreaterThan(0);
        await page.keyboard.press('Escape');
        await page.locator('#admin-panel-szovegek [data-admin-v2-panel="szolgaltatasok"]').click();
        await expect(page.locator('#admin-szolgaltatas-lista .admin-db-kartya')).toHaveCount(4);
        const price = page.locator('#admin-szolgaltatas-lista [data-mezo="name"]').first();
        await price.evaluate(input => { input.value = 'Nem mentett árlista'; });
        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="attekintes"]').click();
        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="weboldal"]').click();
        await page.locator('#admin-panel-szovegek [data-admin-v2-panel="szolgaltatasok"]').click();
        await expect(price).toHaveValue('Nem mentett árlista');
        expect(await page.evaluate(() => window.__adminReads.filter(table => table === 'services').length)).toBe(1);
    });

    test('publication: mobile CMS preserves conflicts and separates saved content from pending publication', async ({ page }) => {
        await openAdmin(page, { width: 390, height: 844 });
        await page.getByRole('button', { name: 'Navigáció megnyitása' }).click();
        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="weboldal"]').click();
        await page.locator('[data-cms-section]').first().click();
        const sheet = page.locator('dialog.admin-editor-sheet[open]');
        const field = page.locator('#admin-cms-root input[data-cms-path]:not([type="checkbox"]):not([type="hidden"])').first();
        await field.fill('Csak helyi mockban mentett próba');
        await page.evaluate(() => { window.__adminSaveConflict = true; });
        await sheet.locator('[data-editor-save]').click();
        await expect(sheet.locator('.admin-editor-sheet-status')).toContainText('közben módosult');
        await expect(field).toHaveValue('Csak helyi mockban mentett próba');
        await page.evaluate(() => { window.__adminSaveConflict = false; });
        await sheet.locator('[data-editor-save]').click();
        await expect(page.locator('#admin-online-status')).toHaveText('Tartalom mentve.');
        await expect(page.locator('#admin-publication-status')).toHaveAttribute('data-publication-state', 'pending');
        await expect(page.locator('#admin-publication-status')).not.toContainText('nyilvánosan megjelent');
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
        await page.screenshot({ path: 'test-results/publication-mobile.png' });
        await page.keyboard.press('Escape');
        await page.locator('#admin-cms-reload').click();
        await expect(page.locator('#admin-online-status')).toHaveText('A weboldal tartalma betöltve.');
        await page.locator('[data-cms-section]').first().click();
        await expect(field).toHaveValue('Csak helyi mockban mentett próba');
        await page.keyboard.press('Escape');
        await page.locator('#admin-panel-szovegek [data-admin-v2-panel="szolgaltatasok"]').click();
        await page.locator('#admin-szolgaltatas-lista [data-admin-kartya-toggle]').first().click();
        const price = sheet.locator('[data-mezo="price_amount"]');
        await price.fill('7300');
        await page.evaluate(() => { window.__adminServicesConflict = true; });
        await sheet.locator('[data-editor-save]').click();
        await expect(sheet.locator('.admin-editor-sheet-status')).toContainText('közben módosult');
        await expect(price).toHaveValue('7300');
    });

    test('dashboard counts distinct future bookable dates', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 1440, height: 1000 });

        await expect(page.locator('#admin-v2-stat-horizon')).toHaveText('2');
        await expect(page.locator('#admin-v2-stat-horizon-meta')).toContainText('Legutolsó:');
        expect(browserErrors).toEqual([]);
    });

    test('coupon editor explains homepage visibility and blocks an expired activation', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 1440, height: 1000 });

        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="weboldal"]').click();
        await page.locator('#admin-panel-szovegek [data-admin-v2-panel="kuponok"]').click();
        const panel = page.locator('#admin-panel-kuponok');
        await expect(panel).toHaveClass(/aktiv/);
        await expect(panel.locator('.admin-panel-segedlet')).toContainText('csak az Aktív és a mai napon érvényes kupon');

        const coupon = panel.locator('.admin-kupon-kartya').first();
        await coupon.locator('[data-admin-kartya-toggle]').click();
        await expect(coupon.locator('.admin-kupon-szekcio')).toHaveCount(4);
        await expect(coupon.locator('[data-mezo="discount_basis"] option')).toHaveText([
            'Teljes árból (szolgáltatás + díszítések)',
            'Csak az alapszolgáltatás árából',
            'Csak a díszítések árából'
        ]);
        await expect(coupon.locator('[data-kupon-szamitas-segedlet]')).toContainText('Teljes árból');
        const calculationLayout = await coupon.locator('.admin-kupon-szekcio--kedvezmeny').evaluate(section => {
            const description = section.querySelector('.admin-kupon-szekcio-leiras').getBoundingClientRect();
            const fields = section.querySelector('.admin-kupon-mezo-racs').getBoundingClientRect();
            const example = section.querySelector('[data-kupon-szamitas-segedlet]').getBoundingClientRect();
            return {
                descriptionBottom: description.bottom,
                fieldsTop: fields.top,
                fieldsBottom: fields.bottom,
                exampleTop: example.top
            };
        });
        expect(calculationLayout.fieldsTop).toBeGreaterThanOrEqual(calculationLayout.descriptionBottom);
        expect(calculationLayout.exampleTop).toBeGreaterThanOrEqual(calculationLayout.fieldsBottom);
        await coupon.locator('[data-mezo="valid_until"]').fill('2000-01-01');
        await panel.getByRole('button', { name: 'Kuponok mentése' }).click();
        await expect(page.locator('#admin-online-status')).toContainText('lejárt dátummal nem aktiválható');
        await expect(coupon.locator('[data-mezo="valid_until"]')).toBeFocused();

        for (const viewport of [
            { width: 375, height: 812 },
            { width: 844, height: 390 },
            { width: 1440, height: 1000 }
        ]) {
            await page.setViewportSize(viewport);
            expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
                .toBeLessThanOrEqual(1);
            const responsiveCalculationLayout = await coupon.locator('.admin-kupon-szekcio--kedvezmeny').evaluate(section => {
                const description = section.querySelector('.admin-kupon-szekcio-leiras').getBoundingClientRect();
                const fields = section.querySelector('.admin-kupon-mezo-racs').getBoundingClientRect();
                const example = section.querySelector('[data-kupon-szamitas-segedlet]').getBoundingClientRect();
                return {
                    descriptionBottom: description.bottom,
                    fieldsTop: fields.top,
                    fieldsBottom: fields.bottom,
                    exampleTop: example.top
                };
            });
            expect(responsiveCalculationLayout.fieldsTop).toBeGreaterThanOrEqual(responsiveCalculationLayout.descriptionBottom);
            expect(responsiveCalculationLayout.exampleTop).toBeGreaterThanOrEqual(responsiveCalculationLayout.fieldsBottom);
            if (viewport.width === 375 && process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
                await page.screenshot({ path: 'test-results/admin-coupon-editor-mobile.png', fullPage: true });
            }
        }
        expect(browserErrors).toEqual([]);
    });

    test('homepage service card backgrounds are editable in the content editor', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 1440, height: 1000 });

        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="weboldal"]').click();
        const contentPanel = page.locator('#admin-panel-szovegek');
        await expect(contentPanel).toHaveClass(/aktiv/);
        await contentPanel.locator('[data-cms-section="3"]').click();

        const cardImageInputs = contentPanel.locator('[data-cms-upload^="fooldal.szolgaltatasok.kartyak."]');
        await expect(cardImageInputs).toHaveCount(4);
        await contentPanel.locator('.cms-fieldset').filter({ hasText: '1. szolgáltatáskártya' }).locator('summary').click();
        await expect(contentPanel.getByText('1. kártya háttérképe', { exact: true })).toBeVisible();
        expect(browserErrors).toEqual([]);
    });

    test('desktop: the new information architecture is compact and usable', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 1440, height: 1000 });

        await expect(page.locator('.admin-v2-topbar')).toBeVisible();
        await expect(page.locator('.admin-v2-sidebar')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'J\u00f3 reggelt, Szofi' })).toBeVisible();
        await expect(page.locator('#admin-v2-stat-pending')).toHaveText('1');
        await expect(page.locator('#admin-v2-stat-email')).toHaveText('1');
        await expect(page.locator('[data-admin-v2-today-list]')).toContainText('Adminisztracio');
        await expect(page.locator('[data-admin-v2-upcoming-list]')).toContainText('Szemelyes program');

        const brandLink = page.getByRole('link', { name: 'Admin áttekintés' }).first();
        await expect(brandLink).toHaveAttribute('href', '/admin/');
        await expect(brandLink.locator('img')).toHaveCount(0);
        await expect(page.getByRole('link', { name: 'Vissza a főoldalra' })).toHaveAttribute('href', '/');
        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-overview.png', fullPage: true });
        }

        const desktopMetrics = await page.evaluate(() => {
            const bodyStyle = getComputedStyle(document.body);
            const heading = document.querySelector('.admin-v2-page-heading h1');
            const sidebar = document.querySelector('.admin-v2-sidebar').getBoundingClientRect();
            return {
                bodyFont: Number.parseFloat(bodyStyle.fontSize),
                headingFont: Number.parseFloat(getComputedStyle(heading).fontSize),
                sidebarWidth: Math.round(sidebar.width),
                overflow: document.documentElement.scrollWidth - window.innerWidth
            };
        });

        expect(desktopMetrics.bodyFont).toBe(16);
        expect(desktopMetrics.headingFont).toBeLessThanOrEqual(38);
        expect(desktopMetrics.sidebarWidth).toBeGreaterThanOrEqual(220);
        expect(desktopMetrics.overflow).toBeLessThanOrEqual(1);

        await page.locator('[data-admin-v2-nav="foglalasok"]').click();
        await expect(page.locator('#admin-panel-foglalasok')).toHaveClass(/aktiv/);
        await expect(page.locator('#admin-panel-foglalasok .admin-v2-page-heading h1')).toHaveText('Id\u0151pontok');
        await expect(page.locator('#admin-foglalas-lista .admin-foglalas-kartya')).toHaveCount(6);

        const bookingHeadingSize = await page.locator('#admin-panel-foglalasok .admin-v2-page-heading h1').evaluate(
            element => Number.parseFloat(getComputedStyle(element).fontSize)
        );
        expect(bookingHeadingSize).toBeLessThanOrEqual(38);
        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-bookings-desktop.png', fullPage: true });
        }

        await page.locator('[data-admin-v2-nav="vendegek"]').click();
        await expect(page.locator('#admin-panel-vendegek')).toHaveClass(/aktiv/);
        await expect(page.locator('#admin-panel-vendegek .admin-v2-page-heading h1')).toHaveText('Regisztrált tagok');
        await expect(page.locator('[data-vendeg-osszefoglalo]')).toHaveText('4 regisztrált tag');
        await expect(page.locator('[data-vendeg-lista] .admin-vendeg-sor')).toHaveCount(4);
        await expect(page.locator('[data-vendeg-lista] .admin-vendeg-sor').first()).toContainText('Nagy Anna');
        await expect(page.locator('[data-vendeg-lista] .admin-vendeg-sor').first()).toContainText('anna.nagy@example.test');
        await expect(page.locator('[data-vendeg-lista] .admin-vendeg-sor').first()).toContainText('+36 30 111 2233');
        await expect(page.locator('[data-vendeg-reszlet]')).toHaveCount(0);
        await expect(page.locator('.admin-v2-profile strong')).toHaveText('Szofi');
        await expect(page.locator('.admin-v2-avatar')).toHaveText('SZ');
        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-customers-desktop.png', fullPage: true });
        }

        await page.locator('[data-admin-v2-nav="munkaido"]').click();
        await expect(page.locator('#admin-panel-idosavok')).toHaveClass(/aktiv/);
        await page.locator('#admin-panel-idosavok [data-admin-v2-panel="tiltasok"]').click();
        await expect(page.locator('#admin-panel-tiltasok')).toHaveClass(/aktiv/);

        await page.locator('[data-admin-v2-nav="weboldal"]').click();
        await expect(page.locator('#admin-panel-szovegek')).toHaveClass(/aktiv/);
        await expect(page.locator('#admin-cms-root')).toBeVisible();

        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="kommunikacio"]').click();
        await expect(page.locator('#admin-panel-esemenynaplo')).toHaveClass(/aktiv/);
        await expect(page.locator('#admin-v2-communication-summary')).toBeVisible();

        await page.locator('[data-admin-v2-nav="beallitasok"]').first().click();
        await expect(page.locator('#admin-panel-beallitasok')).toHaveClass(/aktiv/);
        await expect(page.locator('#admin-telefon-lathato')).toBeVisible();

        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-desktop.png', fullPage: true });
        }
        expect(browserErrors).toEqual([]);
    });

    test('manual occupied time stores the selected service and derives its end time on mobile', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 390, height: 844 });

        await page.getByRole('button', { name: 'Navigáció megnyitása' }).click();
        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="munkaido"]').click();
        await page.locator('#admin-panel-idosavok [data-admin-v2-panel="tiltasok"]').click();

        const panel = page.locator('#admin-panel-tiltasok');
        const service = panel.locator('#admin-tiltas-szolgaltatas');
        await expect(service).toBeEnabled();
        await expect(service.locator('option')).toHaveCount(5);

        await panel.locator('#admin-tiltas-datum').fill(dateKey(10));
        await panel.locator('#admin-tiltas-kezdes').fill('10:00');
        await service.selectOption('service-1');
        await expect(panel.locator('#admin-tiltas-vege')).toHaveValue('12:00');
        await panel.locator('#admin-tiltas-ok').fill('Kézi vendég');

        await panel.locator('[data-admin-v2-save]').click();
        await expect(panel.locator('#admin-tiltas-lista .admin-db-kartya').filter({ hasText: 'Kézi vendég' }))
            .toContainText('Erositett gel lakk');

        const insert = await page.evaluate(() => window.__adminLastInsert);
        expect(insert.table).toBe('blocked_times');
        expect(insert.values.service_id).toBe('service-1');
        expect(insert.values.reason).toBe('Kézi vendég');
        expect(new Date(insert.values.ends_at) - new Date(insert.values.starts_at)).toBe(120 * 60 * 1000);

        const overflow = await page.evaluate(() => ({
            body: document.body.scrollWidth,
            root: document.documentElement.scrollWidth,
            viewport: window.innerWidth
        }));
        expect(overflow.body).toBeLessThanOrEqual(overflow.viewport);
        expect(overflow.root).toBeLessThanOrEqual(overflow.viewport);
        expect(browserErrors).toEqual([]);
    });

    test('paid amounts can be reviewed and saved for online and manual bookings on mobile', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 390, height: 844 });

        await page.getByRole('button', { name: 'Navigáció megnyitása' }).click();
        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="foglalasok"]').click();
        const panel = page.locator('#admin-panel-foglalasok');
        const saveButton = panel.getByRole('button', { name: 'Módosítások mentése' });

        let onlineCard = panel.locator('.admin-foglalas-kartya').filter({ hasText: 'Nagy Anna' });
        await onlineCard.locator('h3').click();
        await expect(onlineCard.locator('.admin-foglalas-meta-fizetett')).toContainText('6 500 Ft');
        await onlineCard.getByRole('button', { name: 'Szerkesztés' }).click();
        const onlineAmount = onlineCard.locator('[data-idopont-mezo="paid_amount"]');
        await expect(onlineAmount).toBeEnabled();
        await onlineAmount.fill('7000');
        await onlineAmount.blur();
        await expect(onlineAmount).toHaveAttribute('aria-invalid', 'false');
        await saveButton.click();

        let lastRpc = await page.evaluate(() => window.__adminLastRpc);
        expect(lastRpc.name).toBe('apply_admin_booking_changes');
        expect(lastRpc.args.p_changes).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: '00000000-0000-4000-8000-000000000001',
                type: 'booking',
                paid_amount: 7000
            })
        ]));

        onlineCard = panel.locator('.admin-foglalas-kartya').filter({ hasText: 'Nagy Anna' });
        await onlineCard.locator('h3').click();
        await expect(onlineCard.locator('.admin-foglalas-meta-fizetett')).toContainText('7 000 Ft');

        let manualCard = panel.locator('.admin-foglalas-kartya').filter({ hasText: 'Adminisztracio' });
        await manualCard.locator('h3').click();
        await expect(manualCard.locator('.admin-foglalas-meta-fizetett')).toContainText('Nincs rögzítve');
        await manualCard.getByRole('button', { name: 'Szerkesztés' }).click();
        const manualAmount = manualCard.locator('[data-idopont-mezo="paid_amount"]');
        const manualReason = manualCard.locator('[data-idopont-mezo="reason"]');
        const lowerRowMetrics = await manualCard.locator('.admin-kezi-foglalas-also-sor').evaluate(element => {
            const reason = element.querySelector('[data-idopont-mezo="reason"]')?.closest('label');
            const amount = element.querySelector('[data-idopont-mezo="paid_amount"]')?.closest('label');
            const reasonRect = reason.getBoundingClientRect();
            const amountRect = amount.getBoundingClientRect();
            return {
                topDifference: Math.abs(reasonRect.top - amountRect.top),
                widthRatio: reasonRect.width / amountRect.width
            };
        });
        expect(lowerRowMetrics.topDifference).toBeLessThanOrEqual(1);
        expect(lowerRowMetrics.widthRatio).toBeGreaterThan(1.45);
        expect(lowerRowMetrics.widthRatio).toBeLessThan(1.55);
        await expect(manualReason).toBeEnabled();
        await manualAmount.fill('-1');
        await manualAmount.blur();
        await expect(manualAmount).toHaveAttribute('aria-invalid', 'true');
        await expect(manualCard.locator('.admin-fizetett-osszeg-hiba')).toContainText('0 vagy annál nagyobb');
        await manualAmount.fill('5000');
        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-paid-amount-layout-mobile.png', fullPage: true });
        }
        await saveButton.click();

        lastRpc = await page.evaluate(() => window.__adminLastRpc);
        expect(lastRpc.args.p_changes).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: '00000000-0000-4000-8000-000000000100',
                type: 'blocked',
                paid_amount: 5000
            })
        ]));

        manualCard = panel.locator('.admin-foglalas-kartya').filter({ hasText: 'Adminisztracio' });
        await manualCard.locator('h3').click();
        await expect(manualCard.locator('.admin-foglalas-meta-fizetett')).toContainText('5 000 Ft');

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(1);

        await page.setViewportSize({ width: 1440, height: 1000 });
        const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(desktopOverflow).toBeLessThanOrEqual(1);
        await expect(manualCard.locator('.admin-foglalas-meta-fizetett')).toContainText('5 000 Ft');
        expect(browserErrors).toEqual([]);
    });

    test('mobile booking card names keep descenders visible', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 390, height: 844 });

        await page.getByRole('button', { name: 'Navigáció megnyitása' }).click();
        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="foglalasok"]').click();
        const headings = page.locator('#admin-panel-foglalasok .admin-foglalas-nev-blokk h3');
        await expect(headings).toHaveCount(6);

        const metrics = await headings.evaluateAll(elements => elements.map(element => {
            const style = getComputedStyle(element);
            const elementRect = element.getBoundingClientRect();
            const textRange = document.createRange();
            textRange.selectNodeContents(element);
            const textRect = textRange.getBoundingClientRect();
            return {
                text: element.textContent.trim(),
                fontSize: Number.parseFloat(style.fontSize),
                lineHeight: Number.parseFloat(style.lineHeight),
                paddingBottom: Number.parseFloat(style.paddingBottom),
                height: elementRect.height,
                textBottomClearance: elementRect.bottom - textRect.bottom
            };
        }));

        expect(metrics.some(metric => metric.text === 'Nagy Anna')).toBe(true);
        for (const metric of metrics) {
            expect(metric.lineHeight, `${metric.text}: line-height`).toBeGreaterThanOrEqual(metric.fontSize * 1.29);
            expect(metric.paddingBottom, `${metric.text}: bottom padding`).toBeGreaterThanOrEqual(2);
            expect(metric.height, `${metric.text}: element height`)
                .toBeGreaterThanOrEqual(metric.lineHeight + metric.paddingBottom - 0.5);
            expect(metric.textBottomClearance, `${metric.text}: text bottom clearance`).toBeGreaterThanOrEqual(1.5);
        }

        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
            .toBeLessThanOrEqual(1);
        expect(browserErrors).toEqual([]);
    });

    test('the price calculator uses decoration items, range prices and quantities without overflow', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 390, height: 844 });

        await page.getByRole('button', { name: 'Navigáció megnyitása' }).click();
        const quickButton = page.locator('.admin-v2-sidebar [data-admin-v2-nav="arkalkulator"]');
        await expect(quickButton).toBeVisible();
        await quickButton.click();

        const panel = page.locator('#admin-panel-arkalkulator');
        await expect(panel).toHaveClass(/aktiv/);
        await expect(panel.locator('.admin-v2-page-heading h1')).toHaveText('Árkalkulátor');
        await expect(panel.locator('#admin-arkalkulator-szolgaltatas option')).toHaveCount(2);
        const franciaJelolo = panel.getByRole('checkbox', { name: 'Francia' });
        const kovekJelolo = panel.getByRole('checkbox', { name: 'Kövek' });
        await expect(franciaJelolo).toBeVisible();
        await expect(kovekJelolo).toBeVisible();
        await expect(franciaJelolo).not.toBeChecked();
        await expect(panel.locator('#admin-arkalkulator-vegosszeg')).toHaveText('6 500 Ft');

        await franciaJelolo.check();
        const francia = panel.locator('[data-ar-kalkulator-extra="service-3"]');
        await expect(francia).toContainText('Francia');
        await expect(francia.locator('small')).toHaveCount(0);
        await expect(francia.getByText('1 000 Ft', { exact: true })).toHaveCount(1);
        await expect(francia.locator('output')).toHaveText('1 db');
        await expect(panel.locator('#admin-arkalkulator-vegosszeg')).toHaveText('7 500 Ft');

        await francia.getByRole('button', { name: 'Francia darabszámának növelése' }).click();
        await expect(francia.locator('output')).toHaveText('2 db');
        await expect(panel.locator('#admin-arkalkulator-vegosszeg')).toHaveText('8 500 Ft');

        await kovekJelolo.check();
        const kovek = panel.locator('[data-ar-kalkulator-extra="service-4"]');
        await expect(kovek).toContainText('Kövek');
        await expect(kovek.locator('[data-ar-kalkulator-extra-price] option')).toHaveText(['500 Ft', '550 Ft', '600 Ft', '650 Ft', '700 Ft', '750 Ft', '800 Ft']);
        await kovek.locator('[data-ar-kalkulator-extra-price]').selectOption('800');
        await expect(panel.locator('#admin-arkalkulator-vegosszeg')).toHaveText('9 300 Ft');

        const kuponSelect = panel.locator('#admin-arkalkulator-kupon');
        await expect(kuponSelect.locator('option')).toHaveCount(4);
        await kuponSelect.selectOption('coupon-1');
        await expect(panel.locator('#admin-arkalkulator-vegosszeg')).toHaveText('8 370 Ft');
        await expect(panel.locator('#admin-arkalkulator-bontas')).toContainText('Teljes árból');
        await expect(panel.locator('#admin-arkalkulator-kupon-segedlet')).toContainText('Mostani levonás: 930 Ft');

        await kuponSelect.selectOption('coupon-2');
        await expect(panel.locator('#admin-arkalkulator-vegosszeg')).toHaveText('8 300 Ft');
        await expect(panel.locator('#admin-arkalkulator-bontas')).toContainText('Szolgáltatás árából');

        await kuponSelect.selectOption('coupon-3');
        await expect(panel.locator('#admin-arkalkulator-vegosszeg')).toHaveText('7 900 Ft');
        await expect(panel.locator('#admin-arkalkulator-bontas')).toContainText('Díszítések árából');

        const metrics = await panel.evaluate(element => ({
            overflow: document.documentElement.scrollWidth - window.innerWidth,
            right: element.getBoundingClientRect().right,
            viewport: window.innerWidth
        }));
        expect(metrics.overflow).toBeLessThanOrEqual(1);
        expect(metrics.right).toBeLessThanOrEqual(metrics.viewport + 1);

        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-price-calculator-mobile.png', fullPage: true });
        }

        await panel.getByRole('button', { name: 'Új számolás' }).click();
        await expect(panel.locator('.admin-arkalkulator-extra-sor')).toHaveCount(0);
        await expect(franciaJelolo).not.toBeChecked();
        await expect(kovekJelolo).not.toBeChecked();
        await expect(panel.locator('#admin-arkalkulator-vegosszeg')).toHaveText('6 500 Ft');
        expect(browserErrors).toEqual([]);
    });

    test('mobile: the drawer, touch targets and booking page fit the viewport', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 390, height: 844 });

        const menuButton = page.getByRole('button', { name: 'Navig\u00e1ci\u00f3 megnyit\u00e1sa' });
        await expect(menuButton).toBeVisible();

        const targetSize = await menuButton.evaluate(element => {
            const rect = element.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        });
        expect(targetSize.width).toBeGreaterThanOrEqual(44);
        expect(targetSize.height).toBeGreaterThanOrEqual(44);

        const todayRowMetrics = await page.locator('[data-admin-v2-today-list] .admin-v2-status-chip').first().evaluate(chip => {
            const row = chip.closest('.admin-v2-schedule-item');
            const copy = row.querySelector('.admin-v2-schedule-copy');
            const chipRect = chip.getBoundingClientRect();
            const copyRect = copy.getBoundingClientRect();
            const rowRect = row.getBoundingClientRect();
            return {
                statusColumn: getComputedStyle(chip).gridColumnStart,
                statusRightOfCopy: chipRect.left >= copyRect.right,
                statusInsideRow: chipRect.top >= rowRect.top && chipRect.bottom <= rowRect.bottom,
                statusHeight: chipRect.height
            };
        });
        expect(todayRowMetrics.statusColumn).toBe('4');
        expect(todayRowMetrics.statusRightOfCopy).toBe(true);
        expect(todayRowMetrics.statusInsideRow).toBe(true);
        expect(todayRowMetrics.statusHeight).toBeLessThanOrEqual(36);
        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-overview-mobile.png', fullPage: true });
        }

        await page.evaluate(() => {
            const body = document.body;
            const start = new Touch({
                identifier: 1,
                target: body,
                clientX: 64,
                clientY: 360
            });
            const end = new Touch({
                identifier: 1,
                target: body,
                clientX: 152,
                clientY: 364
            });
            body.dispatchEvent(new TouchEvent('touchstart', {
                bubbles: true,
                touches: [start],
                changedTouches: [start]
            }));
            body.dispatchEvent(new TouchEvent('touchend', {
                bubbles: true,
                touches: [],
                changedTouches: [end]
            }));
        });
        await expect(page.locator('body')).toHaveClass(/admin-v2-menu-open/);
        await expect.poll(async () => {
            return (await page.locator('.admin-v2-sidebar').boundingBox()).x;
        }).toBeGreaterThanOrEqual(-1);

        const drawerMetrics = await page.locator('.admin-v2-sidebar').evaluate(sidebar => {
            const bodyStyle = getComputedStyle(document.body);
            const sidebarRect = sidebar.getBoundingClientRect();
            const logoutRect = sidebar.querySelector('[data-admin-v2-logout]').getBoundingClientRect();
            const navItem = sidebar.querySelector('.admin-v2-nav-item');
            const navStyle = getComputedStyle(navItem);
            const label = navItem.querySelector('span:not(.admin-v2-nav-count):not(.admin-v2-nav-alert)');
            return {
                width: sidebarRect.width,
                height: sidebarRect.height,
                logoutBottom: logoutRect.bottom,
                viewportHeight: window.innerHeight,
                bodyPosition: bodyStyle.position,
                bodyOverflow: bodyStyle.overflow,
                navDisplay: navStyle.display,
                navJustify: navStyle.justifyContent,
                navTextAlign: navStyle.textAlign,
                labelTextAlign: getComputedStyle(label).textAlign
            };
        });
        expect(drawerMetrics.width).toBeLessThanOrEqual(244);
        expect(drawerMetrics.height).toBeLessThanOrEqual(drawerMetrics.viewportHeight + 1);
        expect(drawerMetrics.logoutBottom).toBeLessThanOrEqual(drawerMetrics.viewportHeight + 1);
        expect(drawerMetrics.bodyPosition).toBe('fixed');
        expect(drawerMetrics.bodyOverflow).toBe('hidden');
        expect(drawerMetrics.navDisplay).toBe('flex');
        expect(drawerMetrics.navJustify).toBe('flex-start');
        expect(drawerMetrics.navTextAlign).toBe('left');
        expect(drawerMetrics.labelTextAlign).toBe('left');

        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="foglalasok"]').click();
        await expect(page.locator('body')).not.toHaveClass(/admin-v2-menu-open/);
        await expect(page.locator('#admin-panel-foglalasok')).toHaveClass(/aktiv/);
        await expect(page.locator('#admin-panel-foglalasok .admin-v2-page-heading h1')).toHaveText('Id\u0151pontok');

        const fixedHeader = await page.locator('.admin-v2-topbar').evaluate(element => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return { position: style.position, top: Math.round(rect.top) };
        });
        expect(fixedHeader).toEqual({ position: 'fixed', top: 0 });

        const firstCard = page.locator('#admin-foglalas-lista .admin-foglalas-kartya').first();
        await firstCard.getByRole('button', { name: 'Szerkesztés' }).click();
        const editorMetrics = await firstCard.evaluate(card => {
            const status = card.querySelector('[data-foglalas-statusz]').getBoundingClientRect();
            const date = card.querySelector('[data-idopont-mezo="date"]').getBoundingClientRect();
            const start = card.querySelector('[data-idopont-mezo="start_time"]').getBoundingClientRect();
            const end = card.querySelector('[data-idopont-mezo="end_time"]').getBoundingClientRect();
            return {
                statusHeight: status.height,
                dateWidth: date.width,
                startWidth: start.width,
                endWidth: end.width
            };
        });
        expect(editorMetrics.statusHeight).toBeLessThanOrEqual(36);
        expect(editorMetrics.dateWidth).toBeGreaterThan(editorMetrics.startWidth * 1.25);
        expect(editorMetrics.dateWidth).toBeGreaterThan(editorMetrics.endWidth * 1.25);

        const mobileMetrics = await page.evaluate(() => {
            const heading = document.querySelector('#admin-panel-foglalasok .admin-v2-page-heading h1');
            const firstCard = document.querySelector('#admin-foglalas-lista .admin-foglalas-kartya');
            const cardRect = firstCard?.getBoundingClientRect();
            const cardTitle = firstCard?.querySelector('.admin-foglalas-fosor h3');
            const controls = Array.from(firstCard?.querySelectorAll('.admin-foglalas-vezerlok > *') || []);
            const viewSwitch = document.querySelector('#admin-panel-foglalasok .admin-foglalas-nezetvalto');
            const viewButton = viewSwitch?.querySelector('.admin-foglalas-nezet-gomb');
            const saveButton = document.querySelector('#admin-panel-foglalasok [data-admin-v2-save]');
            const cancellationButtons = Array.from(document.querySelectorAll('#admin-panel-foglalasok .admin-vendeg-lemondas-akciok .admin-kis-gomb'));
            const cancellationButtonRects = cancellationButtons.map(element => element.getBoundingClientRect());
            return {
                headingFont: Number.parseFloat(getComputedStyle(heading).fontSize),
                cardTitleFont: Number.parseFloat(getComputedStyle(cardTitle).fontSize),
                controlHeights: controls.map(element => element.getBoundingClientRect().height),
                viewSwitchWidth: viewSwitch?.getBoundingClientRect().width || 0,
                viewButtonHeight: viewButton?.getBoundingClientRect().height || 0,
                saveButtonHeight: saveButton?.getBoundingClientRect().height || 0,
                cancellationButtonHeights: cancellationButtonRects.map(rect => rect.height),
                cancellationButtonsSameRow: cancellationButtonRects.length < 2
                    || Math.abs(cancellationButtonRects[0].top - cancellationButtonRects[1].top) <= 1,
                overflow: document.documentElement.scrollWidth - window.innerWidth,
                cardLeft: cardRect?.left || 0,
                cardRight: cardRect?.right || 0,
                viewport: window.innerWidth
            };
        });

        expect(mobileMetrics.headingFont).toBeLessThanOrEqual(24);
        expect(mobileMetrics.cardTitleFont).toBe(16);
        expect(Math.max(...mobileMetrics.controlHeights)).toBeLessThanOrEqual(36.1);
        expect(mobileMetrics.viewSwitchWidth).toBeLessThanOrEqual(180);
        expect(mobileMetrics.viewButtonHeight).toBeLessThanOrEqual(36);
        expect(mobileMetrics.saveButtonHeight).toBeLessThanOrEqual(38);
        expect(Math.max(...mobileMetrics.cancellationButtonHeights)).toBeLessThanOrEqual(36);
        expect(mobileMetrics.cancellationButtonsSameRow).toBe(true);
        expect(mobileMetrics.overflow).toBeLessThanOrEqual(1);
        expect(mobileMetrics.cardLeft).toBeGreaterThanOrEqual(0);
        expect(mobileMetrics.cardRight).toBeLessThanOrEqual(mobileMetrics.viewport + 1);

        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-mobile.png', fullPage: true });
        }

        for (const viewport of [{ width: 320, height: 700 }, { width: 844, height: 390 }]) {
            await page.setViewportSize(viewport);
            const responsiveOverflow = await page.evaluate(
                () => document.documentElement.scrollWidth - window.innerWidth
            );
            expect(responsiveOverflow).toBeLessThanOrEqual(1);
        }

        expect(browserErrors).toEqual([]);
    });

    test('booking actions and filters stay usable at the requested responsive widths', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 1440, height: 1000 });

        await page.locator('[data-admin-v2-nav="foglalasok"]').click();
        const panel = page.locator('#admin-panel-foglalasok');
        const pageActions = panel.locator('.admin-v2-page-actions');
        const saveButton = pageActions.getByRole('button', { name: 'Módosítások mentése' });
        const exportButton = pageActions.getByRole('button', { name: 'Excel export' });
        const refreshButton = panel.getByRole('button', { name: 'Foglalások frissítése' });
        const searchInput = panel.locator('#admin-foglalas-kereses');

        await expect(saveButton).toBeVisible();
        await expect(exportButton).toBeVisible();
        await expect(refreshButton).toHaveAttribute('title', 'Foglalások frissítése');
        await expect(searchInput).toHaveAttribute('placeholder', 'Név, e-mail vagy telefon');
        expect((await refreshButton.textContent()).trim()).toBe('');
        expect(await refreshButton.evaluate(button => button.parentElement?.classList.contains('admin-v2-page-actions'))).toBe(true);

        const manualCard = panel.locator('.admin-foglalas-kartya').filter({ hasText: 'Adminisztracio' });
        const onlineCard = panel.locator('.admin-foglalas-kartya').filter({ hasText: 'Nagy Anna' });
        const manualService = manualCard.locator('.admin-foglalas-rovid-szolgaltatas');
        const onlineService = onlineCard.locator('.admin-foglalas-rovid-szolgaltatas');

        await expect(manualCard.locator('.admin-kartya-tipus')).toHaveText('Kézzel felvett idő');
        await expect(manualService).toHaveText('Erositett gel lakk');
        expect(await manualCard.locator('.admin-kartya-tipus').evaluate(
            element => getComputedStyle(element).textTransform
        )).toBe('uppercase');

        const serviceRowHeights = await Promise.all([
            manualService.evaluate(element => element.getBoundingClientRect().height),
            onlineService.evaluate(element => element.getBoundingClientRect().height)
        ]);
        expect(Math.abs(serviceRowHeights[0] - serviceRowHeights[1])).toBeLessThanOrEqual(1);

        for (const viewport of [
            { width: 390, height: 844 },
            { width: 430, height: 932 },
            { width: 768, height: 1024 },
            { width: 1440, height: 1000 }
        ]) {
            await page.setViewportSize(viewport);

            const metrics = await panel.evaluate((root, mobileMaxWidth) => {
                const rect = element => element.getBoundingClientRect();
                const insideViewport = element => {
                    const bounds = rect(element);
                    return bounds.left >= -1 && bounds.right <= window.innerWidth + 1;
                };
                const search = root.querySelector('#admin-foglalas-kereses');
                const status = root.querySelector('#admin-foglalas-statusz-szuro');
                const pager = root.querySelector('#admin-foglalas-lapozo-felso');
                const refresh = root.querySelector('#admin-foglalas-frissites');
                const pageSize = pager.querySelector('[data-foglalas-oldalmeret]');
                const actions = root.querySelector('.admin-v2-page-actions');
                const actionButtons = Array.from(actions.querySelectorAll('button'));
                const refreshBounds = rect(refresh);
                const pageSizeBounds = rect(pageSize);

                return {
                    overflow: document.documentElement.scrollWidth - window.innerWidth,
                    searchInside: insideViewport(search),
                    statusInside: insideViewport(status),
                    pagerInside: insideViewport(pager),
                    pagerOverflow: pager.scrollWidth - pager.clientWidth,
                    actionsInside: actionButtons.every(insideViewport),
                    searchFont: Number.parseFloat(getComputedStyle(search).fontSize),
                    mobileFontLargeEnough: window.innerWidth > mobileMaxWidth
                        || Number.parseFloat(getComputedStyle(search).fontSize) >= 16,
                    refreshWidth: refreshBounds.width,
                    refreshHeight: refreshBounds.height,
                    refreshInPageActions: refresh.parentElement === actions,
                    sharedActionBlock: actionButtons.length === 3
                        && actionButtons.every(button => button.parentElement === actions)
                };
            }, 430);

            expect(metrics.overflow, `${viewport.width}px document overflow`).toBeLessThanOrEqual(1);
            expect(metrics.searchInside, `${viewport.width}px search`).toBe(true);
            expect(metrics.statusInside, `${viewport.width}px status filter`).toBe(true);
            expect(metrics.pagerInside, `${viewport.width}px pager`).toBe(true);
            expect(metrics.pagerOverflow, `${viewport.width}px pager overflow`).toBeLessThanOrEqual(1);
            expect(metrics.actionsInside, `${viewport.width}px page actions`).toBe(true);
            expect(metrics.mobileFontLargeEnough, `${viewport.width}px search font ${metrics.searchFont}px`).toBe(true);
            expect(metrics.refreshWidth, `${viewport.width}px refresh width`).toBeGreaterThanOrEqual(34);
            expect(metrics.refreshHeight, `${viewport.width}px refresh height`).toBeGreaterThanOrEqual(34);
            expect(metrics.refreshInPageActions, `${viewport.width}px refresh placement`).toBe(true);
            expect(metrics.sharedActionBlock, `${viewport.width}px shared page actions`).toBe(true);
        }

        await refreshButton.click();
        await expect(panel.locator('#admin-foglalas-lista .admin-foglalas-kartya')).toHaveCount(6);
        expect(browserErrors).toEqual([]);
    });

    test('mobile: the registered member list stays within the viewport', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 390, height: 844 });

        await page.getByRole('button', { name: 'Navigáció megnyitása' }).click();
        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="vendegek"]').click();
        await expect(page.locator('#admin-panel-vendegek')).toHaveClass(/aktiv/);
        await expect(page.locator('[data-vendeg-osszefoglalo]')).toHaveText('4 regisztrált tag');
        await expect(page.locator('[data-vendeg-lista] .admin-vendeg-sor')).toHaveCount(4);
        await expect(page.locator('[data-vendeg-lista] .admin-vendeg-sor').first()).toContainText('Nagy Anna');

        const metrics = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth - window.innerWidth,
            listRight: document.querySelector('[data-vendeg-lista]').getBoundingClientRect().right,
            viewport: window.innerWidth
        }));
        expect(metrics.overflow).toBeLessThanOrEqual(1);
        expect(metrics.listRight).toBeLessThanOrEqual(metrics.viewport + 1);

        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-customers-mobile.png', fullPage: true });
        }

        expect(browserErrors).toEqual([]);
    });

    test('mobile: content and price editors use progressive disclosure without overflow', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 390, height: 844 });

        await page.getByRole('button', { name: 'Navigáció megnyitása' }).click();
        await page.locator('.admin-v2-sidebar [data-admin-v2-nav="weboldal"]').click();
        await expect(page.locator('#admin-panel-szovegek')).toHaveClass(/aktiv/);
        await expect(page.locator('#admin-cms-root')).toBeVisible();
        await expect(page.getByText('Tartalomszerkesztő', { exact: true })).toHaveCount(0);
        await expect(page.locator('.admin-v2-page-description')).toHaveCount(0);

        const sectionPicker = page.locator('.cms-section-picker');
        const sectionIndex = page.locator('.cms-section-index');
        await expect(sectionPicker).toBeVisible();
        await expect(sectionIndex).toBeHidden();

        const sectionSelect = sectionPicker.locator('select');
        const choices = await sectionSelect.locator('option').evaluateAll(options => options.map(option => ({
            label: option.textContent.trim(),
            value: option.value
        })));
        expect(choices.length).toBeGreaterThan(1);
        await sectionSelect.selectOption(choices[1].value);
        await expect(page.locator('.cms-editor-card-header h3')).toContainText(choices[1].label);
        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-content-mobile.png', fullPage: true });
        }

        await page.locator('#admin-panel-szovegek [data-admin-v2-panel="szolgaltatasok"]').click();
        const pricePanel = page.locator('#admin-panel-szolgaltatasok');
        await expect(pricePanel).toHaveClass(/aktiv/);
        await expect(pricePanel.locator('.admin-db-kartya')).toHaveCount(4);

        const firstCard = pricePanel.locator('.admin-db-kartya').first();
        await firstCard.locator('[data-admin-kartya-toggle]').click();
        await expect(firstCard.locator('.admin-szerkeszto-szakasz')).toHaveCount(2);
        await expect(firstCard.locator('.admin-szerkeszto-szakasz legend')).toHaveText(['Alapadatok', 'Ár és időtartam']);
        await expect(firstCard.locator('[data-mezo="sort_order"]')).toHaveAttribute('type', 'hidden');

        const editorMetrics = await pricePanel.evaluate(panel => ({
            panelOverflow: panel.scrollWidth - panel.clientWidth,
            documentOverflow: document.documentElement.scrollWidth - window.innerWidth,
            toggleHeight: panel.querySelector('[data-admin-kartya-toggle]').getBoundingClientRect().height
        }));
        expect(editorMetrics.panelOverflow).toBeLessThanOrEqual(1);
        expect(editorMetrics.documentOverflow).toBeLessThanOrEqual(1);
        expect(editorMetrics.toggleHeight).toBeGreaterThanOrEqual(44);
        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-prices-mobile.png', fullPage: true });
        }
        expect(browserErrors).toEqual([]);
    });

    test('the bell opens a notification list and routes each live item to its workflow', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 390, height: 844 });
        const bell = page.getByRole('button', { name: 'Értesítések megnyitása' });


        await bell.click();
        const panel = page.getByRole('region', { name: 'Értesítések' });
        await expect(panel).toBeVisible();
        await expect(panel).toContainText('1 megerősítésre vár');
        await expect(panel).toContainText('1 új vendéglemondás');
        await expect(panel).toContainText('1 emailhiba');
        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-notifications-mobile.png', fullPage: true });
        }

        await panel.getByRole('button', { name: /megerősítésre vár/i }).click();
        await expect(page.locator('#admin-panel-foglalasok')).toHaveClass(/aktiv/);
        await expect(page.locator('#admin-foglalas-statusz-szuro')).toHaveValue('pending');
        await expect(panel).toBeHidden();

        const pendingCard = page.locator('#admin-foglalas-lista .admin-foglalas-kartya').filter({ hasText: 'Kiss Dorka' });
        await pendingCard.getByRole('button', { name: 'Szerkesztés' }).click();
        await pendingCard.locator('[data-foglalas-statusz]').selectOption('confirmed');
        await page.locator('#admin-panel-foglalasok [data-admin-v2-save]').click();
        await expect(page.locator('#admin-foglalas-lista .admin-foglalas-kartya')).toHaveCount(0);

        await bell.click();
        await expect(panel).not.toContainText('megerősítésre vár');
        await panel.getByRole('button', { name: /új vendéglemondás/i }).click();
        await expect(page.locator('#admin-foglalas-statusz-szuro')).toHaveValue('cancelled_by_customer');
        await page.getByRole('button', { name: 'Új lemondások nyugtázása' }).click();
        await bell.click();
        await expect(panel).not.toContainText('új vendéglemondás');

        await panel.getByRole('button', { name: /emailhiba/i }).click();
        await expect(page.locator('#admin-panel-esemenynaplo')).toHaveClass(/aktiv/);
        await expect(panel).toBeHidden();
        expect(browserErrors).toEqual([]);
    });

    test('the standalone app bell stays open and the desktop topbar leaves no mobile remnants', async ({ page }) => {
        await page.addInitScript(() => {
            Object.defineProperty(window.navigator, 'standalone', {
                configurable: true,
                value: true
            });
        });

        const browserErrors = await openAdmin(page, { width: 390, height: 844 });
        await expect(page.locator('body')).toHaveClass(/lumi-admin-standalone/);
        await expect(page.locator('.admin-v2-topbar')).toBeHidden();
        await expect(page.locator('#pwa-admin-tabbar .pwa-admin-toolbar-button')).toHaveCount(6);

        const moreButton = page.locator('[data-pwa-admin-more]');
        await moreButton.click();
        await expect(page.locator('#pwa-admin-more-menu')).toBeVisible();
        const bell = page.locator('[data-pwa-admin-notifications]');
        await bell.click();

        const panel = page.getByRole('region', { name: 'Értesítések' });
        await expect(panel).toBeVisible();
        await expect(bell).toHaveAttribute('aria-expanded', 'true');
        await expect(panel).toContainText('1 megerősítésre vár');
        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-pwa-notifications-mobile.png', fullPage: true });
        }

        await bell.click();
        await expect(panel).toBeHidden();
        await page.evaluate(() => {
            document.querySelector('.admin-v2-sidebar [data-admin-v2-nav="weboldal"]')?.click();
        });
        await expect(page.locator('#admin-panel-szovegek')).toHaveClass(/aktiv/);
        await expect(page.locator('.cms-section-picker')).toBeVisible();
        await expect(page.locator('.admin-v2-topbar')).toBeHidden();
        if (process.env.LUMI_CAPTURE_ADMIN_REDESIGN === '1') {
            await page.screenshot({ path: 'test-results/admin-redesign-pwa-content-mobile.png', fullPage: true });
        }
        expect(browserErrors).toEqual([]);
    });

    test('mobile browser: every admin panel shares the same canonical top spacing', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 390, height: 844 });
        const tops = await collectAdminHeadingTops(page);
        expectHeadingTopsAligned(tops);

        const metrics = await page.evaluate(() => {
            const bodyStyle = getComputedStyle(document.body);
            const main = document.querySelector('.admin-workspace-main');
            const mainStyle = getComputedStyle(main);
            const topbar = document.querySelector('.admin-v2-topbar');
            const status = document.getElementById('admin-online-status');
            return {
                topbarDisplay: getComputedStyle(topbar).display,
                topbarHeight: topbar.getBoundingClientRect().height,
                workspaceTopGap: parseFloat(bodyStyle.getPropertyValue('--admin-v2-workspace-top-gap')),
                workspaceBottomGap: parseFloat(bodyStyle.getPropertyValue('--admin-v2-workspace-bottom-gap')),
                paddingTop: parseFloat(mainStyle.paddingTop),
                paddingBottom: parseFloat(mainStyle.paddingBottom),
                statusPosition: getComputedStyle(status).position,
                pwaToolbarCount: document.querySelectorAll('#pwa-admin-tabbar').length
            };
        });

        expect(metrics.topbarDisplay).not.toBe('none');
        expect(metrics.statusPosition).toBe('fixed');
        expect(metrics.pwaToolbarCount).toBe(0);
        expect(Math.abs(metrics.paddingTop - (metrics.topbarHeight + metrics.workspaceTopGap))).toBeLessThanOrEqual(1);
        expect(Math.abs(metrics.paddingBottom - metrics.workspaceBottomGap)).toBeLessThanOrEqual(1);
        expect(browserErrors).toEqual([]);
    });

    test('standalone app: every admin panel shares the same content spacing while the bottom toolbar owns only its shell reserve', async ({ page }) => {
        const browserErrors = await openAdmin(page, { width: 390, height: 844 }, { standalone: true });
        await expect(page.locator('body')).toHaveClass(/lumi-admin-standalone/);
        await expect(page.locator('#pwa-admin-tabbar')).toBeVisible();

        const tops = await collectAdminHeadingTops(page);
        expectHeadingTopsAligned(tops);

        const metrics = await page.evaluate(() => {
            const bodyStyle = getComputedStyle(document.body);
            const main = document.querySelector('.admin-workspace-main');
            const mainStyle = getComputedStyle(main);
            const topbar = document.querySelector('.admin-v2-topbar');
            const toolbar = document.getElementById('pwa-admin-tabbar');
            const status = document.getElementById('admin-online-status');
            return {
                topbarDisplay: getComputedStyle(topbar).display,
                workspaceTopGap: parseFloat(bodyStyle.getPropertyValue('--admin-v2-workspace-top-gap')),
                workspaceBottomGap: parseFloat(bodyStyle.getPropertyValue('--admin-v2-workspace-bottom-gap')),
                paddingTop: parseFloat(mainStyle.paddingTop),
                paddingBottom: parseFloat(mainStyle.paddingBottom),
                toolbarHeight: toolbar.getBoundingClientRect().height,
                statusPosition: getComputedStyle(status).position
            };
        });

        expect(metrics.topbarDisplay).toBe('none');
        expect(metrics.statusPosition).toBe('fixed');
        expect(Math.abs(metrics.paddingTop - metrics.workspaceTopGap)).toBeLessThanOrEqual(1);
        expect(metrics.paddingBottom).toBeGreaterThanOrEqual(metrics.workspaceBottomGap + metrics.toolbarHeight);
        expect(browserErrors).toEqual([]);
    });


    for (const mode of [
        { name: 'mobile browser', standalone: false },
        { name: 'standalone app', standalone: true }
    ]) {
        test(`${mode.name}: CMS image uploads share compact side-by-side controls and a lightbox`, async ({ page }) => {
            const browserErrors = await openAdmin(page, { width: 390, height: 844 }, { standalone: mode.standalone });

            await page.evaluate(() => document.querySelector('.admin-sidebar [data-admin-v2-nav="weboldal"]')?.click());
            await expect(page.locator('#admin-panel-szovegek')).toHaveClass(/aktiv/);
            await expect(page.locator('#admin-cms-root')).toBeVisible();

            const galleryTab = page.locator('[data-lumi-cms-gallery-tab]');
            await expect(galleryTab).toBeVisible();
            await galleryTab.click();
            await expect(page.locator('#admin-cms-root')).toHaveAttribute('data-lumi-cms-gallery-context', 'images');

            if (await page.locator('.cms-gallery-item').count() === 0) {
                await page.locator('[data-cms-gallery-add]').click();
            }

            const imageField = page.locator('.cms-gallery-item .cms-image-field').first();
            const preview = imageField.locator('.cms-image-preview');
            const controls = imageField.locator('.cms-image-controls');
            await expect(imageField).toBeVisible();
            await expect(preview).toBeVisible();
            await expect(controls.locator('.cms-upload-button')).toBeVisible();
            await expect(controls.locator('[data-cms-remove-image]')).toBeVisible();

            const metrics = await imageField.evaluate(field => {
                const fieldRect = field.getBoundingClientRect();
                const previewRect = field.querySelector('.cms-image-preview').getBoundingClientRect();
                const controlsRect = field.querySelector('.cms-image-controls').getBoundingClientRect();
                return {
                    fieldWidth: fieldRect.width,
                    previewWidth: previewRect.width,
                    previewRight: previewRect.right,
                    controlsLeft: controlsRect.left,
                    documentOverflow: document.documentElement.scrollWidth - window.innerWidth
                };
            });
            expect(metrics.previewWidth).toBeLessThan(metrics.fieldWidth * 0.55);
            expect(metrics.previewRight).toBeLessThanOrEqual(metrics.controlsLeft + 1);
            expect(metrics.documentOverflow).toBeLessThanOrEqual(1);

            await preview.evaluate(node => {
                node.innerHTML = '<img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22800%22%3E%3Crect width=%22600%22 height=%22800%22 fill=%22%23d9aaa7%22/%3E%3C/svg%3E" alt="Teszt kép"><span>Kép előnézet</span>';
            });
            await expect(preview).toHaveAttribute('role', 'button');
            await expect(preview).toHaveAttribute('aria-label', 'Kép nagyítása');

            await preview.click();
            const lightbox = page.locator('#cms-image-lightbox');
            await expect(lightbox).toBeVisible();
            await expect(lightbox.locator('[data-cms-image-lightbox-image]')).toHaveAttribute('alt', 'Teszt kép');
            await page.keyboard.press('Escape');
            await expect(lightbox).toBeHidden();

            expect(browserErrors).toEqual([]);
        });
    }

});


async function photoNav(page,group){
 const dock=page.locator('.admin-v2-mobile-dock [data-admin-v2-nav="'+group+'"]');
 if(await dock.isVisible()){await dock.click();return;}
 if(await page.locator('.admin-sidebar').isVisible()){await page.locator('.admin-sidebar [data-admin-v2-nav="'+group+'"]').click();return;}
 await page.getByRole('button',{name:'További menüpontok',exact:true}).click();await page.locator('dialog [data-admin-v2-nav="'+group+'"]').click();await expect(page.locator('dialog[open]:has([data-admin-v2-nav])')).toHaveCount(0);
}
test('photo parity: mobile controls and all destinations',async({page})=>{
 const errors=await openAdmin(page,{width:390,height:844});
 for(const group of ['foglalasok','munkaido','weboldal','arlista','galeria','vendegek','arkalkulator','kuponok','kommunikacio','beallitasok','attekintes']){
  await photoNav(page,group);await page.waitForTimeout(150);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),group+' viewport').toBe(true);
  const overflow=await page.locator('.admin-workspace-main').evaluate(root=>Array.from(root.querySelectorAll('input,select,button.admin-select-trigger')).filter(e=>e.getClientRects().length&&getComputedStyle(e).opacity!=='0'&&!e.closest('[hidden],.cms-view-tabs,.cms-section-index,dialog:not([open])')).filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1||r.left< -1;}).map(e=>e.outerHTML.slice(0,120)));
  expect(overflow,group+' controls').toEqual([]);
  await page.screenshot({path:'.impeccable/review/admin-photo-'+group+'-390.png'});
 }
 expect(errors).toEqual([]);
});
test('photo parity: payment auto-completes online and manual, and keeps other drafts',async({page})=>{
 const errors=await openAdmin(page,{width:390,height:844});await photoNav(page,'foglalasok');
 for(const [id,amount]of [['00000000-0000-4000-8000-000000000001','7200'],['00000000-0000-4000-8000-000000000100','5300']]){
  await page.locator('#admin-foglalas-kereses').fill(id);
  const card=page.locator('#admin-foglalas-lista .admin-foglalas-kartya').first();await card.locator('h3').click();
  const dialog=page.locator('dialog.admin-editor-sheet[open]');const paid=dialog.locator('[data-idopont-mezo="paid_amount"]');await paid.fill(amount);await paid.press('Enter');
  await expect.poll(()=>page.evaluate(()=>window.__adminLastRpc?.args?.p_changes?.[0]?.paid_amount)).toBe(Number(amount));
  await expect(dialog.locator('[data-foglalas-statusz]')).toHaveValue('done');
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
  await photoNav(page,'attekintes');await photoNav(page,'foglalasok');await page.locator('#admin-foglalas-kereses').fill(id);await expect(page.locator('#admin-foglalas-lista [data-foglalas-statusz]')).toHaveValue('done');
 }
 expect(errors).toEqual([]);
});
test('photo parity: inline content, block editor, conflict and durable save',async({page})=>{
 const errors=await openAdmin(page,{width:390,height:844});await photoNav(page,'weboldal');await page.locator('[data-cms-section="1"]').click();
 await expect(page.locator('.cms-section-body')).toBeVisible();await expect(page.locator('dialog[open]')).toHaveCount(0);
 const field=page.locator('[data-cms-path="hero.cim"]');const editable=page.locator('.cms-section-body input[data-cms-path]:not([type="checkbox"]):not([type="hidden"])').first();await editable.fill('Helyi referencia teszt');
 await page.locator('.cms-block-edit').first().click();const dialog=page.locator('dialog.admin-editor-sheet[open]');await expect(dialog).toBeVisible();await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
 await page.evaluate(()=>window.__adminSaveConflict=true);await page.locator('[data-studio-save]').click();await expect(page.locator('#admin-online-status')).toContainText('közben módosult');await expect(editable).toHaveValue('Helyi referencia teszt');
 await page.evaluate(()=>window.__adminSaveConflict=false);await page.locator('[data-studio-save]').click();await expect(page.locator('#admin-online-status')).toContainText('mentve');await expect(page.locator('#admin-publication-status')).toHaveAttribute('data-publication-state','pending');expect(errors).toEqual([]);
});
test('photo parity: calendar opens editor in place, equal times and new item drafts',async({page})=>{
 const errors=await openAdmin(page,{width:390,height:844});await photoNav(page,'foglalasok');await page.locator('[data-foglalas-nezet="naptar"]').click();
 await page.locator('[data-foglalas-naptar-ma]').click();const event=page.locator('[data-foglalas-naptar-megnyitas]:visible').first();await event.click();await expect(page.locator('dialog[open]')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('dialog[open]')).toHaveCount(0);await expect(page.locator('#admin-foglalas-naptar')).toBeVisible();
 await photoNav(page,'munkaido');await page.locator('.studio-bulk-schedule summary').click();const selected=page.locator('[data-naptar-datum]').first();if(await selected.count())await selected.click();
 await photoNav(page,'arlista');const before=await page.evaluate(()=>window.__adminLastInsert||null);await page.locator('#admin-szolgaltatas-hozzaadas').click();await expect(page.locator('[data-draft-new]')).toHaveCount(1);expect(await page.evaluate(()=>window.__adminLastInsert||null)).toEqual(before);await page.keyboard.press('Escape');
 expect(errors).toEqual([]);
});


test('photo fix verification: list drafts survive filtering and save through existing RPC',async({page})=>{
 const errors=await openAdmin(page,{width:390,height:844});await photoNav(page,'foglalasok');
 const search=page.locator('#admin-foglalas-kereses');await search.fill('00000000-0000-4000-8000-000000000002');
 await page.locator('#admin-foglalas-lista .admin-select-trigger--status').click();await page.getByRole('option',{name:'Teljesítve',exact:true}).click();
 await expect(page.locator('[data-studio-save]')).toBeVisible();await search.fill('Nagy Anna');await search.fill('Kiss Dorka');await expect(page.locator('#admin-foglalas-lista [data-foglalas-statusz]')).toHaveValue('done');
 await photoNav(page,'munkaido');await photoNav(page,'foglalasok');await expect(page.locator('#admin-foglalas-lista [data-foglalas-statusz]')).toHaveValue('done');await page.locator('[data-studio-save]').click();
 await expect.poll(()=>page.evaluate(()=>window.__adminLastRpc?.args?.p_changes?.some(i=>i.id==='00000000-0000-4000-8000-000000000002'&&i.status==='done'))).toBe(true);await expect(page.locator('#admin-online-status')).toContainText('mentve');
 expect(errors).toEqual([]);
});
test('photo fix verification: staged creation deletion and keyboard ordering',async({page})=>{
 const errors=await openAdmin(page,{width:390,height:844});await photoNav(page,'arlista');
 let card=page.locator('#admin-szolgaltatas-lista .admin-db-kartya').first();const id=await card.getAttribute('data-id');await card.locator('[data-studio-sort]').press('ArrowDown');await expect(page.locator('[data-studio-save]')).toHaveClass(/has-draft/);
 await page.locator('#admin-szolgaltatas-hozzaadas').click();let sheet=page.locator('dialog[open]');await sheet.locator('[data-mezo="name"]').fill('Csak helyi új tétel');await sheet.locator('[data-editor-save]').click();await expect(page.locator('#admin-online-status')).toContainText('mentve');await expect(page.locator('#admin-szolgaltatas-lista')).toContainText('Csak helyi új tétel');
 // Existing delete only writes on Save; removing a new draft never reaches the database.
 await page.locator('#admin-szolgaltatas-lista .admin-db-kartya').filter({hasText:'Csak helyi új tétel'}).locator('[data-admin-kartya-toggle]').click();page.once('dialog',d=>d.accept());await page.locator('dialog[open] [data-szolgaltatas-torles]').click();expect(await page.evaluate(()=>window.__adminLastDelete||null)).toBeNull();await page.locator('[data-studio-save]').click();await expect.poll(()=>page.evaluate(()=>window.__adminLastDelete?.table)).toBe('services');
 await photoNav(page,'kuponok');await page.locator('#admin-kupon-hozzaadas').click();await page.locator('dialog[open] [data-mezo="code"]').fill('LOCALONLY');await page.locator('dialog[open] [data-editor-save]').click();await expect(page.locator('#admin-kupon-lista')).toContainText('LOCALONLY');expect((await page.evaluate(()=>window.__adminLastInsert)).table).toBe('coupons');
 expect(errors).toEqual([]);
});
test('photo fix verification: swipe, drag duration and equal selected date times',async({page})=>{
 const errors=await openAdmin(page,{width:1440,height:1000});await photoNav(page,'foglalasok');await page.locator('[data-foglalas-nezet="het"]').click();
 const source=page.locator('.studio-week-event').first(),slot=page.locator('.studio-week-grid [data-studio-slot]').nth(40);const old=await source.getAttribute('data-foglalas-id');const a=await source.boundingBox(),b=await slot.boundingBox();await page.mouse.move(a.x+a.width/2,a.y+10);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.up();
 const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();const start=await dialog.locator('[data-idopont-mezo="start_time"]').inputValue(),end=await dialog.locator('[data-idopont-mezo="end_time"]').inputValue();expect(start).toMatch(/^\d{2}:\d{2}$/);expect(end).toMatch(/^\d{2}:\d{2}$/);expect(end).not.toBe(start);expect(await page.evaluate(()=>window.__adminLastRpc||null)).toBeNull();await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
 await page.setViewportSize({width:390,height:844});await photoNav(page,'munkaido');await page.locator('.studio-bulk-schedule summary').click();const day=page.locator('.admin-naptar-nap:not(:disabled)').first();await day.click();
 const row=page.locator('.admin-naptar-sor').first();await expect(row).toBeVisible();const widths=await row.locator('.admin-temporal-control').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));expect(Math.abs(widths[0]-widths[1])).toBeLessThan(1);expect(Math.min(...widths)).toBeGreaterThan(100);await page.screenshot({path:'.impeccable/review/admin-photo-selected-times-390.png'});
 // Stable root stays bound after week render; one gesture advances only the booking week.
 await photoNav(page,'foglalasok');const before=await page.locator('#admin-studio-week .studio-week-toolbar strong').textContent();await page.locator('#admin-studio-week .studio-week-toolbar').evaluate(el=>{const event=(type,x)=>{const ev=new Event(type,{bubbles:true});Object.defineProperties(ev,{touches:{value:type==='touchend'?[]:[{clientX:x,clientY:10}]},changedTouches:{value:[{clientX:x,clientY:10}]}});el.dispatchEvent(ev);};event('touchstart',220);event('touchend',100);});await expect(page.locator('#admin-studio-week .studio-week-toolbar strong')).not.toHaveText(before);expect(errors).toEqual([]);
});
test('photo fix verification: gallery editor search order and responsive captures',async({page})=>{
 const errors=await openAdmin(page,{width:390,height:844});await photoNav(page,'galeria');await expect(page.locator('#admin-cms-root')).toHaveAttribute('data-lumi-cms-gallery-context','images');await page.locator('.cms-gallery-thumbnail').first().click();const dialog=page.locator('dialog[open]');await expect(dialog.locator('[data-cms-path$="kepAlt"]')).toBeVisible();await dialog.locator('[data-cms-path$="kepAlt"]').fill('Kereshető helyi képleírás');await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await page.locator('[data-gallery-filter]').fill('Kereshető');await expect(page.locator('.cms-gallery-item:visible')).toHaveCount(1);await page.locator('[data-gallery-filter]').fill('');await page.locator('.cms-gallery-item [data-studio-sort]').first().press('ArrowDown');
 await page.screenshot({path:'.impeccable/review/admin-photo-gallery-final-390.png'});
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:1000});for(const group of ['attekintes','foglalasok','weboldal','munkaido']){await photoNav(page,group);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),group+' '+width).toBe(true);if(width!==320)await page.screenshot({path:'.impeccable/review/admin-photo-final-'+group+'-'+width+'.png'});}}
 expect(errors).toEqual([]);
});


test('photo final: guests, touch ordering, appearance and final captures',async({page})=>{
 const errors=await openAdmin(page,{width:390,height:844},{standalone:true});await photoNav(page,'vendegek');await page.locator('[data-guest-search]').fill('Nagy Anna');await expect(page.locator('.admin-vendeg-sor')).toHaveCount(1);await page.locator('[data-guest-email]').first().click();await expect(page.locator('dialog[open] .studio-history-record')).toHaveCount(1);await expect(page.locator('dialog[open] footer')).toBeHidden();await page.locator('[data-guest-rebook]').click();await expect(page.locator('dialog[open] #admin-tiltas-ok')).toHaveValue('Nagy Anna');await page.keyboard.press('Escape');await expect(page.locator('dialog[open]')).toHaveCount(0);
 await photoNav(page,'arlista');const first=page.locator('.admin-szolgaltatas-kartya').first(),second=page.locator('.admin-szolgaltatas-kartya').nth(1);const original=await first.getAttribute('data-id');const target=await second.boundingBox();await first.locator('[data-studio-sort]').dispatchEvent('pointerdown',{pointerType:'touch',pointerId:9,button:0});await page.locator('#admin-tartalom').dispatchEvent('pointermove',{pointerType:'touch',pointerId:9,clientX:target.x+target.width/2,clientY:target.y+target.height/2});await page.locator('#admin-tartalom').dispatchEvent('pointerup',{pointerType:'touch',pointerId:9});await expect(page.locator('.admin-szolgaltatas-kartya').nth(1)).toHaveAttribute('data-id',original);await expect(page.locator('[data-studio-save]')).toHaveClass(/has-draft/);await page.screenshot({path:'.impeccable/review/admin-photo-final-prices-390.png'});
 await photoNav(page,'beallitasok');await page.getByRole('combobox',{name:/^Megjelenés:/}).click();await page.getByRole('option',{name:'Sötét',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-admin-theme','dark');await page.screenshot({path:'.impeccable/review/admin-photo-final-dark-390.png'});await page.getByRole('combobox',{name:/^Megjelenés:/}).click();await page.getByRole('option',{name:'Világos',exact:true}).click();await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content',/user-scalable=no/);
 for(const width of [390,1440]){await page.setViewportSize({width,height:1000});for(const group of ['attekintes','foglalasok','weboldal','galeria']){await photoNav(page,group);await page.screenshot({path:'.impeccable/review/admin-photo-final-'+group+'-'+width+'.png'});}}
 expect(errors).toEqual([]);
});
