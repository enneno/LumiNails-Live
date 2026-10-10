# Helyi bézs palettapróba — 2026-10-10

Történeti ellenőrzési napló: ezt a próbát felváltotta az első/A Ivory & Taupe stúdióterv. Az aktuális helyi megvalósítás és ellenőrzései: `docs/studio-preview.md`. Az alábbi értékek nem az aktuális tokenek.

A felhasználó elutasította a kobaltkéket és az első lilás-rózsás próbát. A végleges helyi előnézet ivory–pezsgőbézs, nem rózsaszín. Csak `D:\Asztal\LumiNails_test`, TEST `main`; nincs commit, push vagy deploy. A LIVE kiadás változatlan.

## Szerepek

| Szerep | Világos | Admin sötét |
| --- | --- | --- |
| Háttér | `#F7F3ED` | `#242321` |
| Kártya | `#FFFFFF` | `#302E2B` |
| Kiegészítő felület | `#EEE7DE` | `#403C36` |
| Művelet | `#DFCEBC` | `#DFCEBC` |
| Műveleti felirat | `#302D2A` | `#242321` |
| Hover / szöveges akcentus | `#655447` | `#EEDFCE` |
| Törzsszöveg | `#302D2A` | `#FFF9F1` |
| Másodlagos szöveg | `#655F59` | `#D4CBC0` |

A sötét hoverhez világos felirat, a világos hoverhez sötét felirat tartozik. A kiválasztott foglalási vezérlők olvasható keretet kapnak; a fókusz nem a halvány díszítőszínt használja. A siker-, figyelmeztetés-, hiba- és foglalási állapotok külön színei, szövegei és ikonjai megmaradtak. A háttérképeket nem színeztük át.

Elrendezés, tipográfia, tartalom, képek, árak, foglalási logika, CMS, adatbázis és PWA zoomszabály nem változott. Nincs új függőség, `!important`, felülírásréteg vagy workflow-teszt.

## Ellenőrzések

- `npm run lint:css`: sikeres.
- `npm run build`, `npm run assets:version`, `npm run build:check`: sikeres; a generált fájlok a forrásból készültek.
- `npm run public:css:check`, `npm run admin:css:check`, `git diff --check`: sikeres.
- 12 külön célzott Playwright-eset sikeres: 3 accessibility ratchet (home/booking/admin mobil), 3 admin light/dark kontraszt/felület/naptár, 2 kezdőlapi layout/CTA/footer, 3 kritikus mobil screenshot/overflow, 1 publikus alap/hover/kiválasztott műveleti kontraszt.
- Az admin kontrasztmérés 390 és 1440 px-en, mindkét témában vizsgálta a gombot, navigációt, readonly státuszt és siker-/hibavisszajelzést. A publikus új teszt az alap-, rámutatásos és kijelölt állapotokban legalább 4,5:1 szövegkontrasztot ellenőriz.
- Egy régi, hűvös háttérszínt számon kérő tesztelvárást az új bézs tokenhez igazítottunk; csak ez az érintett eset futott újra, az új kontrasztesettel együtt. A sikeres tesztek nem futottak újra változatlan kódon.
- Képi ellenőrzés egy kötegben: kezdőlap desktop/mobil, foglalás mobil, egy közös szolgáltatásoldal mobil, admin desktop/mobil light/dark. Admin kizárólag izolált mintaadatokkal; nincs éles adatírás.
- A design JSON fájlok érvényesek. A dokumentált színek és komponensminták a helyi palettát követik.
- Teljes tesztkészlet és Lighthouse nem futott. Valódi iPhone/Safari és telepített PWA nem volt része ennek a színpróbának.

## Pontos módosított fájlok

CSS-források:

- `src/styles/00-base.css`
- `src/styles/13-gallery-footer-navigation.css`
- `src/styles/16-home-gallery.css`
- `src/styles/18-hero-inner-pages.css`
- `src/styles/19-service-detail.css`
- `src/styles/25-customer-account.css`
- `src/styles/30-booking.css`
- `src/admin-styles/00-foundation.css`
- `src/admin-styles/10-components.css`
- `src/admin-styles/20-workspace.css`
- `src/admin-styles/30-bookings.css`

Ellenőrzések:

- `tests/visual-critical.spec.js`
- `tests/admin-dark-mode.spec.js`
- `tests/palette-contrast.spec.js` (új)

Design-dokumentáció:

- `DESIGN.md`
- `.impeccable/design.json`
- `.21st/DESIGN.md`
- `.21st/design.json`
- `docs/design-system.md`
- `docs/palette-preview.md` (ez a jelentés)

Generált CSS:

- `style.css`
- `admin-v2.css`

Kizárólag CSS-cache-verzió:

- `index.html`
- `404.html`
- `adatkezeles/index.html`
- `admin/index.html`
- `arlista/index.html`
- `fiokom/index.html`
- `foglalas/index.html`
- `galeria/index.html`
- `gel-lakk-tatabanya/index.html`
- `korom-diszites-nail-art-tatabanya/index.html`
- `manikur-tatabanya/index.html`
- `mukorom-epites-toltes/index.html`

Összesen 34 kiadásba számító fájl. Az egyszeri képi ellenőrzés szkriptje és képei az ignorált `.impeccable/review/palette-*` fájlokban vannak; nem részei a kiadásnak.
