# Házirend a navigációban

A közös fejléc asztali és mobilos menüjébe a Galéria után bekerült a Házirend link. A tablet méretű belső oldalakon a főoldal már meglévő, 8 px-es menüköze is érvényes, hogy az új linkkel se érjen össze a menü a logóval.

Módosított irányadó források: `src/html/site-header.html`, `src/styles/00-base.css`.

A közös fejléc frissült az előrenderelt HTML-ekben: `index.html`, `404.html`, `adatkezeles/index.html`, `admin/index.html`, `arlista/index.html`, `fiokom/index.html`, `foglalas/index.html`, `hazirend/index.html`, `galeria/index.html`, `gel-lakk-tatabanya/index.html`, `korom-diszites-nail-art-tatabanya/index.html`, `manikur-tatabanya/index.html`, `mukorom-epites-toltes/index.html`. Az oldalakon kizárólag a fejléc szinkronizálása és az új CSS-verzió hivatkozása változott. A tartalmi részeket nem rendereltük újra.

Generált csomag: `style.css`. Jelentés: `docs/house-rules-navigation-20261029.md`.

Ellenőrzés: Git-állapot, forrás-diff, `git diff --check`, `npm run lint:css`, `npm run build`. A 13 statikus fejléc mindkét navigációs linket tartalmazza. Célzott helyi böngészős ellenőrzés: asztali link, 769/820/1440 px-es elférés, 390 px-es hamburger és átnavigálás a Házirend oldalra. Képek: `.impeccable/review/house-rules-desktop-menu.png`, `.impeccable/review/house-rules-mobile-menu.png`.

Éles projektmódosítás, adatbázis-módosítás, GitHub-push vagy telepítés nem történt.
