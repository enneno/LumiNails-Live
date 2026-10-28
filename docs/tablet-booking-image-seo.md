# Tablet foglalásellenőrző és képkeresési jelölések

## Kért javítások

A foglalásellenőrző mezők és gomb korábbi két merev, legalább 170px széles oszlopa nem fért el a tablet nézet keskeny kártyájában. Az irányadó .foglalas-kezelo-bevitel szabály most a ténylegesen elérhető hely szerint rendez egy vagy két oszlopot. Nincs új felülírás, !important vagy elrejtett túlcsordulás. A foglaláskereső működése és adatkezelése változatlan.

A képeknek eddig is volt CMS-ből származó alt szövegük és látható feliratuk. A build most a galériához ImageGallery/ImageObject JSON-LD jelölést is készít a tényleges leírásokból, teljes képcímekkel és előnézeti képcímekkel. Az oldal meglévő, Tatabányát és manikűrt megnevező címe és metaleírása adja a témakörnyezetet. A képleírásokat nem írtuk át, nem szúrtunk minden képhez kulcsszólistát, és nem állítottunk kitalált szerzőt vagy licencet.

A normál sitemap.xml image:image bejegyzéseket kap: a kezdőlap, galéria és négy szolgáltatásoldal ténylegesen megjelenő nyilvános képeit sorolja fel, az eredeti nagy képet használva. A képcímek oldalanként egyediek és XML-ben megfelelően escape-elve vannak. Foglalási, fiók-, admin- és privát inspirációs képek nem szerepelnek benne. A jelölések buildkor készülnek; emiatt nincs új látogatónkénti Supabase-kérés vagy külön kiszolgáló.

## Ellenőrzés

- npm run build és npm run lint:css sikeres.
- scripts/prerender-public.js szintaxis és git diff --check rendben.
- Az érintett kártya célzott geometriai ellenőrzése: 390/768/820/1024/1440px-en a gomb a kártyán belül marad, a kártyának nincs vízszintes túlcsordulása. 768/820/1024px-es komponensképek megtekintve. Nem küldtünk be foglaláskeresést; a böngésző Supabase-kéréseit blokkoltuk.
- Két célzott új unit teszt: eredeti kép/előnézet megkülönböztetése, duplikációk és privát oldalak kizárása, XML-escape, JSON-LD idempotencia és leírásból érkező script-beszúrás kizárása. Mindkettő sikeres.
- A teljes helyi TEST-build sikeres: 12 HTML-oldal, 19 aktív szolgáltatás. A meglévő kiadási fájlhatár/pillanatkép/immutable asset ellenőrzés sikeres.
- A generált galéria JavaScript-futtatás nélkül is tartalmaz 13 ImageObject elemet; leírásaik egyeznek az aktuális nyilvános pillanatképpel. A képes oldaltérkép 28 bejegyzést tartalmaz az érintett nyilvános oldalakon. A TEST noindex/nofollow megmaradt.

Képek és jegyzőkönyvek: .impeccable/review/tablet-booking-image-seo-20261028, gitignore alatt. Nem futott teljes Playwright-, Lighthouse- vagy SEO-audit.

## Ebben a körben változott fájlok

- src/styles/30-booking.css — a foglalásellenőrző belső rácsa
- style.css — kizárólag a build által generálva
- scripts/image-seo.js — új, build közbeni nyilvános képkigyűjtés és jelölések
- scripts/prerender-public.js — képes sitemap és statikus galéria-metaadatok bekötése
- tests/unit/image-seo.test.mjs — új célzott tesztek
- docs/tablet-booking-image-seo.md — ez a jegyzőkönyv

## Közzétételi határ

Csak a helyi TEST-projekt módosult. Nem volt Git-push, Cloudflare-közzététel, éles helyi vagy luminails.hu módosítás. Nem módosult adatbázis, jogosultság, foglalás, profil, kép vagy tárolt képleírás. A normál build kizárólag a nyilvános adatokat olvasta.

A helyi és noindex TEST-oldal nem kerül ettől Google Képek-találatokba. A jelölések az engedélyezett élesítés után a publikus builddel kerülhetnek ki; az indexelést és helyezést a Google határozza meg, ezek nem garantálhatók. Irányadó Google dokumentáció: https://developers.google.com/search/docs/appearance/google-images.
