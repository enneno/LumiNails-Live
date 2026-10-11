const metaThemeColor = document.createElement('meta');
metaThemeColor.name = 'theme-color';
metaThemeColor.content = '#f6f3ee';
document.head.appendChild(metaThemeColor);

let galeriaAktualisIndex = 0;
let galeriaKepek = [];
let galeriaHuzasKezdoX = 0;
let galeriaHuzasKezdoY = 0;
let galeriaHuzasAktiv = false;
let galeriaElozoFokusz = null;

// Public overlays share one scroll lock, including when two overlays overlap.
const oldalGorgetesZarok = new Set();
let oldalGorgetesPozicio = null;

function oldalGorgetesZarolasa(tulajdonos, zarolva) {
    if (zarolva) {
        if (oldalGorgetesZarok.has(tulajdonos)) return;
        if (oldalGorgetesZarok.size === 0) {
            oldalGorgetesPozicio = { x: window.scrollX, y: window.scrollY };
            document.documentElement.style.setProperty('--lumi-scrollbar-width', `${window.innerWidth - document.documentElement.clientWidth}px`);
            document.documentElement.style.setProperty('--lumi-scroll-top', `${-window.scrollY}px`);
            document.documentElement.classList.add('oldal-gorgetes-zarolva');
        }
        oldalGorgetesZarok.add(tulajdonos);
        return;
    }

    if (!oldalGorgetesZarok.delete(tulajdonos) || oldalGorgetesZarok.size > 0) return;
    document.documentElement.classList.remove('oldal-gorgetes-zarolva');
    document.documentElement.style.removeProperty('--lumi-scrollbar-width');
    document.documentElement.style.removeProperty('--lumi-scroll-top');
    window.scrollTo({ left: oldalGorgetesPozicio.x, top: oldalGorgetesPozicio.y, behavior: 'instant' });
    oldalGorgetesPozicio = null;
}

function popupGorgetesZarolasBekotese() {
    const popup = document.getElementById('sikeres-popup');
    if (!popup) return;
    const frissites = () => oldalGorgetesZarolasa('foglalas-popup', !popup.hidden && getComputedStyle(popup).display !== 'none');
    new MutationObserver(frissites).observe(popup, { attributes: true, attributeFilter: ['style', 'hidden'] });
    frissites();
}

document.addEventListener('DOMContentLoaded', function () {
    tisztaUrlBeallitasa();
    fooldalFejlecMeretBekotese();
    oldalTartalomMegjelenitese();
    const arlistaBetoltes = onlineArlistaBetoltese();
    const oldalvaz = Promise.allSettled([fejlecBetoltese(), lablecBetoltese()]);
    Promise.all([oldalvaz, adatokBetoltese()])
        .then(([, adatok]) => {
            oldalAdatokAlkalmazasa(adatok);
            galeriaBekotese();
            Promise.allSettled([
                onlineTelefonLathatosagAlkalmazasa(),
                arlistaBetoltes,
                onlineKuponokBetolteseEsMegjelenitese()
            ]);
        })
        .catch(error => {
            console.warn('Lumi Nails tartalom betöltési hiba:', error);
        })
        .finally(() => oldalTartalomMegjelenitese());
    idopontokGeneralasa();
    datumMinimumBeallitasa();
    foglalasiUrlapBekotese();
    popupGorgetesZarolasBekotese();
    fooldalStudioBekotese();
    galeriaBekotese();
    lebegoFoglalasLetrehozasa();
    lebegoFoglalasFigyeles();
});
