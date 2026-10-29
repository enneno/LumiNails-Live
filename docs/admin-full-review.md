# Teljes admin- és mobilösszevetés – 2026-10-29

A TEST admin mind a 11 lapját, közös komponenseit és saját adapterét a D:/Asztal/Szalon/Szalon-teszt/src tényleges, csak olvasott forrásával vetettük össze. Az irányadó Szalon-megjelenés, a LumiNails saját adatmodellje és jogosultsági határai megmaradtak. A manifest 46 párt rögzít: 36 bájtpontosan átvett és 10 illesztett fájl; a foglaláskártya JSX-e változatlan.

## Elérhető előnézet

- Telefon, ugyanazon a Wi-Fi-n: [192.168.0.244:8103/admin/](http://192.168.0.244:8103/admin/).
- Asztal: [127.0.0.1:8101/admin/](http://127.0.0.1:8101/admin/).

Mindkét cím HTTP 200 választ adott. A régi telefonos cím helyett a jelenlegi LAN-IP szerepel; a szerver 0.0.0.0:8103 címen figyel. A Windows Node Public Allow szabályai ellenőrzöttek, tűzfalváltoztatás nem történt. A telefonos cím a jelenlegi helyi hálózathoz kötött.

## Lezárt javítások

1. Az áttekintés a mai folyamatban lévő/későbbi új vagy megerősített időpontokat is beleszámítja a következő vendégbe és a hétnapos számlálóba, a forrás endsAt >= nowTimestamp feltételével.
2. Rövidülő vendég- és naplólistán a lapozó, a megjelenített sorok és a naplóexport ugyanazt az érvényes lapot követi; a tárolt lapállapot normalizálódik.
3. A vendéglista ismét a forrás useHorizontalSwipe gesztusával lapoz, a függőleges görgetési kezelés megtartásával.
4. A vendég- és naplómásolás megvárja a közös vágólapsegédet, siker/hiba visszajelzést ad. A Clipboard API után az aktív dialogban vagy a dokumentumtörzsben kijelölt textarea-fallback következik, eltávolítással és fókusz-visszaállítással.
5. A belépési hiba és az árlistasor mindkét törlőgombja a meglévő admin-danger szemantikus szerepeit követi világos/sötét témában. Új paletta és forrás-CSS-módosítás nincs.

A [teljes review](../local-backups/admin-reference/mobile-full-review.md) öt hibáját ugyanannak a reviewernek a [korlátozott verdictje](../local-backups/admin-reference/mobile-full-verdict.md) mind lezárta, ship eredménnyel. Ez a javítások lezárása, nem teljes felületi vagy valódi készülékes minősítés.

## Ellenőrzés és korlátok

A végleges, kizárólag adminra szűkített csomag 33/33 esete sikeres, 50.6 másodperc alatt. Az új regressziók a mai közelgő időpontot, a vendég-swipe-ot, a rövidülő vendég-/naplólistát és a LAN-os másolás sikeres/sikertelen ágát is ellenőrzik.

Az eredeti 38 kép újrakészült, további 22 kép rögzíti mind a 11 lap tényleges dokk-/menünavigációját 320/768px-en; külön világos/sötét belépési hibakép is készült. Mind a 62 kép átnézett. Bizonyíték: [ellenőrzési rekord](../local-backups/admin-reference/mobile-full-verification.json), [kiegészítő képjegyzék](../local-backups/admin-reference/mobile-audit-captures.json), [telefonos kontaktlap](../local-backups/admin-reference/current-phone.png), [asztali kontaktlap](../local-backups/admin-reference/current-desktop.png), audit-login-error-light.png és audit-login-error-dark.png a .impeccable/review mappában.

Sikeres a build:check, lint:css és git diff --check. A WebKit-esetek szintetikus Supabase-határral, blokkolt valódi Supabase HTTP-vel futottak. Teljes publikus teszt, valódi iPhone-hardveres/billentyűzetes/telepített PWA-minősítés és valódi adatbázis-/e-mail-/felhő-/környezeti ellenőrzés nem történt. A korábbi check-site 20 meglévő publikus asset-verziójelzését nem futtattuk újra. A standalone PWA böngészőzoomja tiltott marad; a korábban külön kért belső naptárzoom e körben változatlan.

## E körben módosított vagy létrehozott kiadási fájlok

- src/admin-reference/studio.tsx
- src/admin-reference/panels.tsx
- src/admin-reference/lib/clipboard.ts – új
- src/admin-reference/components/admin-login-form.tsx
- src/admin-reference/components/admin-prices-tab.tsx
- src/admin-reference/reference-source.json
- admin-reference.js – forrásból generált
- admin-reference.css – forrásból generált
- admin/index.html – asset-hivatkozások
- tests/admin-reference.spec.js
- tests/admin-mobile-fixes.spec.js
- tests/helpers/admin-reference-boundary.js
- docs/admin-full-review.md – új
- docs/admin-studio-local.md
- docs/admin-studio-direction.md
- DESIGN.md
- .impeccable/design.json
- docs/admin-reference-files.md – teljes változásjegyzék

A korábbi munkából már módosult fájlokat ez a szűk kör nem minősíti új változtatásnak. A helyi review- és képbizonyítékok a local-backups/admin-reference alatt találhatók; új kiadott raszteres elem nem készült. A manifest tényleges 36/10 aránya megmaradt; az admin-reference-contract.spec.js minimuma is változatlanul 36, e körben nincs nettó módosítása.

**Az éles projekt és a luminails.hu nem változott.** Valódi tartalom, foglalás, profil és adatbázis érintetlen. Nem történt commit, push, deploy, migráció vagy távoli írás. Éles átemeléshez külön kifejezett jóváhagyás szükséges.
