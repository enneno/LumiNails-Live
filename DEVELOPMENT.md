# Helyi fejlesztés

## Fejlesztési forrás és éles példány

A projekt elsődleges fejlesztési példánya: `C:\Users\llevi\OneDrive\Asztali gép\LumiNails_test`.
Minden fejlesztést és hibajavítást ebben a mappában kell elvégezni, ellenőrizni és a tesztoldalra feltölteni.

Az éles `luminails.hu` GitHub-tároló az `enneno/LumiNails-Live`. Ebben normál fejlesztést nem végzünk; az éles tartalmat az ellenőrzött promóciós folyamat frissíti. Ha az éles tároló helyi példányára szükség van, az útvonalát minden művelet előtt külön ellenőrizni kell.

## Tesztelés és élesítés

1. A módosítás a `LumiNails_test` mappában készül el.
2. A módosítást helyileg, az `AGENTS.md` kockázatalapú szabályai szerint kell ellenőrizni. Kis vizuális változásnál nem kell teljes tesztcsomag.
3. Az `enneno/LumiNails-Live` `main` ágára kerülő, helyileg ellenőrzött commit automatikusan a `luminails.hu` oldalra települ, GitHubon futó alkalmazásteszt nélkül.
4. A tesztoldalon manuálisan csak a változás által érintett fontos működéseket és nézeteket kell ellenőrizni.
5. Élesítéshez az `enneno/LumiNails-Live` tárolóban kézzel kell elindítani a `Promote tested site to luminails.hu` workflow-t, megadni az ellenőrzött TEST commitot vagy ágat, majd beírni az `ELESITES` megerősítést.
6. A workflow ellenőrzi, hogy a kiválasztott TEST commit sikeresen kikerült-e a tesztoldalra, megőrzi az éles `CNAME` és `.github` fájlokat, majd ugyanazt az ellenőrzött tartalmat új GitHub-teszt futtatása nélkül menti és telepíti a `luminails.hu` oldalra.

Normál fejlesztés közben semmi nem kerül automatikusan az éles oldalra. Visszaállításhoz az utolsó promóciós commit visszavonható, majd a `Redeploy current luminails.hu site` workflow kézzel, `UJRATELEPITES` megerősítéssel újraindítható. Az újratelepítés a már helyileg ellenőrzött éles commitot teszi közzé, ezért nem futtat új tesztet.

## Szerkeszthető források

A böngésző által betöltött nagy fájlok automatikusan épülnek:

- `src/styles/` → `style.css`
- `src/public/` → `script.js`
- `src/booking/` → `booking.js`
- `src/admin/` → `admin-supabase.js`

A gyökérben lévő négy generált fájlt ne szerkeszd közvetlenül. A kisebb forrásrészt módosítsd, majd futtasd az építést.

Az önálló `admin-content.js`, `supabase-config.js` és a HTML-fájlok továbbra is közvetlenül szerkeszthetők.

## Parancsok

- `npm run build` – összeállítja a böngészőnek szánt CSS/JS fájlokat.
- `npm run prerender` – lekéri a nyilvános Supabase-tartalmat, majd valódi HTML-be írja a fejlécet, láblécet, képeket, galériát, szolgáltatásoldalakat és az aktuális árlistát. Hibás adatlekérésnél nem ír felül oldalt.
- `npm run assets:version` – a fájlok tartalmából frissíti a cache-verziókat a HTML-ben.
- `npm run lint:css` – gyors, helyi Stylelint-ellenőrzés a forrás-CSS fájlokra; CSS-módosítás után futtatandó.
- `npm run check` – statikus ellenőrzések, szintaxis, hivatkozások, Supabase-kliens, CSS-szabályok és forrás/bundle egyezés.
- `npm test` – a Playwright böngészős tesztcsomag; csak az `AGENTS.md` szerint indokolt esetben futtatandó teljes egészében.
- `npm run test:visual` – az öt kritikus TEST-nézet célzott Playwright-képernyőképeit készíti el a `test-results/` alatt: kezdőlap asztali és mobil, foglalás mobil, admin asztali és mobil. Csak az érintett kritikus felület változásakor futtatandó; az eredményt vizuálisan is át kell nézni.
- `npm run test:a11y` – a kezdőlap, a mobil foglalás és a mobil admin axe accessibility-ratchet ellenőrzése. A dokumentált jelenlegi eltérések számát nem engedi növelni, az új szabálysértés-típusokat pedig elutasítja.
- `npm run audit:lighthouse` – helyben elindítja a TEST szervert, majd Lighthouse HTML- és JSON-jelentést készít a kezdőlapról a `test-results/` mappába. Igény szerinti audit, nem általános commit-előfeltétel.
- `npm run verify` – a teljes helyi kiadási ellenőrzés; csak nagy kockázatú, több fontos folyamatot érintő változásnál vagy kifejezett kérésre futtatandó.
- `npm run serve` – helyi szerver a 8101-es porton.

Commit vagy push előtt a módosítás kockázatához illeszkedő legkisebb elegendő helyi ellenőrzést kell sikeresen elvégezni. A teljes `verify` nem általános előfeltétel.

## Keresőbarát HTML és admin tartalomfrissítés

A publikus oldal alapja előrenderelt HTML. A böngészőben futó JavaScript ezt az aktuális Supabase-adatokkal újraellenőrzi és szükség esetén frissíti, de a fő tartalom, a szolgáltatásoldalak, a galéria, az árlista és a belső navigáció JavaScript nélkül is olvasható.

A tartalom- vagy árlistamentés után az admin a `request-live-site-rebuild` Supabase Edge Functionön keresztül `live-site-content-updated` eseményt küldhet a LIVE GitHub-tárolónak. Ettől függetlenül a deploy workflow 30 percenként összehasonlítja a nyilvános tartalom ujjlenyomatát, és csak változás esetén ad ki új oldalt. Így az adminból mentett adat legkésőbb a következő kiadási körben bekerül a HTML-be akkor is, ha a gyors értesítő Edge Function még nincs beállítva. A workflow nem futtat tesztet. Ha az előrenderelés adatlekérése hibázik, a workflow leáll, és a korábbi működő oldal marad kint.

Az automatikus indításhoz egyszer kell:

1. a `request-live-site-rebuild` Edge Functiont telepíteni;
2. a Supabase Function Secretjei közé felvenni a csak az `enneno/LumiNails-Live` tárolóra, `Contents: Read and write` jogosultságra korlátozott `GITHUB_LIVE_DISPATCH_TOKEN` értéket;
3. az admin azonosításához az `ADMIN_EMAIL` vagy a már használt `OWNER_EMAIL` secretet használni. A LIVE célrepo és az eseménytípus a funkcióban rögzített, így a TEST tároló nem érintett.

A GitHub token kizárólag szerveroldali secret lehet; HTML-be, JavaScriptbe vagy naplóba nem kerülhet.

A vizuális alapelvek és a CSS-felelősségek rövid forrása a `docs/design-system.md`. A bizonyított hibák, következetlenségek és külön jóváhagyást igénylő ötletek a `docs/visual-audit.md` fájlban vannak. Az új UI-munka előtt mindkettőt át kell nézni.

## Biztonság

A böngészőben csak a Supabase nyilvános publishable kulcsa szerepelhet. Service role kulcsot, e-mail szolgáltatói kulcsot és más titkot kizárólag Supabase Secretként szabad tárolni.
## Foglalási megbízhatósági frissítés telepítése

1. Futtasd a Supabase SQL Editorban a `supabase-booking-reliability.sql` fájlt.
2. Telepítsd újra ezeket az Edge Functionöket:
   - `create-booking-with-email`
   - `upload-booking-inspirations`
   - `send-booking-email`
   - `send-booking-update-email`
   - `process-booking-notifications`
3. A már beállított `process-booking-notifications` cron ezután az új foglalási és admin módosítási e-mailek tartós újrapróbálását is elvégzi.

A vendég továbbra is regisztráció nélkül tölthet fel inspirációs képet. A böngésző azonban nem kap közvetlen Storage-írási jogot: az Edge Function ellenőrzi a foglaláshoz tartozó egyszer használatos műveleti kulcsot, majd a képet privát bucketbe menti.

## Kuponkedvezmény számítási alapjának telepítése

A kuponoknál beállítható teljes ár / alapszolgáltatás / díszítések számítási alaphoz futtasd a `supabase-coupon-discount-basis.sql` fájlt a `supabase-coupons.sql`, `supabase-booking-style-duration.sql` és `supabase-decoration-coupon.sql` után. A migráció a meglévő díszítéskuponok jelentését megőrzi, korábbi foglalást nem ír át.

Az 1–2. külön auditpont (admin jogosultsági modell és a rövid önkiszolgáló kód próbálkozáskorlátozása) szándékosan nincs ebben a migrációban.
