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
                work_date: dateKey(7), start_time:'09:00',end_time:'17:00',slot_step_minutes:30,
                starts_at: isoAt(7, 9),
                ends_at: isoAt(7, 17),
                active: true
            },
            {
                id: 'window-2',
                work_date: dateKey(30), start_time:'09:00',end_time:'17:00',slot_step_minutes:30,
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

async function installSupabaseBoundaryMock(page,overrides={}) {
    const data = {...fixtures(),...overrides};

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
        window.__referenceSeed = () => clone(seed);
        window.__adminReplaceRows = (table,rows) => {seed[table]=clone(rows);};
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
            order(key, options = {}) { (this.sorts ||= []).push({ key, ascending: options.ascending !== false }); return this; }
            limit(count) { this.rowLimit = count; return this; }
            range() { return this; }
            abortSignal() { return this; }
            throwOnError() { return this; }
            insert(values) {
                if (this.table === 'booking_events' && window.__adminNotificationReadFailure &&
                    (Array.isArray(values) ? values : [values]).some(row => row.event_type === 'admin_notifications_read')) {
                    this.insertError = { message: 'Synthetic read-state write failure' };
                    return this;
                }
                const records = (Array.isArray(values) ? values : [values]).map((value, index) => {
                    const record = clone(value);
                    if(this.table==='booking_events'&&!record.created_at)record.created_at=new Date().toISOString();
                    if (!record.id) record.id = `mock-${this.table}-${Date.now()}-${index}`;
                    if (this.table === 'blocked_times' && record.service_id) {
                        const service = seed.services.find(item => item.id === record.service_id);
                        if (service) record.services = clone(service);
                    }
                    return record;
                });
                seed[this.table] = [...(seed[this.table] || []), ...records];
                this.insertedRecords=records;
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
                this.filters.push(row => String(key.includes('->>') ? row?.[key.split('->>')[0]]?.[key.split('->>')[1]] : row?.[key]) === String(value));
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
                if (this.insertError) return { data: null, error: this.insertError };
                if (this.table === 'admin_error_events' && window.__adminErrorLogLoadFailure) return { data: null, error: { message: 'Synthetic log read failure' } };
                if (this.patch) {
                    for (const row of seed[this.table] || []) if (this.filters.every(filter => filter(row))) Object.assign(row, this.patch);
                    this.patch = null;
                }
                if(this.deleting){window.__adminLastDelete={table:this.table};seed[this.table]=(seed[this.table]||[]).filter(row=>!this.filters.every(filter=>filter(row)));this.deleting=false;}
                let rows = clone(this.insertedRecords || seed[this.table] || []);
                for (const filter of this.filters) rows = rows.filter(filter);
                if (this.sorts) rows.sort((a, b) => {
                    for (const { key, ascending } of this.sorts) {
                        if (a[key] === b[key]) continue;
                        return (a[key] > b[key] ? 1 : -1) * (ascending ? 1 : -1);
                    }
                    return 0;
                });
                if (this.rowLimit !== undefined) rows = rows.slice(0, this.rowLimit);
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
                if (name === 'admin_mark_error_logs_read') {
                    if(window.__adminErrorLogReadFailure)return {data:null,error:{message:'Synthetic log cursor failure'}};
                    const last=Math.min(Number(args.p_last_seen_id),Math.max(0,...(seed.admin_error_events || []).map(row=>Number(row.id))));
                    seed.admin_error_log_reads ||= [];
                    let row=seed.admin_error_log_reads.find(row=>row.user_id===session.user.id);
                    if(!row){row={user_id:session.user.id,last_seen_id:0};seed.admin_error_log_reads.push(row);}
                    row.last_seen_id=Math.max(row.last_seen_id,last);
                    return {data:null,error:null};
                }
                if(name==='clear_booking_inspiration'){const row=seed.bookings.find(row=>row.id===args.p_booking_id);if(row){row.inspiration_images=[];row.inspiration_image_url=null;}return {data:true,error:null};}
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
                    if(window.__adminBookingConflict)return {data:null,error:{message:'Az időpont ütközik.'}};
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
                from: bucket => ({
                    list: async () => ({ data: [], error: null }),
                    upload: async (path,file) => {window.__adminLastUpload={bucket,path,size:file.size,type:file.type};return {data:{path},error:null};},
                    getPublicUrl:path=>({data:{publicUrl:'https://images.example.test/'+path}}),
                    remove: async () => ({ data: [], error: null }),
                    createSignedUrl: async () => ({ data: { signedUrl: '' }, error: null })
                    ,createSignedUrls:async paths=>({data:paths.map(path=>({signedUrl:'https://private.example.test/'+path})),error:null})
                })
            }
        };

        window.supabase = { createClient: () => client };
        window.__adminEmitAuth = (event,next=session) => authListeners.forEach(callback => callback(event, next));
    }, data);
}


module.exports={installSupabaseBoundaryMock,fixtures};
