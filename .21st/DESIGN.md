# LumiNails design context

## Current authority

The implemented 2026-10-10 TEST redesign is the current reference. Root `DESIGN.md` owns extracted design tokens and detailed patterns; `.impeccable/design.json` supplies previews and extensions. Source CSS is the runtime authority. The earlier Figma file and previous pink, cacao, sage and mist-teal directions are historical. There is no approved new design comp.

“Minimal studio” is a descriptive working name for the current implementation, not a new brand commitment.

## Core tokens

- Cobalt action `--ui-primary: #3155c6`; hover/link `--ui-accent-text: #2948a9`; pale selection `--ui-highlight: #eaf0ff`.
- Canvas `--ui-bg: #f5f6f9`; white surface `#ffffff`; support surface `--ui-soft: #edf1f7`.
- Ink `--ui-ink: #18212c`; muted text `--ui-muted: #596474`.
- Fine/strong public borders: `rgba(24, 33, 44, 0.16)` / `rgba(24, 33, 44, 0.34)`.
- Admin dark canvas `#121a28`, surface `#1b2638`, support `#27364d`, brand `#a9beff`, hover brand `#c8d6ff`, ink `#f7f9ff`, muted `#c5cedc`.
- Headings and body: DM Sans. Existing Lumi logo: Playfair Display.
- Shared card radius 16px, public control radius 8px, pill 999px. Preserved local geometry includes booking fields 14px, admin controls 11px, admin auth 12px and account buttons 10px.
- Shared public content width 1200px; gutter `clamp(20px, 4.3vw, 80px)`; section block `clamp(72px, 8vw, 112px)`. At 768px, section padding is 58px vertically and 20px horizontally.
- Public soft/button shadow and light workspace shadow: `none`. Local utility, focus and overlay exceptions remain; dark workspace shadow is `0 10px 30px rgba(0, 0, 0, 0.24)`.

## Patterns

- Full-width desktop homepage photograph with lower-left sans headline, a directional dark readability layer, factual location below H1, benefits and a compact gallery link.
- Mobile homepage hero: uncropped 16:9 contain image, compact left copy over one directional light layer, centered benefits on one translucent bottom strip, gallery row and separate actions below. Action columns are 1.25fr / 1fr.
- Contained portrait/text introduction; four image-top service cards, two at 900px and one at 768px.
- Flat homepage photo rail with three visible desktop images, one main mobile image and neighboring glimpses; arrows/count retain swipe and keyboard behavior.
- Gallery page: two columns, one at 640px; consistent caption treatment and retained lightbox.
- Service details: contained text/image layout with untinted 3:2 contain images, stacked on mobile; justified article copy without automatic hyphenation.
- Progressive booking, real service/date/time/data choices and retained account/guest paths; contained account authentication layout.
- One compact white public footer with contact, social, current booking-hours note and legal metadata.
- Admin: white desktop sidebar, grouped metrics and divided task panels; navy dark theme, mobile drawer at 900px and compact spacing at 640px.
- Decorative preheadings are hidden. A factual hero location line is retained below the main headline.

## Constraints

- Edit owning source CSS and rebuild generated bundles; keep public and admin ownership separate.
- Preserve existing workflows, real photos/prices/content sources and admin standalone PWA zoom policy.
- No `!important`, duplicate override layers, new framework or GitHub test jobs.
- Public mobile field text remains at least 16px, with `font-size-adjust: none` and 100% scaling; public zoom remains available.
- Preserve visible focus, state meaning and existing touch areas. Compact admin geometry is distinct from the public field rule.
- Respect reduced motion. Follow project-specific bounded checks in `docs/design-system.md`; current verification is recorded in `docs/redesign-checks.md`.
- LIVE changes require separate explicit approval.
