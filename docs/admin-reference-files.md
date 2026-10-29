# LumiNails admin – pontos helyi fájllista

A teljes adminátalakítás jelenlegi TEST-változásai a Git HEAD-hez képest. A lista a korábbi admin-iterációk megtartott módosításait is tartalmazza; a korábban meglévő `.impeccable/mocks/` látványtervek nem részei ennek az átadásnak.

125 módosított vagy új fájl. Az éles projekt, a publikus oldal, a távoli adatbázis és a PWA nagyítási szabálya változatlan. Nincs commit, push vagy közzététel.

Az aktív felület a `src/admin-reference/` forrásból épülő `admin-reference.css` és `admin-reference.js`. A régi `src/admin-styles/` és `admin-v2.css` megmaradt a munkapéldányban, de az admin HTML nem tölti be ezt a CSS-t. A saját adatkezelők az új adapteren keresztül tovább működnek.

Korábbi forrásátvételi ellenőrzés: 27/27 admineset sikeres volt. A későbbi mobiljavítás hét célzott ellenőrzése is sikeres, lásd [admin-mobile-fixes.md](D:/Asztal/LumiNails_test/docs/admin-mobile-fixes.md); build-ellenőrzés, forrás-CSS lint, aktív CSS elkülönítés és Git whitespace-ellenőrzés sikeres. A teljes statikus oldalellenőrző húsz, már előtte meglévő publikus CSS/JS-verzióhivatkozást jelez. Ezeket a jelenlegi adminfeladat nem módosította. A WebKit és érintésemuláció nem valódi iPhone-billentyűzetteszt.

A teljes mobilos/asztali forrás-összevetés és a legutóbbi javítások részletei: [admin-full-review.md](D:/Asztal/LumiNails_test/docs/admin-full-review.md).

A belépési görgetés és az eredeti havi beosztás visszaállítása: [admin-schedule-restoration.md](D:/Asztal/LumiNails_test/docs/admin-schedule-restoration.md).

A naptárközpontú szerkesztő kialakítása: [admin-schedule-panels.md](D:/Asztal/LumiNails_test/docs/admin-schedule-panels.md).

| Fájl | Állapot |
| --- | --- |
| [.impeccable/design.json](D:/Asztal/LumiNails_test/.impeccable/design.json) | módosított |
| [DESIGN.md](D:/Asztal/LumiNails_test/DESIGN.md) | módosított |
| [PRODUCT.md](D:/Asztal/LumiNails_test/PRODUCT.md) | módosított |
| [admin-content.js](D:/Asztal/LumiNails_test/admin-content.js) | módosított |
| [admin-reference.css](D:/Asztal/LumiNails_test/admin-reference.css) | új |
| [admin-reference.js](D:/Asztal/LumiNails_test/admin-reference.js) | új |
| [admin-supabase.js](D:/Asztal/LumiNails_test/admin-supabase.js) | módosított |
| [admin-v2.css](D:/Asztal/LumiNails_test/admin-v2.css) | módosított |
| [admin/index.html](D:/Asztal/LumiNails_test/admin/index.html) | módosított |
| [docs/admin-full-review.md](D:/Asztal/LumiNails_test/docs/admin-full-review.md) | új |
| [docs/admin-mobile-fixes.md](D:/Asztal/LumiNails_test/docs/admin-mobile-fixes.md) | új |
| [docs/admin-reference-files.md](D:/Asztal/LumiNails_test/docs/admin-reference-files.md) | új |
| [docs/admin-schedule-panels.md](D:/Asztal/LumiNails_test/docs/admin-schedule-panels.md) | új |
| [docs/admin-schedule-restoration.md](D:/Asztal/LumiNails_test/docs/admin-schedule-restoration.md) | új |
| [docs/admin-studio-direction.md](D:/Asztal/LumiNails_test/docs/admin-studio-direction.md) | új |
| [docs/admin-studio-local.md](D:/Asztal/LumiNails_test/docs/admin-studio-local.md) | új |
| [package-lock.json](D:/Asztal/LumiNails_test/package-lock.json) | módosított |
| [package.json](D:/Asztal/LumiNails_test/package.json) | módosított |
| [playwright.admin.config.js](D:/Asztal/LumiNails_test/playwright.admin.config.js) | új |
| [scripts/admin-css-isolation.js](D:/Asztal/LumiNails_test/scripts/admin-css-isolation.js) | módosított |
| [scripts/build-admin-reference.js](D:/Asztal/LumiNails_test/scripts/build-admin-reference.js) | új |
| [scripts/build-assets.js](D:/Asztal/LumiNails_test/scripts/build-assets.js) | módosított |
| [scripts/check-site.js](D:/Asztal/LumiNails_test/scripts/check-site.js) | módosított |
| [scripts/public-files.js](D:/Asztal/LumiNails_test/scripts/public-files.js) | módosított |
| [scripts/run-admin-tests.js](D:/Asztal/LumiNails_test/scripts/run-admin-tests.js) | új |
| [scripts/update-asset-versions.js](D:/Asztal/LumiNails_test/scripts/update-asset-versions.js) | módosított |
| [src/admin-reference/adapters/image.tsx](D:/Asztal/LumiNails_test/src/admin-reference/adapters/image.tsx) | új |
| [src/admin-reference/adapters/navigation.ts](D:/Asztal/LumiNails_test/src/admin-reference/adapters/navigation.ts) | új |
| [src/admin-reference/app/admin/viewport.module.css](D:/Asztal/LumiNails_test/src/admin-reference/app/admin/viewport.module.css) | új |
| [src/admin-reference/components/admin-appearance.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-appearance.tsx) | új |
| [src/admin-reference/components/admin-auto-textarea.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-auto-textarea.tsx) | új |
| [src/admin-reference/components/admin-bookings-tab.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-bookings-tab.tsx) | új |
| [src/admin-reference/components/admin-detail-row.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-detail-row.tsx) | új |
| [src/admin-reference/components/admin-duration-input.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-duration-input.tsx) | új |
| [src/admin-reference/components/admin-editor-sheet.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-editor-sheet.tsx) | új |
| [src/admin-reference/components/admin-feedback.module.css](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-feedback.module.css) | új |
| [src/admin-reference/components/admin-feedback.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-feedback.tsx) | új |
| [src/admin-reference/components/admin-gallery-tab.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-gallery-tab.tsx) | új |
| [src/admin-reference/components/admin-icon.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-icon.tsx) | új |
| [src/admin-reference/components/admin-list-pagination.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-list-pagination.tsx) | új |
| [src/admin-reference/components/admin-loading-state.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-loading-state.tsx) | új |
| [src/admin-reference/components/admin-login-form.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-login-form.tsx) | új |
| [src/admin-reference/components/admin-manual-booking-sheet.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-manual-booking-sheet.tsx) | új |
| [src/admin-reference/components/admin-overlays.module.css](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-overlays.module.css) | új |
| [src/admin-reference/components/admin-overview.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-overview.tsx) | új |
| [src/admin-reference/components/admin-price-input.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-price-input.tsx) | új |
| [src/admin-reference/components/admin-prices-tab.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-prices-tab.tsx) | új |
| [src/admin-reference/components/admin-search-input.module.css](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-search-input.module.css) | új |
| [src/admin-reference/components/admin-search-input.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-search-input.tsx) | új |
| [src/admin-reference/components/admin-select-menu.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-select-menu.tsx) | új |
| [src/admin-reference/components/admin-sortable.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-sortable.tsx) | új |
| [src/admin-reference/components/admin-studio.module.css](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-studio.module.css) | új |
| [src/admin-reference/components/admin-temporal-input.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-temporal-input.tsx) | új |
| [src/admin-reference/components/admin-ui.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-ui.tsx) | új |
| [src/admin-reference/components/admin-viewport-bridge.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-viewport-bridge.tsx) | új |
| [src/admin-reference/components/admin-week-calendar-mobile.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-week-calendar-mobile.tsx) | új |
| [src/admin-reference/components/admin-week-calendar.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-week-calendar.tsx) | új |
| [src/admin-reference/components/admin-week-picker.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/admin-week-picker.tsx) | új |
| [src/admin-reference/components/list-pagination.tsx](D:/Asztal/LumiNails_test/src/admin-reference/components/list-pagination.tsx) | új |
| [src/admin-reference/components/use-browser-search.ts](D:/Asztal/LumiNails_test/src/admin-reference/components/use-browser-search.ts) | új |
| [src/admin-reference/components/use-dialog-alert-visibility.ts](D:/Asztal/LumiNails_test/src/admin-reference/components/use-dialog-alert-visibility.ts) | új |
| [src/admin-reference/components/use-horizontal-swipe.ts](D:/Asztal/LumiNails_test/src/admin-reference/components/use-horizontal-swipe.ts) | új |
| [src/admin-reference/data/site-content.ts](D:/Asztal/LumiNails_test/src/admin-reference/data/site-content.ts) | új |
| [src/admin-reference/extensions.tsx](D:/Asztal/LumiNails_test/src/admin-reference/extensions.tsx) | új |
| [src/admin-reference/lib/admin-appearance.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/admin-appearance.ts) | új |
| [src/admin-reference/lib/admin-bookings.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/admin-bookings.ts) | új |
| [src/admin-reference/lib/admin-focus.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/admin-focus.ts) | új |
| [src/admin-reference/lib/admin-image-summary.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/admin-image-summary.ts) | új |
| [src/admin-reference/lib/admin-navigation.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/admin-navigation.ts) | új |
| [src/admin-reference/lib/admin-revenue.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/admin-revenue.ts) | új |
| [src/admin-reference/lib/admin-studio-draft.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/admin-studio-draft.ts) | új |
| [src/admin-reference/lib/admin-week-calendar-time.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/admin-week-calendar-time.ts) | új |
| [src/admin-reference/lib/booking-status.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/booking-status.ts) | új |
| [src/admin-reference/lib/clipboard.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/clipboard.ts) | új |
| [src/admin-reference/lib/gallery.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/gallery.ts) | új |
| [src/admin-reference/lib/hungarian-phone.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/hungarian-phone.ts) | új |
| [src/admin-reference/lib/list-order.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/list-order.ts) | új |
| [src/admin-reference/lib/price-format.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/price-format.ts) | új |
| [src/admin-reference/lib/service-catalog.ts](D:/Asztal/LumiNails_test/src/admin-reference/lib/service-catalog.ts) | új |
| [src/admin-reference/login.tsx](D:/Asztal/LumiNails_test/src/admin-reference/login.tsx) | új |
| [src/admin-reference/main.tsx](D:/Asztal/LumiNails_test/src/admin-reference/main.tsx) | új |
| [src/admin-reference/model.ts](D:/Asztal/LumiNails_test/src/admin-reference/model.ts) | új |
| [src/admin-reference/panels.tsx](D:/Asztal/LumiNails_test/src/admin-reference/panels.tsx) | új |
| [src/admin-reference/reference-source.json](D:/Asztal/LumiNails_test/src/admin-reference/reference-source.json) | új |
| [src/admin-reference/schedule-panel.tsx](D:/Asztal/LumiNails_test/src/admin-reference/schedule-panel.tsx) | új |
| [src/admin-reference/studio.tsx](D:/Asztal/LumiNails_test/src/admin-reference/studio.tsx) | új |
| [src/admin-reference/styles.css](D:/Asztal/LumiNails_test/src/admin-reference/styles.css) | új |
| [src/admin-styles/00-foundation.css](D:/Asztal/LumiNails_test/src/admin-styles/00-foundation.css) | módosított |
| [src/admin-styles/10-components.css](D:/Asztal/LumiNails_test/src/admin-styles/10-components.css) | módosított |
| [src/admin-styles/20-workspace.css](D:/Asztal/LumiNails_test/src/admin-styles/20-workspace.css) | módosított |
| [src/admin-styles/25-editor-sheet.css](D:/Asztal/LumiNails_test/src/admin-styles/25-editor-sheet.css) | új |
| [src/admin-styles/30-bookings.css](D:/Asztal/LumiNails_test/src/admin-styles/30-bookings.css) | módosított |
| [src/admin-styles/40-content-editor.css](D:/Asztal/LumiNails_test/src/admin-styles/40-content-editor.css) | módosított |
| [src/admin-styles/42-cms-image-controls.css](D:/Asztal/LumiNails_test/src/admin-styles/42-cms-image-controls.css) | módosított |
| [src/admin-styles/45-gallery-editor.css](D:/Asztal/LumiNails_test/src/admin-styles/45-gallery-editor.css) | módosított |
| [src/admin-styles/50-services.css](D:/Asztal/LumiNails_test/src/admin-styles/50-services.css) | módosított |
| [src/admin-styles/52-price-calculator.css](D:/Asztal/LumiNails_test/src/admin-styles/52-price-calculator.css) | módosított |
| [src/admin-styles/60-coupons.css](D:/Asztal/LumiNails_test/src/admin-styles/60-coupons.css) | módosított |
| [src/admin-styles/70-availability.css](D:/Asztal/LumiNails_test/src/admin-styles/70-availability.css) | módosított |
| [src/admin-styles/80-communications.css](D:/Asztal/LumiNails_test/src/admin-styles/80-communications.css) | módosított |
| [src/admin-styles/90-customers.css](D:/Asztal/LumiNails_test/src/admin-styles/90-customers.css) | módosított |
| [src/admin-styles/95-pwa.css](D:/Asztal/LumiNails_test/src/admin-styles/95-pwa.css) | módosított |
| [src/admin/00-bootstrap-auth-calendar.js](D:/Asztal/LumiNails_test/src/admin/00-bootstrap-auth-calendar.js) | módosított |
| [src/admin/02-request-cache.js](D:/Asztal/LumiNails_test/src/admin/02-request-cache.js) | módosított |
| [src/admin/05-admin-workspace-v2.js](D:/Asztal/LumiNails_test/src/admin/05-admin-workspace-v2.js) | módosított |
| [src/admin/07-editor-sheet.js](D:/Asztal/LumiNails_test/src/admin/07-editor-sheet.js) | új |
| [src/admin/08-admin-studio-ui.js](D:/Asztal/LumiNails_test/src/admin/08-admin-studio-ui.js) | új |
| [src/admin/09-admin-controls.js](D:/Asztal/LumiNails_test/src/admin/09-admin-controls.js) | új |
| [src/admin/10-bookings-events.js](D:/Asztal/LumiNails_test/src/admin/10-bookings-events.js) | módosított |
| [src/admin/12-customer-profiles.js](D:/Asztal/LumiNails_test/src/admin/12-customer-profiles.js) | módosított |
| [src/admin/15-bookings-calendar.js](D:/Asztal/LumiNails_test/src/admin/15-bookings-calendar.js) | módosított |
| [src/admin/16-admin-interactions.js](D:/Asztal/LumiNails_test/src/admin/16-admin-interactions.js) | új |
| [src/admin/20-services.js](D:/Asztal/LumiNails_test/src/admin/20-services.js) | módosított |
| [src/admin/30-coupons.js](D:/Asztal/LumiNails_test/src/admin/30-coupons.js) | módosított |
| [src/admin/35-reference-backend.js](D:/Asztal/LumiNails_test/src/admin/35-reference-backend.js) | új |
| [src/admin/40-availability-settings.js](D:/Asztal/LumiNails_test/src/admin/40-availability-settings.js) | módosított |
| [src/admin/45-gallery-workspace.js](D:/Asztal/LumiNails_test/src/admin/45-gallery-workspace.js) | módosított |
| [src/admin/46-cms-image-workspace.js](D:/Asztal/LumiNails_test/src/admin/46-cms-image-workspace.js) | módosított |
| [src/admin/47-booking-card-click.js](D:/Asztal/LumiNails_test/src/admin/47-booking-card-click.js) | módosított |
| [stylelint.config.mjs](D:/Asztal/LumiNails_test/stylelint.config.mjs) | módosított |
| [tests/admin-mobile-fixes.spec.js](D:/Asztal/LumiNails_test/tests/admin-mobile-fixes.spec.js) | új |
| [tests/admin-production-redesign.spec.js](D:/Asztal/LumiNails_test/tests/admin-production-redesign.spec.js) | módosított |
| [tests/admin-reference-contract.spec.js](D:/Asztal/LumiNails_test/tests/admin-reference-contract.spec.js) | új |
| [tests/admin-reference.spec.js](D:/Asztal/LumiNails_test/tests/admin-reference.spec.js) | új |
| [tests/helpers/admin-reference-boundary.js](D:/Asztal/LumiNails_test/tests/helpers/admin-reference-boundary.js) | új |
