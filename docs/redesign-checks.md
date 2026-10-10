# LumiNails — új minimalista felület, helyi ellenőrzés

2026-10-10. Munkapéldány: `D:/Asztal/LumiNails_test`, TEST `main`.

## Eredmény és változási kör

Új, fehér–hűvös szürke–kobaltkék megjelenés; DM Sans címsorok, teljes szélességű asztali hero, mobilon vágatlan 16:9 kép. Új képes szolgáltatáskártyák, sík galérialapozó, tömör világos footer, átrendezett világos/sötét admin. A felesleges dísz-előcímek nem látszanak, a hozzájuk tartozó CMS-mezők megmaradnak.

Az autentikus képek, árak, szolgáltatások és foglalási adatok megmaradnak. A foglalási, kupon-, hitelesítési és tartalommentési logika nem változott. A publikus megjelenés régi markuphoz tartozó hero-háttér tartalékágának színe változott; adatkezelés nem. A HTML-fájlokban az új bundle-verziók szerepelnek, az admin dekoratív márkanév törése megszűnt.

Az áttervezés és a footer-kiegészítés ellenőrzésekor nem volt új függőség, migráció vagy távoli adatírás. A GitHub workflow-k változatlanok. E helyi ellenőrzési szakaszban a LIVE és a Golden Shine projekt nem változott, commit és push nem történt. A későbbi, külön jóváhagyott kiadás előkészítése alább szerepel.

## Lefutott ellenőrzések

- `npm run build` és `npm run assets:version`: sikeres forrásból építés és cache-verzió frissítés.
- `npm run check`: sikeres statikus oldal-, szintaxis-, bundle-egyezés-, publikus/admin CSS-tulajdonosi és Stylelint-ellenőrzés.
- `git diff --check`: sikeres.
- A `DESIGN.md` YAML-fejléce és a két design JSON szintaktikailag érvényes; a 10 komponens-előnézet összes megadott tokenhivatkozása ellenőrizve.
- `npx playwright test tests/visual-critical.spec.js tests/accessibility-critical.spec.js tests/admin-dark-mode.spec.js --workers=2`: 20 célzott eset. Az első körben 18 sikeres; két régi layout-elvárás / képmagasság-hiba javítása után a két érintett eset is sikeres.
- `tests/admin-production-redesign.spec.js` három kiválasztott esete: asztali admin információs elrendezés, mobil menü és vezérlők, foglalási nevek alsó betűrészei. Mindhárom sikeres; elkülönített tesztadatokkal, valódi foglalások módosítása nélkül.
- A befejező javítások után csak négy érintett eset ismétlődött: mobil 16:9 hero, közös gutter / asztali felépítés, mind a négy mobil szolgáltatásoldal, admin navigáció és státusz/visszajelzés kontrasztja. Mind a négy sikeres.
- Az axe három kritikus nézeten lefutott: főoldal, mobil foglalás és admin belépés. A dokumentált korábbi eltérések nem növekedtek, új szövegkontraszt-hiba nem jelent meg.
- Világos és sötét adminban, 390 és 1440 px szélességen az elsődleges gomb, aktív navigáció, hover-hivatkozás, letiltott foglalási státusz, sikeres és hibás visszajelzés mért szövegkontrasztja legalább 4,5:1.
- A mobil mezők számított méretét és a publikus nagyíthatóságot a célzott ellenőrzés vizsgálta. Az admin standalone PWA nagyítási szabálya változatlan.
- Friss, tényleges betűtípusokkal készült képek átnézve: főoldal asztali/mobil, foglalás mobil, fiók asztali, szolgáltatás mobil, admin asztali/mobil. Az admin tesztképek kezdeti betűtípus-mockját a helyi képkészítőben eltávolítottuk.
- Az Impeccable detektor egyszer futott a megváltozott kritikus markupokon. Nem tiszta, teljes körű akadálymentességi audit; a releváns kontraszt-, visszajelzés- és dísz-előcím hibák javítva.
- Független befejező átnézés: a három jelzett javítás mindegyikére „resolved”, végső „ship” döntés, kizárólag e három javítás lezárására. Nem teljes funkcionalitási tanúsítás.

Teljes Playwright-csomag, Lighthouse, éles hitelesítés, valódi foglalásküldés és távoli CMS-mentés nem futott. A böngészős ellenőrzés Microsoft Edge-ben történt, nem fizikai iPhone-on. A 21st.dev katalógus hitelesítése nem volt használható, ezért nincs importált 21st-komponens; a meglévő, keretrendszer nélküli elemek épültek át.

## Footer-navigáció kiegészítés — 2026-10-10

- A közös footerbe bekerült a hat fő navigációs link és mind a négy szolgáltatásoldal. Az adatkezelési hivatkozás megmaradt; admin- és hibaoldal nem került a vendégnavigációba.
- Az irányadó `src/html/site-footer.html` navigációja célzott, mechanikus szinkronnal bekerült mind a 12 meglévő HTML-oldalba. Nem futott teljes adatlekérés vagy előrenderelés: a többi HTML-tartalom változatlan maradt. A normál későbbi prerender ugyanezt a közös forrást használja.
- Mobilon a fő linkek két rendezett sorba, a szolgáltatások két oszlopba kerülnek; desktopon egymás mellett jelennek meg. A 44px-es érintési célok megmaradtak.
- Sikeres: CSS-lint, publikus CSS-felelősség ellenőrzése, build, asset-verziózás, forrás/bundle egyezés, statikus oldalellenőrzés és Git-diff ellenőrzés.
- Egy célzott Playwright-eset sikeres: 390 és 1440px footer-képek átnézve, mind a tíz URL ellenőrizve; 320px-en a linkek a navigáción belül maradnak és legalább 44px magasak. A 12 statikus HTML-ben a navigáció és a céloldalak létezése külön ellenőrizve. Nem futott teljes tesztcsomag.
- A 21st keresés HTTP 401 hibát adott; a meglévő elemeket használtuk. A két forrásra futó determinisztikus review 0 error / 0 warning és 21 korábban is meglévő színjavaslatot adott.
- E kiegészítés fájljai: `src/html/site-footer.html`, `src/styles/13-gallery-footer-navigation.css`, `tests/visual-critical.spec.js`, `DESIGN.md`, `docs/design-system.md`, `docs/redesign-checks.md`, generált `style.css`, valamint az alább felsorolt mind a 12 HTML-fájl (az adminnal együtt). Más alkalmazáskód nem változott; LIVE, GitHub workflow, távoli adat és push változatlan.

## Éles kiadás előkészítése — 2026-10-10

- A felhasználó kifejezetten jóváhagyta a jelenlegi új felület és footer élesítését. Kiadási sorrend: TEST `main` commit és sikeres deploy, majd pontosan e commit átemelése a meglévő LIVE promóciós workflow-val, a `CNAME` és `.github` megtartásával.
- Az előző LIVE commit: `2c03d16f329b262d33a9840d2a506377fba558b3`. A teljes Git-történet helyi, ellenőrzött mentése: `local-backups/LumiNails-Live-before-redesign-2026-10-10.bundle`. Nem jött létre új távoli backup-ág vagy repository.
- A kiadás előtti összehasonlítás külön TEST/LIVE HTML-frissítő hívást talált. Az admin most pontos domain alapján választ: `luminails.hu` / `www.luminails.hu` → meglévő `request-live-site-rebuild`; TEST / localhost → `request-site-rebuild`. Sikertelen hívásnál nincs áthívás a másik környezetre. A session-követelmény és a szerveroldali admin-ellenőrzés változatlan.
- Az éles frissítő forrása változtatás nélkül át lett véve a fenti LIVE commitból, így a promóció nem törli. A Supabase Function telepítése, secret, adatbázis és migráció nem változik. A Supabase útmutató és az aktuális `functions.invoke` dokumentáció át lett nézve; a deployed Function forrásához a connector nem adott olvasási jogosultságot, így valódi admin-dispatch nem futott.
- Sikeres: kilenc célzott, hálózatmentes regresszióteszt a két LIVE domainre, TEST/localhostra, megtévesztő domainre, hiányzó sessionre, jogosultsági és hálózati hibára. Build, asset-verziózás és statikus oldal/szintaxis ellenőrzés is sikeres. A változatlan UI-t nem teszteltük újra teljes egészében.
- Megőrzött, nem ebben a kiadásban javított eltérés: a régi LIVE Function repositorybeli forrása `site-content-updated` eseményt küld, a LIVE workflow `live-site-content-updated` eseményt vár. A deployed Function aktuális eltérése nem volt ellenőrizhető; a meglévő ütemezett tartalomfrissítés megmarad. A mostani kiadás nem módosítja e távoli Functiont.

## Módosított és létrehozott fájlok

A generált CSS/JS és HTML cache-verziók a projekt build parancsaiból származnak, nem közvetlen javításból.

### Design- és projektdokumentáció

- `PRODUCT.md` — új.
- `DESIGN.md` — új.
- `.impeccable/design.json` — új.
- `.21st/DESIGN.md`.
- `.21st/design.json`.
- `docs/design-system.md`.
- `docs/redesign-checks.md` — új, ez a jelentés.
- `DEVELOPMENT.md` — TEST/LIVE HTML-frissítő hívások dokumentálása.
- `.gitignore` — a helyi ellenőrző képek kizárása.

### Publikus források

- `src/html/site-footer.html`.
- `src/styles/00-base.css`.
- `src/styles/11-price-page.css`.
- `src/styles/13-gallery-footer-navigation.css`.
- `src/styles/15-home-sections.css`.
- `src/styles/16-home-gallery.css`.
- `src/styles/18-hero-inner-pages.css`.
- `src/styles/19-service-detail.css`.
- `src/styles/25-customer-account.css`.
- `src/styles/30-booking.css`.
- `src/public/30-content-rendering.js`.

### Admin források

- `src/admin-styles/00-foundation.css`.
- `src/admin-styles/20-workspace.css`.
- `src/admin-styles/30-bookings.css`.
- `src/admin/18-public-html-refresh.js`.
- `admin/index.html`.

### Kiadási környezet és megőrzött Function-forrás

- `scripts/check-site.js` — mindkét frissítő forrás létezésének ellenőrzése.
- `supabase/functions/request-live-site-rebuild/index.ts` — változatlanul visszavett LIVE-forrás; nem Function-deploy.

### Generált bundle-ök

- `style.css`.
- `admin-v2.css`.
- `script.js`.
- `admin-supabase.js`.

### Publikus HTML cache-verziók

- `index.html`.
- `404.html`.
- `adatkezeles/index.html`.
- `arlista/index.html`.
- `fiokom/index.html`.
- `foglalas/index.html`.
- `galeria/index.html`.
- `gel-lakk-tatabanya/index.html`.
- `korom-diszites-nail-art-tatabanya/index.html`.
- `manikur-tatabanya/index.html`.
- `mukorom-epites-toltes/index.html`.

### Célzott ellenőrzők

- `tests/admin-dark-mode.spec.js`.
- `tests/admin-production-redesign.spec.js`.
- `tests/visual-critical.spec.js`.
- `tests/admin-public-html-refresh.spec.js` — új.

A `.impeccable/review/` alatti képkészítő és PNG-fájlok helyi, ignorált ellenőrzési segédanyagok; nem kerülnek a kiadásba.
