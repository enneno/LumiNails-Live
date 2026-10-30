# Aktuális információ a fejléc alatti bannerben

Az információs sáv a főoldalon kikerült a tapadó fejléc keretéből. A sorrend fejléc → információs banner → hero. Görgetéskor a banner eltűnik a képernyőről, a navigáció látható marad. A tartalom és az adminból vezérelt láthatóság megmaradt.

A mobilmenü pozíciója és a belső hivatkozások eltolása kizárólag a navigáció magasságát követi, nem számolnak helyet a bannernek. Elrejtett vagy üres üzenetnél nincs üres sáv. A hosszabb szöveg korábbi, billentyűzettel is görgethető megjelenítése megmaradt. JavaScript nélkül is a fejléc alatt jelenik meg és az oldallal elgörgethető.

Módosított források: `index.html`, `src/styles/15-home-sections.css`, `tests/homepage-notice.spec.js`. Újragenerált csomag: `style.css`.

A közös CSS verzióhivatkozása frissült: `index.html`, `404.html`, `adatkezeles/index.html`, `arlista/index.html`, `fiokom/index.html`, `foglalas/index.html`, `galeria/index.html`, `gel-lakk-tatabanya/index.html`, `hazirend/index.html`, `korom-diszites-nail-art-tatabanya/index.html`, `manikur-tatabanya/index.html`, `mukorom-epites-toltes/index.html`. Az `index.html` a banner áthelyezésén és a CSS-verzión kívül változatlan.

Jelentés: `docs/home-notice-banner-20261030.md`.

Ellenőrzés: Git-állapot és diff, `git diff --check`, sikeres `npm run lint:css` és `npm run build`. A főoldali tájékoztató három célzott WebKit-tesztje sikeres: 320/390/1440 px-es megjelenés és görgetés, belső navigáció és mobilmenü; elrejtett/üres/hosszú szöveg; JavaScript nélküli oldal. A korábbi tesztben megmaradt, már nem létező `studio-tab-services` hivatkozást a jelenlegi menüre, illetve natív horgonynavigációra cseréltük; csak a két érintett teszt ismétlődött. A bannerre meglévő, célzott akadálymentességi ellenőrzés is sikeres.

Mobilos kép szemrevételezve: `output/playwright/notice-390.png`. Az ellenőrzés böngészős emuláció, fizikai telefonos teszt nem történt. A mobilos előnézet ugyanazon a Wi-Fi-n: `http://192.168.0.244:8103/`, HTTP 200.

Éles módosítás, GitHub-push, adatbázis-művelet és közzététel nem történt.
