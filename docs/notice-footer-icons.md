# Aktuális információ, kompakt footer és szolgáltatásikonok

2026-10-10. Helyi TEST main: `D:/Asztal/LumiNails_test`. Kiindulás: `65a38b8`. A helyi elkészítés és ellenőrzés körében nem történt commit, push vagy LIVE-módosítás.

## TEST kiadási jóváhagyás — 2026-10-11

A felhasználó „Mehet tesztre” kérésére a helyileg ellenőrzött változás az `enneno/enneno.github.io` repository `main` ágára kerül. Céloldal: `https://enneno.github.io/`. A LIVE repository és a `luminails.hu` nem része a kiadásnak.

A kiadási előellenőrzés igazolta a megfelelő TEST ágat és origin URL-t, az üres staging területet, a helyi/távoli HEAD egyezését és a hibamentes diff/whitespace-ellenőrzést. Az öt korábban sikeres célzott tesztet változatlan implementáció mellett nem ismételjük. A GitHub workflow továbbra is csak deploy; közzététel után annak eredményét és a publikált HTML/CSS/JS változatot ellenőrizzük.

## Eredmény és határok

- Az aktuális információ korábban a kép alatt, összecsukható details elemben volt. Most a főoldal tetején, a szólogó fölött van, nyitott charcoal/ivory felületen, félkövér címmel és információikonnal. Görgetéskor is látható.
- A teljes felső rész sticky, a dokumentum flow-jában helyet foglal. Egy ResizeObserver méri a valódi magasságot a mobilmenü és horgonynavigáció számára. Szöveg-, font-, ablakméret- vagy aktívállapot-változásnál nincs kézzel rögzített értesítőmagasság. A prerender DOM nem mér elrendezést; ott a mérés biztonságosan kimarad.
- Az adminban szerkesztett tartalom és az aktív kapcsoló megmarad. Inaktív vagy üres információ nem hagy üres helyet. Rendkívül hosszú szövegnél legfeljebb25svh sáv és saját, billentyűzettel is működő görgetés védi a navigációt. A rendes szöveg teljesen kifér.
- A főoldali négy kis szolgáltatásfotó helyét egységes, saját szerkesztésű vonalikonok vették át: körömépítés, díszítés, lakk és reszelő. Dekoratívak, `aria-hidden`; nincs külső ikonfont, képkérés vagy függőség. A CMS-renderelő és a statikus HTML azonos ikonokat használ. A szolgáltatásoldalak fotói és az adminban tárolt képadatok nem változtak.
- A közös footer térközei csökkentek; a két linkcsoport egy összefüggő, tördelődő sorrendbe került. A hosszabb szolgáltatásnevek helyén rövid, felismerhető felirat van, teljes hozzáférhető névvel. Mind a tíz oldalhivatkozás, social, cím, e-mail, foglalási időrend és elérhetőségi megjegyzés megmarad.
- Footer-mérések azonos fontokkal és tartalommal:320px-en493→413px,390px-en413→289px (kb.30%-kal kisebb),1440px-en211→155px. Mobil link/social célterület44px, desktop navigáció/contact30px.
- Más publikus oldalon csak a közös footer-felirat és asset-cache verzió változott; adminban csak a megosztott script cache-verziója. Foglalási adatok, hitelesítés, kuponok, adminstílus, PWA-zoom, képfájlok és GitHub workflow változatlanok.

## Sikeres célzott ellenőrzések

- `npm run build` és `npm run assets:version`: forrásból generált CSS/JS, nincs közvetlen bundle-szerkesztés.
- `npm run lint:css` és `npm run public:css:check`: sikeres; nincs új `!important` vagy párhuzamos komponens-tulajdonos.
- `tests/homepage-notice.spec.js`:3 sikeres teszt,7,2s.320/390/1440px, görgetés, horgony és mobilmenü, aktív/inaktív/üres/hosszú állapot, belső billentyűzetes görgetés, JS nélküli HTML és reprezentatív belsőoldali fejléc. Az értesítő célzott axe-ellenőrzése0 eltérést jelzett.
- `tests/compact-footer-services.spec.js`:2 sikeres teszt,5,5s.320/390/1440px, footer-magasság, tíz útvonal, érintési célok, kép nélküli négy ikon, túlcsordulás; JS nélküli ikonok/footer és az árlista közös footere. Célzott axe a footeren és szolgáltatásszekción:0 eltérés.
- Saját képi átnézés: az értesítő390/1440px, majd a footer és ikonok390/1440px. Helyi képek az ignorált `output/playwright/notice-*.png`, `footer-compact-*.png`, `services-icons-*.png` alatt.
- `node --check script.js`, `node scripts/check-site.js` és Git whitespace/diff: sikeres. A szolgáltatásoldalak diffjében kizárólag két footer-felirat és a cache-verziók változtak, a hero/képtartalom nem.
- Impeccable layout scan: az összecsukható értesítő korábbi jelzése megszűnt. A szolgáltatáslista határvonalára maradt egy figyelmeztetés; a tényleges szöveg a sorok20px/16px saját block-paddingje mögött van. Ez a megőrzött elválasztott lista, nem hiányzó belső spacing.

Nem futott teljes tesztcsomag, Lighthouse, valódi foglalás, adatbázis-/Storage-írás, fizikai iPhone/Safari vagy telepített PWA-ellenőrzés. A korábban sikeres értesítőtesztet a későbbi, értesítőlogikát nem érintő footer/ikon változás miatt nem futtattuk újra.

## Záró átnézés

Impeccable elrendezési és polish szerep inline, ugyanattól az agenttől: `disposition: ship` helyi előnézetre. Nem független tanúsítás vagy kiadási engedély. A rögzített Ivory & Taupe paletta, fotós nyitás, olvasható szöveg, mobil képkeret és meglévő szolgáltatási tények megmaradnak. A notice hangsúlya és a footer sűrűsége a felhasználó legújabb kérését követi. Nincs új dekoratív árnyék, overlay, animáció vagy vizuális világ; nyitott, bizonyított hiba nincs az érintett komponenseken.

## Pontos módosított fájllista

Irányadó források:

- `index.html`
- `src/html/site-footer.html`
- `src/public/00-bootstrap.js`
- `src/public/30-content-rendering.js`
- `src/styles/13-gallery-footer-navigation.css`
- `src/styles/15-home-sections.css`

Generált bundle-ek:

- `style.css`
- `script.js`

Közös footer két rövid felirata és asset-cache verzió:

- `404.html`
- `adatkezeles/index.html`
- `arlista/index.html`
- `fiokom/index.html`
- `foglalas/index.html`
- `galeria/index.html`
- `gel-lakk-tatabanya/index.html`
- `korom-diszites-nail-art-tatabanya/index.html`
- `manikur-tatabanya/index.html`
- `mukorom-epites-toltes/index.html`

Csak script-cache verzió:

- `admin/index.html`

Új helyi regressziótesztek:

- `tests/homepage-notice.spec.js`
- `tests/compact-footer-services.spec.js`

Dokumentáció:

- `DESIGN.md`
- `.impeccable/surfaces/index-html.md`
- `docs/design-system.md`
- `docs/notice-footer-icons.md`

A korábbról megmaradt látványtervek és helyi build-artifactok érintetlenek, nem részei a kiadásnak. A fenti helyi elkészítés során a TEST GitHub-verzió nem változott; a későbbi közzétételi jóváhagyást a kiadási rész rögzíti. A LIVE oldal nem változott.

## Szolgáltatásikon-csere — 2026-10-11

A felhasználó a saját rajzolt jeleket elutasította. Helyükön a Phosphor duotone készlet Stack Simple / Sparkle / Paint Brush / Hand Heart ikonjai vannak. Eredeti geometria és20%-os másodlagos kitöltés, meglévő charcoal szín, változatlan40px mobil /48px desktop méret és elrendezés. Az ikonok dekoratívak, nem fókuszálhatók. Nincs csomagtelepítés, ikonfont, CDN-kérés vagy új animáció. A szolgáltatásoldalak képei és az adatok érintetlenek. Forrás, rögzített revision és teljes MIT licenc: `licenses/phosphor-icons.txt`.

Sikeres, szűk helyi ellenőrzés: build, asset-verziózás, CSS-lint, JS-szintaxis és Git-diff/whitespace; Playwright CLI képi kontroll320/390/1440px-en.390/1440px-en nulla dokumentumtúlcsordulás,40/48px méret, négy dekoratív SVG. A böngészőben és külön statikus ellenőrzéssel a CMS-helper és a JS nélküli HTML ikon-geometriája4/4 egyezik. Mobil és desktop szekcióképek saját átnézése: nincs ikonvágás vagy szövegütközés. Képek: az ignorált `output/playwright/phosphor-services-*.png` alatt. Teljes tesztcsomag, axe/Lighthouse és nem érintett oldalak ellenőrzése nem futott.

Az Impeccable scan nem jelzett az ikoncsere új kódjára hibát; a teljes céloldalra meglévő palette/font/justify/kupon/depth és dokumentációs jelzéseket is adott. A paletta és a sorkizárás felhasználói döntés; a listahatár mögött a sorok saját paddingje van. Ezek és a régi kuponstílusok nem részei az ikoncsere hatókörének. A desktop szekcióképen a meglévő rögzített foglalásgomb a szekció CTA-jára ráfedhet; nem az új ikon okozza, ebben a körben nem változtattuk. Inline finish review: a négy ikon helyi előnézete átadható, ez nem független tanúsítás.

Pontos új fájlkör:

- Forrás: `index.html`, `src/public/30-content-rendering.js`, `src/styles/15-home-sections.css`.
- Dokumentáció/licenc: `DESIGN.md`, `docs/design-system.md`, `docs/notice-footer-icons.md`, `licenses/phosphor-icons.txt` (új).
- Buildből generált: `script.js`, `style.css`.
- Csak CSS/JS cache-verzió: `404.html`, `adatkezeles/index.html`, `arlista/index.html`, `fiokom/index.html`, `foglalas/index.html`, `galeria/index.html`, `gel-lakk-tatabanya/index.html`, `korom-diszites-nail-art-tatabanya/index.html`, `manikur-tatabanya/index.html`, `mukorom-epites-toltes/index.html`.
- Csak JS cache-verzió: `admin/index.html`.

A korábbi TEST-kiadás `cfaa8a4`. Elkészítéskor ez a csere még csak helyi volt; a felhasználó2026-10-11-i „Mehet tesztre” jóváhagyása alapján a fent felsorolt, már ellenőrzött fájlkör az `enneno/enneno.github.io` TEST `main` ágára kerül. Változatlan alkalmazáskód mellett a sikeres helyi ellenőrzéseket nem ismételjük; a kiadás előtt Git-diff/ág/origin ellenőrzés, utána a deploy és a publikált asset-verziók ellenőrzése történik. Régi látványtervek és CLI-artifactok nem kerülnek a commitba. A LIVE nem változott.
