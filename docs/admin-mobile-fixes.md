# Admin – mobilmenü, naptárnagyítás és lemondás

2026-10-29, kizárólag helyi TEST-javítás.

Az alsó menüt a látható iOS viewportnál magasabb alkalmazáskeret levágta. A viewport-híd most billentyűzet nélkül is a visualViewport magasságával méretezi a keretet. Billentyűzetnyitáskor a dokk elrejtőzik, bezáráskor a látható kereten belül tér vissza. A forrás CSS-moduljai változatlanok.

A heti naptár kétujjas gesztusa standalone módban is az időrács szélességét méretezi. A gesztus preventDefault kezelést kap; az oldal böngészőzoomja és a viewport maximum-scale=1, user-scalable=no szabálya megmaradt. Ez a felhasználó külön naptárnagyítási kérését valósítja meg.

Az online foglalás állapotválasztója is tartalmazza a Vendég mondta le állapotot. Az adminlemondás neve Általam lemondva. A két meglévő adatbázisállapot továbbra is különböző:

| Felirat | Adatbázisállapot | Meglévő e-mail-folyamat |
| --- | --- | --- |
| Általam lemondva | cancelled | Adminlemondási e-mail-kérés az RPC-n keresztül |
| Vendég mondta le | cancelled_by_customer | Nem készül adminlemondási e-mail-kérés |

A vendég saját lemondása eleve cancelled_by_customer állapotként érkezik. Az adminban külön piros figyelmeztetés, Vendég mondta le címke és Nyugtázom művelet jelzi; az állapotszűrőben külön is kiválasztható. A vendégoldali lemondás saját visszaigazolási folyamata változatlan.

## Célzott ellenőrzés

Hét célzott eset sikeres, több szűk futásban:

1. A dokk és a Továbbiak menü elérhető 393×852 nézetben, 793px-re modellezett látható viewport mellett, billentyűzet bezárása és elforgatás után is.
2. A kétujjas naptárnagyítás/kicsinyítés megváltoztatja az időrács szélességét; az oldal skálája 1 marad, nem keletkezik adatírás vagy véletlen új foglalás.
3. Online foglalásnál mindkét lemondási választás működik, a mentett állapot újratöltés után is különbözik. Az adminlemondás megfelelő e-mail-paramétert és mock e-mail-feladatot továbbít, a vendéglemondás nem indít ilyen kérést.
4. A referenciafájlok aktuális lenyomatai és a változatlan kártya-JSX érvényesek.
5. Egyetlen aktív admin CSS, helyes statikus asset-hivatkozások.
6. A saját adatírási és standalone böngészőzoom-határ megmaradt.
7. A reprezentatív mobilos és asztali szerkesztőpanelek viewport-geometriája megfelelő.

Parancsok: npm run test:admin célzott fájlokkal/névszűrővel; npm run build:check; git diff --check. A WebKit érintéses DOM-eseményeket és modellezett viewportot használ, nem valódi iPhone-hardvert. Minden valódi Supabase HTTP-kérés blokkolt, az adatok és az e-mail-feladatok szintetikusak. A publikus felület, PWA-böngészőzoom, éles adatbázis és éles oldal változatlan; nincs push vagy kiadás.

## Érintett fájlok ebben a javításban

- src/admin-reference/components/admin-viewport-bridge.tsx
- src/admin-reference/components/admin-week-calendar-mobile.tsx
- src/admin-reference/components/admin-bookings-tab.tsx
- src/admin-reference/lib/booking-status.ts
- src/admin-reference/reference-source.json
- admin-reference.js — forrásból újraépítve
- admin/index.html — az admin JS tartalmi hash-hivatkozása
- tests/admin-mobile-fixes.spec.js — új
- tests/admin-reference-contract.spec.js
- playwright.admin.config.js
- docs/admin-mobile-fixes.md — új
- docs/admin-studio-local.md
- docs/admin-studio-direction.md
- docs/admin-reference-files.md
- DESIGN.md
- .impeccable/design.json
- PRODUCT.md

A teljes adminátalakítás fájlonkénti listája: [admin-reference-files.md](admin-reference-files.md).
