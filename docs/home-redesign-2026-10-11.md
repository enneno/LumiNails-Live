# LumiNails főoldali redesign – 2026-10-11

A helyi TEST-változatban elkészült a kért hero-, szövegelrendezés-, galéria- és szolgáltatásikon-redesign. Az öt meglévő márkaszín, az eredeti CMS-szövegek, saját fotók és szolgáltatásadatok megmaradtak. Az éles oldal, admin, foglalási adatok és GitHub workflow nem változott; commit és push nem történt.

## Vizuális döntések

Szépségszalon bemutatkozó oldalaként kezeltük: nyugodt, fotóközpontú megjelenés, a meglévő Ivory & Taupe arculattal, natív CSS/HTML/JavaScript alapon. DESIGN_VARIANCE: 6; MOTION_INTENSITY: 3; VISUAL_DENSITY: 3. Meglévő gombok, tipográfia, térköz- és színtokenek, valamint a közös galéria-képnézegető újrafelhasználásával.

- A hero szövege és foglalási gombja asztalon a keretezett fotó mellett látszik. Telefonon szöveg, gomb, majd vágatlan 16:9 fotó követi egymást.
- A három korábban nagy, kép fölötti szakaszlink kisebb navigációként került a hero aljára. A Munkák link az önálló főoldali galériához vezet.
- Az aktív értesítés szövege változatlan, bézs alapon, kisebb címkével és rendezett térközökkel jelenik meg.
- Az öt eredeti galériakép nagy képrácsba került. Egy kiemelt fotó és négy másodlagos kép adja az asztali elrendezést; telefonon a kiemelt kép alatt kétoszlopos rács látszik.
- Kattintásra a meglévő képnézegető nyílik meg: lapozás, Escape, fókuszkezelés és swipe. A főoldali képek betöltését előzetes dekódolás védi; hibánál megmarad az előző kép és szöveges visszajelzés jelenik meg. JavaScript nélkül az öt kép valódi képhivatkozásként működik.
- Helyi SVG szolgáltatásikonok: három Phosphor ikon és egy IconPark körömlakkos üveg, a meglévő charcoal színnel és bézs háttérrel. Ugyanaz az ikon jelenik meg a statikus HTML-ben és a CMS-renderelés után.

## Ellenőrzések

- npm run build: sikeres.
- npm run lint:css: sikeres.
- npm run build:check: sikeres; a generált fájlok megegyeznek a forrással.
- JavaScript-szintaxis és git diff --check: sikeres.
- 21st review az érintett HTML/CSS fájlokra: 4 fájl, 0 találat, 0 automatikus javítás. A katalóguskeresés HTTP 401 miatt nem volt elérhető; külső UI-komponenst nem telepítettünk.
- Böngészős ellenőrzés 320, 375, 414, 768, 1024, 1280 és 1440 px szélességnél: nincs vízszintes túlcsordulás, öt fotó, betöltött szolgáltatásikonok, mobilon vágatlan 16:9 hero.
- Célzott Playwright: a főoldali képnézegető megnyitása, lapozás, Escape, fókuszvisszaadás és képhiba utáni megőrzés sikeres.
- Célzott Playwright: a négy szolgáltatásikon CMS-renderelés után és JavaScript nélkül, mobil/asztali nézetben sikeres; az érintett szolgáltatásszekció axe-ellenőrzése 0 találatot adott. Egy régi PNG-méretfeltételt SVG-kompatibilis betöltési ellenőrzésre kellett módosítani; csak ez a teszt futott újra, sikeresen.
- npm run public:css:check: sikeres. A lecserélt Icons8-láblécelem két korábbi duplikált alapstílusa megszűnt.
- Nem futott teljes tesztcsomag vagy Lighthouse. Fizikai iPhone/Safari nem volt része az ellenőrzésnek.

## Módosított és létrehozott fájlok

- .21st/DESIGN.md
- .21st/design.json
- 404.html
- DESIGN.md
- adatkezeles/index.html
- arlista/index.html
- fiokom/index.html
- foglalas/index.html
- galeria/index.html
- gel-lakk-tatabanya/index.html
- index.html
- korom-diszites-nail-art-tatabanya/index.html
- licenses/phosphor-icons.txt
- manikur-tatabanya/index.html
- mukorom-epites-toltes/index.html
- script.js
- src/html/site-footer.html
- src/public/00-bootstrap.js
- src/public/30-content-rendering.js
- src/public/40-footer-forms.js
- src/public/45-home-gallery-carousel.js
- src/public/50-gallery-ui.js
- src/styles/00-base.css
- src/styles/11-price-page.css
- src/styles/12-legal.css
- src/styles/13-gallery-footer-navigation.css
- src/styles/15-home-sections.css
- src/styles/16-home-gallery.css
- src/styles/18-hero-inner-pages.css
- src/styles/19-service-detail.css
- src/styles/25-customer-account.css
- src/styles/30-booking.css
- style.css
- tests/compact-footer-services.spec.js
- tests/studio-navigation.spec.js
- docs/home-redesign-2026-10-11.md (új)
- kepek/ikonok/diszites.svg (új)
- kepek/ikonok/epites.svg (új)
- kepek/ikonok/gel-lakk.svg (új)
- kepek/ikonok/manikur.svg (új)
- licenses/iconpark.txt (új)

A hiányzó munkamappa teljes, commitolt TEST-forrása az eredeti D:/Asztal/LumiNails_test példányból került vissza a jelenlegi C:/Users/llevi/OneDrive/Asztali gép/LumiNails_test mappába. Az eredeti D: példány és annak nem commitolt előnézeti fájljai változatlanok. A meglévő csomagzár alapján telepítettük a hiányzó fejlesztői függőségeket; package.json és package-lock.json nem módosult.

## Előnézet

Helyi TEST: http://127.0.0.1:8102/

Képek az ignorált output/playwright/ mappában: home-redesign-desktop.jpg, home-redesign-mobile.jpg, home-redesign-gallery.jpg, services-icons-320.png, services-icons-390.png, services-icons-1440.png.

## A kért finomítások

- A szöveges linkek dekoratív nyilai eltűntek a statikus HTML-ből, a CMS-renderelésből és a foglalási útválasztókból. A főoldali szekciólinkek bézs keretes kiemelést, hover/aktív állapotban sötét hátteret kapnak.
- A menü, főoldali és galériaoldali képnézegető, valamint a foglalási visszaigazoló ablak közös görgetészárolást használ. A háttér rögzített, a korábbi pozíció az utolsó ablak bezárásakor visszaáll. A főoldali sticky fejléc zárolás alatt is látható.
- A gél lakk ikon IconPark nail-polish üveg. Forrás: https://github.com/bytedance/IconPark/blob/master/source/Makeups/nail-polish.svg. Apache-2.0 licenc és a módosítások: licenses/iconpark.txt.
- A láblécből a hosszú szabadidőpont-megjegyzés és az Icons8-hivatkozás kikerült. Készítette a VibeWeb: https://vibeweb.hu/. A statikus oldalak és a láblécsablon egyaránt frissültek; a CMS nem állítja vissza az eltávolított megjegyzést.
- A szekciók térköze asztalon 32–48px, mobilon 28px. A szolgáltatási aloldalak, árlista, jogi, foglalási és fiókoldal érintett külső térközei csökkentek.
- A galéria alapnézetben 4 oszlopos asztalon, 3 oszlopos köztes méreten, 2 oszlopos telefonon. A feliratok 14px/12px méretűek, a képek alatt látszanak, a fotók takarás nélkül nagyíthatók.

### Célzott ellenőrzés a finomítások után

- Build, forrás-CSS lint, CSS-felelősségi ellenőrzés, bundle-ellenőrzés, JS-szintaxis és Git-diff: sikeres.
- Playwright: public overlays stop background scrolling and restore the previous position — sikeres; mobil menü, menüből szekcióugrás, galéria nagyítás/lapozás/bezárás és pozíció-visszaállítás 390px és 1440px nézetben. A kezdeti ellenőrzés jelzett sticky fejléc-eltűnést és túl késői galéria-bekötést; a kapcsolódó javítás után csak ez a teszt futott újra.
- Playwright: booking confirmation popup locks scrolling without submitting a booking — sikeres; kizárólag szintetikus visszaigazoló UI, foglalás és adatírás nélkül.
- Playwright: homepage works open in the shared viewer and a failed image retains the last good photo — sikeres.
- Vizuális ellenőrzés: 320px főoldali szekciólinkek és lábléc; 390px menü és galéria; 1280px galéria, szolgáltatásikonok és gél lakk aloldal. Nincs vízszintes túlcsordulás, a helyi ikonok betöltődnek.
- Új képernyőképek: gallery-refinement-mobile.jpg, gallery-refinement-desktop.jpg, services-refinement-desktop.jpg, footer-refinement-mobile.jpg az ignorált output/playwright mappában.
- Nem futott teljes tesztcsomag vagy új teljes oldalas audit. Az éles helyi projekt és a luminails.hu oldal változatlan. Commit, push és közzététel nem történt.

## Főoldali menüsor visszaállítása

- Megszűnt a Kezdőlap, Szolgáltatások és Galéria menüpontok főoldali elrejtése. Az asztali fejléc mind a hat meglévő menüpontot mutatja, az egységes 14px tipográfiával és foglalási gombbal.
- 769–900px között kisebb menütérköz biztosítja, hogy a teljes menüsor és a logó ne érjen össze. Telefonon megmaradt a hamburgeres navigáció.
- Módosított fájlok ebben a javításban: src/styles/00-base.css, a belőle újraépített style.css, index.html (CSS-verzió), docs/home-redesign-2026-10-11.md.
- Ellenőrzés: npm run build, npm run lint:css, npm run public:css:check és git diff --check sikeres. Célzott böngészős ellenőrzés: 1280px asztali fejléc; 769px menüsor/logó elhelyezés; 390px hamburger nyitás és zárás. Teljes tesztcsomag nem futott.
- Képernyőkép: output/playwright/home-menu-restored.jpg. Az éles helyi projekt és a luminails.hu oldal nem változott; commit és push nem történt.

## Blokksorrend és élesítési jóváhagyás

- A főoldali Bemutatkozás és Munkák szekció helyet cserélt: hero, bemutatkozás, szolgáltatások, munkák, foglalási meghívás. A két szekció tartalma változatlan. Az index.html diffje és a helyi böngészős sorrend/megjelent tartalom ellenőrzése sikeres.
- A felhasználó 2026-10-11-én külön engedélyezte az élesítést: „Mehet elesre.” Ez a dokumentumban felsorolt 41 fájlból álló, helyileg már ellenőrzött redesign és finomítások kiadására vonatkozik.
- TEST alap: c64e5f48f14da8322a770d7c840e1d8a82e7cb30. Éles alap: 4452f42510deecfff978215b866f8edf7a9eae8a, amely ugyanezt a TEST-alapot emelte át.
- A TEST-projekt pontos útvonala C:/Users/llevi/OneDrive/Asztali gép/LumiNails_test. A szokásos munkamappák és Codex-worktree-k read-only átnézése nem talált éles Git-munkapéldányt. Az éles forrást read-only GitHub API és Git-fetch azonosította: enneno/LumiNails-Live, main, CNAME=luminails.hu. A kiadáshoz a meglévő távoli promóciós workflow-t használjuk; feltételezett éles helyi útvonalon nem történik írás.
- Kiadási sorrend: a jóváhagyott fájlkör commitja és sikeres TEST Pages-deployja, majd ugyanezen konkrét commit átemelése a Promote tested site to luminails.hu folyamattal. A .github és CNAME éles beállításai megmaradnak. Új GitHub-teszt vagy helyi teljes újratesztelés nem része a kiadásnak.
