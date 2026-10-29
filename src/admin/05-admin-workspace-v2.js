    const ADMIN_V2_TAB_GROUPS = Object.freeze({
        attekintes: 'attekintes',
        foglalasok: 'foglalasok',
        arkalkulator: 'arkalkulator',
        vendegek: 'vendegek',
        idosavok: 'munkaido',
        tiltasok: 'munkaido',
        szovegek: 'weboldal',
        szolgaltatasok: 'arlista',
        kuponok: 'kuponok',
        esemenynaplo: 'kommunikacio',
        emailteszt: 'emailteszt',
        beallitasok: 'beallitasok'
    });

    const ADMIN_V2_PAGE_COPY = Object.freeze({
        foglalasok: {
            kicker: 'Foglalások és kieső idők',
            title: 'Foglalások',
            save: 'Módosítások mentése'
        },
        arkalkulator: {
            kicker: 'Gyors árazás',
            title: 'Árkalkulátor'
        },
        vendegek: {
            kicker: 'Vendégfiókok',
            title: 'Regisztrált tagok'
        },
        idosavok: {
            kicker: 'Elérhetőség',
            title: 'Beosztás',
            save: 'Munkaidő mentése'
        },
        tiltasok: {
            kicker: 'Elérhetőség',
            title: 'Kieső időszakok',
            save: 'Kieső idő mentése'
        },
        szovegek: {
            kicker: 'Tartalomkezelés',
            title: 'Weboldal',
            save: 'Tartalom mentése'
        },
        szolgaltatasok: {
            kicker: 'Weboldal és foglalás',
            title: 'Szolgáltatások és árlista',
            save: 'Árlista mentése'
        },
        kuponok: {
            kicker: 'Weboldal és foglalás',
            title: 'Ajánlatok és kuponok',
            save: 'Kuponok mentése'
        },
        esemenynaplo: {
            kicker: 'Emailek és értesítések',
            title: 'Kommunikáció'
        },
        emailteszt: {
            kicker: 'Emailek és értesítések',
            title: 'Email ellenőrzés'
        },
        beallitasok: {
            kicker: 'Rendszer és fiók',
            title: 'Beállítások',
            save: 'Beállítások mentése'
        }
    });

    const ADMIN_V2_THEME_STORAGE_KEY = 'lumi-admin-theme';

    function adminV2TemaOlvasasa() {
        const fallback = document.documentElement.dataset.adminTheme === 'dark' ? 'dark' : 'light';
        try {
            const saved = window.localStorage.getItem(ADMIN_V2_THEME_STORAGE_KEY);
            if (saved === 'dark' || saved === 'light' || saved === 'auto') return saved;
        } catch (_) {
            return fallback;
        }
        return fallback;
    }

    function adminV2TemaAlkalmazasa(theme, persist = false) {
        const mode=['dark','light','auto'].includes(theme)?theme:'auto';
        const normalized = mode==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode;
        document.documentElement.dataset.adminTheme = normalized;
        const toggle = document.querySelector('[data-admin-v2-dark-mode]');
        if (toggle) {
            const dark = normalized === 'dark';
            toggle.checked = dark;
            toggle.setAttribute('aria-checked', String(dark));
        }
        if (persist) {
            try {
                window.localStorage.setItem(ADMIN_V2_THEME_STORAGE_KEY, mode);
            } catch (_) {
                // The visual mode still works for this session when storage is unavailable.
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        adminV2Inicializalasa();
    });

    function adminV2Inicializalasa() {
        const body = document.body;
        const tartalom = document.getElementById('admin-tartalom');
        const sidebar = document.querySelector('.admin-sidebar');
        const workspaceMain = document.querySelector('.admin-workspace-main');
        if(window.LumiReferenceUiActive){if(workspaceMain){adminV2VendegPanelLetrehozasa(workspaceMain);adminV2BeallitasokPanelLetrehozasa(workspaceMain);}return;}

        if (!body || !tartalom || !sidebar || !workspaceMain || body.dataset.adminV2Ready === 'true') {
            return;
        }

        body.dataset.adminV2Ready = 'true';
        body.classList.add('admin-v2');
        adminV2TemaAlkalmazasa(adminV2TemaOlvasasa());
        workspaceMain.id = workspaceMain.id || 'admin-v2-main';
        workspaceMain.tabIndex = -1;

        adminV2SkipLinkLetrehozasa(body, workspaceMain);
        adminV2AttekintesPanelLetrehozasa(workspaceMain);
        adminV2VendegPanelLetrehozasa(workspaceMain);
        adminV2BeallitasokPanelLetrehozasa(workspaceMain);
        adminV2SidebarLetrehozasa(sidebar);
        adminV2TopbarLetrehozasa(tartalom);
        adminV2MobilNavigacioLetrehozasa(tartalom);
        adminV2PanelFejlecekLetrehozasa();
        adminV2AlmenuLetrehozasa();
        adminV2EsemenyekKapcsolasa(tartalom);
        adminV2AdatFigyelokKapcsolasa();
        adminV2NaphatarFrissitesKapcsolasa();
        adminStudioInicializalas();

        allapot.aktivTab = 'attekintes';
        adminV2Valtas('attekintes');

        const sessionFigyelo = new MutationObserver(() => {
            if (!tartalom.hidden) {
                adminV2Valtas(allapot.aktivTab || 'attekintes');
                adminV2AttekintesFrissitese();
            }
        });
        sessionFigyelo.observe(tartalom, { attributes: true, attributeFilter: ['hidden'] });
    }

    function adminV2SkipLinkLetrehozasa(body, workspaceMain) {
        if (document.querySelector('.admin-v2-skip-link')) return;
        const link = document.createElement('a');
        link.className = 'admin-v2-skip-link';
        link.href = `#${workspaceMain.id}`;
        link.textContent = 'Ugr' + String.fromCharCode(225) + 's a tartalomhoz';
        body.prepend(link);
    }

    function adminV2SidebarLetrehozasa(sidebar) {
        const create=document.createElement('button');create.type='button';create.className='admin-v2-button admin-v2-button-primary studio-desktop-create';create.dataset.studioNew='';create.innerHTML=`${adminV2Ikon('plus')}Új időpont`;create.addEventListener('click',()=>adminStudioKeziPanel());
        const nav = document.createElement('nav');
        nav.className = 'admin-v2-nav';
        nav.setAttribute('aria-label', 'Admin fő navigáció');
        nav.innerHTML = [
            ['attekintes','Áttekintés','overview'], ['weboldal','Szövegek','website'],
            ['arlista','Árlista','calculator'], ['galeria','Galéria','website'],
            ['foglalasok','Foglalások','calendar'], ['munkaido','Beosztás','clock'],
            ['vendegek','Vendégek','users'], ['arkalkulator','Árkalkulátor','calculator'],
            ['kuponok','Kuponok','check'], ['beallitasok','Beállítások','settings'],
            ['kommunikacio','Eseménynapló','mail'], ['emailteszt','E-mail ellenőrzés','mail']
        ].map(([group,label,icon]) => adminV2NavGomb(group,label,adminV2Ikon(icon),group==='foglalasok'?'<span class="admin-v2-nav-count" data-admin-v2-pending-count>0</span>':'')).join('');
        const bottom = document.createElement('div');
        bottom.className='admin-v2-sidebar-bottom';
        bottom.innerHTML=`<a href="/" class="admin-v2-public-link">${adminV2Ikon('website')}Weboldal megnyitása</a><button type="button" class="admin-v2-nav-item" data-admin-v2-logout>${adminV2Ikon('arrow')}Kilépés</button>`;
        sidebar.querySelector('.admin-tabs')?.classList.add('admin-v2-legacy-tabs');
        sidebar.prepend(nav); sidebar.prepend(create); sidebar.append(bottom); sidebar.classList.add('admin-v2-sidebar');
    }

    function adminV2NavGomb(group, label, icon, suffix = '') {
        return `
            <button type="button" class="admin-v2-nav-item" data-admin-v2-nav="${group}">
                ${icon}<span>${label}</span>${suffix}
            </button>
        `;
    }

    function adminV2TopbarLetrehozasa(tartalom) {
        const header=document.createElement('header');header.className='admin-v2-topbar';
        header.innerHTML=`<a href="/admin/" class="admin-v2-studio-brand" data-admin-v2-home aria-label="Admin áttekintés"><span class="admin-v2-brand-mark" aria-hidden="true">LN</span><span><strong>LumiNails</strong><small data-admin-v2-current-label>Áttekintés</small></span></a><div class="admin-v2-topbar-actions"><span class="admin-v2-toolbar-status" data-studio-status role="status"></span><div class="admin-v2-notification-wrap"><button type="button" class="admin-v2-icon-button" data-admin-v2-notifications-toggle aria-label="Értesítések megnyitása" aria-expanded="false" aria-controls="admin-v2-notification-panel">${adminV2Ikon('bell')}<span class="admin-v2-notification-dot" data-admin-v2-email-alert data-admin-v2-notification-alert hidden></span></button><section id="admin-v2-notification-panel" class="admin-v2-notification-panel" data-admin-v2-notification-panel aria-label="Értesítések" hidden><header><strong>Értesítések</strong><small data-admin-v2-notification-summary>Minden rendezve</small></header><ul data-admin-v2-notification-list></ul></section></div><button type="button" class="admin-v2-icon-button" data-studio-refresh aria-label="Aktuális felület frissítése">${adminV2Ikon('refresh')}</button><button type="button" class="admin-v2-button admin-v2-button-primary" data-studio-save>${adminV2Ikon('check')}Mentés</button></div>`;
        header.addEventListener('click',async event=>{
            if(event.target.closest('[data-studio-save]')) { if(allapot.aktivTab==='szovegek') document.getElementById('admin-cms-save')?.click(); else await lebegoMentes(); }
            if(event.target.closest('[data-studio-refresh]')) await adminStudioAktualisFrissites();
        });
        tartalom.prepend(header);
    }

    function adminV2MobilNavigacioLetrehozasa(tartalom) {
        const dock=document.createElement('nav');dock.className='admin-v2-mobile-dock';dock.setAttribute('aria-label','Gyors navigáció');
        dock.innerHTML=`<button type="button" data-admin-v2-nav="attekintes" aria-pressed="false">${adminV2Ikon('overview')}<span>Ma</span></button><button type="button" data-admin-v2-nav="foglalasok" aria-pressed="false">${adminV2Ikon('calendar')}<span>Foglalások</span></button><button type="button" class="admin-v2-dock-add" data-studio-new aria-label="Új időpont">${adminV2Ikon('plus')}<span>Új időpont</span></button><button type="button" data-admin-v2-nav="munkaido" aria-pressed="false">${adminV2Ikon('clock')}<span>Beosztás</span></button><button type="button" data-admin-v2-menu aria-label="További menüpontok" aria-expanded="false">${adminV2Ikon('menu')}<span>Továbbiak</span></button>`;
        dock.querySelector('[data-studio-new]').addEventListener('click',()=>adminStudioKeziPanel());
        const more=document.createElement('div');more.className='admin-studio-more';more.hidden=true;
        more.innerHTML=document.querySelector('.admin-v2-nav').innerHTML+`<a href="/" class="admin-v2-public-link">Weboldal megnyitása</a><button type="button" class="admin-v2-nav-item" data-admin-v2-logout>Kilépés</button>`;
        more.querySelectorAll('[data-admin-v2-nav]').forEach(button=>{if(['attekintes','foglalasok','munkaido'].includes(button.dataset.adminV2Nav))button.remove();});
        tartalom.append(dock,more);
    }

    function adminV2AttekintesPanelLetrehozasa(main) {
        const panel=document.createElement('div');panel.id='admin-panel-attekintes';panel.className='admin-db-panel';
        panel.innerHTML=`<div class="admin-v2-page-heading"><div><h1>A szalon ma</h1><p>${adminV2MaiDatumFelirat()}</p></div><button type="button" class="admin-v2-button" data-admin-v2-panel="foglalasok" data-admin-v2-booking-view="naptar">Naptár ${adminV2Ikon('arrow')}</button></div>
        <section class="studio-surface"><header class="studio-section-heading"><h2>Rögzített bevétel</h2><small>Az időpont dátuma szerinti fizetett összegek</small></header><div class="studio-revenue-grid"><button type="button" data-studio-period="week"><span>Ezen a héten</span><strong data-studio-revenue-week>—</strong><small data-studio-revenue-week-count>Betöltés…</small></button><button type="button" data-studio-period="month"><span>Ebben a hónapban</span><strong data-studio-revenue-month>—</strong><small data-studio-revenue-month-count>Betöltés…</small></button></div><p class="studio-data-scope" data-studio-data-scope></p><div class="studio-revenue-picker" hidden><label class="admin-mezo">Időszak<input type="month" data-studio-revenue-month-input></label></div></section>
        <section class="studio-surface"><header class="studio-section-heading"><h2>Teendők</h2><span data-admin-v2-task-summary></span></header><ol class="admin-v2-task-list" data-admin-v2-task-list></ol></section>
        <div class="studio-inline-stats"><button type="button" data-admin-v2-panel="foglalasok"><strong id="admin-v2-stat-today">0</strong><span>ma</span></button><button type="button" data-studio-pending><strong id="admin-v2-stat-pending">0</strong><span>visszaigazolás</span></button><button type="button" data-admin-v2-panel="foglalasok"><strong data-studio-week-count>0</strong><span>7 napon belül</span></button></div>
        <div data-studio-next></div><div class="studio-agenda-grid"><section><header class="studio-section-heading"><h2>Mai időpontok</h2><small data-admin-v2-today-summary></small></header><ol class="admin-v2-schedule-list" data-admin-v2-today-list></ol></section><section><header class="studio-section-heading"><h2>Következő vendégek</h2></header><ol class="admin-v2-upcoming-list" data-admin-v2-upcoming-list></ol></section></div>
        <h2 class="studio-statistics-title">Statisztikák</h2><div class="studio-agenda-grid studio-statistics"><section class="studio-surface"><header class="studio-section-heading"><h2>Foglalási statisztika</h2><input type="month" data-studio-outcome-month aria-label="Foglalási statisztika hónapja"></header><div data-studio-outcomes></div></section><section class="studio-surface"><header class="studio-section-heading"><h2>Bevétel alakulása</h2><small>Rögzített összegek · 6 hónap</small></header><div class="studio-chart" data-studio-chart role="img" aria-label="Havi rögzített bevételek"></div></section></div>
        <div class="studio-secondary-stats"><span>Emailproblémák <strong id="admin-v2-stat-email">0</strong></span><span>Foglalható napok <strong id="admin-v2-stat-horizon">—</strong></span><small id="admin-v2-stat-horizon-meta"></small></div>`;
        main.prepend(panel);
        panel.querySelectorAll('[data-studio-period]').forEach(button=>button.addEventListener('click',()=>adminStudioIdoszakValaszto(button.dataset.studioPeriod,panel)));
        panel.querySelector('[data-studio-revenue-month-input]').addEventListener('change',event=>{if(panel.querySelector('.studio-revenue-picker').dataset.period==='week'){adminStudioStatisztikaHet=event.target.value;adminStudioStatisztikaFrissites();}else adminStudioStatisztikaFrissites(event.target.value);});
        panel.querySelector('[data-studio-outcome-month]').addEventListener('change',event=>adminStudioStatisztikaFrissites(event.target.value));
    }

    function adminV2StatKartya(label, valueId, icon, tone = '') {
        return `
            <article class="admin-v2-stat-card${tone ? ` admin-v2-stat-${tone}` : ''}">
                <div><p>${label}</p><span>${adminV2Ikon(icon)}</span></div>
                <strong id="${valueId}">—</strong>
                <small id="${valueId}-meta">Adatok betöltése…</small>
            </article>
        `;
    }

    function adminV2BeallitasokPanelLetrehozasa(workspaceMain) {
        if (document.getElementById('admin-panel-beallitasok')) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'admin-panel-beallitasok';
        panel.className = 'admin-db-panel admin-v2-settings-panel';
        panel.innerHTML = `
            <section class="admin-v2-settings-card">
                <div class="admin-v2-settings-header">
                    <h2>Megjelenés</h2>
                    <p>Az admin felület megjelenésének beállításai.</p>
                </div>
                <label class="admin-v2-setting-row" for="admin-sotet-mod">
                    <span><strong>Sötét mód</strong><small>Sötét színvilág az admin minden nézetében.</small></span>
                    <input type="checkbox" id="admin-sotet-mod" data-admin-v2-dark-mode role="switch" aria-label="Sötét mód">
                </label>
            </section>
            <section class="admin-v2-settings-card">
                <div class="admin-v2-settings-header">
                    <h2>Weboldali elérhetőség</h2>
                    <p>A publikus oldalon megjelenő kapcsolati beállítások.</p>
                </div>
                <label class="admin-v2-setting-row" for="admin-telefon-lathato">
                    <span><strong>Telefonszám megjelenítése</strong><small>A fejlécben és a kapcsolatfelvételi lehetőségeknél.</small></span>
                    <input type="checkbox" id="admin-telefon-lathato">
                </label>
            </section>
            <section class="admin-v2-settings-card">
                <div class="admin-v2-settings-header">
                    <h2>Fiók és biztonság</h2>
                    <p>A bejelentkezett adminfiók kezelése.</p>
                </div>
                <div class="admin-v2-account-actions">
                    <button type="button" class="admin-v2-button admin-v2-button-secondary" data-admin-v2-password>Jelszó módosítása</button>
                    <button type="button" class="admin-v2-button admin-v2-button-secondary" data-admin-v2-logout>Kijelentkezés</button>
                </div>
                <div class="admin-v2-password-slot"></div>
            </section>
        `;
        workspaceMain.append(panel);

        const slot = panel.querySelector('.admin-v2-password-slot');
        const form = document.getElementById('admin-jelszo-form');
        const status = document.getElementById('admin-jelszo-status');
        if (form) slot.append(form);
        if (status) slot.append(status);

        const temaKapcsolo = panel.querySelector('[data-admin-v2-dark-mode]');
        if (temaKapcsolo) {
            adminV2TemaAlkalmazasa(adminV2TemaOlvasasa());
            temaKapcsolo.addEventListener('change', () => {
                adminV2TemaAlkalmazasa(temaKapcsolo.checked ? 'dark' : 'light', true);
            });
        }
    }

    function adminV2PanelFejlecekLetrehozasa() {
        Object.entries(ADMIN_V2_PAGE_COPY).forEach(([tab, copy]) => {
            const panel = document.getElementById(`admin-panel-${tab}`);
            if (!panel || panel.querySelector(':scope > .admin-v2-page-heading')) {
                return;
            }

            const heading = document.createElement('div');
            heading.className = 'admin-v2-page-heading';
            heading.innerHTML = `
                <div>
                    <p class="admin-v2-kicker">${copy.kicker}</p>
                    <h1>${copy.title}</h1>
                </div>
                ${copy.save ? `<div class="admin-v2-page-actions"><button type="button" class="admin-v2-button admin-v2-button-primary" data-admin-v2-save>${adminV2Ikon('check')}<span>${copy.save}</span></button></div>` : ''}
            `;

            const pageActions = heading.querySelector('.admin-v2-page-actions');
            const exportGomb = tab === 'foglalasok'
                ? document.getElementById('admin-foglalas-export')
                : null;
            const frissitesGomb = tab === 'foglalasok'
                ? document.getElementById('admin-foglalas-frissites')
                : null;
            if (pageActions && exportGomb) {
                exportGomb.classList.remove('admin-kis-gomb');
                exportGomb.classList.add('admin-v2-button', 'admin-v2-button-secondary');
                pageActions.append(exportGomb);
            }
            if (pageActions && frissitesGomb) {
                const regiMuveletTarolo = frissitesGomb.closest('.admin-foglalas-muvelet-tarolo');
                frissitesGomb.className = 'admin-v2-button admin-v2-button-secondary admin-v2-refresh-action';
                pageActions.append(frissitesGomb);
                if (regiMuveletTarolo && !regiMuveletTarolo.children.length) regiMuveletTarolo.remove();
            }

            const kapcsolodoMuvelet = {
                szovegek: document.getElementById('admin-cms-reload'),
                szolgaltatasok: document.getElementById('admin-szolgaltatas-hozzaadas'),
                kuponok: document.getElementById('admin-kupon-hozzaadas')
            }[tab];
            if (pageActions && kapcsolodoMuvelet) {
                const isReload = tab === 'szovegek';
                const regiTarolo = kapcsolodoMuvelet.closest('.admin-panel-akciok');
                kapcsolodoMuvelet.className = 'admin-v2-button admin-v2-button-secondary';
                kapcsolodoMuvelet.innerHTML = `${adminV2Ikon(isReload ? 'refresh' : 'plus')}<span>${isReload ? 'Újratöltés' : kapcsolodoMuvelet.textContent}</span>`;
                pageActions.prepend(kapcsolodoMuvelet);
                if (regiTarolo && !regiTarolo.children.length) regiTarolo.remove();
            }

            panel.prepend(heading);
        });
    }

    function adminV2AlmenuLetrehozasa() {
        const groups = [
            {
                tabs: ['idosavok', 'tiltasok'],
                items: [
                    ['idosavok', 'Foglalható napok'],
                    ['tiltasok', 'Kieső időszakok']
                ]
            },
            {
                tabs: ['szovegek', 'szolgaltatasok', 'kuponok'],
                items: [
                    ['szovegek', 'Oldalak és galéria'],
                    ['szolgaltatasok', 'Szolgáltatások'],
                    ['kuponok', 'Ajánlatok és kuponok']
                ]
            },
            {
                tabs: ['esemenynaplo', 'emailteszt'],
                items: [
                    ['esemenynaplo', 'Küldési események'],
                    ['emailteszt', 'Tesztküldés'],
                    ['email-sablonok', 'Email sablonok']
                ]
            }
        ];

        groups.forEach(group => {
            group.tabs.forEach(tab => {
                const panel = document.getElementById(`admin-panel-${tab}`);
                const heading = panel?.querySelector(':scope > .admin-v2-page-heading');
                if (!panel || !heading) return;

                const nav = document.createElement('nav');
                nav.className = 'admin-v2-subnav admin-segmented';
                nav.setAttribute('aria-label', 'Kapcsolódó adminnézetek');
                nav.innerHTML = group.items.map(([target, label]) => `
                    <button type="button" class="admin-segmented-item" data-admin-v2-panel="${target}">${label}</button>
                `).join('');
                heading.after(nav);
            });
        });

        const eventPanel = document.getElementById('admin-panel-esemenynaplo');
        const subnav = eventPanel?.querySelector('.admin-v2-subnav');
        if (eventPanel && subnav && !document.getElementById('admin-v2-communication-summary')) {
            const summary = document.createElement('section');
            summary.id = 'admin-v2-communication-summary';
            summary.className = 'admin-v2-communication-summary';
            summary.innerHTML = `
                ${adminV2MiniStat('Mai email esemény', 'admin-v2-email-today')}
                ${adminV2MiniStat('Sikeres', 'admin-v2-email-success')}
                ${adminV2MiniStat('Nyitott hibák', 'admin-v2-email-failed')}
                ${adminV2MiniStat('Legutóbbi hiba', 'admin-v2-email-last-error')}
                <div class="admin-v2-communication-action">
                    <p data-admin-v2-email-ack-summary>Nincs nyitott emailhiba.</p>
                    <button type="button" class="admin-v2-button admin-v2-button-secondary" data-admin-v2-ack-email-errors hidden>Emailhibák nyugtázása</button>
                </div>
            `;
            subnav.after(summary);
        }
    }

    function adminV2MiniStat(label, id) {
        return `<div><span>${label}</span><strong id="${id}">—</strong></div>`;
    }

    function adminV2EsemenyekKapcsolasa(tartalom) {
        tartalom.addEventListener('click', event => {
            const adminHome = event.target.closest('[data-admin-v2-home]');
            if (adminHome) {
                event.preventDefault();
                adminV2Valtas('attekintes');
                return;
            }

            const notificationToggle = event.target.closest('[data-admin-v2-notifications-toggle]');
            if (notificationToggle) {
                adminV2ErtesitesekValtasa();
                return;
            }

            const notificationTarget = event.target.closest('[data-admin-v2-notification-target]');
            if (notificationTarget) {
                adminV2ErtesitesMegnyitasa(notificationTarget.dataset.adminV2NotificationTarget);
                return;
            }

            const nav = event.target.closest('[data-admin-v2-nav]');
            if (nav) {
                adminV2CsoportMegnyitasa(nav.dataset.adminV2Nav);
                return;
            }

            const panel = event.target.closest('[data-admin-v2-panel]');
            if (panel) {
                const target = panel.dataset.adminV2Panel;
                if (target === 'email-sablonok') {
                    adminV2EmailSablonokMegnyitasa();
                } else {
                    adminV2Valtas(target);
                    if (panel.dataset.adminV2BookingView) {
                        adminV2FoglalasNezetBeallitasa(panel.dataset.adminV2BookingView);
                    }
                }
                return;
            }

            const booking = event.target.closest('[data-admin-v2-booking-search]');
            if (booking) {
                adminV2FoglalasKeresese(booking.dataset.adminV2BookingSearch);
                return;
            }

            const emailAcknowledgement = event.target.closest('[data-admin-v2-ack-email-errors]');
            if (emailAcknowledgement) {
                adminV2EmailHibakNyugtazasa(emailAcknowledgement);
                return;
            }

            if (event.target.closest('[data-admin-v2-save]')) {
                const aktivPanel = event.target.closest('.admin-db-panel');
                if (aktivPanel?.id === 'admin-panel-szovegek') {
                    document.getElementById('admin-cms-save')?.click();
                    return;
                }
                lebegoMentes();
                return;
            }

            if (event.target.closest('[data-admin-v2-password]')) {
                adminElemek().jelszoValtasGomb?.click();
                return;
            }

            if (event.target.closest('[data-admin-v2-logout]')) {
                adminElemek().kijelentkezes?.click();
                return;
            }

            if (event.target.closest('[data-admin-v2-menu]')) {
                adminV2MenuNyitasa();
                return;
            }

            if (event.target.closest('[data-admin-v2-close-menu]')) {
                adminV2MenuBezarasa();
                return;
            }

            if (!event.target.closest('[data-admin-v2-notification-panel]')) {
                adminV2ErtesitesekBezarasa();
            }
        });

        tartalom.addEventListener('keydown', event => {
            if (event.key === 'Escape') adminV2ErtesitesekBezarasa();
        });
    }

    function adminV2AdatFigyelokKapcsolasa() {
        let idozito = null;
        const frissites = () => {
            window.clearTimeout(idozito);
            idozito = window.setTimeout(() => {
                adminV2AttekintesFrissitese();
                adminV2KommunikacioFrissitese();
            }, 40);
        };

        ['admin-foglalas-lista', 'admin-esemenynaplo-lista'].forEach(id => {
            const elem = document.getElementById(id);
            if (elem) new MutationObserver(frissites).observe(elem, { childList: true, subtree: true });
        });
    }

    let adminV2NaphatarIdozito = null;

    function adminV2NaphatarFrissitesKapcsolasa() {
        window.clearTimeout(adminV2NaphatarIdozito);

        const now = new Date();
        const nextDay = new Date(now);
        nextDay.setHours(24, 0, 0, 100);

        adminV2NaphatarIdozito = window.setTimeout(() => {
            adminV2AttekintesFrissitese();
            adminV2NaphatarFrissitesKapcsolasa();
        }, Math.max(1000, nextDay - now));
    }

    function adminV2MenuGesztusokKapcsolasa(body) {
        let pointerKezdet = null;
        let touchKezdet = null;

        const gesztusKezdese = (x, y, azonosito) => {
            if (!window.matchMedia('(max-width: 900px)').matches) return null;

            const menuNyitva = body.classList.contains('admin-v2-menu-open');
            if (!menuNyitva && x > 112) return null;

            return { x, y, azonosito, menuNyitva };
        };

        const gesztusBefejezese = (kezdet, x, y) => {
            if (!kezdet) return;
            const xEltolas = x - kezdet.x;
            const yEltolas = y - kezdet.y;
            const vizszintesGesztus = Math.abs(xEltolas) >= 56
                && Math.abs(xEltolas) > Math.abs(yEltolas) * 1.2;

            if (vizszintesGesztus && !kezdet.menuNyitva && xEltolas > 0) adminV2MenuNyitasa();
            if (vizszintesGesztus && kezdet.menuNyitva && xEltolas < 0) adminV2MenuBezarasa();
        };

        body.addEventListener('touchstart', event => {
            if (event.touches.length !== 1) return;
            const touch = event.touches[0];
            touchKezdet = gesztusKezdese(touch.clientX, touch.clientY, touch.identifier);
        }, { passive: true });

        body.addEventListener('touchend', event => {
            if (!touchKezdet) return;
            const touch = Array.from(event.changedTouches)
                .find(item => item.identifier === touchKezdet.azonosito);
            if (touch) gesztusBefejezese(touchKezdet, touch.clientX, touch.clientY);
            touchKezdet = null;
        }, { passive: true });

        body.addEventListener('touchcancel', () => {
            touchKezdet = null;
        }, { passive: true });

        body.addEventListener('pointerdown', event => {
            if (event.pointerType !== 'touch') return;
            pointerKezdet = gesztusKezdese(event.clientX, event.clientY, event.pointerId);
        }, { passive: true });

        body.addEventListener('pointerup', event => {
            if (!pointerKezdet || event.pointerId !== pointerKezdet.azonosito) return;
            gesztusBefejezese(pointerKezdet, event.clientX, event.clientY);
            pointerKezdet = null;
        }, { passive: true });

        body.addEventListener('pointercancel', () => {
            pointerKezdet = null;
        }, { passive: true });
    }

    function adminV2ErtesitesAdatok(aktivFoglalasok = null) {
        const foglalasok = aktivFoglalasok || allapot.foglalasElemek
            .filter(item => item.tipus === 'booking')
            .map(item => item.adat)
            .filter(item => !['cancelled', 'cancelled_by_customer'].includes(item.status));
        const pending = foglalasok.filter(item => item.status === 'pending');
        const emailErrors = adminV2EmailHibasEsemenyek();
        const cancellations = adminV2OlvasatlanLemondasok();
        const items = [];

        if (pending.length) {
            items.push({
                tipus: 'pending',
                icon: 'clock',
                tone: 'warning',
                title: pending.length + ' megerősítésre vár',
                description: pending.slice(0, 2).map(item => item.customer_name).join(', ')
            });
        }
        if (cancellations.length) {
            items.push({
                tipus: 'cancellations',
                icon: 'alert',
                tone: 'info',
                title: cancellations.length + ' új vendéglemondás',
                description: 'A lemondott időpontok átnézésre várnak.'
            });
        }
        if (emailErrors.length) {
            items.push({
                tipus: 'email',
                icon: 'mail',
                tone: 'danger',
                title: emailErrors.length + ' emailhiba',
                description: 'Ellenőrizd a sikertelen emailküldéseket.'
            });
        }

        return {
            pending,
            emailErrors,
            cancellations,
            items,
            total: pending.length + emailErrors.length + cancellations.length
        };
    }

    function adminV2ErtesitesekFrissitese(adatok = adminV2ErtesitesAdatok()) {
        document.querySelectorAll('[data-admin-v2-email-alert]:not([data-admin-v2-notification-alert])').forEach(element => {
            element.hidden = adatok.emailErrors.length === 0;
        });
        document.querySelectorAll('[data-admin-v2-notification-alert]').forEach(element => {
            element.hidden = adatok.total === 0;
        });

        const summary = document.querySelector('[data-admin-v2-notification-summary]');
        const list = document.querySelector('[data-admin-v2-notification-list]');
        if (summary) {
            summary.textContent = adatok.total
                ? adatok.total + ' nyitott teendő'
                : 'Minden rendezve';
        }
        if (!list) return;
        if (!adatok.items.length) {
            list.innerHTML = '<li class="admin-v2-empty">Nincs új értesítés.</li>';
            return;
        }

        list.innerHTML = adatok.items.map(item =>
            '<li><button type="button" data-admin-v2-notification-target="' + attr(item.tipus) + '" aria-label="' + attr(item.title) + '">' +
                '<span class="admin-v2-notification-icon admin-v2-tone-' + attr(item.tone) + '">' + adminV2Ikon(item.icon) + '</span>' +
                '<span><strong>' + html(item.title) + '</strong><small>' + html(item.description) + '</small></span>' +
                adminV2Ikon('arrow') +
            '</button></li>'
        ).join('');
    }

    function adminV2ErtesitesekValtasa() {
        const panel = document.querySelector('[data-admin-v2-notification-panel]');
        const button = document.querySelector('[data-admin-v2-notifications-toggle]');
        if (!panel || !button) return;

        const nyitva = panel.hidden;
        if (nyitva) adminV2ErtesitesekFrissitese();
        panel.hidden = !nyitva;
        button.setAttribute('aria-expanded', String(nyitva));
    }

    function adminV2ErtesitesekBezarasa() {
        const panel = document.querySelector('[data-admin-v2-notification-panel]');
        const button = document.querySelector('[data-admin-v2-notifications-toggle]');
        if (panel) panel.hidden = true;
        if (button) button.setAttribute('aria-expanded', 'false');
    }

    function adminV2ErtesitesMegnyitasa(tipus) {
        adminV2ErtesitesekBezarasa();
        if (tipus === 'pending') {
            adminV2Valtas('foglalasok');
            const elemek = adminElemek();
            allapot.foglalasKereses = '';
            allapot.foglalasStatuszSzuro = 'pending';
            allapot.foglalasOldal = 1;
            if (elemek.foglalasKereses) elemek.foglalasKereses.value = '';
            if (elemek.foglalasStatuszSzuro) elemek.foglalasStatuszSzuro.value = 'pending';
            foglalasKeresesTorlesGombFrissitese(elemek);
            foglalasListaRenderelese();
            foglalasNezetValtasa('lista');
            return;
        }
        if (tipus === 'cancellations') {
            adminV2Valtas('foglalasok');
            vendegLemondasokMegnyitasa();
            return;
        }
        if (tipus === 'email') adminV2Valtas('esemenynaplo', 'kommunikacio');
    }

    function adminV2CsoportMegnyitasa(group) {
        const defaultTabs = {
            attekintes: 'attekintes',
            foglalasok: 'foglalasok',
            arkalkulator: 'arkalkulator',
            vendegek: 'vendegek',
            munkaido: 'idosavok',
            weboldal: 'szovegek',
            arlista: 'szolgaltatasok',
            galeria: 'szovegek',
            kuponok: 'kuponok',
            emailteszt: 'emailteszt',
            kommunikacio: 'esemenynaplo',
            beallitasok: 'beallitasok'
        };
        adminV2Valtas(defaultTabs[group] || 'attekintes', group);
        if (group === 'galeria') adminStudioGaleriaMegnyitas();
        if (group === 'weboldal' && document.getElementById('admin-cms-root')?.dataset.lumiCmsGalleryContext === 'images') {
            document.querySelector('#admin-cms-root [data-cms-view]')?.click();
        }
    }

    const adminStudioGorgetesek = new Map();
    function adminV2Valtas(tab, forcedGroup = '') {
        if (!document.getElementById(`admin-panel-${tab}`)) {
            return;
        }

        const previous=allapot.aktivTab;const main=document.querySelector('.admin-workspace-main');
        if(main)adminStudioGorgetesek.set(previous,main.scrollTop);
        adminTabValtas(tab);
        const group = forcedGroup || ADMIN_V2_TAB_GROUPS[tab] || tab;
        document.body.dataset.adminV2Group = group;
        document.body.dataset.adminV2Tab = tab;

        document.querySelectorAll('[data-admin-v2-nav]').forEach(button => {
            const active = button.dataset.adminV2Nav === group;
            button.classList.toggle('is-active', active);
            if (button.closest('.admin-v2-mobile-dock')) button.setAttribute('aria-pressed', String(active));
            if (button.classList.contains('admin-v2-nav-item')) {
                button.setAttribute('aria-current', active ? 'page' : 'false');
            }
        });

        document.querySelectorAll('.admin-v2-subnav [data-admin-v2-panel]').forEach(button => {
            button.classList.toggle('is-active', button.dataset.adminV2Panel === tab);
        });

        const label = document.querySelector('[data-admin-v2-current-label]');
        const groupLabels = {
            arlista: 'Árlista',
            galeria: 'Galéria',
            kuponok: 'Kuponok',
            emailteszt: 'E-mail ellenőrzés',
            attekintes: 'Áttekintés',
            foglalasok: 'Foglalások',
            arkalkulator: 'Árkalkulátor',
            vendegek: 'Regisztrált tagok',
            munkaido: 'Beosztás',
            weboldal: 'Weboldal',
            kommunikacio: 'Kommunikáció',
            beallitasok: 'Beállítások'
        };
        if (label) label.textContent = groupLabels[group] || 'Admin';

        adminV2MenuBezarasa();
        adminV2ErtesitesekBezarasa();
        if (tab === 'attekintes') adminV2AttekintesFrissitese();
        adminStudioPanelValtas(tab);

        if (tab === 'esemenynaplo') adminV2KommunikacioFrissitese();

        requestAnimationFrame(()=>main?.scrollTo?.({ top: adminStudioGorgetesek.get(tab)||0, behavior: 'auto' }));
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    function adminV2FoglalasNezetBeallitasa(nezet) {
        window.setTimeout(() => {
            const button = document.querySelector(`[data-foglalas-nezet="${nezet}"]`);
            button?.click();
        }, 0);
    }

    function adminV2FoglalasKeresese(kereses) {
        adminV2Valtas('foglalasok');
        const input = adminElemek().foglalasKereses;
        if (!input) return;
        input.value = kereses || '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    }

    function adminV2EmailSablonokMegnyitasa() {
        adminV2Valtas('szovegek', 'kommunikacio');
        let probalkozas = 0;
        const megnyitas = () => {
            const emailTab = Array.from(document.querySelectorAll('.cms-view-tab'))
                .find(button => button.textContent.trim().startsWith('E-mailek'));
            if (emailTab) {
                emailTab.click();
                return;
            }
            probalkozas += 1;
            if (probalkozas < 10) window.setTimeout(megnyitas, 80);
        };
        megnyitas();
    }

    async function adminV2AttekintesFrissitese() {
        const panel = document.getElementById('admin-panel-attekintes');
        if (!panel) return;

        const todayKey = adminV2DatumKulcs(new Date());
        const bookings = allapot.foglalasElemek
            .filter(item => item.tipus === 'booking')
            .map(item => item.adat);
        const activeBookings = bookings.filter(item => !['cancelled', 'cancelled_by_customer'].includes(item.status));
        const activeSchedule = allapot.foglalasElemek
            .map(adminV2AttekintesIdopont)
            .filter(Boolean);
        const today = activeSchedule
            .filter(item => adminV2DatumKulcs(new Date(item.starts_at)) === todayKey)
            .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
        const upcoming = activeSchedule
            .filter(item => adminV2DatumKulcs(new Date(item.starts_at)) > todayKey)
            .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
            .slice(0, 5);
        const notificationData = adminV2ErtesitesAdatok(activeBookings);
        const { pending, emailErrors, cancellations } = notificationData;

        adminV2Text('admin-v2-stat-today', String(today.length));
        adminV2Text('admin-v2-stat-today-meta', `${adminV2OsszesIdotartam(today)} óra lefoglalva`);
        adminV2Text('admin-v2-stat-pending', String(pending.length));
        adminV2Text('admin-v2-stat-pending-meta', pending.length ? 'Átnézésre és megerősítésre vár' : 'Nincs függő foglalás');
        adminV2Text('admin-v2-stat-email', String(emailErrors.length));
        adminV2Text('admin-v2-stat-email-meta', emailErrors.length ? 'A kommunikációs naplóban ellenőrizhető' : 'Nincs ismert emailhiba');

        document.querySelectorAll('[data-admin-v2-pending-count]').forEach(element => {
            element.textContent = String(pending.length);
            element.hidden = pending.length === 0;
        });
        adminV2ErtesitesekFrissitese(notificationData);

        const summary = panel.querySelector('[data-admin-v2-today-summary]');
        if (summary) summary.textContent = today.length ? `${today.length} időpont · ${adminV2NapiIdosav(today)}` : 'Ma nincs aktív foglalás';
        adminV2NapiListaRenderelese(today);
        adminV2KovetkezoListaRenderelese(upcoming);
        adminV2TeendoListaRenderelese(pending, emailErrors, cancellations);
        adminStudioStatisztikaFrissites();
        if (allapot.aktivTab === 'attekintes') await adminV2HorizonFrissitese(todayKey);
    }

    function adminV2AttekintesIdopont(item) {
        const data = item?.adat || {};

        if (item?.tipus === 'booking') {
            const status = String(data.status || 'pending').toLowerCase();
            if (['cancelled', 'cancelled_by_customer'].includes(status)) return null;

            return {
                tipus: 'booking',
                cim: data.customer_name || 'Névtelen vendég',
                leiras: data.services?.name || 'Törölt szolgáltatás',
                kereses: data.customer_name || data.public_reference || '',
                starts_at: data.starts_at,
                ends_at: data.ends_at,
                status
            };
        }

        if (item?.tipus === 'blocked') {
            const status = tiltasStatuszErtek(data.status);
            if (['done', 'cancelled_by_customer'].includes(status)) return null;

            const cim = data.reason?.trim() || 'Kézzel felvett idő';
            return {
                tipus: 'blocked',
                cim,
                leiras: keziSzolgaltatasNev(data) || 'Kézzel felvett idő',
                kereses: cim,
                starts_at: data.starts_at,
                ends_at: data.ends_at,
                status
            };
        }

        return null;
    }

    function adminV2NapiListaRenderelese(items) {
        const target=document.querySelector('[data-admin-v2-today-list]');if(!target)return;
        target.innerHTML=items.length?items.map(item=>`<li><button type="button" class="studio-agenda-row" data-admin-v2-booking-search="${attr(item.kereses)}"><time>${html(idoInputErtek(item.starts_at))}<small>${html(idoInputErtek(item.ends_at))}</small></time><span><strong>${html(item.cim)}</strong><small><i class="studio-track-dot"></i>${html(item.leiras)}</small></span><span class="studio-status studio-status-${attr(item.status)}">${html(adminV2StatuszFelirat(item.status))}</span></button></li>`).join(''):'<li class="admin-v2-empty">Ma nincs rögzített időpont.</li>';
    }

    function adminV2KovetkezoListaRenderelese(items) {
        const target=document.querySelector('[data-admin-v2-upcoming-list]');if(!target)return;
        target.innerHTML=items.length?items.map(item=>`<li><button type="button" class="studio-upcoming-row" data-admin-v2-booking-search="${attr(item.kereses)}"><time>${html(new Date(item.starts_at).toLocaleDateString('hu-HU',{month:'short'}))}<strong>${new Date(item.starts_at).getDate()}</strong></time><span><strong>${html(item.cim)}</strong><small>${html(item.leiras)}</small></span><b>${html(idoInputErtek(item.starts_at))}</b>${adminV2Ikon('arrow')}</button></li>`).join(''):'<li class="admin-v2-empty">Nincs közelgő aktív foglalás.</li>';
    }

    function adminV2TeendoListaRenderelese(pending, emailErrors, cancellations) {
        const list = document.querySelector('[data-admin-v2-task-list]');
        const summary = document.querySelector('[data-admin-v2-task-summary]');
        if (!list) return;

        const tasks = [];
        const unfinished=allapot.foglalasElemek.filter(i=>['confirmed','active','blocked'].includes(i.adat.status)&&new Date(i.adat.ends_at)<new Date());
        const unpaid=allapot.foglalasElemek.filter(i=>i.adat.status==='done'&&i.adat.paid_amount==null);
        if(unfinished.length)tasks.push({icon:'clock',tone:'warning',title:unfinished.length+' lezáratlan korábbi időpont',description:'Ellenőrizd az állapotot és a fizetett összeget.',panel:'foglalasok',action:'Átnézés'});
        if(unpaid.length)tasks.push({icon:'alert',tone:'warning',title:unpaid.length+' teljesített időpont összeg nélkül',description:'A bevételi összesítésből hiányzik a fizetett összeg.',panel:'foglalasok',action:'Rögzítés'});
        if (pending.length) {
            tasks.push({
                icon: 'clock',
                tone: 'warning',
                title: `${pending.length} foglalás megerősítésre vár`,
                description: pending.slice(0, 2).map(item => item.customer_name).join(', '),
                panel: 'foglalasok',
                action: 'Megnyitás'
            });
        }
        if (emailErrors.length) {
            tasks.push({
                icon: 'mail',
                tone: 'danger',
                title: `${emailErrors.length} emailhiba a naplóban`,
                description: 'Ellenőrizd a legutóbbi küldési eseményeket.',
                panel: 'esemenynaplo',
                action: 'Részletek'
            });
        }
        if (cancellations.length) {
            tasks.push({
                icon: 'alert',
                tone: 'info',
                title: `${cancellations.length} új vendéglemondás`,
                description: 'A felszabadult időpontok már újra foglalhatók.',
                panel: 'foglalasok',
                action: 'Átnézés'
            });
        }

        if (summary) summary.textContent = tasks.length ? `${tasks.length} figyelmet igénylő terület` : 'Minden fontos feladat rendezve';
        if (!tasks.length) {
            list.innerHTML = '<li class="admin-v2-empty">Nincs azonnali teendő.</li>';
            return;
        }

        list.innerHTML = tasks.map(task => `
            <li class="admin-v2-task-item">
                <span class="admin-v2-task-icon admin-v2-tone-${task.tone}">${adminV2Ikon(task.icon)}</span>
                <span><strong>${html(task.title)}</strong><small>${html(task.description)}</small></span>
                <button type="button" data-admin-v2-panel="${task.panel}">${task.action}</button>
            </li>
        `).join('');
    }

    function adminV2HorizonFrissitese(todayKey) {
        return adminKeresOsszevonasa('horizon:' + todayKey, () => adminV2HorizonLetoltese(todayKey));
    }

    async function adminV2HorizonLetoltese(todayKey) {
        const ervenyes = adminKeresMunkamenetOr();
        const value = document.getElementById('admin-v2-stat-horizon');
        const meta = document.getElementById('admin-v2-stat-horizon-meta');
        if (!value || !meta || !allapot.kliens) return;

        try {
            let query = allapot.kliens
                .from('availability_windows')
                .select('work_date')
                .eq('active', true);
            if (typeof query.gte === 'function') query = query.gte('work_date', todayKey);
            query = query.order('work_date', { ascending: true });
            const { data, error } = await query;
            if (!ervenyes()) return;
            const availableDates = [...new Set((data || [])
                .map(item => String(item?.work_date || '').trim())
                .filter(dateKey => dateKey >= todayKey))]
                .sort();
            if (error || !availableDates.length) {
                value.textContent = error ? '—' : '0';
                meta.textContent = 'Nincs jövőbeli foglalható nap';
                return;
            }

            const lastDate = new Date(`${availableDates[availableDates.length - 1]}T12:00:00`);
            value.textContent = String(availableDates.length);
            meta.textContent = `Legutolsó: ${new Intl.DateTimeFormat('hu-HU', { month: 'long', day: 'numeric' }).format(lastDate)}`;
        } catch (error) {
            value.textContent = '—';
            meta.textContent = 'A foglalható időszak nem olvasható';
        }
    }

    function adminV2KommunikacioFrissitese() {
        const events = Array.isArray(allapot.esemenynaploElemek) ? allapot.esemenynaploElemek : [];
        const todayKey = adminV2DatumKulcs(new Date());
        const emailEvents = events.filter(event => String(event.channel || '').toLowerCase() === 'email');
        const todayEvents = emailEvents.filter(event => adminV2DatumKulcs(new Date(event.created_at)) === todayKey);
        const failed = adminV2EmailHibasEsemenyek();
        const success = emailEvents.filter(event => ['success', 'sent', 'ok'].includes(String(event.status || '').toLowerCase()));

        adminV2Text('admin-v2-email-today', String(todayEvents.length));
        adminV2Text('admin-v2-email-success', String(success.length));
        adminV2Text('admin-v2-email-failed', String(failed.length));
        adminV2Text('admin-v2-email-last-error', failed.length ? adminV2RovidDatumIdo(failed[0].created_at) : 'Nincs');

        const acknowledgeButton = document.querySelector('[data-admin-v2-ack-email-errors]');
        const acknowledgeSummary = document.querySelector('[data-admin-v2-email-ack-summary]');
        if (acknowledgeButton) acknowledgeButton.hidden = failed.length === 0;
        if (acknowledgeSummary) {
            acknowledgeSummary.textContent = failed.length
                ? `${failed.length} emailhiba átnézésre vár.`
                : 'Nincs nyitott emailhiba.';
        }
        adminV2ErtesitesekFrissitese();
    }

    function adminV2EmailHibasEsemenyek() {
        const events = Array.isArray(allapot.esemenynaploElemek) ? allapot.esemenynaploElemek : [];
        const acknowledgedIds = new Set();
        let acknowledgedThrough = 0;

        events
            .filter(event => event.event_type === 'admin_email_errors_acknowledged')
            .forEach(event => {
                const metadata = event.metadata && typeof event.metadata === 'object' ? event.metadata : {};
                const through = Date.parse(metadata.acknowledged_through || event.created_at || '');
                if (Number.isFinite(through)) acknowledgedThrough = Math.max(acknowledgedThrough, through);
                if (Array.isArray(metadata.acknowledged_event_ids)) {
                    metadata.acknowledged_event_ids.forEach(id => acknowledgedIds.add(String(id)));
                }
            });

        return events
            .filter(event => String(event.channel || '').toLowerCase() === 'email')
            .filter(adminV2EsemenyHibas)
            .filter(event => {
                if (event.id && acknowledgedIds.has(String(event.id))) return false;
                const createdAt = Date.parse(event.created_at || '');
                return !acknowledgedThrough || !Number.isFinite(createdAt) || createdAt > acknowledgedThrough;
            });
    }

    async function adminV2EmailHibakNyugtazasa(button) {
        const errors = adminV2EmailHibasEsemenyek();
        if (!errors.length) {
            adminV2KommunikacioFrissitese();
            return;
        }

        const validErrors = errors
            .filter(event => Number.isFinite(Date.parse(event.created_at || '')))
            .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
        const acknowledgedThrough = validErrors[0]?.created_at || new Date().toISOString();
        const payload = {
            booking_id: null,
            event_type: 'admin_email_errors_acknowledged',
            channel: 'admin',
            status: 'success',
            title: 'Emailhibák nyugtázva',
            message: `Az admin ${errors.length} emailhibát átnézett és nyugtázott.`,
            metadata: {
                acknowledged_count: errors.length,
                acknowledged_through: acknowledgedThrough,
                acknowledged_event_ids: errors.map(event => event.id).filter(Boolean)
            }
        };

        button.disabled = true;
        onlineStatusz('Emailhibák nyugtázásának mentése...');

        try {
            const { data, error } = await allapot.kliens
                .from('booking_events')
                .insert(payload)
                .select('id,booking_id,event_type,channel,status,title,message,metadata,created_at')
                .single();

            if (error || !data) {
                onlineStatusz('Az emailhibák nyugtázását nem sikerült elmenteni. Próbáld újra.', true);
                return;
            }

            allapot.esemenynaploElemek = [
                data,
                ...allapot.esemenynaploElemek.filter(event => event.id !== data.id)
            ];
            esemenynaploRenderelese();
            await adminV2AttekintesFrissitese();
            adminV2KommunikacioFrissitese();
            onlineStatusz(`${errors.length} emailhiba nyugtázva.`);
        } catch (error) {
            console.warn('Emailhibák nyugtázása nem sikerült:', error);
            onlineStatusz('Az emailhibák nyugtázását nem sikerült elmenteni. Próbáld újra.', true);
        } finally {
            if (button.isConnected) button.disabled = false;
        }
    }

    function adminV2EsemenyHibas(event) {
        return ['error', 'failed', 'failure'].includes(String(event.status || '').toLowerCase());
    }

    function adminV2OlvasatlanLemondasok() {
        try {
            return vendegLemondasOlvasatlanFoglalasok();
        } catch (error) {
            return [];
        }
    }

    function adminV2OsszesIdotartam(items) {
        const minutes = items.reduce((sum, item) => {
            const start = new Date(item.starts_at);
            const end = new Date(item.ends_at);
            const duration = Math.max(0, Math.round((end - start) / 60000));
            return sum + duration;
        }, 0);
        const hours = minutes / 60;
        return Number.isInteger(hours) ? String(hours) : String(hours.toFixed(1)).replace('.', ',');
    }

    function adminV2NapiIdosav(items) {
        if (!items.length) return '';
        return `${idoInputErtek(items[0].starts_at)}–${idoInputErtek(items[items.length - 1].ends_at)}`;
    }

    function adminV2StatuszFelirat(status) {
        return {
            pending: 'Megerősítésre vár',
            confirmed: 'Megerősítve',
            blocked: 'Foglalt',
            done: 'Teljesítve',
            cancelled: 'Lemondva',
            cancelled_by_customer: 'Vendég lemondta'
        }[status] || 'Foglalás';
    }

    function adminV2StatuszTone(status) {
        return {
            pending: 'warning',
            confirmed: 'success',
            done: 'muted',
            cancelled: 'danger',
            cancelled_by_customer: 'danger'
        }[status] || 'info';
    }

    function adminV2DatumKulcs(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function adminV2RovidDatum(value) {
        const date = new Date(value);
        return new Intl.DateTimeFormat('hu-HU', { month: 'short', day: 'numeric' }).format(date);
    }

    function adminV2RovidDatumIdo(value) {
        const date = new Date(value);
        return new Intl.DateTimeFormat('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    }

    function adminV2MaiDatumFelirat() {
        return new Intl.DateTimeFormat('hu-HU', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
        }).format(new Date());
    }

    function adminV2Text(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    let adminV2MenuScrollY = 0;

    function adminV2MenuNyitasa() {
        const more=document.querySelector('.admin-studio-more');
        document.body.classList.add('admin-v2-menu-open');
        document.querySelectorAll('[data-admin-v2-menu]').forEach(button=>button.setAttribute('aria-expanded','true'));
        adminSzerkesztoPanelMegnyitasa({owner:document.getElementById('admin-tartalom'),nodes:[more],title:'Továbbiak',trigger:document.querySelector('[data-admin-v2-menu]'),onClose:()=>{document.body.classList.remove('admin-v2-menu-open');document.querySelectorAll('[data-admin-v2-menu]').forEach(button=>button.setAttribute('aria-expanded','false'));}});
    }

    function adminV2MenuBezarasa() {
        if(document.body.classList.contains('admin-v2-menu-open'))window.LumiAdminSheet.close();
    }

    function adminV2Ikon(name) {
        const paths = {
            overview: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"></path>',
            calendar: '<path d="M6 3v3M18 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1z"></path>',
            calculator: '<rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h2M14 18h2"></path>',
            users: '<circle cx="9" cy="9" r="3"></circle><circle cx="17" cy="10" r="2.5"></circle><path d="M3.5 20v-2a4.5 4.5 0 0 1 9 0v2M14 15.5a4 4 0 0 1 6.5 3.1V20"></path>',
            clock: '<circle cx="12" cy="12" r="8"></circle><path d="M12 8v5l3 2"></path>',
            website: '<path d="M4 5h16v14H4zM4 9h16M8 5v4"></path>',
            mail: '<path d="M4 6h16v12H4zM4 7l8 6 8-6"></path>',
            settings: '<circle cx="12" cy="12" r="3"></circle><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"></path>',
            arrow: '<path d="m9 6 6 6-6 6"></path>',
            menu: '<path d="M4 7h16M4 12h16M4 17h16"></path>',
            bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"></path>',
            refresh: '<path d="M20 6v5h-5M4 18v-5h5M6.1 9a7 7 0 0 1 11.7-2.6L20 11M4 13l2.2 4.6A7 7 0 0 0 17.9 15"></path>',
            plus: '<path d="M12 5v14M5 12h14"></path>',
            check: '<path d="m5 12 4 4L19 6"></path>',
            edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"></path>',
            close: '<path d="M6 6l12 12M18 6 6 18"></path>',
            up: '<path d="m6 15 6-6 6 6"></path>',
            down: '<path d="m6 9 6 6 6-6"></path>',
            trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"></path>',
            alert: '<path d="M12 4 3 20h18zM12 9v5M12 17h.01"></path>'
        };
        return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name] || paths.arrow}</svg>`;
    }
