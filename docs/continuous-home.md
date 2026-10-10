# Egybefüggő stúdió-főoldal, 2026-10-10

Kérés: a főoldal stílusa tetszik, de túl rövid, csak egy blokk. Helyi TEST main fejlesztés, `D:/Asztal/LumiNails_test`. Az elkészítés és helyi ellenőrzés körében nem történt commit, push vagy LIVE-módosítás.

## TEST kiadás

A felhasználó „Tesztre mehet” jóváhagyása alapján a változás az `enneno/enneno.github.io` repository `main` ágára kerül, kizárólag a `https://enneno.github.io/` tesztoldalhoz. A LIVE repository és a `luminails.hu` nem része a kiadásnak.

A kiadási előellenőrzés igazolta a megfelelő ágat és távoli repositoryt, a helyi és távoli HEAD egyezését, az üres staging területet, valamint a hibamentes whitespace-ellenőrzést. A korábban sikeres négy célzott tesztet változatlan implementáció mellett nem ismételjük; a GitHub workflow továbbra is csak deploy. A feltöltés után a deploy eredményét és a publikált HTML/bundle tartalmát ellenőrizzük.

## Eredmény

- Az Ivory & Taupe paletta, fotós nyitórész, saját hero és öt saját galériakép megmarad.
- A három nagy felirat most normál szekcióhivatkozás. Nem vált rejtett nézetek között: munkák → négy szolgáltatás → Szofi bemutatkozása → foglalási meghívás → a változatlan kompakt footer.
- A szolgáltatáscím újra látható. A bemutatkozás a meglévő bézst használja; teljes portré és eredeti CMS-szöveg, természetes tartalommagasság mellett.
- A foglalási meghívás a már meglévő admin/CMS `fooldal.foglalasAtvezeto` mezőit használja. A projekt meglévő, csak olvasó prerender parancsa a jelenlegi szöveget valódi HTML-be is kiírta. Nem készült külön beégetett, felülírt szövegváltozat vagy adatbázis-módosítás.
- A közös horgonykezelés a célhoz görget és a főoldali célra fókuszál; a rögzített fejléc alatt marad a cím. A reduced-motion meglévő szabálya érvényes. Az útvonalak nem változtak.
- Képlapozás, hibavisszajelzés és utolsó-kérés-nyer védelem megmarad. Nincs új függőség, animációs könyvtár vagy párhuzamos CSS-réteg.
- A fotók és minden tény JS nélkül is látható. Admin, árlista, foglalási adatkezelés, autentikáció, Supabase-beállítás és PWA-zoom nem változott.

## Célzott ellenőrzések

- `npm run prerender`: sikeres, 12 HTML-oldal / 19 aktív szolgáltatás. Nyilvános adatok olvasása; nincs távoli írás.
- `npm run build`, `npm run assets:version`: sikeres. A CSS/JS csak forrásból épült.
- `npm run lint:css`: sikeres.
- `npm run public:css:check`: az első futás feltárt egy közösen kiosztott és a bemutatkozásnál újra kiosztott háttértulajdont. A közös fölösleges deklaráció megszűnt; az újrafutás sikeres. Nincs `!important` vagy duplikált tulajdonos.
- `npm run build:check`: sikeres az első összeállításra; a fenti CSS-tulajdonjavítás után a build ismét elkészült, a megjelenés változatlan.
- `node scripts/check-site.js`: sikeres statikus ellenőrzés, 11 oldal / 7 script / 35 foglalási elem.
- `npx playwright test tests/studio-navigation.spec.js`: **4 sikeres teszt**, kb. 7,5 másodperc. Billentyűzetes/deep-link/mobilmenü navigáció, az összes főoldali szekció egyidejű láthatósága, fejléc alatti célcím, axe a teljes főoldalon nulla jelzett eltérés; képváltás/hibás kép/gyors választás; túlcsordulás 320, 375, 390, 414, 768, 1024, 1280, 1440, 1536 px-en és mobil 16:9 contain kép; JS nélküli tartalom és mind a tíz footer-hivatkozás. Az optikát nem változtató CSS-tulajdonjavítás miatt ezeket nem ismételtük.
- Saját képi átnézés: asztali 1440×1000 és valódi 390×844 böngészős nézet, teljes oldalas képek. Köztes Chrome-kép minimumablaka 492px volt, nem számítottuk 390px-es bizonyítéknak. A végső képek a `.impeccable/build/continuous-home-desktop.png` és `continuous-home-mobile.png` helyi fejlesztési fájlok; nem publikus oldalanyagok.
- `21st review` az öt érintett implementációs forráson: 0 finding, 0 automatikus javítás. A katalóguskeresés HTTP401 miatt nem működött, nem importáltunk katalóguskomponenst; meglévő projektprimitíveket használtunk.
- Impeccable elrendezési scan: a meglévő `details`, a képwrapper és a szolgáltatáslista határainak közelségét jelzi. Szöveges tartalmuk saját belső spacinget kap; a képwrapper edge-to-edge média, nem szövegdoboz. Nem indokol külön dekoratív dobozokat.
- Git-diff/whitespace és JSON-validálás. Nincs GitHub workflow-módosítás vagy GitHubon futó teszt.

Teljes Playwright-csomag, Lighthouse, adminaudit, valódi foglalás, adatbázis- vagy Storage-írás, fizikai iPhone/PWA-ellenőrzés nem futott; a változás főoldali elrendezés és horgonynavigáció.

## Impeccable záró átnézés

`disposition: ship` a helyi, célzott főoldali folytatásra. A záró ellenőrző szerepet ugyanaz az agent végezte inline; ez nem független szakértői tanúsítás. A felhasználó új kérésével felülírt topológia kódvezérelt finomítás, nem új teljes comp-reprodukció vagy új vizuális világ.

- **persistence:** PRODUCT.md, DESIGN.md és a főoldali brief rögzíti a legújabb kérést. A régi háromnézetes snapshot történeti.
- **fidelity:** típus/TYPE: megőrzött stúdióválasztó, DM Sans szöveg és szólogó; MATERIAL: saját változatlan fotók; GROUND: rögzített öt palettaszín. A folyamatos szekciós sorrend a felhasználó rövidoldal-kifogásának célzott megoldása, nem önkényes szín- vagy márkaváltás.
- **ceiling:** tudatosan visszafogott felület; nincs szükség új overlayre, árnyékra vagy mozgó dekorációra. Nem teljes új quality-bar/minőségi tanúsítás.
- **material_fixes:** a feltárt ismételt háttértulajdon megszűnt; a célzott tesztekben és a végső 390/1440px képeken nincs nyitott működési vagy elrendezési eltérés.
- **keep:** a saját fotók, a megőrzött első képernyő, a kontrasztos paletta, a kompakt footer és a változatlan foglalási folyamat.

## Pontos fájllista

Főoldal és irányadó források:

- `index.html`
- `src/public/30-content-rendering.js`
- `src/public/45-home-gallery-carousel.js`
- `src/styles/15-home-sections.css`
- `src/styles/18-hero-inner-pages.css`
- `tests/studio-navigation.spec.js`

Generált bundle-ek:

- `style.css`
- `script.js`

Más oldalakban csak a közös CSS/JS cache-verzió változott, nem az oldaltartalom vagy működés:

- `404.html`
- `adatkezeles/index.html`
- `admin/index.html` (csak a közös `script.js` verziója)
- `arlista/index.html`
- `fiokom/index.html`
- `foglalas/index.html`
- `galeria/index.html`
- `gel-lakk-tatabanya/index.html`
- `korom-diszites-nail-art-tatabanya/index.html`
- `manikur-tatabanya/index.html`
- `mukorom-epites-toltes/index.html`

Kapcsolódó dokumentáció:

- `.21st/DESIGN.md`
- `.21st/design.json`
- `.impeccable/surfaces/index-html.md`
- `PRODUCT.md`
- `DESIGN.md`
- `docs/design-system.md`
- `docs/continuous-home.md`

A korábbról helyben maradt, elutasított látványtervek nem változtak és nem lettek törölve; nem részei a kiadásnak. A helyi elkészítés során a már publikált TEST-verziót sem cseréltük le; a későbbi TEST-jóváhagyást a kiadási rész rögzíti. A LIVE projekt és a `luminails.hu` nem változott.
