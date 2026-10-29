# Adminértesítések és Logs – helyi átadás, 2026-10-29

## Állapot

A felület és a szerveroldali kiadási SQL elkészült a TEST projektben. Az éles helyi projekt, a Cloudflare-kiadás és a közös Supabase-adatbázis nem változott. Valós foglalást, tartalmat, profilt, levelet vagy jogosultságot a fejlesztési ellenőrzések nem módosítottak.

Az új Logs táblák a közös adatbázisban még nincsenek létrehozva. Addig a valós adatokat használó helyi Logs lap elérhetetlenségi jelzést mutat; nem állítja, hogy nincs hiba. Az újrapróbálások éles rendje is a korábbi marad az SQL külön jóváhagyott kiadásáig. Az AGENTS.md szerint TEST-fejlesztési kérés nem jogosít éles adatbázis- vagy konfigurációváltoztatásra.

## Működés

- Csengő: új online foglalás, vendéglemondás, vendégtől származó módosítási esemény és nyitott regisztráció. E-mail-, push-, adminmódosítási, nyugtázási és olvasottsági naplóbejegyzés nem jelenik meg benne.
- A megnyitott jelzés olvasottsága mentődik; a Mind olvasott az aktuálisan ismert jelzéseket jelöli olvasottnak, adminonként tartósan. Hiba esetén nem tűnik el az olvasatlanság.
- Vendéglemondás: a kártya külön Nyugtázom gombja továbbra is lezárja a teendőt és visszasorolja a kártyát. Az értesítés olvasása ettől külön művelet.
- Új foglalás jóváhagyása nem hoz létre második olvasatlan foglalási jelzést. A vendégmódosítási események azonosítása nem hoz létre új publikus időpont-módosítási funkciót.
- A regisztráció nyitott; a profil első létrejöttéről csak tájékoztató jelzés készül. Nincs adminjóváhagyás, új fiókállapot vagy azonosítási módosítás. Személyes profiladat nem másolódik ebbe az új naplóbejegyzésbe.
- Kommunikáció helyett Logs: a Szalon referencia `AdminLogsTab` kódjának felülete, LumiNails-adatkapcsolattal és LAN-on is működő másolással. Csak tartós hibák; a rendeződő hibajelzés eltűnik. A piros pont külön jelöli az új naplóhibát a Logs/Továbbiak menünél.
- A teljes hibalista csak a Logs megnyitásakor töltődik be, a menüjelzés kis metaadat-lekérésből készül. Nincs új böngészős polling. A csengő célzott, legfeljebb 50 vendégeseményt kér, e-mail-előzmények és azok metaadatai nélkül.

## Előkészített szerveroldali SQL

A `supabase-admin-error-logs.sql` helyi, egy tranzakcióban alkalmazható kiadási forrás; még nem volt alkalmazva a kapcsolt adatbázison.

- Foglalási/változtatási e-mail, emlékeztető, értékeléskérő e-mail és havi riport: legfeljebb nyolc próbálkozás, sikertelenség után kétperces késleltetés. Az esedékes sikertelen küldéshez átmeneti újrapróbáló job készül, amely a végén vagy a küldés megszűnésekor eltűnik.
- Normál foglalási e-mailhez azonnali ébresztés; óránkénti helyreállító futás. Az óránkénti meglévő worker továbbra is a saját többi, például megőrzési feladatát is végzi.
- Az aktuális LumiNails Cron-parancs és szerveroldali konfiguráció helyben, az adatbázison belül marad; a forrás nem tartalmaz vagy exportál titkot. A távoli ellenőrzés csak a kompatibilitás logikai értékét kérte le.
- Nyolc sikertelen kézbesítési próbálkozás vagy legalább egyórás elakadás/tartós Cron-hiba után jelenik meg adminhiba. Az összegző óránként fut, a hibalista legfeljebb hét napot őriz. A sikeres helyreállás eltávolítja az adott hibajelzést.
- A külön, adminvédett hibatáblába nem kerül ügyfélrekord, levéltörzs, nyers szolgáltatói válasz vagy hitelesítő adat. A részletek biztonságos hibaosztályt és próbálkozásszámot tartalmaznak. A meglévő foglalási audit nem törlődik.
- Az olvasási kurzor adminonként saját, csak admin RPC-vel növelhető. A küldési claim/finish műveletek service-role jogosultságúak maradnak. Új böngészős admin- vagy service-role kulcs nincs.
- A foglalások meglévő adatai, időpontjai, küldési előzményei és próbálkozásszámai nem nullázódnak. A meglévő foglalási és értékeléskérési jogosultságok/időzítési feltételek megmaradnak. Az értékeléskérő claim sorzárat is használ.

A külön Web Push továbbítás és a Supabase Auth saját rendszerlevelei nincsenek átépítve ezzel az SQL-lel; ezeknek itt eltérő a továbbítási rendszere. A referencia oktatási, körlevél- és fiókjóváhagyási sorai nem kerültek át.

A Supabase CLI letöltését és futtatását az automatikus jóváhagyásellenőrző külső kód végrehajtására hivatkozva elutasította. Nem történt telepítés. A helyi SQL-forrás elkészítése és a PGlite-ellenőrzés a projekt meglévő eszközeivel megtörtént; számozott CLI-migráció nem készült.

## Ellenőrzések

- 11 célzott WebKit működési eset: szűrés, nyugtázás, Mind olvasott, egyedi olvasás, regisztráció, mentési hiba, újratöltés, jóváhagyás utáni duplikáció, üres panel, Logs/másolás/olvasási kurzor/helyreállás, lazy betöltés és a kapcsolódó navigáció.
- 3 forrás- és asset-szerződés: referenciakód-hash, egyetlen adminstílus, friss asset-verziók, saját adatírási réteg és változatlan PWA-nagyítási szabály.
- 3 PGlite SQL-teszt: tényleges helyi táblák, függvények, triggerek és RLS; kétperces várakozás, nyolc próbálkozásos határ, sorfoglalás, siker utáni tisztulás, szolgáltatói részletek védelme, adminonkénti monoton olvasási kurzor, Cron-küszöb, megőrzés és nyitott regisztráció. A hálózati diszpécser és a Cron ütemező helyi teszthelyettesítő; nem ment ki e-mail vagy HTTP-kérés.
- `npm run build`, `npm run build:check`, `npm run lint:css`, `node --check admin-supabase.js`, `git diff --check`.
- Vizuális ellenőrzés: 320, 768 és 1440 px, vízszintes túlcsordulás nélkül. Ez WebKit-szélességemuláció, nem fizikai telefonos tanúsítás.
- A teljes publikus oldalt és a teljes tesztcsomagot nem futtattuk; nem érintették a változások. Nem történt push vagy GitHub-teszt.

QA-képek: `.impeccable/review/logs-source-320.png`, `logs-source-768.png`, `logs-source-1440.png`, valamint az értesítési teszt `notifications-read-320.png` fájlja ugyanott. Ezek generált, figyelmen kívül hagyott helyi ellenőrzési anyagok.

## Pontos változási fájllista

Az útvonalak a `D:\Asztal\LumiNails_test` gyökérhez képest értendők. Az előző helyi értesítési javítás még nem commitolt fájljait is tartalmazzák; a régi `.impeccable/mocks` állományokhoz nem nyúltunk.

1. `src/admin-reference/lib/admin-notifications.ts` – vendégesemények, stabil azonosítók, olvasottság, duplikációvédelem.
2. `src/admin-reference/extensions.tsx` – csengőpanel és olvasási műveletek.
3. `src/admin-reference/studio.tsx` – Logs menü, külön hibajelzés, regisztrációs célpont és lusta betöltés.
4. `src/admin-reference/panels.tsx` – a régi Kommunikáció panel helyett az új Logs bekötése.
5. `src/admin-reference/components/admin-logs-tab.tsx` – átvett és adatkapcsolatában adaptált referenciafelület.
6. `src/admin-reference/logs-panel.tsx` – saját adatadapter a referenciafelülethez.
7. `src/admin-reference/lib/admin-error-logs.ts` – LumiNails hibatípusok és másolható jelentés.
8. `src/admin-reference/reference-source.json` – az átvett új komponens forráslenyomata.
9. `src/admin/10-bookings-events.js` – a vendéglemondási csatorna megőrzése.
10. `src/admin/35-reference-backend.js` – célzott értesítési/naplólekérés, saját olvasottság és friss nyugtázási visszaolvasás.
11. `supabase-admin-error-logs.sql` – a helyi, még nem alkalmazott szerveroldali kiadási forrás.
12. `tests/admin-reference.spec.js` – célzott értesítési és Logs folyamatellenőrzések.
13. `tests/helpers/admin-reference-boundary.js` – sorrendet, olvasási kurzort és hibákat kezelő szintetikus Supabase-határ.
14. `tests/unit/admin-error-logs-sql.test.mjs` – valódi helyi PostgreSQL/PGlite ellenőrzések.
15. `admin-supabase.js` – forrásból újraépített adatadapter.
16. `admin-reference.js` – forrásból újraépített React-felület.
17. `admin-reference.css` – forrásból újraépített adminstílus.
18. `admin/index.html` – az érintett három asset új tartalmi verziója.
19. `docs/admin-notifications-logs-20261029.md` – ez az átadási jegyzék.
