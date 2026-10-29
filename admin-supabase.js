// Generated from src/admin by npm run build. Edit the source parts, not this file.

(function () {
    const ADMIN_EMAIL = 'llevisimon@gmail.com';
    const config = window.LUMI_SUPABASE;
    const supabaseLib = window.supabase;
    const SZOLGALTATAS_KUPON_KATEGORIAK = ['\u00c9p\u00edt\u00e9s', 'T\u00f6lt\u00e9s', 'G\u00e9l lakk', 'Manik\u0171r', 'D\u00edsz\u00edt\u00e9s', 'Leszed\u00e9s'];
    const ADMIN_FOGLALAS_LIMIT = 500;
    const allapot = {
        kliens: null,
        session: null,
        aktivTab: 'foglalasok',
        foglalasOldal: 1,
        foglalasOldalMeret: 10,
        foglalasElemek: [],
        foglalasKereses: '',
        foglalasStatuszSzuro: 'all',
        foglalasNezet: 'lista',
        foglalasNaptarHonap: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        foglalasNaptarKijeloltDatum: '',
        lemondasEsemenyek: new Map(),
        szolgaltatasok: [],
        kuponok: [],
        vendegProfilok: [],
        vendegProfilKeresId: 0,
        esemenynaploOldal: 1,
        esemenynaploOldalMeret: 10,
        esemenynaploElemek: [],
        naptarKijelolesek: new Map(),
        tiltasOldal: 1,
        tiltasOldalMeret: 10,
        tiltasElemek: [],
        tiltasStatuszTamogatott: true,
        tiltasSzolgaltatasTamogatott: true
    };

    window.LumiAdminExportData = Object.freeze({
        foglalasok: () => aktualisFoglalasExportAdatok(),
        esemenyek: () => aktualisEsemenyExportAdatok()
    });


    document.addEventListener('DOMContentLoaded', () => {
        const elemek = adminElemek();

        if (!elemek.loginForm || !elemek.tartalom) {
            return;
        }

        if (!config?.url || !config?.publishableKey || !supabaseLib?.createClient) {
            authStatusz(elemek, 'A Supabase kapcsolat nincs beállítva. Ellenőrizd a supabase-config.js fájlt.', true);
            return;
        }

        allapot.kliens = window.lumiSupabaseClient();

        elemek.loginForm.addEventListener('submit', event => {
            event.preventDefault();
            bejelentkezes(elemek);
        });

        elemek.kijelentkezes?.addEventListener('click', kijelentkezes);
        elemek.jelszoValtasGomb?.addEventListener('click', () => {
            elemek.jelszoForm.hidden = !elemek.jelszoForm.hidden;
            jelszoStatusz('');
        });
        elemek.jelszoForm?.addEventListener('submit', event => {
            event.preventDefault();
            jelszoModositasa();
        });
        elemek.foglalasFrissites?.addEventListener('click', foglalasokBetoltese);
        elemek.foglalasLista?.addEventListener('focusout', foglalasListaFokuszElhagyas);
        elemek.vendegLemondasMegnyitas?.addEventListener('click', vendegLemondasokMegnyitasa);
        elemek.vendegLemondasTudomasulvetel?.addEventListener('click', vendegLemondasokTudomasulvetele);
        elemek.esemenynaploFrissites?.addEventListener('click', esemenynaploBetoltese);
        elemek.emailTesztKuldes?.addEventListener('click', emailTesztekKuldese);
        elemek.szolgaltatasHozzaadas?.addEventListener('click', szolgaltatasHozzaadas);
        elemek.kuponHozzaadas?.addEventListener('click', kuponHozzaadas);
        idosavAlapertelmezes(elemek);
        idosavNaptarInicializalasa(elemek);
        elemek.tiltasForm?.addEventListener('submit', event => {
            event.preventDefault();
        });
        elemek.tiltasSzolgaltatas?.addEventListener('change', keziIdoVegeFrissitese);
        elemek.tiltasKezdes?.addEventListener('change', keziIdoVegeFrissitese);

        document.querySelectorAll('.admin-tab').forEach(gomb => {
            gomb.addEventListener('click', () => adminTabValtas(gomb.dataset.adminTab));
        });

        elemek.foglalasLista?.addEventListener('click', foglalasListaKattintas);
        elemek.foglalasNezetGombok.forEach(gomb => {
            gomb.addEventListener('click', () => foglalasNezetValtasa(gomb.dataset.foglalasNezet));
        });
        elemek.foglalasNaptar?.addEventListener('click', foglalasNaptarKattintas);
        elemek.foglalasLapozo?.addEventListener('click', foglalasLapozoKattintas);
        elemek.foglalasLapozo?.addEventListener('change', foglalasLapozoKattintas);
        elemek.foglalasLapozoFelso?.addEventListener('click', foglalasLapozoKattintas);
        elemek.foglalasLapozoFelso?.addEventListener('change', foglalasLapozoKattintas);
        elemek.foglalasKeresesTorles?.addEventListener('click', foglalasKeresesTorlese);
        elemek.foglalasKereses?.addEventListener('input', () => {
            allapot.foglalasKereses = elemek.foglalasKereses.value.trim();
            allapot.foglalasOldal = 1;
            foglalasKeresesTorlesGombFrissitese(elemek);
            foglalasListaRenderelese();
        });
        foglalasKeresesTorlesGombFrissitese(elemek);
        elemek.foglalasStatuszSzuro?.addEventListener('change', () => {
            allapot.foglalasStatuszSzuro = elemek.foglalasStatuszSzuro.value || 'all';
            allapot.foglalasOldal = 1;
            foglalasListaRenderelese();
        });
        elemek.szolgaltatasLista?.addEventListener('click', szolgaltatasListaKattintas);
        elemek.kuponLista?.addEventListener('click', kuponListaKattintas);
        elemek.kuponLista?.addEventListener('change', kuponListaValtozas);
        elemek.esemenynaploLapozo?.addEventListener('click', esemenynaploLapozoKattintas);
        elemek.esemenynaploLapozo?.addEventListener('change', esemenynaploLapozoKattintas);
        elemek.esemenynaploLapozoFelso?.addEventListener('click', esemenynaploLapozoKattintas);
        elemek.esemenynaploLapozoFelso?.addEventListener('change', esemenynaploLapozoKattintas);
        elemek.idosavLista?.addEventListener('click', idosavListaKattintas);
        elemek.idosavOsszesTorles?.addEventListener('click', idosavokOsszesTorlese);
        elemek.idosavLepesOsszes?.addEventListener('click', idosavLepesOsszesAlkalmazasa);
        elemek.tiltasLista?.addEventListener('click', tiltasListaKattintas);
        elemek.tiltasLapozo?.addEventListener('click', tiltasLapozoKattintas);
        elemek.tiltasLapozo?.addEventListener('change', tiltasLapozoKattintas);

        allapot.kliens.auth.onAuthStateChange((event, session) => {
            queueMicrotask(() => sessionAllapot(session, elemek, event === 'USER_UPDATED'));
        });

        allapot.kliens.auth.getSession().then(({ data }) => {
            sessionAllapot(data.session, elemek);
        });
    });

    function adminElemek() {
        return {
            authPanel: document.getElementById('admin-bejelentkezes-panel'),
            loginForm: document.getElementById('admin-login-form'),
            email: document.getElementById('admin-email'),
            jelszo: document.getElementById('admin-jelszo'),
            authStatusz: document.getElementById('admin-auth-status'),
            tartalom: document.getElementById('admin-tartalom'),
            kijelentkezes: document.getElementById('admin-kijelentkezes'),
            jelszoValtasGomb: document.getElementById('admin-jelszo-valtas-gomb'),
            jelszoForm: document.getElementById('admin-jelszo-form'),
            ujJelszo: document.getElementById('admin-uj-jelszo'),
            ujJelszoIsmet: document.getElementById('admin-uj-jelszo-ismet'),
            jelszoStatusz: document.getElementById('admin-jelszo-status'),
            onlineStatusz: document.getElementById('admin-online-status'),
            emailTesztKuldes: document.getElementById('admin-email-teszt-kuldes'),
            emailTesztStatusz: document.getElementById('admin-email-teszt-statusz'),
            foglalasLista: document.getElementById('admin-foglalas-lista'),
            foglalasListaNezet: document.getElementById('admin-foglalas-lista-nezet'),
            foglalasNezetGombok: Array.from(document.querySelectorAll('[data-foglalas-nezet]')),
            foglalasOsszefoglalo: document.getElementById('admin-foglalas-osszefoglalo'),
            foglalasNaptar: document.getElementById('admin-foglalas-naptar'),
            foglalasNaptarCim: document.getElementById('admin-foglalas-naptar-cim'),
            foglalasNaptarRacs: document.getElementById('admin-foglalas-naptar-racs'),
            foglalasNapiCim: document.getElementById('admin-foglalas-napi-cim'),
            foglalasNapiDarab: document.getElementById('admin-foglalas-napi-darab'),
            foglalasNapiLista: document.getElementById('admin-foglalas-napi-lista'),
            foglalasLapozo: document.getElementById('admin-foglalas-lapozo'),
            foglalasLapozoFelso: document.getElementById('admin-foglalas-lapozo-felso'),
            foglalasKereses: document.getElementById('admin-foglalas-kereses'),
            foglalasKeresesTorles: document.getElementById('admin-foglalas-kereses-torles'),
            foglalasStatuszSzuro: document.getElementById('admin-foglalas-statusz-szuro'),
            foglalasFrissites: document.getElementById('admin-foglalas-frissites'),
            vendegLemondasJelzes: document.getElementById('admin-vendeg-lemondas-jelzes'),
            vendegLemondasDarab: document.getElementById('admin-vendeg-lemondas-darab'),
            vendegLemondasUzenet: document.getElementById('admin-vendeg-lemondas-uzenet'),
            vendegLemondasMegnyitas: document.getElementById('admin-vendeg-lemondas-megnyitas'),
            vendegLemondasTudomasulvetel: document.getElementById('admin-vendeg-lemondas-tudomasulvetel'),
            esemenynaploLista: document.getElementById('admin-esemenynaplo-lista'),
            esemenynaploFrissites: document.getElementById('admin-esemenynaplo-frissites'),
            esemenynaploLapozo: document.getElementById('admin-esemenynaplo-lapozo'),
            esemenynaploLapozoFelso: document.getElementById('admin-esemenynaplo-lapozo-felso'),
            szolgaltatasLista: document.getElementById('admin-szolgaltatas-lista'),
            szolgaltatasHozzaadas: document.getElementById('admin-szolgaltatas-hozzaadas'),
            kuponLista: document.getElementById('admin-kupon-lista'),
            kuponHozzaadas: document.getElementById('admin-kupon-hozzaadas'),
            idosavLista: document.getElementById('admin-idosav-lista'),
            idosavOsszesTorles: document.getElementById('admin-idosav-osszes-torles'),
            idosavLepesOsszes: document.getElementById('admin-idosav-lepes-osszes'),
            naptarHonap: document.getElementById('admin-naptar-honap'),
            naptarRacs: document.getElementById('admin-naptar-racs'),
            naptarElozo: document.getElementById('admin-naptar-elozo'),
            naptarKovetkezo: document.getElementById('admin-naptar-kovetkezo'),
            naptarKozosKezdes: document.getElementById('admin-naptar-kozos-kezdes'),
            naptarKozosVege: document.getElementById('admin-naptar-kozos-vege'),
            naptarKozosLepes: document.getElementById('admin-naptar-kozos-lepes'),
            naptarKozosAlkalmazas: document.getElementById('admin-naptar-kozos-alkalmazas'),
            naptarKijelolesTorles: document.getElementById('admin-naptar-kijeloles-torles'),
            naptarKijeloltLista: document.getElementById('admin-naptar-kijelolt-lista'),
            naptarStatusz: document.getElementById('admin-naptar-status'),
            tiltasForm: document.getElementById('admin-tiltas-form'),
            tiltasDatum: document.getElementById('admin-tiltas-datum'),
            tiltasKezdes: document.getElementById('admin-tiltas-kezdes'),
            tiltasVege: document.getElementById('admin-tiltas-vege'),
            tiltasSzolgaltatas: document.getElementById('admin-tiltas-szolgaltatas'),
            tiltasOk: document.getElementById('admin-tiltas-ok'),
            tiltasLapozo: document.getElementById('admin-tiltas-lapozo'),
            tiltasLista: document.getElementById('admin-tiltas-lista'),
            telefonLathato: document.getElementById('admin-telefon-lathato')
        };
    }

    function foglalasKeresesTorlesGombFrissitese(elemek = adminElemek()) {
        if (!elemek.foglalasKeresesTorles || !elemek.foglalasKereses) return;
        elemek.foglalasKeresesTorles.hidden = !elemek.foglalasKereses.value.trim();
    }

    function foglalasKeresesTorlese() {
        const elemek = adminElemek();
        if (!elemek.foglalasKereses) return;

        elemek.foglalasKereses.value = '';
        allapot.foglalasKereses = '';
        allapot.foglalasOldal = 1;
        foglalasKeresesTorlesGombFrissitese(elemek);
        foglalasListaRenderelese();
        elemek.foglalasKereses.focus({ preventScroll: true });
    }

    function idosavAlapertelmezes(elemek) {
        if (!elemek.naptarHonap) {
            return;
        }

        if (elemek.naptarHonap && !elemek.naptarHonap.value) {
            elemek.naptarHonap.value = maiHonap();
        }

        if (elemek.naptarKozosKezdes && !elemek.naptarKozosKezdes.value) {
            elemek.naptarKozosKezdes.value = '09:00';
        }

        if (elemek.naptarKozosVege && !elemek.naptarKozosVege.value) {
            elemek.naptarKozosVege.value = '18:00';
        }

        if (elemek.naptarKozosLepes && !elemek.naptarKozosLepes.value) {
            elemek.naptarKozosLepes.value = '30';
        }

        if (elemek.tiltasDatum && !elemek.tiltasDatum.value) {
            elemek.tiltasDatum.value = maiDatum();
        }

        if (elemek.tiltasKezdes && !elemek.tiltasKezdes.value) {
            elemek.tiltasKezdes.value = '09:00';
        }

        if (elemek.tiltasVege && !elemek.tiltasVege.value) {
            elemek.tiltasVege.value = '10:00';
        }
    }

    function idosavNaptarInicializalasa(elemek) {
        if (!elemek.naptarHonap || !elemek.naptarRacs) {
            return;
        }

        elemek.naptarHonap.addEventListener('change', idosavNaptarRenderelese);
        elemek.naptarElozo?.addEventListener('click', () => naptarHonapLepes(-1));
        elemek.naptarKovetkezo?.addEventListener('click', () => naptarHonapLepes(1));
        elemek.naptarRacs.addEventListener('touchend', naptarNapErintes, { passive: false });
        elemek.naptarRacs.addEventListener('click', naptarNapKattintas);
        elemek.naptarKijeloltLista?.addEventListener('input', naptarSorValtozas);
        elemek.naptarKijeloltLista?.addEventListener('click', naptarListaKattintas);
        elemek.naptarKozosAlkalmazas?.addEventListener('click', naptarKozosIdoAlkalmazasa);
        elemek.naptarKijelolesTorles?.addEventListener('click', () => {
            allapot.naptarKijelolesek.clear();
            idosavNaptarRenderelese();
            naptarKijeloltListaRenderelese();
        });
        idosavNaptarRenderelese();
        naptarKijeloltListaRenderelese();
    }

    function idosavNaptarRenderelese() {
        const elemek = adminElemek();

        if (!elemek.naptarRacs || !elemek.naptarHonap.value) {
            return;
        }

        const [ev, honap] = elemek.naptarHonap.value.split('-').map(Number);
        const elsoNap = new Date(ev, honap - 1, 1, 12, 0, 0);
        const napokSzama = new Date(ev, honap, 0, 12, 0, 0).getDate();
        const elsoIsoNap = isoHetNapja(datumSzoveg(elsoNap));

        elemek.naptarRacs.innerHTML = '';

        for (let i = 1; i < elsoIsoNap; i += 1) {
            const ures = document.createElement('span');
            ures.className = 'admin-naptar-ures';
            elemek.naptarRacs.appendChild(ures);
        }

        for (let nap = 1; nap <= napokSzama; nap += 1) {
            const datum = datumSzoveg(new Date(ev, honap - 1, nap, 12, 0, 0));
            const gomb = document.createElement('button');
            gomb.type = 'button';
            gomb.className = 'admin-naptar-nap';
            gomb.dataset.datum = datum;
            gomb.textContent = String(nap);
            gomb.classList.toggle('kijelolt', allapot.naptarKijelolesek.has(datum));
            elemek.naptarRacs.appendChild(gomb);
        }
    }

    function naptarNapKattintas(event) {
        const gomb = event.target.closest('.admin-naptar-nap');

        if (!gomb) {
            return;
        }

        naptarNapValtasa(gomb);
    }

    function naptarNapErintes(event) {
        const gomb = event.target.closest('.admin-naptar-nap');

        if (!gomb) {
            return;
        }

        event.preventDefault();
        naptarNapValtasa(gomb);
    }

    function naptarNapValtasa(gomb) {
        const datum = gomb.dataset.datum;

        if (allapot.naptarKijelolesek.has(datum)) {
            allapot.naptarKijelolesek.delete(datum);
        } else {
            allapot.naptarKijelolesek.set(datum, naptarAlapIdosav());
        }

        gomb.classList.toggle('kijelolt', allapot.naptarKijelolesek.has(datum));
        naptarKijeloltListaRenderelese();
    }

    function naptarKijeloltListaRenderelese() {
        const elemek = adminElemek();

        if (!elemek.naptarKijeloltLista) {
            return;
        }

        elemek.naptarKijeloltLista.innerHTML = '';

        const datumok = Array.from(allapot.naptarKijelolesek.keys()).sort();

        if (datumok.length === 0) {
            elemek.naptarKijeloltLista.innerHTML = '<p class="admin-ures">Válassz napokat a naptárból.</p>';
            return;
        }

        datumok.forEach(datum => {
            const ertek = allapot.naptarKijelolesek.get(datum) || naptarAlapIdosav();
            const sor = document.createElement('div');
            sor.className = 'admin-naptar-sor';
            sor.dataset.datum = datum;
            sor.innerHTML = `
                <div class="admin-naptar-datum">${html(datumRovid(datum))}</div>
                <label class="admin-mezo">Kezdés<input type="time" data-naptar-mezo="start_time" value="${attr(ertek.start_time)}"></label>
                <label class="admin-mezo">Vége<input type="time" data-naptar-mezo="end_time" value="${attr(ertek.end_time)}"></label>
                <button type="button" class="admin-kis-gomb admin-veszely-gomb admin-naptar-torles-x" data-naptar-torles aria-label="Törlés">×</button>
            `;
            elemek.naptarKijeloltLista.appendChild(sor);
        });
    }

    function naptarSorValtozas(event) {
        const sor = event.target.closest('.admin-naptar-sor');

        if (!sor) {
            return;
        }

        naptarSorMenteseMemoriaba(sor);
    }

    function naptarListaKattintas(event) {
        const torlesGomb = event.target.closest('[data-naptar-torles]');

        if (!torlesGomb) {
            return;
        }

        const sor = torlesGomb.closest('.admin-naptar-sor');
        allapot.naptarKijelolesek.delete(sor.dataset.datum);
        const naptarGomb = document.querySelector(`.admin-naptar-nap[data-datum="${sor.dataset.datum}"]`);

        if (naptarGomb) {
            naptarGomb.classList.remove('kijelolt');
        }

        naptarKijeloltListaRenderelese();
    }

    function naptarKozosIdoAlkalmazasa() {
        const elemek = adminElemek();

        if (elemek.naptarKozosVege.value <= elemek.naptarKozosKezdes.value) {
            onlineStatusz('A közös végidő legyen később, mint a kezdés.', true);
            naptarStatusz('A közös végidő legyen később, mint a kezdés.', true);
            return;
        }

        allapot.naptarKijelolesek.forEach((_ertek, datum) => {
            allapot.naptarKijelolesek.set(datum, naptarAlapIdosav());
        });

        naptarKijeloltListaRenderelese();
        onlineStatusz('A közös idő beállítva a kijelölt napokra.');
        naptarStatusz('A közös idő beállítva a kijelölt napokra.');
    }

    async function naptarKijeloltNapokMentese() {
        const elemek = adminElemek();
        const sorok = Array.from(elemek.naptarKijeloltLista.querySelectorAll('.admin-naptar-sor'));

        if (sorok.length === 0) {
            onlineStatusz('Előbb válassz ki napokat a naptárból.', true);
            naptarStatusz('Előbb válassz ki napokat a naptárból.', true);
            return;
        }

        sorok.forEach(naptarSorMenteseMemoriaba);

        const savok = Array.from(allapot.naptarKijelolesek, ([datum, ertek]) => ({
            work_date: datum,
            start_time: ertek.start_time,
            end_time: ertek.end_time,
            slot_step_minutes: naptarKozosLepesErtek(),
            active: true
        }));

        const hibasSav = savok.find(sav => sav.end_time <= sav.start_time);

        if (hibasSav) {
            onlineStatusz(`${hibasSav.work_date}: a végidő legyen később, mint a kezdés.`, true);
            naptarStatusz(`${hibasSav.work_date}: a végidő legyen később, mint a kezdés.`, true);
            return;
        }

        onlineStatusz(`${savok.length} nap mentése...`);
        naptarStatusz(`${savok.length} nap mentése...`);

        const { error } = await allapot.kliens
            .from('availability_windows')
            .upsert(savok, { onConflict: 'work_date,start_time,end_time' });

        if (error) {
            onlineStatusz('Nem sikerült menteni a kijelölt napokat. Futtasd a dátumos Supabase migrációt, majd próbáld újra.', true);
            naptarStatusz(`Nem sikerült menteni. Valószínűleg a Supabase dátumos migráció hiányzik vagy hibás. Részlet: ${error.message}`, true);
            return;
        }

        onlineStatusz(`${savok.length} nap mentve.`);
        naptarStatusz(`${savok.length} nap mentve. Lent a meglévő dátumok listájában is meg kell jelennie.`);
        idosavokBetoltese();
    }

    function naptarSorMenteseMemoriaba(sor) {
        allapot.naptarKijelolesek.set(sor.dataset.datum, {
            start_time: sor.querySelector('[data-naptar-mezo="start_time"]').value,
            end_time: sor.querySelector('[data-naptar-mezo="end_time"]').value,
            slot_step_minutes: naptarKozosLepesErtek()
        });
    }

    function naptarAlapIdosav() {
        const elemek = adminElemek();

        return {
            start_time: elemek.naptarKozosKezdes?.value || '09:00',
            end_time: elemek.naptarKozosVege?.value || '18:00',
            slot_step_minutes: naptarKozosLepesErtek()
        };
    }

    function naptarKozosLepesErtek() {
        const elemek = adminElemek();
        const ertek = Number.parseInt(elemek.naptarKozosLepes?.value, 10);

        return Number.isFinite(ertek) && ertek > 0 ? ertek : 30;
    }

    function naptarHonapLepes(irany) {
        const elemek = adminElemek();
        const [ev, honap] = elemek.naptarHonap.value.split('-').map(Number);
        const datum = new Date(ev, honap - 1 + irany, 1, 12, 0, 0);
        elemek.naptarHonap.value = `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, '0')}`;
        idosavNaptarRenderelese();
    }

    function datumRovid(datumSzovegErtek) {
        const [ev, honap, nap] = String(datumSzovegErtek || '').split('-');
        return ev && honap && nap ? `${nap}/${honap}/${String(ev).slice(-2)}` : String(datumSzovegErtek || '');
    }

    function datumFelirat(datumSzovegErtek) {
        return new Intl.DateTimeFormat('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'long'
        }).format(datumObjektum(datumSzovegErtek));
    }

    async function bejelentkezes(elemek) {
        const email = adminEmail(elemek);

        authStatusz(elemek, 'Belépés...');

        const { error } = await allapot.kliens.auth.signInWithPassword({
            email,
            password: elemek.jelszo.value
        });

        if (error) {
            console.error('Admin belépési hiba:', error);
            authStatusz(elemek, `Nem sikerült belépni ezzel az emaillel: ${email}. Ellenőrizd a jelszót.`, true);
        }
    }

    function adminEmail(elemek) {
        return (elemek.email?.value || ADMIN_EMAIL).trim().toLowerCase();
    }

    async function kijelentkezes() {
        await allapot.kliens.auth.signOut();
    }

    async function jelszoModositasa() {
        const elemek = adminElemek();
        const ujJelszo = elemek.ujJelszo.value;
        const ujJelszoIsmet = elemek.ujJelszoIsmet.value;

        if (!ujJelszo || !ujJelszoIsmet) {
            jelszoStatusz('Add meg kétszer az új jelszót.', true);
            return;
        }

        if (!window.LUMI_PASSWORD_POLICY?.isValid(ujJelszo)) {
            const kovetelmenyek = window.LUMI_PASSWORD_POLICY?.hint
                || '8–128 karakter, legalább egy kisbetű, egy nagybetű és egy szám.';
            jelszoStatusz(`A jelszó követelményei: ${kovetelmenyek}`, true);
            return;
        }

        if (ujJelszo !== ujJelszoIsmet) {
            jelszoStatusz('A két jelszó nem egyezik.', true);
            return;
        }

        jelszoStatusz('Jelszó mentése...');

        const { error } = await allapot.kliens.auth.updateUser({
            password: ujJelszo
        });

        if (error) {
            jelszoStatusz('Nem sikerült módosítani a jelszót. Lépj be újra, majd próbáld meg ismét.', true);
            return;
        }

        elemek.jelszoForm.reset();
        elemek.jelszoForm.hidden = true;
        jelszoStatusz('Jelszó módosítva.');
    }

    async function sessionAllapot(session, elemek, force = false) {
        allapot.referenceAuthReady=true;
        const userKey = session?.user?.id || session?.user?.email || 'session';
        if (session && !force && allapot.adminVerified && allapot.adminUserKey === userKey) {
            allapot.session = session;
            return;
        }
        allapot.session = session;
        allapot.adminVerified = false;
        if (!session || allapot.adminUserKey !== userKey) {
            adminAdatCacheTorlese();
            for (const key of ['foglalasElemek', 'esemenynaploElemek', 'vendegProfilok', 'szolgaltatasok', 'kuponok', 'tiltasElemek']) allapot[key] = [];
            window.lumiPublikacioLeallitasa?.();
        }
        const ellenorzesId = (allapot.adminJogosultsagKeresId || 0) + 1;
        allapot.adminJogosultsagKeresId = ellenorzesId;
        elemek.authPanel.hidden = Boolean(session);
        elemek.tartalom.hidden = true;
        if (elemek.lebegoMentes) {
            elemek.lebegoMentes.hidden = true;
        }

        if (!session) return;

        const { data: admin, error } = await adminKeresOsszevonasa('admin-role', () => allapot.kliens.rpc('is_lumi_admin'));
        if (ellenorzesId !== allapot.adminJogosultsagKeresId) return;

        if (error || admin !== true) {
            await allapot.kliens.auth.signOut();
            authStatusz(elemek, 'Ehhez a felülethez nincs admin jogosultságod.', true);
            return;
        }

        allapot.adminVerified = true;
        allapot.adminUserKey = userKey;
        elemek.tartalom.hidden = false;
        if (elemek.lebegoMentes) elemek.lebegoMentes.hidden = false;
        authStatusz(elemek, '');
        if(!window.LumiReferenceUiActive)adminTabValtas(allapot.aktivTab);
    }

    function adatokFrissitese() {
        return adminPanelAdatokBetoltese(allapot.aktivTab, true);
    }

    async function lebegoMentes() {
        const elemek = adminElemek();
        const tab = allapot.aktivTab;

        if (tab === 'foglalasok') {
            await foglalasStatuszokMentese();
            return;
        }

        if (tab === 'szolgaltatasok') {
            await szolgaltatasokMentese();
            return;
        }

        if (tab === 'kuponok') {
            await kuponokMentese();
            return;
        }

        if (tab === 'idosavok') {
            await idosavokEsNaptarMentese();
            return;
        }

        if (tab === 'tiltasok') {
            await tiltasHozzaadas();
            return;
        }

        if (tab === 'esemenynaplo') {
            await esemenynaploBetoltese();
            return;
        }

        if (tab === 'beallitasok') {
            await beallitasokMentese();
            return;
        }

        if (tab === 'szovegek') {
            return;
        }

        onlineStatusz('Nincs menthető módosítás ezen a nézeten.');
    }

    async function idosavokEsNaptarMentese() {
        const mentendoNaptarNapok = allapot.naptarKijelolesek.size > 0;

        if (mentendoNaptarNapok) {
            await naptarKijeloltNapokMentese();
        }

        await idosavokMentese();
    }

    const adminFolyamatbanLevoKeresek = new Map();
    const adminBetoltottAdatok = new Set();

    function adminKeresMunkamenetOr() {
        const verzio = allapot.adatCacheVerzio;
        return () => Boolean(allapot.session && allapot.adminVerified && allapot.adatCacheVerzio === verzio);
    }

    function adminKeresOsszevonasa(kulcs, betoltes) {
        if (adminFolyamatbanLevoKeresek.has(kulcs)) return adminFolyamatbanLevoKeresek.get(kulcs);
        const keres = Promise.resolve().then(betoltes).finally(() => {
            if (adminFolyamatbanLevoKeresek.get(kulcs) === keres) adminFolyamatbanLevoKeresek.delete(kulcs);
            window.dispatchEvent(new CustomEvent('lumi:admin-data',{detail:{scope:kulcs}}));
        });
        adminFolyamatbanLevoKeresek.set(kulcs, keres);
        return keres;
    }

    function adminAdatCacheTorlese() {
        allapot.adatCacheVerzio = (allapot.adatCacheVerzio || 0) + 1;
        adminBetoltottAdatok.clear();
        adminStudioFoglalasKartyak.clear();
        adminFolyamatbanLevoKeresek.clear();
    }

    async function adminPanelAdatokBetoltese(tab, force = false) {
        if (!allapot.session || !allapot.adminVerified) return;
        const verzio = allapot.adatCacheVerzio;
        const betoltok = {
            foglalasok: foglalasokBetoltese, esemenyek: esemenynaploBetoltese,
            szolgaltatasok: szolgaltatasokBetoltese, kuponok: kuponokBetoltese,
            idosavok: idosavokBetoltese, tiltasok: tiltasokBetoltese,
            beallitasok: beallitasokBetoltese, vendegek: vendegProfilokBetoltese,
        };
        const stabil = new Set(['szolgaltatasok', 'kuponok', 'beallitasok']);
        const fuggosegek = {
            attekintes: ['foglalasok', 'esemenyek'], foglalasok: ['foglalasok'],
            esemenynaplo: ['esemenyek'], vendegek: ['vendegek'],
            szolgaltatasok: ['szolgaltatasok'], arkalkulator: ['szolgaltatasok', 'kuponok'],
            kuponok: ['szolgaltatasok', 'kuponok'], idosavok: ['idosavok'],
            tiltasok: ['szolgaltatasok', 'tiltasok'], beallitasok: ['beallitasok'],
        };
        await Promise.all((fuggosegek[tab] || []).map(async kulcs => {
            if (!force && typeof adminStudioVanPiszkozat === 'function' && adminStudioVanPiszkozat(kulcs)) return;
            if (!force && stabil.has(kulcs) && adminBetoltottAdatok.has(kulcs)) return;
            const siker = await betoltok[kulcs]();
            if (siker !== false && stabil.has(kulcs) && verzio === allapot.adatCacheVerzio) adminBetoltottAdatok.add(kulcs);
        }));
        if (tab === 'attekintes') await adminV2AttekintesFrissitese();
    }

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

// Small admin copy overrides that should remain independent from workspace structure.

ADMIN_V2_PAGE_COPY.szolgaltatasok.title = 'Árlista';

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arlistaFeliratokFrissitese);
} else {
    arlistaFeliratokFrissitese();
}

function arlistaFeliratokFrissitese() {
    window.requestAnimationFrame(() => {
        document.querySelectorAll('.admin-v2-subnav [data-admin-v2-panel="szolgaltatasok"]').forEach(gomb => {
            gomb.textContent = 'Árlista';
        });
    });
}

    // One native dialog for existing editors. Nodes stay under their original
    // record/root so the established payload readers and delegated events work.
    let adminAktivSzerkesztoPanel = null;
    let adminSzerkesztoPanelSorszam = 0;

    function adminSzerkesztoPanelMegnyitasa({ owner, nodes, title, trigger, saveLabel = 'Módosítások mentése', onSave, onClose }) {
        if(window.LumiReferenceUiActive)return;
        nodes = nodes.map((node) =>
            node.matches?.('select') && node.closest('.admin-select-control') ? node.closest('.admin-select-control') : node
        );
        if (!owner?.isConnected || !nodes.length) return;
        if (adminAktivSzerkesztoPanel?.owner === owner && adminAktivSzerkesztoPanel.dialog.isConnected && adminAktivSzerkesztoPanel.dialog.open)
            return;
        adminAktivSzerkesztoPanel?.finish();
        const dialog = document.createElement('dialog');
        dialog.className = 'admin-editor-sheet';
        dialog.dataset.entering = '';
        const titleId = `admin-editor-title-${++adminSzerkesztoPanelSorszam}`;
        dialog.setAttribute('aria-labelledby', titleId);
        dialog.innerHTML = `<div class="admin-editor-sheet-body">
                <header class="admin-editor-sheet-header">
                    <span class="admin-editor-sheet-handle" aria-hidden="true"></span>
                    <h2 id="${titleId}" tabindex="-1"></h2>
                    <button type="button" class="admin-v2-icon-button" data-editor-close aria-label="Szerkesztő bezárása">${adminV2Ikon('close')}</button>
                </header>
                <div class="admin-editor-sheet-content"></div>
                <footer class="admin-editor-sheet-footer">
                    <p class="admin-editor-sheet-status" role="status" aria-live="polite"></p>
                    <p>A bezárás megtartja a szerkesztett értékeket. A mentés véglegesíti őket.</p>
                    <button type="button" class="admin-v2-button admin-v2-button-primary" data-editor-save></button>
                </footer>
            </div>`;
        dialog.querySelector('h2').textContent = title || 'Szerkesztés';
        const save = dialog.querySelector('[data-editor-save]');
        save.textContent = saveLabel;
        if (!onSave) dialog.querySelector('footer').hidden = true;
        const restore = nodes.map((node) => {
            const marker = document.createComment('editor position');
            node.before(marker);
            const hidden = node.hidden;
            node.hidden = false;
            dialog.querySelector('.admin-editor-sheet-content').append(node);
            return { node, marker, hidden };
        });
        owner.append(dialog);
        const previousOverflow = document.body.style.overflow;
        const workspace = document.querySelector('.admin-workspace-main');
        const previousWorkspaceOverflow = workspace?.style.overflow;
        document.body.style.overflow = 'hidden';
        if (workspace) workspace.style.overflow = 'hidden';
        const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!motion) delete dialog.dataset.entering;
        let closing = false;
        let backdropPointer = false;
        let drag = null;
        const body = dialog.firstElementChild;
        const header = dialog.querySelector('header');
        body.addEventListener(
            'animationend',
            () => {
                delete dialog.dataset.entering;
            },
            { once: true }
        );
        const observer = new MutationObserver(() => {
            if (!dialog.isConnected) finish();
        });
        const statusSource = document.getElementById('admin-online-status');
        const statusMessage = dialog.querySelector('.admin-editor-sheet-status');
        const statusObserver = new MutationObserver(() => {
            statusMessage.textContent = statusSource.textContent;
            statusMessage.classList.toggle('is-error', statusSource.classList.contains('hiba'));
            statusMessage.setAttribute('role', statusSource.classList.contains('hiba') ? 'alert' : 'status');
        });
        if (statusSource)
            statusObserver.observe(statusSource, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        observer.observe(document.body, { childList: true, subtree: true });
        function finish() {
            if (adminAktivSzerkesztoPanel?.dialog !== dialog) return;
            observer.disconnect();
            statusObserver.disconnect();
            adminAktivSzerkesztoPanel = null;
            restore.forEach(({ node, marker, hidden }) => {
                if (marker.parentNode) marker.replaceWith(node);
                node.hidden = hidden;
            });
            dialog.close();
            dialog.remove();
            document.body.style.overflow = previousOverflow;
            if (workspace) workspace.style.overflow = previousWorkspaceOverflow;
            onClose?.();
            if (trigger?.isConnected) trigger.focus({ preventScroll: true });
        }
        function close() {
            if (closing || save.disabled) return;
            closing = true;
            dialog.dataset.closing = '';
            if (!motion) {
                finish();
                return;
            }
            body.animate(
                [
                    { transform: getComputedStyle(body).transform },
                    {
                        transform: window.matchMedia('(min-width: 640px)').matches
                            ? 'translateX(calc(100% + 1rem))'
                            : 'translateY(calc(100% + 1rem))'
                    }
                ],
                { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }
            ).finished.then(finish, finish);
        }
        adminAktivSzerkesztoPanel = { owner, dialog, close, finish };
        dialog.addEventListener('cancel', (event) => {
            event.preventDefault();
            close();
        });
        dialog.addEventListener('pointerdown', (event) => {
            backdropPointer = event.target === dialog;
        });
        dialog.addEventListener('click', (event) => {
            if (event.target.closest('[data-editor-close]')) close();
            if (event.target === dialog && backdropPointer) close();
            backdropPointer = false;
        });
        save.addEventListener('click', async () => {
            save.disabled = true;
            save.setAttribute('aria-busy', 'true');
            try {
                await onSave?.();
            } finally {
                save.disabled = false;
                save.removeAttribute('aria-busy');
            }
        });
        header.addEventListener('pointerdown', (event) => {
            if (event.button !== 0 || event.target.closest('button') || window.matchMedia('(min-width: 640px)').matches || closing) return;
            drag = {
                id: event.pointerId,
                y: event.clientY,
                distance: 0,
                time: performance.now()
            };
            delete dialog.dataset.entering;
            header.setPointerCapture(event.pointerId);
            dialog.dataset.dragging = '';
        });
        header.addEventListener('pointermove', (event) => {
            if (!drag || drag.id !== event.pointerId) return;
            drag.distance = Math.max(0, event.clientY - drag.y);
            body.style.transform = `translateY(${drag.distance}px)`;
            dialog.style.setProperty('--sheet-backdrop-opacity', String(0.65 * Math.max(0.15, 1 - drag.distance / body.offsetHeight)));
        });
        const endDrag = (event) => {
            if (!drag || drag.id !== event.pointerId) return;
            const shouldClose =
                event.type !== 'pointercancel' &&
                (drag.distance > 100 || (drag.distance > 35 && drag.distance / Math.max(1, performance.now() - drag.time) > 0.6));
            drag = null;
            if (header.hasPointerCapture(event.pointerId)) header.releasePointerCapture(event.pointerId);
            delete dialog.dataset.dragging;
            dialog.style.removeProperty('--sheet-backdrop-opacity');
            if (shouldClose) close();
            else {
                if (motion)
                    body.animate([{ transform: body.style.transform }, { transform: 'translateY(0)' }], {
                        duration: 220,
                        easing: 'cubic-bezier(.2,.7,.2,1)'
                    });
                body.style.removeProperty('transform');
            }
        };
        header.addEventListener('pointerup', endDrag);
        header.addEventListener('pointercancel', endDrag);
        dialog.showModal();
        dialog.querySelector('h2').focus({ preventScroll: true });
    }

    function adminKartyaPanelMegnyitasa(kartya, booking = false) {
        const nodes = Array.from(
            kartya.querySelectorAll(
                booking
                    ? ':scope > .admin-foglalas-reszletek, :scope > .admin-idopont-szerkeszto, :scope > .admin-db-akciok, [data-foglalas-statusz]'
                    : ':scope > .admin-kompakt-szerkeszto'
            )
        );
        const trigger = kartya.querySelector(booking ? '[data-foglalas-szerkesztes]' : '[data-admin-kartya-toggle]');
        adminSzerkesztoPanelMegnyitasa({
            owner: kartya,
            nodes,
            title: kartya.querySelector('h3')?.textContent || (booking ? 'Időpont szerkesztése' : 'Szerkesztés'),
            trigger,
            onSave: () => lebegoMentes(),
            onClose: () => {
                if (booking) {
                    if (kartya.classList.contains('szerkeszt')) foglalasSzerkesztesKapcsolasa(kartya);
                    if (kartya._studioReturn) {
                        const restore = kartya._studioReturn;
                        delete kartya._studioReturn;
                        restore();
                    }
                } else {
                    kartya.classList.remove('szerkeszt');
                    if (trigger) {
                        trigger.innerHTML = `${adminV2Ikon('edit')}<span>Szerkesztés</span>`;
                        trigger.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        });
    }

    window.LumiAdminSheet = {
        open: adminSzerkesztoPanelMegnyitasa,
        close: () => adminAktivSzerkesztoPanel?.close(),
        resetWithin: (root) => {
            if (root?.contains(adminAktivSzerkesztoPanel?.owner)) adminAktivSzerkesztoPanel.finish();
        }
    };

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

    const adminStudioSelectVezerlok = new Set();
    let adminStudioVezerloFrissitesVar = false;

    document.addEventListener('DOMContentLoaded', () => {
        if(window.LumiReferenceUiActive)return;
        const root = document.getElementById('admin-tartalom');
        if (!root) return;
        adminStudioMeretAlkalmazasa();
        adminStudioMeretValaszto();
        const settings = document.getElementById('admin-panel-beallitasok');
        const theme = document.createElement('label');
        theme.className = 'admin-mezo studio-density-setting';
        theme.innerHTML =
            'Megjelenés<select data-studio-theme aria-label="Megjelenés"><option value="auto">Automatikus</option><option value="light">Világos</option><option value="dark">Sötét</option></select>';
        const choice = theme.querySelector('select');
        try {
            choice.value = localStorage.getItem('lumi-admin-theme') || 'auto';
        } catch (_) {}
        choice.addEventListener('change', () => adminV2TemaAlkalmazasa(choice.value, true));
        settings?.append(theme);
        const old = settings?.querySelector('[data-admin-v2-dark-mode]');
        if (old) old.closest('label').hidden = true;
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (choice.value === 'auto') adminV2TemaAlkalmazasa('auto');
        });
        adminV2TemaAlkalmazasa(choice.value);
        adminStudioVezerlokFrissitese();
        new MutationObserver(() => {
            if (adminStudioVezerloFrissitesVar) return;
            adminStudioVezerloFrissitesVar = true;
            requestAnimationFrame(() => {
                adminStudioVezerloFrissitesVar = false;
                adminStudioVezerlokFrissitese();
            });
        }).observe(root, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled']
        });
        root.addEventListener('input', (event) => {
            if (event.target.matches('textarea')) adminStudioSzovegMeret(event.target);
            if (event.target.matches('input[type="date"],input[type="time"],input[type="month"]')) adminStudioIdoFelirat(event.target);
        });
        root.addEventListener('change', (event) => {
            if (event.target.matches('select')) adminStudioSelectFelirat(event.target);
            if (event.target.matches('[data-foglalas-statusz]')) adminStudioStatuszJelzes(event.target.closest('.admin-foglalas-kartya'));
            if (event.target.matches('input[type="date"],input[type="time"],input[type="month"]')) adminStudioIdoFelirat(event.target);
            adminStudioMentesJelzes();
        });
        root.addEventListener('input', (event) => {
            event.target.dataset.studioChanged = 'true';
            adminStudioMentesJelzes();
        });
        root.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && event.target.matches('[data-idopont-mezo="paid_amount"]')) {
                event.preventDefault();
                event.target.blur();
            }
        });
        window.addEventListener('beforeunload', (event) => {
            if (!['foglalasok', 'szovegek', 'szolgaltatasok', 'kuponok', 'idosavok', 'tiltasok', 'beallitasok'].some(adminStudioVanPiszkozat))
                return;
            event.preventDefault();
            event.returnValue = '';
        });
    });

    function adminStudioMeretAlkalmazasa(value) {
        let size = value;
        if (!size) {
            try {
                size = localStorage.getItem('lumi-admin-size');
            } catch (_) {}
        }
        document.documentElement.dataset.adminSize = ['compact', 'normal', 'large', 'auto'].includes(size) ? size : 'compact';
        if (value) {
            try {
                localStorage.setItem('lumi-admin-size', value);
            } catch (_) {}
        }
    }

    function adminStudioMeretValaszto() {
        const panel = document.getElementById('admin-panel-beallitasok');
        if (!panel || panel.querySelector('[data-admin-size]')) return;
        const label = document.createElement('label');
        label.className = 'admin-mezo studio-density-setting';
        label.innerHTML =
            'Felület mérete<select data-admin-size aria-label="Felület mérete"><option value="compact">Kompakt</option><option value="normal">Normál</option><option value="large">Nagy</option><option value="auto">Automatikus</option></select>';
        label.querySelector('select').value = document.documentElement.dataset.adminSize;
        label.querySelector('select').addEventListener('change', (event) => adminStudioMeretAlkalmazasa(event.target.value));
        (panel.querySelector('.admin-v2-card-body') || panel).append(label);
    }

    function adminStudioVezerlokFrissitese() {
        const root = document.getElementById('admin-tartalom');
        if (!root) return;
        root.querySelectorAll('select:not([data-studio-native-select])').forEach(adminStudioSelectLetrehozas);
        root.querySelectorAll('input[type="date"],input[type="time"],input[type="month"]').forEach((input) => {
            if (!input.closest('.admin-temporal-control')) {
                const wrapper = document.createElement('span');
                wrapper.className = 'admin-temporal-control';
                const text = document.createElement('span');
                text.className = 'admin-temporal-value';
                text.setAttribute('aria-hidden', 'true');
                input.before(wrapper);
                wrapper.append(input, text);
            }
            adminStudioIdoFelirat(input);
        });
        root.querySelectorAll('textarea').forEach(adminStudioSzovegMeret);
        adminStudioRendezokFrissitese(root);
        for (const select of adminStudioSelectVezerlok) {
            if (!select.isConnected) adminStudioSelectVezerlok.delete(select);
            else adminStudioSelectFelirat(select);
        }
    }

    function adminStudioIdoFelirat(input) {
        const target = input.parentElement.querySelector('.admin-temporal-value');
        if (!target) return;
        let text = input.value;
        if (input.type === 'date' && text)
            text = new Date(text + 'T12:00:00').toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        if (input.type === 'month' && text)
            text = new Date(text + '-01T12:00:00').toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: 'long'
            });
        if (!text) text = input.type === 'time' ? '--:--' : input.type === 'month' ? 'Hónap választása' : 'Dátum választása';
        if (target.textContent !== text) target.textContent = text;
        input.parentElement.classList.toggle('is-disabled', input.disabled);
    }

    function adminStudioSzovegMeret(input) {
        if (!input.isConnected || !input.getClientRects().length) return;
        input.style.height = 'auto';
        const line = parseFloat(getComputedStyle(input).lineHeight) || 20;
        input.style.height = Math.max(line * 2 + 12, Math.min(input.scrollHeight + 2, line * 8 + 16)) + 'px';
        input.style.overflowY = input.scrollHeight > line * 8 + 16 ? 'auto' : 'hidden';
    }

    function adminStudioSelectLetrehozas(select) {
        select.dataset.studioNativeSelect = 'true';
        select.hidden = true;
        select.tabIndex = -1;
        select.setAttribute('aria-hidden', 'true');
        const wrapper = document.createElement('span');
        wrapper.className = 'admin-select-control';
        select.before(wrapper);
        wrapper.append(select);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'admin-select-trigger';
        if (select.matches('[data-foglalas-statusz]')) button.classList.add('admin-select-trigger--status');
        button.setAttribute('role', 'combobox');
        button.setAttribute('aria-haspopup', 'listbox');
        button.setAttribute('aria-expanded', 'false');
        const id = select.id || 'admin-select-' + Math.random().toString(36).slice(2);
        const popup = document.createElement('div');
        popup.className = 'admin-select-popup';
        popup.id = id + '-options';
        popup.setAttribute('popover', 'auto');
        popup.setAttribute('role', 'listbox');
        button.setAttribute('aria-controls', popup.id);
        const label = select.getAttribute('aria-label') || select.closest('label')?.childNodes[0]?.textContent.trim() || 'Választás';
        button.setAttribute('aria-label', label);
        wrapper.append(button, popup);
        select._studioSelect = { button, popup };
        adminStudioSelectVezerlok.add(select);
        const open = () => {
            if (select.disabled) return;
            popup.replaceChildren();
            for (const option of select.options) {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'admin-select-option';
                item.setAttribute('role', 'option');
                item.setAttribute('aria-selected', String(option.selected));
                item.textContent = option.label;
                item.disabled = option.disabled;
                item.addEventListener('click', () => {
                    select.value = option.value;
                    select.dispatchEvent(new Event('input', { bubbles: true }));
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    popup.hidePopover();
                    button.focus();
                });
                popup.append(item);
            }
            const rect = button.getBoundingClientRect();
            const width = Math.min(Math.max(rect.width, 160), innerWidth - 24);
            popup.style.width = width + 'px';
            popup.style.left = Math.max(12, Math.min(rect.left, innerWidth - width - 12)) + 'px';
            popup.style.top = Math.min(rect.bottom + 5, innerHeight - 100) + 'px';
            popup.style.maxHeight = Math.max(80, Math.min(280, innerHeight - rect.bottom - 16)) + 'px';
            popup.showPopover();
            button.setAttribute('aria-expanded', 'true');
            (popup.querySelector('[aria-selected="true"]:not(:disabled)') || popup.querySelector('button:not(:disabled)'))?.focus({
                preventScroll: true
            });
        };
        button.addEventListener('click', () => (popup.matches(':popover-open') ? popup.hidePopover() : open()));
        button.addEventListener('keydown', (event) => {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                event.preventDefault();
                open();
            }
        });
        popup.addEventListener('toggle', () => button.setAttribute('aria-expanded', String(popup.matches(':popover-open'))));
        popup.addEventListener('keydown', (event) => {
            const options = Array.from(popup.querySelectorAll('button:not(:disabled)'));
            const index = options.indexOf(document.activeElement);
            if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                event.preventDefault();
                const next =
                    event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? options.length - 1
                          : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
                options[next]?.focus();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                popup.hidePopover();
                button.focus();
            }
            if (event.key === 'Tab') popup.hidePopover();
        });
        adminStudioSelectFelirat(select);
    }

    function adminStudioSelectFelirat(select) {
        const ui = select._studioSelect;
        if (!ui) return;
        const text = select.selectedOptions[0]?.label || 'Választás';
        if (ui.button.textContent !== text) ui.button.textContent = text;
        if (ui.button.disabled !== select.disabled) ui.button.disabled = select.disabled;
        ui.button.setAttribute(
            'aria-label',
            (select.getAttribute('aria-label') || select.closest('label')?.childNodes[0]?.textContent.trim() || 'Választás') + ': ' + text
        );
    }

    function adminStudioMezoModosult(input) {
        if (
            input.matches('[data-admin-size],[data-studio-theme],[data-admin-v2-dark-mode],input[type="search"],[data-studio-filter]') ||
            input.closest('.admin-kereses-mezo,.admin-oldalmeret,.studio-revenue-picker,.studio-section-heading')
        )
            return false;
        if (input.type === 'checkbox' || input.type === 'radio') return input.checked !== input.defaultChecked;
        if (input.tagName === 'SELECT') {
            const original = Array.from(input.options).find((option) => option.defaultSelected) || input.options[0];
            return String(input.value) !== String(original?.value || '');
        }
        return input.value !== input.defaultValue;
    }

    function adminStudioVanPiszkozat(tab = allapot.aktivTab) {
        if (tab === 'szovegek') return Boolean(window.LumiAdminCms?.isDirty());
        const panel = document.getElementById('admin-panel-' + tab);
        if (!panel) return false;
        if (tab === 'foglalasok')
            return Array.from(adminStudioFoglalasKartyak.values()).some((card) => {
                const paid = fizetettOsszegAdatok(card);
                return (
                    !paid.hiba &&
                    foglalasKartyaModosult(card, {
                        status: card.querySelector('[data-foglalas-statusz]')?.value,
                        paid_amount: paid.ertek,
                        reason: idopontMezo(card, 'reason')?.value
                    })
                );
            });
        return (
            (tab === 'idosavok' && allapot.naptarKijelolesek.size > 0) ||
            Array.from(panel.querySelectorAll('[data-studio-changed]')).some(adminStudioMezoModosult) ||
            Boolean(panel.querySelector('[data-draft-new],[data-draft-delete],[data-studio-sort-dirty]'))
        );
    }

    function adminStudioMentesJelzes() {
        const button = document.querySelector('[data-studio-save]');
        if (!button) return;
        button.classList.toggle('has-draft', adminStudioVanPiszkozat());
        if (allapot.aktivTab === 'foglalasok') button.hidden = !adminStudioVanPiszkozat();
        button.setAttribute('aria-label', adminStudioVanPiszkozat() ? 'Mentetlen módosítások mentése' : 'Mentés');
    }

    function adminStudioStatuszJelzes(card) {
        if (!card) return;
        const select = card.querySelector('[data-foglalas-statusz]');
        if (!select) return;
        let tag = card.querySelector('.studio-booking-draft');
        if (!tag) {
            tag = document.createElement('small');
            tag.className = 'studio-booking-draft';
            card.querySelector('.studio-booking-meta')?.append(tag);
        }
        tag.textContent = select.value !== card.dataset.eredetiStatusz ? 'Mentésre vár' : '';
        tag.hidden = !tag.textContent;
        adminStudioSelectFelirat(select);
        adminStudioMentesJelzes();
    }

    const adminStudioFoglalasKartyak = new Map();
    function adminStudioFoglalasKartya(elem) {
        const key = elem.tipus + ':' + elem.adat.id;
        if (!adminStudioFoglalasKartyak.has(key))
            adminStudioFoglalasKartyak.set(key, elem.tipus === 'blocked' ? tiltasFoglalasKartya(elem.adat) : foglalasKartya(elem.adat));
        return adminStudioFoglalasKartyak.get(key);
    }
    function foglalasokBetoltese() {
        if (adminStudioVanPiszkozat('foglalasok')) return Promise.resolve(false);
        return adminKeresOsszevonasa('foglalasokBetoltese', foglalasokBetolteseLetoltese);
    }

    async function foglalasokBetolteseLetoltese() {
        const ervenyes = adminKeresMunkamenetOr();
        const elemek = adminElemek();
        onlineStatusz('Foglalások betöltése...');

        const alapSelect =
            'id,customer_name,customer_phone,customer_email,note,starts_at,ends_at,status,created_at,paid_amount,services(name,price_text)';
        const kuponSelect =
            'id,service_id,customer_name,customer_phone,customer_email,note,starts_at,ends_at,status,created_at,paid_amount,coupon_code,coupon_title,services(name,price_text)';
        const inspiracioSelect =
            'id,service_id,public_reference,customer_name,customer_phone,customer_email,note,starts_at,ends_at,status,created_at,paid_amount,coupon_code,coupon_title,inspiration_image_url,inspiration_image_path,inspiration_image_name,inspiration_image_type,inspiration_image_size,inspiration_images,nail_style,nail_style_note,services(name,price_text)';
        let { data: foglalasok, error: foglalasHiba } = await allapot.kliens
            .from('bookings')
            .select(inspiracioSelect)
            .order('starts_at', { ascending: false })
            .limit(ADMIN_FOGLALAS_LIMIT);

        if (foglalasHiba && hianyzoInspiracioOszlop(foglalasHiba)) {
            ({ data: foglalasok, error: foglalasHiba } = await allapot.kliens
                .from('bookings')
                .select(kuponSelect)
                .order('starts_at', { ascending: false })
                .limit(ADMIN_FOGLALAS_LIMIT));
        }

        if (foglalasHiba && hianyzoKuponOszlop(foglalasHiba)) {
            ({ data: foglalasok, error: foglalasHiba } = await allapot.kliens
                .from('bookings')
                .select(alapSelect)
                .order('starts_at', { ascending: false })
                .limit(ADMIN_FOGLALAS_LIMIT));
        }
        if (!foglalasHiba && Array.isArray(foglalasok) && foglalasok.length && !Object.hasOwn(foglalasok[0], 'public_reference')) {
            const { data: referenciaAdatok, error: referenciaHiba } = await allapot.kliens
                .from('bookings')
                .select('id,public_reference,starts_at')
                .order('starts_at', { ascending: false })
                .limit(ADMIN_FOGLALAS_LIMIT);

            if (!referenciaHiba) {
                const referenciaMap = new Map((referenciaAdatok || []).map((adat) => [adat.id, adat.public_reference]));
                foglalasok = foglalasok.map((foglalas) => ({
                    ...foglalas,
                    public_reference: referenciaMap.get(foglalas.id) || ''
                }));
            } else if (!adatbazisOszlopHiany(referenciaHiba, ['public_reference'])) {
                console.warn('Foglalási azonosítók betöltési hiba:', referenciaHiba);
            }
        }

        let { data: tiltasok, error: tiltasHiba } = await allapot.kliens
            .from('blocked_times')
            .select(
                'id,starts_at,ends_at,reason,status,created_at,service_id,paid_amount,services(name,description,price_text,duration_minutes)'
            )
            .order('starts_at', { ascending: false })
            .limit(ADMIN_FOGLALAS_LIMIT);

        if (tiltasHiba && adatbazisOszlopHiany(tiltasHiba, ['service_id'])) {
            allapot.tiltasSzolgaltatasTamogatott = false;
            ({ data: tiltasok, error: tiltasHiba } = await allapot.kliens
                .from('blocked_times')
                .select('id,starts_at,ends_at,reason,status,created_at')
                .order('starts_at', { ascending: false })
                .limit(ADMIN_FOGLALAS_LIMIT));
        } else if (!tiltasHiba) {
            allapot.tiltasSzolgaltatasTamogatott = true;
        }

        if (tiltasHiba && adatbazisOszlopHiany(tiltasHiba, ['status'])) {
            allapot.tiltasStatuszTamogatott = false;
            const szolgaltatasSelect = allapot.tiltasSzolgaltatasTamogatott
                ? ',service_id,paid_amount,services(name,description,price_text,duration_minutes)'
                : '';
            ({ data: tiltasok, error: tiltasHiba } = await allapot.kliens
                .from('blocked_times')
                .select(`id,starts_at,ends_at,reason,created_at${szolgaltatasSelect}`)
                .order('starts_at', { ascending: false })
                .limit(ADMIN_FOGLALAS_LIMIT));
        } else if (!tiltasHiba) {
            allapot.tiltasStatuszTamogatott = true;
        }

        if (foglalasHiba || tiltasHiba) {
            onlineStatusz('Nem sikerült betölteni a foglalásokat.', true);
            return;
        }

        foglalasok = await foglalasInspiracioLinkekAlairasa(foglalasok || []);
        if (!ervenyes()) return false;

        adminStudioFoglalasKartyak.clear();
        allapot.foglalasElemek = [
            ...(foglalasok || []).map((foglalas) => ({
                tipus: 'booking',
                datum: foglalas.starts_at,
                adat: foglalas
            })),
            ...(tiltasok || []).map((tiltas) => ({
                tipus: 'blocked',
                datum: tiltas.starts_at,
                adat: { ...tiltas, status: tiltasStatuszErtek(tiltas.status) }
            }))
        ].sort((a, b) => new Date(b.datum) - new Date(a.datum));

        await vendegLemondasEsemenyekBetoltese();
        if (!ervenyes()) return false;

        if (allapot.foglalasOldal > foglalasOsszesOldal()) {
            allapot.foglalasOldal = foglalasOsszesOldal();
        }

        foglalasListaRenderelese();
        onlineStatusz('');
    }

    function hianyzoInspiracioOszlop(error) {
        const uzenet = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
        return (
            uzenet.includes('inspiration_image') ||
            uzenet.includes('nail_style') ||
            (uzenet.includes('column') && uzenet.includes('schema cache'))
        );
    }

    function hianyzoKuponOszlop(error) {
        const uzenet = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
        return (
            uzenet.includes('coupon_code') || uzenet.includes('coupon_title') || (uzenet.includes('column') && uzenet.includes('schema cache'))
        );
    }

    function adatbazisOszlopHiany(error, oszlopok = []) {
        const uzenet = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
        return (
            oszlopok.some((oszlop) => uzenet.includes(oszlop.toLowerCase())) || (uzenet.includes('schema cache') && uzenet.includes('column'))
        );
    }

    function hianyzoKuponTabla(error) {
        const uzenet = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
        return uzenet.includes('coupons') || uzenet.includes('schema cache') || uzenet.includes('does not exist');
    }
    function foglalasListaRenderelese() {
        const elemek = adminElemek();
        const szurtElemek = foglalasSzurtElemek();
        const meret = listaOldalMeret(allapot.foglalasOldalMeret, szurtElemek.length);
        const kezd = allapot.foglalasOldalMeret === 'all' ? 0 : (allapot.foglalasOldal - 1) * meret;
        const oldalElemek = allapot.foglalasOldalMeret === 'all' ? szurtElemek : szurtElemek.slice(kezd, kezd + meret);

        elemek.foglalasLista.innerHTML = '';
        foglalasAttekintesFrissitese(szurtElemek);
        foglalasNaptarRenderelese(szurtElemek);

        if (!oldalElemek.length) {
            const aktivSzuro = Boolean(allapot.foglalasKereses) || (allapot.foglalasStatuszSzuro || 'all') !== 'all';
            elemek.foglalasLista.innerHTML = aktivSzuro
                ? '<p class="admin-ures">Nincs tal\u00e1lat erre a sz\u0171r\u00e9sre.</p>'
                : '<p class="admin-ures">M\u00e9g nincs foglal\u00e1s vagy k\u00e9zzel felvett foglalt id\u0151.</p>';
            foglalasLapozoRenderelese();
            foglalasTabJelzesFrissitese();
            return;
        }

        oldalElemek.forEach((elem) => {
            elemek.foglalasLista.appendChild(adminStudioFoglalasKartya(elem));
        });

        foglalasLapozoRenderelese();
        foglalasTabJelzesFrissitese();
    }

    function aktualisFoglalasExportAdatok() {
        if(Array.isArray(allapot.referenceExportBookings))return allapot.referenceExportBookings;
        if (allapot.foglalasNezet === 'naptar') {
            return foglalasNaptarHonapElemei().map((elem) => ({
                ...elem.adat,
                __tipus: elem.tipus
            }));
        }

        return aktualisListaOldal(foglalasSzurtElemek(), allapot.foglalasOldal, allapot.foglalasOldalMeret).map((elem) => ({
            ...elem.adat,
            __tipus: elem.tipus
        }));
    }

    function foglalasSzurtElemek() {
        const kereses = normalizaltKereses(allapot.foglalasKereses);
        const telefonKereses = csakSzamok(allapot.foglalasKereses);
        const statuszSzuro = allapot.foglalasStatuszSzuro || 'all';

        if (!kereses && !telefonKereses && statuszSzuro === 'all') {
            return adminStudioFoglalasSorrend(allapot.foglalasElemek);
        }

        return adminStudioFoglalasSorrend(allapot.foglalasElemek).filter((elem) => {
            const adat = elem.adat || {};
            const statusz = String(adat.status || '').toLowerCase();
            const statuszTalalat =
                statuszSzuro === 'all' ||
                (statuszSzuro === 'blocked' && elem.tipus === 'blocked' && statusz === 'blocked') ||
                (statuszSzuro === 'blocked_all' && elem.tipus === 'blocked') ||
                (statuszSzuro === 'done' && statusz === 'done') ||
                (statuszSzuro === 'cancelled_by_customer' && statusz === 'cancelled_by_customer') ||
                (elem.tipus === 'booking' && statusz === statuszSzuro);

            if (!statuszTalalat) {
                return false;
            }

            if (!kereses && !telefonKereses) {
                return true;
            }

            const szolgaltatasNev = adat.services?.description || adat.services?.name || '';
            const szovegek = [
                adat.customer_name,
                adat.customer_email,
                adat.customer_phone,
                adat.public_reference,
                adat.id,
                adat.note,
                adat.nail_style,
                vendegLemondasMegjegyzese(adat),
                adat.reason,
                szolgaltatasNev,
                elem.tipus === 'blocked' ? 'k\u00e9zzel felvett foglalt id\u0151' : 'foglal\u00e1s'
            ];
            const szovegTalalat = normalizaltKereses(szovegek.filter(Boolean).join(' ')).includes(kereses);
            const telefonTalalat =
                telefonKereses &&
                csakSzamok([adat.customer_phone, adat.customer_name, adat.customer_email].filter(Boolean).join(' ')).includes(telefonKereses);
            return szovegTalalat || telefonTalalat;
        });
    }

    function foglalasFuggoben(foglalas) {
        return String(foglalas?.status || '').toLowerCase() === 'pending';
    }

    function foglalasFuggobenDarab() {
        return allapot.foglalasElemek.filter((elem) => elem.tipus === 'booking' && foglalasFuggoben(elem.adat)).length;
    }

    function vendegAltalLemondottFoglalasok() {
        return allapot.foglalasElemek.filter(
            (elem) => elem.tipus === 'booking' && String(elem.adat?.status || '').toLowerCase() === 'cancelled_by_customer'
        );
    }

    async function vendegLemondasEsemenyekBetoltese() {
        const ervenyes = adminKeresMunkamenetOr();
        const foglalasIds = vendegAltalLemondottFoglalasok()
            .map((elem) => elem.adat?.id)
            .filter(Boolean);

        allapot.lemondasEsemenyek = new Map();

        if (!foglalasIds.length) {
            return;
        }

        const { data, error } = await allapot.kliens
            .from('booking_events')
            .select('booking_id,event_type,channel,message,metadata,created_at')
            .in('booking_id', foglalasIds)
            .in('event_type', ['customer_cancelled', 'customer_cancellation_acknowledged'])
            .order('created_at', { ascending: true });

        if (error) {
            console.warn('Vendéglemondások értesítési állapota nem tölthető be:', error);
            return;
        }

        if (!ervenyes()) return;
        (data || []).forEach((esemeny) => {
            const bookingId = String(esemeny.booking_id || '');
            if (!bookingId) {
                return;
            }

            const allapotAdat = allapot.lemondasEsemenyek.get(bookingId) || {};
            if (esemeny.event_type === 'customer_cancelled') {
                allapotAdat.lemondas = esemeny.created_at;
                allapotAdat.lemondasCsatorna = esemeny.channel;
                allapotAdat.megjegyzes = vendegLemondasMegjegyzesEsemenybol(esemeny);
            }
            if (esemeny.event_type === 'customer_cancellation_acknowledged') {
                allapotAdat.tudomasulvetel = esemeny.created_at;
            }
            allapot.lemondasEsemenyek.set(bookingId, allapotAdat);
        });
    }

    function vendegLemondasMegjegyzesEsemenybol(esemeny) {
        const metadata = esemeny?.metadata;
        const metadataMegjegyzes = metadata && typeof metadata === 'object' ? String(metadata.cancellation_note || '').trim() : '';

        if (metadataMegjegyzes) {
            return metadataMegjegyzes;
        }

        const uzenet = String(esemeny?.message || '').trim();
        const talalat = uzenet.match(/^Vend[eé]g megjegyz[eé]se:\s*([\s\S]+)$/i);
        return talalat?.[1]?.trim() || '';
    }

    function vendegLemondasMegjegyzese(foglalas) {
        const esemenyek = allapot.lemondasEsemenyek.get(String(foglalas?.id || ''));
        return String(esemenyek?.megjegyzes || '').trim();
    }

    function vendegLemondasOlvasatlan(foglalas) {
        const esemenyek = allapot.lemondasEsemenyek.get(String(foglalas?.id || ''));

        if (!esemenyek?.tudomasulvetel) {
            return true;
        }

        if (!esemenyek.lemondas) {
            return false;
        }

        return Date.parse(esemenyek.lemondas) > Date.parse(esemenyek.tudomasulvetel);
    }

    function vendegLemondasOlvasatlanFoglalasok() {
        return vendegAltalLemondottFoglalasok()
            .map((elem) => elem.adat)
            .filter(vendegLemondasOlvasatlan);
    }

    function vendegLemondasJelzesFrissitese() {
        const elemek = adminElemek();
        const darab = vendegLemondasOlvasatlanFoglalasok().length;

        if (!elemek.vendegLemondasJelzes) {
            return;
        }

        elemek.vendegLemondasJelzes.hidden = darab === 0;
        elemek.vendegLemondasDarab.textContent = String(darab);
        elemek.vendegLemondasUzenet.setAttribute('aria-label', darab + ' új vendéglemondás vár arra, hogy átnézd.');
    }

    function vendegLemondasokMegnyitasa() {
        const elemek = adminElemek();
        allapot.foglalasKereses = '';
        allapot.foglalasStatuszSzuro = 'cancelled_by_customer';
        allapot.foglalasOldal = 1;
        elemek.foglalasKereses.value = '';
        foglalasKeresesTorlesGombFrissitese(elemek);
        elemek.foglalasStatuszSzuro.value = 'cancelled_by_customer';
        foglalasListaRenderelese();
        foglalasNezetValtasa('lista');
        elemek.foglalasLista?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function vendegLemondasokTudomasulvetele() {
        const elemek = adminElemek();
        const olvasatlanFoglalasok = vendegLemondasOlvasatlanFoglalasok();

        if (!olvasatlanFoglalasok.length) {
            vendegLemondasJelzesFrissitese();
            return;
        }

        elemek.vendegLemondasTudomasulvetel.disabled = true;
        onlineStatusz('Vendéglemondások tudomásulvételének mentése...');

        const { data, error } = await allapot.kliens
            .from('booking_events')
            .insert(
                olvasatlanFoglalasok.map((foglalas) => ({
                    booking_id: foglalas.id,
                    event_type: 'customer_cancellation_acknowledged',
                    channel: 'admin',
                    status: 'success',
                    title: 'Vendéglemondás tudomásul véve',
                    message: 'Az admin a lemondást átnézte és tudomásul vette.',
                    metadata: {}
                }))
            )
            .select('booking_id,created_at');

        if (error) {
            elemek.vendegLemondasTudomasulvetel.disabled = false;
            onlineStatusz('A tudomásulvételt nem sikerült elmenteni. Próbáld újra.', true);
            return;
        }

        const mentettIdopontok = new Map((data || []).map((esemeny) => [String(esemeny.booking_id), esemeny.created_at]));
        const most = new Date().toISOString();
        olvasatlanFoglalasok.forEach((foglalas) => {
            const bookingId = String(foglalas.id);
            const esemenyek = allapot.lemondasEsemenyek.get(bookingId) || {};
            esemenyek.tudomasulvetel = mentettIdopontok.get(bookingId) || most;
            allapot.lemondasEsemenyek.set(bookingId, esemenyek);
        });

        elemek.vendegLemondasTudomasulvetel.disabled = false;
        vendegLemondasJelzesFrissitese();
        await adminV2AttekintesFrissitese();
        onlineStatusz(olvasatlanFoglalasok.length + ' vendéglemondás tudomásul véve.');
    }

    function foglalasTabJelzesFrissitese() {
        vendegLemondasJelzesFrissitese();
        const tab = document.querySelector('.admin-tab[data-admin-tab="foglalasok"]');

        if (!tab) {
            return;
        }

        const darab = foglalasFuggobenDarab();
        let jelzes = tab.querySelector('.admin-tab-jelzes');

        tab.classList.toggle('admin-tab-jelzes-van', darab > 0);

        if (!darab) {
            jelzes?.remove();
            tab.removeAttribute('aria-label');
            return;
        }

        if (!jelzes) {
            jelzes = document.createElement('span');
            jelzes.className = 'admin-tab-jelzes';
            tab.appendChild(jelzes);
        }

        jelzes.textContent = darab > 99 ? '99+' : String(darab);
        tab.setAttribute('aria-label', `Foglal\u00e1sok, ${darab} f\u00fcgg\u0151ben`);
    }

    function normalizaltKereses(ertek) {
        return String(ertek || '')
            .toLocaleLowerCase('hu-HU')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    function csakSzamok(ertek) {
        return String(ertek || '').replace(/\D/g, '');
    }

    function listaOldalMeret(ertek, osszes) {
        if (ertek === 'all') return Math.max(1, osszes || 1);
        const szam = Number.parseInt(ertek, 10);
        return Number.isFinite(szam) && szam > 0 ? szam : 10;
    }

    function oldalmeretGombok(aktiv, adatNev) {
        return `<select class="admin-oldalmeret-select" data-${adatNev} aria-label="Oldalank\u00e9nt">
                ${[10, 20, 'all']
                    .map((ertek) => {
                        const cimke = ertek === 'all' ? '\u00d6sszes' : String(ertek);
                        const aktivE = String(aktiv) === String(ertek);
                        return `<option value="${ertek}" ${aktivE ? 'selected' : ''}>${cimke}</option>`;
                    })
                    .join('')}
            </select>`;
    }

    function foglalasOsszesOldal() {
        const lista = foglalasSzurtElemek();
        if (allapot.foglalasOldalMeret === 'all') return 1;
        return Math.max(1, Math.ceil(lista.length / listaOldalMeret(allapot.foglalasOldalMeret, lista.length)));
    }

    function foglalasLapozoHtml() {
        const lista = foglalasSzurtElemek();
        const osszes = foglalasOsszesOldal();
        const vanElem = lista.length > 0;
        const oldalSzoveg = vanElem ? `${allapot.foglalasOldal} / ${osszes}` : '0 / 0';
        return `
                <div class="admin-lapozo-nav" role="group" aria-label="Foglalások lapozása">
                    <button type="button" class="admin-pagination-button" data-foglalas-oldal="elozo" aria-label="Előző oldal" title="Előző oldal" ${allapot.foglalasOldal <= 1 || !vanElem ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"></path></svg>
                        <span>Előző</span>
                    </button>
                    <span class="admin-pagination-page" aria-label="${html(oldalSzoveg)}">${html(oldalSzoveg)}</span>
                    <button type="button" class="admin-pagination-button" data-foglalas-oldal="kovetkezo" aria-label="Következő oldal" title="Következő oldal" ${allapot.foglalasOldal >= osszes || !vanElem ? 'disabled' : ''}>
                        <span>Következő</span>
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 18 6-6-6-6"></path></svg>
                    </button>
                </div>
                <div class="admin-lapozo-jobb">
                    <label class="admin-oldalmeret admin-pagination-size">
                        <span>Oldalanként</span>
                        ${oldalmeretGombok(allapot.foglalasOldalMeret, 'foglalas-oldalmeret')}
                    </label>
                </div>
            `;
    }

    function foglalasLapozoRenderelese() {
        const elemek = adminElemek();
        const htmlTartalom = foglalasLapozoHtml();
        [elemek.foglalasLapozoFelso, elemek.foglalasLapozo].filter(Boolean).forEach((lapozo) => {
            lapozo.innerHTML = htmlTartalom;
        });
    }

    function foglalasLapozoKattintas(event) {
        const meretValaszto = event.target.closest('[data-foglalas-oldalmeret]');
        if (meretValaszto) {
            if (event.type === 'click' && meretValaszto.tagName === 'SELECT') {
                return;
            }

            const meretErtek = meretValaszto.dataset.foglalasOldalmeret || meretValaszto.value;
            allapot.foglalasOldalMeret = meretErtek === 'all' ? 'all' : Number.parseInt(meretErtek, 10);
            allapot.foglalasOldal = 1;
            foglalasListaRenderelese();
            return;
        }

        const gomb = event.target.closest('[data-foglalas-oldal]');

        if (!gomb) {
            return;
        }

        allapot.foglalasOldal += gomb.dataset.foglalasOldal === 'kovetkezo' ? 1 : -1;
        allapot.foglalasOldal = Math.min(Math.max(allapot.foglalasOldal, 1), foglalasOsszesOldal());
        foglalasListaRenderelese();
    }

    function esemenynaploBetoltese() {
        return adminKeresOsszevonasa('esemenynaploBetoltese', esemenynaploBetolteseLetoltese);
    }

    async function esemenynaploBetolteseLetoltese() {
        const ervenyes = adminKeresMunkamenetOr();
        const elemek = adminElemek();

        if (!elemek.esemenynaploLista) {
            return;
        }

        elemek.esemenynaploLista.innerHTML = '<p class="admin-ures">Eseménynapló betöltése...</p>';

        const { data, error } = await allapot.kliens
            .from('booking_events')
            .select(
                'id,booking_id,event_type,channel,status,title,message,metadata,created_at,bookings(customer_name,customer_email,customer_phone,starts_at)'
            )
            .neq('event_type', 'customer_cancellation_acknowledged')
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) {
            elemek.esemenynaploLista.innerHTML =
                '<p class="admin-ures">Az eseménynapló még nem érhető el. Futtasd a booking_events SQL-t Supabase-ben.</p>';
            return;
        }

        if (!ervenyes()) return false;
        allapot.esemenynaploElemek = Array.isArray(data) ? data : [];
        if (allapot.esemenynaploOldal > esemenynaploOsszesOldal()) {
            allapot.esemenynaploOldal = esemenynaploOsszesOldal();
        }
        esemenynaploRenderelese();
    }

    function esemenynaploRenderelese() {
        const elemek = adminElemek();

        if (!elemek.esemenynaploLista) {
            return;
        }

        elemek.esemenynaploLista.innerHTML = '';

        if (!allapot.esemenynaploElemek.length) {
            elemek.esemenynaploLista.innerHTML = '<p class="admin-ures">M\u00e9g nincs napl\u00f3zott foglal\u00e1si esem\u00e9ny.</p>';
            esemenynaploLapozoRenderelese();
            return;
        }

        const meret = listaOldalMeret(allapot.esemenynaploOldalMeret, allapot.esemenynaploElemek.length);
        const kezd = allapot.esemenynaploOldalMeret === 'all' ? 0 : (allapot.esemenynaploOldal - 1) * meret;
        const oldalElemek =
            allapot.esemenynaploOldalMeret === 'all' ? allapot.esemenynaploElemek : allapot.esemenynaploElemek.slice(kezd, kezd + meret);

        oldalElemek.forEach((esemeny) => {
            const kartya = document.createElement('article');
            kartya.className = `admin-db-kartya admin-esemeny-kartya admin-esemeny-${html(esemeny.status || 'info')}`;
            const foglalasNev = esemeny.bookings?.customer_name || '';
            const foglalasIdo = esemeny.bookings?.starts_at ? datumIdoRovid(esemeny.bookings.starts_at) : '';

            kartya.innerHTML = `
                    <div class="admin-db-kartya-fej">
                        <div>
                            <p class="admin-esemeny-idopont">${html(datumIdoRovid(esemeny.created_at))}</p>
                            <h3>${html(esemeny.title || esemenyTipusFelirat(esemeny.event_type))}</h3>
                        </div>
                        <span class="admin-esemeny-statusz">${html(esemenyStatuszFelirat(esemeny.status))}</span>
                    </div>
                    <div class="admin-esemeny-reszletek">
                        ${foglalasNev ? `<p><strong>Foglal\u00e1s:</strong> ${html(foglalasNev)}${foglalasIdo ? ` - ${html(foglalasIdo)}` : ''}</p>` : ''}
                        ${esemeny.message ? `<p>${html(esemeny.message)}</p>` : ''}
                        <p class="admin-esemeny-meta">${html([esemeny.channel, esemeny.event_type].filter(Boolean).join(' / '))}</p>
                    </div>
                `;

            elemek.esemenynaploLista.appendChild(kartya);
        });

        esemenynaploLapozoRenderelese();
    }

    function aktualisEsemenyExportAdatok() {
        if(Array.isArray(allapot.referenceExportEvents))return allapot.referenceExportEvents;
        return aktualisListaOldal(allapot.esemenynaploElemek, allapot.esemenynaploOldal, allapot.esemenynaploOldalMeret).map((esemeny) => ({
            ...esemeny
        }));
    }

    function aktualisListaOldal(lista, oldal, oldalMeret) {
        if (oldalMeret === 'all') {
            return lista.slice();
        }

        const meret = listaOldalMeret(oldalMeret, lista.length);
        const kezd = Math.max(0, (oldal - 1) * meret);
        return lista.slice(kezd, kezd + meret);
    }

    function esemenynaploOsszesOldal() {
        if (allapot.esemenynaploOldalMeret === 'all') return 1;
        return Math.max(
            1,
            Math.ceil(allapot.esemenynaploElemek.length / listaOldalMeret(allapot.esemenynaploOldalMeret, allapot.esemenynaploElemek.length))
        );
    }

    function esemenynaploLapozoHtml() {
        const osszes = esemenynaploOsszesOldal();
        const vanElem = allapot.esemenynaploElemek.length > 0;
        const oldalSzoveg = vanElem ? `${allapot.esemenynaploOldal} / ${osszes}` : '0 / 0';
        return `
                <div class="admin-lapozo-nav" role="group" aria-label="Eseménynapló lapozása">
                    <button type="button" class="admin-pagination-button" data-esemenynaplo-oldal="elozo" aria-label="Előző oldal" title="Előző oldal" ${allapot.esemenynaploOldal <= 1 || !vanElem ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"></path></svg>
                        <span>Előző</span>
                    </button>
                    <span class="admin-pagination-page" aria-label="${html(oldalSzoveg)}">${html(oldalSzoveg)}</span>
                    <button type="button" class="admin-pagination-button" data-esemenynaplo-oldal="kovetkezo" aria-label="Következő oldal" title="Következő oldal" ${allapot.esemenynaploOldal >= osszes || !vanElem ? 'disabled' : ''}>
                        <span>Következő</span>
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 18 6-6-6-6"></path></svg>
                    </button>
                </div>
                <div class="admin-lapozo-jobb">
                    <label class="admin-oldalmeret admin-pagination-size">
                        <span>Oldalanként</span>
                        ${oldalmeretGombok(allapot.esemenynaploOldalMeret, 'esemenynaplo-oldalmeret')}
                    </label>
                </div>
            `;
    }

    function esemenynaploLapozoRenderelese() {
        const elemek = adminElemek();
        const htmlTartalom = esemenynaploLapozoHtml();
        [elemek.esemenynaploLapozoFelso, elemek.esemenynaploLapozo].filter(Boolean).forEach((lapozo) => {
            lapozo.innerHTML = htmlTartalom;
        });
    }

    function esemenynaploLapozoKattintas(event) {
        const meretValaszto = event.target.closest('[data-esemenynaplo-oldalmeret]');
        if (meretValaszto) {
            if (event.type === 'click' && meretValaszto.tagName === 'SELECT') {
                return;
            }

            const meretErtek = meretValaszto.dataset.esemenynaploOldalmeret || meretValaszto.value;
            allapot.esemenynaploOldalMeret = meretErtek === 'all' ? 'all' : Number.parseInt(meretErtek, 10);
            allapot.esemenynaploOldal = 1;
            esemenynaploRenderelese();
            return;
        }

        const gomb = event.target.closest('[data-esemenynaplo-oldal]');
        if (!gomb) return;

        allapot.esemenynaploOldal += gomb.dataset.esemenynaploOldal === 'kovetkezo' ? 1 : -1;
        allapot.esemenynaploOldal = Math.min(Math.max(allapot.esemenynaploOldal, 1), esemenynaploOsszesOldal());
        esemenynaploRenderelese();
    }

    function esemenyStatuszFelirat(statusz) {
        return (
            {
                success: 'Sikeres',
                warning: 'Figyelmeztetés',
                error: 'Hiba',
                info: 'Infó'
            }[statusz] || 'Infó'
        );
    }

    function esemenyTipusFelirat(tipus) {
        return (
            {
                booking_created: 'Foglalás rögzítve',
                owner_email: 'Tulaj email',
                customer_email: 'Vendég email',
                email_flow_failed: 'Email folyamat hiba',
                admin_update_email: 'Módosítás email',
                booking_reminder_email: 'Emlékeztető email',
                booking_review_request_email: 'Értékeléskérő email',
                customer_cancelled: 'A vendég mondta le',
                inspiration_deleted: 'Inspiráció törölve'
            }[tipus] || 'Esemény'
        );
    }

    function foglalasKartyaIdopont(kezdes, vege) {
        const datum = datumIdoRovid(kezdes).split(' ')[0];

        return `
                <p class="admin-foglalas-idopont">
                    <span class="admin-foglalas-datum">${html(datum)}</span>
                    <span class="admin-foglalas-ido">${html(datumIdoRovid(kezdes, true))} – ${html(datumIdoRovid(vege, true))}</span>
                </p>
            `;
    }

    function fizetettOsszegInputErtek(ertek) {
        if (ertek === null || ertek === undefined || ertek === '') return '';
        const osszeg = Number(ertek);
        return Number.isInteger(osszeg) && osszeg >= 0 ? String(osszeg) : '';
    }

    function fizetettOsszegFelirat(ertek) {
        const inputErtek = fizetettOsszegInputErtek(ertek);
        return inputErtek === '' ? 'Nincs rögzítve' : `${inputErtek.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft`;
    }

    function fizetettOsszegMezoHtml(azonosito, ertek, opciok = {}) {
        const hibaId = `admin-fizetett-osszeg-hiba-${azonosito}`;
        const szelesOsztaly = opciok.szeles === false ? '' : ' admin-mezo-szeles';
        const cimke = opciok.cimke || 'Fizetett összeg (Ft)';
        return `<label class="admin-mezo${szelesOsztaly} admin-fizetett-osszeg-mezo">
                ${html(cimke)}
                <input type="number" min="0" max="2147483647" step="1" inputmode="numeric" data-idopont-mezo="paid_amount" value="${attr(fizetettOsszegInputErtek(ertek))}" aria-describedby="${attr(hibaId)}" disabled>
                <small id="${attr(hibaId)}" class="admin-fizetett-osszeg-seged">Üresen hagyva nincs még fizetés rögzítve.</small>
            </label>`;
    }

    function fizetettOsszegAdatok(kartya) {
        const mezo = idopontMezo(kartya, 'paid_amount');
        const seged = kartya?.querySelector('.admin-fizetett-osszeg-seged');
        const nyersErtek = String(mezo?.value || '').trim();
        const ervenyes = nyersErtek === '' || (/^\d+$/.test(nyersErtek) && Number(nyersErtek) <= 2147483647);
        const hiba = ervenyes ? '' : 'Adj meg egy 0 vagy annál nagyobb egész forintösszeget.';

        if (mezo) {
            mezo.setAttribute('aria-invalid', String(Boolean(hiba)));
        }
        if (seged) {
            seged.textContent = hiba || 'Üresen hagyva nincs még fizetés rögzítve.';
            seged.classList.toggle('admin-fizetett-osszeg-hiba', Boolean(hiba));
        }

        return {
            ertek: nyersErtek === '' ? null : Number(nyersErtek),
            hiba
        };
    }

    function foglalasKartya(foglalas) {
        const kartya = document.createElement('article');
        const fuggoben = foglalasFuggoben(foglalas);
        const statuszOsztaly = String(foglalas.status || 'pending').replace(/[^a-z_]/g, '');
        kartya.className = `admin-db-kartya admin-foglalas-kartya admin-foglalas-statusz-${statuszOsztaly}${fuggoben ? ' admin-foglalas-fuggoben' : ''}`;
        kartya.dataset.id = foglalas.id;
        kartya.dataset.tipus = 'booking';
        kartya.dataset.eredetiStatusz = foglalas.status || '';
        kartya.dataset.eredetiDatum = datumInputErtek(foglalas.starts_at);
        kartya.dataset.eredetiKezdes = idoInputErtek(foglalas.starts_at);
        kartya.dataset.eredetiVege = idoInputErtek(foglalas.ends_at);
        kartya.dataset.eredetiFizetettOsszeg = fizetettOsszegInputErtek(foglalas.paid_amount);
        const inspiracioKepek = foglalasInspiracioKepek(foglalas);
        const kuponKod = foglalasKuponKod(foglalas);
        const megjegyzes = foglalasMegjegyzesMegjelenites(foglalas);
        const koromStilus = foglalasKoromStilusMegjelenites(foglalas);
        const lemondasiMegjegyzes = vendegLemondasMegjegyzese(foglalas);
        const foglalasAzonosito = String(foglalas.public_reference || '').trim();
        kartya.dataset.inspiracioKepek = JSON.stringify(inspiracioKepek);

        kartya.innerHTML = `
                <div class="admin-db-kartya-fej">
                    <div class="admin-foglalas-fosor">
                        <div class="admin-foglalas-nev-blokk">
                            <p class="admin-kartya-tipus admin-foglalas-azonosito${foglalasAzonosito ? '' : ' hianyzo'}" aria-label="Foglalási azonosító: ${attr(foglalasAzonosito || 'még nincs')}"><code>${html(foglalasAzonosito || 'Azonosító nélkül')}</code></p>
                            <h3>${html(foglalas.customer_name)}</h3>
                            <p class="admin-foglalas-rovid-szolgaltatas">${html(foglalas.services?.name || 'Törölt szolgáltatás')}</p>
                        </div>
                        ${foglalasKartyaIdopont(foglalas.starts_at, foglalas.ends_at)}
                    </div>
                    <div class="admin-foglalas-vezerlok">
                        <select class="admin-db-statusz admin-db-statusz--foglalas" data-foglalas-statusz disabled>
                            ${statuszOption('pending', 'Függőben', foglalas.status)}
                            ${statuszOption('confirmed', 'Visszaigazolva', foglalas.status)}
                            ${statuszOption('done', 'Teljesítve', foglalas.status)}
                            ${statuszOption('cancelled', 'Általam lemondva', foglalas.status)}
                            ${statuszOption('cancelled_by_customer', 'Vendég mondta le', foglalas.status)}
                        </select>
                        <button type="button" class="admin-booking-details-trigger" data-foglalas-reszletek aria-expanded="false">Részletek</button>
                        <button type="button" class="admin-booking-icon-button admin-control-icon-button" data-foglalas-szerkesztes>Szerkesztés</button>
                    </div>
                </div>
                ${
                    lemondasiMegjegyzes
                        ? `
                    <p class="admin-foglalas-lemondasi-megjegyzes">
                        <strong>Lemondási megjegyzés</strong>
                        <span>${html(lemondasiMegjegyzes)}</span>
                    </p>
                `
                        : ''
                }
                <div class="admin-foglalas-reszletek admin-foglalas-reszletek-kompakt">
                    <div class="admin-foglalas-meta-grid">
                        <p class="admin-foglalas-meta-szolgaltatas"><strong>Szolgáltatás</strong><span>${html(foglalas.services?.name || 'Törölt szolgáltatás')}</span></p>
                        <p class="admin-foglalas-meta-leadva"><strong>Leadva</strong><span>${html(datumIdoRovid(foglalas.created_at))}</span></p>
                        <p class="admin-foglalas-meta-email"><strong>Email</strong><a href="mailto:${html(foglalas.customer_email)}">${html(foglalas.customer_email)}</a></p>
                        <p class="admin-foglalas-meta-telefon"><strong>Tel</strong><a href="tel:${html(foglalas.customer_phone.replace(/\s/g, ''))}">${html(foglalas.customer_phone)}</a></p>
                        <p class="admin-foglalas-meta-fizetett"><strong>Fizetett összeg</strong><span>${html(fizetettOsszegFelirat(foglalas.paid_amount))}</span></p>
                    </div>
                    ${koromStilus ? `<p class="admin-foglalas-reszlet-sor admin-foglalas-reszlet-szeles admin-foglalas-korom-stilus"><strong>Köröm stílus</strong><span>${html(koromStilus)}</span></p>` : ''}
                    ${megjegyzes ? `<p class="admin-foglalas-reszlet-sor admin-foglalas-reszlet-szeles admin-foglalas-megjegyzes"><strong>Megjegyzés</strong><span>${html(megjegyzes)}</span></p>` : ''}
                    ${kuponKod ? `<p class="admin-foglalas-reszlet-sor admin-foglalas-reszlet-szeles admin-foglalas-kupon"><strong>Kupon</strong><span>${html(kuponKod)}</span></p>` : ''}
                    ${inspiracioKepek.length ? `<p class="admin-foglalas-reszlet-sor admin-foglalas-reszlet-szeles"><strong>Inspiráció</strong><span class="admin-inspiracio-akciok"><button type="button" class="admin-inspiracio-link" data-inspiracio-megnyitas>${inspiracioKepek.length} kép megnyitása</button><button type="button" class="admin-kis-gomb admin-veszely-gomb admin-inspiracio-torles" data-inspiracio-torles>Képek törlése</button></span></p>` : ''}
                </div>            <div class="admin-idopont-szerkeszto">
                    <label class="admin-mezo">Dátum<input type="date" data-idopont-mezo="date" value="${attr(datumInputErtek(foglalas.starts_at))}" disabled></label>
                    <label class="admin-mezo">Kezdés<input type="time" data-idopont-mezo="start_time" value="${attr(idoInputErtek(foglalas.starts_at))}" disabled></label>
                    <label class="admin-mezo">Vége<input type="time" data-idopont-mezo="end_time" value="${attr(idoInputErtek(foglalas.ends_at))}" disabled></label>
                    ${fizetettOsszegMezoHtml(foglalas.id, foglalas.paid_amount)}
                    <label class="admin-mezo admin-mezo-szeles">Üzenet az emailhez<textarea data-idopont-mezo="admin_message" placeholder="Opcionális. Lemondásnál vagy időpontmódosításnál bekerül a vendég emailjébe." disabled></textarea></label>
                </div>
                <div class="admin-db-akciok">
                    <button type="button" class="admin-kis-gomb admin-veszely-gomb" data-foglalas-torles>Eltávolítás</button>
                </div>
            `;

        adminStudioFoglalasKartyaJelzes(kartya, foglalas);
        return kartya;
    }

    function foglalasKuponKod(foglalas) {
        const direktKod = String(foglalas?.coupon_code || '').trim();
        if (direktKod) return direktKod.toUpperCase();

        const note = String(foglalas?.note || '');
        const talalat = note.match(/(?:^|\n)Kupon:\s*([A-Z0-9_-]+)/i);
        return talalat?.[1] ? talalat[1].toUpperCase() : '';
    }

    function foglalasKoromStilusMegjelenites(foglalas) {
        const direktStilus = String(foglalas?.nail_style || '').trim();
        if (direktStilus) return direktStilus;

        const noteSorok = String(foglalas?.note || '')
            .split(/\r?\n/)
            .map((sor) => sor.trim())
            .filter(Boolean);
        const stilusSor = noteSorok.find((sor) => /^Köröm stílus:/i.test(sor));
        return stilusSor ? stilusSor.replace(/^Köröm stílus:\s*/i, '').trim() : '';
    }

    function foglalasMegjegyzesMegjelenites(foglalas) {
        const note = String(foglalas?.note || '').trim();
        const stilusMegjegyzes = String(foglalas?.nail_style_note || '').trim();

        const tisztitottNote = note
            .split(/\r?\n/)
            .map((sor) => sor.trim())
            .filter((sor) => sor && !/^(Kupon:|Alap\u00e1r:|Kedvezm\u00e9ny:|V\u00e9g\u00f6sszeg:)/i.test(sor) && !/^Köröm stílus:/i.test(sor))
            .join(' ')
            .replace(/\s*Kupon:\s*[A-Z0-9_-]+(?:\s*\([^)]*\))?(?:\s*Alap\u00e1r:[\s\S]*)?$/i, '')
            .replace(/\s*Alap\u00e1r:\s*[\s\S]*$/i, '')
            .replace(/\s*Kedvezm\u00e9ny:\s*[\s\S]*$/i, '')
            .replace(/\s*V\u00e9g\u00f6sszeg:\s*[\s\S]*$/i, '')
            .replace(/\s{2,}/g, ' ')
            .trim();

        return [stilusMegjegyzes, tisztitottNote]
            .filter(Boolean)
            .filter((ertek, index, lista) => lista.indexOf(ertek) === index)
            .join(' · ');
    }

    async function foglalasInspiracioLinkekAlairasa(foglalasok) {
        const masolatok = foglalasok.map((foglalas) => ({
            ...foglalas,
            inspiration_images: Array.isArray(foglalas.inspiration_images)
                ? foglalas.inspiration_images.map((kep) => ({ ...kep }))
                : foglalas.inspiration_images
        }));
        const bucketBejegyzesek = new Map();

        masolatok.forEach((foglalas, foglalasIndex) => {
            if (!Array.isArray(foglalas.inspiration_images)) return;

            foglalas.inspiration_images.forEach((kep, kepIndex) => {
                const bucket = inspiracioKepStorageBucket(kep);
                const path = inspiracioKepStoragePath(kep);
                if (bucket !== 'booking-inspirations' || !path) return;
                if (!bucketBejegyzesek.has(bucket)) bucketBejegyzesek.set(bucket, []);
                bucketBejegyzesek.get(bucket).push({ foglalasIndex, kepIndex, path });
            });
        });

        for (const [bucket, bejegyzesek] of bucketBejegyzesek) {
            const { data, error } = await allapot.kliens.storage.from(bucket).createSignedUrls(
                bejegyzesek.map((bejegyzes) => bejegyzes.path),
                3600
            );

            if (error) {
                console.warn('Inspirációs képek ideiglenes linkje nem készült el:', error);
                continue;
            }

            bejegyzesek.forEach((bejegyzes, index) => {
                const signedUrl = data?.[index]?.signedUrl || '';
                if (signedUrl) {
                    masolatok[bejegyzes.foglalasIndex].inspiration_images[bejegyzes.kepIndex].url = signedUrl;
                }
            });
        }

        return masolatok;
    }

    function foglalasInspiracioKepek(foglalas) {
        const kepek = [];
        const ujKepek = Array.isArray(foglalas.inspiration_images) ? foglalas.inspiration_images : [];

        ujKepek.forEach((kep) => {
            if (kep?.url) {
                kepek.push({
                    url: kep.url,
                    path: kep.path || '',
                    name: kep.name || 'Inspirációs kép',
                    bucket: kep.bucket || inspiracioKepStorageBucket(kep)
                });
            }
        });

        if (!kepek.length && foglalas.inspiration_image_url) {
            kepek.push({
                url: foglalas.inspiration_image_url,
                path: foglalas.inspiration_image_path || '',
                name: foglalas.inspiration_image_name || 'Inspirációs kép',
                bucket: 'site-media'
            });
        }

        return kepek;
    }

    function inspiracioKepekKartyan(kartya) {
        try {
            const kepek = JSON.parse(kartya?.dataset.inspiracioKepek || '[]');
            return Array.isArray(kepek) ? kepek : [];
        } catch (_error) {
            return [];
        }
    }

    function inspiracioKepStoragePath(kep) {
        if (kep?.path) return kep.path;
        if (!kep?.url) return '';

        try {
            const url = new URL(kep.url, window.location.origin);
            const marker = '/storage/v1/object/public/site-media/';
            const index = url.pathname.indexOf(marker);
            if (index === -1) return '';
            return decodeURIComponent(url.pathname.slice(index + marker.length));
        } catch (_error) {
            return '';
        }
    }

    function inspiracioKepStorageBucket(kep) {
        const explicitBucket = String(kep?.bucket || '').trim();
        if (explicitBucket) return explicitBucket;

        try {
            const url = new URL(kep?.url || '', window.location.origin);
            if (url.pathname.includes('/storage/v1/object/public/site-media/')) return 'site-media';
        } catch (_error) {
            // A régi rekordok a nyilvános site-media bucketben vannak.
        }

        return 'site-media';
    }

    function inspiracioModalNyitasa(kartya) {
        const kepek = inspiracioKepekKartyan(kartya);
        if (!kepek.length) return;

        let modal = document.getElementById('admin-inspiracio-modal');
        if (!modal) {
            modal = document.createElement('dialog');
            modal.id = 'admin-inspiracio-modal';
            modal.className = 'admin-inspiracio-modal';
            modal.setAttribute('aria-label', 'Inspirációs képek');
            modal.addEventListener('cancel', (event) => {
                event.preventDefault();
                event.stopPropagation();
                inspiracioModalBezarasa();
            });
            document.body.appendChild(modal);
            modal.addEventListener('click', (event) => {
                if (event.target === modal || event.target.closest('[data-inspiracio-bezaras]')) {
                    inspiracioModalBezarasa();
                }
            });
        }

        modal.innerHTML = `
                <div class="admin-inspiracio-modal-doboz" role="dialog" aria-modal="true" aria-label="Inspirációs képek">
                    <div class="admin-inspiracio-modal-fejlec">
                        <h3>Inspirációs képek</h3>
                        <button type="button" class="admin-inspiracio-bezaras" data-inspiracio-bezaras aria-label="Bezárás">×</button>
                    </div>
                    <div class="admin-inspiracio-modal-racs">
                        ${kepek.map((kep) => `<figure><img src="${attr(kep.url)}" alt="${attr(kep.name || 'Inspirációs kép')}"><figcaption>${html(kep.name || 'Inspirációs kép')}</figcaption></figure>`).join('')}
                    </div>
                </div>
            `;
        modal.hidden = false;
        modal.showModal();
        document.body.classList.add('admin-modal-nyitva');
    }

    function inspiracioModalBezarasa() {
        const modal = document.getElementById('admin-inspiracio-modal');
        if (modal) {
            modal.hidden = true;
            modal.close();
        }
        document.body.classList.remove('admin-modal-nyitva');
    }

    function tiltasFoglalasKartya(tiltas) {
        const kartya = document.createElement('article');
        const statusz = tiltasStatuszErtek(tiltas.status);
        kartya.className = `admin-db-kartya admin-foglalas-kartya admin-db-kartya-tiltas admin-foglalas-statusz-${statusz}${statusz === 'done' ? ' admin-tiltas-kesz' : ''}${statusz === 'cancelled_by_customer' ? ' admin-tiltas-lemondva' : ''}`;
        kartya.dataset.id = tiltas.id;
        kartya.dataset.tipus = 'blocked';
        kartya.dataset.eredetiStatusz = statusz;
        const megjegyzes = tiltas.reason?.trim() || 'Kézi foglalás';
        const szolgaltatas = keziSzolgaltatasNev(tiltas);
        kartya.dataset.szolgaltatasNev = szolgaltatas;
        kartya.dataset.eredetiDatum = datumInputErtek(tiltas.starts_at);
        kartya.dataset.eredetiKezdes = idoInputErtek(tiltas.starts_at);
        kartya.dataset.eredetiVege = idoInputErtek(tiltas.ends_at);
        kartya.dataset.eredetiReason = megjegyzes;
        kartya.dataset.eredetiFizetettOsszeg = fizetettOsszegInputErtek(tiltas.paid_amount);
        kartya.innerHTML = `
                <div class="admin-db-kartya-fej">
                    <div class="admin-foglalas-fosor">
                        <div class="admin-foglalas-nev-blokk">
                            <p class="admin-kartya-tipus admin-foglalas-azonosito" aria-label="Kézzel felvett idő"><code>Kézzel felvett idő</code></p>
                            <h3>${html(megjegyzes)}</h3>
                            <p class="admin-foglalas-rovid-szolgaltatas">${szolgaltatas ? html(szolgaltatas) : '&nbsp;'}</p>
                        </div>
                        ${foglalasKartyaIdopont(tiltas.starts_at, tiltas.ends_at)}
                    </div>
                    <div class="admin-foglalas-vezerlok">
                        <select class="admin-db-statusz admin-db-statusz--foglalas" data-foglalas-statusz aria-label="Kézi idő státusza" disabled>
                            <option value="blocked" ${statusz === 'blocked' ? 'selected' : ''}>Foglalt</option>
                            <option value="done" ${statusz === 'done' ? 'selected' : ''}>Teljesítve</option>
                            <option value="cancelled_by_customer" ${statusz === 'cancelled_by_customer' ? 'selected' : ''}>Vendég mondta le</option>
                        </select>
                        <button type="button" class="admin-booking-details-trigger" data-foglalas-reszletek aria-expanded="false">Részletek</button>
                        <button type="button" class="admin-booking-icon-button admin-control-icon-button admin-kezi-ido-naptar" data-kezi-ido-naptar>Naptárba</button>
                        <button type="button" class="admin-booking-icon-button admin-control-icon-button" data-foglalas-szerkesztes>Szerkesztés</button>
                    </div>
                </div>
                <div class="admin-foglalas-reszletek admin-foglalas-reszletek-kompakt">
                    <div class="admin-foglalas-meta-grid">
                        <p class="admin-foglalas-meta-szolgaltatas"><strong>Szolgáltatás</strong><span>${szolgaltatas ? html(szolgaltatas) : 'Nincs szolgáltatás'}</span></p>
                        <p class="admin-foglalas-meta-fizetett"><strong>Fizetett összeg</strong><span>${html(fizetettOsszegFelirat(tiltas.paid_amount))}</span></p>
                    </div>
                </div>
                <div class="admin-idopont-szerkeszto">
                    <label class="admin-mezo">Dátum<input type="date" data-idopont-mezo="date" value="${attr(datumInputErtek(tiltas.starts_at))}" disabled></label>
                    <label class="admin-mezo">Kezdés<input type="time" data-idopont-mezo="start_time" value="${attr(idoInputErtek(tiltas.starts_at))}" disabled></label>
                    <label class="admin-mezo">Vége<input type="time" data-idopont-mezo="end_time" value="${attr(idoInputErtek(tiltas.ends_at))}" disabled></label>
                    <div class="admin-kezi-foglalas-also-sor">
                        <label class="admin-mezo">Név / megjegyzés<input type="text" data-idopont-mezo="reason" value="${attr(megjegyzes)}" required disabled></label>
                        ${fizetettOsszegMezoHtml(tiltas.id, tiltas.paid_amount, { szeles: false, cimke: 'Összeg (Ft)' })}
                    </div>
                </div>
                <div class="admin-db-akciok">
                    <button type="button" class="admin-kis-gomb admin-veszely-gomb" data-foglalas-torles>Eltávolítás</button>
                </div>
            `;

        adminStudioFoglalasKartyaJelzes(kartya, tiltas);
        return kartya;
    }
    function keziIdoNaptarMegnyitasa(kartya) {
        const adatok = idopontModositasAdatok(kartya);
        const cim = idopontMezo(kartya, 'reason')?.value.trim() || 'Kézi foglalás';
        const szolgaltatas = kartya.dataset.szolgaltatasNev || '';

        if (adatok.hiba) {
            onlineStatusz(adatok.hiba, true);
            return;
        }

        const kezdes = new Date(adatok.startsAt);
        const vege = new Date(adatok.endsAt);
        const most = new Date();
        const azonosito = kartya.dataset.id || `${most.getTime()}-${Math.random().toString(36).slice(2, 10)}`;
        const ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Lumi Nails//Manual booking//HU',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-TIMEZONE:Europe/Budapest',
            'BEGIN:VEVENT',
            `UID:${adminIcsSzoveg(azonosito)}@luminails.hu`,
            `DTSTAMP:${adminIcsDatum(most)}`,
            `DTSTART:${adminIcsDatum(kezdes)}`,
            `DTEND:${adminIcsDatum(vege)}`,
            `SUMMARY:${adminIcsSzoveg([cim, szolgaltatas].filter(Boolean).join(' – '))}`,
            'STATUS:CONFIRMED',
            'TRANSP:OPAQUE',
            'END:VEVENT',
            'END:VCALENDAR',
            ''
        ].join('\r\n');
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fajlNev =
            cim
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLocaleLowerCase('hu-HU')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .slice(0, 48) || 'kezi-foglalas';

        link.href = url;
        link.download = `lumi-nails-${fajlNev}.ics`;
        link.hidden = true;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    }

    function adminIcsDatum(datum) {
        return datum
            .toISOString()
            .replace(/[-:]/g, '')
            .replace(/\.\d{3}Z$/, 'Z');
    }

    function adminIcsSzoveg(szoveg) {
        return String(szoveg || '')
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/,/g, '\\,')
            .replace(/;/g, '\\;');
    }

    function foglalasIdopontValtozott(kartya) {
        return (
            kartya.dataset.eredetiDatum !== idopontMezo(kartya, 'date')?.value ||
            kartya.dataset.eredetiKezdes !== idopontMezo(kartya, 'start_time')?.value ||
            kartya.dataset.eredetiVege !== idopontMezo(kartya, 'end_time')?.value
        );
    }

    function foglalasKartyaModosult(kartya, modositas) {
        if (
            kartya.dataset.eredetiStatusz !== modositas.status ||
            foglalasIdopontValtozott(kartya) ||
            kartya.dataset.eredetiFizetettOsszeg !== fizetettOsszegInputErtek(modositas.paid_amount)
        ) {
            return true;
        }

        return (
            kartya.dataset.tipus === 'blocked' && String(kartya.dataset.eredetiReason || '').trim() !== String(modositas.reason || '').trim()
        );
    }
    function ujAdminMuveletAzonosito() {
        if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    async function foglalasStatuszokMentese(opciok = {}) {
        if (adminStudioFizetesZarak.size) await Promise.all(adminStudioFizetesZarak.values());
        const kartyak = Array.from(adminStudioFoglalasKartyak.values()).filter(card=>!opciok.recordKeys||opciok.recordKeys.includes(`${card.dataset.tipus}:${card.dataset.id}`));

        if (!kartyak.length) {
            onlineStatusz('Nincs menthető foglalási bejegyzés ezen az oldalon.');
            return;
        }

        onlineStatusz('Foglalási módosítások ellenőrzése...');

        const valtozasok = [];

        for (const kartya of kartyak) {
            const adatok = idopontModositasAdatok(kartya);
            const fizetettOsszeg = fizetettOsszegAdatok(kartya);

            if (adatok.hiba) {
                onlineStatusz(adatok.hiba, true);
                return;
            }
            if (fizetettOsszeg.hiba) {
                onlineStatusz(fizetettOsszeg.hiba, true);
                idopontMezo(kartya, 'paid_amount')?.focus();
                return;
            }

            const modositas =
                kartya.dataset.tipus === 'blocked'
                    ? {
                          status: tiltasStatuszErtek(kartya.querySelector('[data-foglalas-statusz]')?.value),
                          starts_at: adatok.startsAt,
                          ends_at: adatok.endsAt,
                          reason: idopontMezo(kartya, 'reason')?.value.trim(),
                          paid_amount: fizetettOsszeg.ertek
                      }
                    : {
                          status: kartya.querySelector('[data-foglalas-statusz]').value,
                          starts_at: adatok.startsAt,
                          ends_at: adatok.endsAt,
                          paid_amount: fizetettOsszeg.ertek
                      };

            if (
                modositas.paid_amount !== null &&
                kartya.dataset.eredetiFizetettOsszeg !== fizetettOsszegInputErtek(modositas.paid_amount) &&
                modositas.status === kartya.dataset.eredetiStatusz &&
                (modositas.status === 'confirmed' || (kartya.dataset.tipus === 'blocked' && modositas.status === 'blocked'))
            )
                modositas.status = 'done';
            if (!foglalasKartyaModosult(kartya, modositas)) {
                continue;
            }

            const utkozesHiba = await idopontUtkozesHiba({
                tipus: kartya.dataset.tipus,
                id: kartya.dataset.id,
                nev: kartya.dataset.tipus === 'blocked' ? modositas.reason : kartya.querySelector('h3')?.textContent?.trim(),
                startsAt: adatok.startsAt,
                endsAt: adatok.endsAt,
                statusz: modositas.status
            });

            if (utkozesHiba) {
                onlineStatusz(utkozesHiba, true);
                return;
            }

            const emailModositas = kartya.dataset.tipus === 'booking' ? foglalasEmailModositas(kartya, modositas) : null;

            valtozasok.push({
                kartya,
                modositas,
                emailModositas,
                inspiraciotTorol:
                    kartya.dataset.tipus === 'booking' && ['done', 'cancelled', 'cancelled_by_customer'].includes(modositas.status)
            });
        }

        if (!valtozasok.length) {
            onlineStatusz('Nem történt módosítás.');
            return;
        }

        onlineStatusz('Foglalási módosítások mentése...');

        const rpcChanges = valtozasok.map(({ kartya, modositas, emailModositas }) => ({
            id: kartya.dataset.id,
            type: kartya.dataset.tipus,
            status: modositas.status,
            starts_at: modositas.starts_at,
            ends_at: modositas.ends_at,
            reason: modositas.reason || '',
            paid_amount: modositas.paid_amount,
            email_notification: emailModositas
        }));
        const muveletUjjlenyomat = JSON.stringify(rpcChanges);
        const elozoMuvelet = allapot.foglalasMentesMuvelet;
        const operationId = elozoMuvelet?.ujjlenyomat === muveletUjjlenyomat ? elozoMuvelet.id : ujAdminMuveletAzonosito();
        allapot.foglalasMentesMuvelet = {
            id: operationId,
            ujjlenyomat: muveletUjjlenyomat
        };

        const { data, error } = await allapot.kliens.rpc('apply_admin_booking_changes', {
            p_operation_id: operationId,
            p_changes: rpcChanges
        });

        if (error) {
            const uzenet = String(error.message || '');
            if (/ütközik|utkozik|szünet|szunet|exclusion/i.test(uzenet)) {
                onlineStatusz(
                    'Nem sikerült menteni: az egyik módosított időpont ütközik egy másik foglalással vagy a kötelező szünettel.',
                    true
                );
                return;
            }
            onlineStatusz(`Egyetlen módosítás sem lett mentve. ${uzenet}`, true);
            return;
        }

        allapot.foglalasMentesMuvelet = null;
        let kepTorlesHibak = 0;
        for (const valtozas of valtozasok) {
            if (!valtozas.inspiraciotTorol) continue;
            const kepekTorolve = await foglalasInspiraciokTorlese(valtozas.kartya);
            if (!kepekTorolve) kepTorlesHibak += 1;
        }

        const emailJobs = Array.isArray(data?.email_jobs) ? data.email_jobs : [];
        let emailAzonnalElkuldve = 0;
        let emailUjraprobalasraVar = 0;

        for (const job of emailJobs) {
            const eredmeny = await foglalasModositasEmailKuldese(job.booking_id, job.id);
            if (eredmeny.ok) {
                emailAzonnalElkuldve += 1;
            } else {
                emailUjraprobalasraVar += 1;
            }
        }

        if (kepTorlesHibak > 0) {
            onlineStatusz(`A módosítások mentve, de ${kepTorlesHibak} foglalás inspirációs képeit nem sikerült törölni.`, true);
        } else if (emailUjraprobalasraVar > 0) {
            onlineStatusz(`A módosítások mentve. ${emailUjraprobalasraVar} email automatikus újrapróbálásra vár.`);
        } else if (emailAzonnalElkuldve > 0) {
            onlineStatusz(`Foglalási módosítások mentve, ${emailAzonnalElkuldve} email értesítés elküldve.`);
        } else {
            onlineStatusz('Foglalási módosítások mentve. A szabad idősávok ehhez igazodnak.');
        }

        const savedMessage = document.getElementById('admin-online-status').textContent;
        adminStudioFoglalasKartyak.clear();
        await Promise.all([foglalasokBetoltese(), esemenynaploBetoltese()]);
        onlineStatusz(savedMessage);
        adminStudioMentesJelzes();
    }

    async function foglalasInspiraciokTorlese(kartya, opciok = {}) {
        const kepek = inspiracioKepekKartyan(kartya);
        const pathsByBucket = new Map();
        kepek.forEach((kep) => {
            const path = inspiracioKepStoragePath(kep);
            if (!path) return;
            const bucket = inspiracioKepStorageBucket(kep);
            if (!pathsByBucket.has(bucket)) pathsByBucket.set(bucket, new Set());
            pathsByBucket.get(bucket).add(path);
        });
        const mezokUritese = opciok.mezokUritese !== false;

        if (!kepek.length) return true;

        if (!pathsByBucket.size) {
            console.warn('Inspirációs kép van a foglaláson, de nincs törölhető Storage path.');
            return false;
        }

        for (const [bucket, pathSet] of pathsByBucket) {
            const { error: torlesHiba } = await allapot.kliens.storage.from(bucket).remove(Array.from(pathSet));

            if (torlesHiba) {
                console.warn('Inspirációs képek Storage törlése nem sikerült:', {
                    bucket,
                    error: torlesHiba
                });
                return false;
            }
        }

        if (!mezokUritese) {
            kartya.dataset.inspiracioKepek = '[]';
            kartya.querySelector('[data-inspiracio-megnyitas]')?.closest('p')?.remove();
            return true;
        }

        try {
            const { error } = await allapot.kliens.rpc('clear_booking_inspiration', {
                p_booking_id: kartya.dataset.id
            });

            if (error) {
                console.warn('Inspirációs képmezők ürítése nem sikerült:', error);
                return false;
            }

            kartya.dataset.inspiracioKepek = '[]';
            kartya.querySelector('[data-inspiracio-megnyitas]')?.closest('p')?.remove();
            return true;
        } catch (error) {
            console.warn('Inspirációs képtakarítás hiba:', error);
            return false;
        }
    }

    function foglalasEmailModositas(kartya, modositas) {
        const statuszValtozott = kartya.dataset.eredetiStatusz !== modositas.status;
        const idopontValtozott = foglalasIdopontValtozott(kartya);

        if (!statuszValtozott && !idopontValtozott) {
            return null;
        }

        if (modositas.status === 'cancelled_by_customer') {
            return null;
        }

        if (statuszValtozott && modositas.status === 'done' && !idopontValtozott) {
            return null;
        }

        return {
            status_changed: statuszValtozott,
            time_changed: idopontValtozott,
            status: modositas.status,
            message: idopontMezo(kartya, 'admin_message')?.value.trim() || ''
        };
    }

    async function foglalasEsemenyRogzitese(bookingId, esemeny) {
        if (!bookingId) {
            return;
        }

        const { error } = await allapot.kliens.from('booking_events').insert({
            booking_id: bookingId,
            event_type: esemeny.event_type,
            channel: esemeny.channel || 'admin',
            status: esemeny.status || 'info',
            title: esemeny.title || 'Admin esemény',
            message: esemeny.message || '',
            metadata: esemeny.metadata || {}
        });

        if (error) {
            console.warn('Lumi Nails eseménynapló mentési hiba:', error);
        }
    }

    async function foglalasModositasEmailKuldese(bookingId, emailJobId) {
        if (!bookingId || !emailJobId || !allapot.kliens.functions?.invoke) {
            return { ok: false, skipped: true };
        }

        try {
            const invokeOptions = {
                body: {
                    booking_id: bookingId,
                    email_job_id: emailJobId
                }
            };

            if (allapot.session?.access_token) {
                invokeOptions.headers = {
                    Authorization: `Bearer ${allapot.session.access_token}`
                };
            }

            const { data, error } = await allapot.kliens.functions.invoke('send-booking-update-email', invokeOptions);

            if (error) {
                console.warn('Lumi Nails módosítás email hiba:', error);
                return { ok: false, error };
            }

            return data || { ok: false };
        } catch (error) {
            console.warn('Lumi Nails módosítás email hiba:', error);
            return { ok: false, error };
        }
    }

    async function foglalasListaKattintas(event) {
        const reszletek = event.target.closest('[data-foglalas-reszletek]');
        const inspiracio = event.target.closest('[data-inspiracio-megnyitas]');
        const inspiracioTorles = event.target.closest('[data-inspiracio-torles]');
        const keziIdoNaptar = event.target.closest('[data-kezi-ido-naptar]');
        const szerkesztes = event.target.closest('[data-foglalas-szerkesztes]');
        const torles = event.target.closest('[data-foglalas-torles]');

        if (reszletek) {
            foglalasReszletekKapcsolasa(reszletek.closest('.admin-db-kartya'));
            return;
        }

        if (inspiracio) {
            inspiracioModalNyitasa(inspiracio.closest('.admin-db-kartya'));
            return;
        }

        if (keziIdoNaptar) {
            keziIdoNaptarMegnyitasa(keziIdoNaptar.closest('.admin-db-kartya'));
            return;
        }

        if (inspiracioTorles) {
            const kartya = inspiracioTorles.closest('.admin-db-kartya');
            const kepek = inspiracioKepekKartyan(kartya);
            if (!kepek.length) {
                onlineStatusz('Ehhez a foglaláshoz már nem tartozik inspirációs kép.');
                return;
            }

            if (!window.confirm(`Biztosan végleg törlöd a foglaláshoz tartozó ${kepek.length} inspirációs képet?`)) {
                return;
            }

            onlineStatusz('Inspirációs képek törlése...');
            inspiracioTorles.disabled = true;
            const kepekTorolve = await foglalasInspiraciokTorlese(kartya);
            if (!kepekTorolve) {
                inspiracioTorles.disabled = false;
                onlineStatusz(
                    'Az inspirációs képek törlése nem sikerült. Kérlek próbáld újra, vagy ellenőrizd a Supabase Storage jogosultságot.',
                    true
                );
                return;
            }

            await foglalasEsemenyRogzitese(kartya.dataset.id, {
                event_type: 'inspiration_deleted',
                channel: 'admin',
                status: 'success',
                title: 'Inspirációs képek törölve',
                message: `${kepek.length} inspirációs kép véglegesen törölve lett.`,
                metadata: { image_count: kepek.length }
            });
            onlineStatusz(`${kepek.length} inspirációs kép törölve.`);
            esemenynaploBetoltese();
            return;
        }

        if (szerkesztes) {
            foglalasSzerkesztesKapcsolasa(szerkesztes.closest('.admin-db-kartya'));
            return;
        }

        if (!torles) {
            return;
        }

        const kartya = torles.closest('.admin-db-kartya');
        const tabla = kartya?.dataset.tipus === 'blocked' ? 'blocked_times' : 'bookings';
        const id = kartya?.dataset.id;

        if (!id) {
            return;
        }

        if (!window.confirm('Biztosan eltávolítod ezt a foglalási bejegyzést?')) {
            return;
        }

        if (kartya?.dataset.tipus === 'booking') {
            const kepek = inspiracioKepekKartyan(kartya);
            if (kepek.length) {
                onlineStatusz('Foglaláshoz tartozó képek törlése...');
                const kepekTorolve = await foglalasInspiraciokTorlese(kartya, {
                    mezokUritese: false
                });
                if (!kepekTorolve) {
                    onlineStatusz(
                        'A foglaláshoz tartozó kép törlése nem sikerült, ezért a foglalást nem töröltem. Kérlek próbáld újra, vagy ellenőrizd a Supabase Storage jogosultságot.',
                        true
                    );
                    return;
                }
            }
        }

        await rekordTorlese(tabla, id, foglalasokBetoltese);
    }

    function foglalasListaFokuszElhagyas(event) {
        if (!event.target.matches('[data-idopont-mezo="paid_amount"]')) return;
        void adminStudioFizetesMentese(event.target.closest('.admin-db-kartya'));
    }

    const adminStudioFizetesZarak = new Map();
    async function adminStudioFizetesMentese(kartya) {
        if (!kartya || adminStudioFizetesZarak.has(kartya.dataset.id)) return;
        const input = idopontMezo(kartya, 'paid_amount'),
            amount = fizetettOsszegAdatok(kartya);
        if (amount.hiba) {
            onlineStatusz(amount.hiba, true);
            return;
        }
        if (kartya.dataset.eredetiFizetettOsszeg === fizetettOsszegInputErtek(amount.ertek)) return;
        const item = allapot.foglalasElemek.find((item) => String(item.adat.id) === kartya.dataset.id && item.tipus === kartya.dataset.tipus);
        if (!item) return;
        const status = kartya.querySelector('[data-foglalas-statusz]');
        if (
            foglalasIdopontValtozott(kartya) ||
            (status.value !== kartya.dataset.eredetiStatusz && status.value !== 'done') ||
            (item.tipus === 'blocked' &&
                String(idopontMezo(kartya, 'reason')?.value || '').trim() !== String(kartya.dataset.eredetiReason || '').trim())
        ) {
            onlineStatusz('Előbb mentsd vagy vond vissza az időpont és állapot függő módosítását.', true);
            return;
        }
        const next =
            amount.ertek !== null &&
            (item.adat.status === 'confirmed' || (item.tipus === 'blocked' && ['active', 'blocked'].includes(item.adat.status)))
                ? 'done'
                : status.value;
        const change = {
            id: item.adat.id,
            type: item.tipus,
            status: next,
            starts_at: item.adat.starts_at,
            ends_at: item.adat.ends_at,
            reason: item.adat.reason || '',
            paid_amount: amount.ertek,
            email_notification: null
        };
        const fingerprint = JSON.stringify(change);
        if (kartya._paymentOperation?.fingerprint !== fingerprint) kartya._paymentOperation = { fingerprint, id: ujAdminMuveletAzonosito() };
        const footer = kartya.querySelector('[data-editor-save]');
        input.disabled = true;
        if (footer) footer.disabled = true;
        const work = (async () => {
            onlineStatusz('Fizetett összeg mentése...');
            try {
                const { error } = await allapot.kliens.rpc('apply_admin_booking_changes', {
                    p_operation_id: kartya._paymentOperation.id,
                    p_changes: [change]
                });
                if (error) {
                    onlineStatusz('A fizetett összeg nem lett mentve. ' + String(error.message || 'Próbáld újra.'), true);
                    return;
                }
                const completed = next === 'done' && item.adat.status !== 'done';
                item.adat.paid_amount = amount.ertek;
                item.adat.status = next;
                kartya.dataset.eredetiFizetettOsszeg = fizetettOsszegInputErtek(amount.ertek);
                kartya.dataset.eredetiStatusz = next;
                input.defaultValue = input.value;
                status.value = next;
                Array.from(status.options).forEach((option) => (option.defaultSelected = option.value === next));
                Array.from(kartya.classList)
                    .filter((name) => name.startsWith('admin-foglalas-statusz-'))
                    .forEach((name) => kartya.classList.remove(name));
                kartya.classList.add('admin-foglalas-statusz-' + next);
                const displayed = kartya.querySelector('.admin-foglalas-meta-fizetett span');
                if (displayed) displayed.textContent = fizetettOsszegFelirat(amount.ertek);
                kartya._paymentOperation = null;
                let cleanup = true;
                if (completed && item.tipus === 'booking') cleanup = await foglalasInspiraciokTorlese(kartya);
                onlineStatusz(
                    !cleanup
                        ? 'Az összeg mentve, a foglalás teljesítve. Az inspirációs képek törlése újrapróbálható.'
                        : completed
                          ? 'Fizetett összeg mentve, a foglalás teljesítve.'
                          : 'Fizetett összeg mentve.',
                    !cleanup
                );
                adminStudioStatuszJelzes(kartya);
                adminStudioVezerlokFrissitese();
                adminV2AttekintesFrissitese();
            } catch (_) {
                onlineStatusz('A fizetett összeg mentése nem sikerült. Az érték megmaradt; próbáld újra.', true);
            } finally {
                input.disabled = false;
                if (footer) footer.disabled = false;
                adminStudioFizetesZarak.delete(kartya.dataset.id);
                adminStudioMentesJelzes();
            }
        })();
        adminStudioFizetesZarak.set(kartya.dataset.id, work);
        await work;
    }

    function foglalasSzerkesztesKapcsolasa(kartya) {
        if (!kartya) {
            return;
        }

        const aktiv = !kartya.classList.contains('szerkeszt');
        kartya.classList.toggle('szerkeszt', aktiv);
        if (aktiv) {
            foglalasReszletekKapcsolasa(kartya, true);
        } else {
            foglalasReszletekKapcsolasa(kartya, false);
        }

        kartya.querySelectorAll('[data-idopont-mezo]').forEach((mezoElem) => {
            mezoElem.disabled = !aktiv;
        });

        const gomb = kartya.querySelector('[data-foglalas-szerkesztes]');

        if (gomb) {
            gomb.textContent = aktiv ? 'Bezárás' : 'Szerkesztés';
        }
        if (aktiv) adminKartyaPanelMegnyitasa(kartya, true);
        else window.LumiAdminSheet.close();
    }

    function adminStudioFoglalasSorrend(items) {
        const rank = (item) => {
            const d = item.adat,
                s = d.status;
            if (s === 'cancelled_by_customer' && vendegLemondasOlvasatlan(d)) return 0;
            if (['confirmed', 'pending', 'active', 'blocked'].includes(s) && new Date(d.ends_at) < new Date()) return 1;
            if (s === 'pending') return 2;
            if (['confirmed', 'active', 'blocked'].includes(s) && new Date(d.ends_at) >= new Date()) return 3;
            return 4;
        };
        return [...items].sort(
            (a, b) =>
                rank(a) - rank(b) ||
                (rank(a) < 4
                    ? new Date(a.adat.starts_at) - new Date(b.adat.starts_at)
                    : new Date(b.adat.starts_at) - new Date(a.adat.starts_at))
        );
    }

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

    function foglalasAttekintesFrissitese(szurtElemek = foglalasSzurtElemek()) {
        const elemek = adminElemek();
        if (!elemek.foglalasOsszefoglalo) return;

        const osszes = allapot.foglalasElemek.length;
        const most = Date.now();
        const jovobeli = szurtElemek.filter(elem => {
            const statusz = String(elem.adat?.status || '').toLowerCase();
            return new Date(elem.datum).getTime() >= most
                && !['cancelled', 'cancelled_by_customer', 'done'].includes(statusz);
        }).length;
        const fuggoben = szurtElemek.filter(elem =>
            elem.tipus === 'booking' && foglalasFuggoben(elem.adat)
        ).length;
        const talalat = szurtElemek.length === osszes
            ? osszes + ' bejegyzés'
            : szurtElemek.length + ' találat · ' + osszes + ' összesen';

        elemek.foglalasOsszefoglalo.textContent =
            talalat + ' · ' + jovobeli + ' közelgő · ' + fuggoben + ' függőben';
    }

    function foglalasDatumKulcs(ertek) {
        const datum = ertek instanceof Date ? ertek : new Date(ertek);
        if (Number.isNaN(datum.getTime())) return '';

        const reszek = new Intl.DateTimeFormat('hu-HU', {
            timeZone: 'Europe/Budapest',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(datum);
        const ertekek = Object.fromEntries(reszek.map(resz => [resz.type, resz.value]));
        return ertekek.year + '-' + ertekek.month + '-' + ertekek.day;
    }

    function foglalasNaptarNapKulcs(ev, honap, nap) {
        return ev + '-' + String(honap + 1).padStart(2, '0') + '-' + String(nap).padStart(2, '0');
    }

    function foglalasNaptarHonapElemei(szurtElemek = foglalasSzurtElemek()) {
        const honap = allapot.foglalasNaptarHonap;
        const ev = honap.getFullYear();
        const honapIndex = honap.getMonth();
        const honapKulcs = ev + '-' + String(honapIndex + 1).padStart(2, '0');
        return szurtElemek.filter(elem => foglalasDatumKulcs(elem.datum).startsWith(honapKulcs));
    }

    function foglalasNaptarStatuszOsztaly(elem) {
        return String(elem.adat?.status || (elem.tipus === 'blocked' ? 'blocked' : 'pending'))
            .toLowerCase()
            .replace(/[^a-z_]/g, '');
    }

    function foglalasNaptarbanLathato(elem) {
        return !['cancelled', 'cancelled_by_customer'].includes(foglalasNaptarStatuszOsztaly(elem));
    }

    function foglalasNaptarStatuszFelirat(elem) {
        const statusz = foglalasNaptarStatuszOsztaly(elem);
        if (elem.tipus === 'blocked' && statusz === 'blocked') return 'Kézi foglalt';
        return {
            pending: 'Függőben',
            confirmed: 'Visszaigazolva',
            done: 'Kész',
            cancelled: 'Általam lemondva',
            cancelled_by_customer: 'Vendég mondta le',
            blocked: 'Foglalt'
        }[statusz] || 'Foglalás';
    }

    function foglalasNaptarElemNev(elem) {
        return elem.tipus === 'blocked'
            ? elem.adat?.reason?.trim() || 'Kézzel felvett idő'
            : elem.adat?.customer_name?.trim() || 'Névtelen foglalás';
    }

    function foglalasNaptarIdo(ertek) {
        const datum = new Date(ertek);
        if (Number.isNaN(datum.getTime())) return '';
        return datum.toLocaleTimeString('hu-HU', {
            timeZone: 'Europe/Budapest',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function foglalasNaptarRenderelese(szurtElemek = foglalasSzurtElemek()) {
        const elemek = adminElemek();
        if (!elemek.foglalasNaptarRacs || !elemek.foglalasNaptarCim) return;

        if (!allapot.foglalasNaptarKijeloltDatum) {
            allapot.foglalasNaptarKijeloltDatum = foglalasDatumKulcs(new Date());
        }

        const honap = allapot.foglalasNaptarHonap;
        const ev = honap.getFullYear();
        const honapIndex = honap.getMonth();
        const elsoNapEltolas = (new Date(ev, honapIndex, 1).getDay() + 6) % 7;
        const napokSzama = new Date(ev, honapIndex + 1, 0).getDate();
        const maiKulcs = foglalasDatumKulcs(new Date());
        const honapElemek = foglalasNaptarHonapElemei(szurtElemek)
            .filter(foglalasNaptarbanLathato);
        const napok = new Map();

        honapElemek.forEach(elem => {
            const kulcs = foglalasDatumKulcs(elem.datum);
            if (!napok.has(kulcs)) napok.set(kulcs, []);
            napok.get(kulcs).push(elem);
        });
        napok.forEach(lista => lista.sort((a, b) => new Date(a.datum) - new Date(b.datum)));

        elemek.foglalasNaptarCim.textContent = honap.toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long'
        });

        const cellak = [];
        for (let index = 0; index < elsoNapEltolas; index += 1) {
            cellak.push('<span class="admin-foglalas-naptar-cella admin-foglalas-naptar-ures" role="gridcell" aria-hidden="true"></span>');
        }

        for (let nap = 1; nap <= napokSzama; nap += 1) {
            const kulcs = foglalasNaptarNapKulcs(ev, honapIndex, nap);
            const napiElemek = napok.get(kulcs) || [];
            const kijelolt = kulcs === allapot.foglalasNaptarKijeloltDatum;
            const mai = kulcs === maiKulcs;
            const elonezet = napiElemek.slice(0, 2).map(elem =>
                '<span class="admin-foglalas-naptar-esemeny admin-foglalas-naptar-statusz-'
                + attr(foglalasNaptarStatuszOsztaly(elem)) + '" title="'
                + attr([
                    foglalasNaptarIdo(elem.datum),
                    foglalasNaptarElemNev(elem),
                    foglalasNaptarStatuszFelirat(elem)
                ].join(' · ')) + '" aria-hidden="true"><time>'
                + html(foglalasNaptarIdo(elem.datum)) + '</time></span>'
            ).join('');
            const tovabbi = napiElemek.length > 2
                ? '<span class="admin-foglalas-naptar-tovabbi">+' + (napiElemek.length - 2) + '</span>'
                : '';
            const aria = nap + '. nap, ' + napiElemek.length + ' aktív bejegyzés';

            cellak.push(
                '<div class="admin-foglalas-naptar-cella" role="gridcell">'
                + '<button type="button" class="admin-foglalas-naptar-nap'
                + (kijelolt ? ' kijelolt' : '') + (mai ? ' mai' : '')
                + '" data-foglalas-naptar-datum="' + attr(kulcs)
                + '" aria-label="' + attr(aria)
                + '" aria-pressed="' + (kijelolt ? 'true' : 'false') + '">'
                + '<span class="admin-foglalas-naptar-napszam">' + nap + '</span>'
                + (napiElemek.length ? '<span class="admin-foglalas-naptar-darab">' + napiElemek.length + '</span>' : '')
                + '<span class="admin-foglalas-naptar-esemenyek">' + elonezet + tovabbi + '</span>'
                + '</button></div>'
            );
        }

        elemek.foglalasNaptarRacs.innerHTML = cellak.join('');
        foglalasNapiListaRenderelese(szurtElemek);
    }

    function foglalasNapiListaRenderelese(szurtElemek = foglalasSzurtElemek()) {
        const elemek = adminElemek();
        if (!elemek.foglalasNapiLista || !elemek.foglalasNapiCim || !elemek.foglalasNapiDarab) return;

        const kulcs = allapot.foglalasNaptarKijeloltDatum;
        const datum = kulcs ? new Date(kulcs + 'T12:00:00') : null;
        const napiElemek = szurtElemek
            .filter(elem => foglalasDatumKulcs(elem.datum) === kulcs)
            .sort((a, b) => new Date(a.datum) - new Date(b.datum));

        elemek.foglalasNapiCim.textContent = datum && !Number.isNaN(datum.getTime())
            ? datum.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric', weekday: 'long' })
            : 'Válassz egy napot';
        elemek.foglalasNapiDarab.textContent = napiElemek.length ? napiElemek.length + ' bejegyzés' : '';

        if (!napiElemek.length) {
            elemek.foglalasNapiLista.innerHTML =
                '<p class="admin-ures">Erre a napra nincs a szűrésnek megfelelő bejegyzés.</p>';
            return;
        }

        elemek.foglalasNapiLista.innerHTML = napiElemek.map(elem => {
            const adat = elem.adat || {};
            const nev = foglalasNaptarElemNev(elem);
            const szolgaltatas = elem.tipus === 'blocked'
                ? keziSzolgaltatasNev(adat) || 'Kézzel felvett idő'
                : adat.services?.name || 'Törölt szolgáltatás';
            return '<button type="button" class="admin-foglalas-napi-sor admin-foglalas-naptar-statusz-'
                + attr(foglalasNaptarStatuszOsztaly(elem))
                + '" data-foglalas-naptar-megnyitas data-foglalas-id="' + attr(adat.id || '') + '">'
                + '<span class="admin-foglalas-napi-ido"><time>' + html(foglalasNaptarIdo(adat.starts_at))
                + '</time><span>–</span><time>' + html(foglalasNaptarIdo(adat.ends_at)) + '</time></span>'
                + '<span class="admin-foglalas-napi-adat"><strong>' + html(nev)
                + '</strong><small>' + html(szolgaltatas) + '</small></span>'
                + '<span class="admin-foglalas-napi-statusz">' + html(foglalasNaptarStatuszFelirat(elem)) + '</span>'
                + '</button>';
        }).join('');
    }

    function foglalasNezetValtasa(ujNezet) {
        const elemek = adminElemek();
        const nezet = ['naptar', 'het'].includes(ujNezet) ? ujNezet : 'lista';
        allapot.foglalasNezet = nezet;

        if (elemek.foglalasListaNezet) elemek.foglalasListaNezet.hidden = nezet !== 'lista';
        if (elemek.foglalasNaptar) elemek.foglalasNaptar.hidden = nezet !== 'naptar';
        elemek.foglalasNezetGombok.forEach(gomb => {
            const aktiv = gomb.dataset.foglalasNezet === nezet;
            gomb.classList.toggle('aktiv', aktiv);
            gomb.setAttribute('aria-pressed', String(aktiv));
        });

        const week = document.getElementById('admin-studio-week');
        if (week) week.hidden = nezet !== 'het';
        if (nezet === 'het') adminStudioHetRender();
        if (nezet === 'naptar') {
            foglalasNaptarRenderelese();
            elemek.foglalasNaptarCim?.focus({ preventScroll: true });
        }
    }

    function foglalasNaptarKattintas(event) {
        const honapLepes = event.target.closest('[data-foglalas-naptar-lepes]');
        const mai = event.target.closest('[data-foglalas-naptar-ma]');
        const nap = event.target.closest('[data-foglalas-naptar-datum]');
        const megnyitas = event.target.closest('[data-foglalas-naptar-megnyitas]');

        if (honapLepes) {
            const lepes = Number.parseInt(honapLepes.dataset.foglalasNaptarLepes, 10) || 0;
            const jelenlegi = allapot.foglalasNaptarHonap;
            allapot.foglalasNaptarHonap = new Date(
                jelenlegi.getFullYear(),
                jelenlegi.getMonth() + lepes,
                1
            );
            allapot.foglalasNaptarKijeloltDatum = foglalasNaptarNapKulcs(
                allapot.foglalasNaptarHonap.getFullYear(),
                allapot.foglalasNaptarHonap.getMonth(),
                1
            );
            foglalasNaptarRenderelese();
            return;
        }

        if (mai) {
            const most = new Date();
            allapot.foglalasNaptarHonap = new Date(most.getFullYear(), most.getMonth(), 1);
            allapot.foglalasNaptarKijeloltDatum = foglalasDatumKulcs(most);
            foglalasNaptarRenderelese();
            return;
        }

        if (nap) {
            allapot.foglalasNaptarKijeloltDatum = nap.dataset.foglalasNaptarDatum;
            foglalasNaptarRenderelese();
            return;
        }

        if (!megnyitas) return;

        const foglalasId = megnyitas.dataset.foglalasId;
        const elem = allapot.foglalasElemek.find(bejegyzes =>
            String(bejegyzes.adat?.id || '') === foglalasId
        );
        if (!elem) return;

        adminStudioRekordMegnyitas(elem);
    }

    function adminStudioRekordMegnyitas(elem) {
        const card=adminStudioFoglalasKartya(elem);
        let host=document.querySelector('.admin-calendar-editor-host');if(!host){host=document.createElement('div');host.className='admin-calendar-editor-host';document.getElementById('admin-panel-foglalasok').append(host);}
        const marker=document.createComment('calendar card');if(card.isConnected)card.before(marker);card._studioReturn=()=>{if(marker.parentNode)marker.replaceWith(card);else card.remove();};host.append(card);
        foglalasSzerkesztesKapcsolasa(card);
    }

    function foglalasReszletekKapcsolasa(kartya, kenyszeritettAllapot) {
        if (!kartya) return;
        const nyitott = typeof kenyszeritettAllapot === 'boolean'
            ? kenyszeritettAllapot
            : !kartya.classList.contains('admin-foglalas-kartya-nyitott');
        kartya.classList.toggle('admin-foglalas-kartya-nyitott', nyitott);

        const gomb = kartya.querySelector('[data-foglalas-reszletek]');
        if (gomb) {
            gomb.setAttribute('aria-expanded', String(nyitott));
            gomb.textContent = nyitott ? 'Elrejtés' : 'Részletek';
        }
    }

    // One-finger flicks follow the reference thresholds; scrolling and form controls stay native.
    function adminStudioSwipe(root, onSwipe) {
        let start = null,
            last = null,
            suppress = 0;
        root.addEventListener(
            'touchstart',
            (e) => {
                if (root.id === 'admin-studio-week' && !e.target.closest('.studio-week-toolbar')) return;
                if (e.touches.length !== 1 || e.target.closest('input,textarea,select,dialog,.admin-select-control')) {
                    start = null;
                    return;
                }
                const t = e.touches[0];
                start = { x: t.clientX, y: t.clientY, time: performance.now() };
                last = start;
            },
            { passive: true }
        );
        root.addEventListener(
            'touchmove',
            (e) => {
                if (!start || e.touches.length !== 1) {
                    start = null;
                    return;
                }
                const t = e.touches[0],
                    now = performance.now();
                if (Math.abs(t.clientY - start.y) > 12 && Math.abs(t.clientY - start.y) > Math.abs(t.clientX - start.x)) {
                    start = null;
                    return;
                }
                if (now - last.time > 120) last = { x: t.clientX, y: t.clientY, time: now };
            },
            { passive: true }
        );
        root.addEventListener(
            'touchend',
            (e) => {
                if (!start) return;
                const t = e.changedTouches[0],
                    dx = t.clientX - start.x,
                    dy = t.clientY - start.y,
                    dt = performance.now() - last.time;
                const flick = dt <= 90 && Math.abs(t.clientX - last.x) / Math.max(1, dt) >= 0.45;
                if (
                    (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.25) ||
                    (flick && Math.abs(dx) >= 24 && Math.abs(dx) > Math.abs(dy) * 1.25)
                ) {
                    onSwipe(dx < 0 ? 1 : -1);
                    suppress = performance.now() + 350;
                }
                start = null;
            },
            { passive: true }
        );
        root.addEventListener(
            'touchcancel',
            () => {
                start = null;
            },
            { passive: true }
        );
        root.addEventListener(
            'click',
            (e) => {
                if (performance.now() < suppress) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            },
            true
        );
    }
    document.addEventListener('DOMContentLoaded', () => {
        if(window.LumiReferenceUiActive)return;
        adminStudioSwipe(document.querySelector('.admin-foglalas-nezetvalto'), (direction) => {
            const views = ['lista', 'naptar', 'het'];
            foglalasNezetValtasa(views[Math.max(0, Math.min(2, views.indexOf(allapot.foglalasNezet) + direction))]);
        });
        adminStudioSwipe(document.getElementById('admin-foglalas-lista'), (d) =>
            document.querySelector(d > 0 ? '[data-foglalas-oldal="kovetkezo"]' : '[data-foglalas-oldal="elozo"]')?.click()
        );
        adminStudioSwipe(document.querySelector('.studio-month-main'), (d) =>
            document.querySelector('[data-foglalas-naptar-lepes="' + d + '"]')?.click()
        );
        adminStudioSwipe(document.getElementById('admin-studio-week'), (d) => {
            adminStudioHetEltolas += d;
            adminStudioHetRender();
        });
        adminStudioSwipe(document.querySelector('.studio-schedule-days'), (d) => {
            adminStudioBeosztasHet += d;
            adminStudioBeosztasRender();
        });

        adminStudioSwipe(document.getElementById('admin-cms-root'), (d) => {
            if (document.getElementById('admin-cms-root').dataset.lumiCmsGalleryContext === 'images') {
                document.querySelector(d > 0 ? '[data-lumi-gallery-page="next"]' : '[data-lumi-gallery-page="prev"]')?.click();
                return;
            }
            const tabs = Array.from(document.querySelectorAll('.cms-section-index-button'));
            const index = tabs.findIndex((t) => t.getAttribute('aria-current') === 'true');
            tabs[index + d]?.click();
        });
        const logs = document.getElementById('admin-panel-esemenynaplo');
        const copy = document.createElement('button');
        copy.type = 'button';
        copy.className = 'admin-v2-button';
        copy.textContent = 'Jelentés másolása';
        logs?.querySelector('.admin-v2-page-heading')?.append(copy);
        copy.addEventListener('click', async () => {
            const report = (allapot.esemenynaploElemek || [])
                .map((row) => [row.created_at, row.status, row.title, row.message].filter(Boolean).join(' · '))
                .join('\n');
            try {
                await navigator.clipboard.writeText(report);
                onlineStatusz('A betöltött jelentés másolva.');
            } catch (_) {
                onlineStatusz('A böngésző nem engedte a másolást.', true);
            }
        });
        const week = document.getElementById('admin-studio-week');
        let drag = null,
            hold = null,
            down = null,
            clickUntil = 0;
        week.addEventListener(
            'touchmove',
            (e) => {
                if (drag) e.preventDefault();
            },
            { passive: false }
        );
        week.addEventListener('pointerdown', (e) => {
            const event = e.target.closest('[data-foglalas-naptar-megnyitas]');
            if (!event || e.button !== 0) return;
            down = { x: e.clientX, y: e.clientY };
            const arm = () => {
                drag = { id: event.dataset.foglalasId, x: e.clientX, y: e.clientY };
                event.classList.add('is-dragging');
                week.setPointerCapture(e.pointerId);
            };
            if (e.pointerType === 'touch') hold = setTimeout(arm, 350);
            else arm();
        });
        week.addEventListener('pointermove', (e) => {
            if (!drag) {
                if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12) clearTimeout(hold);
                return;
            }
            drag.x = e.clientX;
            drag.y = e.clientY;
        });
        week.addEventListener('pointerup', (e) => {
            clearTimeout(hold);
            week.querySelector('.is-dragging')?.classList.remove('is-dragging');
            if (!drag) return;
            const data = drag;
            drag = null;
            const slot = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-studio-slot]');
            if (!slot) return;
            const item = allapot.foglalasElemek.find((i) => String(i.adat.id) === data.id);
            if (!item) return;
            clickUntil = performance.now() + 350;
            adminStudioRekordMegnyitas(item);
            const card = adminStudioFoglalasKartya(item);
            const start = new Date(slot.dataset.studioSlot + 'T' + slot.dataset.time),
                end = new Date(start.getTime() + (new Date(item.adat.ends_at).getTime() - new Date(item.adat.starts_at).getTime()));
            for (const [name, value] of [
                ['date', slot.dataset.studioSlot],
                ['start_time', idoInputErtek(start)],
                ['end_time', idoInputErtek(end)]
            ]) {
                const input = idopontMezo(card, name);
                if (input) {
                    input.value = value;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
            onlineStatusz('Áthelyezés előkészítve. Ellenőrizd, majd mentsd az időpontot.');
        });
        week.addEventListener('pointercancel', () => {
            clearTimeout(hold);
            drag = null;
            week.querySelector('.is-dragging')?.classList.remove('is-dragging');
        });
        week.addEventListener(
            'click',
            (e) => {
                if (performance.now() < clickUntil) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            },
            true
        );
    });

    let adminStudioHuzottTetel = null;
    function adminStudioSorrendCsere(source, target) {
        if (!source || !target || source === target || source.parentElement !== target.parentElement) return;
        if (source.matches('.cms-gallery-item')) {
            let from = Number(source.dataset.galleryIndex),
                to = Number(target.dataset.galleryIndex);
            while (from !== to) {
                document.querySelector('[data-cms-gallery-move="' + (from > to ? 'up' : 'down') + '"][data-index="' + from + '"]')?.click();
                from += from > to ? -1 : 1;
            }
        } else {
            const list = source.parentElement,
                cards = Array.from(list.children);
            list.insertBefore(source, cards.indexOf(source) < cards.indexOf(target) ? target.nextSibling : target);
            list.querySelectorAll('[data-mezo="sort_order"]').forEach((input, index) => {
                input.closest('.admin-db-kartya').dataset.studioSortDirty = 'true';
                input.value = String((index + 1) * 10);
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
            onlineStatusz('Sorrend módosítva. A Mentés véglegesíti.');
        }
    }
    function adminStudioRendezokFrissitese(root) {
        root.querySelectorAll('.admin-szolgaltatas-kartya,.cms-gallery-item').forEach((card) => {
            if (card.querySelector(':scope > [data-studio-sort]')) return;
            card.classList.add('studio-sortable');
            const handle = document.createElement('button');
            handle.type = 'button';
            handle.className = 'studio-sort-handle';
            handle.dataset.studioSort = '';
            handle.draggable = true;
            handle.setAttribute('aria-label', 'Sorrend módosítása húzással vagy a fel és le nyíllal');
            handle.textContent = '⠿';
            card.prepend(handle);
            handle.addEventListener('keydown', (e) => {
                if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;
                e.preventDefault();
                e.stopPropagation();
                const up = e.key === 'ArrowUp',
                    index = Number(card.dataset.galleryIndex);
                if (card.matches('.admin-szolgaltatas-kartya')) szolgaltatasMozgatasa(card, up ? 'fel' : 'le');
                else card.querySelector(up ? '[data-cms-gallery-move="up"]' : '[data-cms-gallery-move="down"]')?.click();
                if (card.matches('.cms-gallery-item'))
                    requestAnimationFrame(() =>
                        root
                            .querySelector(
                                '.cms-gallery-item[data-gallery-index="' + Math.max(0, index + (up ? -1 : 1)) + '"] [data-studio-sort]'
                            )
                            ?.focus()
                    );
            });
        });
    }
    document.addEventListener('DOMContentLoaded', () => {
        if(window.LumiReferenceUiActive)return;
        const root = document.getElementById('admin-tartalom');
        let touch = null;
        root.addEventListener('dragstart', (e) => {
            const handle = e.target.closest('[data-studio-sort]');
            if (!handle) return;
            adminStudioHuzottTetel = handle.parentElement;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', adminStudioHuzottTetel.dataset.id || adminStudioHuzottTetel.dataset.galleryIndex);
        });
        root.addEventListener('dragover', (e) => {
            const target = e.target.closest('.studio-sortable');
            if (adminStudioHuzottTetel && target && target.parentElement === adminStudioHuzottTetel.parentElement) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }
        });
        root.addEventListener('drop', (e) => {
            const source = adminStudioHuzottTetel;
            adminStudioHuzottTetel = null;
            if (source) {
                e.preventDefault();
                adminStudioSorrendCsere(source, e.target.closest('.studio-sortable'));
            }
        });
        root.addEventListener('dragend', () => {
            adminStudioHuzottTetel = null;
        });
        const clear = () => {
            root.querySelectorAll('.is-sort-source,.is-sort-target').forEach((card) =>
                card.classList.remove('is-sort-source', 'is-sort-target')
            );
            touch = null;
        };
        root.addEventListener('pointerdown', (e) => {
            const handle = e.target.closest('[data-studio-sort]');
            if (e.pointerType !== 'touch' || !handle) return;
            e.preventDefault();
            touch = { source: handle.parentElement, target: null };
            touch.source.classList.add('is-sort-source');
            if (e.isTrusted) handle.setPointerCapture(e.pointerId);
        });
        root.addEventListener('pointermove', (e) => {
            if (!touch) return;
            e.preventDefault();
            root.querySelector('.is-sort-target')?.classList.remove('is-sort-target');
            const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.studio-sortable');
            touch.target = target && target.parentElement === touch.source.parentElement ? target : null;
            if (touch.target !== touch.source) touch.target?.classList.add('is-sort-target');
        });
        root.addEventListener('pointerup', (e) => {
            if (!touch) return;
            e.preventDefault();
            const data = touch;
            clear();
            adminStudioSorrendCsere(data.source, data.target);
        });
        root.addEventListener('pointercancel', clear);
    });

    let publikusKozzetetelKeres = null;
    let publikusKozzetetelAkcio = null;
    let publikusKozzetetelId = 0;
    let publikusKozzetetelIdozito = null;
    let publikusKozzetetelAdat = null;

    function publikacioAllapotKiirasa(szoveg, allapotNev) {
        let panel = document.getElementById('admin-publication-status');
        if (!panel) {
            const root = document.querySelector('.admin-workspace-main') || adminElemek().tartalom;
            if (!root) return;
            panel = document.createElement('p');
            panel.id = 'admin-publication-status';
            panel.className = 'admin-status';
            panel.setAttribute('role', 'status');
            const text = document.createElement('span');
            text.dataset.publicationMessage = '';
            const refresh = document.createElement('button');
            refresh.type = 'button';
            refresh.className = 'admin-kis-gomb';
            refresh.textContent = 'Megjelenés ellenőrzése';
            refresh.addEventListener('click', () => publikusHtmlFrissitesKerese('ellenorzes', 'status'));
            panel.append(text, document.createTextNode(' '), refresh);
            root.prepend(panel);
        }
        panel.dataset.publicationState = allapotNev;
        panel.querySelector('[data-publication-message]').textContent = szoveg + ' ';
        const retry = panel.querySelector('[data-publication-retry]');
        if (['error', 'unpublished', 'unverified'].includes(allapotNev)) {
            if (!retry) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'admin-kis-gomb';
                button.dataset.publicationRetry = '';
                button.textContent = 'Közzététel indítása';
                button.addEventListener('click', () => publikusHtmlFrissitesKerese('ujraproba'));
                panel.append(document.createTextNode(' '), button);
            }
        } else retry?.remove();
        panel.hidden = false;
    }

    async function publikusKozzetetelEllenorzese(azonosito, probalkozas = 0) {
        if (azonosito !== publikusKozzetetelId || !allapot.session || !publikusKozzetetelAdat) return;
        if (document.hidden) {
            publikusKozzetetelIdozito = window.setTimeout(() => publikusKozzetetelEllenorzese(azonosito, probalkozas), 15000);
            return;
        }
        const expected = publikusKozzetetelAdat;
        try {
            const url = new URL('/deployment.json', expected.siteUrl);
            url.searchParams.set('verify', expected.contentHash);
            const response = await fetch(url, { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(10000) });
            const manifest = response.ok ? await response.json() : null;
            if (azonosito !== publikusKozzetetelId) return;
            if (manifest?.schemaVersion === 1 && manifest.environment === expected.environment
                && manifest.origin === expected.siteUrl && manifest.contentHash === expected.contentHash) {
                publikacioAllapotKiirasa('A mentett tartalom nyilvánosan megjelent.', 'published');
                return;
            }
        } catch (_) { /* Keep the last working public release; never claim publication on a failed check. */ }
        if (azonosito !== publikusKozzetetelId) return;
        if (probalkozas >= 7) {
            publikacioAllapotKiirasa('A tartalom mentve, a nyilvános megjelenés még nem igazolt. Az előző kiadás elérhető.', 'unverified');
            return;
        }
        publikusKozzetetelIdozito = window.setTimeout(() => publikusKozzetetelEllenorzese(azonosito, probalkozas + 1), Math.min(30000, 5000 * (probalkozas + 1)));
    }

    function publikusHtmlFrissitesKerese(ok = 'tartalom', action = 'publish') {
        if (!allapot.kliens || !allapot.session) return Promise.resolve({ ok: false, reason: 'nincs_admin_munkamenet' });
        if (publikusKozzetetelKeres) {
            // Each successful save may change the database while a publication request is running.
            // Serialize publishes; the server deduplicates hooks using the fresh content hash.
            if (action === 'status' && publikusKozzetetelAkcio === 'status') return publikusKozzetetelKeres;
            return publikusKozzetetelKeres.then(() => publikusHtmlFrissitesKerese(ok, action));
        }
        publikusKozzetetelAkcio = action;
        publikusKozzetetelKeres = publikusHtmlFrissitesInditasa(ok, action)
            .finally(() => { publikusKozzetetelKeres = null; publikusKozzetetelAkcio = null; });
        return publikusKozzetetelKeres;
    }

    async function publikusHtmlFrissitesInditasa(ok, action) {
        const azonosito = ++publikusKozzetetelId;
        window.clearTimeout(publikusKozzetetelIdozito);
        try {
            const elesOldal = ['luminails.hu', 'www.luminails.hu'].includes(window.location.hostname.toLowerCase());
            const frissitoFuggveny = elesOldal ? 'publish-live-site-content' : 'publish-site-content';
            const { data, error } = await allapot.kliens.functions.invoke(frissitoFuggveny, {
                body: { action, reason: String(ok || 'tartalom').slice(0, 80) }
            });
            if (azonosito !== publikusKozzetetelId || !allapot.session) return { ok: false, reason: 'munkamenet_megvaltozott' };
            if (error || data?.ok !== true) {
                publikacioAllapotKiirasa('A mentés után a közzététel nem indult el vagy nem ellenőrizhető. A Cloudflare és Supabase beállításait ellenőrizni kell.', 'error');
                return { ok: false, reason: data?.error || 'publication_request_failed' };
            }
            if (data.published === true) {
                publikacioAllapotKiirasa('A mentett tartalom nyilvánosan megjelent.', 'published');
            } else if (data.state === 'pending') {
                publikusKozzetetelAdat = data;
                publikacioAllapotKiirasa('A tartalom mentve. A nyilvános közzététel folyamatban van.', 'pending');
                publikusKozzetetelEllenorzese(azonosito);
            } else {
                publikacioAllapotKiirasa('A mentett tartalom még nincs nyilvánosan közzétéve.', 'unpublished');
            }
            return data;
        } catch (_) {
            if (azonosito !== publikusKozzetetelId || !allapot.session) return { ok: false, reason: 'munkamenet_megvaltozott' };
            publikacioAllapotKiirasa('A közzététel most nem ellenőrizhető. A mentés ettől független.', 'error');
            return { ok: false, reason: 'publication_request_failed' };
        }
    }

    window.lumiPublikusHtmlFrissitesKerese = publikusHtmlFrissitesKerese;
    window.lumiPublikacioLeallitasa = () => {
        ++publikusKozzetetelId;
        window.clearTimeout(publikusKozzetetelIdozito);
        publikusKozzetetelAdat = null;
        const panel = document.getElementById('admin-publication-status');
        if (panel) panel.hidden = true;
    };

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

    function kuponokBetoltese() {
        return adminKeresOsszevonasa('kuponokBetoltese', kuponokBetolteseLetoltese);
    }

    async function kuponokBetolteseLetoltese() {
        const ervenyes = adminKeresMunkamenetOr();
        const elemek = adminElemek();
        if (!elemek.kuponLista) return false;

        let { data, error } = await allapot.kliens
            .from('coupons')
            .select(
                'id,code,title,description,discount_type,discount_value,discount_basis,discount_text,service_id,service_category,customer_scope,valid_from,valid_until,active,show_on_home,sort_order'
            )
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });

        if (error && adatbazisOszlopHiany(error, ['discount_basis'])) {
            ({ data, error } = await allapot.kliens
                .from('coupons')
                .select(
                    'id,code,title,description,discount_type,discount_value,discount_text,service_id,service_category,customer_scope,valid_from,valid_until,active,show_on_home,sort_order'
                )
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: true }));
        }

        if (error && adatbazisOszlopHiany(error, ['service_category', 'customer_scope'])) {
            ({ data, error } = await allapot.kliens
                .from('coupons')
                .select(
                    'id,code,title,description,discount_type,discount_value,discount_text,service_id,valid_from,valid_until,active,show_on_home,sort_order'
                )
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: true }));
        }

        if (!ervenyes()) return false;
        if (error) {
            allapot.kuponok = [];
            arKalkulatorKuponokFrissitese();
            elemek.kuponLista.innerHTML = `<p class="admin-ures">A kuponkezel\u00e9shez futtasd a <code>supabase-coupons.sql</code> f\u00e1jlt Supabase-ben.</p>`;
            if (!hianyzoKuponTabla(error)) onlineStatusz('Nem siker\u00fclt bet\u00f6lteni a kuponokat.', true);
            return false;
        }

        allapot.kuponok = (data || []).map((kupon) => ({
            ...kupon,
            discount_basis: kuponKedvezmenyAlapja(kupon)
        }));
        arKalkulatorKuponokFrissitese();
        elemek.kuponLista.innerHTML = '';

        if (!allapot.kuponok.length) {
            elemek.kuponLista.innerHTML = '<p class="admin-ures">M\u00e9g nincs kupon. Hozz l\u00e9tre egyet az \u00daj kupon gombbal.</p>';
            return false;
        }

        allapot.kuponok.forEach((kupon) => elemek.kuponLista.appendChild(kuponKartya(kupon)));
        const ujKartya = elemek.kuponLista.querySelector('.szerkeszt');
        if (ujKartya && allapot.aktivTab === 'kuponok') adminKartyaPanelMegnyitasa(ujKartya);
        return true;
    }

    function kuponKartya(kupon) {
        const ujKupon =
            String(kupon.title || '')
                .trim()
                .toLowerCase() === 'új kupon';
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
        ]
            .map(([ertek, cimke]) => `<option value="${ertek}" ${ertek === aktiv ? 'selected' : ''}>${cimke}</option>`)
            .join('');
    }

    function kuponKedvezmenyAlapja(kupon = {}) {
        const alap = String(kupon?.discount_basis || '')
            .trim()
            .toLowerCase();
        if (['total', 'service', 'decoration'].includes(alap)) return alap;
        return normalizaltAdminKuponSzoveg(kupon?.service_category) === 'diszites' ? 'decoration' : 'service';
    }

    function kuponKedvezmenyAlapOptions(aktiv = 'service') {
        return [
            ['total', 'Teljes árból (szolgáltatás + díszítések)'],
            ['service', 'Csak az alapszolgáltatás árából'],
            ['decoration', 'Csak a díszítések árából']
        ]
            .map(([ertek, cimke]) => `<option value="${ertek}" ${ertek === aktiv ? 'selected' : ''}>${cimke}</option>`)
            .join('');
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
        ]
            .map(([value, cimke]) => `<option value="${value}" ${value === ertek ? 'selected' : ''}>${cimke}</option>`)
            .join('');
    }

    function kuponSzolgaltatasOptions(kupon = {}) {
        const aktivErtek = kuponScopeAktivErtek(kupon);
        const opciok = [
            `<option value="all" ${aktivErtek === 'all' ? 'selected' : ''}>Minden szolg\u00e1ltat\u00e1s</option>`,
            `<option value="category:D\u00edsz\u00edt\u00e9s" ${aktivErtek === 'category:D\u00edsz\u00edt\u00e9s' ? 'selected' : ''}>Extra d\u00edsz\u00edt\u00e9s b\u00e1rmely foglalhat\u00f3 szolg\u00e1ltat\u00e1s mell\u00e9</option>`
        ];
        const kategoriak = SZOLGALTATAS_KUPON_KATEGORIAK.filter(
            (kategoria) =>
                kategoria !== 'D\u00edsz\u00edt\u00e9s' &&
                allapot.szolgaltatasok.some(
                    (szolgaltatas) => szolgaltatas.booking_enabled && szolgaltatasKuponKategoria(szolgaltatas) === kategoria
                )
        );

        if (kategoriak.length) {
            opciok.push('<optgroup label="Foglalhat\u00f3 kateg\u00f3ri\u00e1k">');
            kategoriak.forEach((kategoria) => {
                const ertek = `category:${kategoria}`;
                opciok.push(
                    `<option value="${attr(ertek)}" ${aktivErtek === ertek ? 'selected' : ''}>${html(kategoria)} kateg\u00f3ria</option>`
                );
            });
            opciok.push('</optgroup>');
        }

        const foglalhatoSzolgaltatasok = allapot.szolgaltatasok.filter(
            (szolgaltatas) => szolgaltatas.booking_enabled && szolgaltatasKuponKategoria(szolgaltatas) !== 'D\u00edsz\u00edt\u00e9s'
        );
        if (foglalhatoSzolgaltatasok.length) {
            opciok.push('<optgroup label="Konkr\u00e9t foglalhat\u00f3 t\u00e9telek">');
            foglalhatoSzolgaltatasok.forEach((szolgaltatas) => {
                const ertek = `service:${szolgaltatas.id}`;
                opciok.push(
                    `<option value="${attr(ertek)}" ${aktivErtek === ertek ? 'selected' : ''}>${html(szolgaltatas.name || '')}</option>`
                );
            });
            opciok.push('</optgroup>');
        }

        return opciok.join('');
    }

    function kuponScopeAktivErtek(kupon = {}) {
        if (kupon.service_id) {
            const szolgaltatas = allapot.szolgaltatasok.find((tetel) => tetel.id === kupon.service_id);
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

        ujKupon.id = crypto.randomUUID();
        const card = kuponKartya(ujKupon);
        card.dataset.draftNew = 'true';
        document.getElementById('admin-kupon-lista').append(card);
        adminKartyaPanelMegnyitasa(card);
        onlineStatusz('Új kupon-piszkozat. A létrehozást a Mentés véglegesíti.');
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
            if (!window.confirm('Biztosan törlöd ezt a kupont? A törlést a Mentés véglegesíti.')) return;
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

    function kuponListaValtozas(event) {
        const kartya = event.target.closest('.admin-kupon-kartya');
        if (!kartya || !event.target.matches('[data-mezo="discount_type"], [data-mezo="discount_basis"]')) return;
        kuponSzerkesztoMezoAllapotFrissitese(kartya);
    }

    async function kuponTorlese(id) {
        onlineStatusz('Kupon inaktiválása és törlése...');

        const { error: inaktivHiba } = await allapot.kliens.from('coupons').update({ active: false, show_on_home: false }).eq('id', id);

        if (inaktivHiba) {
            onlineStatusz('Nem sikerült inaktiválni a kupont, ezért nem töröltem.', true);
            return;
        }

        const { error } = await allapot.kliens.from('coupons').delete().eq('id', id);

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
            if (sorrend) {
                elem.dataset.studioSortDirty = 'true';
                sorrend.value = String((index + 1) * 10);
                sorrend.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        onlineStatusz('A kupon sorrend módosult. A véglegesítéshez nyomd meg a Mentés gombot.');
    }

    async function kuponokMentese() {
        const allCards = Array.from(document.querySelectorAll('#admin-kupon-lista .admin-kupon-kartya'));
        const kartyak = allCards.filter((card) => !card.dataset.draftDelete);
        if (!allCards.length) {
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

            const write = (payload) =>
                kartya.dataset.draftNew
                    ? allapot.kliens.from('coupons').insert({ ...payload, id: kartya.dataset.id })
                    : allapot.kliens.from('coupons').update(payload).eq('id', kartya.dataset.id);
            let { error } = await write(payload);

            if (error && adatbazisOszlopHiany(error, ['discount_basis', 'service_category', 'customer_scope'])) {
                const kompatibilisPayload = { ...payload };
                const kedvezmenyAlapHianyzik = adatbazisOszlopHiany(error, ['discount_basis']);
                if (kedvezmenyAlapHianyzik && payload.discount_basis !== 'service') {
                    onlineStatusz(
                        `${kod}: az új kedvezményalap mentéséhez előbb futtasd a supabase-coupon-discount-basis.sql frissítést.`,
                        true
                    );
                    mezo(kartya, 'discount_basis')?.focus();
                    return;
                }
                if (kedvezmenyAlapHianyzik) delete kompatibilisPayload.discount_basis;
                if (adatbazisOszlopHiany(error, ['service_category'])) delete kompatibilisPayload.service_category;
                if (adatbazisOszlopHiany(error, ['customer_scope'])) delete kompatibilisPayload.customer_scope;
                ({ error } = await write(kompatibilisPayload));
                if (!error) {
                    onlineStatusz('Kuponok mentve, de minden új kuponbeállításhoz futtasd a friss Supabase SQL-eket.', true);
                }
            }

            if (error) {
                onlineStatusz('Nem siker\u00fclt menteni az egyik kupont.', true);
                return;
            }
            delete kartya.dataset.draftNew;
        }

        for (const card of allCards.filter((card) => card.dataset.draftDelete)) {
            const { error } = await allapot.kliens.from('coupons').delete().eq('id', card.dataset.id);
            if (error) {
                onlineStatusz('Az egyik kupon törlése nem sikerült.', true);
                return;
            }
        }
        onlineStatusz('Kuponok mentve.');
        // Coupon validity remains live; public text changes are picked up at the next publication check.
        kuponokBetoltese();
    }

    // Boundary between the copied reference UI and LumiNails' existing data/authorization code.
    // No reference-project schema, environment value or content crosses this boundary.
    const referenceRecordIds = new Map();
    let referenceNextId = 1;
    let referenceNotificationOwner = null;
    let referenceNotificationReadIds = new Set();
    let referenceNotificationsLoaded = false;
    let referenceGuestEvents = null;
    let referenceLogState = {loaded:false,events:[],hasNew:false,lastSeen:0,error:null};
    function referenceNotificationState() {
        const owner = allapot.session?.user?.id || null;
        if (owner !== referenceNotificationOwner) {
            referenceNotificationOwner = owner;
            referenceNotificationReadIds = new Set();
            referenceNotificationsLoaded = false;
            referenceGuestEvents = null;
            referenceLogState = {loaded:false,events:[],hasNew:false,lastSeen:0,error:null};
        }
        return owner;
    }
    async function referenceLoadGuestEvents() {
        const owner=referenceNotificationState();
        const valid=adminKeresMunkamenetOr();
        await adminKeresOsszevonasa('referenceGuestEvents',async()=>{
            const {data,error}=await allapot.kliens.from('booking_events')
                .select('id,booking_id,event_type,channel,title,message,created_at')
                .in('event_type',['booking_created','customer_cancelled','customer_registered','customer_booking_updated','customer_booking_rescheduled','customer_rescheduled','booking_rescheduled'])
                .neq('channel','admin').order('created_at',{ascending:false}).limit(50);
            if(error)throw new Error('Az értesítések nem tölthetők be. Próbáld újra.');
            if(valid()&&referenceNotificationState()===owner)referenceGuestEvents=data || [];
        });
    }
    async function referenceLoadErrorLogs(full=false,force=false) {
        const owner=referenceNotificationState();
        if(!owner)return;
        const key=`referenceErrorLogs:${owner}`;
        const pending=adminFolyamatbanLevoKeresek.get(key);
        if(pending){await pending;if(!full)return;}
        if(!full&&referenceLogState.loaded&&!force)return;
        const valid=adminKeresMunkamenetOr();
        await adminKeresOsszevonasa(key,async()=>{
            const [events,read]=await Promise.all([
                allapot.kliens.from('admin_error_events').select(full?'id,source,occurred_at,title,detail':'id').order('id',{ascending:false}).limit(full?200:1),
                allapot.kliens.from('admin_error_log_reads').select('last_seen_id').eq('user_id',owner).maybeSingle()
            ]);
            if(!valid()||referenceNotificationState()!==owner)return;
            referenceLogState.loaded=true;
            if(events.error||read.error){referenceLogState.error='A hibalista nem érhető el. Próbáld újra később.';return;}
            const latest=Number(events.data?.[0]?.id || 0),lastSeen=Number(read.data?.last_seen_id || 0);
            referenceLogState.hasNew=latest>lastSeen;
            referenceLogState.lastSeen=lastSeen;
            referenceLogState.error=null;
            if(full){
                referenceLogState.events=events.data || [];
                if(latest>lastSeen){
                    const {error}=await allapot.kliens.rpc('admin_mark_error_logs_read',{p_last_seen_id:latest});
                    if(!valid()||referenceNotificationState()!==owner)return;
                    if(error){referenceLogState.error='A hibák olvasottságát nem sikerült menteni. Próbáld újra.';return;}
                    referenceLogState.lastSeen=latest;referenceLogState.hasNew=false;
                }
            }
        });
    }
    async function referenceLoadNotificationReads(force = false) {
        const owner = referenceNotificationState();
        if (!owner) return;
        const pending=adminFolyamatbanLevoKeresek.get(`referenceNotificationReads:${owner}`);
        if(pending){await pending;return;}
        if(referenceNotificationsLoaded && !force)return;
        await adminKeresOsszevonasa(`referenceNotificationReads:${owner}`, async () => {
            const { data, error } = await allapot.kliens.from('booking_events')
                .select('metadata,created_at').eq('event_type', 'admin_notifications_read')
                .eq('metadata->>admin_user_id', owner).order('created_at', { ascending: false }).limit(50);
            if (error) throw new Error('Az értesítések olvasottsága nem tölthető be. Próbáld újra.');
            if (referenceNotificationState() !== owner) return;
            // Merge recent markers too, so simultaneous browser sessions do not undo each other's reads.
            const ids=(data || []).slice().reverse().flatMap(row=>Array.isArray(row.metadata?.read_notice_ids)?row.metadata.read_notice_ids:[]);
            referenceNotificationReadIds = new Set(Array.from(new Set(ids.filter(id => typeof id === 'string'))).slice(-5000));
            referenceNotificationsLoaded = true;
        });
    }
    const referenceKey = item => `${item.tipus}:${item.adat.id}`;
    function referenceId(item) {
        const key = referenceKey(item);
        if (!referenceRecordIds.has(key)) referenceRecordIds.set(key, referenceNextId++);
        return referenceRecordIds.get(key);
    }
    function referenceItem(id) {
        const item = allapot.foglalasElemek.find(item => referenceId(item) === id);
        if (!item) throw new Error('Az időpont már nem található. Frissítsd a listát.');
        return item;
    }
    const referenceStatus = status => ({ pending:'new', confirmed:'confirmed', blocked:'confirmed', active:'confirmed', done:'completed', cancelled:'cancelled', cancelled_by_customer:'guest_cancelled' }[status] || 'confirmed');
    const originalStatus = (status, type) => type === 'blocked'
        ? ({ completed:'done', guest_cancelled:'cancelled_by_customer', cancelled:'cancelled_by_customer' }[status] || 'blocked')
        : ({ new:'pending', confirmed:'confirmed', completed:'done', cancelled:'cancelled', guest_cancelled:'cancelled_by_customer' }[status] || 'confirmed');
    function referenceRequireAdmin() {
        if (!allapot.session || !allapot.adminVerified) throw new Error('A művelethez aktuális admin belépés szükséges.');
        onlineStatusz('');
    }
    function referenceCheckStatus() {
        const status = document.getElementById('admin-online-status');
        if (status?.classList.contains('hiba')) throw new Error(status.textContent || 'A mentés nem sikerült.');
    }
    function referenceCheckCms(){const result=window.LumiAdminCms?.result?.();if(result?.error)throw new Error(result.message);}
    function referenceBooking(item) {
        const row=item.adat, cancelled=allapot.lemondasEsemenyek.get(String(row.id));
        const acknowledgedAt=cancelled?.tudomasulvetel;
        const cancellationAcknowledgedAt=acknowledgedAt && (!cancelled?.lemondas || Date.parse(acknowledgedAt)>=Date.parse(cancelled.lemondas)) ? acknowledgedAt : null;
        return { id:referenceId(item), notificationKey:referenceKey(item), createdAt:row.created_at, updatedAt:row.updated_at || row.created_at || '', startsAt:row.starts_at, endsAt:row.ends_at,
            date:new Date(row.starts_at).toLocaleDateString('hu-HU'), time:idoInputErtek(row.starts_at), endTime:idoInputErtek(row.ends_at),
            dateInput:datumInputErtek(row.starts_at), timeInput:idoInputErtek(row.starts_at), trackId:'lashes', trackLabel:'Köröm',
            serviceLabel:row.services?.name || row.services?.description || '', serviceGroups:[{label:'',names:[row.services?.name || row.services?.description || 'Kézi időpont']}],
            serviceIds:row.service_id?[row.service_id]:allapot.szolgaltatasok.filter(service=>service.name===row.services?.name).slice(0,1).map(service=>service.id), guestName:row.customer_name || row.reason || 'Kézi időpont', createdBy:null,
            phone:row.customer_phone || '', email:row.customer_email || '', note:item.tipus==='booking'?foglalasMegjegyzesMegjelenites(row):'', adminComment:'',
            paidAmountHuf:row.paid_amount ?? null, status:referenceStatus(row.status), cancelledAt:cancelled?.lemondas || null, cancellationByAdmin:cancelled?.lemondasCsatorna==='admin',
            inspirations:item.tipus==='booking'?foglalasInspiracioKepek(row):[], coupon:[row.coupon_code,row.coupon_title].filter(Boolean).join(' · '), nailStyle:[row.nail_style,row.nail_style_note].filter(Boolean).join(' · '),
            cancellationAcknowledgedAt, source:item.tipus==='blocked'?'manual':'online', confirmationCode:row.public_reference || '' };
    }
    function referenceWindowRows() {
        if(allapot.referenceWindows)return allapot.referenceWindows.map(row=>({...row}));
        return Array.from(document.querySelectorAll('#admin-idosav-lista .admin-idosav-kartya')).map(card=>({
            id:card.dataset.id, work_date:mezo(card,'work_date')?.value || '', start_time:mezo(card,'start_time')?.value || '', end_time:mezo(card,'end_time')?.value || '',
            slot_step_minutes:Number(mezo(card,'slot_step_minutes')?.value || 30), active:true
        }));
    }
    function referenceSnapshot() {
        referenceNotificationState();
        const authorized=Boolean(allapot.session && allapot.adminVerified);
        if (!authorized) return { authorized:false, ready:Boolean(allapot.referenceAuthReady), pending:Boolean(allapot.session&&!allapot.adminVerified), authError:document.getElementById('admin-auth-status')?.classList.contains('hiba')?document.getElementById('admin-auth-status').textContent:'' };
        return { authorized, bookings:allapot.foglalasElemek.map(referenceBooking), services:allapot.szolgaltatasok, coupons:allapot.kuponok || [],
            guests:allapot.vendegProfilok || [], events:(referenceGuestEvents || allapot.esemenynaploElemek || []).map(event=>{const item=allapot.foglalasElemek.find(item=>item.tipus==='booking'&&item.adat.id===event.booking_id);return {...event,referenceBookingId:item?referenceId(item):null,referenceBookingKey:item?referenceKey(item):null};}), windows:referenceWindowRows(),
            errorLogs:referenceLogState.events,hasNewLogErrors:referenceLogState.hasNew,logError:referenceLogState.error,
            couponScopes:referenceCouponScopes(), calculator:referenceCalculator(),
            publication:{text:document.getElementById('admin-publication-status')?.textContent || '',state:document.getElementById('admin-publication-status')?.dataset.publicationState || ''},
            emailErrors:adminV2EmailHibasEsemenyek().map(row=>row.id), notificationReadIds:Array.from(referenceNotificationReadIds),
            phoneVisible:adminElemek().telefonLathato?.checked ?? true, cms:window.LumiAdminCms?.source?.() || null };
    }
    const referenceLoaders={overview:'attekintes',bookings:'foglalasok',prices:'szolgaltatasok',coupons:'kuponok',schedule:'idosavok',guests:'vendegek',logs:'esemenynaplo',settings:'beallitasok',calculator:'arkalkulator'};
    function referenceCouponScopes(){const select=document.createElement('select');select.innerHTML=kuponSzolgaltatasOptions({});return Array.from(select.options).map(option=>({value:option.value,label:option.textContent}));}
    function referenceCalculator(){
        const service=arKalkulatorAktivSzolgaltatas();
        return {serviceId:arKalkulatorAllapot.szolgaltatasId,base:arKalkulatorAllapot.alapAr,couponId:arKalkulatorAllapot.kuponId,
            services:arKalkulatorAlapszolgaltatasok().map(row=>({value:String(row.id),label:arKalkulatorSzolgaltatasNev(row)})),
            prices:arKalkulatorArak(service).map(value=>({value,label:arKalkulatorArSzoveg(value)})),
            decorations:arKalkulatorDiszitesek().map(row=>({id:String(row.id),label:arKalkulatorTetelNev(row),prices:arKalkulatorArak(row).map(value=>({value,label:arKalkulatorArSzoveg(value)}))})),
            extras:Array.from(arKalkulatorAllapot.extrak.entries()).map(([id,row])=>({id,count:row.darab,price:row.ar})),
            coupons:[{value:'',label:'Nincs kuponkedvezmény'},...arKalkulatorAktivKuponok().map(row=>({value:String(row.id),label:row.code+' – '+arKalkulatorKuponFelirat(row)}))],
            hint:document.getElementById('admin-arkalkulator-kupon-segedlet')?.textContent||'',
            total:document.getElementById('admin-arkalkulator-vegosszeg')?.textContent||'0 Ft',
            breakdown:Array.from(document.querySelectorAll('#admin-arkalkulator-bontas > div')).map(row=>({label:row.querySelector('span')?.textContent,value:row.querySelector('strong')?.textContent}))};
    }
    window.LumiAdminBackend = {
        snapshot:referenceSnapshot,
        createId:()=>ujAdminMuveletAzonosito(),
        authEmail:()=>adminEmail(adminElemek()),
        async signIn(password){if(!allapot.kliens)return {error:{code:'unavailable'}};return allapot.kliens.auth.signInWithPassword({email:adminEmail(adminElemek()),password});},
        subscribe(listener) {
            const root=document.getElementById('admin-tartalom');
            const observer=new MutationObserver(()=>listener());
            if(root)observer.observe(root,{attributes:true,attributeFilter:['hidden']});
            const authStatus=document.getElementById('admin-auth-status');if(authStatus)observer.observe(authStatus,{childList:true,subtree:true});
            const publicationStatus=document.getElementById('admin-publication-status');if(publicationStatus)observer.observe(publicationStatus,{childList:true,subtree:true,attributes:true,attributeFilter:['data-publication-state']});
            queueMicrotask(listener);
            window.addEventListener('lumi:content',listener);
            window.addEventListener('lumi:admin-data',listener);
            return ()=>{observer.disconnect();window.removeEventListener('lumi:content',listener);window.removeEventListener('lumi:admin-data',listener);};
        },
        async load(scope,force=false) {
            referenceRequireAdmin();
            if(force&&['bookings','overview'].includes(scope))adminStudioFoglalasKartyak.clear();
            if(['notifications','overview','bookings'].includes(scope))await Promise.all([adminPanelAdatokBetoltese('foglalasok',force),referenceLoadGuestEvents()]);
            else if(scope==='logs')await referenceLoadErrorLogs(true,true);
            else if(scope==='content'||scope==='gallery'){await window.LumiAdminCms.load(force);referenceCheckCms();}
            else await adminPanelAdatokBetoltese(referenceLoaders[scope] || 'attekintes',force);
            if (['overview','bookings','notifications'].includes(scope)) await referenceLoadNotificationReads(force);
            if(scope!=='logs')await referenceLoadErrorLogs(false,force);
            referenceCheckStatus();
            return referenceSnapshot();
        },
        async signOut(){ await kijelentkezes(); },
        async saveBookings(changes) {
            referenceRequireAdmin();
            for(const change of changes){const item=referenceItem(change.id),card=adminStudioFoglalasKartya(item);
                if(change.status)card.querySelector('[data-foglalas-statusz]').value=originalStatus(change.status,item.tipus);
                for(const [field,value] of Object.entries({date:change.date,time:change.time,endTime:change.endTime,note:change.note})){
                    const input=idopontMezo(card,({date:'date',time:'start_time',endTime:'end_time',note:item.tipus==='blocked'?'reason':'admin_message'})[field]);if(input&&value!==undefined)input.value=value;
                }
                if(change.paidAmountHuf!==undefined)idopontMezo(card,'paid_amount').value=change.paidAmountHuf ?? '';
            }
            await foglalasStatuszokMentese({recordKeys:changes.map(change=>referenceKey(referenceItem(change.id)))});referenceCheckStatus();return referenceSnapshot();
        },
        async savePayment(id,amount) {
            referenceRequireAdmin();const item=referenceItem(id),card=adminStudioFoglalasKartya(item);
            idopontMezo(card,'paid_amount').value=amount ?? '';await adminStudioFizetesMentese(card);referenceCheckStatus();return referenceSnapshot();
        },
        async removeBooking(id) {
            referenceRequireAdmin();const item=referenceItem(id);
            const deleted=await rekordTorlese(item.tipus==='blocked'?'blocked_times':'bookings',item.adat.id,foglalasokBetoltese);
            if(!deleted)throw new Error('Az időpont törlése nem sikerült.');allapot.foglalasElemek=allapot.foglalasElemek.filter(row=>referenceId(row)!==id);return referenceSnapshot();
        },
        async removeInspirations(id){referenceRequireAdmin();const item=referenceItem(id);if(item.tipus!=='booking')return referenceSnapshot();if(!await foglalasInspiraciokTorlese(adminStudioFoglalasKartya(item)))throw new Error('Az inspirációs képek törlése nem sikerült.');await foglalasokBetoltese();return referenceSnapshot();},
        async acknowledge(id) {
            referenceRequireAdmin();const item=referenceItem(id);if(item.tipus!=='booking')return referenceSnapshot();
            const booking=referenceBooking(item);
            if(booking.status!=='guest_cancelled'||booking.cancellationAcknowledgedAt)return referenceSnapshot();
            const {error}=await allapot.kliens.from('booking_events').insert({booking_id:item.adat.id,event_type:'customer_cancellation_acknowledged',channel:'admin',status:'success',title:'Vendéglemondás tudomásul véve',message:'Az admin a lemondást átnézte és tudomásul vette.',metadata:{}});
            if(error)throw new Error('A nyugtázás nem sikerült.');
            // A refresh that began before the insert cannot confirm this write.
            const pending=adminFolyamatbanLevoKeresek.get('foglalasokBetoltese');
            if(pending)await pending;
            await foglalasokBetoltese();referenceCheckStatus();return referenceSnapshot();
        },
        async markNotificationsRead(ids) {
            referenceRequireAdmin();
            const owner=referenceNotificationState();
            await referenceLoadNotificationReads();
            referenceRequireAdmin();
            if(referenceNotificationState()!==owner)throw new Error('A belépés megváltozott. Nyisd meg újra az értesítéseket.');
            const next=new Set(referenceNotificationReadIds);
            for(const id of ids)if(typeof id==='string')next.add(id);
            if(next.size===referenceNotificationReadIds.size)return referenceSnapshot();
            const readIds=Array.from(next).slice(-5000);
            const {error}=await allapot.kliens.from('booking_events').insert({
                booking_id:null,event_type:'admin_notifications_read',channel:'admin',status:'success',
                title:'Értesítések olvasottnak jelölve',message:'A megnyitott értesítések olvasottsága mentve.',
                metadata:{admin_user_id:owner,read_notice_ids:readIds}
            });
            if(error)throw new Error('Az értesítések olvasottsága nem menthető. Próbáld újra.');
            if(referenceNotificationState()===owner){referenceNotificationReadIds=new Set(readIds);referenceNotificationsLoaded=true;}
            return referenceSnapshot();
        },
        async createManual(form) {
            referenceRequireAdmin();await szolgaltatasokBetoltese();const e=adminElemek();
            e.tiltasDatum.value=form.date;e.tiltasKezdes.value=form.time;e.tiltasVege.value=form.endTime;e.tiltasOk.value=form.guestName;
            e.tiltasSzolgaltatas.value=form.serviceIds[0] || '';await tiltasHozzaadas();referenceCheckStatus();await foglalasokBetoltese();return referenceSnapshot();
        },
        async saveServices(rows) {
            referenceRequireAdmin();const list=adminElemek().szolgaltatasLista;window.LumiAdminSheet?.resetWithin(list);list.replaceChildren();
            for(const row of rows.filter(row=>!(row._new&&row._delete))){const card=szolgaltatasKartya(szolgaltatasArNormalizalasa(row)),existing=allapot.szolgaltatasok.find(item=>item.id===row.id);if(row._new&&!existing)card.dataset.draftNew='true';else card.dataset.editorVersion=(row._new?existing?.editor_version:row.editor_version)||'';if(row._delete)card.dataset.draftDelete='true';list.append(card);}
            await szolgaltatasokMentese();referenceCheckStatus();return referenceSnapshot();
        },
        async saveCoupons(rows) {
            referenceRequireAdmin();const list=document.getElementById('admin-kupon-lista');window.LumiAdminSheet?.resetWithin(list);list.replaceChildren();
            for(const row of rows.filter(row=>!(row._new&&row._delete))){const card=kuponKartya(row);if(row._new)card.dataset.draftNew='true';if(row._delete)card.dataset.draftDelete='true';list.append(card);}
            await kuponokMentese();referenceCheckStatus();return referenceSnapshot();
        },
        async saveWindows(rows,removed=[]) {
            referenceRequireAdmin();for(const row of rows)if(!/^\d{4}-\d{2}-\d{2}$/.test(row.work_date)||!row.start_time||!row.end_time||row.end_time<=row.start_time||!Number.isInteger(Number(row.slot_step_minutes))||Number(row.slot_step_minutes)<=0)throw new Error('Adj meg érvényes dátumot, kezdést, véget és pozitív egész lépésközt.');
            for(const row of rows){const {error}=await allapot.kliens.from('availability_windows').upsert({id:row.id,work_date:row.work_date,start_time:row.start_time,end_time:row.end_time,slot_step_minutes:row.slot_step_minutes || 30,active:row.active!==false},{onConflict:'id'});if(error)throw new Error('Az egyik dátumos beosztás nem menthető.');}
            for(const id of removed){const {error}=await allapot.kliens.from('availability_windows').delete().eq('id',id);if(error)throw new Error('Az egyik beosztás törlése nem sikerült.');}
            await idosavokBetoltese();return referenceSnapshot();
        },
        async savePhone(visible){referenceRequireAdmin();adminElemek().telefonLathato.checked=visible;await beallitasokMentese();referenceCheckStatus();return referenceSnapshot();},
        async saveContent(content){referenceRequireAdmin();window.LumiAdminCms.setData(content);await window.LumiAdminCms.save();referenceCheckCms();return referenceSnapshot();},
        async upload(path,file){referenceRequireAdmin();await window.LumiAdminCms.upload(path,file);referenceCheckCms();return referenceSnapshot();},
        exportBookings(ids){referenceRequireAdmin();allapot.referenceExportBookings=(ids||referenceSnapshot().bookings.map(row=>row.id)).map(id=>{const item=referenceItem(id);return {...item.adat,__tipus:item.tipus};});try{document.querySelector('[data-admin-export="foglalasok"]')?.click();}finally{allapot.referenceExportBookings=null;}},
        async emailTest(){referenceRequireAdmin();await emailTesztekKuldese();referenceCheckStatus();},
        async acknowledgeEmailErrors(){referenceRequireAdmin();await adminV2EmailHibakNyugtazasa({disabled:false,isConnected:false});referenceCheckStatus();return referenceSnapshot();},
        async acknowledgeCancellations(){referenceRequireAdmin();await vendegLemondasokTudomasulvetele();referenceCheckStatus();return referenceSnapshot();},
        exportEvents(ids){referenceRequireAdmin();allapot.referenceExportEvents=(allapot.esemenynaploElemek||[]).filter(row=>!ids||ids.includes(row.id));try{document.querySelector('[data-admin-export="esemenyek"]')?.click();}finally{allapot.referenceExportEvents=null;}},
        async changePassword(password,repeat){referenceRequireAdmin();const e=adminElemek();e.ujJelszo.value=password;e.ujJelszoIsmet.value=repeat;try{await jelszoModositasa();const status=document.getElementById('admin-jelszo-status');if(status?.classList.contains('hiba'))throw new Error(status.textContent);}finally{e.ujJelszo.value='';e.ujJelszoIsmet.value='';}},
        calculatorChange(action,value){referenceRequireAdmin();
            if(action==='service'){arKalkulatorAllapot.szolgaltatasId=value;arKalkulatorAllapot.alapAr=arKalkulatorElsoAr(arKalkulatorAktivSzolgaltatas());}
            if(action==='base')arKalkulatorAllapot.alapAr=Number(value)||0;
            if(action==='coupon')arKalkulatorAllapot.kuponId=value;
            if(action==='reset')arKalkulatorUjrainditasa();
            if(action==='toggle'){const row=arKalkulatorDiszitesek().find(row=>String(row.id)===value);if(arKalkulatorAllapot.extrak.has(value))arKalkulatorAllapot.extrak.delete(value);else if(row)arKalkulatorAllapot.extrak.set(value,{szolgaltatas:row,darab:1,ar:arKalkulatorElsoAr(row)});}
            if(action==='extra'){const row=arKalkulatorAllapot.extrak.get(value.id);if(row){if(value.count!==undefined)row.darab=Math.min(99,Math.max(1,Number(value.count)||1));if(value.price!==undefined)row.ar=Number(value.price)||0;}}
            arKalkulatorRenderelese();return referenceSnapshot();
        },
        publication(action){return window.lumiPublikusHtmlFrissitesKerese?.('reference_admin',action);}
    };

    function idosavokBetoltese() {
        return adminKeresOsszevonasa('idosavokBetoltese', idosavokBetolteseLetoltese);
    }

    async function idosavokBetolteseLetoltese() {
        const ervenyes = adminKeresMunkamenetOr();
        const elemek = adminElemek();
        const { data, error } = await allapot.kliens
            .from('availability_windows')
            .select('id,work_date,start_time,end_time,slot_step_minutes,active')
            .order('work_date', { ascending: true })
            .order('start_time', { ascending: true });

        if (!ervenyes()) return false;
        if (error) {
            onlineStatusz('Nem sikerült betölteni a dátumos idősávokat. Futtasd a dátumos Supabase migrációt.', true);
            return false;
        }

        elemek.idosavLista.innerHTML = '';
        allapot.referenceWindows=(data || []).map(row=>({...row}));
        allapot.beosztasBetoltve = true;

        if (!data.length) {
            elemek.idosavLista.innerHTML = '<p class="admin-ures">Még nincs megadva foglalható dátum.</p>';
            adminStudioBeosztasRender();
            return false;
        }

        data.forEach(idosav => elemek.idosavLista.appendChild(idosavKartya(idosav)));
        adminStudioBeosztasRender();
        return true;
    }

    function idosavKartya(idosav) {
        const kartya = document.createElement('article');
        kartya.className = 'admin-db-kartya admin-idosav-kartya';
        kartya.dataset.id = idosav.id;

        kartya.innerHTML = `
            <div class="admin-idosav-grid">
                <label class="admin-mezo">Dátum<input type="date" data-mezo="work_date" value="${attr(idosav.work_date || maiDatum())}"></label>
                <label class="admin-mezo">Kezdés<input type="time" data-mezo="start_time" value="${attr(idosav.start_time?.slice(0, 5) || '09:00')}"></label>
                <label class="admin-mezo">Vége<input type="time" data-mezo="end_time" value="${attr(idosav.end_time?.slice(0, 5) || '18:00')}"></label>
                <button type="button" class="admin-kis-gomb admin-veszely-gomb admin-idosav-torles-x" data-idosav-torles aria-label="Törlés">×</button>
            </div>
        `;

        return kartya;
    }

    async function idosavListaKattintas(event) {
        const kartya = event.target.closest('.admin-db-kartya');

        if (!kartya) {
            return;
        }

        if (event.target.closest('[data-idosav-torles]')) {
            if (!window.confirm('Biztosan törlöd ezt a beállított napot?')) {
                return;
            }

            await rekordTorlese('availability_windows', kartya.dataset.id, idosavokBetoltese);
        }
    }

    async function idosavokOsszesTorlese() {
        if (!window.confirm('Biztosan törlöd az összes beállított foglalható napot? A meglévő foglalásokat ez nem törli.')) {
            return;
        }

        onlineStatusz('Összes beállított nap törlése...');

        const { data, error: listaHiba } = await allapot.kliens
            .from('availability_windows')
            .select('id');

        if (listaHiba) {
            onlineStatusz('Nem sikerült lekérni a törlendő napokat.', true);
            return;
        }

        const idk = (data || []).map(sor => sor.id);

        if (!idk.length) {
            onlineStatusz('Nincs törölhető beállított nap.');
            return;
        }

        const { error } = await allapot.kliens
            .from('availability_windows')
            .delete()
            .in('id', idk);

        if (error) {
            onlineStatusz('Nem sikerült törölni az összes beállított napot.', true);
            return;
        }

        onlineStatusz('Minden beállított nap törölve.');
        idosavokBetoltese();
    }

    async function idosavLepesOsszesAlkalmazasa() {
        const lepes = naptarKozosLepesErtek();

        onlineStatusz('Lépés alkalmazása minden beállított napra...');

        const { data, error: listaHiba } = await allapot.kliens
            .from('availability_windows')
            .select('id');

        if (listaHiba) {
            onlineStatusz('Nem sikerült lekérni a beállított napokat.', true);
            return;
        }

        const idk = (data || []).map(sor => sor.id);

        if (!idk.length) {
            onlineStatusz('Nincs módosítható beállított nap.');
            return;
        }

        const { error } = await allapot.kliens
            .from('availability_windows')
            .update({ slot_step_minutes: lepes })
            .in('id', idk);

        if (error) {
            onlineStatusz('Nem sikerült alkalmazni a lépést minden napra.', true);
            return;
        }

        allapot.naptarKijelolesek.forEach((ertek, datum) => {
            allapot.naptarKijelolesek.set(datum, {
                ...ertek,
                slot_step_minutes: lepes
            });
        });

        naptarKijeloltListaRenderelese();
        onlineStatusz(`A ${lepes} perces lépés minden beállított napra alkalmazva.`);
        idosavokBetoltese();
    }

    async function idosavokMentese() {
        const kartyak = Array.from(document.querySelectorAll('#admin-idosav-lista .admin-db-kartya'));

        if (!kartyak.length) {
            return;
        }

        onlineStatusz('Meglévő dátumos idősávok mentése...');

        for (const kartya of kartyak) {
            if (mezo(kartya, 'end_time').value <= mezo(kartya, 'start_time').value) {
                onlineStatusz('A sáv vége legyen később, mint a kezdés.', true);
                return;
            }

            const { error } = await allapot.kliens
                .from('availability_windows')
                .update({
                    work_date: mezo(kartya, 'work_date').value,
                    start_time: mezo(kartya, 'start_time').value,
                    end_time: mezo(kartya, 'end_time').value,
                    active: true
                })
                .eq('id', kartya.dataset.id);

            if (error) {
                onlineStatusz('Nem sikerült menteni az egyik idősávot.', true);
                return;
            }
        }

        onlineStatusz('Dátumos idősávok mentve.');
        idosavokBetoltese();
    }

    function beallitasokBetoltese() {
        return adminKeresOsszevonasa('beallitasokBetoltese', beallitasokBetolteseLetoltese);
    }

    async function beallitasokBetolteseLetoltese() {
        const ervenyes = adminKeresMunkamenetOr();
        const elemek = adminElemek();

        if (!elemek.telefonLathato) {
            return false;
        }

        const { data, error } = await allapot.kliens
            .from('site_settings')
            .select('value')
            .eq('key', 'telefon_lathato')
            .maybeSingle();

        if (error) {
            onlineStatusz('Az online beállítások még nem érhetők el. Futtasd a friss Supabase SQL-t.', true);
            elemek.telefonLathato.checked = true;
            return false;
        }

        if (!ervenyes()) return false;
        elemek.telefonLathato.checked = data?.value?.visible !== false;
        return true;
    }

    async function beallitasokMentese() {
        const elemek = adminElemek();

        if (!elemek.telefonLathato) {
            return;
        }

        onlineStatusz('Online beállítások mentése...');

        const { error } = await allapot.kliens
            .from('site_settings')
            .upsert({
                key: 'telefon_lathato',
                value: { visible: elemek.telefonLathato.checked },
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

        onlineStatusz(error ? 'Nem sikerült menteni az online beállításokat. Futtasd a friss Supabase SQL-t.' : 'Online beállítások mentve.', Boolean(error));
        if (!error) await publikusHtmlFrissitesKerese('telefon_lathatosag_mentve');
    }

    function tiltasStatuszErtek(statusz) {
        const ertek = String(statusz || '').toLowerCase();
        return ['done', 'cancelled_by_customer'].includes(ertek) ? ertek : 'blocked';
    }

    function keziSzolgaltatasAdat(tiltas) {
        const kapcsolat = tiltas?.services;
        return Array.isArray(kapcsolat) ? kapcsolat[0] || null : kapcsolat || null;
    }

    function keziSzolgaltatasNev(tiltas) {
        const szolgaltatas = keziSzolgaltatasAdat(tiltas);
        return String(szolgaltatas?.description || szolgaltatas?.name || '').trim();
    }

    function keziSzolgaltatasValasztoFrissitese() {
        const valaszto = adminElemek().tiltasSzolgaltatas;
        if (!valaszto) return;

        const elozoErtek = valaszto.value;
        const szolgaltatasok = allapot.szolgaltatasok.filter(szolgaltatas =>
            szolgaltatas.active !== false && szolgaltatas.booking_enabled !== false
        );

        valaszto.innerHTML = '<option value="">Válassz szolgáltatást…</option>' + szolgaltatasok.map(szolgaltatas => {
            const idotartam = Number(szolgaltatas.duration_minutes) > 0
                ? `${Number(szolgaltatas.duration_minutes)} perc`
                : 'egyedi időtartam';
            const reszek = [szolgaltatas.name, szolgaltatas.price_text, idotartam].filter(Boolean);
            return `<option value="${attr(szolgaltatas.id)}">${html(reszek.join(' · '))}</option>`;
        }).join('');
        valaszto.disabled = szolgaltatasok.length === 0;
        valaszto.value = szolgaltatasok.some(szolgaltatas => szolgaltatas.id === elozoErtek) ? elozoErtek : '';
    }

    function keziIdoVegeFrissitese() {
        const elemek = adminElemek();
        const szolgaltatas = allapot.szolgaltatasok.find(tetel => tetel.id === elemek.tiltasSzolgaltatas?.value);
        const kezdes = String(elemek.tiltasKezdes?.value || '').split(':').map(Number);
        const idotartam = Number(szolgaltatas?.duration_minutes) || 0;

        if (kezdes.length !== 2 || kezdes.some(Number.isNaN) || idotartam <= 0 || !elemek.tiltasVege) return;

        const vegePerc = kezdes[0] * 60 + kezdes[1] + idotartam;
        if (vegePerc >= 24 * 60) return;

        elemek.tiltasVege.value = `${String(Math.floor(vegePerc / 60)).padStart(2, '0')}:${String(vegePerc % 60).padStart(2, '0')}`;
    }

    function tiltasokBetoltese() {
        return adminKeresOsszevonasa('tiltasokBetoltese', tiltasokBetolteseLetoltese);
    }

    async function tiltasokBetolteseLetoltese() {
        const ervenyes = adminKeresMunkamenetOr();
        let { data, error } = await allapot.kliens
            .from('blocked_times')
            .select('id,starts_at,ends_at,reason,status,service_id,services(name,description,price_text,duration_minutes)')
            .order('starts_at', { ascending: false })
            .limit(200);

        if (error && adatbazisOszlopHiany(error, ['service_id'])) {
            allapot.tiltasSzolgaltatasTamogatott = false;
            ({ data, error } = await allapot.kliens
                .from('blocked_times')
                .select('id,starts_at,ends_at,reason,status')
                .order('starts_at', { ascending: false })
                .limit(200));
        } else if (!error) {
            allapot.tiltasSzolgaltatasTamogatott = true;
        }

        if (error && adatbazisOszlopHiany(error, ['status'])) {
            allapot.tiltasStatuszTamogatott = false;
            const szolgaltatasSelect = allapot.tiltasSzolgaltatasTamogatott
                ? ',service_id,services(name,description,price_text,duration_minutes)'
                : '';
            ({ data, error } = await allapot.kliens
                .from('blocked_times')
                .select(`id,starts_at,ends_at,reason${szolgaltatasSelect}`)
                .order('starts_at', { ascending: false })
                .limit(200));
        } else if (!error) {
            allapot.tiltasStatuszTamogatott = true;
        }

        if (error) {
            onlineStatusz('Nem sikerült betölteni a foglalt időket.', true);
            return false;
        }

        if (!ervenyes()) return false;
        allapot.tiltasElemek = (data || []).map(tiltas => ({
            ...tiltas,
            status: tiltasStatuszErtek(tiltas.status)
        }));

        if (allapot.tiltasOldal > tiltasOsszesOldal()) {
            allapot.tiltasOldal = tiltasOsszesOldal();
        }

        tiltasListaRenderelese();
        return true;
    }

    function tiltasOsszesOldal() {
        if (allapot.tiltasOldalMeret === 'all') return 1;
        return Math.max(1, Math.ceil(allapot.tiltasElemek.length / listaOldalMeret(allapot.tiltasOldalMeret, allapot.tiltasElemek.length)));
    }

    function tiltasLapozoHtml() {
        const osszes = tiltasOsszesOldal();
        const vanElem = allapot.tiltasElemek.length > 0;
        const oldalSzoveg = vanElem ? `${allapot.tiltasOldal} / ${osszes}` : '0 / 0';
        return `
            <div class="admin-lapozo-nav" role="group" aria-label="Kieső időszakok lapozása">
                <button type="button" class="admin-pagination-button" data-tiltas-oldal="elozo" aria-label="Előző oldal" title="Előző oldal" ${allapot.tiltasOldal <= 1 || !vanElem ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"></path></svg>
                    <span>Előző</span>
                </button>
                <span class="admin-pagination-page" aria-label="${html(oldalSzoveg)}">${html(oldalSzoveg)}</span>
                <button type="button" class="admin-pagination-button" data-tiltas-oldal="kovetkezo" aria-label="Következő oldal" title="Következő oldal" ${allapot.tiltasOldal >= osszes || !vanElem ? 'disabled' : ''}>
                    <span>Következő</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 18 6-6-6-6"></path></svg>
                </button>
            </div>
            <div class="admin-lapozo-jobb">
                <label class="admin-oldalmeret admin-pagination-size">
                    <span>Oldalanként</span>
                    ${oldalmeretGombok(allapot.tiltasOldalMeret, 'tiltas-oldalmeret')}
                </label>
            </div>
        `;
    }

    function tiltasLapozoRenderelese() {
        const elemek = adminElemek();
        if (elemek.tiltasLapozo) {
            elemek.tiltasLapozo.innerHTML = tiltasLapozoHtml();
        }
    }

    function tiltasListaRenderelese() {
        const elemek = adminElemek();
        if (!elemek.tiltasLista) return;

        const meret = listaOldalMeret(allapot.tiltasOldalMeret, allapot.tiltasElemek.length);
        const kezd = allapot.tiltasOldalMeret === 'all' ? 0 : (allapot.tiltasOldal - 1) * meret;
        const oldalElemek = allapot.tiltasOldalMeret === 'all'
            ? allapot.tiltasElemek
            : allapot.tiltasElemek.slice(kezd, kezd + meret);

        elemek.tiltasLista.innerHTML = '';

        if (!oldalElemek.length) {
            elemek.tiltasLista.innerHTML = '<p class="admin-ures">Nincs külön felvett foglalt idő.</p>';
            tiltasLapozoRenderelese();
            return;
        }

        oldalElemek.forEach(tiltas => elemek.tiltasLista.appendChild(tiltasKartya(tiltas)));
        tiltasLapozoRenderelese();
    }

    function tiltasLapozoKattintas(event) {
        const meretValaszto = event.target.closest('[data-tiltas-oldalmeret]');
        if (meretValaszto) {
            if (event.type === 'click' && meretValaszto.tagName === 'SELECT') return;
            allapot.tiltasOldalMeret = meretValaszto.value || 10;
            allapot.tiltasOldal = 1;
            tiltasListaRenderelese();
            return;
        }

        const gomb = event.target.closest('[data-tiltas-oldal]');
        if (!gomb || gomb.disabled) return;

        const osszes = tiltasOsszesOldal();
        allapot.tiltasOldal = gomb.dataset.tiltasOldal === 'elozo'
            ? Math.max(1, allapot.tiltasOldal - 1)
            : Math.min(osszes, allapot.tiltasOldal + 1);
        tiltasListaRenderelese();
    }

    function tiltasKartya(tiltas) {
        const kartya = document.createElement('article');
        kartya.className = 'admin-db-kartya';
        kartya.dataset.id = tiltas.id;
        const megjegyzes = tiltas.reason?.trim() || 'Kézi foglalás';
        const szolgaltatas = keziSzolgaltatasNev(tiltas);
        kartya.innerHTML = `
            <div class="admin-db-kartya-fej">
                <div>
                    <span class="admin-kartya-tipus">Kézzel felvett idő</span>
                    <h3>${html(megjegyzes)}</h3>
                    <p>${szolgaltatas ? `${html(szolgaltatas)} · ` : ''}${html(datumIdoRovid(tiltas.starts_at))} - ${html(datumIdoRovid(tiltas.ends_at, true))}</p>
                </div>
                <button type="button" class="admin-kis-gomb admin-veszely-gomb" data-tiltas-torles>Törlés</button>
            </div>
        `;

        return kartya;
    }
    async function tiltasHozzaadas() {
        const elemek = adminElemek();
        const megjegyzes = elemek.tiltasOk.value.trim();
        const szolgaltatasId = elemek.tiltasSzolgaltatas?.value || '';
        const szolgaltatas = allapot.szolgaltatasok.find(tetel => tetel.id === szolgaltatasId);

        if (!elemek.tiltasDatum.value || !elemek.tiltasKezdes.value || !elemek.tiltasVege.value || !szolgaltatas || !megjegyzes) {
            onlineStatusz('Add meg a dátumot, a kezdést, a végét, a szolgáltatást és a név / megjegyzés mezőt.', true);
            return;
        }

        if (elemek.tiltasVege.value <= elemek.tiltasKezdes.value) {
            onlineStatusz('A foglalt idő vége legyen később, mint a kezdés.', true);
            return;
        }

        onlineStatusz('Kézi foglalt idő mentése...');

        const ujTiltas = {
            starts_at: helyiDatumIdoIso(elemek.tiltasDatum.value, elemek.tiltasKezdes.value),
            ends_at: helyiDatumIdoIso(elemek.tiltasDatum.value, elemek.tiltasVege.value),
            reason: megjegyzes,
            status: 'blocked',
            service_id: szolgaltatasId
        };

        const utkozesHiba = await idopontUtkozesHiba({
            tipus: 'blocked',
            nev: megjegyzes,
            startsAt: ujTiltas.starts_at,
            endsAt: ujTiltas.ends_at,
            statusz: ujTiltas.status
        });

        if (utkozesHiba) {
            onlineStatusz(utkozesHiba, true);
            return;
        }

        let { error } = await allapot.kliens.from('blocked_times').insert(ujTiltas);

        if (error && adatbazisOszlopHiany(error, ['service_id'])) {
            allapot.tiltasSzolgaltatasTamogatott = false;
            onlineStatusz('A szolgáltatás mentéséhez előbb telepíteni kell a kézi időpont szolgáltatás-frissítését.', true);
            return;
        }

        if (error && adatbazisOszlopHiany(error, ['status'])) {
            allapot.tiltasStatuszTamogatott = false;
            const { status: _status, ...regiSemaAdat } = ujTiltas;
            ({ error } = await allapot.kliens.from('blocked_times').insert(regiSemaAdat));
        }

        if (error) {
            onlineStatusz('Nem sikerült menteni a kézi foglalt időt.', true);
            return;
        }

        elemek.tiltasForm.reset();
        idosavAlapertelmezes(adminElemek());
        onlineStatusz(`A kézi foglalt idő mentve: ${szolgaltatas.name}. A státuszát a Foglalások nézetben módosíthatod.`);
        allapot.tiltasOldal = 1;
        tiltasokBetoltese();
        foglalasokBetoltese();
    }
    async function tiltasListaKattintas(event) {
        const kartya = event.target.closest('.admin-db-kartya');

        if (!kartya || !event.target.closest('[data-tiltas-torles]')) {
            return;
        }

        await rekordTorlese('blocked_times', kartya.dataset.id, () => {
            tiltasokBetoltese();
            foglalasokBetoltese();
        });
    }
    async function rekordTorlese(tabla, id, frissites) {
        if (!id) {
            return false;
        }

        onlineStatusz('Törlés...');

        const { error } = await allapot.kliens
            .from(tabla)
            .delete()
            .eq('id', id);

        if (error) {
            onlineStatusz('Nem sikerült törölni. Lehet, hogy más adat még hivatkozik rá.', true);
            return false;
        }

        onlineStatusz('Törölve.');
        await frissites();
        return true;
    }

    function adminTabValtas(tab) {
        allapot.aktivTab = tab || 'foglalasok';
        adminPanelAdatokBetoltese(allapot.aktivTab).catch(() => onlineStatusz('Az adatok nem tölthetők be.', true));
        const aktivTab = allapot.aktivTab;
        const mentesFeliratok = {
            foglalasok: 'Módosítások mentése',
            szolgaltatasok: 'Árlista mentése',
            kuponok: 'Kuponok mentése',
            idosavok: 'Dátumok mentése',
            tiltasok: 'Új kézi idő mentése',
            esemenynaplo: 'Napló frissítése',
            emailteszt: 'E-mail tesztek küldése',
            szovegek: 'Tartalom mentése'
        };

        document.querySelectorAll('.admin-tab').forEach(gomb => {
            const aktiv = gomb.dataset.adminTab === aktivTab;
            gomb.classList.toggle('aktiv', aktiv);
            gomb.setAttribute('role', 'tab');
            gomb.setAttribute('aria-selected', String(aktiv));
        });

        document.querySelectorAll('.admin-db-panel').forEach(panel => {
            const aktiv = panel.id === `admin-panel-${aktivTab}`;
            panel.classList.toggle('aktiv', aktiv);
            panel.setAttribute('aria-hidden', String(!aktiv));
        });

        const mentes = adminElemek().lebegoMentes;
        if (mentes) {
            mentes.textContent = mentesFeliratok[aktivTab] || 'Mentés';
            mentes.setAttribute('aria-label', mentes.textContent);
            mentes.hidden = ['emailteszt', 'arkalkulator'].includes(aktivTab) || !allapot.session;
        }
    }
    async function emailTesztekKuldese() {
        const elemek = adminElemek();
        const gomb = elemek.emailTesztKuldes;
        const token = allapot.session?.access_token || '';

        if (!gomb || !token) {
            emailTesztStatusz('A teszt e-mailek k\u00fcld\u00e9s\u00e9hez jelentkezz be \u00fajra.', true);
            onlineStatusz('A munkamenet lej\u00e1rt. Jelentkezz be \u00fajra.', true);
            return;
        }

        const jovahagyva = window.confirm(
            'A rendszer 9 teszt e-mailt k\u00fcld a luminails.xx@gmail.com c\u00edmre. Folytatod?'
        );

        if (!jovahagyva) {
            return;
        }

        const eredetiFelirat = gomb.textContent;
        gomb.disabled = true;
        gomb.textContent = 'K\u00fcld\u00e9s folyamatban\u2026';
        emailTesztStatusz('A 9 teszt e-mail k\u00fcld\u00e9se folyamatban van. Ez n\u00e9h\u00e1ny m\u00e1sodpercet ig\u00e9nybe vehet.');

        try {
            const { data, error } = await allapot.kliens.functions.invoke('send-email-previews', {
                body: { request_source: 'admin' },
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });

            if (error) {
                throw new Error(await edgeFunctionHibaUzenet(error));
            }

            const elkuldve = Number(data?.sent || 0);
            const hibas = Number(data?.failed || 0);

            if (!data?.ok || hibas > 0 || elkuldve !== 9) {
                const reszletek = Array.isArray(data?.delivery)
                    ? data.delivery.filter(item => !item.ok).map(item => item.label || item.type).filter(Boolean).join(', ')
                    : '';
                throw new Error(
                    reszletek
                        ? 'Nem ment ki minden teszt e-mail. Hib\u00e1s: ' + reszletek + '.'
                        : 'Csak ' + elkuldve + ' / 9 teszt e-mail ment ki.'
                );
            }

            const cimzett = data.recipient || 'luminails.xx@gmail.com';
            const uzenet = 'Mind a 9 teszt e-mail elk\u00fcldve a ' + cimzett + ' c\u00edmre.';
            emailTesztStatusz(uzenet);
            onlineStatusz(uzenet);
        } catch (error) {
            const uzenet = error instanceof Error ? error.message : 'Nem siker\u00fclt elk\u00fcldeni a teszt e-maileket.';
            emailTesztStatusz(uzenet, true);
            onlineStatusz(uzenet, true);
        } finally {
            gomb.disabled = false;
            gomb.textContent = eredetiFelirat;
        }
    }

    async function edgeFunctionHibaUzenet(error) {
        const context = error?.context;

        if (context && typeof context.clone === 'function') {
            try {
                const valasz = await context.clone().json();
                if (valasz?.error) {
                    return String(valasz.error);
                }
            } catch (_hiba) {
                // A Supabase kliens alap hiba\u00fczenete marad.
            }
        }

        return String(error?.message || 'A Supabase e-mail tesztfunkci\u00f3 nem \u00e9rhet\u0151 el.');
    }

    function emailTesztStatusz(szoveg, hiba = false) {
        const elem = adminElemek().emailTesztStatusz;

        if (!elem) {
            return;
        }

        elem.textContent = szoveg;
        elem.classList.toggle('hiba', Boolean(hiba));
        elem.setAttribute('role', hiba ? 'alert' : 'status');
    }

    function adminKartyaSzerkesztesKapcsolasa(kartya, gomb) {
        const nyitva = !kartya.classList.contains('szerkeszt');
        kartya.classList.toggle('szerkeszt', nyitva);
        gomb.innerHTML = `${adminV2Ikon(nyitva ? 'close' : 'edit')}<span>${nyitva ? 'Bezárás' : 'Szerkesztés'}</span>`;
        gomb.setAttribute('aria-expanded', String(nyitva));
        if (nyitva) adminKartyaPanelMegnyitasa(kartya);
        else window.LumiAdminSheet.close();
    }

    async function idopontUtkozesHiba({ tipus, id = '', nev = '', startsAt, endsAt, statusz }) {
        const aktivBejegyzes = tipus === 'booking'
            ? ['pending', 'confirmed', 'done'].includes(statusz)
            : tiltasStatuszErtek(statusz) !== 'cancelled_by_customer';

        if (!aktivBejegyzes) {
            return '';
        }

        const sajatNev = nev.trim() || (tipus === 'booking' ? 'Név nélküli vendég' : 'Név nélküli kézi idő');
        let bookingQuery = allapot.kliens
            .from('bookings')
            .select('id,customer_name')
            .in('status', ['pending', 'confirmed', 'done'])
            .lt('starts_at', endsAt)
            .gt('ends_at', startsAt)
            .limit(1);

        if (tipus === 'booking' && id) {
            bookingQuery = bookingQuery.neq('id', id);
        }

        const { data: foglalasUtkozes, error: foglalasHiba } = await bookingQuery;

        if (foglalasHiba) {
            return 'Nem sikerült ellenőrizni az időpont ütközést.';
        }

        if (foglalasUtkozes?.length) {
            const masikNev = foglalasUtkozes[0].customer_name?.trim() || 'Név nélküli vendég';
            const sajatTipus = tipus === 'booking' ? 'foglalása' : 'kézi ideje';
            return `Nem menthető: „${sajatNev}” ${sajatTipus} ütközik „${masikNev}” foglalásával.`;
        }

        const tiltasQuery = statuszOszloppal => {
            let query = allapot.kliens
                .from('blocked_times')
                .select(statuszOszloppal ? 'id,reason,status' : 'id,reason')
                .lt('starts_at', endsAt)
                .gt('ends_at', startsAt)
                .limit(1);

            if (statuszOszloppal) {
                query = query.neq('status', 'cancelled_by_customer');
            }

            if (tipus === 'blocked' && id) {
                query = query.neq('id', id);
            }

            return query;
        };

        let { data: tiltasUtkozes, error: tiltasHiba } = await tiltasQuery(allapot.tiltasStatuszTamogatott);
        if (tiltasHiba && adatbazisOszlopHiany(tiltasHiba, ['status'])) {
            allapot.tiltasStatuszTamogatott = false;
            ({ data: tiltasUtkozes, error: tiltasHiba } = await tiltasQuery(false));
        }

        if (tiltasHiba) {
            return 'Nem sikerült ellenőrizni a kézzel felvett foglalt időket.';
        }

        if (tiltasUtkozes?.length) {
            const masikNev = tiltasUtkozes[0].reason?.trim() || 'Név nélküli kézi idő';
            const sajatTipus = tipus === 'booking' ? 'foglalása' : 'kézi ideje';
            return `Nem menthető: „${sajatNev}” ${sajatTipus} ütközik az „${masikNev}” kézzel felvett idővel.`;
        }

        return '';
    }
    function idopontModositasAdatok(kartya) {
        const datum = idopontMezo(kartya, 'date')?.value;
        const kezdes = idopontMezo(kartya, 'start_time')?.value;
        const vege = idopontMezo(kartya, 'end_time')?.value;

        if (!datum || !kezdes || !vege) {
            return { hiba: 'A módosított foglalásnál add meg a dátumot, a kezdést és a végét.' };
        }

        if (vege <= kezdes) {
            return { hiba: 'A módosított foglalás vége legyen később, mint a kezdés.' };
        }

        if (kartya.dataset.tipus === 'blocked' && !idopontMezo(kartya, 'reason')?.value.trim()) {
            return { hiba: 'A kézzel felvett foglalt időnél a név / megjegyzés mező kötelező.' };
        }

        return {
            startsAt: helyiDatumIdoIso(datum, kezdes),
            endsAt: helyiDatumIdoIso(datum, vege)
        };
    }

    function idopontMezo(kartya, nev) {
        return kartya.querySelector(`[data-idopont-mezo="${nev}"]`);
    }

    function statuszOption(ertek, cimke, aktiv) {
        return `<option value="${ertek}" ${ertek === aktiv ? 'selected' : ''}>${cimke}</option>`;
    }

    function mezo(kartya, nev) {
        return kartya.querySelector(`[data-mezo="${nev}"]`);
    }

    function szamMezo(kartya, nev) {
        const szam = Number.parseInt(mezo(kartya, nev).value, 10);
        return Number.isFinite(szam) && szam >= 0 ? szam : 0;
    }

    function isoHetNapja(datumSzovegErtek) {
        const nap = datumObjektum(datumSzovegErtek).getDay();
        return nap === 0 ? 7 : nap;
    }

    function datumObjektum(datumSzovegErtek) {
        const [ev, honap, nap] = datumSzovegErtek.split('-').map(Number);
        return new Date(ev, honap - 1, nap, 12, 0, 0);
    }

    function helyiDatumIdoIso(datumSzovegErtek, idoSzovegErtek) {
        const [ev, honap, nap] = datumSzovegErtek.split('-').map(Number);
        const [ora, perc] = idoSzovegErtek.split(':').map(Number);
        return new Date(ev, honap - 1, nap, ora, perc, 0).toISOString();
    }

    function datumSzoveg(datum) {
        const ev = datum.getFullYear();
        const honap = String(datum.getMonth() + 1).padStart(2, '0');
        const nap = String(datum.getDate()).padStart(2, '0');

        return `${ev}-${honap}-${nap}`;
    }

    function datumIdoRovid(ertek, csakIdo = false) {
        const datum = new Date(ertek);
        const nap = String(datum.getDate()).padStart(2, '0');
        const honap = String(datum.getMonth() + 1).padStart(2, '0');
        const ev = String(datum.getFullYear()).slice(-2);
        const ora = String(datum.getHours()).padStart(2, '0');
        const perc = String(datum.getMinutes()).padStart(2, '0');
        return csakIdo ? `${ora}:${perc}` : `${nap}/${honap}/${ev} ${ora}:${perc}`;
    }

    function datumInputErtek(ertek) {
        const datum = new Date(ertek);
        return datumSzoveg(datum);
    }

    function idoInputErtek(ertek) {
        const datum = new Date(ertek);
        const ora = String(datum.getHours()).padStart(2, '0');
        const perc = String(datum.getMinutes()).padStart(2, '0');

        return `${ora}:${perc}`;
    }

    function maiDatum() {
        const ma = new Date();
        const ev = ma.getFullYear();
        const honap = String(ma.getMonth() + 1).padStart(2, '0');
        const nap = String(ma.getDate()).padStart(2, '0');

        return `${ev}-${honap}-${nap}`;
    }

    function maiHonap() {
        const ma = new Date();
        const ev = ma.getFullYear();
        const honap = String(ma.getMonth() + 1).padStart(2, '0');

        return `${ev}-${honap}`;
    }

    function authStatusz(elemek, szoveg, hiba = false) {
        elemek.authStatusz.textContent = szoveg;
        elemek.authStatusz.classList.toggle('hiba', Boolean(hiba));
    }

    function onlineStatusz(szoveg, hiba = false) {
        const elem = document.getElementById('admin-online-status');

        if (!elem) {
            return;
        }

        window.clearTimeout(onlineStatusz.elrejtesIdozito);
        window.clearTimeout(onlineStatusz.uritesIdozito);
        window.cancelAnimationFrame(onlineStatusz.megjelenitesKeret);
        elem.classList.remove('admin-toast-lathato');

        if (!szoveg) {
            elem.textContent = '';
            elem.classList.remove('hiba');
            return;
        }

        elem.textContent = szoveg;
        elem.classList.toggle('hiba', Boolean(hiba));
        elem.setAttribute('role', hiba ? 'alert' : 'status');
        elem.setAttribute('aria-live', hiba ? 'assertive' : 'polite');

        onlineStatusz.megjelenitesKeret = window.requestAnimationFrame(() => {
            elem.classList.add('admin-toast-lathato');
        });

        onlineStatusz.elrejtesIdozito = window.setTimeout(() => {
            elem.classList.remove('admin-toast-lathato');
            onlineStatusz.uritesIdozito = window.setTimeout(() => {
                if (!elem.classList.contains('admin-toast-lathato')) {
                    elem.textContent = '';
                    elem.classList.remove('hiba');
                }
            }, 220);
        }, 5000);
    }

    window.lumiAdminStatusz = onlineStatusz;

    function naptarStatusz(szoveg, hiba = false) {
        const elem = document.getElementById('admin-naptar-status');

        if (!elem) {
            return;
        }

        elem.textContent = szoveg;
        elem.classList.toggle('hiba', Boolean(hiba));
    }

    function jelszoStatusz(szoveg, hiba = false) {
        const elem = document.getElementById('admin-jelszo-status');

        if (!elem) {
            return;
        }

        elem.textContent = szoveg;
        elem.classList.toggle('hiba', Boolean(hiba));
    }

    function html(ertek) {
        return String(ertek || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function attr(ertek) {
        return html(ertek);
    }
})();

(() => {
    const GALLERY_GROUP = '7';
    const GALLERY_PAGE_SIZES = [10, 20, 'all'];
    let galleryMode = false;
    let internalSwitch = false;
    let refreshQueued = false;
    let galleryFilter = '';
    let galleryPage = 1;
    let galleryPageSize = 10;

    document.addEventListener('DOMContentLoaded', () => {
        const root = document.getElementById('admin-cms-root');
        if (!root) return;

        root.addEventListener('click', event => {
            const galleryTab = event.target.closest('[data-lumi-cms-gallery-tab]');
            if (galleryTab) {
                event.preventDefault();
                openGallery(root);
                return;
            }

            const pageButton = event.target.closest('[data-lumi-gallery-page]');
            if (pageButton) {
                event.preventDefault();
                const direction = pageButton.dataset.lumiGalleryPage;
                galleryPage += direction === 'prev' ? -1 : 1;
                queueRefresh(root);
                return;
            }

            const addButton = event.target.closest('[data-cms-gallery-add]');
            if (addButton) {
                const previousCount = root.querySelectorAll('.cms-gallery-item').length;
                galleryPage = 1;
                setTimeout(() => promoteNewestGalleryItem(root, previousCount), 0);
                return;
            }

            if (!internalSwitch && event.target.closest('[data-cms-view]')) {
                galleryMode = false;
                galleryPage = 1;
                queueRefresh(root);
            }
        }, true);

        root.addEventListener('change', event => {
            const pageSizeSelect = event.target.closest('[data-lumi-gallery-page-size]');
            if (pageSizeSelect) {
                const value = pageSizeSelect.value;
                galleryPageSize = value === 'all' ? 'all' : Number.parseInt(value, 10);
                if (!GALLERY_PAGE_SIZES.some(size => String(size) === String(galleryPageSize))) {
                    galleryPageSize = 10;
                }
                galleryPage = 1;
                queueRefresh(root);
                return;
            }

            const sectionSelect = event.target.closest('[data-cms-section-select]');
            if (!sectionSelect || internalSwitch) return;
            if (galleryMode && sectionSelect.value !== GALLERY_GROUP) galleryMode = false;
            galleryPage = 1;
            queueRefresh(root);
        }, true);

        root.addEventListener('input',event=>{if(event.target.matches('[data-gallery-filter]')){galleryFilter=event.target.value;galleryPage=1;queueRefresh(root);}});
        const observer = new MutationObserver(() => queueRefresh(root));
        observer.observe(root, { childList: true, subtree: true });
        queueRefresh(root);
    });

    function openGallery(root) {
        galleryMode = true;
        galleryPage = 1;
        const oldalakTab = root.querySelector('[data-cms-view="oldalak"]');
        if (!oldalakTab) return;

        internalSwitch = true;
        oldalakTab.click();
        internalSwitch = false;

        const sectionSelect = root.querySelector('[data-cms-section-select]');
        if (sectionSelect && sectionSelect.value !== GALLERY_GROUP) {
            internalSwitch = true;
            sectionSelect.value = GALLERY_GROUP;
            sectionSelect.dispatchEvent(new Event('change', { bubbles: true }));
            internalSwitch = false;
        }

        queueRefresh(root);
    }

    function queueRefresh(root) {
        if (refreshQueued) return;
        refreshQueued = true;
        requestAnimationFrame(() => {
            refreshQueued = false;
            enhance(root);
        });
    }

    function enhance(root) {
        const tabs = root.querySelector('.cms-view-tabs');
        if (!tabs) return;

        tabs.classList.add('admin-segmented');
        tabs.querySelectorAll('.cms-view-tab').forEach(button => button.classList.add('admin-segmented-item'));

        let galleryTab = tabs.querySelector('[data-lumi-cms-gallery-tab]');
        if (!galleryTab) {
            galleryTab = document.createElement('button');
            galleryTab.type = 'button';
            galleryTab.className = 'cms-view-tab cms-view-tab-gallery admin-segmented-item';
            galleryTab.dataset.lumiCmsGalleryTab = 'true';
            galleryTab.setAttribute('role', 'tab');
            galleryTab.setAttribute('aria-selected', 'false');
            galleryTab.innerHTML = '<span>Galéria képek</span>';

            const oldalakTab = tabs.querySelector('[data-cms-view="oldalak"]');
            if (oldalakTab) oldalakTab.insertAdjacentElement('afterend', galleryTab);
            else tabs.appendChild(galleryTab);
        }

        const sectionSelect = root.querySelector('[data-cms-section-select]');
        const galleryGroupOpen = sectionSelect?.value === GALLERY_GROUP;
        const context = galleryMode && galleryGroupOpen
            ? 'images'
            : galleryGroupOpen
                ? 'page'
                : '';

        if (context) root.dataset.lumiCmsGalleryContext = context;
        else delete root.dataset.lumiCmsGalleryContext;

        galleryTab.setAttribute('aria-selected', String(context === 'images'));
        galleryTab.classList.toggle('is-gallery-active', context === 'images');

        if (context === 'images') {
            tabs.querySelectorAll('[data-cms-view]').forEach(button => {
                button.setAttribute('aria-selected', 'false');
            });

            const title = root.querySelector('.cms-active-title');
            if (title) title.textContent = 'Galéria képek';

            moveGalleryChoicesIntoControls(root);
            renderGalleryPagination(root);
            return;
        }

        root.querySelector('[data-lumi-gallery-pagination]')?.remove();
        root.querySelectorAll('.cms-gallery-item[hidden]').forEach(item => {
            item.hidden = false;
        });
    }

    function moveGalleryChoicesIntoControls(root) {
        root.querySelectorAll('.cms-gallery-item').forEach(item => {
            const controls = item.querySelector('.cms-image-controls');
            const choices = Array.from(item.children)
                .filter(child => child.classList?.contains('cms-gallery-choice')
                    || child.classList?.contains('cms-gallery-home-choice')
                    || child.classList?.contains('cms-gallery-nail-art-choice'));
            if (!controls || !choices.length) return;

            choices.forEach(choice => {
                const label = choice.querySelector('span');
                if (label && choice.classList.contains('cms-gallery-home-choice')) {
                    label.textContent = 'Megjelenjen a főoldalon';
                }
                if (label && choice.classList.contains('cms-gallery-nail-art-choice')) {
                    label.textContent = 'Megjelenjen a Nail Art oldalon';
                }
                controls.appendChild(choice);
            });
        });
    }

    function renderGalleryPagination(root) {
        const header = root.querySelector('.cms-gallery-header');
        const list = root.querySelector('.cms-gallery-list');
        if (!header || !list) return;

        let pagination = header.querySelector('[data-lumi-gallery-pagination]');
        if (!pagination) {
            pagination = document.createElement('div');
            pagination.className = 'cms-gallery-pagination';
            pagination.dataset.lumiGalleryPagination = 'true';
            pagination.innerHTML = `
                <div class="admin-lapozo-nav" aria-label="Galéria oldalak">
                    <button type="button" class="admin-pagination-button" data-lumi-gallery-page="prev" aria-label="Előző galériaoldal" title="Előző oldal">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"></path></svg>
                    </button>
                    <span class="admin-pagination-page" data-lumi-gallery-page-label>1 / 1</span>
                    <button type="button" class="admin-pagination-button" data-lumi-gallery-page="next" aria-label="Következő galériaoldal" title="Következő oldal">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 18 6-6-6-6"></path></svg>
                    </button>
                </div>
                <label class="admin-oldalmeret admin-pagination-size">
                    <span>Oldalanként</span>
                    <select class="admin-oldalmeret-select" data-lumi-gallery-page-size aria-label="Oldalanként">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="all">Összes</option>
                    </select>
                </label>
            `;

            const addButton = header.querySelector('[data-cms-gallery-add]');
            if (addButton) header.insertBefore(pagination, addButton);
            else header.appendChild(pagination);
        }

        let filter=header.querySelector('[data-gallery-filter]');if(!filter){const label=document.createElement('label');label.className='admin-mezo cms-gallery-search';label.innerHTML='Képek keresése<input type="search" data-gallery-filter placeholder="Kép leírása">';header.append(label);filter=label.querySelector('input');filter.value=galleryFilter;}
        const all=Array.from(list.querySelectorAll(':scope > .cms-gallery-item'));
        const items=all.filter(item=>Array.from(item.querySelectorAll('[data-cms-path]')).map(input=>input.value).join(' ').toLocaleLowerCase('hu-HU').includes(galleryFilter.trim().toLocaleLowerCase('hu-HU')));all.forEach(item=>{if(!items.includes(item))item.hidden=true;});
        const total = items.length;
        const size = galleryPageSize === 'all'
            ? Math.max(1, total)
            : Math.max(1, Number.parseInt(galleryPageSize, 10) || 10);
        const totalPages = total ? Math.max(1, Math.ceil(total / size)) : 1;
        galleryPage = Math.min(Math.max(1, galleryPage), totalPages);
        const start = galleryPageSize === 'all' ? 0 : (galleryPage - 1) * size;
        const end = galleryPageSize === 'all' ? total : start + size;

        items.forEach((item, index) => {
            item.hidden = index < start || index >= end;
        });

        const select = pagination.querySelector('[data-lumi-gallery-page-size]');
        if (select) select.value = String(galleryPageSize);

        const label = pagination.querySelector('[data-lumi-gallery-page-label]');
        if (label) label.textContent = total ? `${galleryPage} / ${totalPages}` : '0 / 0';

        const previous = pagination.querySelector('[data-lumi-gallery-page="prev"]');
        const next = pagination.querySelector('[data-lumi-gallery-page="next"]');
        if (previous) previous.disabled = !total || galleryPage <= 1;
        if (next) next.disabled = !total || galleryPage >= totalPages;
    }

    function promoteNewestGalleryItem(root, previousCount) {
        const items = Array.from(root.querySelectorAll('.cms-gallery-item'));
        if (items.length !== previousCount + 1) {
            queueRefresh(root);
            return;
        }

        for (let index = items.length - 1; index > 0; index -= 1) {
            const moveUp = root.querySelector(`[data-cms-gallery-move="up"][data-index="${index}"]`);
            if (!moveUp) break;
            moveUp.click();
        }

        galleryPage = 1;
        queueRefresh(root);
    }
})();

(() => {
    let returnFocus = null;

    const ICONS = {
        imageUp: `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7.3"></path>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"></path>
                <path d="M19 22v-6"></path>
                <path d="m22 19-3-3-3 3"></path>
            </svg>`,
        plus: `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
            </svg>`,
        trash: `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M3 6h18"></path>
                <path d="M8 6V4h8v2"></path>
                <path d="m19 6-1 14H6L5 6"></path>
                <path d="M10 11v5"></path>
                <path d="M14 11v5"></path>
            </svg>`,
        up: `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 19V5"></path>
                <path d="m5 12 7-7 7 7"></path>
            </svg>`,
        down: `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 5v14"></path>
                <path d="m19 12-7 7-7-7"></path>
            </svg>`,
        close: `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12"></path>
                <path d="M18 6 6 18"></path>
            </svg>`
    };

    document.addEventListener('DOMContentLoaded', () => {
        const root = document.getElementById('admin-cms-root');
        if (!root) return;

        root.addEventListener('click', event => {
            const galleryDeleteProxy = event.target.closest('[data-cms-gallery-delete-proxy]');
            if (galleryDeleteProxy) {
                event.preventDefault();
                event.stopImmediatePropagation();
                galleryDeleteProxy.closest('.cms-gallery-item')
                    ?.querySelector('[data-cms-gallery-delete].cms-gallery-delete-source')
                    ?.click();
                return;
            }

            const preview = event.target.closest('.cms-image-preview[data-cms-preview]');
            if (!preview) return;

            if (preview.querySelector('img')) {
                event.preventDefault();
                openLightbox(preview);
                return;
            }

            const upload = galleryUploadInput(preview);
            if (upload) {
                event.preventDefault();
                upload.click();
            }
        });

        root.addEventListener('keydown', event => {
            const preview = event.target.closest('.cms-image-preview[data-cms-preview]');
            if (!preview || (event.key !== 'Enter' && event.key !== ' ')) return;

            if (preview.querySelector('img')) {
                event.preventDefault();
                openLightbox(preview);
                return;
            }

            const upload = galleryUploadInput(preview);
            if (upload) {
                event.preventDefault();
                upload.click();
            }
        });

        const observer = new MutationObserver(enhanceImageWorkspaces);
        observer.observe(root, { childList: true, subtree: true });
        enhanceImageWorkspaces();

        function enhanceImageWorkspaces() {
            placeGalleryActionsInImageControls();
            removeLegacyTallTileControls();
            enhanceImageControls();
            enhancePreviews();
        }

        function placeGalleryActionsInImageControls() {
            root.querySelectorAll('.cms-gallery-item').forEach(item => {
                const imageControls = item.querySelector('.cms-image-field .cms-image-controls');
                if (!imageControls) return;

                const actions = Array.from(item.children)
                    .find(child => child.classList?.contains('cms-gallery-actions'));
                if (actions) imageControls.appendChild(actions);
            });
        }

        function removeLegacyTallTileControls() {
            root.querySelectorAll('.cms-gallery-item').forEach(item => {
                Array.from(item.children).forEach(child => {
                    if (child.matches?.('label') && child.querySelector('[data-cms-path$=".magas"]')) child.remove();
                });
            });
        }

        function enhanceImageControls() {
            root.querySelectorAll('.cms-image-field').forEach(field => {
                const galleryItem = field.closest('.cms-gallery-item');
                const controls = field.querySelector('.cms-image-controls');
                if (!controls) return;

                const upload = controls.querySelector('.cms-upload-button');
                const remove = controls.querySelector('[data-cms-remove-image]');

                if (galleryItem) {
                    if (upload) {
                        removeTextNodes(upload);
                        upload.classList.remove('cms-icon-button', 'admin-control-icon-button');
                        upload.classList.add('cms-gallery-upload-proxy');
                        upload.setAttribute('aria-hidden', 'true');
                        upload.removeAttribute('title');
                    }

                    if (remove) {
                        remove.dataset.cmsGalleryDeleteProxy = 'true';
                        iconifyButton(remove, 'trash', 'Galériakép törlése', true);
                    }

                    const actions = controls.querySelector('.cms-gallery-actions');
                    const up = actions?.querySelector('[data-cms-gallery-move="up"]');
                    const down = actions?.querySelector('[data-cms-gallery-move="down"]');
                    const deletion = actions?.querySelector('[data-cms-gallery-delete]');
                    const items = Array.from(root.querySelectorAll('.cms-gallery-item'));
                    const index = items.indexOf(galleryItem);

                    if (up) {
                        iconifyButton(up, 'up', 'Feljebb');
                        up.disabled = index <= 0;
                    }
                    if (down) {
                        iconifyButton(down, 'down', 'Lejjebb');
                        down.disabled = index < 0 || index >= items.length - 1;
                    }
                    if (deletion) {
                        deletion.classList.add('cms-gallery-delete-source');
                        deletion.setAttribute('aria-hidden', 'true');
                        deletion.tabIndex = -1;
                    }
                    return;
                }

                if (upload) iconifyUploadLabel(upload, 'imageUp', 'Kép feltöltése');
                if (remove) iconifyButton(remove, 'trash', 'Kép eltávolítása', true);
            });

            const add = root.querySelector('[data-cms-gallery-add]');
            if (add) iconifyButton(add, 'plus', 'Új galériakép');
        }

        function enhancePreviews() {
            root.querySelectorAll('.cms-image-preview[data-cms-preview]').forEach(preview => {
                const hasImage = Boolean(preview.querySelector('img'));
                const canUpload = Boolean(galleryUploadInput(preview));
                preview.classList.toggle('cms-image-preview-interactive', hasImage);
                preview.dataset.cmsUploadTarget = String(!hasImage && canUpload);

                if (hasImage) {
                    preview.setAttribute('role', 'button');
                    preview.tabIndex = 0;
                    preview.setAttribute('aria-label', 'Kép nagyítása');
                    preview.title = 'Kép nagyítása';
                } else if (canUpload) {
                    preview.setAttribute('role', 'button');
                    preview.tabIndex = 0;
                    preview.setAttribute('aria-label', 'Kép feltöltése');
                    preview.title = 'Kép feltöltése';
                } else {
                    preview.removeAttribute('role');
                    preview.removeAttribute('tabindex');
                    preview.removeAttribute('aria-label');
                    preview.removeAttribute('title');
                }
            });
        }
    });

    function galleryUploadInput(preview) {
        return preview.closest('.cms-gallery-item')
            ?.querySelector('.cms-upload-button input[data-cms-upload]') || null;
    }

    function removeTextNodes(element) {
        Array.from(element.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .forEach(node => node.remove());
    }

    function iconifyUploadLabel(label, icon, accessibleLabel) {
        const marker = `${icon}:${accessibleLabel}`;
        if (label.dataset.cmsIconified === marker) return;
        removeTextNodes(label);
        label.querySelector('svg')?.remove();
        label.insertAdjacentHTML('afterbegin', ICONS[icon]);
        label.classList.add('cms-icon-button', 'admin-control-icon-button');
        label.setAttribute('aria-label', accessibleLabel);
        label.title = accessibleLabel;
        label.dataset.cmsIconified = marker;
    }

    function iconifyButton(button, icon, accessibleLabel, danger = false) {
        const marker = `${icon}:${accessibleLabel}:${danger}`;
        if (button.dataset.cmsIconified === marker) return;
        button.innerHTML = ICONS[icon];
        button.classList.add('cms-icon-button', 'admin-control-icon-button');
        button.classList.toggle('cms-icon-button-danger', danger);
        button.setAttribute('aria-label', accessibleLabel);
        button.title = accessibleLabel;
        button.dataset.cmsIconified = marker;
    }

    function ensureLightbox() {
        let lightbox = document.getElementById('cms-image-lightbox');
        if (lightbox) return lightbox;

        lightbox = document.createElement('dialog');
        lightbox.id = 'cms-image-lightbox';
        lightbox.className = 'cms-image-lightbox';
        lightbox.hidden = true;
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Kép nagyított megtekintése');
        lightbox.innerHTML = `
            <button type="button" class="cms-image-lightbox-close" data-cms-image-lightbox-close aria-label="Nagyított kép bezárása" title="Bezárás">${ICONS.close}</button>
            <div class="cms-image-lightbox-stage">
                <img class="cms-image-lightbox-image" data-cms-image-lightbox-image alt="">
            </div>
        `;

        lightbox.addEventListener('click', event => {
            if (event.target === lightbox || event.target.closest('[data-cms-image-lightbox-close]')) {
                closeLightbox();
            }
        });

        lightbox.addEventListener('cancel', event => {
            event.preventDefault();
            event.stopPropagation();
            closeLightbox();
        });

        document.body.appendChild(lightbox);
        return lightbox;
    }

    function openLightbox(preview) {
        const source = preview.querySelector('img');
        if (!source) return;

        const lightbox = ensureLightbox();
        const image = lightbox.querySelector('[data-cms-image-lightbox-image]');
        image.src = source.currentSrc || source.src;
        image.alt = source.alt || 'Nagyított kép';
        returnFocus = preview;
        lightbox.hidden = false;
        lightbox.showModal();
        document.body.classList.add('cms-image-lightbox-open');
        requestAnimationFrame(() => lightbox.querySelector('[data-cms-image-lightbox-close]')?.focus({ preventScroll: true }));
    }

    function closeLightbox() {
        const lightbox = document.getElementById('cms-image-lightbox');
        if (!lightbox || lightbox.hidden) return;
        lightbox.hidden = true;
        lightbox.close();
        document.body.classList.remove('cms-image-lightbox-open');
        returnFocus?.focus?.({ preventScroll: true });
        returnFocus = null;
    }
})();

(() => {
    const INTERAKTIV = 'button, a, input, select, textarea, label, [role="button"], [contenteditable="true"]';

    document.addEventListener('DOMContentLoaded', () => {
        const lista = document.getElementById('admin-foglalas-lista');
        if (!lista) return;

        lista.addEventListener('click', event => {
            const kartya = event.target.closest('.admin-foglalas-kartya');
            if (!kartya || !lista.contains(kartya) || event.target.closest(INTERAKTIV)) return;
            if (kartya.classList.contains('szerkeszt')) return;

            const reszletekGomb = kartya.querySelector('[data-foglalas-szerkesztes]');
            if (!reszletekGomb) return;

            reszletekGomb.click();
            window.requestAnimationFrame(() => kartyaAriaFrissitese(kartya));
        });

        lista.addEventListener('keydown', event => {
            const kartya = event.target.closest('.admin-foglalas-kartya');
            if (!kartya || event.target !== kartya || kartya.classList.contains('szerkeszt')) return;
            if (event.key !== 'Enter' && event.key !== ' ') return;

            const reszletekGomb = kartya.querySelector('[data-foglalas-szerkesztes]');
            if (!reszletekGomb) return;

            event.preventDefault();
            reszletekGomb.click();
            window.requestAnimationFrame(() => kartyaAriaFrissitese(kartya));
        });

        const observer = new MutationObserver(() => {
            lista.querySelectorAll('.admin-foglalas-kartya').forEach(kartyaElokeszitese);
        });
        observer.observe(lista, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        lista.querySelectorAll('.admin-foglalas-kartya').forEach(kartyaElokeszitese);
    });

    function kartyaElokeszitese(kartya) {
        const reszletekGomb = kartya.querySelector('[data-foglalas-reszletek]');
        if (!reszletekGomb) return;
        if (!kartya.hasAttribute('tabindex')) kartya.tabIndex = 0;
        if (!kartya.classList.contains('admin-foglalas-kartya-kattinthato')) {
            kartya.classList.add('admin-foglalas-kartya-kattinthato');
        }
        kartyaAriaFrissitese(kartya);
    }

    function kartyaAriaFrissitese(kartya) {
        const nyitott = kartya.classList.contains('admin-foglalas-kartya-nyitott');
        kartya.setAttribute('aria-expanded', String(nyitott));
        kartya.setAttribute('aria-label', nyitott ? 'Foglalás részleteinek bezárása' : 'Foglalás részleteinek megnyitása');
    }
})();
