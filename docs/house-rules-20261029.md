# Házirend – helyi megvalósítás, 2026-10-29

## Eredmény

- A kapott kép szövege külön `/hazirend/` oldalon olvasható, a láblécből is elérhető. A kész HTML tartalmazza a teljes szöveget; a kiadási sitemap-generátor felveszi az új címet.
- A foglalási űrlapon külön, kezdetben üres, kötelező jelölőnégyzet szerepel. A „házirendet” link a teljes szöveget natív modális ablakban nyitja meg.
- Mindkét aktív online lemondási felület – vendégfiók és LUMI-azonosító + elérhetőség – külön elfogadást kér. Ezek felugró ablaka kizárólag a 24 órán belüli lemondásról / meg nem jelenésről szóló bekezdést tartalmazza.
- A megnyitás nem jelent elfogadást. A bezárás visszaadja a fókuszt a hivatkozásnak. Új lekérés és sikeres művelet után a megfelelő jelölőnégyzet alapállapotba kerül.
- A szöveg közös, verziózott forrása `supabase/functions/_shared/house-rules.json`. A build beépíti a publikus JS-be és HTML-be; a szerver ugyanazt a verziót ellenőrzi. Nincs új kérésenkénti tartalomlekérés.

## Szerveroldali rész és kiadási állapot

Az SQL és a két Edge Function módosítása **csak helyben van előkészítve**. Éles adatbázis-módosítás, függvénytelepítés, GitHub-push vagy Cloudflare-kiadás nem történt.

A helyi felület jelenleg a közös éles Supabase-konfigurációt használja, ezért valós tesztfoglalást / lemondást nem végeztünk. Az új RPC-ket az élesítéskor kell telepíteni; a helyi előnézet az új felület áttekintésére szolgál. Az elfogadás tartós rögzítését elkülönített, szintetikus helyi adatbázison ellenőriztük.

A `supabase-house-rules-consent.sql` az eredeti tranzakciós foglalási és lemondási függvényeket hívó burkolófüggvényeket hoz létre. Az elfogadás verziója, típusa, csatornája és szerveroldali időbélyege a meglévő `booking_events` auditban, a foglalási / lemondási művelettel egy tranzakcióban rögzül. Az ismételt kérés nem hoz létre dupla elfogadást. Hiba esetén a teljes tranzakció visszagördül. Meglévő sorokat nem ír át és nem tölti visszamenőleg elfogadottnak a régi foglalásokat.

A hitelesített fiókos tulajdonosi ellenőrzés, az azonosító + elérhetőség ellenőrzése, a régi LUMI-azonosítók, az idempotens foglalás, az időpontütközés-védelem és az e-mail-sor meglévő működését megőrzi. A régi fiókos lemondási RPC közvetlen authenticated-hívása az új elfogadás megkerülésének megakadályozására visszavonásra kerül. A frontend, SQL és Edge-kód egy kiadási egység; régi, nyitva hagyott kliensnek frissítenie kell az oldalt. Élesítéskor a szokásos, külön jóváhagyott kiadási folyamat szükséges.

A szövegben szereplő 50%-os feltétel megjelenik; automatikus díjterhelés vagy árkalkuláció-változás nem készült.

## Pontos fájlkör ebben a feladatban

Új alkalmazás- és kiadási források:

- `hazirend/index.html`
- `src/public/12-house-rules.js`
- `src/styles/13-house-rules.css`
- `scripts/house-rules.js`
- `supabase/functions/_shared/house-rules.json`
- `supabase/functions/_shared/house-rules-policy.mjs`
- `supabase-house-rules-consent.sql`

Módosított alkalmazásforrások:

- `src/booking/10-form-services.js`
- `src/account/00-customer-account.js`
- `booking-manage.js`
- `src/html/site-footer.html`
- `src/public/20-shell-coupons.js`
- `supabase/functions/create-booking-with-email/index.ts`
- `supabase/functions/manage-booking/index.ts`

Módosított build- és ellenőrzőforrások:

- `scripts/build-assets.js`
- `scripts/prerender-public.js`
- `scripts/public-files.js`
- `scripts/public-css-architecture.js`
- `scripts/update-asset-versions.js`
- `scripts/check-site.js`

Generált közös csomagok: `style.css`, `script.js`, `booking.js`, `account.js`.

Frissített statikus assethivatkozások: `index.html`, `404.html`, `admin/index.html`, `arlista/index.html`, `adatkezeles/index.html`, `fiokom/index.html`, `foglalas/index.html`, `galeria/index.html`, `gel-lakk-tatabanya/index.html`, `korom-diszites-nail-art-tatabanya/index.html`, `manikur-tatabanya/index.html`, `mukorom-epites-toltes/index.html`. A `foglalas/index.html` emellett az előrenderelt jelölőnégyzetet is tartalmazza. Az új Házirend oldal előrenderelt szövege a közös forrásból készült.

Tesztforrások: új `tests/house-rules.spec.js`, `tests/unit/house-rules-sql.test.mjs`, `tests/unit/house-rules-edge.test.mjs`; módosított `tests/customer-account.spec.js`.

Ez a jelentés: `docs/house-rules-20261029.md`. Helyi, ignorált ellenőrzőanyagok: `local-backups/playwright.house-rules.config.js`, `local-backups/house-rules-prerender/`, `local-backups/house-rules-server-baseline-20261029.json`, `.impeccable/review/house-rules-*.png`.

A korábbi adminos módosítások és az `AGENTS.md` ebben a feladatban nem változtak.

## Elvégzett ellenőrzések

- Git-állapot és érintett források áttekintése, végső diff és `git diff --check`.
- `npm run build`, `npm run build:check`.
- `npm run lint:css`, `npm run public:css:check` – sikeres.
- `node scripts/check-site.js` – sikeres: 12 oldal, 8 script, 36 foglalási elem.
- Offline előrenderelés a helyi nyilvános `adatok.json` alapján külön ignorált mappába. A kész HTML teljes szabályszövegét, canonical címét, sitemap-bejegyzését és a jelölőnégyzet kötelező / kezdetben üres állapotát ellenőriztük.
- 4 célzott WebKit böngészőteszt – sikeres: önálló oldal 320 és 1280 px-en, foglalási elfogadás és modal, azonosítós lemondás, 24 órán belüli fiókos lemondás. Külső kérések helyettesítve / tiltva; kizárólag szintetikus foglalási adatok.
- 4 helyi szerverteszt – sikeres: valódi Edge-handlerek szintetikus Supabase-határral; SQL PGlite-ban, az eredeti lemondási függvényekkel. Hiányzó / hamis / elavult elfogadás elutasítása, hitelesített e-mail-azonosság, jogosultságok, tulajdonosi ellenőrzés, indoklási szabály, régi azonosító, tartós verzió, ismétlés, audit-hibás visszagörgetés és e-mail-sor ellenőrizve.
- Mobilos képernyőképek szemrevételezése; a 320 px-es oldal nem lóg túl. A modal szövege mobilon görgethető; Escape, bezárás és fókusz-visszaadás működik.
- Helyi előnézeti szerverek újraindítva a friss útvonallistával. `http://192.168.0.244:8103/hazirend/` és `/foglalas/` HTTP 200.

Az első böngészőindítás a nem telepített Edge miatt nem futott; a telepített WebKittel végeztük el a célzott ellenőrzést. A tesztek során talált helyi útvonal-cache és teszthelyettesítési problémákat javítottuk. Éles ügyféladatot vagy foglalást nem módosítottunk.
