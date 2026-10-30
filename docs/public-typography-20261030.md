# Publikus tipográfia a Házirend mintájára

Helyi változtatás, 2026-10-30. A Házirend korábbi főcímének és szakaszcímeinek megjelenése a referencia. A közös publikus címsorok Playfair Display betűtípust kapnak, a fő szövegek DM Sans betűvel jelennek meg.

- Főcím: `clamp(68px, 9vw, 116px)`, 600-as súly, 0,9-es sorköz, −0,045 em betűköz.
- Szakasz- és kártyacímek: `clamp(1.2rem, 3vw, 1.5rem)`, 600-as súly, 1,25-ös sorköz; a Házirend eredeti alcímével megegyezően.
- A fő folyószöveg a meglévő közös törzsszöveg-szerepet használja: mobilon 16 px, asztalon 18 px, 1,75-ös sorköz. Az árlista sorai és a fő bevezető szövegek is ezt követik.
- A címsorok oldalspecifikus betűtípus-, méret-, súly- és sorközfelülírásai megszűntek. Az eredeti komponensszabályok a térközökért, színekért és elrendezésért felelnek továbbra is.
- A hosszú főcímek kis képernyőn törhetnek. A publikus címsor-tokenek a `body:not(.admin-body)` környezetre korlátozottak. A navigációs és űrlapvezérlők betűcsaládja, illetve az admin önálló tipográfiája megmaradt.

## Pontos fájlkör

Módosított irányadó források:

- `src/styles/00-base.css`
- `src/styles/11-price-page.css`
- `src/styles/12-legal.css`
- `src/styles/13-gallery-footer-navigation.css`
- `src/styles/13-house-rules.css`
- `src/styles/15-home-sections.css`
- `src/styles/16-home-gallery.css`
- `src/styles/18-hero-inner-pages.css`
- `src/styles/19-service-detail.css`
- `src/styles/25-customer-account.css`
- `src/styles/25-error-page.css`
- `src/styles/30-booking.css`
- `home-account-strip.css`

Újragenerált csomag: `style.css`.

Kizárólag a CSS assetverziója változott ezekben a HTML-fájlokban: `404.html`, `index.html`, `adatkezeles/index.html`, `arlista/index.html`, `fiokom/index.html`, `foglalas/index.html`, `galeria/index.html`, `gel-lakk-tatabanya/index.html`, `hazirend/index.html`, `korom-diszites-nail-art-tatabanya/index.html`, `manikur-tatabanya/index.html`, `mukorom-epites-toltes/index.html`.

Új jelentés: `docs/public-typography-20261030.md`.

## Ellenőrzés

- Git-állapot és végső diff, `git diff --check`.
- `npm run lint:css`, `npm run build`, `npm run public:css:check`: sikeres.
- A korábbi Házirend CSS-ét a Git HEAD-ből csak a helyi QA-böngésző kérésében helyettesítettük, és megmértük a referenciát. A referenciafájlokat nem írtuk át.
- Chromiumban 390 és 1280 px-en az árlista, a galéria, a foglalás, a főoldal, egy szolgáltatásoldal és a Házirend címsorainak számított stílusai egyeztek a referenciafőcímmel. Az árlista csoportcímei a Házirend alcímeivel egyeztek; a Házirend saját stílusa változatlan maradt. A címsoroknál nem találtunk vízszintes túlcsordulást. A kiértékelés eredménye: `local-backups/public-typography-qa-20261030.json`.
- WebKitben 320 és 390 px-en az árlista, a hosszú körömdíszítés-szolgáltatáscím és az adatkezelési oldal címei rendben voltak; a jogi szöveg betűmérete is a Házirendével egyezett. A 1280 px-es címméret böngészős kerekítési eltérését 0,01 px tűréssel kezeltük; a kezdeti túl szigorú szöveges méret-összehasonlítás után csak ezt és az adminellenőrzést futtattuk újra.
- Az admin látható címeinek és gombjainak számított betűcsaládja és betűmérete a korábbi és az új közös CSS-sel azonos.
- Mobilos és asztali képek vizuálisan átnézve: `.impeccable/review/typography-*.png`. Ez böngészős emuláció, fizikai iPhone-ellenőrzés nem történt. A QA-környezetben a Supabase-kérések tiltva voltak; a tárhelyen lévő képek is blokkolva lehettek, képet vagy képbeállítást nem változtattunk.
- A helyi mobilos előnézet `http://192.168.0.244:8103/arlista/`, HTTP 200, azonos Wi-Fi szükséges.

Tartalom, szolgáltatási ár, foglalás, hitelesítés és mentési logika nem változott. Éles projektmódosítás, adatbázis-módosítás, GitHub-push és közzététel nem történt.
