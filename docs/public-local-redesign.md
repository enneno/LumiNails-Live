# Teljes helyi publikus TEST-oldal

Aktuális cím: http://127.0.0.1:8101/. Indítás: npm run serve. A projekt a meglévő D:/Asztal/LumiNails_test mappában marad; nem készült új repository. Ebben a körben nem volt push, Cloudflare-közzététel vagy élesítés.

## Megvalósult változás

A külön kezdőlap/árlista látványpróba helyett a meglévő teljes alkalmazás saját HTML-, CSS- és JavaScript-forrásai módosultak. A foglalás, fiók, galéria és szolgáltatásrészletek eredeti helyi útvonalai megmaradnak; a belső menüpontok a helyi webhelyen maradnak. A build:site parancs újra a meglévő scripts/build-site.js teljes alkalmazásbuildjét futtatja. A korábbi design-preview csomag archivált referencia.

Világosabb, kisebb telítettségű mályva szerepszínek kerültek a publikus tokenekbe: halvány felületek, sötét szöveg, pasztell gombok és lábléc. A lábléc #dfc9d6, a szövege #3d3039. Az admin külön admin-v2.css állománya és palettája nem változott.

A kezdőlap a CMS-ben kezelt saját nyitóképet használja teljes képernyős cover kitöltéssel, olvasható sötét overlayen. Utána közvetlenül Szofi következik; a meglévő fiókajánló a foglalási felhívás elé került. A bemutatkozás kizárólag bekezdésekre tagolódott, szövege megmaradt. Az eredeti CMS-ből szerkeszthető képek, galériaválasztás és szövegek maradnak irányadók. A szolgáltatássorok és a galéria a teljes alkalmazás natív elemeivel készülnek.

Az árlista meglévő ár/idő DOM-szerkezetét megtartottuk: jobb oldalt az ár, közvetlenül alatta az időtartam. Az árak és elnevezések nem változtak. Az új CSS egyoszlopos, elválasztókkal tagolt listát ad.

## Ellenőrzések

- npm run build: sikeres; a style.css és script.js a forrásokból generálódott.
- npm run lint:css: sikeres.
- npm run public:css:check: sikeres, megmaradt az explicit komponensfelelősség.
- A módosított JavaScript-források szintaktikai ellenőrzése és git diff --check: sikeres.
- Célzott mobilos megtekintés 320/390px-en: a nyitó hero kitölti a fennmaradó viewportot, utána a bemutatkozás áll; a menüből a foglalás és a fiók helyi útvonalára jutottunk. 390px-es nyitó-, árlista- és foglalásképek készültek. A mobilos árlista az ár alatt mutatja az időt.
- A végső, célzott 1440px-es ellenőrzés: hero/sorrend, látható fejléc, mind a 19 árlistasor, ár alatti idő, helyben maradó foglalási/fióknavigáció, túlcsordulás és szkripthibák ellenőrzése sikeres. A menüpont az aktuális CMS-felirat helyett stabil belső útvonal alapján lett kiválasztva.
- A tényleges színpárok számított kontrasztja: lábléc 8,01:1; elsődleges gomb 7,41:1; fő törzsszöveg 11,87:1; másodlagos szöveg a lap alapszínén 6,79:1. Ez célzott színellenőrzés, nem teljes hozzáférhetőségi audit.
- A meglévő normál build csak olvasással lekérte a nyilvános Supabase-pillanatképet, majd 12 HTML-oldalt és 19 aktív szolgáltatást épített helyben a dist mappába. Sem a buildfolyamat adatkezelő kódja, sem az adatbázis nem módosult.

Bizonyítékok: .impeccable/review/native-local-20261028, gitignore alatt. Nem futott teljes tesztcsomag vagy nem érintett admin/PWA teszt. A böngészős ellenőrzés minden Supabase-adatmódosító kérését blokkoltuk; nem küldtünk be foglalást vagy e-mailt, és nem módosítottunk profilt. A helyi felület a meglévő közös Supabase-kapcsolatot használja; ez nem új, külön tesztadatbázis. A sikeres navigáció nem teljes éles foglalási tranzakcióteszt.

## Változott fájlok ebben a körben

- index.html — a natív kezdőlap szerkezete
- src/public/30-content-rendering.js — a bemutatkozás bekezdéseinek megjelenítése
- home-account-strip.js — meglévő fiókajánló helye
- src/styles/00-base.css — publikus pasztell mályva tokenek
- src/styles/11-price-page.css — árlista elrendezése, ár alatti idő megőrzésével
- src/styles/13-gallery-footer-navigation.css — pasztell lábléc
- src/styles/15-home-sections.css — bemutatkozás és szolgáltatások natív elrendezése
- src/styles/16-home-gallery.css — natív galéria kompozíciója
- src/styles/18-hero-inner-pages.css — teljes képernyős hero
- package.json — a teljes alkalmazás buildparancsának visszaállítása
- style.css — a build által generálva
- script.js — a build által generálva
- design-preview/README.md — a régi önálló látványpróba archiválásának jelölése
- docs/public-local-redesign.md — ez a jegyzőkönyv

A generált dist nincs Gitben. A meglévő üzleti tartalom pillanatképe, Supabase-konfiguráció, foglalás-/fióklogika, admin és PWA forrásai változatlanok. Az éles helyi projektet és az éles luminails.hu oldalt nem módosítottuk.

## Frissítés: késleltetés nélkül, 3,5-szeres sebességgel

A képsor balról jobbra, körkörösen halad. Az eredeti 28px/s sebesség helyett 98px/s van beállítva, azaz 3,5-szeres érték. Az újraindítás összes időzítője és a korábbi 1,2 másodperces várakozás is törölve lett. A húzás/swipe vége, a vízszintes beletekerés és a képnagyító bezárása után a következő animációs képkockától folytatódik a mozgás; nem kell elvinni az egeret vagy megszüntetni a fókuszt.

Továbbra sincs leállító gomb, lapozónyíl vagy görgetősáv. A kézi húzás és a képnagyítás megmaradt. Aktív húzás és nyitott nagyító közben, háttérbe tett lapon és látómezőn kívül áll a képsor; reduced-motion beállításnál nincs automatikus mozgás. A korábbi galéria/fiók közötti térköz változatlan.

Ebben a körben változott fájlok: src/public/45-home-gallery-carousel.js; a belőle generált script.js; tests/home-gallery-carousel.spec.js; docs/public-local-redesign.md. Nem módosult CSS, kép vagy HTML.

Ellenőrzés: npm run build, JavaScript-szintaxis és git diff --check sikeres. Csak a két közvetlenül érintett újraindulási/sebességteszt futott 390/1440px-en, mindkettő sikeres. A teszt már nem vár álló szakaszt; 650ms-on belül tényleges elmozdulást követel, így a korábbi 1200ms-os várakozással megbukna. A mért sebesség mobilon 96,7px/s, asztalon 96,2px/s; ez a képkockaidő mérési eltérésével megfelel a beállított 98px/s-nak. A mobilos swipe, asztali beletekerés és húzás, valamint a nagyító bezárása utáni azonnali újraindulás ellenőrizve, a képsoron maradó egérrel és fókusszal. A húzás végi véletlen képkattintást külön megakadályozó védelem megmaradt; ez nem késlelteti az animációt.

Bizonyíték: .impeccable/review/gallery-speed-35-20261028/results.json. Nem volt teljes tesztcsomag, új vizuális audit vagy fizikai készülékes teszt. A változatlan folyamatokat nem teszteltük újra rutinból.

Csak a helyi TEST-projekt változott. Nincs Git-push, Cloudflare-közzététel, éles módosítás vagy Supabase-adatírás.
