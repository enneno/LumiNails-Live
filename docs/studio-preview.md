# Ivory & Taupe szalonfelület — helyi előnézet

## TEST-kiadás jóváhagyása

A felhasználó 2026-10-10-én jóváhagyta a tesztoldali közzétételt: „Mehet teszt oldalra”. Cél: `enneno/enneno.github.io`, `main`, https://enneno.github.io/ . A korábban sikeres helyi ellenőrzéseket érdemi alkalmazáskód-változás nélkül nem futtatjuk újra. A GitHub-folyamat továbbra is kizárólag deploy; a `.impeccable/` és `.21st/` fejlesztői kontextus nem kerül a nyilvános kiadási csomagba. A kiválasztott A terv és a végleges brief megmarad a repository fejlesztői dokumentációjaként; az elvetett helyi tervváltozatok, kérdésállapotok és build/review bizonyítékok nem részei ennek a commitnak. LIVE-kiadásra ez a jóváhagyás nem vonatkozik.

Az alábbi rész a helyi megvalósítás lezáráskori ellenőrzési naplója, a fájllista a teljes akkori munkapéldányt mutatja. A kiadási commit ezen felül `.github/workflows/pages.yml` fájlban két kizárást tartalmaz.

2026-10-10. Munkamappa: `D:\Asztal\LumiNails_test`; TEST `main`. Helyi cím: http://127.0.0.1:8101/ . Az első/A terv és a felhasználó Ivory & Taupe palettája a vizuális alap. A saját képek használatát külön megerősítette. Nincs commit, push, távoli tartalomírás vagy LIVE-módosítás.

## Megvalósítás

- Három kezdőlapi nézet: Munkák, Szolgáltatások, Szofi. A fő navigációban közvetlen árlista-, fiók- és foglaláselérés; mobilon megmarad a menü.
- Teljes szélességű, szöveggel és overlayjel nem takart valódi CMS-nyitókép. Mobilon teljes, vágás nélküli 16:9. Asztalon a széles tervkerethez igazított képkivágás, külön nagyító transzformáció nélkül.
- Az öt eredeti galériakép előnézete, lapozógomb, érintéses és billentyűzetes kezelés. Képbetöltési hiba esetén az utolsó sikeres kép marad; párhuzamos választásnál az utolsó kérés nyer.
- A szolgáltatások képes sorokként, a bemutatkozás külön nézetként jelenik meg. A valódi adatok és az adminból szerkeszthető képek megmaradnak.
- Közös, kompakt lábléc hat főoldal-/funkcióhivatkozással és négy szolgáltatásoldallal, elérhetőséggel és valós foglalhatósági tájékoztatóval.
- Publikus és admin light/dark színtokenek az öt rögzített árnyalatra épülnek. A funkcionális foglalási, siker-, figyelmeztetési és hibaállapotok nem olvadnak bele a brand színeibe.
- A foglalás bemutató és űrlaprétegei sík, elválasztott szakaszok; a régi egymásba ágyazott kártyák és széles árnyékok eltűntek. A kiválasztható szolgáltatás/dátum/időpont vezérlők és működés változatlanok.
- A fő tartalom, a képek és a hivatkozások JavaScript nélkül is benne vannak a valódi HTML-ben. JavaScript csak a nézetváltást és a friss tartalomellenőrzést adja hozzá.
- Nincs új függőség, keretrendszer, adatbázis-migráció, Edge Function-változás vagy GitHub-teszt.

## Tényleges ellenőrzések

- `npm run build`, `npm run prerender`, `npm run assets:version`: sikeres. A prerender kizárólag nyilvános tartalmat olvas; 12 HTML-oldal, 19 aktív szolgáltatás.
- `npm run check`: statikus ellenőrzés, forrás/bundle-egyezés, publikus és admin CSS-tulajdon, Stylelint sikeres.
- `tests/studio-navigation.spec.js`: négy sikeres célzott eset. Billentyűzet, közvetlen link, mobilmenü, három nézet axe-ellenőrzése, képhiba/gyors választás, JavaScript nélküli tartalom és footer.
- Túlcsordulás és a három nézet tördelése: 320, 375, 390, 414, 768, 1024, 1280, 1440, 1536 px. Telefonon 16:9 és `contain` képméretezés ellenőrizve.
- `tests/accessibility-critical.spec.js`: három sikeres eset, kezdőlap/foglalás/admin-belépés mobil. Az ismert accessibility eltérések nem nőttek.
- `tests/palette-contrast.spec.js`: két sikeres eset; műveleti/kijelölt foglalási vezérlők alap- és hover-állapotban legalább 4,5:1; sík foglalási konténerek regresszióvédelme 320/390/1440px-en.
- `tests/admin-dark-mode.spec.js`: négy sikeres eset, tématárolás, gomb/navigáció/readonly státusz/siker-/hibaüzenet, PWA-vezérlő és szemantikus naptárszínek. Egy korábbi bézs RGB-elvárás az új palettához igazítva.
- `tests/admin-theme-accessibility.spec.js`: bejelentkezett áttekintés light/dark, 1440 és 390 px, izolált mintaadatokkal. A sötét kártyák halvány kiegészítő feliratait és profilfeliratát javítottuk; végül nulla axe-kontraszteltérés.
- `tests/visual-critical.spec.js` öt közvetlenül érintett esete: publikus 16px-es mezők/page zoom, kompakt footer/10 oldalhivatkozás, asztali fiók/foglalásellenőrzés placeholder, foglalás asztali/mobil képi ellenőrzés. Mind sikeres.
- Összesen 20 különálló célzott Playwright-eset sikeres a javítások után. A korábbi hibás palettaelvárás és sötét admin kontraszt javítva, az érintett esetek újrafuttatva.
- Két saját kötegelt képi ellenőrzés, majd a független review előírta foglalási javítás után ugyanazon 13 felvétel újraellenőrzése: három kezdőlapi nézet asztali/mobil, foglalás mobil, reprezentatív szolgáltatásoldal mobil, admin asztali/mobil light/dark és tervméretű hero. Valódi betűk/képek, admin tesztadatok. Egy mobil admin felvételt a félkész toast miatt külön újra kellett készíteni; a véglegesben az üzenet teljesen eltűnt.
- Képeredet: 46 meglévő lokális raszter kapott a kiinduló Git-verzióhoz vezető eredet-metadatát. A dekódolt képpontok, méret és orientáció mindegyiknél pontosan egyeznek a HEAD-del. Nem új fotók, nem vizuális módosítás; a távoli CMS-képek URL-je/adata változatlan. Provenance scan: 46 kép, 0 hiányzó eredet.
- UI/UX Pro Max célzott `image loading error recovery` keresés: valós találat a hiba utáni helyreállításra és aria-live visszajelzésre; a megvalósítás és célzott képhibateszt ezt követi. Nem generáltunk új palettát a rögzített felhasználói színek helyett.
- `21st search 'minimal photo thumbnail navigation' --context auto --limit 3`: HTTP401, ezért nincs ellenőrzött katalógustalálat vagy importált komponens. `21st review src/styles/18-hero-inner-pages.css src/styles/30-booking.css`: lefutott, 34 információs hardcoded-color figyelmeztetés, 0 automatikus javítás. Ezek meglévő foglalási/állapot/kivétel színek; nem teljesen tiszta katalógus-reviewként jelentjük. A konkrét átépítést a jóváhagyott terv és meglévő komponensek vezérlik.
- `git diff --check`: sikeres.
- Teljes tesztkészlet, Lighthouse, valós iPhone/Safari és telepített PWA ellenőrzés nem futott. Nem adtunk le tényleges foglalást.

## Látványterv-összevetés és korlátok

A fotók a felhasználó kérésére eltérnek a generált tervtől. A teljes képpont-összevetés nem sikeres teszt: a korábbi 1536-as mérés körülbelül 64%, a 1440-es összevetés 58%, ezért a mechanikus kapuk nem jelentenek vizuális jóváhagyást. Az eltérések közé tartoznak a saját fotók, az elérhetőségi fókusz/aktív állapot és a teljes tényleges footer/adatközlés. A független vizuális review külön értékeli a felépítést és a felületet.

A választó betűtípusának rangsorolása környezeti hiba miatt becsült volt; a megvalósítás Reddit Sans Condensedet használ. A detector bézs palettát kifogásoló jelzése a felhasználó rögzített palettáját nem írja felül. A sorkizárás/elválasztás nélküli szöveg korábbi kifejezett kérés, ezért megmaradt. Több dokumentációs figyelmeztetés a korábbi DESIGN.md-re vonatkozott; a végső review után az új dokumentáció a tényleges forrásértékekből elkészült.

## Független vizuális lezárás

A teljes review mind a 13 felvételt érvényesnek találta. Egy P2 eltérést jelölt: a foglalás régi, kártyás bekeretezése. Ez egy kötegben javítva, build és célzott ellenőrzés után ugyanazokon a felvételeken visszaellenőrizve. A lezáró verdikt **ship**, az egyetlen felsorolt javítást **resolved** állapotúnak értékelte. Ez a verdikt a javításlistára vonatkozik, nem új teljes felületi tanúsítás vagy kiadási engedély. A sikertelen numerikus képpont-összevetés továbbra sem PASS.

A root DESIGN.md és a .impeccable/design.json a megvalósított felületből elkészült; a .21st kontextus és a rövid projekt-specifikus útmutató is ehhez igazodik. A sidecar kilenc önállóan megjeleníthető mintát tartalmaz. Ellenőrzési bizonyítékok: ignorált .impeccable/review/finish-review.md és finish-verdict.md.

A dokumentáció lezáró ellenőrzése sikeres: YAML-szerkezet/tokenhivatkozások, nyolc kanonikus szekció sorrendje, JSON schemaVersion2/extensions-only, kilenc önálló komponensminta, pontos narrative-egyezés, whitespace. Az Impeccable munkafolyamat `ship` diszpozícióval lezárva; ez helyi munkaállapot, nem deploy vagy push.

## Fájllista

A kiinduló commit: `f5f521f3fdceb1d1310573d7bd4d2b452ecba712`. Az alábbi lista a végső helyi munkapéldány teljes diffje ehhez képest: 89 módosított, 51 új fájl. Tartalmazza a korábbi helyi próbák megőrzött artefaktumait is; nem mind ebben a lezáró lépésben keletkezett. Semmi nincs commitolva vagy pusholva.

### Források és futási konfiguráció

```text
scripts/public-css-architecture.js
src/admin-styles/00-foundation.css
src/admin-styles/10-components.css
src/admin-styles/20-workspace.css
src/admin-styles/30-bookings.css
src/html/site-footer.html
src/html/site-header.html
src/public/00-bootstrap.js
src/public/30-content-rendering.js
src/public/45-home-gallery-carousel.js
src/styles/00-base.css
src/styles/13-gallery-footer-navigation.css
src/styles/15-home-sections.css
src/styles/16-home-gallery.css
src/styles/18-hero-inner-pages.css
src/styles/19-service-detail.css
src/styles/25-customer-account.css
src/styles/30-booking.css
supabase-config.js
```

### Célzott tesztek

```text
tests/admin-dark-mode.spec.js
tests/admin-theme-accessibility.spec.js
tests/palette-contrast.spec.js
tests/studio-navigation.spec.js
tests/visual-critical.spec.js
```

### Oldal-HTML és generált kiadási fájlok

```text
404.html
adatkezeles/index.html
admin-v2.css
admin/index.html
arlista/index.html
fiokom/index.html
foglalas/index.html
galeria/index.html
gel-lakk-tatabanya/index.html
index.html
korom-diszites-nail-art-tatabanya/index.html
manikur-tatabanya/index.html
mukorom-epites-toltes/index.html
script.js
sitemap.xml
style.css
```

### Dokumentáció és design context

```text
.21st/DESIGN.md
.21st/design.json
.impeccable/design.json
DESIGN.md
PRODUCT.md
docs/design-system.md
docs/palette-preview.md
docs/studio-preview.md
```

### Kizárólag eredet-metadatával változott képek

```text
galeria/optimized/large/image0.jpg
galeria/optimized/large/image1.jpg
galeria/optimized/large/image10.jpg
galeria/optimized/large/image11.jpg
galeria/optimized/large/image12.jpg
galeria/optimized/large/image2.jpg
galeria/optimized/large/image3.jpg
galeria/optimized/large/image4.jpg
galeria/optimized/large/image5.jpg
galeria/optimized/large/image6.jpg
galeria/optimized/large/image7.jpg
galeria/optimized/large/image8.jpg
galeria/optimized/large/image9.jpg
galeria/optimized/thumbs/image0.jpg
galeria/optimized/thumbs/image1.jpg
galeria/optimized/thumbs/image10.jpg
galeria/optimized/thumbs/image11.jpg
galeria/optimized/thumbs/image12.jpg
galeria/optimized/thumbs/image2.jpg
galeria/optimized/thumbs/image3.jpg
galeria/optimized/thumbs/image4.jpg
galeria/optimized/thumbs/image5.jpg
galeria/optimized/thumbs/image6.jpg
galeria/optimized/thumbs/image7.jpg
galeria/optimized/thumbs/image8.jpg
galeria/optimized/thumbs/image9.jpg
kepek/apple-touch-icon.png
kepek/bemutatkozas-kep.jpg
kepek/favicon-180.png
kepek/favicon-192.png
kepek/favicon-32.png
kepek/favicon-48.png
kepek/favicon-512.png
kepek/favicon-96.png
kepek/galeria-atvezeto-1.jpg
kepek/galeria-atvezeto-2.jpg
kepek/galeria-atvezeto-3.jpg
kepek/hatter2.jpg
kepek/hero-exact.jpg
kepek/hero-hullamos.jpg
kepek/hero-turkiz.jpg
kepek/social-preview.jpg
kepek/szolgaltatas-diszites.jpg
kepek/szolgaltatas-epites.jpg
kepek/szolgaltatas-gel-lakk.jpg
kepek/szolgaltatas-manikur.jpg
```

### Helyi tervezési/folyamat-artefaktumok (új fájlok)

```text
.impeccable/build/comp-grid.png
.impeccable/build/regions.json
.impeccable/build/scaffold/hero-reference.html
.impeccable/build/scaffold/layout.css
.impeccable/build/spec.json
.impeccable/build/state.json
.impeccable/mocks/catalog-a.json
.impeccable/mocks/catalog-a.png
.impeccable/mocks/catalog-b.json
.impeccable/mocks/catalog-b.png
.impeccable/mocks/catalog-c.json
.impeccable/mocks/catalog-c.png
.impeccable/mocks/catalog-compositions.json
.impeccable/mocks/decision/catalog.json
.impeccable/mocks/decision/catalog.png
.impeccable/mocks/decision/conventional.json
.impeccable/mocks/decision/conventional.png
.impeccable/mocks/decision/invitation.json
.impeccable/mocks/decision/invitation.png
.impeccable/mocks/decision/new-directions.json
.impeccable/mocks/decision/new-structure-notes.md
.impeccable/mocks/decision/photo-vitrine.json
.impeccable/mocks/decision/photo-vitrine.png
.impeccable/mocks/decision/salon-magazine.json
.impeccable/mocks/decision/salon-magazine.png
.impeccable/mocks/decision/structure-directions.json
.impeccable/mocks/decision/structure-notes.md
.impeccable/mocks/decision/studio-switcher.json
.impeccable/mocks/decision/studio-switcher.png
.impeccable/mocks/studio-ivory-a.json
.impeccable/mocks/studio-ivory-a.png
.impeccable/mocks/studio-ivory-a.png.json
.impeccable/mocks/studio-ivory-b.json
.impeccable/mocks/studio-ivory-b.png
.impeccable/mocks/studio-ivory-b.png.json
.impeccable/mocks/studio-ivory-c.json
.impeccable/mocks/studio-ivory-c.png
.impeccable/mocks/studio-ivory-c.png.json
.impeccable/mocks/studio-ivory-compositions.json
.impeccable/mocks/studio-ivory-notes.md
.impeccable/questions/3e2682d1.answer.json
.impeccable/questions/3e2682d1.state.json
.impeccable/questions/c1482fc3.state.json
.impeccable/questions/edf8f3be.state.json
.impeccable/studio-brief.md
.impeccable/surfaces/index-html.md
```

A `.impeccable/review/` képei, összevetései és ellenőrző szkriptjei ignorált helyi bizonyítékok. A képeken csak eredet-metaadat változott, a képpontok nem. A GitHub workflow, adatbázis-migráció és Edge Function nem módosult.
