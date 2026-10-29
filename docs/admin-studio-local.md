# LumiNails admin – forrásalapú helyi átvétel

A TEST admin a D:/Asztal/Szalon/Szalon-teszt tényleges React-komponenseire és CSS-moduljaira épül. Ez a 2026-10-29-i állapot felváltja a korábbi natív DOM-os közelítés dokumentációját. A felhasználó a teljes meglévő admin alkalmazható megjelenését és működését kérte; a referencia kódja az irányadó.

## Forrás és felépítés

- Aktív felület: [src/admin-reference](../src/admin-reference/). A [forrásmanifest](../src/admin-reference/reference-source.json) 46 referenciapárt rögzít: 36 bájtpontosan átvett és 10 illesztett fájlt. A foglaláskártya JSX-e változatlan.
- A globális admin-téma és méretmód tulajdonosa a [styles.css](../src/admin-reference/styles.css); a shell, navigáció, lapozók és foglaláskártyák stílusgazdája az [admin-studio.module.css](../src/admin-reference/components/admin-studio.module.css). A menük, panelek, visszajelzések és viewport saját átvett modulokat használnak.
- React 19, esbuild és Tailwind 4 készít statikus böngészős csomagot. Next.js-szerver nincs. A generált admin-reference.js és az egyetlen aktív admin-stíluscsomag, az admin-reference.css forrásból épül; közvetlen javításuk nem irányadó.
- A [saját LumiNails-adapter](../src/admin/35-reference-backend.js) a meglévő adatkezelőket köti az új komponensekhez. Az admin-v2.css és a korábbi natív UI-források megmaradtak, de az új admin megjelenítésében inaktívak.
- Irány és feladathatár: [admin-studio-direction.md](admin-studio-direction.md). Az aktuális fájlonkénti változásjegyzék: [admin-reference-files.md](admin-reference-files.md); ez helyettesíti a korábbi, elavult fájlszámot és táblázatot.

## Megjelenés és működés

A forrás Manrope-betűje, világos/sötét témái, rem-alapú méretmódjai, fejléce, asztali oldalsávja és ötelemű mobil dokkja működik. A téma és a felületméret alapértéke Auto. Kifejezetten mentett Kompakt/Normál/Nagy választás újratöltés után is megmarad; nincs első látogatáskor kikényszerített Kompakt méret. A fókusz-, billentyűzet-, safe-area- és viewport-kezelés az átvett komponensekhez tartozik.

A Foglalások a referencia kártyáit, szűrőit, keresőjét, lapméretválasztóját, felső/alsó lapozóját és Lista/Naptár/Hét nézeteit használja. Telefonon a heti napok sorok, az órák vízszintesen görgethetők. A szerkesztők alul nyílnak; 640px-től jobb oldalra igazított panelt adnak. A forrás swipe-, átrendezési és naptári húzási működése a támogatott LumiNails-adatokra van bekötve.

Az admin támogatott felületei az áttekintés, foglalások, beosztás, árlista, galéria, weboldaltartalom, kuponok, árkalkulátor, vendégek, beállítások és kommunikáció. A saját lapok az átvett közös primitíveket használják. A statisztika a betöltött online és kézi rekordokat számolja, az adatlefedettségét jelzi; teljes archivált pénzügyi nyilvántartást nem állít.

A státusz-, dátum-, sorrend-, árlista- és kuponváltoztatás a megfelelő Mentésig piszkozat. Húzáskor az időtartam és a korábbi üzenetpiszkozat megmarad. A fizetett összeg elhagyáskor vagy Enterre a meglévő tranzakciós művelettel menthető és a támogatott megerősített online/kézi időpontot teljesítettre állítja. Más mentetlen foglalásmező mellett az összeg a teljes mentésre vár. A CMS mentése, közzétételi kérése és megjelenési állapota külön marad. A lemondás és az e-mail-hiba nyugtázása tartós saját művelet; a privát inspirációképek a meglévő jogosultságot használják.

A vendégkeresés, lapozás, kapcsolati műveletek és egyező betöltött online előzmények megmaradtak. Hideg újrafoglaláskor a szolgáltatáskatalógus betöltése után a saját támogatott szolgáltatás és időtartam kerül a kézi szerkesztőbe. Kijelentkezéskor a személyes szerkesztő- és keresési állapot is törlődik.

## Adatmodell és szándékos határok

Megmarad a LumiNails saját Supabase RLS-, RPC-, hitelesítési, CMS-, közzétételi, Storage- és nyugtázási határa. A referencia üzleti adatai, képi anyagai, adatbázisa, környezeti azonosítói és titkai nem kerültek át.

Egyetlen Köröm sáv működik; a beosztás konkrét dátumokat tárol. Nincs új munkatárs-, oktatási vagy körlevélmodul, no-show állapot, privát emlékeztető-/megjegyzéstábla, ismétlődő heti séma vagy atomi időpontcsere. A kézi blocked_times modell nem tárol e-mailt, telefont és több szolgáltatást; ezek mezői nem jelennek meg. Név/megjegyzés alapján nem kapcsolunk kézi rekordot regisztrált fiókhoz.

Az admin standalone PWA böngészőzoomja továbbra is tiltott. A felhasználó külön kérésére a heti naptár belső időrácsa két ujjal méretezhető; ez csak az időosztások szélességét változtatja. A keret a visualViewport tényleges magasságát követi, így az alsó menü a látható területen marad.

## Elvégzett ellenőrzés

A korábbi forrásátvétel 27/27 sikeres WebKit-esete történeti eredmény. A mostani, teljes adminra és mobilra kiterjedő forrásalapú [review](../local-backups/admin-reference/mobile-full-review.md) mind a 11 lapot, a közös komponenseket és a saját adaptert összevetette a tényleges Szalon-forrással. Öt javítást kért: mai következő időpont, rövidülő vendég-/naplólista lapozása, vendéglista swipe, LAN-os vágólap-visszajelzés és szemantikus veszélyszínek. Ugyanannak a reviewernek a [korlátozott verdictje](../local-backups/admin-reference/mobile-full-verdict.md) mind az ötöt lezárta, ship eredménnyel; ez az öt javításra vonatkozik.

A végleges, kizárólag adminra szűkített csomag 33/33 esete sikeres, 50.6 másodperc alatt. Az új regressziók a mai közelgő időpontot, a vendég-swipe-ot, a rövidülő vendég-/naplólistát és a LAN-os másolás sikeres/sikertelen ágát is ellenőrzik.

A három célzott képrögzítő teszt sikeres: az eredeti 38 kép újrakészült 390/1440px-en és a lapozó 320/390/768px-en. További 22 kép készült a 11 lapról 320/768px-en, a tényleges dokkon és Továbbiak menün navigálva; két külön világos/sötét belépési hibakép is készült. Mind a 62 képet átnéztük, a [telefonos](../local-backups/admin-reference/current-phone.png) és [asztali kontaktlap](../local-backups/admin-reference/current-desktop.png) frissült. A kiegészítő képek jegyzéke: [mobile-audit-captures.json](../local-backups/admin-reference/mobile-audit-captures.json).

Tesztforrások: [admin-reference.spec.js](../tests/admin-reference.spec.js), [admin-mobile-fixes.spec.js](../tests/admin-mobile-fixes.spec.js), [admin-reference-contract.spec.js](../tests/admin-reference-contract.spec.js), [admin-reference-boundary.js](../tests/helpers/admin-reference-boundary.js). A WebKit-esetek szintetikus Supabase-határral futottak, a valódi Supabase HTTP-kéréseket blokkolva. Sikeres a build:check, lint:css és git diff --check. Forrás-CSS e körben nem változott. A korábbi check-site 20, már meglévő publikus asset-verziójelzése változatlan; ezt most nem futtattuk újra.

A teljes publikus tesztcsomag nem futott. Nem történt valódi iPhone-hardveres, billentyűzetes vagy telepített iOS PWA-minősítés, valódi adatbázis-/e-mail-/felhő-/környezeti ellenőrzés. Új kiadott raszteres képi elem nem készült. E dokumentációfrissítés nem futtatott új tesztet vagy auditot. A pontos jelenlegi fájlkör és a működési javítások: [admin-full-review.md](admin-full-review.md).

## Előnézet és kiadás

Asztali előnézet: [127.0.0.1:8101/admin/](http://127.0.0.1:8101/admin/). Telefon ugyanazon a Wi-Fi-n: [192.168.0.244:8103/admin/](http://192.168.0.244:8103/admin/). A helyi HTTP-ellenőrzés mindkét címen 200 választ adott. A telefonos szerver a 0.0.0.0:8103 címen figyel; a Windows Node Public Allow szabályai ellenőrzöttek, tűzfalváltoztatás nem történt. A telefonos cím a jelenlegi helyi hálózathoz kötött.

**Az éles projekt és a luminails.hu nem változott.** Valódi tartalom, foglalás, profil és adatbázis nem változott. Nem történt commit, push, telepítés, közzététel, migráció vagy távoli írás. A fejlesztés a D:/Asztal/LumiNails_test projektben maradt; éles átemeléshez külön kifejezett felhasználói jóváhagyás szükséges.

A korábbi menü-, naptárzoom- és lemondásjavítás célzott ellenőrzése: [admin-mobile-fixes.md](admin-mobile-fixes.md). A korábbi 27 esetet e javítás miatt nem futtattuk újra teljes egészében.

A beosztás irányadó működése a felhasználó új pontosítása szerint az eredeti LumiNails havi dátumkijelölése, a jelenlegi admin megjelenésével. A heti beosztáspanelt és időszak/hétköznap alapú kiválasztást ez felváltja. A belépő csak tényleges túlcsordulás esetén görgethető. Részletek és célzott ellenőrzések: [admin-schedule-restoration.md](admin-schedule-restoration.md).

A beosztás a felhasználó jóváhagyásával naptár és közös szerkesztőpanel felépítést használ: egy nap szerkesztése, külön többnapos kijelölés, külön beállítottidősáv-lista. A dátumos mentési logika megmaradt. Részletek: [admin-schedule-panels.md](admin-schedule-panels.md).
