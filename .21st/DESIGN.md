# LumiNails design context

## Current authority

Local implementation of the user-approved first/A studio comp, using the own CMS hero and existing five gallery photographs. Palette: Ivory & Taupe. Root `DESIGN.md` records the built system; `.impeccable/design.json` contains previews/extensions. CSS is runtime truth. Earlier Figma/cobalt/dusty-rose/champagne-only layouts are historical. No commit, push or LIVE deployment.

## Core tokens

- Ivory canvas/surface #F6F3EE; beige actions/support #E2D9D0; taupe edges #B8A89B; decorative clay #A08075; charcoal text/active #3E3935.
- Beige primary with charcoal labels; charcoal hover with ivory labels. Fine/strong lines: charcoal at0.16/0.34 opacity.
- Dark admin: charcoal canvas, charcoal/ivory mixed cards, ivory main text, beige secondary/nav text. Semantic appointment/success/warning/error/info colors remain independent.
- DM Sans body/general headings/controls; Reddit Sans Condensed300 only homepage tabs; existing Playfair Display wordmark.
- Content max1200px; gutter clamp(20px,4.8vw,80px). Service/about panels phone24px top/40px bottom/shared20px inline; desktop20px top/48px bottom/shared gutter. Utility pages retain section rhythm.
- Control radius8px, card16px, round/pill999px. Booking14px, admin11px, auth12px/account10px are local exceptions.
- Flat homepage photo/thumbnails and light workspace; existing functional focus/overlay and dark workspace shadows remain.

## Patterns

- Homepage: Munkák / Szolgáltatások / Szofi are accessible in-page links. The approved photographic opening continues into services, introduction and the existing CMS booking invitation; nothing is hidden behind alternate views. Compact utilities/tagline, broad real photo without text/scrim, five thumbnails and circular arrows remain.
- Phone opening uncropped16:9 contain; desktop opening follows the broad comp frame. Selected gallery images always contain. Swipe/keyboard/predecode/error recovery.
- Services are divided image/text rows; introduction follows on a beige surface with the complete portrait and copy. Section spacing uses the shared block/inline tokens, booking restores existing CMS fields without changing data. No-JS HTML retains all facts/images/links.
- Shared compact ivory footer: six main/function links plus four services, contact/socials/hours caveat/copyright. Desktop3columns at900px; phone44px link targets.
- Utility/gallery/service/booking/account functional layouts retained with same palette. Service copy justified without hyphenation by explicit user request.
- Admin retains grouped metrics/tasks, semantic states, light/dark themes, responsive navigation and functional controls.

## Constraints

- Edit owning sources and rebuild; never directly edit generated CSS/JS, add !important/duplicate owners/framework.
- Public phone fields ≥16px and zoom available; admin standalone zoom policy/expanded hit areas preserved.
- Visible focus/readable states/reduced motion. Clay is not a small-text color; semantic states must not all become beige.
- Risk-proportionate local checks; no GitHub test jobs. See `docs/design-system.md`, `docs/studio-preview.md`.
- Approved comp: `.impeccable/mocks/studio-ivory-a.png`; only photo differences explicitly authorized, not all UI differences.
