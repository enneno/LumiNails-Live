# Naptár és szerkesztőpanel – helyi TEST

2026-10-29. A felhasználó elfogadta a naptárközpontú kialakítást. Az eredeti LumiNails dátumos mentési logikájára a jelenlegi admin közös vezérlői és AdminEditorSheet komponense kerültek.

- Egy nap megnyitja a napi idősávokat. A meglévő sáv szerkeszthető, áthelyezhető más dátumra, törlésre jelölhető; új sáv előkészíthető.
- A Több nap kijelölése külön mód. A kijelöltek közös paneljében kezdés/vég és időpontlépés adható meg; a naponkénti eltérések kinyithatók.
- A Beállított idősávok külön listanézetet nyit. Innen nyitható egy nap szerkesztése; itt érhető el a lépés alkalmazása minden napra és az összes nap törlésre jelölése.
- A panel Mentés gombja a meglévő saveAll folyamatot hívja, ugyanúgy, mint a felső Mentés. E folyamat siker/hiba visszatérést kapott; hiba esetén a panel és a piszkozat nyitva marad. Bezárás nem véglegesít adatot.

A scheduleRowsForSave összeállítás, a dátum/kezdés/vég azonosság, a stabil rekordazonosítók, a duplikációvédelem és a meglévő saveWindows adatkezelő változatlanok. Más napok idősávjai és foglalásai nem törlődnek. Nincs új háttérszolgáltatás, séma vagy adatbázismigráció. A PWA böngészőzoomja változatlan.

## Ellenőrzés

Öt külön célzott eset sikeres több szűk futásban:

1. Meglévő dátumos sáv dátumának és végidejének módosítása azonos rekordazonosítóval és megtartott időpontlépéssel.
2. Több nap kijelölése, közös idő, panelből mentés, majd lépés minden napra; foglalások és más sávok megőrzése.
3. Törlésre jelölt eredeti sáv visszaállítása új duplikált rekord nélkül; hibás végidő elutasítása adatírás előtt, nyitva maradó panellel.
4. A főnézet nem tartalmazza a hosszú űrlapot. Panelgeometria és túlcsordulás 320/768/1440px-en; puszta megnyitás/bezárás nem módosít adatot.
5. Adminasset-hivatkozások és egyetlen aktív adminstílus.

A build:check és git diff --check sikeres. Vizuálisan megnyitott képek: .impeccable/review/schedule-calendar-320.png, schedule-sheet-320.png és schedule-sheet-1440.png. WebKit-emuláció, szintetikus Supabase-határ, blokkolt valódi Supabase HTTP. Valódi telefonos hardverteszt és teljes weboldalteszt nem történt. Forrás-CSS nem változott; a generált admin-CSS a TSX-osztályokból újraépült.

## Pontos fájlkör

- src/admin-reference/schedule-panel.tsx
- src/admin-reference/studio.tsx
- admin-reference.js – generált
- admin-reference.css – generált
- admin/index.html – adminasset-hivatkozások
- tests/admin-reference.spec.js
- tests/admin-mobile-fixes.spec.js
- docs/admin-schedule-panels.md – új
- docs/admin-studio-direction.md
- docs/admin-studio-local.md
- DESIGN.md
- .impeccable/design.json
- docs/admin-reference-files.md

Az éles projekt, a luminails.hu és a valódi adatok nem változtak. Nem történt commit, push, migráció vagy kiadás. A teljes helyi változásjegyzék: [admin-reference-files.md](admin-reference-files.md).
