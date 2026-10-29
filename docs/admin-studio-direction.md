# Admin – a Szalon forrásalapú átvétele

A felhasználó az egész meglévő adminra a Szalon-teszt tényleges felépítését, megjelenését és alkalmazható működését kérte. A korábbi, saját DOM-mal készített közelítés nem elfogadott referencia.

## Direction contract

THESIS: A Szalon-teszt admin tényleges React-komponenseit és CSS-moduljait használjuk a LumiNails saját adatkezelői felett.
OWN-WORLD: A forrás Manrope-tipográfiája, méretmódjai, témái, szemantikus színei, eszköztára, oldalsávja és mobilmenüje az irányadó.
STORY: Az admin ugyanabban az áttekinthető felületi rendben intézi a LumiNails meglévő feladatait.
FIRST VIEWPORT: A referencia fejlécét a tartalmi oldal címe és vezérlői követik; a foglalásszűrők, lapozók és kártyák a referencia saját komponenséből jönnek. Mobilon az ötelemű alsó menü marad végig elérhető.
FORM: Forrásalapú átvétel, saját LumiNails-adapterrel; a referencia kódja a mérce, nem képmásolat vagy új látványterv.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Határok

- Csak TEST-fejlesztés; nincs éles közzététel, adatbázis- vagy tartalomírás a távoli közös adatbázisba.
- A referencia üzleti tartalma, ügyfelei, környezeti beállításai és kulcsai nem kerülnek át.
- A beosztás a LumiNails konkrét dátumait szerkeszti. Nem lesz új ismétlődő heti háttérmodell, több szakember, oktatás vagy körlevél.
- A LumiNails adatmodelljében nem létező privát emlékeztető, saját foglalási jegyzettábla, no-show állapot és atomi időpontcsere nincs látszatművelettel helyettesítve.
- A kézi foglalt idők saját modellje nem tárol e-mailt/telefont és több szolgáltatást; a megfelelő mezők nem jelennek meg.
- A PWA teljes oldalra vonatkozó böngészőzoomja tiltott marad. A felhasználó 2026-10-29-i kérésére a naptár saját időrácsa két ujjal standalone módban is nagyítható.
- A React statikus böngészős csomaggá épül; Next.js-szerverre nincs szükség. Az adatkezelők és az RLS LumiNails-oldalon maradnak.

## Forrásbizonyíték

A src/admin-reference/reference-source.json eredeti és helyi SHA-256-lenyomatokat rögzít: 46 referenciafájl, közülük 36 változatlanul átvéve. A foglaláskártya JSX-e változatlan. A tíz illesztett fájl az eltérő üzleti modellhez, a lemondás egyértelmű megnevezéséhez, a PWA-szabályhoz és a belépési hiba témát követő szemantikus kontrasztjához kapott módosítást. A shell JSX-e a referencia osztályait és szerkezetét használja; az egyedi LumiNails-modulok ugyanazokat a primitíveket alkalmazzák.

A teljes admin és mobil forrásalapú összevetésének, az öt lezárt javításnak és a célzott ellenőrzéseknek a rekordja: [admin-full-review.md](admin-full-review.md). Az irányadó komponensszerkezet és paletta változatlan; a belépési hiba és az árlistasor törlése a meglévő admin-danger szerepeket használja világos és sötét témában.

A beosztás irányadó működése a felhasználó új pontosítása szerint az eredeti LumiNails havi dátumkijelölése, a jelenlegi admin megjelenésével. A heti beosztáspanelt és időszak/hétköznap alapú kiválasztást ez felváltja. A belépő csak tényleges túlcsordulás esetén görgethető. Részletek és célzott ellenőrzések: [admin-schedule-restoration.md](admin-schedule-restoration.md).

A beosztás a felhasználó jóváhagyásával naptár és közös szerkesztőpanel felépítést használ: egy nap szerkesztése, külön többnapos kijelölés, külön beállítottidősáv-lista. A dátumos mentési logika megmaradt. Részletek: [admin-schedule-panels.md](admin-schedule-panels.md).
