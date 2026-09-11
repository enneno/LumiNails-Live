const metaThemeColor = document.createElement('meta');
metaThemeColor.name = 'theme-color';
metaThemeColor.content = '#fdf4e2';
document.head.appendChild(metaThemeColor);

let galeriaAktualisIndex = 0;
let galeriaKepek = [];
let galeriaHuzasKezdoX = 0;
let galeriaHuzasKezdoY = 0;
let galeriaHuzasAktiv = false;
let galeriaElozoFokusz = null;

document.addEventListener('DOMContentLoaded', function () {
    tisztaUrlBeallitasa();
    oldalTartalomMegjelenitese();
    const oldalvaz = Promise.allSettled([fejlecBetoltese(), lablecBetoltese()]);
    Promise.all([oldalvaz, adatokBetoltese()])
        .then(([, adatok]) => {
            oldalAdatokAlkalmazasa(adatok);
            galeriaBekotese();
            Promise.allSettled([
                onlineTelefonLathatosagAlkalmazasa(),
                onlineArlistaBetoltese(),
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
    fooldalGaleriaLapozasBekotese();
    lebegoFoglalasLetrehozasa();
    lebegoFoglalasFigyeles();
});
