    const FOGLALASI_LEKERES_IDOKERET_MS = 15_000;
    const FOGLALASI_KULDES_IDOKERET_MS = 30_000;

    function igeretIdokerettel(igeret, idokeret = FOGLALASI_LEKERES_IDOKERET_MS, uzenet = '') {
        let idozito = null;
        const idotullepes = new Promise((_, reject) => {
            idozito = window.setTimeout(() => {
                const hiba = new Error(uzenet || 'A kapcsolat túl lassú. Kérlek, próbáld újra.');
                hiba.code = 'LUMI_REQUEST_TIMEOUT';
                reject(hiba);
            }, idokeret);
        });

        return Promise.race([Promise.resolve(igeret), idotullepes])
            .finally(() => window.clearTimeout(idozito));
    }

    async function supabaseValaszIdokerettel(igeret, idokeret, uzenet) {
        try {
            return await igeretIdokerettel(igeret, idokeret, uzenet);
        } catch (error) {
            return { data: null, error };
        }
    }
