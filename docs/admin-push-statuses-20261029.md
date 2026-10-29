# Admin: külön push-kapcsolók, részletes értesítések és foglalási státuszok

Helyi változat, 2026-10-29. GitHub-push, Cloudflare-kiadás, Supabase-migráció és Edge Function-telepítés ebben a munkakörben nem történt. A közös éles adatbázisban nem módosítottunk adatot.

## Elkészült működés

- A Golden Shine `admin-pwa-controls.tsx` kártyájának elrendezésével külön kapcsolható az új foglalás, vendéglemondás, új regisztráció és foglalási e-mail hiba telefonos jelzése. A kapcsolók a felső Mentés gombbal menthetők; sikertelen mentésnél a piszkozat megmarad. A készülék feliratkozása és a saját eszközre küldött próba külön művelet. A csengő értesítéseit ezek a kapcsolók nem némítják el.
- A foglalási értesítés neve, időpontja, szolgáltatása és elérhetősége a foglalási rekordból származik. A regisztrációs értesítés a valódi fiókazonosítóhoz kapcsolt névvel, e-maillel és telefonnal jelenik meg. A regisztráció továbbra is nyitott; nincs jóváhagyási lépés. A csengő megnyitása friss adatot kér; a háttérben egymáshoz közeli listaigényeket összevonjuk és rövid ideig újrahasználjuk.
- A kézi időpontnál külön választható és menthető az „Általam lemondva” és „Vendég mondta le”. A „Nem jelent meg” a referencia szerint csak véget ért időpontnál választható, vagy ha már ez az állapota. Az online vendéglemondás a vendég művelete után jelenik meg; a normál online foglalás állapotválasztójában az admin saját lemondást választ. A fizetett összeghez kötött automatikus teljesítés megmarad.
- A helyi SQL-forrás kibővíti a két státuszkorlátozást és az atomikus adminmentést, frissíti a két szabadidősáv-függvényt és a havi összesítést. Nem ír át meglévő tartalmat, foglalást, profilt vagy jogosultságot. A korábban már `cancelled_by_customer` értékkel mentett kézi lemondásokat nem sorolja át találgatás alapján.
- A push-kategóriák szűrése a szerveren is megtörténik. A saját adminmódosítás és a saját lemondás nem vendégesemény. Új regisztráció és tartós e-mail hiba saját push-kategóriát kap; e-mail hibák továbbra sem kerülnek a csengőbe. Regisztrációs és hibajelzési webhookba csak azonosító kerül, a részleteket az Edge Function olvassa ki. A készülékkezelés érvényes JWT-t és aktuális `is_lumi_admin()` jogosultságot ellenőriz. A próba csak a belépett admin megadott, aktív saját eszközére küldhető.

## Előnézet és még nem aktív szerverváltozások

- Asztali előnézet: <http://127.0.0.1:8101/admin/?tab=settings>
- Mobil, azonos Wi-Fi-n: <http://192.168.0.244:8103/admin/?tab=settings>
- Mindkét cím HTTP 200 választ adott. A mobilos HTTP-kapcsolat valódi Web Pushhoz nem biztonságos környezet; a megjelenés és a kapcsolók ellenőrizhetők, valódi háttérértesítést HTTPS-es, támogatott környezetben lehet ellenőrizni.
- A közös éles Supabase jelenleg még a korábbi státuszkorlátozásokat és push-küldőt használja. Az új kézi saját lemondás / nem jelent meg státusz valódi mentéséhez, valamint a kategóriaszűréshez külön élesítés szükséges. A helyi ellenőrzések PGlite-ot és szintetikus határfelületeket használtak; valós foglalást nem mentettünk és valódi push nem ment ki.
- Kiadáskor az aktív forrást ismét össze kell vetni: `send-web-push`, `web-push-subscription`, `process-booking-notifications`. Az első kettő helyi kiinduló forrása egyezett az aktív kóddal; az utóbbin kizárólag a kézi saját lemondások összesítését egészítettük ki. A `supabase-admin-push-statuses.sql` a már aktív `supabase-admin-error-logs.sql` állapotára épül. A szerverváltozások után kerülhet ki a kliens. Ez nem jelent kiadási jóváhagyást.

## Ellenőrzések

- 13 külön célzott WebKit-eset sikeres: 3 referencia-/asset-szerződés, online lemondás és e-mail elkülönítése, kézi státuszok, push-kapcsolók, továbbá 7 értesítési eset (nyugtázás, tartós olvasottság, hibás mentés, újabb lemondás, regisztráció, megerősítés utáni deduplikáció, üres állapot). A két első körös hibát szűken javítottuk: a teszt mobilmenü-választását és a csengő újranyitásakor szükséges friss lekérést. Csak az érintett esetek futottak újra.
- 3 PGlite-eset sikeres: státuszmentés/visszaolvasás, idempotencia és eredeti adatok megőrzése; szabad idősáv és havi összesítés; jövőbeli nem jelent meg elutasítása; atomikus visszagörgetés és online ütközésvédelem; adminellenőrzés; push-triggerek és sikertelen push mellett is megmaradó regisztráció.
- 3 Edge Function-eset sikeres az igazi handlerek helyettesített adat-/push-határával: mind a négy kategória szerveres szűrése és adattartalma; webhookhitelesítés és hibakezelés; JWT / aktuális adminjog, nyilvános kulcsot visszaadó konfiguráció és saját eszközre korlátozott próba.
- A kapcsolókat 320, 390 és 1280 pixel szélességen, a részletes értesítéseket 320/390 pixelen ellenőriztük; nincs vízszintes oldaltúlcsordulás. A mobilos és asztali képeket vizuálisan is átnéztük.
- `npm run build` és a végső `npm run build:check` sikeres. Forrás-CSS nem változott; a Tailwind generált CSS-e az új osztályok miatt frissült. A kártya JSX-e és a közös referencia-CSS érintetlen maradt. A Git-diff és az admin assetverziók ellenőrizve.

## Módosított és létrehozott fájlok

Forráskód:

- `src/admin-reference/components/admin-bookings-tab.tsx`
- `src/admin-reference/extensions.tsx`
- `src/admin-reference/lib/admin-notifications.ts`
- `src/admin-reference/reference-source.json`
- `src/admin-reference/studio.tsx`
- `src/admin/05-admin-workspace-v2.js`
- `src/admin/08-admin-studio-ui.js`
- `src/admin/10-bookings-events.js`
- `src/admin/15-bookings-calendar.js`
- `src/admin/35-reference-backend.js`
- `src/admin/40-availability-settings.js`
- `pwa.js`
- `supabase/functions/_shared/admin-push-policy.mjs` (új)
- `supabase/functions/send-web-push/index.ts`
- `supabase/functions/web-push-subscription/index.ts`
- `supabase/functions/process-booking-notifications/index.ts`
- `supabase-admin-push-statuses.sql` (új, nincs alkalmazva)

Generált csomagok és admin hivatkozások:

- `admin-reference.js`
- `admin-reference.css`
- `admin-supabase.js`
- `admin/index.html`

Ellenőrzés és dokumentáció:

- `tests/admin-reference.spec.js`
- `tests/admin-mobile-fixes.spec.js`
- `tests/helpers/admin-reference-boundary.js`
- `tests/unit/admin-push-edge.test.mjs` (új)
- `tests/unit/admin-push-status-sql.test.mjs` (új)
- `docs/admin-push-statuses-20261029.md` (ez a fájl, új)

A korábban, külön felhasználói kérésre módosított `AGENTS.md` megmaradt; ebben a javítási körben nem szerkesztettük. A régi `.impeccable/mocks/` fájlokat nem módosítottuk. Az ellenőrzési képek és az aktív források összevetéséhez használt másolatok a Git által figyelmen kívül hagyott `.impeccable/review/`, illetve `local-backups/` mappába kerültek.
