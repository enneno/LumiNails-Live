# LumiNails: saját munkák, mályva arculat

> Ez a különálló látványpróba archivált. Az aktuális fejlesztés a teljes meglévő TEST-alkalmazás forrásaiban folytatódik. Indítás: npm run serve, cím: http://127.0.0.1:8101/. A build:site újra a teljes alkalmazást építi. Részletek: ../docs/public-local-redesign.md.

Külön, kizárólag publikus TEST-előnézet a codex/public-redesign-preview ágon. A main és az éles oldal változatlan.

## Direction contract

THESIS: A saját körmös munkák és Szofi személye adják az oldal karakterét; a felhasználó által elfogadott mályva marad.

OWN-WORLD: Mély mályva bemutatkozósáv, halvány rózsás alap, sarkos saját fotók, meglévő Playfair szóvédjegy és DM Sans szöveg.

STORY: Egy valódi munka nyit, Szofi bemutatkozik, majd a szolgáltatások és munkák vezetnek a foglaláshoz.

FIRST VIEWPORT: Végig látható fejléc és meglévő értesítő; a fennmaradó képernyőt saját körmös fotó tölti ki. Alul nagy, kétsoros Lumi Nails név; asztalon a leírás és foglalás jobb oldalt, mobilon alatta.

FORM: Rögzített hero → bemutatkozás sorrend; asztalon oldalt álló szolgáltatáscím és váltakozó képméretű galéria. Kódalapú felhasználói iteráció, új comp nélkül. Mozgás helyett képnagyítás; reduced-motion támogatás.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Tartalom és működés

Az adatforrás a meglévő nyilvános adatok.json pillanatképe. A nyitókép a saját Francia kövekkel. munka, assets/work-1.jpg. A hero után közvetlenül saját portréval és a teljes eredeti szöveggel jön Szofi. A szöveg kizárólag bekezdésekre tagolódik. Az oldal utána szolgáltatásokat, galériát, foglalási meghívót és láblécet mutat.

A mályva egyetlen rögzített paletta. A korábbi három színpróba és színválasztó eltávolítva. DM Sans és Playfair Display helyi betűk, HTML/CSS/vanilla JavaScript; új függőség nincs. Mind a 19 eredeti ár a külön statikus árlistán marad.

A foglalási, fiók- és szolgáltatásrészlet-linkek a meglévő éles oldalra vezetnek. Nincs helyi Auth-kliens, Supabase-kérés vagy adatírás. A natív dialogos nagyító Escape-pel bezárul, fókusza visszatér a fotóra; a mobil details menü navigáláskor bezárul. A sticky fejléc és a horgonyok eltartása a tényleges fejlécmagassághoz igazodik. A hero a fejléc és értesítő alatti képernyőmagasságot tölti ki, sötét overlayen olvasható szöveggel.

## Helyi futtatás és hosztolás

- node design-preview/build.mjs: az előnézet építése az elkülönített dist kimenetbe.
- node design-preview/serve.mjs: http://127.0.0.1:8118, csak a dist gyökér kiszolgálása.
- node design-preview/check.mjs: célzott tördelés-, hero-, menü-, nagyító-, tartalom- és árlista-ellenőrzés. LUMI_BROWSER_EXECUTABLE adja a helyi Chromium útját.
- node design-preview/prepare-assets.mjs: saját publikus képek és nyílt betűk előkészítése, rendes iterációhoz nem szükséges.

A package.json build:site parancsa csak ezen az ágon mutat az előnézeti buildre. A Cloudflare manuális preview deployment ezt az ágat építi. GitHubon nem fut teszt vagy audit.

## Források és határok

A kilenc saját JPEG eredete a media/provenance.json nyilvántartásban és a képek metaadataiban szerepel, pixeladataik változatlanok. A korábbi hero.jpg forrásmásolat megmarad, a nyitófelület most work-1.jpg-t használ. A négy helyi WOFF2 fájlhoz két OFL-licenc tartozik. Nincs külső font/CDN.

A források, dokumentáció és tesztek nem kerülnek a kimenetbe. Az előnézet noindex/nofollow és robots Disallow védelmet kap. A gyökér kanonikus designrendszere, admin, PWA, éles oldal és adatbázis nem változik. Az ellenőrzés részletei: verification.md.
