# Főoldali képsor – mobilos húzás, 2026-10-29

A mobilos húzás külön Touch Events eseményfolyamot kapott, ezért nem szakad meg a Pointer Events megszakításakor. Az egér és a toll megtartja a korábbi kezelést. A vízszintes húzás mozgatja a képsort, a függőleges gesztus szabadon görgeti az oldalt. Többujjas gesztust nem foglalunk le. Elengedés / touchcancel után a mozgás külön késleltetés nélkül folytatódik; húzás nem nyit meg véletlenül képet. A sebesség változatlan.

Módosított forrás: `src/public/45-home-gallery-carousel.js`.

Módosított célzott teszt: `tests/home-gallery-carousel.spec.js`.

Újragenerált csomag: `script.js`. A friss script hash-ére módosított HTML-hivatkozások: `index.html`, `404.html`, `admin/index.html`, `arlista/index.html`, `adatkezeles/index.html`, `fiokom/index.html`, `foglalas/index.html`, `galeria/index.html`, `gel-lakk-tatabanya/index.html`, `korom-diszites-nail-art-tatabanya/index.html`, `manikur-tatabanya/index.html`, `mukorom-epites-toltes/index.html`, `hazirend/index.html`.

Jelentés: `docs/home-gallery-touch-20261029.md`. CSS-t, PWA-kódot, adatbázist és más funkciót ebben a javításban nem módosítottunk.

Ellenőrzés: Git-állapot, forrás-diff és diff whitespace-ellenőrzés; helyi build. A galéria hat célzott Chromium-tesztje sikeres, köztük natív böngészős touch-bemenettel vízszintes húzás és függőleges oldalgörgetés, automatikus folytatás, asztali húzás, képnagyítás, billentyűzet és JavaScript nélküli megjelenés. WebKitben az asztali húzás és a külön érintéses eseményfolyam két tesztje sikeres. A WebKit touch-regresszió esemény-visszajátszás; fizikai iPhone-ellenőrzés nem történt.

A korábbi mobiltesztek Chromiumban a javítás előtt is átmentek; ezért a Pointer Events megszakítása után folytatódó Touch Events adatfolyam külön regressziós esetet kapott.

Mobilos helyi előnézet ugyanazon a Wi-Fi-n: `http://192.168.0.244:8103/#galeria-atvezeto`. Éles projektmódosítás, GitHub-push és telepítés nem történt.
