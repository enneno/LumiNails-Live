# LumiNails: statikus Cloudflare-kiadás és élő Supabase

## A működés és a kiadás

1. Fejlesztés és a kockázathoz igazított helyi ellenőrzés a TEST-ben.
2. A kész commit az enneno/enneno.github.io main ágára kerül. GitHubon nem fut teszt vagy audit.
3. A Cloudflare Pages Git-integráció az npm run build:site paranccsal készíti el a dist csomagot. A TEST címe https://luminails-test.pages.dev.
4. Az élesítés csak külön jóváhagyással történik: a tényleges TEST deployment.json által igazolt commit alkalmazásfájljai kerülnek az enneno/LumiNails-Live main ágára. A LIVE CNAME megmarad; a korábbi GitHub Pages workflow-k megszűnnek. Az éles Cloudflare Pages projekt neve luminails, a domain https://luminails.hu marad.
5. A Pages statikus fájlokat szolgál ki; saját Worker-script, SSR és KV nem kell. A meglévő Pages hosztingot megtartjuk, ezért DNS- vagy domainköltözés sem kell.
6. Az admin nyilvános tartalommentése Supabase-ben történik. Az Edge Function minden híváskor ellenőrzi a belépést és az aktuális is_lumi_admin jogosultságot, összeveti a tartalom ujjlenyomatát a ténylegesen kiszolgált kiadással, és szükség esetén meghívja a szerveroldali Deploy Hookot.
7. A mentés és a nyilvános megjelenés külön állapot. A megjelenést a deployment.json környezete, eredete és contentHash értéke igazolja. A build elindítása önmagában nem jelent megjelenést. Sikertelen buildnél az előző működő kiadás marad kiszolgálva.

## Fájlok, cache és élő adatok

A scripts/public-files.js az egyetlen publikus fájllista. A dist csak az engedélyezett HTML-t, böngészős CSS/JS-t, képeket, manifestet, robots.txt-t, sitemapet, adatokat és Cloudflare _headers fájlt tartalmazza. SQL, Edge Function, teszt, dokumentáció, npm-eszköz és helyi mentés nem kerül a kiadásba.

A HTML és az adatok.json ugyanabból a nyilvános pillanatképből készül. Vendégadat, foglalás és e-mail-sablon nem része a JSON-nak. A fő CSS/JS fájlok tartalmi hash-t és hosszú immutable cache-t kapnak; a HTML, az állandó nevű JSON és a service worker frissességét újraellenőrzi a kliens. Az admin PWA nagyítási tilalma megmarad.

A foglalható időpontok, kuponok, belépés, profilok, foglalások és e-mailküldés élő Supabase-műveletek maradnak. A végleges foglalást továbbra is az adatbázis ellenőrzi. A statikus JSON hibájánál nincs publikálatlan tartalmat megjelenítő Supabase-fallback. Az azonos párhuzamos lekérések összevonódnak; az admin felület csak a megnyitott panel adatait tölti be, a stabil szerkesztőadatokat munkameneten belül őrzi.

## Cloudflare konfiguráció

Mindkét Pages projekt Git-alapú buildet használ: npm run build:site, dist kimenet, / gyökér, NODE_VERSION=24. A TEST változói: LUMI_DEPLOY_ENV=test és LUMI_SITE_ORIGIN=https://luminails-test.pages.dev. A LIVE változói: LUMI_DEPLOY_ENV=live és LUMI_SITE_ORIGIN=https://luminails.hu. A TEST robots és HTML noindex védelemmel készül.

A deploy:test parancs a kész helyi dist manuális Pages-feltöltésére szolgál; a normál kiadási út a Git-integráció. Helyi build kizárólag a megfelelő TEST/localhost eredettel indítható. A build nyilvános Supabase-adatokat olvas, adatbázist nem ír.

A Cloudflare Deploy Hook URL-je titok. Nem kerül Gitbe, böngészőbe vagy alkalmazásnaplóba. A TEST és LIVE külön hookot és külön publikációs zárolást kap.

## Supabase és tartalommegőrzés

A közös Supabase projekt: htbpzvmlegapaphsipax. Külön TEST-adatbázis nincs: a TEST és LIVE adatkezelése nem izolált. Más projekt adatát, titkát és környezeti azonosítóját nem használjuk.

A külön jóváhagyott 20261028160120_static_publication.sql migráció telepítve. Új privát publikációs állapotot, mentési RPC-ket és a services.editor_version technikai mezőt hozta létre. A szolgáltatások, site_settings, foglalások, tiltott időpontok, ügyfélprofilok, kuponok és elérhetőségi ablakok darabszáma és teljes üzleti tartalmuk ellenőrzőösszege a migráció előtt és után egyezett. A felhasználók száma is változatlan.

A CMS két beállításrekordja egy tranzakcióban mentődik; elavult szerkesztőváltozat 40001 ütközést ad. Az árlista mentése tranzakciós és sorverzióval védett. Valós adminjoggal, tranzakción belül kipróbáltuk a meglévő tartalom változatlan visszamentését; a verziók változatlanok maradtak, a tranzakció végén rollback történt. Nem hoztunk létre próbaadatot vagy próbafoglalást.

A publish-site-content és publish-live-site-content Edge Function aktív, JWT-védelemmel. A helyes TEST/LIVE webcímek, Deploy Hookok és engedélyezett eredetek szerveroldali Supabase Secretként beállítva. A service-role kulcs csak szerveroldalon szerepel. A meglévő hitelesítési, tulajdonosi és adminjogok megmaradtak. A private séma régi belső tábláihoz sem anon, sem authenticated sémahozzáférés vagy táblajog nincs; a hiányzó RLS-re adott általános tanácsadói jelzés önmagában nem bizonyít publikálást.

Az új végpontok külön nevet kaptak, ezért régi kód nem kezeli félre az új állapotlekérdezést. A 15 perces, környezetenkénti zárolás és a tartalom hash-e visszafogja a párhuzamos és változatlan buildindításokat. Külső HTTP-hívás pontosan egyszeri végrehajtása hálózati megszakadásnál nem garantálható.

## Naplók és ellenőrzés

A sikeres foglalás részletes konzolnaplói a helyi forrásból kikerültek; a hibajelzés és booking_events audit megmarad. Mindkét meglévő foglalási/e-mail Edge Function tényleges távoli forrását összevetettük: a kiadás a távoli változathoz képest csak a sikeres műveletek részletes konzolnaplóit törli. A send-booking-email helyi forrásának nagyobb formai diffje az éles, formázott forrás átvételéből ered; annak meglévő viselkedése megmarad. A platform naplókeletkezése, naplólekérdezése és adatforgalma külön kérdés. Platformnaplókat nem olvastunk, megőrzést és adatbázis/Realtimelog-beállítást nem kapcsoltunk ki látatlanban.

A helyi ellenőrzések: npm run check; nyolc architektúra/SQL/Edge teszt; két kész dist böngészős eset; tizenkét publikációs klienseset; hat célzott admineset; célzott vendégfiók-, navigációs és JavaScript nélküli tartalomellenőrzések; git diff --check. A böngészős tesztek helyi mockokkal futottak. A migráció fájlnevének távoli verzióhoz igazítása után a célzott SQL-teszt ismét sikeres.

Két korábbi, tágabb böngészős teszt elavult elvárás miatt hibázott: customer-account.spec.js:128 a baseline HTML-ben sem létező .hero-primary elemet keresi; studio-navigation.spec.js:127 a baseline sorrendtől eltérő sorrendet vár. Ezeket nem számoljuk sikeres tesztnek. Megjelenés és forrás-CSS nem változott.

A felhős TEST build sikeres és a tényleges deployment.json igazolja a commitot és a tartalom hash-ét. A végleges kiadási azonosítókat és az élesítés eredményét a helyi kiadási jegyzőkönyv rögzíti. A teljes, belépett admin böngészős mentés–új build–megjelenés kört meglévő tartalom átírása nélkül nem futtattuk végig; a mentési RPC-t a valódi adatbázisban változtatás nélkül ellenőriztük, a kliens és Edge folyamatot célzott helyi tesztek fedik.

## Pontos helyi fájlkör

Az alábbi lista a munkafában látható, ehhez a megvalósításhoz tartozó fájlokat tartalmazza. A `.gitignore` és `DEVELOPMENT.md` korábbi helyi változtatásai megmaradtak; az `AGENTS.md` korábbi útvonaljavítását és a már meglévő `.impeccable/mocks` tervfájlokat ez a feladat nem módosította. A `.github/workflows/pages.yml` törölt fájl, a bundle-ök és a HTML eszközverziói generált frissítések.

- `.github/workflows/pages.yml`
- `.gitignore`
- `404.html`
- `DEVELOPMENT.md`
- `account.js`
- `adatkezeles/index.html`
- `adatok.json`
- `admin-content.js`
- `admin-supabase.js`
- `admin/index.html`
- `arlista/index.html`
- `booking.js`
- `deployment.json`
- `docs/static-publication.md`
- `fiokom/index.html`
- `foglalas/index.html`
- `galeria/index.html`
- `gel-lakk-tatabanya/index.html`
- `index.html`
- `korom-diszites-nail-art-tatabanya/index.html`
- `manikur-tatabanya/index.html`
- `mukorom-epites-toltes/index.html`
- `package-lock.json`
- `package.json`
- `playwright.config.js`
- `script.js`
- `scripts/build-site.js`
- `scripts/check-site.js`
- `scripts/prerender-public.js`
- `scripts/public-files.js`
- `scripts/static-server.js`
- `src/account/00-customer-account.js`
- `src/admin/00-bootstrap-auth-calendar.js`
- `src/admin/02-request-cache.js`
- `src/admin/05-admin-workspace-v2.js`
- `src/admin/10-bookings-events.js`
- `src/admin/12-customer-profiles.js`
- `src/admin/18-public-html-refresh.js`
- `src/admin/20-services.js`
- `src/admin/30-coupons.js`
- `src/admin/40-availability-settings.js`
- `src/booking/02-request-safety.js`
- `src/booking/10-form-services.js`
- `src/public/00-bootstrap.js`
- `src/public/15-public-snapshot.js`
- `src/public/30-content-rendering.js`
- `src/public/40-footer-forms.js`
- `supabase-config.js`
- `supabase/functions/_shared/public-snapshot.mjs`
- `supabase/functions/_shared/publication-handler.mjs`
- `supabase/functions/create-booking-with-email/index.ts`
- `supabase/functions/publish-live-site-content/index.ts`
- `supabase/functions/publish-site-content/index.ts`
- `supabase/functions/send-booking-email/index.ts`
- `supabase/migrations/20261028160120_static_publication.sql`
- `tests/admin-production-redesign.spec.js`
- `tests/admin-public-html-refresh.spec.js`
- `tests/static-publication.spec.js`
- `tests/unit/publication-sql.test.mjs`
- `tests/unit/publication.test.mjs`
- `tests/unit/site-build.test.mjs`
- `wrangler.jsonc` (törölt Worker-konfiguráció)
