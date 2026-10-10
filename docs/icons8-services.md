# Főoldali szolgáltatásikonok — 2026-10-11

Helyi TEST-módosítás a `D:\Asztal\LumiNails_test` projekt `main` ágán.
A helyi ellenőrzések után a felhasználó jóváhagyta a TEST közzétételt.
A kiadás kizárólag az `enneno/enneno.github.io` `main` ágát érinti;
nem jogosít élesítésre, adatbázis- vagy távoli tartalommódosításra.

## Eredmény

- A felhasználó által kiválasztott Icons8 / Design Circle köröm–ecset ikon a díszítéshez került. Köröm, lakkosüveg és reszelő egészíti ki; mind egyszínű, telt charcoal sziluett. Az ikonok nem egyetlen szerző készletéből származnak; az eredeti források külön fel vannak sorolva a licencjegyzékben.
- Négy helyi, átlátszó 100×100px PNG, összesen 6773 bájt. Megjelenési méret: mobilon40px, asztalon48px. Nincs új csomag, ikonfont, külső futásidejű ikonkérés vagy saját SVG-átmásolás.
- Az alap HTML és a CMS-renderelő ugyanazokat a fájlokat használja; nem villan vissza a korábbi ikon.
- A szolgáltatásszövegek, hivatkozások, saját szolgáltatásoldali fotók és a foglalási/admin működés változatlan.
- Az ingyenes Icons8-felhasználáshoz szükséges látható, kattintható forráslink a közös footer jogi sorával egy sorban jelenik meg. Nem került külön tág blokkba. Mind a tíz oldalhivatkozás megmaradt, telefonon a linkek legalább44px magas célterületűek.
- Impeccable: az elfogadott vizuális irány és a meglévő elrendezés megőrzése. Mobile-responsive: az eredeti méretek, színek és töréspontok követése, túlcsordulás nélküli forráslink.

## Ellenőrzések

- `node --check src/public/30-content-rendering.js` — sikeres.
- `npm run build`, `npm run assets:version`, `npm run build:check` — sikeres; a böngészős bundle-ök és cache-verziók a projekt parancsaival épültek.
- `npm run lint:css` — sikeres, nincs új `!important` vagy második CSS-réteg.
- A `tests/compact-footer-services.spec.js` két célzott tesztje sikeres: footer320/390/1440px, tíz céloldal, forráslink, célterületek, túlcsordulás; négy ikon ugyanebben a három szélességben, helyi PNG-k sikeres betöltése, CMS-renderelő, JavaScript nélküli HTML. Az árlista csak a közös footer reprezentatív ellenőrzéséhez szerepelt.
- A meglévő specifikáció szűk axe-ellenőrzése csak a két módosított komponensen futott, nulla szabálysértéssel. Nem futott teljes tesztcsomag, teljes oldalas audit vagy Lighthouse.
- Az első ikonellenőrzésben a tesztben elírt függvénynév javítása után kizárólag az érintett ikonteszt futott újra, sikeresen; a már sikeres footertesztet nem ismételtük.
- A mobil/asztali szolgáltatás- és footer-képernyőképek vizuálisan átnézve. A Git-diff az ikonokra, licencforrásra és szükséges build/cache-változásokra korlátozódik; `git diff --check` sikeres.

## Pontos fájllista

Forrás és teszt:

- `src/public/30-content-rendering.js`
- `src/styles/15-home-sections.css`
- `src/styles/13-gallery-footer-navigation.css`
- `src/html/site-footer.html`
- `tests/compact-footer-services.spec.js`

Új ikonok és licenc:

- `kepek/ikonok/epites.png`
- `kepek/ikonok/diszites.png`
- `kepek/ikonok/gel-lakk.png`
- `kepek/ikonok/manikur.png`
- `licenses/icons8.txt`

HTML (közös footer-forráslink és cache-verzió; a kezdőlapon a négy ikon is):

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

Projektparanccsal generált bundle-ök:

- `script.js`
- `style.css`

Dokumentáció:

- `DESIGN.md`
- `docs/design-system.md`
- `docs/icons8-services.md` (ez a jegyzék)

A már meglévő `.impeccable` és `.playwright-cli` munkafájlok érintetlenek.
A mostani ideiglenes ikonjelöltek és képernyőképek az ignored
`output/playwright/` alatt maradnak, nem részei a kiadási fájloknak.
