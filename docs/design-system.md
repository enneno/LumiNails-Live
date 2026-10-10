# LumiNails design system

A TEST aktuális vizuális szerződése a 2026-10-10-i, kódban megvalósított minimalista áttervezés. A részletes tokenek és minták a gyökér `DESIGN.md` fájlban, a megjeleníthető komponensek és kiegészítések a `.impeccable/design.json` fájlban élnek. A korábbi Figma-, rózsaszín-, barna-, zsálya- és kékeszöld irány történeti referencia. Új, jóváhagyott látványterv nem készült.

## Források és felelősség

- Publikus tokenek, fejléc, közös gomb- és mezőalap: `src/styles/00-base.css`.
- Kezdőlapi szekciók: `15-home-sections.css`; galériasín: `16-home-gallery.css`; hero: `18-hero-inner-pages.css`.
- Publikus galéria, footer és mobilmenü: `13-gallery-footer-navigation.css`; szolgáltatásoldal: `19-service-detail.css`; fiók: `25-customer-account.css`; foglalás: `30-booking.css`.
- A közös footer markupja: `src/html/site-footer.html`; ezt a `scripts/prerender-public.js` írja az oldalak HTML-jébe. A footerben a fő navigáció és a négy szolgáltatásoldal is szerepel, mobilon tördelődő, legalább 44px magas linkekkel.
- Admin alap-tokenek: `src/admin-styles/00-foundation.css`; közös vezérlőgeometria: `10-components.css`; workspace és light/dark téma: `20-workspace.css`.
- A `style.css` és `admin-v2.css` generált fájl. Forrásból építendő, közvetlenül nem szerkeszthető.
- Egy komponens alapmegjelenésének egy tulajdonosa legyen; tilos az `!important` és a duplikált override-réteg.

## Aktuális irány

Kobalt műveletek, fehér felületek, hűvös szürke háttér és tintaszínű szöveg. A címek és a törzsszöveg DM Sans; Playfair Display csak a meglévő Lumi logóban marad. Az admin sötét témája sötétkék felületeket és világoskék műveleteket használ. A szemantikus tokent kell követni, nem a megőrzött régi változónevek színre utaló elnevezését.

A desktop kezdőlap teljes szélességű fotós herót, közös tartalomszélességbe fogott bemutatkozást, négy képfejes szolgáltatáskártyát, lapos háromképes galériasínt és tömör fehér footert használ. Az admin fehér navigációt és egy közös konténerbe rendezett mérőszámokat kapott. A valós képek, árak, foglalások és működési folyamatok megmaradnak.

A közös kártyasugár 16px, a publikus vezérlő 8px. A meglévő helyi geometria kivétel: foglalási mezősugár 14px, admin vezérlő 11px, admin belépési vezérlő 12px, fiókgomb 10px. Ezek nem új általános sugárlépcsők. A közös publikus soft shadow és világos workspace shadow `none`; néhány utility, fókusz, állapot és overlay korábbi helyi árnyéka/színe megmarad.

## Mobil és hozzáférhetőség

- Publikus fő töréspont: 768px. A szolgáltatáskártyák 900px alatt két, 768px alatt egy oszlopba kerülnek. A galériaoldal 640px alatt egyoszlopos.
- A mobil hero képe teljes szélességű, pontosan 16:9 és `object-fit: contain`: nincs vágás vagy zoom. Bal oldali szöveg, egy irányított világos olvashatósági réteg, közös alsó előnysáv, majd a galériához vezető sor és külön akciósor; az akciók aránya 1.25fr / 1fr.
- A publikus mobil mezőszöveg legalább 16px, `font-size-adjust: none` és 100%-os szövegskálázás mellett. A 14px-es foglalási mezősugár nem betűméret. A publikus oldal nagyítható.
- Az admin 900px alatt oldalsó fiókba vált; a fióknak saját görgetése és safe-area térköze van. A kompakt gombok megtartják a 44px-es kiterjesztett érintési területet; a fejléc ikonjai 44px-esek. A meglévő admin mező- és optikai szabályok külön tulajdonoshoz tartoznak.
- Az admin standalone PWA szándékos nagyítási tilalma megmarad.
- Látható fókusz, kapcsolt hibaüzenet, szöveges/ikonos állapotjelzés és reduced-motion kezelés szükséges. Képes szövegréteget kézzel is ellenőrizni kell.
- A footer és a foglalási bevezető közös aktuális nyitvatartás-adatot használ, a szabad időpontokra vonatkozó figyelmeztetéssel együtt.

## Módosítás utáni minimum

1. Git-diff és a CSS-tulajdon ellenőrzése.
2. Forrás-CSS változásakor `npm run lint:css`, majd forrásból build.
3. Az érintett desktop és mobil felület célzott vizuális ellenőrzése.
4. Működési vagy hozzáférhetőségi változáskor a közvetlenül érintett helyi ellenőrzés.

A mostani redesign ellenőrzéseinek tényleges köre a `docs/redesign-checks.md` fájlban található; ez a vizuális szerződés nem teljes akadálymentességi tanúsítás és nem állít fizikai Safari-tesztet. A LIVE kiadás külön, kifejezett jóváhagyást igényel.
