    function adminV2VendegPanelLetrehozasa(workspaceMain) {
        if (document.getElementById('admin-panel-vendegek')) return;

        const panel = document.createElement('section');
        panel.id = 'admin-panel-vendegek';
        panel.className = 'admin-db-panel admin-vendeg-panel';
        panel.innerHTML = `
                <div class="admin-v2-page-heading">
                    <div>
                        <p class="admin-v2-kicker">Vendégfiókok</p>
                        <h1>Regisztrált tagok</h1>
                        <p>Név, e-mail és telefonszám.</p>
                    </div>
                </div>
                <p class="admin-vendeg-osszefoglalo" data-vendeg-osszefoglalo aria-live="polite">Betöltés…</p>
                <div class="admin-vendeg-lista" data-vendeg-lista aria-label="Regisztrált tagok listája">
                    <p class="admin-vendeg-ures">Regisztrált tagok betöltése…</p>
                </div>
            `;

        workspaceMain.append(panel);
    }

    function vendegProfilokBetoltese() {
        return adminKeresOsszevonasa('vendegProfilokBetoltese', vendegProfilokBetolteseLetoltese);
    }

    async function vendegProfilokBetolteseLetoltese() {
        const ervenyes = adminKeresMunkamenetOr();
        const panel = document.getElementById('admin-panel-vendegek');
        if (!panel || !allapot.kliens || !allapot.session) return;

        const keresId = ++allapot.vendegProfilKeresId;
        const lista = panel.querySelector('[data-vendeg-lista]');
        const osszefoglalo = panel.querySelector('[data-vendeg-osszefoglalo]');
        if (lista) lista.innerHTML = '<p class="admin-vendeg-ures">Regisztrált tagok betöltése…</p>';
        if (osszefoglalo) osszefoglalo.textContent = 'Betöltés…';

        const { data, error } = await allapot.kliens.rpc('admin_registered_customer_profiles');

        if (!ervenyes() || keresId !== allapot.vendegProfilKeresId) return;
        if (error) {
            if (lista) lista.innerHTML = '<p class="admin-vendeg-ures admin-vendeg-hiba">Nem sikerült betölteni a regisztrált tagokat.</p>';
            if (osszefoglalo) osszefoglalo.textContent = 'Betöltési hiba';
            onlineStatusz('Nem sikerült betölteni a regisztrált tagokat.', true);
            return;
        }

        allapot.vendegProfilok = Array.isArray(data) ? data : [];
        vendegProfilListaRenderelese();
    }

    let adminStudioVendegOldal = 1,
        adminStudioVendegMeret = 10,
        adminStudioVendegKereses = '';
    function vendegProfilListaRenderelese() {
        const panel = document.getElementById('admin-panel-vendegek');
        const lista = panel?.querySelector('[data-vendeg-lista]');
        const osszefoglalo = panel?.querySelector('[data-vendeg-osszefoglalo]');
        if (!lista || !osszefoglalo) return;

        let controls = panel.querySelector('.studio-guest-controls');
        if (!controls) {
            controls = document.createElement('div');
            controls.className = 'studio-guest-controls';
            controls.innerHTML =
                '<label class="admin-mezo">Keresés<input type="search" placeholder="Név, e-mail, telefon" data-guest-search></label><label class="admin-mezo">Oldalanként<select data-guest-size><option>10</option><option>20</option><option>50</option><option value="all">Összes</option></select></label><div class="admin-lapozo-nav"><button type="button" class="admin-v2-icon-button" data-guest-prev aria-label="Előző oldal">‹</button><span data-guest-page></span><button type="button" class="admin-v2-icon-button" data-guest-next aria-label="Következő oldal">›</button></div>';
            lista.before(controls);
            controls.querySelector('input').addEventListener('input', (e) => {
                adminStudioVendegKereses = e.target.value;
                adminStudioVendegOldal = 1;
                vendegProfilListaRenderelese();
            });
            controls.querySelector('select').addEventListener('change', (e) => {
                adminStudioVendegMeret = e.target.value;
                adminStudioVendegOldal = 1;
                vendegProfilListaRenderelese();
            });
            controls.querySelector('[data-guest-prev]').onclick = () => {
                adminStudioVendegOldal--;
                vendegProfilListaRenderelese();
            };
            controls.querySelector('[data-guest-next]').onclick = () => {
                adminStudioVendegOldal++;
                vendegProfilListaRenderelese();
            };
            adminStudioSwipe(lista, (d) => controls.querySelector(d > 0 ? '[data-guest-next]' : '[data-guest-prev]').click());
        }
        const matches = allapot.vendegProfilok.filter((p) =>
            normalizaltKereses([p.customer_name, p.customer_email, p.customer_phone].join(' ')).includes(
                normalizaltKereses(adminStudioVendegKereses)
            )
        );
        const size = adminStudioVendegMeret === 'all' ? Math.max(1, matches.length) : Number(adminStudioVendegMeret),
            pages = Math.max(1, Math.ceil(matches.length / size));
        adminStudioVendegOldal = Math.max(1, Math.min(adminStudioVendegOldal, pages));
        controls.querySelector('[data-guest-page]').textContent = adminStudioVendegOldal + ' / ' + pages;
        controls.querySelector('[data-guest-prev]').disabled = adminStudioVendegOldal === 1;
        controls.querySelector('[data-guest-next]').disabled = adminStudioVendegOldal === pages;
        osszefoglalo.textContent = `${allapot.vendegProfilok.length} regisztrált tag`;

        if (!allapot.vendegProfilok.length) {
            lista.innerHTML = '<p class="admin-vendeg-ures">Még nincs regisztrált tag.</p>';
            return;
        }

        lista.innerHTML = matches
            .slice((adminStudioVendegOldal - 1) * size, adminStudioVendegOldal * size)
            .map(
                (profile) => `
                <div class="admin-vendeg-sor">
                    <span class="admin-vendeg-monogram">${html(vendegMonogram(profile.customer_name))}</span>
                    <span class="admin-vendeg-sor-copy">
                        <button type="button" class="studio-guest-name" data-guest-email="${attr(profile.customer_email || '')}" data-guest-phone="${attr(profile.customer_phone || '')}" data-guest-name="${attr(profile.customer_name || '')}">${html(profile.customer_name || 'Név nincs megadva')}</button>
                        <small><a href="mailto:${attr(profile.customer_email || '')}">${html(profile.customer_email || 'E-mail nincs megadva')}</a></small>
                        <small><a href="tel:${attr(csakSzamok(profile.customer_phone))}">${html(profile.customer_phone || 'Telefon nincs megadva')}</a> ${profile.customer_phone ? `<button type="button" class="studio-phone-copy" data-copy-phone="${attr(profile.customer_phone)}">Másolás</button>` : ''}</small>
                    </span>
                </div>
            `
            )
            .join('');
    }

    function vendegMonogram(value) {
        const parts = String(value || '?')
            .trim()
            .split(/\s+/)
            .filter(Boolean);
        return (
            parts
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join('')
                .toLocaleUpperCase('hu-HU') || '?'
        );
    }

    document.addEventListener('click', async (event) => {
        const copy = event.target.closest('[data-copy-phone]');
        if (copy) {
            try {
                await navigator.clipboard.writeText(copy.dataset.copyPhone);
                onlineStatusz('Telefonszám másolva.');
            } catch (_) {
                onlineStatusz('A böngésző nem engedte a másolást.', true);
            }
            return;
        }
        const guest = event.target.closest('[data-guest-email]');
        if (guest) await adminStudioVendegTortenet(guest);
    });
    async function adminStudioVendegTortenet(trigger) {
        if (!allapot.foglalasElemek.length) await foglalasokBetoltese();
        const email = String(trigger.dataset.guestEmail || '')
                .trim()
                .toLowerCase(),
            phone = csakSzamok(trigger.dataset.guestPhone);
        const records = allapot.foglalasElemek.filter(
            (i) =>
                i.tipus === 'booking' &&
                ((email && i.adat.customer_email?.trim().toLowerCase() === email) || (phone && csakSzamok(i.adat.customer_phone) === phone))
        );
        const owner = document.createElement('div');
        owner.className = 'studio-guest-history';
        trigger.parentElement.append(owner);
        const body = document.createElement('div');
        owner.append(body);
        body.innerHTML =
            '<button type="button" class="admin-v2-button" data-guest-rebook>Új kézi időpont</button><p class="studio-helper">A betöltött online foglalások előzményei. A kézi időpontokból név alapján nem azonosítunk vendéget.</p>' +
            (records.length
                ? records
                      .sort((a, b) => new Date(b.adat.starts_at) - new Date(a.adat.starts_at))
                      .map(
                          (i) =>
                              '<button type="button" class="studio-history-record" data-history-id="' +
                              attr(i.adat.id) +
                              '"><strong>' +
                              html(datumIdoRovid(i.adat.starts_at)) +
                              '</strong><span>' +
                              html(i.adat.services?.name || 'Foglalás') +
                              '</span><small>' +
                              html(adminV2StatuszFelirat(i.adat.status)) +
                              '</small></button>'
                      )
                      .join('')
                : '<p>Nincs betöltött előzmény.</p>');
        body.addEventListener('click', async (e) => {
            if (e.target.closest('[data-guest-rebook]')) {
                window.LumiAdminSheet.resetWithin(owner);
                await adminPanelAdatokBetoltese('tiltasok');
                adminStudioKeziPanel();
                const name = document.getElementById('admin-tiltas-ok');
                name.value = trigger.dataset.guestName || '';
                name.dispatchEvent(new Event('input', { bubbles: true }));
                onlineStatusz('Új kézi időpont: válassz szolgáltatást és időt. A vendég elérhetősége nem kerül a kézi időpontba.');
                return;
            }
            const item = records.find((i) => String(i.adat.id) === e.target.closest('[data-history-id]')?.dataset.historyId);
            if (!item) return;
            window.LumiAdminSheet.resetWithin(owner);
            adminV2Valtas('foglalasok');
            await adminPanelAdatokBetoltese('foglalasok');
            const fresh = allapot.foglalasElemek.find((i) => i.adat.id === item.adat.id) || item;
            adminStudioRekordMegnyitas(fresh);
        });
        adminSzerkesztoPanelMegnyitasa({
            owner,
            nodes: [body],
            title: trigger.dataset.guestName || 'Vendég előzményei',
            trigger,
            onClose: () => owner.remove()
        });
    }
