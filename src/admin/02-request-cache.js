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
