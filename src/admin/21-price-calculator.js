    const arKalkulatorAllapot = {
        szolgaltatasId: '',
        alapAr: 0,
        kuponId: '',
        extrak: new Map()
    };

    document.addEventListener('DOMContentLoaded', arKalkulatorInicializalasa);

    function arKalkulatorInicializalasa() {
        const panel = document.getElementById('admin-panel-arkalkulator');
        if (!panel || panel.dataset.arkalkulatorReady === 'true') return;

        panel.dataset.arkalkulatorReady = 'true';
        panel.querySelector('#admin-arkalkulator-szolgaltatas')?.addEventListener('change', event => {
            arKalkulatorAllapot.szolgaltatasId = event.target.value;
            arKalkulatorAllapot.alapAr = arKalkulatorElsoAr(arKalkulatorAktivSzolgaltatas());
            arKalkulatorRenderelese();
        });
        panel.querySelector('#admin-arkalkulator-alapar')?.addEventListener('change', event => {
            arKalkulatorAllapot.alapAr = Number(event.target.value) || 0;
            arKalkulatorOsszegzesRenderelese();
        });
        panel.querySelector('#admin-arkalkulator-extra')?.addEventListener('change', event => {
            const jelolonegyzet = event.target.closest('[data-ar-kalkulator-extra-toggle]');
            if (!jelolonegyzet) return;
            const id = jelolonegyzet.value;
            const szolgaltatas = arKalkulatorDiszitesek().find(tetel => String(tetel.id) === id);
            if (jelolonegyzet.checked && szolgaltatas && !arKalkulatorAllapot.extrak.has(id)) {
                arKalkulatorAllapot.extrak.set(id, {
                    szolgaltatas,
                    darab: 1,
                    ar: arKalkulatorElsoAr(szolgaltatas)
                });
            } else if (!jelolonegyzet.checked) {
                arKalkulatorAllapot.extrak.delete(id);
            }
            arKalkulatorExtraListaRenderelese();
            arKalkulatorOsszegzesRenderelese();
        });
        panel.querySelector('#admin-arkalkulator-extra-lista')?.addEventListener('click', arKalkulatorExtraKattintas);
        panel.querySelector('#admin-arkalkulator-extra-lista')?.addEventListener('change', arKalkulatorExtraValtozas);
        panel.querySelector('#admin-arkalkulator-kupon')?.addEventListener('change', event => {
            arKalkulatorAllapot.kuponId = event.target.value;
            arKalkulatorKedvezmenyRenderelese();
            arKalkulatorOsszegzesRenderelese();
        });
        panel.querySelector('#admin-arkalkulator-ujra')?.addEventListener('click', arKalkulatorUjrainditasa);

        arKalkulatorFrissitese();
    }

    function arKalkulatorFrissitese() {
        const panel = document.getElementById('admin-panel-arkalkulator');
        if (!panel) return;

        const szolgaltatasok = arKalkulatorAlapszolgaltatasok();
        if (!szolgaltatasok.some(tetel => String(tetel.id) === arKalkulatorAllapot.szolgaltatasId)) {
            arKalkulatorAllapot.szolgaltatasId = String(szolgaltatasok[0]?.id || '');
            arKalkulatorAllapot.alapAr = arKalkulatorElsoAr(szolgaltatasok[0]);
        }

        const diszitesIds = new Set(arKalkulatorDiszitesek().map(tetel => String(tetel.id)));
        Array.from(arKalkulatorAllapot.extrak.keys()).forEach(id => {
            if (!diszitesIds.has(id)) arKalkulatorAllapot.extrak.delete(id);
        });
        arKalkulatorAllapot.extrak.forEach((extra, id) => {
            const friss = allapot.szolgaltatasok.find(tetel => String(tetel.id) === id);
            if (!friss) return;
            extra.szolgaltatas = friss;
            if (!arKalkulatorArak(friss).includes(extra.ar)) extra.ar = arKalkulatorElsoAr(friss);
        });

        arKalkulatorRenderelese();
    }

    function arKalkulatorRenderelese() {
        arKalkulatorSzolgaltatasokRenderelese();
        arKalkulatorAlaparRenderelese();
        arKalkulatorExtraValasztoRenderelese();
        arKalkulatorExtraListaRenderelese();
        arKalkulatorKedvezmenyRenderelese();
        arKalkulatorOsszegzesRenderelese();
    }

    function arKalkulatorSzolgaltatasokRenderelese() {
        const select = document.getElementById('admin-arkalkulator-szolgaltatas');
        if (!select) return;

        const szolgaltatasok = arKalkulatorAlapszolgaltatasok();
        if (!szolgaltatasok.length) {
            select.innerHTML = '<option value="">Nincs aktív alapszolgáltatás</option>';
            select.disabled = true;
            return;
        }

        select.disabled = false;
        select.innerHTML = szolgaltatasok.map(szolgaltatas => `
            <option value="${attr(String(szolgaltatas.id))}" ${String(szolgaltatas.id) === arKalkulatorAllapot.szolgaltatasId ? 'selected' : ''}>
                ${html(arKalkulatorSzolgaltatasNev(szolgaltatas))}
            </option>
        `).join('');
    }

    function arKalkulatorAlaparRenderelese() {
        const szolgaltatas = arKalkulatorAktivSzolgaltatas();
        const arak = arKalkulatorArak(szolgaltatas);
        const mezo = document.getElementById('admin-arkalkulator-alapar-mezo');
        const select = document.getElementById('admin-arkalkulator-alapar');
        const fix = document.getElementById('admin-arkalkulator-fix-ar');
        if (!mezo || !select || !fix) return;

        if (arak.length > 1) {
            if (!arak.includes(arKalkulatorAllapot.alapAr)) arKalkulatorAllapot.alapAr = arak[0];
            mezo.hidden = false;
            fix.hidden = true;
            select.innerHTML = arak.map(ar => `<option value="${ar}" ${ar === arKalkulatorAllapot.alapAr ? 'selected' : ''}>${arKalkulatorArSzoveg(ar)}</option>`).join('');
            return;
        }

        arKalkulatorAllapot.alapAr = arak[0] || 0;
        mezo.hidden = true;
        fix.hidden = false;
        fix.innerHTML = `<span>Alapár</span><strong>${arKalkulatorArSzoveg(arKalkulatorAllapot.alapAr)}</strong>`;
    }

    function arKalkulatorExtraValasztoRenderelese() {
        const lista = document.getElementById('admin-arkalkulator-extra');
        if (!lista) return;

        const diszitesek = arKalkulatorDiszitesek();
        lista.innerHTML = diszitesek.length
            ? diszitesek.map(tetel => {
                const id = String(tetel.id);
                const nev = arKalkulatorTetelNev(tetel);
                return `
                    <label class="admin-arkalkulator-extra-opcio">
                        <input type="checkbox" value="${attr(id)}" data-ar-kalkulator-extra-toggle ${arKalkulatorAllapot.extrak.has(id) ? 'checked' : ''}>
                        <span>${html(nev)}</span>
                    </label>
                `;
            }).join('')
            : '<p class="admin-arkalkulator-extra-nincs">Nincs aktív díszítés az árlistában.</p>';
    }

    function arKalkulatorExtraListaRenderelese() {
        const lista = document.getElementById('admin-arkalkulator-extra-lista');
        if (!lista) return;

        if (!arKalkulatorAllapot.extrak.size) {
            lista.innerHTML = '<p class="admin-arkalkulator-ures">Még nincs hozzáadott díszítés.</p>';
            return;
        }

        lista.innerHTML = Array.from(arKalkulatorAllapot.extrak.entries()).map(([id, extra]) => {
            const nev = arKalkulatorTetelNev(extra.szolgaltatas);
            const arak = arKalkulatorArak(extra.szolgaltatas);
            const arVezerlo = arak.length > 1
                ? `<label class="admin-arkalkulator-extra-ar"><span class="admin-arkalkulator-sr-only">${html(nev)} ára</span><select data-ar-kalkulator-extra-price>${arak.map(ar => `<option value="${ar}" ${ar === extra.ar ? 'selected' : ''}>${arKalkulatorArSzoveg(ar)}</option>`).join('')}</select></label>`
                : `<span class="admin-arkalkulator-extra-fix-ar">${arKalkulatorArSzoveg(extra.ar)}</span>`;

            return `
                <article class="admin-arkalkulator-extra-sor" data-ar-kalkulator-extra="${attr(id)}">
                    <div class="admin-arkalkulator-extra-nev">
                        <strong>${html(nev)}</strong>
                    </div>
                    ${arVezerlo}
                    <div class="admin-arkalkulator-darab" role="group" aria-label="${attr(nev)} darabszáma">
                        <button type="button" class="admin-control-icon-button" data-ar-kalkulator-action="minusz" aria-label="${attr(nev)} darabszámának csökkentése">−</button>
                        <output>${extra.darab} db</output>
                        <button type="button" class="admin-control-icon-button" data-ar-kalkulator-action="plusz" aria-label="${attr(nev)} darabszámának növelése">+</button>
                    </div>
                </article>
            `;
        }).join('');
    }

    function arKalkulatorOsszegzesRenderelese() {
        const vegosszeg = document.getElementById('admin-arkalkulator-vegosszeg');
        const bontas = document.getElementById('admin-arkalkulator-bontas');
        if (!vegosszeg || !bontas) return;

        let osszeg = arKalkulatorAllapot.alapAr || 0;
        let diszitesOsszeg = 0;
        const szolgaltatas = arKalkulatorAktivSzolgaltatas();
        const sorok = szolgaltatas ? [{ nev: arKalkulatorSzolgaltatasNev(szolgaltatas), osszeg }] : [];
        arKalkulatorAllapot.extrak.forEach(extra => {
            const reszosszeg = extra.ar * extra.darab;
            diszitesOsszeg += reszosszeg;
            osszeg += reszosszeg;
            sorok.push({ nev: `${arKalkulatorTetelNev(extra.szolgaltatas)} × ${extra.darab}`, osszeg: reszosszeg });
        });

        const kupon = arKalkulatorKivalasztottKupon();
        const kedvezmeny = arKalkulatorKuponKedvezmeny(kupon, {
            service: arKalkulatorAllapot.alapAr,
            decoration: diszitesOsszeg,
            total: osszeg
        });
        if (kedvezmeny.osszeg > 0) {
            osszeg = Math.max(0, osszeg - kedvezmeny.osszeg);
            sorok.push({ nev: `Kedvezmény – ${kuponKedvezmenyAlapFelirat(kedvezmeny.alap)} (${kupon.code})`, osszeg: -kedvezmeny.osszeg });
        } else if (kupon?.discount_type === 'text') {
            sorok.push({ nev: `Kupon (${kupon.code})`, szoveg: 'Kézi egyeztetés' });
        }

        vegosszeg.textContent = arKalkulatorArSzoveg(osszeg);
        bontas.innerHTML = sorok.length
            ? sorok.map(sor => `<div><span>${html(sor.nev)}</span><strong>${sor.szoveg ? html(sor.szoveg) : arKalkulatorArSzoveg(sor.osszeg)}</strong></div>`).join('')
            : '<p>Az összeghez válassz szolgáltatást.</p>';
    }

    function arKalkulatorKedvezmenyRenderelese() {
        const select = document.getElementById('admin-arkalkulator-kupon');
        const segedlet = document.getElementById('admin-arkalkulator-kupon-segedlet');
        if (!select || !segedlet) return;

        const kuponok = arKalkulatorAktivKuponok();
        if (!kuponok.some(kupon => String(kupon.id) === arKalkulatorAllapot.kuponId)) {
            arKalkulatorAllapot.kuponId = '';
        }

        select.innerHTML = [
            '<option value="">Nincs kuponkedvezmény</option>',
            ...kuponok.map(kupon => `<option value="${attr(String(kupon.id))}" ${String(kupon.id) === arKalkulatorAllapot.kuponId ? 'selected' : ''}>${html(`${kupon.code} – ${arKalkulatorKuponFelirat(kupon)}`)}</option>`)
        ].join('');
        select.disabled = kuponok.length === 0;

        const kupon = arKalkulatorKivalasztottKupon();
        if (!kupon) {
            segedlet.textContent = kuponok.length
                ? 'A számításhoz válassz kupont, ha a vendég használ egyet.'
                : 'Ehhez a szolgáltatáshoz jelenleg nincs aktív, érvényes kupon.';
            return;
        }

        if (kupon.discount_type === 'text') {
            segedlet.textContent = `${kupon.code}: szöveges kedvezmény, ezért a végleges összeget kézzel kell egyeztetni.`;
            return;
        }

        const diszitesOsszeg = Array.from(arKalkulatorAllapot.extrak.values())
            .reduce((osszeg, extra) => osszeg + extra.ar * extra.darab, 0);
        const kedvezmeny = arKalkulatorKuponKedvezmeny(kupon, {
            service: arKalkulatorAllapot.alapAr,
            decoration: diszitesOsszeg,
            total: arKalkulatorAllapot.alapAr + diszitesOsszeg
        });
        if (kedvezmeny.alap === 'decoration' && !diszitesOsszeg) {
            segedlet.textContent = `${kupon.code}: ${arKalkulatorKuponFelirat(kupon)} a díszítések árából. A számításhoz adj hozzá legalább egy díszítést.`;
            return;
        }
        segedlet.textContent = `${kupon.code}: ${arKalkulatorKuponFelirat(kupon)} – ${kuponKedvezmenyAlapFelirat(kedvezmeny.alap).toLocaleLowerCase('hu-HU')}. Mostani levonás: ${arKalkulatorArSzoveg(kedvezmeny.osszeg)}.`;
    }

    function arKalkulatorAktivKuponok() {
        const ma = maiDatum();
        const szolgaltatas = arKalkulatorAktivSzolgaltatas();
        return (allapot.kuponok || [])
            .filter(kupon => kupon.active !== false)
            .filter(kupon => !kupon.valid_from || kupon.valid_from <= ma)
            .filter(kupon => !kupon.valid_until || kupon.valid_until >= ma)
            .filter(kupon => arKalkulatorKuponSzolgaltatasraErvenyes(kupon, szolgaltatas));
    }

    function arKalkulatorKivalasztottKupon() {
        return arKalkulatorAktivKuponok()
            .find(kupon => String(kupon.id) === arKalkulatorAllapot.kuponId) || null;
    }

    function arKalkulatorKuponSzolgaltatasraErvenyes(kupon, szolgaltatas) {
        if (!szolgaltatas) return false;
        if (kupon.service_id && String(kupon.service_id) !== String(szolgaltatas.id)) return false;
        if (!kupon.service_category) return true;
        if (arKalkulatorKulcs(kupon.service_category) === 'diszites') return true;
        const szolgaltatasKategoria = String(szolgaltatas.category || szolgaltatas.name || '').split(/\s+-\s+/)[0];
        return arKalkulatorKulcs(kupon.service_category) === arKalkulatorKulcs(szolgaltatasKategoria);
    }

    function arKalkulatorKuponKedvezmeny(kupon, osszegek) {
        const alap = kuponKedvezmenyAlapja(kupon);
        const ar = Math.max(0, Number(osszegek?.[alap]) || 0);
        const ertek = Math.max(0, Number(kupon?.discount_value) || 0);
        if (!kupon || !ar) return { osszeg: 0, alap };
        if (kupon.discount_type === 'percent') {
            return { osszeg: Math.min(ar, Math.round(ar * ertek / 100)), alap };
        }
        if (kupon.discount_type === 'fixed') {
            return { osszeg: Math.min(ar, ertek), alap };
        }
        return { osszeg: 0, alap };
    }

    function arKalkulatorKuponFelirat(kupon) {
        const ertek = Math.max(0, Number(kupon?.discount_value) || 0);
        if (kupon?.discount_type === 'percent') return `${ertek}% kedvezmény`;
        if (kupon?.discount_type === 'fixed') return `${arKalkulatorArSzoveg(ertek)} kedvezmény`;
        return kupon?.discount_text || kupon?.title || 'Egyedi kedvezmény';
    }

    function arKalkulatorExtraKattintas(event) {
        const gomb = event.target.closest('[data-ar-kalkulator-action]');
        const sor = event.target.closest('[data-ar-kalkulator-extra]');
        if (!gomb || !sor) return;

        const id = sor.dataset.arKalkulatorExtra;
        const extra = arKalkulatorAllapot.extrak.get(id);
        if (!extra) return;

        if (gomb.dataset.arKalkulatorAction === 'plusz') {
            extra.darab = Math.min(99, extra.darab + 1);
        } else if (gomb.dataset.arKalkulatorAction === 'minusz') {
            extra.darab = Math.max(1, extra.darab - 1);
        }
        arKalkulatorRenderelese();
    }

    function arKalkulatorExtraValtozas(event) {
        const select = event.target.closest('[data-ar-kalkulator-extra-price]');
        const sor = event.target.closest('[data-ar-kalkulator-extra]');
        if (!select || !sor) return;

        const extra = arKalkulatorAllapot.extrak.get(sor.dataset.arKalkulatorExtra);
        if (!extra) return;
        extra.ar = Number(select.value) || 0;
        arKalkulatorRenderelese();
    }

    function arKalkulatorUjrainditasa() {
        arKalkulatorAllapot.extrak.clear();
        arKalkulatorAllapot.kuponId = '';
        const elso = arKalkulatorAlapszolgaltatasok()[0];
        arKalkulatorAllapot.szolgaltatasId = String(elso?.id || '');
        arKalkulatorAllapot.alapAr = arKalkulatorElsoAr(elso);
        arKalkulatorRenderelese();
        document.getElementById('admin-arkalkulator-szolgaltatas')?.focus({ preventScroll: true });
    }

    function arKalkulatorKuponokFrissitese() {
        arKalkulatorKedvezmenyRenderelese();
        arKalkulatorOsszegzesRenderelese();
    }

    function arKalkulatorAlapszolgaltatasok() {
        return allapot.szolgaltatasok.filter(tetel => tetel.active !== false && !arKalkulatorDiszites(tetel));
    }

    function arKalkulatorDiszitesek() {
        return allapot.szolgaltatasok.filter(tetel => tetel.active !== false && arKalkulatorDiszites(tetel));
    }

    function arKalkulatorAktivSzolgaltatas() {
        return arKalkulatorAlapszolgaltatasok().find(tetel => String(tetel.id) === arKalkulatorAllapot.szolgaltatasId) || null;
    }

    function arKalkulatorDiszites(tetel) {
        const kategoria = String(tetel?.name || '').split(/\s+-\s+/)[0];
        return arKalkulatorKulcs(kategoria) === 'diszites';
    }

    function arKalkulatorTetelNev(tetel) {
        const teljesNev = String(tetel?.name || '').trim();
        const reszek = teljesNev.split(/\s+-\s+/).filter(Boolean);
        return reszek.length > 1 ? reszek.slice(1).join(' - ') : (tetel?.description || teljesNev || 'Díszítés');
    }

    function arKalkulatorSzolgaltatasNev(szolgaltatas) {
        return String(szolgaltatas?.description || szolgaltatas?.name || 'Névtelen szolgáltatás').trim();
    }

    function arKalkulatorKulcs(ertek) {
        return String(ertek || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
    }

    function arKalkulatorArak(szolgaltatas) {
        if (!szolgaltatas) return [];
        const forras = String(szolgaltatas.price_value || szolgaltatas.price_text || '');
        const arak = (forras.match(/\d[\d\s.]*/g) || [])
            .map(ertek => Number.parseInt(ertek.replace(/[\s.]/g, ''), 10))
            .filter(ertek => Number.isFinite(ertek) && ertek > 0);
        const fixAr = Number(szolgaltatas.price_amount);
        if (Number.isFinite(fixAr) && fixAr > 0 && !arak.includes(fixAr)) arak.unshift(fixAr);
        const egyediArak = Array.from(new Set(arak));
        if (egyediArak.length < 2) return egyediArak;

        const alsoHatar = Math.min(...egyediArak);
        const felsoHatar = Math.max(...egyediArak);
        const lepesArak = [];
        for (let ar = alsoHatar; ar <= felsoHatar; ar += 50) lepesArak.push(ar);
        if (lepesArak.at(-1) !== felsoHatar) lepesArak.push(felsoHatar);
        return lepesArak;
    }

    function arKalkulatorElsoAr(szolgaltatas) {
        return arKalkulatorArak(szolgaltatas)[0] || 0;
    }

    function arKalkulatorArSzoveg(osszeg) {
        const ar = Math.round(Number(osszeg) || 0);
        const tagolt = String(ar).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
        return `${tagolt} Ft`;
    }
