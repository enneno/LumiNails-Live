    async function publikusHtmlFrissitesKerese(ok = 'tartalom') {
        if (!allapot.kliens || !allapot.session) {
            return { ok: false, reason: 'nincs_admin_munkamenet' };
        }

        try {
            const elesOldal = ['luminails.hu', 'www.luminails.hu'].includes(window.location.hostname.toLowerCase());
            const frissitoFuggveny = elesOldal ? 'request-live-site-rebuild' : 'request-site-rebuild';
            const { data, error } = await allapot.kliens.functions.invoke(frissitoFuggveny, {
                body: { reason: String(ok || 'tartalom').slice(0, 80) }
            });

            if (error || data?.ok !== true) {
                console.warn('A publikus HTML frissítése nem indult el:', error || data);
                return { ok: false, reason: data?.error || error?.message || 'ismeretlen_hiba' };
            }

            return { ok: true };
        } catch (error) {
            console.warn('A publikus HTML frissítése nem indult el:', error);
            return { ok: false, reason: error?.message || 'ismeretlen_hiba' };
        }
    }

    window.lumiPublikusHtmlFrissitesKerese = publikusHtmlFrissitesKerese;
