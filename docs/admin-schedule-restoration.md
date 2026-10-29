# Belépés és az eredeti LumiNails-beosztás – 2026-10-29

A felhasználó pontosítása szerint a beosztás működésének az eredeti LumiNails a mércéje, a megjelenés a mostani adminrendszeré. A korábbi heti sorlista és időszak/hétköznap alapú tömeges szerkesztő helyére havi naptár került.

Az eredeti logika forrásai: src/admin/00-bootstrap-auth-calendar.js (idosavNaptarRenderelese, naptarKozosIdoAlkalmazasa, naptarKijeloltNapokMentese), src/admin/40-availability-settings.js és az admin/index.html eredeti dátumos mezői. Ezekből sem adat, sem környezeti beállítás nem változott.

A havi naptárban egymástól független napok jelölhetők ki, hónapokon át. A közös kezdés/vég csak a kijelöltekre alkalmazható; a kijelölt napok külön időt is kaphatnak. A meglévő dátumok/idősávok külön listában szerkeszthetők. A közös lépés a kijelölésekre vonatkozik; a Lépés minden napra művelet a meglévő sorokat is módosításra jelöli. A felső Mentés menti a piszkozatot, a törlés is ekkor végleges. A foglalások nem kerülnek átírásra.

Az eredeti work_date/start_time/end_time azonosság alapján ugyanaz a sáv nem kap új rekordot. A kijelölt új sáv azonosítója a mentési próbálkozások között stabil. A törlésre jelölt, majd azonos idővel újra kiválasztott régi sáv saját azonosítója megmarad. Az összes végidő és lépésköz ellenőrzése az írások előtt történik a meglévő adatkezelőben.

A belépő ResizeObserver-rel figyeli a rendelkezésre álló helyet és a tartalom méretét. Ha a tartalom elfér, overflow-y:hidden érvényes: nincs üres görgetés vagy erre támaszkodó iOS-rugózás. Valódi túlcsorduláskor – kis magasság, billentyűzet vagy hosszabb hiba – engedélyezett a görgetés. A PWA böngészőzoomjának tilalma változatlan.

Hat célzott eset sikeres, több szűk futásban: belépő normál/kis magasság; meglévő dátum idő- és lépésmegőrzése; több kijelölt nap és közös idő; törölt sáv visszaállítása duplikáció nélkül és érvénytelen idő írás előtti elutasítása; mobil/asztali reprezentatív felület; statikus admin asset-hivatkozások. A korábbi 33/33 eredmény a megelőző állapot bizonyítéka, nem a mostani módosítások teljes regressziós minősítése.

Vizuális ellenőrzés: havi beosztás 320 és 1440px, belépő 390×844px; kisebb magasságban a Belépés gomb elérhetősége. Build-ellenőrzés és Git diffellenőrzés sikeres. WebKit-emuláció, szintetikus adatok, blokkolt valódi Supabase HTTP. Valódi iPhone-teszt és éles adatírás nem történt.

## Érintett fájlok

- src/admin-reference/schedule-panel.tsx – új, havi naptár és dátumos piszkozat
- src/admin-reference/panels.tsx – korábbi heti beosztás eltávolítása, új panel bekötése
- src/admin-reference/studio.tsx – kijelölt dátumok összeállítása a meglévő mentés előtt
- src/admin-reference/login.tsx – feltételes görgetés
- admin-reference.js és admin-reference.css – forrásból újraépítve
- admin/index.html – adminasset-hivatkozások
- tests/admin-reference.spec.js – a módosult beosztási folyamat célzott esetei
- tests/admin-mobile-fixes.spec.js – belépési görgetés, azonos sáv megőrzése, hibás idő
- docs/admin-schedule-restoration.md – ez a leírás
- docs/admin-studio-direction.md, docs/admin-studio-local.md – feladathatár és aktuális működés
- docs/admin-reference-files.md – teljes fájllista

Csak helyi TEST-változás. Éles projekt, nyilvános oldal, valódi foglalás, tartalom és távoli adatbázis nem változott. Nincs commit, push vagy telepítés.
