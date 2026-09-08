# LumiNails vizuális audit

## Galéria-, footer-, szolgáltatás- és mezősűrűség korrekció — 2026-09-08

- A hero „Aktuális munkák / Galéria megnyitása” átvezetője 44–48 px magas, padding helyett rögzített érintési magasság tartja tömören. A galérialapozó alatti ismétlődő nagy „Galéria” cím megszűnt; csak egy finom keretes, nyíllal jelzett hivatkozás maradt. A megszüntetett cím mezője a Weboldal tartalmak szerkesztőből és a mentett tartalom normalizálásából is kikerült.
- A közös footer három sűrű sorba rendezi a márkát és közösségi linkeket, az elérhetőségeket, valamint az adatkezelési linket és copyrightot. A márkaleírás ismétlése megszűnt. A célzott mérésben a footer 390 px-en 160 px, 1440 px-en 150 px alatt marad, miközben a linkek és közösségi gombok 44 px-es érintési céljai megmaradnak.
- Mind a négy szolgáltatás-részletoldal közös tulajdonosa javult. Mobilon a teljes 3:2 hero-kép külön, színező overlay nélkül jelenik meg; a cím és a bevezető világos felületen követi, ezért az első képernyőt nem egy barna, üres hero tölti ki. Desktopon a barna fátylat irányított palaszürke olvashatósági réteg váltotta. A törzsszövegek sorkizártak, `hyphens: none` mellett.
- A publikus oldal felhasználói nagyítása továbbra is engedélyezett. A valódi szövegbeviteli mezők, selectek és textarea-k legalább 16 px-es számított méretet, `font-size-adjust: none` és 100%-os saját szövegskálát kapnak. Ez javítja az iOS fókusz-zoom ellen védő CSS feltételét; valódi iPhone/Safari hardver nem állt rendelkezésre. Az admin standalone PWA nagyítási tilalma változatlan.
- A 21st.dev katalógusban a „minimal editorial button” és „understated arrow button” minták lettek összevetve. React/shadcn komponenst nem telepítettünk a statikus oldalba; a meglévő `.gomb` kapott a designrendszerhez igazított, függőségmentes keretes nyílvariánst és reduced-motion kezelést.
- Sikeres ellenőrzések: `npm run lint:css`; build és asset-verziózás; négy célzott vizuális regresszióteszt a mobil hero/átvezetőre, publikus mezőkre, mind a négy mobil szolgáltatásoldalra és a közös footerre; két célzott desktop szolgáltatás-elrendezési teszt; home-mobile és booking-mobile accessibility ratchet. A három reprezentatív 390/1440 px-es képernyőkép kézzel is át lett nézve. Teljes Playwright-csomag és Lighthouse nem futott.
- Érintett források: `admin-content.js`, `index.html`, `src/public/10-default-content.js`, `src/public/20-shell-coupons.js`, `src/public/30-content-rendering.js`, `src/styles/00-base.css`, `src/styles/13-gallery-footer-navigation.css`, `src/styles/16-home-gallery.css`, `src/styles/18-hero-inner-pages.css`, `src/styles/19-service-detail.css`, `src/styles/25-customer-account.css`, `src/styles/30-booking.css`, `tests/visual-critical.spec.js`. Design-dokumentáció: `.21st/DESIGN.md`, `.21st/design.json`, `docs/design-system.md`, `docs/visual-audit.md`. A generált bundle-ek és HTML asset-verziók a projekt buildjéből származnak. LIVE és GitHub workflow nem változott.

## Kezdőlapi sűrűség és admin foglalhatónap-számláló — 2026-09-08

- Az „Aktuális információ” mobilon 390 px szélességen 92 px körüli: a tartalmi üres sorok nem növelik tovább a blokkot, a belső térköz és sortáv kisebb, a címke az aktuális zsálya brand tokent használja. Keskeny 320 px-en a hosszabb szöveg természetesen több sor, de túlcsordulás nélkül jelenik meg.
- A hero három előnycímkéje középre igazított. A galériaátvezető 52–54 px körüli kompakt sor, az alatta lévő két művelet egy sorban, azonos szélességben és legalább 48 px magas érintési célként jelenik meg.
- A közös footer 390 és 320 px-en körülbelül 198 px magas; a fölösleges mobil márkaleírás nem ismétlődik, a cím és az e-mail olvasható oszloparányt kap. Asztalon az elérhetőségi terület szélesebb, így a footer 190 px alatt marad. A linkek és közösségi gombok 44 px-es érintési területe megmaradt.
- A publikus viewport továbbra sem tiltja a felhasználói nagyítást. A foglalás látható mezői és a fiók bejelentkezési, profil- és körömigény-mezői mobilon 22 CSS px-es számított betűméretet kapnak, így az iOS fókusz-zoom nem aktiválódik. Az admin standalone zoomtilalma nem változott.
- Az admin „Foglalható időszak” kártya korábban a mai nap és a legtávolabbi aktív dátum közti naptári távolságot számolta. A kártya neve „Foglalható napok”; értéke most a maitól kezdődő aktív `availability_windows` rekordok különböző dátumainak száma, a segédszöveg pedig a legutolsó dátumot mutatja. Két minta-dátumnál az ellenőrzött eredmény `2`.
- Sikeres: build, asset-verziózás, teljes statikus ellenőrzés, forrás/bundle egyezés, publikus és admin CSS-architektúra, Stylelint. Célzott Playwright: hero/értesítő, közös footer, publikus mobil mezőméret és admin foglalhatónap-számláló. A nagy általános admin desktop teszt az új számláló-ellenőrzés után egy, a mostani módosítás által nem érintett 14/16 px body-font elváráson megállt; az új funkciót ezért külön, szűk regresszióteszt igazolja. Teljes Playwright-csomag nem futott.
- Forrás: `src/styles/13-gallery-footer-navigation.css`, `src/styles/15-home-sections.css`, `src/styles/18-hero-inner-pages.css`, `src/styles/25-customer-account.css`, `src/admin/05-admin-workspace-v2.js`. Teszt: `tests/visual-critical.spec.js`, `tests/admin-production-redesign.spec.js`. Generált: `style.css`, `admin-supabase.js`; a HTML-fájlokban csak az érintett asset cache-verziója frissül. LIVE és GitHub workflow nem változott.

## Publikus hero, színrendszer és galérialapozó finomítása — 2026-09-08

- A mobil hero tényleges 16:9 képként, `contain` módban és ránagyítás nélkül jelenik meg. A korábbi több különálló világos feliratdoboz helyett egy bal oldali irányított olvashatósági átmenet és egyetlen közös alsó előnysáv van; a galériahivatkozás és a fiókgombok a kép alatt maradtak.
- A képeken kifogásolt publikus rózsaszín elsődleges akcentus gyöngyház-zsályára (`#C9D4CF`), a rózsaszínes világos surface semleges ivoryra (`#F5F1EB`) változott. A sötét tinta megmaradt, így a fő akcentuson 7,8:1 körüli, az ivory felületen 10,5:1 körüli kontrasztot ad. Az admin külön színrendszere nem változott.
- A kezdőlapi galérialapozó levágódó radiális fényudvara, képkártya-árnyéka és vezérlőárnyéka megszűnt. A rétegzettséget most a kártyák pozíciója, skálája és finom kerete adja. A képek forrása, sorrendje és lapozási működése változatlan.
- A 320 px-es vizuális kontroll két korábbi mobil tipográfiai hibát is feltárt: a „Bemutatkozás” nem törik többé betű közben, a „Szolgáltatások” cím pedig nem lóg ki a viewportból.
- Sikeres helyi ellenőrzések: build és asset-verziózás; teljes statikus projektellenőrzés benne CSS-architektúrával és Stylelinttel; célzott Playwright hero/layout/CTA kontroll (a hibás elvárás javítása után minden érintett eset sikeres); célzott axe home-mobile és booking-mobile, nulla új kontraszthibával. Kézi képi kontroll: 320, 390, 768 és 1440 px. A galéria aktív képe böngészőben betöltve 675×900 px; a képfájlok nem változtak.
- Forrás: `src/styles/00-base.css`, `src/styles/15-home-sections.css`, `src/styles/16-home-gallery.css`, `src/styles/18-hero-inner-pages.css`, `tests/visual-critical.spec.js`. Design-dokumentáció: `.21st/DESIGN.md`, `.21st/design.json`, `docs/design-system.md`, `docs/visual-audit.md`. Generált: `style.css`; a publikus HTML-fájlokban csak a CSS cache-verzió frissül. Az `AGENTS.md` külön, korábban kért skillhasználati szabályokat tartalmaz.
- Nem futott teljes Playwright-csomag vagy Lighthouse. LIVE projekt, LIVE oldal, admin forrás, PWA és GitHub workflow nem változott.

## Mobil hero képkivágás és overlay korrekció — 2026-09-08

- A korábbi 390 px minimum képmagasság és `cover` helyett fix 16:9 és `contain`: a teljes kép látszik, középre igazítva, vágás/nagyítás nélkül. A galériasáv nem takar bele a fotóba, hanem közvetlenül alá kerül.
- A teljes képes fátyol megszűnt. Csak a kompakt bal oldali szövegek és az immár a képen lévő három előnyfelirat kap 80%-os világos helyi hátteret. A cím mobilon egysoros; a gombok maradnak a kép alatt. Desktopon nincs megjelenésváltozás.
- Ellenőrzés csak az érintett hero komponensen: 375, 390 és 768 px mobil + 1440 px desktop kontroll. A kép pontosan 16:9 mobilon, `contain`, nincs vízszintes túlcsordulás, nincs szöveg/előnysor ütközés, a gombok legalább 52 px magasak. A betöltött tartalommal 0 axe szövegkontraszt-találat, mobil képernyőkép kézzel átnézve. CSS-lint, build és Git-diff ellenőrizve. 21st review: 0 error, 0 warning. Teljes tesztcsomag nem futott.
- Pontos módosított fájlok: `src/styles/18-hero-inner-pages.css`, generált `style.css`, `.21st/design.json`, `.21st/DESIGN.md`, `docs/design-system.md`, `docs/visual-audit.md`. Csak cache-verzió: `index.html`, `adatkezeles/index.html`, `arlista/index.html`, `fiokom/index.html`, `foglalas/index.html`, `galeria/index.html`, `gel-lakk-tatabanya/index.html`, `korom-diszites-nail-art-tatabanya/index.html`, `manikur-tatabanya/index.html`, `mukorom-epites-toltes/index.html`.
- Helyi, nem kiadott ellenőrzőszkript/képek: `output/playwright/hero-layout.cjs`, `output/playwright/hero-16x9-*.png`. LIVE, admin alkalmazáskód, PWA és GitHub workflow nem változott. Valódi iOS-eszköz nem volt része az ellenőrzésnek.

## Mobil hero átrendezése — 2026-09-08

- Felhasználói kérésre teljes képernyőszélességű mobil hero-kép, a bal oldalon olvasható, palaszürke szöveggel; az account/belépési gombok a kép alatt. A mobil dekoratív LN jelvény nem takarja a szöveget (rejtve). A galérialink megmarad a kép alsó sávjában.
- A barna hero-feliratok desktopon is palaszürkék. A többi szekció, az admin, a galériaképek, a belépési folyamat és a PWA-szabályok változatlanok. A tartalomszerkesztő leírásának célpontja az új `.hero-copy` dobozhoz igazítva.
- Célzott Playwright-ellenőrzés csak a hero blokkon: 375, 390, 768 és 1440 px; betöltött publikus képpel és szöveggel. Nincs dokumentumszintű vízszintes túlcsordulás; mobilon a kép a két szélig ér, a gombok alatta vannak, legalább 52 px magasak. A szöveg a képen belül marad; 0 automatikus szövegkontraszt-találat, képi ellenőrzéssel kiegészítve. Valódi iOS-eszköz nem volt része az ellenőrzésnek.
- Sikeres: build, asset-verzió frissítés, `npm run check` (benne CSS-lint), Git-diff ellenőrzése. 21st review: 0 error, 0 warning, 6 információs javaslat. A 21st katalóguskeresése sikeres belépés után működött; külső komponenst nem telepítettünk, a meglévő hero maradt az alap. A UI/UX skill olvashatósági és érintésicél-alapelveit alkalmaztuk; a Python kereső ebben a környezetben nem volt elérhető.
- Pontos forrásfájlok: `index.html`, `src/styles/18-hero-inner-pages.css`, `src/public/30-content-rendering.js`. Dokumentáció: `.21st/design.json`, `.21st/DESIGN.md`, `docs/design-system.md`, `docs/visual-audit.md`. Generált: `style.css`, `script.js`.
- Csak cache-verzió miatt módosult: `adatkezeles/index.html`, `admin/index.html`, `arlista/index.html`, `fiokom/index.html`, `foglalas/index.html`, `galeria/index.html`, `gel-lakk-tatabanya/index.html`, `korom-diszites-nail-art-tatabanya/index.html`, `manikur-tatabanya/index.html`, `mukorom-epites-toltes/index.html`.
- A képek és az egyszeri ellenőrzőszkript az ignorált `output/playwright/hero-*` fájlokban maradnak. LIVE nem változott; GitHub workflow nem módosult.

## Célzott olvashatósági javítás — 2026-09-08

Kiindulás: TEST `main`, `f1e96b2`, a korábbi kontraszt/spacing csomag visszavonása után. Ez a javítás nem alkalmazza újra a visszavont csomagot: az elrendezések, térközök, képek, felülethátterek és a `#FFD1DC` primary megmaradnak. Az alábbi bejegyzés az aktuális állapot; a korábbi auditbejegyzések történeti feljegyzések.

### Bizonyított és javított hibák

- Világos felületen a halványrózsaszín hero-felirat és egyes címkék/linkek nem voltak olvashatók. A dekoráció és a szöveg külön tokent kapott: `--ui-accent-text: #885333`; a másodlagos szöveg `#555d64`.
- Foglalás: ár/időtartam, stílusleírás, képfeltöltési segítség, lépésszám, összefoglaló és kijelölt kártya felirata. A betöltött szolgáltatáskártyákon korábban 3,87:1 szövegkontraszt volt; a halvány barna alpha-színek helyett szemantikus szövegtokenek vannak.
- Árlista időtartamai, vendégfiók/galéria/adatkezelés világos felületen lévő címkéi ugyanazt az olvasható rendszert használják.
- A letiltott telefonmező és a befoglalója egyszerre halványodott. Csak maga a mező marad halványított, az országkód nem.
- Admin light: az alap tinta tévesen a rózsaszín primary tokenre mutatott. A pink és a sötét/hover gombháttér külön felirattokent kapott; a navigáció másodlagos feliratai, mezőcímkék, akciók és lemondási értesítés feliratai is javítva.
- A kézzel felvett foglalás státuszának és ikonjainak előtérszíne világos módban sötét, sötét módban világos. A rózsaszín státuszháttér, illetve a többi foglalási állapot jelentése megmaradt.

### Ellenőrzés és korlátok

- `npm run build`, `npm run assets:version`, `npm run check` és a végső CSS-változások után `npm run lint:css`: sikeres. Git-diff/forrás–bundle és CSS-felelősség ellenőrizve; nincs új `!important` vagy felülírásréteg.
- `tests/accessibility-critical.spec.js`: home-mobile és admin-mobile sikeres; a booking-mobile hibájának javítása után csak az érintett booking-mobile teszt futott újra, sikeresen. Mindhárom nézetben a megengedett kontraszthibaszám most 0. A két korábbi touch-target eltérés megengedett kerete változatlan.
- Célzott axe szövegkontraszt- és képi ellenőrzés: kezdőlap, foglalás, fiók, árlista, reprezentatív szolgáltatásoldal, galéria és admin belépés mobilon; kezdőlap/foglalás/árlista asztali méreten. A közös tokenek vizsgált nézeteiben nem maradt automatikusan kimutatott szövegkontraszt-hiba.
- A foglalás ténylegesen betöltött szolgáltatásaival és kijelölt stíluskártyával külön mobil (390 px) és desktop (1440 px) ellenőrzés is történt: 0 axe szövegkontraszt-eltérés, vízszintes dokumentumtúlcsordulás nélkül. A hálózatilag nem elérhető szolgáltatásadatok tartalék nézete önmagában nem volt elegendő bizonyíték.
- Bejelentkezett admin: kizárólag helyi mintaadatokkal ellenőrzött áttekintés, lista és naptár, világos/sötét témában; desktop és mobil/standalone-szimuláció. Az admin `Foglalt` readonly státusza és a primary gomb külön kontraszt-regressziótesztet kapott a meglévő `tests/admin-dark-mode.spec.js` fájlban: mindkét téma, 390 és 1440 px, legalább 4,5:1. Ez azért szükséges, mert az axe kihagyja a disabled mezőket.
- A 21st determinisztikus review az utolsó teljes ellenőrzésekor 0 error, 0 warning és 546 információs javaslatot adott. A token-definíciókat is jelző hardcoded-color javaslatok nem automatikus hibák; nem történt tömeges csere. A ui-ux-pro-max szövegkontraszt-ajánlása alapján csak bizonyított olvashatósági eltéréseket javítottunk.
- Nem futott teljes Playwright-csomag vagy Lighthouse. Valódi iPhone/Safari és telepített iOS PWA nem állt rendelkezésre; a standalone nézet böngészős szimuláció. A PWA zoomtilalma és működése változatlan.
- LIVE kód, adatbázis, foglalás vagy tartalom nem módosult. A nyilvános tartalom betöltése csak olvasás; admin háttérműveletek helyi mockkal futottak. GitHub workflow nem módosult, új automatikus teszt nem került oda.

### További észrevételek — ebben a csomagban nem módosítva

- Az admin „A weboldal tartalma betöltve” visszajelzése a lista elé úszhat; külön, rövid életű és jól elkülönített értesítési felület javíthatná ezt.
- A foglalás-ellenőrzés hosszú desktop címe sok sorra törik. Ez nem kontraszthiba: külön tartalmi/szélességi finomítás lehet, a jelenlegi elrendezést most megtartottuk.
- A korábbi footer érintésicél-méretekre vonatkozó audit és a jelenlegi ratchet között eltérés maradt (két engedett target-size találat). Ez nem oldható meg pusztán színcserével; a kisebb spacing és a megfelelő érintési terület együtt vizsgálandó.

### Pontos módosított fájlkör

- Design-kontextus: `.21st/design.json`, `docs/design-system.md`, `docs/visual-audit.md`.
- Publikus CSS-forrás: `src/styles/00-base.css`, `src/styles/11-price-page.css`, `src/styles/12-legal.css`, `src/styles/13-gallery-footer-navigation.css`, `src/styles/18-hero-inner-pages.css`, `src/styles/19-service-detail.css`, `src/styles/25-customer-account.css`, `src/styles/30-booking.css`.
- Admin CSS-forrás: `src/admin-styles/00-foundation.css`, `src/admin-styles/10-components.css`, `src/admin-styles/20-workspace.css`, `src/admin-styles/30-bookings.css`.
- Helyi ellenőrzés: `tests/accessibility-critical.spec.js`, `tests/admin-dark-mode.spec.js`.
- Build által generált: `style.css`, `admin-v2.css`.
- Kizárólag CSS-cache-verzió frissítés: `index.html`, `admin/index.html`, `adatkezeles/index.html`, `arlista/index.html`, `fiokom/index.html`, `foglalas/index.html`, `galeria/index.html`, `gel-lakk-tatabanya/index.html`, `korom-diszites-nail-art-tatabanya/index.html`, `manikur-tatabanya/index.html`, `mukorom-epites-toltes/index.html`.
- Az egyszeri audit helyi képei/JSON-jelentései és segédszkriptje az ignorált `output/playwright/` mappában maradnak, nem kerülnek a kiadásba.

## Tartalom- és sűrűségkorrekció — 2026-09-03

- A közös publikus és admin primary rózsaszín `#FFD1DC`; a hozzá tartozó áttetsző vonal- és fókuszszínek ugyanennek az RGB-értékét használják.
- A főoldali bemutatkozás desktop magasságát kizárólag a szöveges tartalom és annak belső paddingje határozza meg; a kép kitölti ezt a magasságot, de nem növeli meg.
- A mobil footer megtartja a legalább 44 px-es érintési célokat, miközben kisebb külső paddinget, gapet és szöveg-sortávolságot használ.
- A főoldali hero renderelőből kikerült a régi fájlnév-alapú képcsere. A publikus oldal most pontosan a `fooldal.hero.kep` mezőben elmentett képet használja.

## Figma implementáció — 2026-09-02

- A megadott Figma-fájl hat fő frame-je (Homepage, Galéria, Árlista, Fiókom, Időpontfoglalás és Admin) össze lett vetve a TEST komponenseivel.
- A domináns, ismétlődő rendszer lett irányadó: `#e3dcd2` canvas, `#f2e9eb` surface, `#31383f` tinta, `#FFD1DC` rózsaszín és `#cc8b65` terrakotta; Playfair Display + DM Sans.
- A Figma eltérő footer-változatai tervezési inkonzisztenciának minősültek. A kódban minden publikus oldal ugyanazt a homepage footer-komponenst használja.
- A Figma frame-ek alján látható üres terület nem lett implementálva. Rövid oldalon a fő tartalom tölti ki a viewportot, a footer után nincs külön felület.
- A főoldali galéria meglévő képei és sorrendje megmaradt. A galériaoldalon minden képkártya ugyanazt a felirat-hátteret kapja, kijavítva azt az eltérést, hogy csak az első kártyán szerepelt.
- A véletlen font-, radius- és padding-eltérések egységesítve lettek; az admin funkcionális állapotszínei és a standalone PWA nagyítási szabálya megmaradt.

Audit dátuma: 2026-09-01. Vizsgált TEST nézetek: kezdőlap 1440 × 1000 és 390 × 844, foglalás 390 × 844, admin belépés 1440 × 1000 és 390 × 844.

## Áttervezési frissítés — 2026-09-01

- A felhasználó külön engedélyével a kritikus TEST-nézetek megkapták az új „quiet luxury” vizuális irányt; a LIVE nem változott.
- A mobil „Bemutatkozás” és „Online időpontfoglalás” címek új, tartományra korlátozott méretezést, kiegyensúlyozott törést és szükség esetén biztonságos `overflow-wrap` viselkedést kaptak. A 390 px-es ellenőrzésben nincs dokumentumszintű vízszintes görgetés.
- A primary, surface, muted és elválasztó tokenek kontrasztosabb, meleg neutrális palettára változtak. Az admin belépési gomb mély brand hátteret kapott.
- A footer szöveges linkjeinek kattintható magassága legalább 44 px lett.
- Az accessibility ratchet a kezdőlap, foglalás és admin mobil nézetén sikeres. A korábbi nyers axe-darabszámok történeti alapértékek; az új felület aktuális hibaszámaként nem értelmezhetők.

Módszer: forrás- és CSS-felelősség-ellenőrzés, teljes oldalas Playwright-képernyőkép, DOM overflow-mérés, axe WCAG 2 A/AA–2.2 AA audit, `ui-ux-pro-max` célzott UX/typography/color keresés, valamint a 21st determinisztikus review. A 21st 33 fájlban 0 error, 0 warning és 563 információs `design-hardcoded-color` javaslatot adott; ezek nem automatikusan hibák, mert token-definíciókat és témaértékeket is számol.

Az audit során egy determinisztikus HTML-hiba célzottan javítva lett: a rejtett „Naptárba mentés” elem placeholder `href="#"` attribútuma megszűnt. A foglalási JavaScript továbbra is csak a valódi `.ics` objektum-URL létrehozása után állítja be a `href`-et és teszi láthatóvá az elemet.

## Tényleges hibák

### Megoldva — mobil címszövegek túlnyúlása

- A kezdőlapi „Bemutatkozás” `h2` 390 px-es viewporton 350 px széles dobozban 387 px tartalomszélességet igényel. A forrás: `src/styles/15-home-sections.css` mobil címszabálya 580. sor körül.
- A foglalási „Online időpontfoglalás” `h2` 358 px széles dobozban 482 px tartalomszélességet igényel. A forrás: `src/styles/30-booking.css` mobil címszabálya 1133. sor körül.
- A javítás az irányadó feature-fájlokban történt; a tipográfiai karakter megmaradt, de a címek 390 px-en már nem növelik a dokumentum szélességét.

### Kezelve — bizonyított szövegkontraszt-eltérések

- Kezdőlap mobil: axe szerint 30 `color-contrast` elem. A legnagyobb csoport a hero, a szolgáltatásblokk és a footer világos szövege a `#91766e` brand háttéren; mért arányok több helyen 2.46–4.11:1.
- Foglalás mobil: 22 `color-contrast` elem. Érintett a kicker, a választók címe/leírása/gombszövege, a kezelőcímkék és a közös footer.
- Admin mobil: a belépés gomb fehér szövege `#b9858f` háttéren 2.96:1.
- A javítás szemantikus tokenek és az admin közös gombtulajdonosának módosításával történt, komponensenkénti felülíró réteg nélkül. A célzott accessibility ratchet sikeres.

### Megoldva — két footer link mobil érintési célja

- Az e-mail link és az adatkezelési link magassága körülbelül 18–20 px, a környező szabad terület sem éri el az axe 24 px-es minimumát.
- Forrás: `src/styles/13-gallery-footer-navigation.css`, a mobil footer és `.footer-jogi-link` szabályai.
- A vizuális szöveg mérete megmaradt, a kattintható magasság 44 px-re nőtt.

## Következetlenségek és fenntartási kockázatok

- A publikus és admin bundle külön alapfájlban ismétli a brand tokenek egy részét. Ez a bundle-szétválasztás miatt jelenleg indokolt, de változtatáskor mindkét forrást össze kell vetni, különben drift keletkezik.
- A szemantikus tokenek mellett sok feature-szintű közvetlen szín maradt. A 21st review legnagyobb gócpontjai: admin workspace (86), admin foundation (63), vendégfiók (62), publikus base (60), admin foglalás (55), publikus foglalás (48). Tömeges csere tilos; csak érintett komponensenként, vizuális ellenőrzéssel szabad konszolidálni.
- A spacing részben tokenizált, részben nyers érték. Új komponensben a dokumentált 4 px-es ritmust kell követni; meglévő értékeket csak célzott refaktorban érdemes összevonni.
- A publikus editorial kártyák, a közös 28 px-es kártyaradius és az admin 11–20 px-es radiusok több vizuális nyelvet alkotnak. Ez részben szándékos környezetkülönbség; új komponens ne vezessen be további radius-szintet.
- Sok reszponzív váltópont létezik. A 768 px marad az elsődleges rendszerhatár, a többi kizárólag feature-korrekció.

## Opcionális fejlesztési ötletek

- Külön feladatban készüljön kontraszt-token mátrix a publikus brand felületekre, majd a hero → foglalás → footer sorrendben történjen a javítás.
- A két hosszú mobil címet tartalmi szóhatár, `overflow-wrap` vagy kisebb, komponensspecifikus `clamp()` segítségével lehet javítani; előtte 320/375/390 px vizuális összehasonlítás szükséges.
- A brand tokenek forrásduplikációja később build-time közös tokenfragmentből generálható, ha ez nem olvasztja össze a publikus és admin felelősségi rétegeket.
- A közvetlen színek konszolidációja csak feature-nként történjen, új vizuális változás nélkül; a 21st találatszám önmagában nem indok automatikus átírásra.

## Megőrzendő erősségek

- Jól elkülönített publikus és admin CSS-bundle, feature-tulajdonos fájlokkal.
- Látható `focus-visible` alap, szemantikus form label-ek és 16 px-es mobil mezőméret.
- Következetes Cormorant Garamond + Manrope editorial/UI párosítás; a `ui-ux-pro-max` elegáns serif + olvasható sans ajánlásával összhangban.
- Admin világos/sötét szemantikus állapottokenek, külön success/warning/danger/info párokkal.
- Reduced-motion szabályok és meglévő, kockázatalapúan futtatható célzott Playwright-tesztek.

## Reszponzív javítások és paletta-visszaállítás — 2026-09-02

- A desktop hero teljes szélességű, a kép nem lóg ki a szekcióból; a bemutatkozás, szolgáltatások és galéria ugyanazt a közös tartalomszélességet és belső paddinget használja.
- A mobil hero világos elrendezése, az egybefüggő kép–galériacímke kártya és a látható hamburger ikon megmaradt.
- A vendégfiók desktop arányai és a foglalás-ellenőrzés szélesebb desktop beviteli sora megmaradt.
- A felhasználói kérésre a teljes publikus és admin felület visszakapta az eredeti quiet-luxury szemantikus színeket. Az ötszínű earth-tone kísérlet és annak paletta-specifikus ellenőrzései megszűntek; elrendezés, méret, térköz, lekerekítés és működés nem lett visszavonva.
