# AGENTS.md — LumiNails helyi fejlesztési és kiadási szabályzat

Ez a fájl a `D:\Asztal\LumiNails_test` projektben végzett minden munkára kötelező szabályokat rögzíti.

## Környezetek és kötelező kiadási folyamat

- A fejlesztés és ellenőrzés helyben történik, a `D:\Asztal\LumiNails_test` mappában. A mappa neve örökölt; nem jelent külön TEST-repós kiadási lépést.
- Minden módosítást először helyben kell elkészíteni és a kockázatához arányosan ellenőrizni; kis és egyértelmű változásnál a Git-diff és szükség esetén egy gyors vizuális ellenőrzés elegendő.
- Felületet érintő változtatásnál helyi böngészős és mobilról is megnyitható előnézetet kell biztosítani. A mobilos linkhez az aktuális hálózati címet és a helyi kiszolgáló elérhetőségét ellenőrizni kell.
- Az ellenőrzés eredményét röviden, pontosan jelenteni kell a felhasználónak.
- A felhasználó helyben és mobilon is átnézheti az elkészült felületet. Csak a külön, kifejezett kiadási jelzésére, például „mehet élesre”, kerülhet a jóváhagyott változás közvetlenül az éles GitHub-repóba és onnan az éles `luminails.hu` oldalra.
- Külön TEST GitHub-repóba pusholás, TEST Cloudflare-közzététel és sikeres TEST-deploy nem feltétele az élesítésnek. Ezeket csak a felhasználó külön kérésére szabad használni, nem automatikus köztes kiadási lépésként.
- A helyi forráskód, konfiguráció és generált fájlok szerkesztése önmagában nem élesítés, akkor sem, ha a helyi példány az éles GitHub-repóhoz kapcsolódik. A fejlesztési kérés önmagában nem engedélyez éles GitHub-pusht, éles közzétételt vagy a közös éles Supabase-adatbázis módosítását.
- Kiadás előtt read-only ellenőrzéssel azonosítani kell a pontos éles GitHub-repót, ágat és kapcsolódó Cloudflare-projektet. Az éles GitHub-cél az `enneno/LumiNails-Live` repó `main` ága; az `origin` nevéről tilos feltételezni, hogy erre mutat. Ha külön helyi kiadási példány szükséges, annak aktuális útvonalát is ellenőrizni kell.
- Élesítés előtt ismét ellenőrizni kell a pontos változási kört; kizárólag a helyben ellenőrzött és a felhasználó által jóváhagyott változtatások kerülhetnek kiadásra.

## Kódtisztaság és CSS-felelősség

- Egy elem vagy komponens alapmegjelenésének pontosan egy egyértelmű CSS-tulajdonosa legyen.
- Későbbi kontextusszabály csak valódi eltérést módosíthat, például pozíciót, elrendezést, térközt, reszponzív viselkedést vagy szemantikus variánst.
- Tilos hibát egymásra halmozott felülírásokkal, növelt specificitással, `!important` használatával vagy teljes stílusmásolatokkal elfedni.
- Takarításkor a duplikált felelősséget meg kell szüntetni; tilos azt újabb felülírás mögé rejteni.
- Kódtakarítás vizuális és funkcionális változás nélkül történjen, hacsak a felhasználó kifejezetten mást nem kér.
- A módosítás maradjon a lehető legkisebb, jól körülhatárolt és könnyen ellenőrizhető.
- Az alapstílus, a komponensvariáns és a környezeti eltérés felelőssége legyen világosan elkülönítve.
- Forrás-CSS módosításakor le kell futtatni az `npm run lint:css` parancsot. Ez gyors statikus ellenőrzés, nem böngészős vagy teljes oldalas teszt.
- A Stylelint kizárólag a forrás-CSS-t ellenőrzi; a generált `style.css` és `admin-v2.css` fájlokat nem szabad külön lintelni vagy közvetlenül javítani.
- Stylelint-szabályt vagy egyedi lintjelzést csak dokumentált projektkompatibilitási okból szabad kikapcsolni. Tilos egy új hibát indoklás nélkül `stylelint-disable` megjegyzéssel elrejteni.
- A Stylelint `--fix` kapcsolóját tilos ellenőrzés nélkül az egész projektre futtatni; automatikus javítás csak szűk fájlkörön és a diff kézi átnézésével használható.

## Normál weboldal és PWA

- A normál weboldal és a PWA megjelenése vagy viselkedése indokolt esetben eltérhet; nem követelmény a feltétel nélküli azonosság.
- Az eltéréseket környezetspecifikus, világosan elhatárolt szabályokkal kell megvalósítani, az általános felület indokolatlan módosítása nélkül.
- Az admin standalone PWA nagyítása szándékosan tiltott.
- Az admin standalone PWA nagyítását tilos visszakapcsolni, megkerülni vagy olyan viewport-, gesztus-, CSS- vagy JavaScript-változtatással feloldani, amely újra lehetővé teszi a nagyítást.
- A nagyítási tilalom csak külön, kifejezett felhasználói utasításra változtatható meg.

## Munkavégzési korlátok

- Mindig a felhasználó által megadott változási körön belül kell maradni.
- A működő funkciókat és a meglévő felhasználói folyamatokat meg kell őrizni, hacsak a feladat kifejezetten nem kér változtatást.
- A publikus felületet, az admin felületet, a SEO-t, a sitemapet és a PWA-kódot csak akkor szabad módosítani, ha az aktuális feladat ezt kifejezetten kéri.
- Generált fájl helyett az irányadó forrásfájlt kell módosítani.
- Titkokat, kulcsokat, tokeneket és személyes adatokat tilos forráskódba vagy naplóba írni.

## UI- és mobilos skillhasználat

- Reszponzív elrendezés, mobilos tördelés, túlcsordulás vagy képméretezés javításakor a `mobile-responsive` skill használható az irányadó forráskód feltérképezésére és a legkisebb javítás kiválasztására.
- Kontraszt-, olvashatósági, fókusz-, billentyűzet- vagy űrlap-hozzáférhetőségi probléma esetén a `web-accessibility` skill használható; az automatikus eredményt szükség szerint vizuális vagy kézi ellenőrzéssel kell kiegészíteni.
- Mobilos UI-változás után a `mobile-responsive-qa` skill a kockázathoz igazított ellenőrzési kör meghatározására használható. A projekt meglévő Playwright-parancsai és az alábbi tesztelési alapelvek elsőbbséget élveznek a skillhez mellékelt általános segédprogramokkal szemben.
- A `ui-ux-pro-max`, `impeccable`, `design-taste-frontend` és 21st.dev skillek csak akkor használhatók együtt, ha eltérő, szükséges feladatot fednek le; ugyanarra a vizuális döntésre nem kell több, egymást ismétlő auditot futtatni.
- A skillek használata nem bővíti a felhasználó által jóváhagyott módosítási kört, és nem indokol automatikusan teljes oldalas, minden viewportot érintő vagy teljes tesztcsomagos ellenőrzést.

## Tesztelési alapelv

- Mindig a legkisebb, még kellően megbízható ellenőrzést kell választani. A tesztelés terjedelmét a tényleges változási kör és kockázat határozza meg, nem a megszokás.
- Kis vizuális, CSS-, tipográfiai, spacing-, szín-, ikon- vagy szövegmódosítás miatt tilos a teljes weboldalt vagy a teljes Playwright-csomagot végigtesztelni.
- Kis, jól körülhatárolt vizuális változásnál alapértelmezés szerint elegendő:
  1. a Git-diff ellenőrzése;
  2. az érintett oldal vagy komponens gyors vizuális ellenőrzése;
  3. csak az érintett viewport ellenőrzése, illetve desktop és mobil nézet együtt, ha a változás reszponzív viselkedést érint.
- Egyszerű vizuális vagy szöveges módosításnál automatizált tesztet, Lighthouse-, axe- vagy teljes oldalas auditot csak akkor kell futtatni, ha a változás közvetlenül érinti az adott területet, vagy konkrét kockázat indokolja.
- Interakciós vagy működési logika módosításánál kizárólag a közvetlenül érintett célzott Playwright-specet vagy a lehető legszűkebb tesztesetet kell futtatni.
- Közös CSS-, navigációs vagy megosztott komponens módosításánál néhány reprezentatív érintett oldal ellenőrizhető, de ez önmagában nem indokol teljes tesztcsomagot.
- Teljes tesztcsomag csak akkor indokolt, ha a változás Supabase-t, hitelesítést, foglalási adatot, Storage-ot, e-mailt, közös buildfolyamatot, függőséget vagy több fontos felhasználói folyamatot egyszerre érint, illetve ha a felhasználó ezt kifejezetten kéri.
- Egy kis változtatás ellenőrzése nem válhat indokolatlan, hosszú — például félórás — teljes oldalas teszteléssé. Ha egy célzott ellenőrzés váratlanul széles vagy lassú lesz, meg kell állni és újra kell szűkíteni a tesztkört.
- Tilos nem érintett oldalakat és funkciókat „biztonság kedvéért” vagy rutinból tesztelni.
- Tilos ugyanazt a sikeres tesztet érdemi kódváltozás nélkül újrafuttatni.
- Sikertelen teszt után csak a hibához kapcsolódó javítást és a szükséges célzott ellenőrzést kell megismételni; a sikertelen célzott teszt nem jogosít fel automatikusan teljes tesztcsomag futtatására.

## GitHub és kiadás

- A GitHubon semmilyen automatikus teszt nem futhat.
- A GitHub-folyamat kizárólag a helyileg már ellenőrzött, késznek ítélt és a felhasználó által élesítésre jóváhagyott változat közvetlen éles közzétételére szolgálhat.
- GitHubra csak olyan változtatás tölthető fel, amelyet helyileg, a fenti kockázatalapú szabályok szerint már megfelelőnek ítéltünk.
- A push vagy a GitHub Pages közzététel nem indíthat új tesztet, auditot vagy teljes ellenőrzést.
- Az élesítés nem tesztel újra; a helyben már ellenőrzött és külön jóváhagyott változás közvetlenül az éles GitHub-repóba kerül. Előzetes TEST-push vagy TEST-közzététel nem szükséges.
- A kapcsolt Cloudflare-projekt szokásos kiadási buildje és deployja a jóváhagyott éles push után futhat; ez nem jelent új tesztet vagy auditot.

## Ellenőrzés és jelentés

- Módosítás előtt ellenőrizni kell a Git-állapotot és a releváns fájlokat.
- Módosítás után ellenőrizni kell a Git-diffet, hogy csak a kért fájlok változtak-e.
- A felhasználónak pontosan fel kell sorolni a módosított vagy létrehozott fájlokat és az elvégzett ellenőrzéseket.
- Külön jelezni kell, hogy történt-e bármilyen változás az éles projektben. Alapértelmezés szerint ennek válasza: nem.
