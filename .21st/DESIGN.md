# LumiNails current homepage design context

## Authority

2026-10-11: the user requested a redesign of the hero, the text above it, the homepage gallery and service icons, retaining content and colors. This supersedes the prior first/A homepage composition. Work is local TEST only. Full committed TEST source was recovered read-only from D:/Asztal/LumiNails_test into the current C:/Users/llevi/OneDrive/Asztali gép/LumiNails_test workspace; the donor checkout is unchanged.

## Retained system

- Ivory #F6F3EE, beige #E2D9D0, taupe #B8A89B, decorative clay #A08075, charcoal #3E3935. Existing semantic colors are unchanged.
- DM Sans content and compact homepage section links; Playfair Display wordmark. Existing condensed service headings are retained.
- 1200px content width and shared responsive gutters. 16px photograph/icon corners, 8px action corners.
- All CMS copy, hero photograph, five selected gallery photographs, portrait, service facts and destinations are retained. Booking/account/admin, legal copy and SEO metadata are unchanged.

## Homepage composition

- Compact beige notice above the utility header, with the complete existing message and measured sticky clearance.
- Desktop: readable copy and booking action beside a framed photograph. Phone: copy then uncropped 16:9 photograph.
- Munkák / Szolgáltatások / Szofi are compact beige section links below the hero; dark hover/current highlighting replaces decorative arrows. Munkák links to the now-independent portfolio section.
- Five photographs in a mosaic: one featured image and four secondary images. Mobile: featured image above two columns. Real image links remain usable without JavaScript.
- Shared gallery viewer supports arrows, Escape, focus containment/restoration and swipe. Home photographs predecode before opening; failures preserve the previous image and expose a retry message.
- Three local Phosphor regular SVG icons (hand, paint brush, scissors) and an IconPark nail-polish bottle SVG. Icons use charcoal on beige. Licenses: licenses/phosphor-icons.txt and licenses/iconpark.txt. Public pages no longer use Icons8; the footer credits VibeWeb with a link to https://vibeweb.hu/.
- Compact page/section rhythm: 32–48px desktop and 28px phone section padding. Gallery thumbnails use four/three/two columns, with 14px/12px captions below the photos.
- Menu, shared image viewer and booking confirmation use one scroll-lock owner; closing the last overlay restores the saved position. The sticky homepage header stays visible while locked.

## Source ownership and verification

- src/styles/18-hero-inner-pages.css: hero and section navigation.
- src/styles/16-home-gallery.css: gallery mosaic and image controls.
- src/styles/15-home-sections.css: notice and existing service rows/icons.
- src/public/45-home-gallery-carousel.js: home viewer integration/predecode.
- src/public/50-gallery-ui.js: shared viewer selects home images too.
- src/public/30-content-rendering.js: same icons in live CMS rendering and prerender.

Edit source files and rebuild generated CSS/JS. Preserve focus, public zoom and reduced motion. Verification and the complete change manifest: docs/home-redesign-2026-10-11.md. The original DESIGN.md snapshot is historical where it describes the replaced homepage.
