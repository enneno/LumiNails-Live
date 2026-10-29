    function szolgaltatasokBetoltese() {
        return adminKeresOsszevonasa('szolgaltatasokBetoltese', szolgaltatasokBetolteseLetoltese);
    }

    async function szolgaltatasokBetolteseLetoltese() {
        const ervenyes = adminKeresMunkamenetOr();
        const elemek = adminElemek();
        let { data, error } = await allapot.kliens
            .from('services')
            .select(
                'id,name,description,price_text,price_amount,price_unit,price_suffix,duration_minutes,booking_enabled,active,sort_order,editor_version'
            )
            .order('sort_order', { ascending: true });

        if (error && adatbazisOszlopHiany(error, ['editor_version'])) {
            ({ data, error } = await allapot.kliens
                .from('services')
                .select(
                    'id,name,description,price_text,price_amount,price_unit,price_suffix,duration_minutes,booking_enabled,active,sort_order'
                )
                .order('sort_order', { ascending: true }));
        }
        if (error && adatbazisOszlopHiany(error, ['price_amount', 'price_unit', 'price_suffix'])) {
            ({ data, error } = await allapot.kliens
                .from('services')
                .select('id,name,description,price_text,duration_minutes,booking_enabled,active,sort_order')
                .order('sort_order', { ascending: true }));
        }

        if (error) {
            onlineStatusz('Nem sikerült betölteni az árlista tételeket.', true);
            return false;
        }

        if (!ervenyes()) return false;
        allapot.szolgaltatasok = (data || []).map(szolgaltatasArNormalizalasa);
        elemek.szolgaltatasLista.innerHTML = '';
        allapot.szolgaltatasok.forEach((szolgaltatas) => elemek.szolgaltatasLista.appendChild(szolgaltatasKartya(szolgaltatas)));
        const ujKartya = elemek.szolgaltatasLista.querySelector('.szerkeszt');
        if (ujKartya && allapot.aktivTab === 'szolgaltatasok') adminKartyaPanelMegnyitasa(ujKartya);
        keziSzolgaltatasValasztoFrissitese();
        arKalkulatorFrissitese();
        return true;
    }

    function szolgaltatasArNormalizalasa(szolgaltatas) {
        const priceText = szolgaltatas.price_text || '';
        const priceAmount =
            Number.isFinite(Number(szolgaltatas.price_amount)) && Number(szolgaltatas.price_amount) > 0
                ? Number(szolgaltatas.price_amount)
                : arOsszegKinyerese(priceText);
        const priceUnit = szolgaltatas.price_unit || arEgysegKinyerese(priceText) || 'Ft';
        const priceValue = priceAmount > 0 ? String(priceAmount) : arErtekKinyerese(priceText);

        return {
            ...szolgaltatas,
            price_amount: priceAmount || null,
            price_value: priceValue,
            price_unit: priceUnit,
            price_suffix: '',
            price_text: priceText || arFelirat(priceValue || priceAmount, priceUnit)
        };
    }

    function szolgaltatasKartya(szolgaltatas) {
        const ora = Math.floor((szolgaltatas.duration_minutes || 0) / 60);
        const perc = (szolgaltatas.duration_minutes || 0) % 60;
        const idoFelirat = [ora ? `${ora} óra` : '', perc ? `${perc} perc` : ''].filter(Boolean).join(' ') || 'Nincs időtartam';
        const arOsszeg = arFelirat(szolgaltatas.price_value, szolgaltatas.price_unit) || 'Nincs ár';
        const ujTetel = /^Új\b/i.test(String(szolgaltatas.name || '').trim());
        const kartya = document.createElement('article');
        kartya.className = `admin-db-kartya admin-szerkesztheto-kartya admin-szolgaltatas-kartya${ujTetel ? ' szerkeszt' : ''}`;
        kartya.dataset.id = szolgaltatas.id;

        kartya.innerHTML = `
                <div class="admin-kompakt-kartya-fej">
                    <div class="admin-kompakt-kartya-osszefoglalo">
                        <h3>${html(szolgaltatas.name)}</h3>
                        <p>${html(arOsszeg)} · ${html(idoFelirat)}</p>
                    </div>
                    <div class="admin-kompakt-kartya-vezerlok">
                        <span class="admin-allapot-jelzo admin-allapot-jelzo--kompakt${szolgaltatas.active ? '' : ' inaktiv'}">${szolgaltatas.active ? 'Látható' : 'Rejtett'}</span>
                        <span class="admin-allapot-jelzo admin-allapot-jelzo--kompakt${szolgaltatas.booking_enabled ? '' : ' inaktiv'}">${szolgaltatas.booking_enabled ? 'Foglalható' : 'Nem foglalható'}</span>
                        <button type="button" class="admin-kis-gomb admin-ikonos-gomb" data-admin-kartya-toggle aria-expanded="${String(ujTetel)}">${adminV2Ikon(ujTetel ? 'close' : 'edit')}<span>${ujTetel ? 'Bezárás' : 'Szerkesztés'}</span></button>
                    </div>
                </div>
                <div class="admin-kompakt-szerkeszto">
                    <div class="admin-szolgaltatas-szerkeszto-racs">
                        <fieldset class="admin-szerkeszto-szakasz">
                            <legend>Alapadatok</legend>
                            <div class="admin-szolgaltatas-alapadatok">
                                <label class="admin-mezo admin-szolgaltatas-nev">Szolgáltatás neve<input type="text" data-mezo="name" value="${attr(szolgaltatas.name)}"></label>
                                <label class="admin-mezo admin-szolgaltatas-foglalasi-nev">Rövid név a foglalásban<input type="text" data-mezo="description" value="${attr(szolgaltatas.description || '')}" placeholder="Ha üres, a teljes név látszik"></label>
                                <div class="admin-szolgaltatas-fej-opciok">
                                    <label class="admin-mezo admin-checkbox"><input type="checkbox" data-mezo="booking_enabled" ${szolgaltatas.booking_enabled ? 'checked' : ''}> Foglalható</label>
                                    <label class="admin-mezo admin-checkbox"><input type="checkbox" data-mezo="active" ${szolgaltatas.active ? 'checked' : ''}> Látható</label>
                                </div>
                            </div>
                        </fieldset>
                        <fieldset class="admin-szerkeszto-szakasz">
                            <legend>Ár és időtartam</legend>
                            <div class="admin-szolgaltatas-szamok">
                            <label class="admin-mezo admin-szolgaltatas-ar">Ár<input type="text" data-mezo="price_amount" value="${attr(szolgaltatas.price_value || '')}" placeholder="7000 vagy 500-800"></label>
                            <label class="admin-mezo admin-szolgaltatas-egyseg">Egység<input type="text" data-mezo="price_unit" value="${attr(szolgaltatas.price_unit || 'Ft')}" placeholder="Ft, Ft/db, Ft-tól"></label>
                            <label class="admin-mezo admin-szolgaltatas-ido">Óra<input type="number" min="0" step="1" data-mezo="ora" value="${ora}"></label>
                            <label class="admin-mezo admin-szolgaltatas-ido">Perc<input type="number" min="0" max="59" step="1" data-mezo="perc" value="${perc}"></label>
                            </div>
                        </fieldset>
                        <input type="hidden" data-mezo="sort_order" value="${Number(szolgaltatas.sort_order) || 0}">
                    </div>
                    <div class="admin-db-akciok">
                        <div class="admin-sorrend-akciok" role="group" aria-label="Árlista sorrendje">
                            <button type="button" class="admin-kis-gomb admin-ikonos-gomb" data-szolgaltatas-mozgat="fel">${adminV2Ikon('up')}<span>Feljebb</span></button>
                            <button type="button" class="admin-kis-gomb admin-ikonos-gomb" data-szolgaltatas-mozgat="le">${adminV2Ikon('down')}<span>Lejjebb</span></button>
                        </div>
                        <button type="button" class="admin-kis-gomb admin-veszely-gomb admin-ikonos-gomb" data-szolgaltatas-torles>${adminV2Ikon('trash')}<span>Törlés</span></button>
                    </div>
                </div>
            `;
        return kartya;
    }

    function ujSzolgaltatasNev(szolgaltatasok = allapot.szolgaltatasok) {
        const alapNev = 'Új kategória - új tétel';
        const hasznaltNevek = new Set(
            szolgaltatasok.map((szolgaltatas) =>
                String(szolgaltatas?.name || '')
                    .trim()
                    .toLocaleLowerCase('hu-HU')
            )
        );
        let sorszam = 1;
        let nev = alapNev;

        while (hasznaltNevek.has(nev.toLocaleLowerCase('hu-HU'))) {
            sorszam += 1;
            nev = alapNev + ' ' + sorszam;
        }

        return nev;
    }

    function szolgaltatasInsertPayload(tetel, regiArSchema) {
        if (!regiArSchema) {
            return tetel;
        }

        const { price_amount, price_unit, price_suffix, ...regiTetel } = tetel;
        return regiTetel;
    }

    function szolgaltatasNevUtkozes(error) {
        return (
            String(error?.code || '') === '23505' ||
            String(error?.message || '')
                .toLowerCase()
                .includes('services_name_key')
        );
    }

    async function szolgaltatasHozzaadas() {
        const item = {
            id: crypto.randomUUID(),
            name: ujSzolgaltatasNev(),
            description: '',
            price_text: '',
            price_amount: null,
            price_unit: 'Ft',
            duration_minutes: 60,
            active: false,
            booking_enabled: false,
            sort_order: 999
        };
        const card = szolgaltatasKartya(szolgaltatasArNormalizalasa(item));
        card.dataset.draftNew = 'true';
        adminElemek().szolgaltatasLista.append(card);
        adminKartyaPanelMegnyitasa(card);
        onlineStatusz('Új árlista-piszkozat. A létrehozást a Mentés véglegesíti.');
    }

    async function szolgaltatasListaKattintas(event) {
        const kartya = event.target.closest('.admin-db-kartya');

        if (!kartya) {
            return;
        }

        const szerkesztes = event.target.closest('[data-admin-kartya-toggle]');
        if (szerkesztes) {
            adminKartyaSzerkesztesKapcsolasa(kartya, szerkesztes);
            return;
        }

        const mozgatas = event.target.closest('[data-szolgaltatas-mozgat]');
        if (mozgatas) {
            szolgaltatasMozgatasa(kartya, mozgatas.dataset.szolgaltatasMozgat);
            return;
        }

        if (event.target.closest('[data-szolgaltatas-torles]')) {
            if (!confirm('A Mentés véglegesíti a tétel törlését. Kijelölöd törlésre?')) return;
            window.LumiAdminSheet?.resetWithin(kartya);
            if (kartya.dataset.draftNew) kartya.remove();
            else {
                kartya.dataset.draftDelete = 'true';
                kartya.hidden = true;
            }
            adminStudioMentesJelzes();
            onlineStatusz('Törlésre jelölve. A Mentés véglegesíti.');
        }
    }

    function szolgaltatasMozgatasa(kartya, irany) {
        const lista = kartya.parentElement;
        const csere = irany === 'fel' ? kartya.previousElementSibling : kartya.nextElementSibling;
        if (!lista || !csere || !csere.classList.contains('admin-db-kartya')) return;

        if (irany === 'fel') lista.insertBefore(kartya, csere);
        else lista.insertBefore(csere, kartya);

        Array.from(lista.querySelectorAll('.admin-db-kartya')).forEach((elem, index) => {
            const sorrend = mezo(elem, 'sort_order');
            if (sorrend) {
                elem.dataset.studioSortDirty = 'true';
                sorrend.value = String((index + 1) * 10);
                sorrend.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        onlineStatusz('A sorrend módosult. A véglegesítéshez nyomd meg a Mentés gombot.');
    }

    async function szolgaltatasokMentese() {
        const allCards = Array.from(document.querySelectorAll('#admin-szolgaltatas-lista .admin-db-kartya'));
        const kartyak = allCards.filter((card) => !card.dataset.draftDelete);

        if (!allCards.length) {
            onlineStatusz('Nincs menthető árlista tétel.');
            return;
        }

        onlineStatusz('Árlista mentése...');

        for (const card of kartyak.filter((card) => card.dataset.draftNew)) {
            const payload = szolgaltatasPayload(card);
            if (!payload.name || payload.duration_minutes <= 0) {
                onlineStatusz('Add meg a nevet és a pozitív időtartamot.', true);
                return;
            }
            const { data, error } = await allapot.kliens
                .from('services')
                .insert({
                    ...payload,
                    id: card.dataset.id,
                    active: false,
                    booking_enabled: false
                })
                .select('id,editor_version')
                .single();
            if (error) {
                onlineStatusz('Az új tétel nem menthető. A piszkozat megmaradt.', true);
                return;
            }
            delete card.dataset.draftNew;
            allapot.szolgaltatasok.push({
                id: card.dataset.id,
                editor_version: data?.editor_version || null
            });
        }
        const items = kartyak.map((kartya) => ({
            id: kartya.dataset.id,
            expected_version: (kartya.dataset.editorVersion ?? allapot.szolgaltatasok.find((item) => item.id === kartya.dataset.id)?.editor_version) || null,
            payload: szolgaltatasPayload(kartya)
        }));
        const { error } = items.length ? await allapot.kliens.rpc('save_public_services', { p_items: items }) : { error: null };
        if (error) {
            onlineStatusz(
                error.code === '40001'
                    ? 'Az árlista közben módosult. A szerkesztett értékek megmaradtak; betöltés és egyeztetés szükséges.'
                    : 'Az árlista nem menthető. Ellenőrizd a biztonságos mentési migrációt és a kapcsolatot.',
                true
            );
            return;
        }

        for (const card of allCards.filter((card) => card.dataset.draftDelete)) {
            const { error } = await allapot.kliens.from('services').delete().eq('id', card.dataset.id);
            if (error) {
                onlineStatusz('A törlés nem sikerült; korábbi foglalás hivatkozhat a tételre. A többi módosítás mentve.', true);
                return;
            }
            card.remove();
        }
        await szolgaltatasokBetoltese();
        kuponokBetoltese();
        await publikusHtmlFrissitesKerese('arlista_mentve');
        onlineStatusz('Árlista mentve.');
    }

    function szolgaltatasPayload(kartya) {
        const ora = szamMezo(kartya, 'ora');
        const perc = szamMezo(kartya, 'perc');
        const priceValue = mezo(kartya, 'price_amount').value.trim();
        const priceAmount = arSzamolhatoOsszeg(priceValue);
        const priceUnit = mezo(kartya, 'price_unit').value.trim() || 'Ft';

        return {
            name: mezo(kartya, 'name').value.trim(),
            description: mezo(kartya, 'description').value.trim(),
            price_text: arFelirat(priceValue, priceUnit),
            price_amount: priceAmount,
            price_unit: priceUnit,
            price_suffix: '',
            duration_minutes: ora * 60 + perc,
            sort_order: szamMezo(kartya, 'sort_order'),
            booking_enabled: mezo(kartya, 'booking_enabled').checked,
            active: mezo(kartya, 'active').checked
        };
    }

    function arFelirat(osszeg, egyseg = 'Ft') {
        const nyers = String(osszeg ?? '').trim();
        if (!nyers) return '';
        if (/[^\d\s.,\-\u2013]/.test(nyers)) return nyers;

        const csakSzam = nyers.replace(/[\s.]/g, '');
        const ertek = /^\d+$/.test(csakSzam) ? Number.parseInt(csakSzam, 10).toLocaleString('hu-HU') : nyers;

        return `${ertek} ${egyseg || 'Ft'}`.trim();
    }

    function arSzamolhatoOsszeg(ertek) {
        const nyers = String(ertek || '').trim();
        if (!nyers || /[-\u2013]/.test(nyers)) return null;
        const csakSzam = nyers.replace(/\D/g, '');
        const szam = Number.parseInt(csakSzam, 10);
        return Number.isFinite(szam) && szam > 0 ? szam : null;
    }

    function arErtekKinyerese(szoveg) {
        const tiszta = String(szoveg || '')
            .replace(/\s+/g, ' ')
            .trim();
        const tartomany = tiszta.match(/\d[\d\s.]*(?:[-\u2013]\s*\d[\d\s.]*)/);
        if (tartomany) return tartomany[0].replace(/[\s.]/g, '');
        const egyszeru = tiszta.match(/\d[\d\s.]*/);
        return egyszeru ? egyszeru[0].replace(/[\s.]/g, '') : '';
    }

    function arOsszegKinyerese(szoveg) {
        return arSzamolhatoOsszeg(arErtekKinyerese(szoveg)) || 0;
    }

    function arEgysegKinyerese(szoveg) {
        const kis = String(szoveg || '').toLowerCase();
        if (kis.includes('/ db')) return 'Ft / db';
        if (kis.includes('/ ujj')) return 'Ft / ujj';
        if (kis.includes('-tól') || kis.includes('-tol')) return 'Ft-tól';
        if (kis.includes('ft')) return 'Ft';
        if (kis.includes('db')) return 'db';
        if (kis.includes('ujj')) return 'ujj';
        return 'Ft';
    }
