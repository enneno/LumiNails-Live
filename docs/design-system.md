# LumiNails design system

Ez a TEST projekt Figma-alapú vizuális szerződése. A referencia a `fNgCClNjs47gqVBvCZj8KG` Figma-fájl; a LIVE felület csak külön élesítési jóváhagyással veheti át.

## Források és felelősség

- A publikus tokenek, header, közös gomb- és mezőalapok tulajdonosa: `src/styles/00-base.css`.
- A kezdőlap, galéria/footer, árlista, fiók és foglalás saját elrendezése a megfelelő számozott feature-CSS-ben él.
- Az admin tokenek forrása: `src/admin-styles/00-foundation.css`; a workspace témája: `src/admin-styles/20-workspace.css`.
- A közös publikus footer markupja kizárólag a `src/public/20-shell-coupons.js` fájlban él.
- A `style.css` és `admin-v2.css` generált fájl; közvetlenül nem szerkeszthető.
- Tilos az `!important`, a duplikált override-réteg és egy komponens alapstílusának több tulajdonoshoz osztása.

## Színek

| Szerep | Token | Érték |
| --- | --- | --- |
| Gyöngyház-zsálya brand / CTA | `--ui-primary` | `#C9D4CF` |
| Sötét tinta / footer | `--ui-off-black` | `#31383f` |
| Szöveg sötét felületen | `--ui-on-dark` | `#F5F1EB` |
| Oldalháttér | `--ui-bg` | `#e3dcd2` |
| Világos felület | `--ui-surface` | `#F5F1EB` |
| Halvány zsálya kiemelés | `--ui-highlight` | `#DFE7E3` |
| Zsálya kiegészítő | `--ui-warm` | `#8BA198` |
| Másodlagos szöveg | `--ui-muted` | `#555d64` |
| Zsálya szöveg világos felületen | `--ui-accent-text` | `#4B625A` |
| Finom elválasztó | `--ui-line` | `rgba(201, 212, 207, 0.30)` |
| Erős elválasztó | `--ui-line-strong` | `rgba(49, 56, 63, 0.28)` |

Komponensben szemantikus tokent kell használni. A publikus paletta és az admin light/dark paletta külön CSS-tulajdonban marad; egy publikus színváltás nem írja át automatikusan az admin funkcionális állapotszíneit. Success, warning, danger és info állapotnál a szín mellé szöveg vagy ikon is szükséges.

### Olvasható színpárok — 2026-09-08

- A publikus `#C9D4CF` brand háttéren `--ui-on-primary` (`#31383f`) felirat legyen. Ez a pár 7,8:1 körüli kontrasztot ad.
- Az ivory `#F5F1EB` felületen az alap tinta 10,5:1 körüli, az `--ui-accent-text` (`#4B625A`) 5,8:1 körüli kontrasztot ad.
- A `--ui-warm` dekoratív/support szín. Világos felületű címkéhez és linkhez az olvashatóbb `--ui-accent-text` tartozik. A sötét szolgáltatás-záróblokk helyileg a világos `--ui-highlight` tokent használja.
- Másodlagos szövegre `--ui-muted` használható; további opacity/áttetszőség leronthatja a kontrasztját.
- Adminban a `--admin-v2-on-brand` a rózsaszín háttér felirata; a `--admin-v2-on-brand-dark` a témafüggő sötét/hover háttér saját felirata. Ezek nem felcserélhetők.
- A kritikus helyi axe-teszt kezdőlapon, foglaláson és admin belépésen nulla szövegkontraszt-eltérést enged. A színátmenetes vagy képes felületeket kézzel is ellenőrizni kell; az automatikus mérés nem jelent teljes akadálymentességi tanúsítást.

## Tipográfia

- Display és nagy cím: `Playfair Display`, tartalék `Georgia, serif`.
- Törzsszöveg, gomb, mező és admin UI: `DM Sans`, tartalék `sans-serif`.
- Alapszerepek desktopon: micro 11 px, caption 13 px, label 14 px, body-small 16 px, body 18 px, lead 19 px, control 18 px.
- Mobilon a mezők számított mérete legalább 16 px legyen; a nagy címeknek 375 és 390 px szélességen is túlcsordulás nélkül kell törniük.

## Térköz és elrendezés

- Alaprács: 4 px. Gyakori értékek: 8, 12, 16, 20, 24, 32, 48, 64, 72, 96 és 112 px.
- Közös gutter: `--ui-gutter: clamp(20px, 4.3vw, 80px)`.
- Közös tartalomszélesség: `--lumi-content-width: 1200px`.
- Közös szekció-padding: `--lumi-section-padding-inline` és `--lumi-section-padding-block`.
- A kezdőlapi hero és bemutatkozás szándékosan teljes szélességű split szekció. A belső tartalom és a többi szekció a közös gutterhez igazodik.
- A dokumentum flex oszlopként legalább a viewport magasságát kitölti, ezért a footer után nem jelenhet meg üres oldalháttér.

## Lekerekítések és árnyékok

- Kártya: `--lumi-radius-card: 4px`.
- Mező és alap vezérlő: `--lumi-radius-control: 3px`.
- Pill kizárólag valódi chiphez vagy kör alakú vezérlőhöz: `--lumi-radius-pill: 999px`.
- Árnyék ritkán használható; alapérték: `--lumi-soft-shadow`. Felülethatárhoz elsőként finom border tartozik. A kezdőlapi galérialapozó lapjai és vezérlője nem kapnak árnyékot vagy radiális fényudvart, mert az overflow levághatja ezeket; a lapok pozíciója, mérete és kerete ad mélységet.
- Egymásba ágyazott kép és caption egyetlen közös külső formát alkot; belső, egymást metsző lekerekítés nem használható.

## Komponensek

- **Gomb:** a `.gomb` az alap; legalább 44 px magas, látható `focus-visible`, külön disabled/loading állapottal.
- **Mező:** látható label, mobilon legalább 16 px betűméret, hiba esetén `aria-invalid` és kapcsolt hibaüzenet.
- **Kártya:** világos surface vagy sötét showcase; a háttérkép felett olvashatóságot adó overlay kötelező.
- **Galériakártya:** minden képen ugyanaz a sötét, áttetsző szövegháttér jelenik meg; nem csak az elsőn.
- **Galériaátvezető:** a hero képcímkéje 44–48 px magas, a kezdőlapi galérialapozó alatt pedig csak egy visszafogott, keretes nyílgomb marad. Külön „Galéria” cím nem ismétli meg a szekció főcímét és a tartalomszerkesztőben sincs hozzá mező.
- **Szolgáltatás-részlet:** desktopon a kép felett irányított palaszürke olvashatósági réteg használható. Mobilon a teljes 3:2 kép nem kap színező overlayt; a cím és a bevezető külön, világos felületen követi. A törzsszöveg sorkizárt, de automatikus elválasztás nem használható.
- **Footer:** minden publikus oldal ugyanazt a dinamikusan betöltött, sötét homepage footert használja.

## Mobil és asztali szabályok

- Elsődleges breakpoint: 768 px. A 480/640/900/1100 px csak valódi komponensigényhez használható.
- Kötelező reprezentatív nézetek: 390 × 844 és 1440 × 1000.
- Mobilon a hero kép teljes szélességű, fix 16:9 arányú és `object-fit: contain`: nincs vágás, zoom vagy képeltolás. A kompakt, bal oldali palaszürke cím/leírás egyetlen balról kifutó olvashatósági átmenet fölött jelenik meg; a három előnyszöveg középre igazítva, egy közös áttetsző alsó sávban van. Nincsenek külön szövegdobozok vagy teljes képet elfedő fátyol. A galériahivatkozás kompakt, 44–48 px-es sor, a két következő művelet egyenlő szélességű oszlopokban van a kép alatt. Feltöltéshez 16:9-es kép tervezendő (pl. 1920×1080), bal oldalt szöveghellyel. A kép és szöveg továbbra is a tartalomszerkesztőből érkezik; a desktop split elrendezés megmarad. A galéria, árlista és foglalási utak mobilon egyoszloposak.
- A publikus oldal nagyítható marad, de a mobil űrlapmezők számított betűmérete legalább 16 px, `font-size-adjust: none` és saját 100%-os szövegskálázás mellett; így az iOS fókusz-zoomot nem egy optikailag lekicsinyített betűvel próbáljuk elkerülni. Az admin standalone PWA külön nagyítási tilalma változatlan.
- A közös footer asztalon és mobilon három tömör információs sorba rendezi a márkát, elérhetőséget és jogi metaadatot. A márkaleírás elhagyható, mert ismétlés; a cím, e-mail, adatkezelési link és a legalább 44 px-es érintési célok nem rövidíthetők le.
- Nincs vízszintes dokumentumgörgetés, levágott cím vagy 44 px-nél kisebb elsődleges érintési cél.
- `prefers-reduced-motion: reduce` esetén az érdemi animáció kikapcsol.

## Módosítás utáni minimum

1. Git diff és CSS-tulajdon ellenőrzése.
2. `npm run lint:css`, majd forrásból build.
3. Csak az érintett desktop és mobil nézetek célzott vizuális ellenőrzése.
4. Interakció vagy kontraszt változásakor célzott Playwright/accessibility ellenőrzés.
