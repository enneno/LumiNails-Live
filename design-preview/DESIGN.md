---
name: Lumi Nails — saját munkák, mályva arculat
description: Saját körmös fotó, nagy Playfair név és közvetlen, mély mályva bemutatkozás.
colors:
  canvas: "#fff8f7"
  soft: "#f5e1e8"
  ink: "#392630"
  accent: "#873b59"
  accent-strong: "#65283f"
  on-accent: "#fffaf7"
  line: "rgb(85 34 52 / 22%)"
typography:
  display:
    fontFamily: "Playfair Display, serif"
    fontSize: "clamp(68px, 12vw, 96px)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(30px, 4vw, 48px)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  wordmark:
    fontFamily: "Playfair Display, serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.025em"
rounded:
  control: "8px"
spacing:
  gutter: "clamp(20px, 4.8vw, 80px)"
  section-gap: "clamp(56px, 7vw, 104px)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
    textColor: "{colors.on-accent}"
---

# Design System: Lumi Nails — saját munkák, mályva arculat

## Overview

**Creative North Star: "Saját munkák és Szofi, mályvában"**

Ez a dokumentum kizárólag a `design-preview` jelenlegi publikus TEST-előnézetét rögzíti. A kiválasztott mályva szín fix. A saját körmös munka, a nagy, kétsoros Lumi Nails név és Szofi személye adja a felület karakterét. A fejléc → teljes képernyős hero → közvetlen bemutatkozás sorrend megmarad; utána szolgáltatások, munkák, foglalási meghívó és lábléc következik.

A jelenlegi vizuális alap a `README.md` direction contractja és a megvalósult forrás; ez kódalapú felhasználói iteráció, új képi comp nélkül. A dokumentum nem cseréli le a gyökér kanonikus designrendszerét, és nem ad élesítési engedélyt.

**Key Characteristics:**

- Egyetlen mályva paletta, halvány rózsás alap és mély színű bemutatkozósáv.
- Saját Francia kövekkel. munkafotó, alul nagy Playfair név és foglalási meghívó.
- Oldalt álló szolgáltatáscím és váltakozó méretű, sarkos galériaképek desktopon.

## Colors

Az accent a rögzített mályva: az akciók, világos szakaszok címei, a fejléc szóvédjegye, a teljes bemutatkozósáv és a lábléc használja. Az accent-strong az elsődleges hover. A canvas a lap és a tömör fejléc háttere, valamint a hero szövege. A soft az értesítő és a képek alapszíne; az ink a világos felületek törzsszövege. Az on-accent a mályva felületek világos felirata, a line az áttetsző elválasztó.

**The Fixed Mauve Rule.** Ebben az előnézetben a felhasználó által kiválasztott mályva az egyetlen paletta; nincs színválasztó vagy URL-/munkamenet-alapú témaváltás.

## Typography

A Playfair Display a fejléc/lábléc szóvédjegye mellett a nagy hero nevet és a bemutatkozás első, üdvözlő bekezdését is viszi. A DM Sans a további címsorok, törzsszöveg és vezérlők betűje. Négy helyi WOFF2 fájl és két OFL-licenc tartozik hozzájuk; nincs külső font-CDN.

A frontmatter display szerepe a kétsoros hero név. Az alap H1 a többi oldalon DM Sans, `clamp(46px, 7vw, 88px)`, 500 súly, 1.07 sormagasság és −0.035em betűköz. A hero leírása legfeljebb 32ch, 16px/1.6, desktopon 18px. A bemutatkozás címe `clamp(36px, 4.8vw, 56px)`, 400 súly; első bekezdése Playfair 28px/1.3, további szövege 16px, legfeljebb 52ch, 20px bekezdésközzel. Desktopon a szolgáltatáscímek 30px/400; az árlista szakaszcíme 30px, sora 14px, időtartama 12px. Az árértékek tabulárisak és törésmentesek.

## Layout

A `/` az egyetlen kezdőlap, a `/arlista/` külön statikus árlista a 19 eredeti névvel és árral. A forrás a `build.mjs`, `preview.css`, `preview.js`, tartalma az `adatok.json` pillanatképe. A tartalmi szélesség legfeljebb 1200px, folyékony kétoldali margóval.

A külön fejléc `sticky`, `top: 0`, `z-index: 50`, canvas háttérrel. A meglévő értesítő a fejléc után, a hero előtt áll. A `ResizeObserver` a fejléc és értesítő összmagasságából frissíti az `--opening-chrome` értéket; a hero minimuma `calc(100svh - var(--opening-chrome, 0px))`. A fejléc külön mért magassága az `--sticky-header-height`; a horgonyok eltartása ez + 24px. Nincs preview-sáv.

A nyitókép `/assets/work-1.jpg`, saját Francia kövekkel. munka. Teljes felületű `cover` kép, a tartalom alulra rendezett. A név minden szava külön sor. A hero után azonnal a teljes szélességű, mályva `#szofi` bemutatkozósáv jön saját portréval; a teljes eredeti szöveg csak bekezdésekre tagolódik.

| Szélesség | Megvalósult viselkedés |
| --- | --- |
| 320–639px | Natív mobilmenü. A hero név fölül, leírás és akció alatta, 48px függőleges tartalmi térközzel; képfókusz `58% 54%`. Egymás alatti portré és szöveg; a galéria kétoszlopos, 32px × 16px térközzel. |
| 640–899px | A hero továbbra is egymás alatti. A bemutatkozás 0.85fr/1.15fr, 40px oszlopközzel; a galéria két oszlop marad, 48px × 32px térközzel. |
| 900px-től | Teljes navigáció. Hero név bal alsó, leírás/akció jobb alsó oszlopban; `minmax(0, 1fr) minmax(260px, 350px)`, 80px oszlopköz, 72px függőleges térköz; képfókusz `54% 58%`. Bemutatkozás: 80px oszlopköz, portré legfeljebb 680px magas. |

Desktopon a szolgáltatások két oszlopa 0.75fr/1.25fr, 80px oszlopközzel. A bal oldali cím az aktuális fejlécmagasság + 40px ponton rögzül a szakaszon belül; jobb oldalt vonalakkal elválasztott sorok, alattuk árlistalink áll. A galéria 12 oszlopos, 64px × 32px térközzel; a hat kép helye sorrendben `1/8`, `9/13`, `2/6`, `7/13`, `1/7`, `8/13`. Az eltérő méretek és üres oszlopok adják a ritmust.

**The Hero–About Rule.** A hero után minden szélességen közvetlenül Szofi bemutatkozása következik; közéjük más szakasz nem kerül.

## Elevation & Depth

Nincsenek dobozárnyékok. A hero mobilos sötétítése `linear-gradient(0deg, rgb(23 20 18 / 86%), rgb(23 20 18 / 68%) 65%, rgb(23 20 18 / 40%))`, 900px-től `linear-gradient(0deg, rgb(23 20 18 / 88%), rgb(23 20 18 / 55%) 44%, rgb(23 20 18 / 12%) 100%)`. A mély mályva sáv és a világos alap váltása tagolja az oldalt. A gombok átmenete 160ms ease; reduced-motion esetén nincs átmenet vagy sima horgonygörgetés.

## Shapes

A fényképek és szakaszok sarkosak, az akciógombok és mobilmenü 8px sugarúak. A galéria 3:4 `cover` kivágásokat használ; a portré és nagyító `contain` illesztéssel őrzi a teljes képet. A hat desktop galériaelem szélessége eltér, képarányuk közös.

## Components

- **Akciók:** accent háttér és on-accent felirat; legalább 50px magas, 13px × 20px belső térközzel. Hoverkor accent-strong. A másodlagos akció átlátszó, accent felirattal és kerettel; hoverkor soft hátterű. A hero is a közös elsődleges akciót használja.
- **Navigáció:** folyamatosan látható fejléc, desktopon Szofi / Szolgáltatások / Árlista / Munkák és foglalásgomb. 900px alatt natív `details` menü 44px-es nyitóvezérlővel; linkválasztás után bezárul. Tartalomra ugró link is van.
- **Fókusz:** általában 2px accent körvonal, 5px eltartással; a herón canvas, a mély bemutatkozósávban on-accent színnel.
- **Bemutatkozás:** saját portré, nagy cím, Playfair üdvözlés és az eredeti teljes szöveg külön bekezdésekben; sötét színes felületen világos feliratokkal.
- **Képnagyító:** natív modális `dialog`; látható Bezárás felirat és 28px-es vonalas SVG-záróikon. Escape vagy bezárógomb zárja, a fókusz visszatér a megnyitó fotóra; a kép felirata és alternatív szövege a választást követi.
- **Árlista:** szemantikus leírólista névvel, időtartammal és jobbra igazított árral. Nincs helyi foglalási űrlap vagy fiókkomponens.

## Do's and Don'ts

- **Do** őrizd meg a saját fotókat és teljes eredeti szövegeket. A kilenc JPEG eredete a metaadatokban és a `media/provenance.json` nyilvántartásban szerepel; a megőrzött `hero.jpg` nem a jelenlegi nyitókép.
- **Do** a rögzített mályva előnézetet és a `README.md` direction contractját kövesd; a gyökér kanonikus dokumentumai külön hatáskörben maradnak.
- **Don't** tekintsd a foglalás-, fiók- és szolgáltatáslinkeket helyi funkciónak: a jelenlegi éles oldalra vezetnek. Nincs helyi Auth/API-kliens, adatírás vagy éles foglalási próba.
- **Don't** következtess a preview-ból admin/PWA-módosításra vagy LIVE-kiadási engedélyre. A csomag noindex/nofollow és robots Disallow jelölést kap.
- **Don't** állíts teljes hozzáférhetőségi vagy fizikai készülékes igazolást. A `.impeccable/review/editorial-malyva-20261028` négy szélességen (320/390/768/1440px) igazolja a célzott helyi ellenőrzést: nincs túlcsordulás, hibás kép vagy külső kérés; működik a menü, nagyító, Escape/fókusz-visszaadás; a teljes szöveg és 19 ár megmaradt, a kizárt útvonalak 404-et adnak. A független reviewer a kompozíciót megfelelőnek találta, dokumentációfrissítést és SVG-záróikont kért; a végső javításellenőrzés mindkét tételt megoldottnak értékelte, disposition: ship, kizárólag TEST publikus előnézetre. A galéria elemképe sticky-fejléc műterméket tartalmaz, ezért ott a dokumentum tetejéről készült teljes oldalképek az irányadók. Nincs teljes audit vagy produkciós jóváhagyás.
