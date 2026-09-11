    async function kuponokBetoltese() {
        const elemek = adminElemek();
        if (!elemek.kuponLista) return;

        let { data, error } = await allapot.kliens
            .from('coupons')
            .select('id,code,title,description,discount_type,discount_value,discount_basis,discount_text,service_id,service_category,customer_scope,valid_from,valid_until,active,show_on_home,sort_order')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });

        if (error && adatbazisOszlopHiany(error, ['discount_basis'])) {
            ({ data, error } = await allapot.kliens
                .from('coupons')
                .select('id,code,title,description,discount_type,discount_value,discount_text,service_id,service_category,customer_scope,valid_from,valid_until,active,show_on_home,sort_order')
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: true }));
        }

        if (error && adatbazisOszlopHiany(error, ['service_category', 'customer_scope'])) {
            ({ data, error } = await allapot.kliens
                .from('coupons')
                .select('id,code,title,description,discount_type,discount_value,discount_text,service_id,valid_from,valid_until,active,show_on_home,sort_order')
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: true }));
        }

        if (error) {
            allapot.kuponok = [];
            arKalkulatorKuponokFrissitese();
            elemek.kuponLista.innerHTML = `<p class="admin-ures">A kuponkezel\u00e9shez futtasd a <code>supabase-coupons.sql</code> f\u00e1jlt Supabase-ben.</p>`;
            if (!hianyzoKuponTabla(error)) onlineStatusz('Nem siker\u00fclt bet\u00f6lteni a kuponokat.', true);
            return;
        }

        allapot.kuponok = (data || []).map(kupon => ({
            ...kupon,
            discount_basis: kuponKedvezmenyAlapja(kupon)
        }));
        arKalkulatorKuponokFrissitese();
        elemek.kuponLista.innerHTML = '';

        if (!allapot.kuponok.length) {
            elemek.kuponLista.innerHTML = '<p class="admin-ures">M\u00e9g nincs kupon. Hozz l\u00e9tre egyet az \u00daj kupon gombbal.</p>';
            return;
        }

        allapot.kuponok.forEach(kupon => elemek.kuponLista.appendChild(kuponKartya(kupon)));
    }

    function kuponKartya(kupon) {
        const ujKupon = String(kupon.title || '').trim().toLowerCase() === 'új kupon';
        const ervenyesseg = [kupon.valid_from, kupon.valid_until].filter(Boolean).join(' – ') || 'Nincs dátumkorlát';
        const aktualisAllapot = kuponAktualisAllapota(kupon);
        const kedvezmenyAlap = kuponKedvezmenyAlapFelirat(kuponKedvezmenyAlapja(kupon));
        const kartya = document.createElement('article');
        kartya.className = `admin-db-kartya admin-kupon-kartya admin-szerkesztheto-kartya${ujKupon ? ' szerkeszt' : ''}`;
        kartya.dataset.id = kupon.id;

        kartya.innerHTML = `
            <div class="admin-kompakt-kartya-fej">
                <div class="admin-kompakt-kartya-osszefoglalo">
                    <span class="admin-kartya-tipus">Kupon</span>
                    <h3>${html(kupon.code || 'Kód nélkül')}</h3>
                    <p>${html(kupon.title || 'Névtelen kupon')} · ${html(kupon.discount_text || `${Number(kupon.discount_value) || 0}`)} · ${html(kedvezmenyAlap)} · ${html(ervenyesseg)}</p>
                </div>
                <div class="admin-kompakt-kartya-vezerlok">
                    <span class="admin-allapot-jelzo${aktualisAllapot.aktiv ? '' : ' inaktiv'}">${html(aktualisAllapot.cimke)}</span>
                    ${kupon.show_on_home ? `<span class="admin-allapot-jelzo${aktualisAllapot.aktiv ? '' : ' inaktiv'}">${aktualisAllapot.aktiv ? 'Főoldalon' : 'Főoldalra jelölve'}</span>` : ''}
                    <button type="button" class="admin-kis-gomb admin-ikonos-gomb" data-admin-kartya-toggle aria-expanded="${String(ujKupon)}">${adminV2Ikon(ujKupon ? 'close' : 'edit')}<span>${ujKupon ? 'Bezárás' : 'Szerkesztés'}</span></button>
                </div>
            </div>
            <div class="admin-kompakt-szerkeszto">
                <div class="admin-kupon-szerkeszto-racs">
                    <fieldset class="admin-kupon-szekcio admin-kupon-szekcio--alapadatok">
                        <legend>Kupon adatai</legend>
                        <div class="admin-kupon-mezo-racs admin-kupon-mezo-racs--alapadatok">
                            <label class="admin-mezo admin-kupon-kod">Kuponkód<input type="text" data-mezo="code" value="${attr(kupon.code || '')}" autocomplete="off"></label>
                            <label class="admin-mezo admin-kupon-cim">Belső név<input type="text" data-mezo="title" value="${attr(kupon.title || '')}"></label>
                            <label class="admin-mezo admin-kupon-leiras">Vendégnek szóló leírás<textarea data-mezo="description" rows="3">${html(kupon.description || '')}</textarea></label>
                        </div>
                    </fieldset>

                    <fieldset class="admin-kupon-szekcio admin-kupon-szekcio--kedvezmeny">
                        <legend>Kedvezmény számítása</legend>
                        <p class="admin-kupon-szekcio-leiras">Válaszd ki a kedvezmény formáját és azt az összeget, amelyből le kell vonni.</p>
                        <div class="admin-kupon-mezo-racs">
                            <label class="admin-mezo admin-kupon-tipus">Kedvezmény típusa<select data-mezo="discount_type">${kuponTipusOptions(kupon.discount_type)}</select></label>
                            <label class="admin-mezo admin-kupon-ertek">Érték<input type="number" min="0" step="1" inputmode="numeric" data-mezo="discount_value" value="${Number(kupon.discount_value) || 0}"></label>
                            <label class="admin-mezo admin-kupon-alap">Miből vonja le?<select data-mezo="discount_basis">${kuponKedvezmenyAlapOptions(kuponKedvezmenyAlapja(kupon))}</select></label>
                            <label class="admin-mezo admin-kupon-szoveg">Megjelenő kedvezményszöveg<input type="text" data-mezo="discount_text" value="${attr(kupon.discount_text || '')}"></label>
                        </div>
                        <p class="admin-kupon-szamitas-pelda" data-kupon-szamitas-segedlet></p>
                    </fieldset>

                    <fieldset class="admin-kupon-szekcio admin-kupon-szekcio--feltetelek">
                        <legend>Felhasználási feltételek</legend>
                        <div class="admin-kupon-mezo-racs">
                            <label class="admin-mezo admin-kupon-szolgaltatas">Mire érvényes?<select data-mezo="service_scope">${kuponSzolgaltatasOptions(kupon)}</select></label>
                            <label class="admin-mezo admin-kupon-celkozonseg">Ki használhatja?<select data-mezo="customer_scope">${kuponKozonsegOptions(kupon.customer_scope)}</select></label>
                            <label class="admin-mezo admin-kupon-datum">Érvényes ettől<input type="date" data-mezo="valid_from" value="${attr(kupon.valid_from || '')}"></label>
                            <label class="admin-mezo admin-kupon-datum">Érvényes eddig<input type="date" data-mezo="valid_until" value="${attr(kupon.valid_until || '')}"></label>
                        </div>
                    </fieldset>

                    <fieldset class="admin-kupon-szekcio admin-kupon-szekcio--megjelenes">
                        <legend>Megjelenés és állapot</legend>
                        <div class="admin-kupon-kapcsolok">
                            <label class="admin-mezo admin-checkbox admin-kupon-checkbox"><input type="checkbox" data-mezo="active" ${kupon.active ? 'checked' : ''}> <span><strong>Aktív kupon</strong><small>Csak aktív és dátum szerint érvényes kupon használható.</small></span></label>
                            <label class="admin-mezo admin-checkbox admin-kupon-checkbox"><input type="checkbox" data-mezo="show_on_home" ${kupon.show_on_home ? 'checked' : ''}> <span><strong>Főoldali kártya</strong><small>Az ajánlat a főoldalon is megjelenhet.</small></span></label>
                        </div>
                        <label class="admin-mezo admin-kupon-sorrend">Megjelenési sorrend<input type="number" step="1" inputmode="numeric" data-mezo="sort_order" value="${Number(kupon.sort_order) || 0}"></label>
                    </fieldset>
                </div>
                <div class="admin-db-akciok admin-kupon-akciok">
                    <button type="button" class="admin-kis-gomb admin-ikonos-gomb" data-kupon-mozgat="fel">${adminV2Ikon('up')}<span>Feljebb</span></button>
                    <button type="button" class="admin-kis-gomb admin-ikonos-gomb" data-kupon-mozgat="le">${adminV2Ikon('down')}<span>Lejjebb</span></button>
                    <button type="button" class="admin-kis-gomb admin-veszely-gomb admin-ikonos-gomb" data-kupon-torles>${adminV2Ikon('trash')}<span>Törlés</span></button>
                </div>
            </div>
        `;
        kuponSzerkesztoMezoAllapotFrissitese(kartya);
        return kartya;
    }

    function kuponAktualisAllapota(kupon) {
        const ma = maiDatum();
        if (!kupon.active) return { aktiv: false, cimke: 'Inaktív' };
        if (kupon.valid_until && kupon.valid_until < ma) return { aktiv: false, cimke: 'Lejárt' };
        if (kupon.valid_from && kupon.valid_from > ma) return { aktiv: false, cimke: 'Időzítve' };
        return { aktiv: true, cimke: 'Aktív' };
    }

    function kuponTipusOptions(aktiv) {
        return [
            ['percent', 'Sz\u00e1zal\u00e9k (%)'],
            ['fixed', 'Fix \u00f6sszeg (Ft)'],
            ['text', 'Csak sz\u00f6veges akci\u00f3']
        ].map(([ertek, cimke]) => `<option value="${ertek}" ${ertek === aktiv ? 'selected' : ''}>${cimke}</option>`).join('');
    }

    function kuponKedvezmenyAlapja(kupon = {}) {
        const alap = String(kupon?.discount_basis || '').trim().toLowerCase();
        if (['total', 'service', 'decoration'].includes(alap)) return alap;
        return normalizaltAdminKuponSzoveg(kupon?.service_category) === 'diszites' ? 'decoration' : 'service';
    }

    function kuponKedvezmenyAlapOptions(aktiv = 'service') {
        return [
            ['total', 'Teljes árból (szolgáltatás + díszítések)'],
            ['service', 'Csak az alapszolgáltatás árából'],
            ['decoration', 'Csak a díszítések árából']
        ].map(([ertek, cimke]) => `<option value="${ertek}" ${ertek === aktiv ? 'selected' : ''}>${cimke}</option>`).join('');
    }

    function kuponKedvezmenyAlapFelirat(alap) {
        if (alap === 'total') return 'Teljes árból';
        if (alap === 'decoration') return 'Díszítések árából';
        return 'Szolgáltatás árából';
    }

    function normalizaltAdminKuponSzoveg(ertek) {
        return String(ertek || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase('hu-HU')
            .trim();
    }

    function kuponSzerkesztoMezoAllapotFrissitese(kartya) {
        const tipus = mezo(kartya, 'discount_type')?.value || 'percent';
        const ertek = mezo(kartya, 'discount_value');
        const alap = mezo(kartya, 'discount_basis');
        const segedlet = kartya.querySelector('[data-kupon-szamitas-segedlet]');
        const szoveges = tipus === 'text';

        if (ertek) ertek.disabled = szoveges;
        if (alap) alap.disabled = szoveges;
        if (!segedlet) return;

        if (szoveges) {
            segedlet.textContent = 'A szöveges akció nem számol automatikus végösszeget; a részleteket a megjelenő szövegben add meg.';
            return;
        }

        const tipusFelirat = tipus === 'fixed' ? 'fix összeget' : 'százalékot';
        segedlet.textContent = `A kalkulátor a megadott ${tipusFelirat} a(z) „${kuponKedvezmenyAlapFelirat(alap?.value)}” összegből vonja le.`;
    }

    function kuponKozonsegOptions(aktiv = 'all') {
        const ertek = ['all', 'new_customer'].includes(String(aktiv || 'all')) ? String(aktiv || 'all') : 'all';
        return [
            ['all', 'Mindenkinek'],
            ['new_customer', 'Csak \u00faj vend\u00e9gnek']
        ].map(([value, cimke]) => `<option value="${value}" ${value === ertek ? 'selected' : ''}>${cimke}</option>`).join('');
    }

    function kuponSzolgaltatasOptions(kupon = {}) {
        const aktivErtek = kuponScopeAktivErtek(kupon);
        const opciok = [
            `<option value="all" ${aktivErtek === 'all' ? 'selected' : ''}>Minden szolg\u00e1ltat\u00e1s</option>`,
            `<option value="category:D\u00edsz\u00edt\u00e9s" ${aktivErtek === 'category:D\u00edsz\u00edt\u00e9s' ? 'selected' : ''}>Extra d\u00edsz\u00edt\u00e9s b\u00e1rmely foglalhat\u00f3 szolg\u00e1ltat\u00e1s mell\u00e9</option>`
        ];
        const kategoriak = SZOLGALTATAS_KUPON_KATEGORIAK.filter(kategoria =>
            kategoria !== 'D\u00edsz\u00edt\u00e9s'
            && allapot.szolgaltatasok.some(szolgaltatas =>
                szolgaltatas.booking_enabled
                && szolgaltatasKuponKategoria(szolgaltatas) === kategoria
            )
        );

        if (kategoriak.length) {
            opciok.push('<optgroup label="Foglalhat\u00f3 kateg\u00f3ri\u00e1k">');
            kategoriak.forEach(kategoria => {
                const ertek = `category:${kategoria}`;
                opciok.push(`<option value="${attr(ertek)}" ${aktivErtek === ertek ? 'selected' : ''}>${html(kategoria)} kateg\u00f3ria</option>`);
            });
            opciok.push('</optgroup>');
        }

        const foglalhatoSzolgaltatasok = allapot.szolgaltatasok.filter(szolgaltatas =>
            szolgaltatas.booking_enabled
            && szolgaltatasKuponKategoria(szolgaltatas) !== 'D\u00edsz\u00edt\u00e9s'
        );
        if (foglalhatoSzolgaltatasok.length) {
            opciok.push('<optgroup label="Konkr\u00e9t foglalhat\u00f3 t\u00e9telek">');
            foglalhatoSzolgaltatasok.forEach(szolgaltatas => {
                const ertek = `service:${szolgaltatas.id}`;
                opciok.push(`<option value="${attr(ertek)}" ${aktivErtek === ertek ? 'selected' : ''}>${html(szolgaltatas.name || '')}</option>`);
            });
            opciok.push('</optgroup>');
        }

        return opciok.join('');
    }

    function kuponScopeAktivErtek(kupon = {}) {
        if (kupon.service_id) {
            const szolgaltatas = allapot.szolgaltatasok.find(tetel => tetel.id === kupon.service_id);
            if (szolgaltatasKuponKategoria(szolgaltatas) === 'D\u00edsz\u00edt\u00e9s') {
                return 'category:D\u00edsz\u00edt\u00e9s';
            }
            return `service:${kupon.service_id}`;
        }
        if (kupon.service_category) return `category:${kupon.service_category}`;
        return 'all';
    }
    function kuponScopePayload(scope) {
        const payload = { service_id: null, service_category: null };
        const ertek = String(scope || 'all');
        if (ertek.startsWith('service:')) payload.service_id = ertek.slice('service:'.length) || null;
        if (ertek.startsWith('category:')) payload.service_category = ertek.slice('category:'.length) || null;
        return payload;
    }

    function szolgaltatasKuponKategoria(szolgaltatas) {
        const szoveg = `${szolgaltatas?.name || ''} ${szolgaltatas?.description || ''}`.toLocaleLowerCase('hu-HU');
        if (szoveg.includes('\u00e9p\u00edt')) return '\u00c9p\u00edt\u00e9s';
        if (szoveg.includes('t\u00f6lt')) return 'T\u00f6lt\u00e9s';
        if (szoveg.includes('g\u00e9l lakk') || szoveg.includes('g\u00e9llakk') || szoveg.includes('gel lakk')) return 'G\u00e9l lakk';
        if (szoveg.includes('manik')) return 'Manik\u0171r';
        if (szoveg.includes('d\u00edsz') || szoveg.includes('nail art') || szoveg.includes('k\u0151')) return 'D\u00edsz\u00edt\u00e9s';
        if (szoveg.includes('leszed')) return 'Leszed\u00e9s';
        return '';
    }

    async function kuponHozzaadas() {
        onlineStatusz('\u00daj kupon l\u00e9trehoz\u00e1sa...');
        const ujKupon = {
            code: `LUMI${Math.floor(Math.random() * 90 + 10)}`,
            title: '\u00daj kupon',
            description: 'R\u00f6vid akci\u00f3s le\u00edr\u00e1s, ami a f\u0151oldalon is megjelenhet.',
            discount_type: 'percent',
            discount_value: 10,
            discount_basis: 'service',
            discount_text: '10% kedvezm\u00e9ny',
            customer_scope: 'all',
            valid_from: maiDatum(),
            active: false,
            show_on_home: false,
            sort_order: 999
        };

        let { error } = await allapot.kliens.from('coupons').insert(ujKupon);

        if (error && adatbazisOszlopHiany(error, ['discount_basis', 'customer_scope'])) {
            const kompatibilisKupon = { ...ujKupon };
            if (adatbazisOszlopHiany(error, ['discount_basis'])) delete kompatibilisKupon.discount_basis;
            if (adatbazisOszlopHiany(error, ['customer_scope'])) delete kompatibilisKupon.customer_scope;
            ({ error } = await allapot.kliens.from('coupons').insert(kompatibilisKupon));
            if (!error) {
                onlineStatusz('\u00daj kupon l\u00e9trehozva, de az \u00faj vend\u00e9g kuponmez\u0151h\u00f6z futtasd a friss Supabase SQL-t.', true);
                kuponokBetoltese();
                return;
            }
        }

        if (error) {
            onlineStatusz('Nem siker\u00fclt l\u00e9trehozni a kupont. Futtasd a supabase-coupons.sql f\u00e1jlt.', true);
            return;
        }

        onlineStatusz('\u00daj kupon l\u00e9trehozva.');
        kuponokBetoltese();
    }

    async function kuponListaKattintas(event) {
        const kartya = event.target.closest('.admin-kupon-kartya');
        if (!kartya) return;

        const szerkesztes = event.target.closest('[data-admin-kartya-toggle]');
        if (szerkesztes) {
            adminKartyaSzerkesztesKapcsolasa(kartya, szerkesztes);
            return;
        }

        const mozgatas = event.target.closest('[data-kupon-mozgat]');
        if (mozgatas) {
            kuponMozgatasa(kartya, mozgatas.dataset.kuponMozgat);
            return;
        }

        if (event.target.closest('[data-kupon-torles]')) {
            if (!window.confirm('Biztosan törlöd ezt a kupont? Törlés előtt automatikusan inaktiválom, hogy ne maradjon kint a főoldalon.')) return;
            await kuponTorlese(kartya.dataset.id);
        }
    }

    function kuponListaValtozas(event) {
        const kartya = event.target.closest('.admin-kupon-kartya');
        if (!kartya || !event.target.matches('[data-mezo="discount_type"], [data-mezo="discount_basis"]')) return;
        kuponSzerkesztoMezoAllapotFrissitese(kartya);
    }

    async function kuponTorlese(id) {
        onlineStatusz('Kupon inaktiválása és törlése...');

        const { error: inaktivHiba } = await allapot.kliens
            .from('coupons')
            .update({ active: false, show_on_home: false })
            .eq('id', id);

        if (inaktivHiba) {
            onlineStatusz('Nem sikerült inaktiválni a kupont, ezért nem töröltem.', true);
            return;
        }

        const { error } = await allapot.kliens
            .from('coupons')
            .delete()
            .eq('id', id);

        if (error) {
            onlineStatusz('A kupont inaktiváltam, de törölni nem sikerült. Így már nem jelenik meg az oldalon.', true);
            await kuponokBetoltese();
            return;
        }

        onlineStatusz('Kupon törölve.');
        await kuponokBetoltese();
    }

    function kuponMozgatasa(kartya, irany) {
        const lista = kartya.parentElement;
        const csere = irany === 'fel' ? kartya.previousElementSibling : kartya.nextElementSibling;
        if (!lista || !csere || !csere.classList.contains('admin-kupon-kartya')) return;

        if (irany === 'fel') lista.insertBefore(kartya, csere);
        else lista.insertBefore(csere, kartya);

        Array.from(lista.querySelectorAll('.admin-kupon-kartya')).forEach((elem, index) => {
            const sorrend = mezo(elem, 'sort_order');
            if (sorrend) sorrend.value = String((index + 1) * 10);
        });
        onlineStatusz('A kupon sorrend módosult. A véglegesítéshez nyomd meg a Mentés gombot.');
    }

    async function kuponokMentese() {
        const kartyak = Array.from(document.querySelectorAll('#admin-kupon-lista .admin-kupon-kartya'));
        if (!kartyak.length) {
            onlineStatusz('Nincs menthet\u0151 kupon.');
            return;
        }

        onlineStatusz('Kuponok ment\u00e9se...');

        for (const kartya of kartyak) {
            const kod = mezo(kartya, 'code').value.trim().toUpperCase();
            if (!kod) {
                onlineStatusz('Minden kuponn\u00e1l k\u00f6telez\u0151 a kuponk\u00f3d.', true);
                mezo(kartya, 'code').focus();
                return;
            }

            const kezdetMezo = mezo(kartya, 'valid_from');
            const vegeMezo = mezo(kartya, 'valid_until');
            const aktivMezo = mezo(kartya, 'active');
            const fooldalMezo = mezo(kartya, 'show_on_home');
            const kezdet = kezdetMezo.value || null;
            const vege = vegeMezo.value || null;
            const aktiv = aktivMezo.checked;
            const fooldalon = fooldalMezo.checked;

            if (kezdet && vege && kezdet > vege) {
                onlineStatusz(`${kod}: az érvényesség vége nem lehet korábbi a kezdőnapnál.`, true);
                vegeMezo.focus();
                return;
            }
            if (aktiv && vege && vege < maiDatum()) {
                onlineStatusz(`${kod}: lejárt dátummal nem aktiválható. Töröld vagy módosítsd az érvényesség végét.`, true);
                vegeMezo.focus();
                return;
            }
            if (fooldalon && !aktiv) {
                onlineStatusz(`${kod}: a főoldali megjelenéshez az Aktív jelölést is kapcsold be.`, true);
                aktivMezo.focus();
                return;
            }

            const payload = {
                code: kod,
                title: mezo(kartya, 'title').value.trim(),
                description: mezo(kartya, 'description').value.trim(),
                discount_type: mezo(kartya, 'discount_type').value,
                discount_value: szamMezo(kartya, 'discount_value'),
                discount_basis: mezo(kartya, 'discount_basis')?.value || 'service',
                discount_text: mezo(kartya, 'discount_text').value.trim(),
                customer_scope: mezo(kartya, 'customer_scope')?.value === 'new_customer' ? 'new_customer' : 'all',
                ...kuponScopePayload(mezo(kartya, 'service_scope')?.value),
                valid_from: kezdet,
                valid_until: vege,
                active: aktiv,
                show_on_home: fooldalon,
                sort_order: szamMezo(kartya, 'sort_order')
            };

            let { error } = await allapot.kliens
                .from('coupons')
                .update(payload)
                .eq('id', kartya.dataset.id);

            if (error && adatbazisOszlopHiany(error, ['discount_basis', 'service_category', 'customer_scope'])) {
                const kompatibilisPayload = { ...payload };
                const kedvezmenyAlapHianyzik = adatbazisOszlopHiany(error, ['discount_basis']);
                if (kedvezmenyAlapHianyzik && payload.discount_basis !== 'service') {
                    onlineStatusz(`${kod}: az új kedvezményalap mentéséhez előbb futtasd a supabase-coupon-discount-basis.sql frissítést.`, true);
                    mezo(kartya, 'discount_basis')?.focus();
                    return;
                }
                if (kedvezmenyAlapHianyzik) delete kompatibilisPayload.discount_basis;
                if (adatbazisOszlopHiany(error, ['service_category'])) delete kompatibilisPayload.service_category;
                if (adatbazisOszlopHiany(error, ['customer_scope'])) delete kompatibilisPayload.customer_scope;
                ({ error } = await allapot.kliens
                    .from('coupons')
                    .update(kompatibilisPayload)
                    .eq('id', kartya.dataset.id));
                if (!error) {
                    onlineStatusz('Kuponok mentve, de minden új kuponbeállításhoz futtasd a friss Supabase SQL-eket.', true);
                }
            }

            if (error) {
                onlineStatusz('Nem siker\u00fclt menteni az egyik kupont.', true);
                return;
            }
        }

        onlineStatusz('Kuponok mentve.');
        kuponokBetoltese();
    }
