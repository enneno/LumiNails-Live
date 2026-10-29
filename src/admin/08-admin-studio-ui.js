    let adminStudioHetEltolas = 0;
    let adminStudioBeosztasHet = 0;
    const adminStudioNapPiszkozatok = new Map();
    let adminStudioGaleriaFigyelo = null;
    let adminStudioStatisztikaHonap = '';
    let adminStudioStatisztikaHet = '';

    function adminStudioIdoszakValaszto(period, panel) {
        const picker = panel.querySelector('.studio-revenue-picker');
        if (!picker.hidden && picker.dataset.period === period) {
            picker.hidden = true;
            return;
        }
        picker.hidden = false;
        picker.dataset.period = period;
        const input = picker.querySelector('input');
        picker.querySelector('label').firstChild.textContent = period === 'week' ? 'Heti bevétel – válassz napot' : 'Havi bevétel';
        input.type = period === 'week' ? 'date' : 'month';
        input.value = period === 'week' ? adminStudioStatisztikaHet || maiDatum() : adminStudioStatisztikaHonap || maiHonap();
    }

    function adminStudioGaleriaMegnyitas() {
        adminStudioGaleriaFigyelo?.disconnect();
        const root = document.getElementById('admin-cms-root');
        const open = () => {
            if (document.body.dataset.adminV2Group !== 'galeria') {
                adminStudioGaleriaFigyelo?.disconnect();
                return;
            }
            const tab = root.querySelector('[data-lumi-cms-gallery-tab]');
            if (tab) {
                adminStudioGaleriaFigyelo?.disconnect();
                tab.click();
            }
        };
        adminStudioGaleriaFigyelo = new MutationObserver(open);
        adminStudioGaleriaFigyelo.observe(root, { childList: true, subtree: true });
        open();
    }

    function adminStudioFoglalasKartyaJelzes(card, record) {
        const head = card.querySelector('.admin-db-kartya-fej');
        const meta = document.createElement('div');
        meta.className = 'studio-booking-meta';
        meta.innerHTML = `<span><i class="studio-track-dot"></i>${html(new Date(record.starts_at).toLocaleDateString('hu-HU', { month: 'long', day: 'numeric', weekday: 'short' }))}</span><span class="studio-status studio-status-${attr(record.status || 'active')}">${html(adminV2StatuszFelirat(record.status || 'active'))}</span>`;
        head.before(meta);
        const quick = card.querySelector('[data-foglalas-statusz]');
        if (quick) {
            quick.disabled = false;
            quick.setAttribute('aria-label', (record.customer_name || record.reason || 'Időpont') + ' állapota');
            meta.lastElementChild.replaceWith(quick);
        }

        const title = card.querySelector('.admin-foglalas-nev-blokk'),
            badge = title.querySelector('.admin-kartya-tipus');
        if (badge) title.querySelector('h3').after(badge);
        const time = card.querySelector('.admin-foglalas-idopont');
        if (time) {
            time.innerHTML = `<strong>${html(idoInputErtek(record.starts_at))}</strong><small>${html(idoInputErtek(record.ends_at))}-ig</small>`;
            title.before(time);
        }
        card.querySelector('.admin-kezi-ido-naptar')?.replaceChildren();
        const calendar = card.querySelector('.admin-kezi-ido-naptar');
        if (calendar) calendar.innerHTML = adminV2Ikon('calendar');
    }

    function adminStudioInicializalas() {
        const panel = document.getElementById('admin-panel-foglalasok');
        document.querySelectorAll('.admin-v2-page-actions [data-admin-v2-save]').forEach((button) => button.remove());
        const switcher = panel.querySelector('.admin-foglalas-nezetvalto');
        if (switcher && !switcher.querySelector('[data-foglalas-nezet="het"]')) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'admin-foglalas-nezet-gomb';
            button.dataset.foglalasNezet = 'het';
            button.textContent = 'Hét';
            button.setAttribute('aria-pressed', 'false');
            button.addEventListener('click', () => foglalasNezetValtasa('het'));
            switcher.append(button);
        }
        const week = document.createElement('section');
        week.id = 'admin-studio-week';
        week.hidden = true;
        week.setAttribute('aria-label', 'Heti foglalási naptár');
        panel.append(week);
        const month = document.getElementById('admin-foglalas-naptar'),
            agenda = month.querySelector('.admin-foglalas-napi-panel');
        const monthGrid = document.createElement('div');
        monthGrid.className = 'studio-month-main';
        Array.from(month.children)
            .filter((child) => child !== agenda)
            .forEach((child) => monthGrid.append(child));
        month.prepend(monthGrid);
        week.addEventListener('click', (event) => {
            const move = event.target.closest('[data-studio-week-move]');
            if (move) {
                adminStudioHetEltolas += Number(move.dataset.studioWeekMove);
                adminStudioHetRender();
                return;
            }
            if (event.target.closest('[data-studio-week-today]')) {
                adminStudioHetEltolas = 0;
                adminStudioHetRender();
                return;
            }
            const slot = event.target.closest('[data-studio-slot]');
            if (slot) {
                adminStudioKeziPanel(slot.dataset.studioSlot, slot.dataset.time);
                return;
            }
            if (event.target.closest('[data-foglalas-naptar-megnyitas]')) foglalasNaptarKattintas(event);
        });
        const schedule = document.getElementById('admin-panel-idosavok');
        const weekly = document.createElement('section');
        weekly.className = 'studio-schedule';
        weekly.innerHTML = `<div class="studio-section-heading"><div><h2>Heti beosztás</h2><p>Az adott dátumok foglalható idősávjai</p></div><button type="button" class="admin-v2-button" data-admin-v2-panel="tiltasok">Kieső idő</button></div><div class="studio-week-toolbar"><button type="button" class="admin-v2-icon-button" data-schedule-move="-1" aria-label="Előző hét">${adminV2Ikon('up')}</button><strong data-schedule-range></strong><button type="button" class="admin-v2-icon-button" data-schedule-move="1" aria-label="Következő hét">${adminV2Ikon('down')}</button></div><div class="studio-schedule-days"></div>`;
        schedule.querySelector('.admin-v2-page-heading').after(weekly);
        weekly.addEventListener('click', (event) => {
            const move = event.target.closest('[data-schedule-move]');
            if (move) {
                adminStudioBeosztasHet += Number(move.dataset.scheduleMove);
                adminStudioBeosztasRender();
            }
            const day = event.target.closest('[data-studio-schedule-day]');
            if (day) adminStudioNapSzerkeszto(day.dataset.studioScheduleDay, day);
        });
        const bulk = document.createElement('details');
        bulk.className = 'studio-bulk-schedule';
        bulk.innerHTML = '<summary>Naptári kijelölés és több nap beállítása</summary>';
        schedule.append(bulk);
        bulk.append(document.getElementById('admin-idosav-naptar'));
        const actions = schedule.querySelector('.admin-idosav-lista-akciok');
        if (actions) bulk.append(actions);
        const list = document.getElementById('admin-idosav-lista');
        new MutationObserver(() => adminStudioBeosztasRender()).observe(list, {
            childList: true
        });
        const status = document.getElementById('admin-online-status');
        new MutationObserver(() => {
            const target = document.querySelector('[data-studio-status]');
            if (target) target.textContent = status.textContent;
        }).observe(status, { childList: true, subtree: true });
        const viewSwitcher = panel.querySelector('.admin-foglalas-nezetvalto');
        if (viewSwitcher) panel.querySelector('.admin-v2-page-heading').append(viewSwitcher);
        adminStudioPanelValtas(allapot.aktivTab || 'attekintes');
        document.querySelector('[data-studio-pending]')?.addEventListener('click', () => {
            adminV2Valtas('foglalasok');
            allapot.foglalasStatuszSzuro = 'pending';
            adminElemek().foglalasStatuszSzuro.value = 'pending';
            foglalasListaRenderelese();
        });
    }

    function adminStudioPanelValtas(tab) {
        const button = document.querySelector('[data-studio-save]');
        if (button) button.hidden = !['szovegek', 'szolgaltatasok', 'kuponok', 'idosavok', 'beallitasok'].includes(tab);
        if (tab === 'idosavok') adminStudioBeosztasRender();
        adminStudioMentesJelzes();
    }

    async function adminStudioAktualisFrissites() {
        if (adminStudioVanPiszkozat() && !confirm('A frissítés eldobja az itt még nem mentett módosításokat. Folytatod?')) return;
        if (allapot.aktivTab === 'foglalasok') adminStudioFoglalasKartyak.clear();
        const loaders = {
            vendegek: vendegProfilokBetoltese,
            arkalkulator: () => adminPanelAdatokBetoltese('arkalkulator', true),
            foglalasok: foglalasokBetoltese,
            attekintes: foglalasokBetoltese,
            szolgaltatasok: szolgaltatasokBetoltese,
            kuponok: kuponokBetoltese,
            idosavok: idosavokBetoltese,
            tiltasok: tiltasokBetoltese,
            esemenynaplo: esemenynaploBetoltese,
            beallitasok: beallitasokBetoltese
        };
        if (allapot.aktivTab === 'szovegek') {
            document.getElementById('admin-cms-reload')?.click();
            return;
        }
        await loaders[allapot.aktivTab]?.();
    }

    function adminStudioHetNapok(offset = 0, anchor = '') {
        const start = anchor ? new Date(anchor + 'T12:00:00') : new Date();
        start.setHours(12, 0, 0, 0);
        start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + offset * 7);
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            return adminV2DatumKulcs(date);
        });
    }

    function adminStudioHetFelirat(days) {
        const format = (date) =>
            new Date(date + 'T12:00:00').toLocaleDateString('hu-HU', {
                month: 'short',
                day: 'numeric'
            });
        return `${format(days[0])} – ${format(days[6])}`;
    }

    function adminStudioKeziPanel(date = '', time = '') {
        adminV2Valtas('tiltasok');
        const form = document.getElementById('admin-tiltas-form');
        if (date) document.getElementById('admin-tiltas-datum').value = date;
        if (time) {
            document.getElementById('admin-tiltas-kezdes').value = time;
            keziIdoVegeFrissitese();
        }
        form.hidden = true;
        adminSzerkesztoPanelMegnyitasa({
            owner: document.getElementById('admin-panel-tiltasok'),
            nodes: [form],
            title: 'Új időpont / kieső idő',
            trigger: document.querySelector('[data-studio-new]'),
            saveLabel: 'Időpont rögzítése',
            onSave: () => tiltasHozzaadas()
        });
    }

    function adminStudioHetRender() {
        const root = document.getElementById('admin-studio-week');
        if (!root) return;
        const days = adminStudioHetNapok(adminStudioHetEltolas);
        const items = foglalasSzurtElemek().filter(foglalasNaptarbanLathato);
        root.innerHTML = `<div class="studio-week-toolbar"><button type="button" class="admin-v2-button" data-studio-week-today>Mai hét</button><div><button type="button" class="admin-v2-icon-button" data-studio-week-move="-1" aria-label="Előző hét">${adminV2Ikon('up')}</button><strong>${adminStudioHetFelirat(days)}</strong><button type="button" class="admin-v2-icon-button" data-studio-week-move="1" aria-label="Következő hét">${adminV2Ikon('down')}</button></div></div><div class="studio-week-legend"><span><i class="studio-track-dot"></i>Foglalás</span><span><i class="studio-track-dot studio-track-dot-blocked"></i>Kézzel felvett idő</span></div><div class="studio-week-scroll"><div class="studio-week-grid"><div class="studio-week-corner"></div>${days.map((day) => `<header class="studio-week-day-heading${day === maiDatum() ? ' is-today' : ''}"><small>${new Date(day + 'T12:00:00').toLocaleDateString('hu-HU', { weekday: 'long' })}</small><strong>${new Date(day + 'T12:00:00').toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}</strong></header>`).join('')}<div class="studio-week-hours">${Array.from({ length: 15 }, (_, i) => `<span style="top:${i * 44}px">${String(i + 7).padStart(2, '0')}:00</span>`).join('')}</div>${days
            .map(
                (day) =>
                    `<div class="studio-week-day${new Date(day + 'T12:00:00').getDay() % 6 === 0 ? ' is-weekend' : ''}">${Array.from({ length: 14 }, (_, i) => `<button type="button" class="studio-week-slot" data-studio-slot="${day}" data-time="${String(i + 7).padStart(2, '0')}:00" aria-label="Új időpont: ${day}, ${i + 7}:00"></button>`).join('')}${items
                        .filter((item) => foglalasDatumKulcs(item.datum) === day)
                        .map((item) => {
                            const data = item.adat,
                                start = new Date(data.starts_at),
                                end = new Date(data.ends_at),
                                minutes = start.getHours() * 60 + start.getMinutes(),
                                duration = Math.max(20, (end - start) / 60000);
                            return `<button type="button" class="studio-week-event studio-week-event-${attr(item.tipus)} studio-status-${attr(data.status || 'active')}" style="top:${Math.max(0, ((minutes - 420) * 44) / 60)}px;height:${Math.min((duration * 44) / 60, 616 - Math.max(0, ((minutes - 420) * 44) / 60))}px" data-foglalas-naptar-megnyitas data-foglalas-id="${attr(data.id)}"><strong>${html(foglalasNaptarElemNev(item))}</strong><small>${html(idoInputErtek(data.starts_at))}–${html(idoInputErtek(data.ends_at))}</small><span>${html(data.services?.name || keziSzolgaltatasNev(data) || 'Kézi idő')}</span></button>`;
                        })
                        .join('')}</div>`
            )
            .join('')}</div></div>`;
        root.insertAdjacentHTML('beforeend', adminStudioMobilHet(days, items));
    }

    function adminStudioMobilHet(days, items) {
        const hours = Array.from({ length: 14 }, (_, i) => i + 7);
        return `<div class="studio-mobile-week-scroll"><div class="studio-mobile-week-grid"><div class="studio-mobile-week-corner"></div><header class="studio-mobile-week-hours">${hours.map((hour) => `<span>${String(hour).padStart(2, '0')}:00</span>`).join('')}</header>${days
            .map(
                (day) =>
                    `<header class="studio-mobile-week-label${day === maiDatum() ? ' is-today' : ''}"><strong>${new Date(day + 'T12:00:00').toLocaleDateString('hu-HU', { weekday: 'short' })}</strong><small>${new Date(day + 'T12:00:00').getDate()}.</small></header><div class="studio-mobile-week-day">${hours.map((hour) => `<button type="button" class="studio-mobile-week-slot" data-studio-slot="${day}" data-time="${String(hour).padStart(2, '0')}:00" aria-label="Új időpont: ${day}, ${hour}:00"></button>`).join('')}${items
                        .filter((item) => foglalasDatumKulcs(item.datum) === day)
                        .map((item) => {
                            const data = item.adat,
                                start = new Date(data.starts_at),
                                end = new Date(data.ends_at),
                                left = Math.max(0, ((start.getHours() * 60 + start.getMinutes() - 420) * 44) / 60),
                                width = Math.max(30, (((end - start) / 60000) * 44) / 60);
                            return `<button type="button" class="studio-mobile-week-event studio-week-event-${attr(item.tipus)}" style="left:${left}px;width:${Math.min(width, 616 - left)}px" data-foglalas-naptar-megnyitas data-foglalas-id="${attr(data.id)}"><strong>${html(foglalasNaptarElemNev(item))}</strong><small>${html(idoInputErtek(data.starts_at))}–${html(idoInputErtek(data.ends_at))}</small></button>`;
                        })
                        .join('')}</div>`
            )
            .join('')}</div></div>`;
    }

    function adminStudioBeosztasRender() {
        const target = document.querySelector('.studio-schedule-days');
        if (!target) return;
        const days = adminStudioHetNapok(adminStudioBeosztasHet),
            cards = Array.from(document.querySelectorAll('#admin-idosav-lista .admin-idosav-kartya'));
        document.querySelector('[data-schedule-range]').textContent = adminStudioHetFelirat(days);
        target.innerHTML = days
            .map((date) => {
                const matching = cards.filter((card) => mezo(card, 'work_date').value === date);
                return `<button type="button" class="studio-schedule-day" data-studio-schedule-day="${date}" ${allapot.beosztasBetoltve ? '' : 'disabled'}><span><strong>${new Date(date + 'T12:00:00').toLocaleDateString('hu-HU', { weekday: 'long' })}</strong><small>${new Date(date + 'T12:00:00').toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}</small></span><span class="studio-schedule-chips">${matching.length ? matching.map((card) => `<span><i class="studio-track-dot"></i>${html(mezo(card, 'start_time').value)}–${html(mezo(card, 'end_time').value)}</span>`).join('') : '<small>Nincs foglalható idősáv</small>'}</span>${adminV2Ikon('arrow')}</button>`;
            })
            .join('');
    }

    function adminStudioNapSzerkeszto(date, trigger) {
        const list = document.getElementById('admin-idosav-lista');
        window.LumiAdminSheet.resetWithin(list);
        const cards = Array.from(list.querySelectorAll('.admin-idosav-kartya')).filter((card) => mezo(card, 'work_date').value === date);
        if (cards.length) {
            adminSzerkesztoPanelMegnyitasa({
                owner: list,
                nodes: cards,
                title: new Date(date + 'T12:00:00').toLocaleDateString('hu-HU', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                }),
                trigger,
                onSave: () => idosavokMentese(),
                onClose: adminStudioBeosztasRender
            });
            return;
        }
        const form = document.createElement('div');
        form.className = 'studio-new-day';
        form.hidden = true;
        const draft = adminStudioNapPiszkozatok.get(date) || {
            start: '09:00',
            end: '18:00'
        };
        form.innerHTML = `<p class="studio-helper">Ez az idősáv kizárólag a kiválasztott dátumra vonatkozik.</p><label class="admin-mezo">Dátum<input type="date" value="${date}" readonly></label><div class="studio-two-columns"><label class="admin-mezo">Kezdés<input type="time" data-day-start value="09:00"></label><label class="admin-mezo">Vége<input type="time" data-day-end value="18:00"></label></div>`;
        list.append(form);
        form.querySelector('[data-day-start]').value = draft.start;
        form.querySelector('[data-day-end]').value = draft.end;
        adminSzerkesztoPanelMegnyitasa({
            owner: list,
            nodes: [form],
            title: 'Napi beosztás',
            trigger,
            saveLabel: 'Nap mentése',
            onSave: async () => {
                allapot.naptarKijelolesek.set(date, {
                    start_time: form.querySelector('[data-day-start]').value,
                    end_time: form.querySelector('[data-day-end]').value,
                    slot_step_minutes: naptarKozosLepesErtek()
                });
                naptarKijeloltListaRenderelese();
                await naptarKijeloltNapokMentese();
            },
            onClose: () => {
                adminStudioNapPiszkozatok.set(date, {
                    start: form.querySelector('[data-day-start]').value,
                    end: form.querySelector('[data-day-end]').value
                });
                form.remove();
                adminStudioBeosztasRender();
            }
        });
    }

    function adminStudioStatisztikaFrissites(month = '') {
        const panel = document.getElementById('admin-panel-attekintes');
        if (!panel) return;
        const records = allapot.foglalasElemek.map((item) => ({
            ...item.adat,
            customer_name: item.adat.customer_name || item.adat.reason || 'Kézi időpont'
        }));
        const selected = month || adminStudioStatisztikaHonap || panel.querySelector('[data-studio-outcome-month]').value || maiHonap();
        if (month) adminStudioStatisztikaHonap = month;
        panel.querySelector('[data-studio-outcome-month]').value = selected;
        const week = adminStudioHetNapok(0, adminStudioStatisztikaHet);
        const paid = records.filter(
            (record) => record.paid_amount !== null && record.paid_amount !== undefined && Number.isFinite(Number(record.paid_amount))
        );
        const amount = (list) => new Intl.NumberFormat('hu-HU').format(list.reduce((sum, item) => sum + Number(item.paid_amount), 0)) + ' Ft';
        const weekly = paid.filter((record) => {
            const day = foglalasDatumKulcs(record.starts_at);
            return day >= week[0] && day <= week[6];
        });
        const monthly = paid.filter((record) => foglalasDatumKulcs(record.starts_at).startsWith(selected));
        panel.querySelector('[data-studio-revenue-week]').textContent = amount(weekly);
        panel.querySelector('[data-studio-revenue-month]').textContent = amount(monthly);
        panel.querySelector('[data-studio-revenue-week-count]').textContent = `${weekly.length} rögzített összeg`;
        panel.querySelector('[data-studio-period="week"] > span').textContent = adminStudioStatisztikaHet
            ? adminStudioHetFelirat(week)
            : 'Ezen a héten';
        panel.querySelector('[data-studio-period="month"] > span').textContent =
            selected === maiHonap()
                ? 'Ebben a hónapban'
                : new Date(selected + '-01T12:00:00').toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'long'
                  });
        panel.querySelector('[data-studio-revenue-month-count]').textContent = `${monthly.length} rögzített összeg · időszak választása`;
        panel.querySelector('[data-studio-data-scope]').textContent =
            `A betöltött ${records.length} online és kézi időpont alapján. Archivált összesítés nem érhető el.`;
        const today = maiDatum(),
            seven = new Date();
        seven.setDate(seven.getDate() + 7);
        const end = adminV2DatumKulcs(seven);
        panel.querySelector('[data-studio-week-count]').textContent = records.filter((record) => {
            const day = foglalasDatumKulcs(record.starts_at);
            return day >= today && day < end && !['cancelled', 'cancelled_by_customer'].includes(record.status);
        }).length;
        const upcoming = records
            .filter(
                (record) => new Date(record.ends_at) >= new Date() && !['cancelled', 'cancelled_by_customer', 'done'].includes(record.status)
            )
            .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))[0];
        panel.querySelector('[data-studio-next]').innerHTML = upcoming
            ? `<button type="button" class="studio-next-guest" data-admin-v2-booking-search="${attr(upcoming.public_reference || upcoming.customer_name)}"><span class="studio-avatar">${html(upcoming.customer_name.slice(0, 1))}</span><span><small>Következő vendég · ${html(datumIdoRovid(upcoming.starts_at))}</small><strong>${html(upcoming.customer_name)}</strong><small>${html(upcoming.services?.name || 'Szolgáltatás')}</small></span><span class="studio-next-time"><strong>${html(idoInputErtek(upcoming.starts_at))}</strong><small>${html(idoInputErtek(upcoming.ends_at))}-ig</small></span>${adminV2Ikon('arrow')}</button>`
            : '';
        const current = records.filter((record) => foglalasDatumKulcs(record.starts_at).startsWith(selected));
        const done = current.filter((record) => record.status === 'done').length,
            pending = current.filter((record) => record.status === 'pending').length,
            cancelled = current.filter((record) => ['cancelled', 'cancelled_by_customer'].includes(record.status)).length;
        panel.querySelector('[data-studio-outcomes]').innerHTML =
            `<div class="studio-outcome-total"><span>Havi időpontok<small>${current.length - cancelled - done} nyitott foglalás</small></span><strong>${current.length}</strong></div><div class="studio-outcome-counts">${[
                ['Teljesítve', done],
                ['Függőben', pending],
                ['Lemondva', cancelled]
            ]
                .map(([label, count]) => `<span><strong>${count}</strong><small>${label}</small></span>`)
                .join('')}</div>`;
        const months = Array.from({ length: 6 }, (_, index) => {
            const date = new Date(selected + '-01T12:00:00');
            date.setDate(1);
            date.setMonth(date.getMonth() - 5 + index);
            const key = adminV2DatumKulcs(date).slice(0, 7),
                items = paid.filter((record) => foglalasDatumKulcs(record.starts_at).startsWith(key));
            return {
                label: date.toLocaleDateString('hu-HU', {
                    year: 'numeric',
                    month: 'long'
                }),
                sum: items.reduce((sum, item) => sum + Number(item.paid_amount), 0)
            };
        });
        const max = Math.max(1, ...months.map((item) => item.sum));
        panel.querySelector('[data-studio-chart]').innerHTML = months
            .map(
                (item) =>
                    `<div><span><small>${html(item.label)}</small><strong>${new Intl.NumberFormat('hu-HU').format(item.sum)} Ft</strong></span><i><b style="width:${(item.sum / max) * 100}%"></b></i></div>`
            )
            .join('');
    }
