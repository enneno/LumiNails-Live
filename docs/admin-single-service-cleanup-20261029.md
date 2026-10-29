# LumiNails admin: a pilla/lézer referenciaágak eltávolítása

2026-10-29. Helyi kódtakarítás; kiadás, GitHub-push és közös Supabase-módosítás nem történt. A korábbi helyi változtatásokat megőriztük.

## Eltávolított kód

- Két naptár választása, a hozzá tartozó inaktív referencia-szerkesztő és üres callbackjei.
- „Első pilla”, pillás előzmény és az előző pillás foglalás óta eltelt napok számítása.
- Szakágankénti naptárjelölés, fél szélességű szakágblokkok, vegyes pilla/lézer ág és szakágak közti ütközésszűrés. Az egyetlen naptárban minden aktív foglalás és kieső idő figyelembe veendő.
- A foglalások, galéria és árlista átmeneti nézetmodelljének szakágmezői. A szolgáltatások és képek eredeti, tárolt azonosítói megmaradnak; a saját mentési adapter továbbra is az eredeti adatokat küldi.
- A galéria második szakágra épülő csoportosítása és kategóriaváltója; az árlista ilyen szűrése, a referenciaprojekt pillás S/M-időtartam-bővítése és nem használt katalóguskonverterei. A LumiNails saját, tényleges szolgáltatásméretei és időtartamai megmaradnak.
- A nem használt két naptáras `list-order.ts` segédmodul.
- `lashes`, `laser`, `mixed` szakágazonosítók és régi szakágszínek. A meglévő körmös szín értékei változatlanul az egyértelmű `admin-service` token alá kerültek.

Több mint 600 nettó forrássor került ki. A hiányzó referenciatípusok helyére a tényleges LumiNails-adatoknak megfelelő, szakágmező nélküli árlista-, galéria- és naptártípusok kerültek. Az egyéb általános adminműködés nem volt e takarítás tárgya.

## Ellenőrzés és korlátok

- `npm run build`: sikeres, a csomagok forrásból újragenerálva, az admin assetverziók frissítve.
- `npm run lint:css`: sikeres. A forrás-CSS-ben kizárólag a szakágszínek egyszerűsítése történt, felülírás és `!important` nélkül.
- 14 célzott WebKit-eset sikeres: mobilos naptárnagyítás és változatlan standalone zoomtilalom; forrás- és assetnyilvántartás; a régi szakágkódot tiltó ellenőrzés; foglalási kártyák, lapozás és swipe; állapot- és fizetésmentés, hibás mentés utáni piszkozat; kézi időpont automatikus időtartammal; árlista láthatóság, egység és mentési ütközés; saját beosztás mentése; galéria feltöltés/kijelölés/törlés; egyetlen foglalás átütemezése másik piszkozatának megtartásával; áttekintés statisztikái.
- Két célzott unit eset sikeres az igazi naptári ütközésfeloldó függvényekkel: foglalás mozgatása és kieső idő mozgatása tiszteletben tartja az aktív foglalásokat, más blokkokat, a dátumot és a saját rekordazonosságot. A teszt CSS/React-környezetét helyettesítjük; a függvények a produkciós forrásból származnak.
- Mobilos kártya és asztali áttekintés képernyőképe vizuálisan átnézve. A böngészős ellenőrzések emulált méretekkel és szintetikus adatokkal történtek, nem valódi telefonon vagy éles foglalások mentésével.
- `git diff --check`: sikeres. A kért szövegek és szakágazonosítók nem találhatók az admin TS/TSX/CSS forrásában, illetve a saját adatadapterben. Ezt külön forrásszerződés-teszt is ellenőrzi. A referenciakomponensek eredete és az eredeti kártyahash megmaradt a nyilvántartásban; a szándékosan adaptált fájlok nem szerepelnek változatlan másolatként.
- Mobilos helyi előnézet: <http://192.168.0.244:8103/admin/?tab=bookings>. Az aktuális Wi-Fi-cím ellenőrizve; HTTP 200 és mindhárom friss admincsomag hivatkozása igazolva. Asztali cím: <http://127.0.0.1:8101/admin/>.

## Ebben a körben módosított fájlok

- `D:/Asztal/LumiNails_test/src/admin-reference/components/admin-bookings-tab.tsx`
- `D:/Asztal/LumiNails_test/src/admin-reference/components/admin-overview.tsx`
- `D:/Asztal/LumiNails_test/src/admin-reference/components/admin-manual-booking-sheet.tsx`
- `D:/Asztal/LumiNails_test/src/admin-reference/components/admin-week-calendar.tsx`
- `D:/Asztal/LumiNails_test/src/admin-reference/components/admin-week-calendar-mobile.tsx`
- `D:/Asztal/LumiNails_test/src/admin-reference/components/admin-prices-tab.tsx`
- `D:/Asztal/LumiNails_test/src/admin-reference/components/admin-gallery-tab.tsx`
- `D:/Asztal/LumiNails_test/src/admin-reference/lib/admin-bookings.ts`
- `D:/Asztal/LumiNails_test/src/admin-reference/lib/gallery.ts`
- `D:/Asztal/LumiNails_test/src/admin-reference/lib/service-catalog.ts`
- `D:/Asztal/LumiNails_test/src/admin-reference/data/site-content.ts`
- `D:/Asztal/LumiNails_test/src/admin-reference/model.ts`
- `D:/Asztal/LumiNails_test/src/admin-reference/panels.tsx`
- `D:/Asztal/LumiNails_test/src/admin-reference/studio.tsx`
- `D:/Asztal/LumiNails_test/src/admin-reference/styles.css`
- `D:/Asztal/LumiNails_test/src/admin-reference/reference-source.json`
- `D:/Asztal/LumiNails_test/src/admin/35-reference-backend.js`
- `D:/Asztal/LumiNails_test/tests/admin-reference-contract.spec.js`
- `D:/Asztal/LumiNails_test/admin-reference.js` (generált)
- `D:/Asztal/LumiNails_test/admin-reference.css` (generált)
- `D:/Asztal/LumiNails_test/admin-supabase.js` (generált)
- `D:/Asztal/LumiNails_test/admin/index.html` (assetverziók)
- `D:/Asztal/LumiNails_test/docs/admin-single-service-audit-20261029.md` (korábbi audit lezárva)

Új fájlok:

- `D:/Asztal/LumiNails_test/src/admin-reference/lib/scheduling.ts`
- `D:/Asztal/LumiNails_test/tests/unit/admin-single-service-calendar.test.mjs`
- `D:/Asztal/LumiNails_test/docs/admin-single-service-cleanup-20261029.md` (ez a jelentés)

Törölt fájl:

- `D:/Asztal/LumiNails_test/src/admin-reference/lib/list-order.ts`

A helyi összevetési másolat és takarítási segédprogramok az ignorált `local-backups/` mappában vannak. Nem kerültek alkalmazáskódba, nem tartalmaznak éles üzleti adatmásolatot.
