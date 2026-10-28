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
