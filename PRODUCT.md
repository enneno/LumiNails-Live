# LumiNails

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A Tatabányán körmös szolgáltatást kereső vendégek és a szalont kezelő adminisztrátor.

## Product Purpose

Valós szolgáltatások, képek és árak bemutatása, online időpontfoglalás és a foglalások napi kezelése.

## Operating Context

A publikus oldal előrenderelt HTML-t és aktuális tartalomfrissítést használ. Az admin kezeli a képeket, szövegeket, szolgáltatásokat, árakat, kuponokat és foglalható időpontokat. Mobil böngészőben és admin PWA-ként is használható.

## Capabilities and Constraints

- A foglalási, hitelesítési, kupon- és fizetettösszeg-kezelési működés megőrzendő.
- A jelenlegi árak, foglalási adatok és autentikus fotók nem cserélhetők kitalált adatokra.
- A tartalmi szövegek az új designhoz alakíthatók a felhasználó 2026-10-10-i válasza szerint; ebben a körben nem változik a közös távoli tartalomadatbázis.
- Fejlesztés csak a TEST main ágán, jelenleg D:/Asztal/LumiNails_test. LIVE-kiadás külön engedélyhez kötött.
- A generált CSS/JS a forrásrétegekből épül. Az admin a tényleges Szalon React 19-komponenseket statikus esbuild/Tailwind 4 böngészős csomagként használja, saját LumiNails-adapterrel; Next.js-szerver nincs. GitHubon nem futhat teszt.

## Brand Commitments

A Lumi Nails név és minimalista stílus megmarad. A publikus felülethez kért új elrendezés, színek és nagy, teljes szélességű hero fotó irányát az alábbi döntések rögzítik. Az admin saját forrásalapú vállalását külön rögzítjük.

2026-10-10: a felhasználó a „Váltható szalonfelület” irány első/A tervét választotta: Munkák / Szolgáltatások / Szofi nézetek, hosszú kezdőlapi blokkfolyam helyett. A mellékelt Ivory & Taupe paletta kötelező brand irány; a JPEG-minta közepéből kiolvasott közelítő értékek: `#F6F3EE`, `#E2D9D0`, `#B8A89B`, `#A08075`, `#3E3935`. A sötét szín a világos felületek szövegéhez tartozik; az árnyalatok nem lehetnek olvashatatlan feliratok. A működő helyi megvalósítás ezt a tervet követi; nincs commit, push vagy élesítés.

A felhasználó külön megerősítette: „Igen, a saját képekkel építsd meg”. A terv fotói szemléltetők; a jelenlegi CMS-hero és az öt autentikus galériakép marad. A fotóazonosság nem követelmény a látványtervvel szemben. Ez nem engedély a jóváhagyott felépítés vagy a rögzített paletta lecserélésére.

2026-10-29: a teljes meglévő admin irányadója a D:/Asztal/Szalon/Szalon-teszt tényleges kódja. Az átvett React-komponensek, CSS-modulok, témák és Auto alapméret a LumiNails saját adatkezelő adapterével működnek. Egy Köröm sáv, konkrét dátumos beosztás és a meglévő adatmodell marad; nem készül új munkatárs-, oktatási, körlevél-, no-show-, privát jegyzet- vagy atomi időpontcsere-modul. A referencia üzleti adatai és környezete nem kerülnek át. Részletek: [admin-studio-local.md](docs/admin-studio-local.md).

## Evidence on Hand

2026-10-10 refinement: the user likes the homepage style but finds the page too short, like a single block. Preserve Ivory & Taupe, typography and authentic photographs; expose services and introduction as continuous sections after the opening, with the existing CMS booking introduction before the compact footer. This latest instruction supersedes the previous hidden alternate-view structure. Work locally in TEST; no new deployment approval.

Valós tartalom az index.html-ben és a szolgáltatásoldalakon; meglévő fotók a kepek/ alatt és a publikus tartalomrekordokban. Új ügyfélvélemények vagy állítások nem készülnek.

## Accessibility & Inclusion

Olvasható kontrasztok, látható fókusz, mobilon legalább 16px-es mezőszöveg és megfelelő érintési célok. Az admin standalone böngészőzoomjának tilalma megmarad. A felhasználó 2026-10-29-i kérésére a naptár saját időrácsa kétujjas gesztussal külön méretezhető.
