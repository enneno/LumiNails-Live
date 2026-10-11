---
name: LumiNails
description: Implemented Ivory & Taupe public studio and admin workspace in the local TEST project.
colors:
  ui-bg: "#f6f3ee"
  ui-primary: "#e2d9d0"
  ui-taupe: "#b8a89b"
  ui-clay: "#a08075"
  ui-ink: "#3e3935"
  ui-line: "rgba(62, 57, 53, 0.16)"
  ui-line-strong: "rgba(62, 57, 53, 0.34)"
  control-border: "rgba(62, 57, 53, 0.22)"
  control-border-strong: "rgba(62, 57, 53, 0.42)"
  admin-dark-surface: "color-mix(in srgb, #3e3935 90%, #f6f3ee)"
  admin-dark-soft: "color-mix(in srgb, #3e3935 84%, #f6f3ee)"
  admin-success: "#446f58"
  admin-success-soft: "#e8f1eb"
  admin-warning: "#916329"
  admin-warning-soft: "#f8edd9"
  admin-danger: "#9c4d50"
  admin-danger-soft: "#f7e7e7"
  admin-info: "#4e667b"
  admin-info-soft: "#e9eff4"
  admin-dark-success: "#8fb99c"
  admin-dark-success-soft: "#2f4437"
  admin-dark-warning: "#d6aa72"
  admin-dark-warning-soft: "#4a3c2c"
  admin-dark-danger: "#e29aa1"
  admin-dark-danger-soft: "#503438"
  admin-dark-info: "#9db9cc"
  admin-dark-info-soft: "#324550"
typography:
  display:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(40px, 5vw, 72px)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(28px, 3.5vw, 48px)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "18px"
    fontWeight: 400
  body-small:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
  studio-selector:
    fontFamily: "Reddit Sans Condensed, DM Sans, sans-serif"
    fontSize: "42px"
    fontWeight: 300
    lineHeight: 1.2
  studio-selector-mobile:
    fontFamily: "Reddit Sans Condensed, DM Sans, sans-serif"
    fontSize: "clamp(21px, 5.7vw, 28px)"
    fontWeight: 300
    lineHeight: 1.2
  admin-heading:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(30px, 2.5vw, 38px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  admin-body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  wordmark:
    fontFamily: "Playfair Display, serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
rounded:
  card: "16px"
  control: "8px"
  pill: "999px"
  booking-field-local: "14px"
  admin-control-local: "11px"
  admin-auth-local: "12px"
  account-button-local: "10px"
spacing:
  gutter: "clamp(20px, 4.8vw, 80px)"
  section-block: "clamp(72px, 8vw, 112px)"
  section-inline-mobile: "20px"
  section-block-mobile: "58px"
  section-gap-mobile: "64px"
  section-gap-small: "52px"
  heading-description-gap: "28px"
  price-heading-content-gap: "18px"
  admin-workspace-top: "28px"
  admin-workspace-inline: "42px"
  admin-workspace-bottom: "50px"
components:
  button-primary:
    backgroundColor: "{colors.ui-primary}"
    textColor: "{colors.ui-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ui-ink}"
    textColor: "{colors.ui-bg}"
  account-field:
    backgroundColor: "{colors.ui-bg}"
    textColor: "{colors.ui-ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.control}"
    padding: "10px 13px"
    height: "46px"
  booking-field:
    backgroundColor: "{colors.ui-bg}"
    textColor: "{colors.ui-ink}"
    rounded: "{rounded.booking-field-local}"
    height: "48px"
  studio-navigation:
    backgroundColor: "transparent"
    textColor: "{colors.ui-ink}"
    typography: "{typography.studio-selector}"
    padding: "4px 16px"
    height: "72px"
  admin-button-primary:
    backgroundColor: "{colors.ui-primary}"
    textColor: "{colors.ui-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.admin-control-local}"
    padding: "0 13px"
    height: "34px"
  admin-button-primary-hover:
    backgroundColor: "{colors.ui-ink}"
    textColor: "{colors.ui-bg}"
  admin-button-secondary:
    backgroundColor: "{colors.ui-bg}"
    textColor: "{colors.ui-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.admin-control-local}"
    padding: "0 13px"
    height: "34px"
  admin-navigation-active:
    backgroundColor: "{colors.ui-primary}"
    textColor: "{colors.ui-ink}"
    padding: "9px 10px"
    height: "40px"
  admin-status-info:
    backgroundColor: "{colors.admin-info-soft}"
    textColor: "{colors.admin-info}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
    height: "26px"
  admin-card:
    backgroundColor: "{colors.ui-bg}"
    textColor: "{colors.ui-ink}"
    rounded: "{rounded.card}"
  studio-thumbnail:
    backgroundColor: "{colors.ui-primary}"
    rounded: "4px"
    size: "64px"
    height: "48px"
    width: "64px"
    padding: "0"
---

# Design System: LumiNails

> Current homepage refinement, 2026-10-11: the requested redesign retains this palette, content and real photography, but replaces the earlier opening/thumbnail composition with a framed split hero, compact section links, an independent five-image mosaic and local Phosphor regular service icons. See [.21st/DESIGN.md](.21st/DESIGN.md) and [the scoped change and validation record](docs/home-redesign-2026-10-11.md). Older homepage descriptions below are historical; utility, booking and admin guidance is unchanged. TEST only; no production release.

## Overview

**Creative North Star: "Ivory & Taupe studio"**

"Ivory & Taupe studio" is a descriptive name for the implemented, user-selected visual world. Warm ivory and beige surfaces, charcoal text, restrained geometry, and the existing serif wordmark give authentic salon photographs room to lead. The five pinned brand colors govern the public site and both admin themes; semantic status colors retain their operational meaning.

The public interface is spacious and flat, while booking and admin use readable task sequences, compact controls, and explicit state labels. DM Sans carries general content and operations; a light condensed face is a local expression for the homepage selectors. Composition belongs to the surface brief: the three-view homepage is an implemented surface pattern, not a compulsory layout for every screen.

**Key Characteristics:**

- Warm pinned neutrals with readable charcoal-on-ivory text.
- Authentic photographs, clear framing, and no text overlay on the studio opening image.
- Flat public structure, fine dividers, and compact operational components.
- Visible focus, explicit selected states, and a restrained reduced-motion-aware transition.

This is the implemented local TEST snapshot of 2026-10-10. Visual authority is the user's first/A studio comp, the pinned Ivory & Taupe palette, and the explicit instruction to use the current CMS opening photograph and five existing gallery images. Generated comp photographs are illustrative. The surface composition and direction contract live in [.impeccable/surfaces/index-html.md](.impeccable/surfaces/index-html.md).

The frontmatter is the extracted token layer; source CSS remains the runtime authority. [.impeccable/design.json](.impeccable/design.json) supplies extensions and self-contained component previews. [docs/design-system.md](docs/design-system.md) records source ownership. The finish review and its separate verdict record the single resolved booking correction; they are not a new complete certification. No commit, push, remote content write, or LIVE release accompanies this snapshot.

## Colors

The palette is warm and restrained. The frontmatter preserves the actual CSS color formats; equal runtime aliases are represented once rather than inventing extra brand swatches.

### Primary

Ivory canvas (`ui-bg`) covers public backgrounds and surfaces. Soft beige (`ui-primary`) gives actions, selected choices, and support surfaces a clear but quiet distinction. Primary labels use charcoal; primary hover swaps to charcoal with ivory text.

**The Semantic Color Rule.** Choose the owning surface's action, text, border, or state token. Legacy color names are compatibility aliases, not a second palette.

### Neutral

Charcoal ink (`ui-ink`) supplies headings, body copy, links, and active markers on light surfaces. Supporting public text currently uses the same readable ink, with size and spacing supplying hierarchy. Taupe (`ui-taupe`) supplies studio/service dividers, thumbnail selection support, and dark-admin borders. Clay (`ui-clay`) supplies small decorative markers, not low-contrast body labels.

The shared line and control-border entries are charcoal alpha values, not independent brand hues. Public aliases such as `--ui-surface`, `--ui-soft`, `--ui-highlight`, `--ui-rose`, and the earlier Hungarian color names resolve to the current semantic roles.

**The Readable Decoration Rule.** Clay and taupe may mark or divide; use charcoal for small text on the light brand surfaces. Preserve distinct, labelled success, warning, danger, and info states.

### Admin themes and functional states

Admin light uses the same ivory, beige, and charcoal family. Admin dark uses charcoal canvas/navigation, ivory main text, beige secondary/subtle/navigation text, and taupe borders. Its card and support surfaces retain the canonical CSS `color-mix()` values in `admin-dark-surface` and `admin-dark-soft`, rather than approximated hex replacements.

The `admin-dark-*` documentation keys describe theme branches; they do not add runtime custom properties. The workspace's existing `--admin-v2-*` tokens supply the runtime roles. Dark action hover is ivory with charcoal text, while the default beige action also has charcoal text.

Success, warning, danger, and info use the foreground/soft-background pairs in the frontmatter, separately for light and dark admin. Local booking/account validation and status colors also retain their existing meanings. An actual state must have text, an icon, or another explicit signal as well as color.

## Typography

**General content and controls:** DM Sans, sans-serif.

**Homepage selectors only:** Reddit Sans Condensed, with DM Sans and sans-serif fallback.

**Existing wordmark:** Playfair Display, serif.

The pairing is restrained: a familiar sans carries useful information, the light condensed selectors introduce a spacious studio rhythm, and the serif wordmark retains the identity. Reddit Sans Condensed is an estimated visual match to the approved comp's type character, not a verified identification of the mock's exact font.

### Hierarchy

- **Display:** the frontmatter display role records the global H1 default; current homepage selectors are navigation, not an oversized hero heading.
- **Headline:** the global H2 default. Inner pages and task headings retain their owning feature sizes.
- **Title:** current desktop service-row title; phone service titles are locally smaller (24px).
- **Body / Body small:** shared public roles. At the public mobile breakpoint these become 16px and 14px; actual form fields retain their separate minimum.
- **Label:** the public action label treatment. A component may own its metadata size or weight instead.
- **Studio selector:** the desktop and mobile roles are explicit in frontmatter. The light weight (300) belongs to these three controls only.
- **Admin heading / body:** compact workspace hierarchy. Page headings become 24px at its small breakpoint; row labels and metadata generally use 11–14px.
- **Wordmark:** header identity role. The public phone wordmark is locally 31px; the footer wordmark is 26px, weight 500. Admin identity keeps its small separated uppercase NAILS treatment.

Public shared micro/caption/label roles are 11/13/14px and become 10/12/13px at 768px. The lead role is 19px, then 17px on phone; base controls are 18px, then 16px. Line-height belongs to the component: introduction copy uses 1.7 with a maximum of 65ch, service-row copy uses 1.6, and inner service text uses 1.8. Introduction and service article copy retain justification without automatic hyphenation.

**The Type Ownership Rule.** Use DM Sans for content and controls. Keep Reddit Sans Condensed local to the three homepage selectors and Playfair Display local to the existing wordmark.

## Layout

### Service icon replacement, 2026-10-11

The user rejected both authored and generic Phosphor service symbols, then selected Icons8's solid monochrome nail-and-brush example. The homepage now uses four recognizable nail-care glyphs: nail, decorating brush, polish bottle and nail file. The selected Design Circle artwork is preserved; the companion Icons8/Yogi glyphs share its charcoal silhouette treatment, rather than pretending to belong to one author or collection. Existing 40px/48px slots, page composition, text and service-detail photographs are unchanged. Both static HTML and the CMS renderer use the same four local 100px PNGs; no runtime package or CDN. Icons8's free license requires the visible clickable attribution beside the copyright in the shared footer. Sources and terms: `licenses/icons8.txt`. This is a local TEST refinement, not a new publishing authorization.

### Notice, footer and service-icon refinement, 2026-10-10

Latest local-only user instructions supersede the historical notice and footer descriptions below: the active homepage notice precedes the wordmark/navigation in one in-flow sticky shell. It stays open during scrolling, uses charcoal/ivory with a bold label and an authored information icon, and remains in prerendered HTML. Empty/inactive notices leave no gap. Content is capped at 25svh with accessible internal scrolling for unusually long messages. The measured shell height supplies menu and anchor clearance; other pages retain their original fixed header. Homepage service rows now use four consistent authored line icons, not photograph backgrounds; all service-detail photographs remain unchanged. The shared footer retains all ten destinations, contact/social details and booking hours, with concise visible service labels, complete accessible names, one wrapping navigation flow and reduced spacing. At 390px its height is 289px instead of 413px; at 1440px, 155px instead of 211px. Mobile link hit areas remain 44px. See `docs/notice-footer-icons.md` for the scoped checks and file manifest. No remote content write or new release accompanies this local refinement.

### Continuous homepage refinement, 2026-10-10

The latest user request likes the studio style but rejects its single-block length. It supersedes the hidden alternate-view composition described in the original snapshot below. Keep the approved opening, colors, own photos and utility header. Munkák / Szolgáltatások / Szofi now navigate within one continuous document; services follow the photographs, Szofi follows on beige, and the existing CMS booking invitation precedes the unchanged compact footer. All sections remain visible with and without JS. Shared section spacing follows the existing block/inline tokens and content height. Ordinary keyboard links and destination focus replace tab roles; existing shared anchor handling reserves header clearance and honors reduced motion. Reddit Sans Condensed 300 extends to the service/booking headings; DM Sans introduction copy stays. No booking data, authentication, remote content or admin theme changes. See `docs/continuous-home.md` for this refinement's bounded verification and exact file list; the original snapshot and review below are historical evidence, not certification of this change.

The shared public content width is 1200px with the responsive gutter in frontmatter. The opening studio photograph deliberately spans the viewport. General section tokens remain available to inner pages; they do not force the homepage back into a long section stack.

The fixed public header is 76px high on desktop and 68px at 768px and below. Page content reserves that height. Main content expands before the shared footer, with no decorative empty canvas after it.

Current surface patterns:

- **Studio works:** centered selectors and a short introduction, one broad photograph, five authentic thumbnails, circular previous/next controls, and gallery access. Desktop opening image height is `clamp(360px, 32.552vw, 560px)` with cover framing. Phone opening image is exactly 16:9 with contain framing. A selected portfolio photograph uses contain framing at every size.
- **Service and Szofi views:** source panel padding is 24px top, shared inline gutter, and 40px bottom; above 768px it is 20px top and 48px bottom. Their inner width is at most 1200px. Services are divided image-and-copy rows; desktop uses image/title/copy/detail columns, phone uses a small image beside stacked copy. Szofi uses portrait-and-copy columns on desktop and a stacked layout on phone.
- **Gallery page:** two image columns, one at 640px and below; readable caption blocks and the existing lightbox remain local to that surface. The homepage's no-overlay photograph rule does not prohibit the gallery page's existing caption treatment.
- **Service detail:** contained text/image columns, stacked on phone; images use untinted 3:2 contain framing.
- **Booking:** flat contact-route rows, followed by progressive numbered steps. The assistant and form wrappers are transparent, borderless, square, and shadowless. Steps use spacing and top dividers; the summary is integrated into the final step with its own top divider. Choice controls, upload, coupon, validation, and the separate booking-lookup utility retain their useful affordances.
- **Account:** a contained introduction and authentication/task panels, stacked at the owning breakpoint.
- **Footer:** one shared compact component with six main page links and four service-page links, real contact/social details, current booking hours, and the availability caveat. At 900px and above it has identity/navigation/contact columns; below that, groups wrap. Phone links retain 44px hit areas; desktop contact links have a local 30px minimum.

Desktop admin has a fixed sidebar (228px), topbar (64px), and workspace insets from frontmatter. Four metrics share one group, then content uses a 1.45fr/1fr grid. At 900px and below, metrics become two per row, content becomes one column, the sidebar becomes a dismissible scrolling drawer, and the topbar is 58px. Workspace top/inline/bottom gaps become 22/17/42px; at 640px they become 18/12/34px. Drawer safe-area padding, independent scrolling, and page scroll-lock remain part of that surface's behavior.

## Elevation & Depth

The public studio and light admin use tonal separation, fine borders, spacing, and photograph arrangement. Shared public soft/button shadows and the light workspace shadow are `none`. The booking assistant, steps, summary, and contact routes are now flat; a bounded selectable control is not another decorative panel.

**The Flat Public Structure Rule.** The studio photograph, thumbnails, service rows, booking assistant, step wrappers, and summary do not acquire decorative elevation. Existing overlay, focus, validation, utility, and dark-admin exceptions retain their own owners.

### Existing depth vocabulary

The sidecar catalogues the exact reusable focus and shadow values. Preserved exceptions include the subtle public utility shadow, account selected tabs, booking validation/choice-hover/lookup utilities, lightbox, mobile menu, compact admin control details, and existing dark-admin surfaces. Those exceptions do not authorize shadows across every card.

Studio view entry is one quiet clip reveal (240ms); reduced-motion disables it. Public action hover changes color without lift. Admin state transitions generally use 160ms ease, with a 190ms drawer transition; its reduced-motion branch reduces animation/transition durations to 0.01ms. Initial content is already present and does not wait for a reveal.

## Shapes

Global cards use softly curved corners (16px), public controls use small corners (8px), and actual pills use the pill radius (999px). The broad studio photograph and service/booking structural rows are square and flat. Circular arrows and social controls use a true circle; thumbnails have a local small corner (4px).

**The Radius Ownership Rule.** One component owns its outer shape. Preserved local field and control radii are component geometry, not new global radius tiers.

The frontmatter's explicitly named local entries preserve booking fields (14px), compact admin controls (11px), authentication controls (12px), and account action buttons (10px). Admin navigation retains its local 9px corner, and the account phone group its local 11px corner. These describe existing components, not a global small/medium/large scale. Gallery-caption, lightbox, and booking-lookup geometry also remains surface-owned.

## Components

### Buttons

Public primary actions are beige with charcoal labels, a charcoal border, small shared corners, horizontal padding (22px), and a minimum height (48px). Hover uses charcoal and ivory without movement or shadow; focus is visible. Disabled actions retain the owning opacity and loading behavior. Text gallery/detail links remain underlined or gain an underline on hover, with their own hit area.

Admin primary/secondary workspace actions use the owning semantic roles. The compact control layer owns visual height (34px), local corners (11px), and horizontal padding (13px), with a 44px extended hit area. Primary hover swaps the foreground/background roles for the active theme. Authentication and topbar controls retain their separate geometry. The darker login action is a functional local variant, not another brand palette.

### Inputs / Fields

Public base fields use ivory, charcoal text, a strong stroke, and shared control corners. Account fields use padding (10px 13px), minimum height (46px), and the control-border/focus tokens. Booking fields use minimum height (48px) and local corners (14px); that radius is not a type size.

Public phone field text stays at least 16px, with 100% text scaling and `font-size-adjust: none`. Public browser pinch zoom remains available. Preserve associated labels, readable placeholders, errors, disabled feedback, and the existing progressive validation states.

Admin text fields use the canonical compact layer: 32px field height with 18px text, 32px choice fields with 14px text, and dedicated 34px date/time/month controls with 20px picker text. Its phone text/choice fields retain `max(22px, 1em)` with optical ratio 0.32. This is separate from the public minimum and the intentionally disabled zoom in admin standalone PWA.

### Navigation

Public utilities use DM Sans, fine active underlines, and a beige booking action. Phone navigation is a 44px hamburger and a full-height menu below the fixed header. The homepage locally hides redundant utility links because its selectors and footer provide those routes.

Studio selectors are real anchors before enhancement. With JavaScript they become a tablist with labelled panels, roving focus, arrows/Home/End/Space handling, visible selection, and direct hash routing. Without JavaScript all factual panels and internal links remain readable.

Admin rows use readable labelled icons, pale selected tone, and an edge marker. Desktop rows are 40px; drawer rows are at least 44px. Dark navigation secondary/subtle labels use beige, not a dimmed taupe.

### Chips

Admin status chips use explicit state text, a functional foreground/soft-background pair, pill corners, local padding (4px 8px), 11px type, and 26px visual height. Booking dates, times, and style choices are interactive controls with selected, focus, disabled, and validation states; they are not interchangeable with a passive chip.

### Cards / Containers

Admin cards use one outer border and card radius, a divided header, and compact row/body padding. Their dark branch uses the exact mixed surface and its existing soft shadow. Account panels use the shared soft-shadow token, currently flat in public light.

The service listing is a flat row pattern, not an image-top card grid. Booking wrapper layers are also flat; keep bounded shapes for actual inputs and choices. The separate lookup panel, utility overlays, and state treatments remain local exceptions.

### Portfolio selection

Thumbnails use real portfolio images, cover framing, small corners, and a clear selected border plus taupe focus-like selection ring. The main selected image is contained. Circular previous/next controls are 44px on phone and 48px on desktop.

Image selection predecodes the requested asset, exposes busy/status feedback, and lets the last request win. A load failure retains the last successful image and gives a retry/gallery message. The opening CMS photograph is refreshed without replacing the selected portfolio state. Swipe supports horizontal stepping while vertical page scrolling and public pinch zoom remain available.

## Do's and Don'ts

### Do:

- Do use the pinned brand roles and the owning source stylesheet when extending a component.
- Do preserve real photographs, service facts, prices, availability, and the existing booking/account/admin states.
- Do keep the mobile studio image uncropped at 16:9 and selected portfolio images contained.
- Do preserve visible focus, explicit status text, public mobile field text of at least 16px, and existing touch targets.
- Do keep all factual panels and the shared footer's ten page links available without JavaScript.
- Do respect component-local geometry and the separate public-browser and admin standalone-PWA zoom policies.

### Don't:

- Don't revive the discarded palette or stacked homepage as authority for the selected studio world.
- Don't put text or a tinted readability overlay over the homepage studio photograph.
- Don't reintroduce nested decorative booking panels or broad shadows beneath the flat contact rows.
- Don't turn the homepage selector font or a local radius exception into a global default.
- Don't add another CSS override layer, use !important, or edit generated bundles directly.
- Don't infer complete accessibility certification, a passing numerical comp score, or release authorization from the finish verdict.

Verification records are in [docs/studio-preview.md](docs/studio-preview.md), [.impeccable/review/finish-review.md](.impeccable/review/finish-review.md), and [.impeccable/review/finish-verdict.md](.impeccable/review/finish-verdict.md). Twenty distinct targeted browser cases eventually passed; build/static/CSS checks passed. No full suite, Lighthouse audit, physical iPhone/Safari, or installed iOS PWA certification is claimed. The verdict resolves the listed P2 booking presentation issue; numerical comp evidence remains contradicted rather than silently converted to a pass.
