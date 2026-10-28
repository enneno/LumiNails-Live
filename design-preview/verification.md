# Mályva előnézet: ellenőrzés

A felhasználó a korábbi elrendezést sablonosnak találta, a mályva színt elfogadta. Az új változat a saját körmös fotót és nagy, kétsoros Lumi Nails nevet emeli ki; mély mályva bemutatkozósávot, oldalt álló szolgáltatáscímet és váltakozó képméretű galériát használ. A fejléc végig látható; a teljes képernyős, overlayes hero után közvetlenül Szofi következik. A három színpróba megszűnt.

## Elvégzett ellenőrzések

- node --check: build.mjs, preview.js és check.mjs szintaxis rendben.
- node design-preview/build.mjs: sikeres, csak az elkülönített dist előnézetet állítja elő.
- npm run lint:css és a külön design-preview/preview.css Stylelint-ellenőrzése: sikeres.
- git diff --check és a kért forrásváltozások kézi diff-ellenőrzése: sikeres.
- Célzott helyi check.mjs 320/390/768/1440px-en: nincs vízszintes túlcsordulás, hibás kép, külső hálózati kérés vagy JavaScript-hiba. A hero cover képpel tölti ki a fejléc/értesítő alatti képernyőt, következő szakasza a bemutatkozás. A fejléc a láblécnél is látható.
- Mobilmenü navigáláskor bezárul; a képnagyító működik, Escape bezárja, a fókusz visszatér a megnyitó képre.
- A teljes bemutatkozószöveg szóköz-normalizálás után egyezik az eredeti nyilvános pillanatképpel. Mind a 19 szolgáltatásnév és ár megmaradt. Belső SQL-útvonal és a korábbi /a/ előnézet 404-et ad.
- Egy asztali és mobil vizuális kör: nyitó nézetek, teljes kezdőlap és érintett szakaszok. Bizonyíték: .impeccable/review/editorial-malyva-20261028, gitignore alatt. A galéria külön elemképe a sticky fejléc miatt köztes fejlécet mutat; a galéria vizuális értékelése a helyes, dokumentum tetejéről készített teljes képen történt.
- Impeccable-detektor egyszer futott a módosított kezdőlapon. Négy térközjelzés: a színes szakaszok belső, ténylegesen térközös tartalma és padding-block rövidítés; öt színjelzés: a gyökér kanonikus designrendszer és az engedélyezett mályva előnézet eltérése; egy világos alapszínjelzés: a felhasználó által kiválasztott mályva paletta halvány rózsás alapja. Ezeket kézzel ellenőriztük, szabályt nem tiltottunk le.

## Független lezárás

A friss, külön kontextusú Impeccable finish reviewer a kompozíciót megfelelőnek találta. Két szűk javítást kért: a korábbi hárompalettás dokumentáció aktualizálását és a képnagyító szöveges × jelének SVG-re cserélését. Az ikon elkészült; célzott 390/1440px-es ellenőrzés igazolja a bezárást és fókusz-visszaadást. A designleírást külön dokumentáló frissítette. A végső javításellenőrzés mindkét megnevezett tételt megoldottnak értékelte: disposition: ship, kizárólag TEST publikus előnézetre. A verdict-pass.md a két javítás lezárását igazolja, nem éles kiadási engedély.

## Ebben a körben változott fájlok

- design-preview/build.mjs
- design-preview/preview.css
- design-preview/preview.js
- design-preview/check.mjs
- design-preview/check-colors.mjs — törölve, a korábbi hárompalettás kísérlethez tartozott
- design-preview/README.md
- design-preview/DESIGN.md
- design-preview/design.json
- design-preview/verification.md

## Határok és kiadás

Csak helyi Chromium-szélességemuláció és célzott ellenőrzés történt. Nem futott teljes tesztcsomag, éles foglalási próba, fizikai készülékes vagy teljes hozzáférhetőségi audit. A foglalás-, fiók- és szolgáltatásrészlet-linkek a meglévő éles oldalra vezetnek; az előnézet nem tartalmaz adatíró klienst. A kilenc saját forrásfotó pixeladata változatlan.

Kizárólag a codex/public-redesign-preview ág Cloudflare preview közzététele engedélyezett. A main ág, a TEST kanonikus kiadása, az admin, a PWA, az éles luminails.hu és az adatbázis nem változik. GitHubon nincs automatikus teszt vagy audit. A ténylegesen kiszolgált deployment.json kódverzióját a közzététel után külön összevetjük a kiadott commit azonosítójával.
