---
name: LumiNails
description: Implemented minimalist public website and admin workspace for the TEST project.
colors:
  ui-primary: "#3155c6"
  ui-accent-text: "#2948a9"
  ui-highlight: "#eaf0ff"
  ui-bg: "#f5f6f9"
  ui-surface: "#ffffff"
  ui-soft: "#edf1f7"
  ui-ink: "#18212c"
  ui-muted: "#596474"
  ui-line: "rgba(24, 33, 44, 0.16)"
  ui-line-strong: "rgba(24, 33, 44, 0.34)"
  admin-dark-brand: "#a9beff"
  admin-dark-brand-hover: "#c8d6ff"
  admin-dark-bg: "#121a28"
  admin-dark-surface: "#1b2638"
  admin-dark-soft: "#27364d"
  admin-dark-ink: "#f7f9ff"
  admin-dark-muted: "#c5cedc"
  admin-dark-subtle: "#b3bfd0"
  admin-dark-border: "#49606a"
  admin-dark-border-strong: "#6c848a"
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
    fontSize: "clamp(64px, 7vw, 96px)"
    fontWeight: 500
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(32px, 4vw, 52px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(21px, 2vw, 25px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "18px"
    fontWeight: 400
  body-small:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
  lead:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
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
  logo:
    fontFamily: "Playfair Display, serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
rounded:
  card: "16px"
  control: "8px"
  pill: "999px"
  admin-control-local: "11px"
  admin-auth-local: "12px"
  booking-field-local: "14px"
  account-button-local: "10px"
spacing:
  gutter: "clamp(20px, 4.3vw, 80px)"
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
    textColor: "{colors.ui-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ui-accent-text}"
    textColor: "{colors.ui-surface}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ui-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  account-field:
    backgroundColor: "{colors.ui-surface}"
    textColor: "{colors.ui-ink}"
    rounded: "{rounded.control}"
    padding: "10px 13px"
    height: "46px"
  booking-field:
    backgroundColor: "{colors.ui-surface}"
    textColor: "{colors.ui-ink}"
    rounded: "{rounded.booking-field-local}"
  service-card:
    backgroundColor: "{colors.ui-surface}"
    textColor: "{colors.ui-ink}"
    rounded: "{rounded.card}"
    padding: "0 22px 18px"
  admin-button-primary:
    backgroundColor: "{colors.ui-primary}"
    textColor: "{colors.ui-surface}"
    rounded: "{rounded.admin-control-local}"
    padding: "0 13px"
    height: "34px"
  admin-button-secondary:
    backgroundColor: "{colors.ui-surface}"
    textColor: "{colors.ui-ink}"
    rounded: "{rounded.admin-control-local}"
    padding: "0 13px"
    height: "34px"
  admin-navigation-active:
    backgroundColor: "{colors.ui-highlight}"
    textColor: "{colors.ui-accent-text}"
    padding: "9px 10px"
    height: "40px"
  admin-status-info:
    backgroundColor: "{colors.admin-info-soft}"
    textColor: "{colors.admin-info}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
    height: "26px"
  admin-card:
    backgroundColor: "{colors.ui-surface}"
    textColor: "{colors.ui-ink}"
    rounded: "{rounded.card}"
---

# Design System: LumiNails

## Overview

**Creative North Star: "Minimal studio"**

“Minimal studio” is a descriptive working name for the implemented 2026-10-10 TEST redesign, not an additional approved brand promise. The user's confirmed direction is minimalist, with a visibly different layout and colors across public and admin surfaces and a large, full-width homepage photograph. This document records code and rendered evidence; there is no approved new design comp.

The current system uses DM Sans headings and body text, cobalt actions, white and cool gray surfaces, dark ink, fine borders, and authentic photographs. Public sections have open spacing; the admin groups information densely for daily work. The existing serif logo remains an identity detail. Earlier Figma, pink, cacao, sage, and mist-teal treatments are historical references, not current visual authority.

**Key Characteristics:**

- Sans headings and body text, with the existing serif logo retained.
- Cobalt actions on white and cool gray surfaces.
- Photographs and section layout provide the public site's hierarchy.
- Flat public sections and grouped admin information, with selective depth for overlays and existing utility components.

The frontmatter is the normative extracted token layer. Source CSS remains the runtime authority. The `.impeccable/design.json` sidecar extends it with motion, shadows, breakpoints, and component previews. `docs/design-system.md` defines project ownership and checks; `.21st/` is a condensed discovery mirror.

## Colors

The palette is cool and neutral, with one cobalt accent and separate functional state pairs in the admin. The frontmatter values retain the exact CSS formats.

### Primary

`ui-primary` is the action color; `ui-accent-text` is the darker hover and readable link color. `ui-highlight` supplies pale selected and accent surfaces. Public white-on-cobalt buttons use `--ui-on-primary`; the desktop hero uses `--ui-on-dark`. Both resolve to the white surface color in the light theme.

Public compatibility names such as `--ui-warm`, `--ui-rose`, `--ui-rose-dark`, and `--zsalyaszurke` are retained aliases or legacy names. They do not indicate a warm, pink, or sage palette.

**The Semantic Color Rule.** Use the owning surface's semantic tokens for actions, text, borders, and states; do not infer a color from a legacy token name.

### Neutral

`ui-bg` is the cool page canvas, `ui-surface` is white, and `ui-soft` is the slightly stronger gray-blue support surface. `ui-ink` supplies headings and strong text; `ui-muted` supplies supporting text without an additional opacity reduction. `ui-line` and `ui-line-strong` are the exact shared alpha border values.

The public palette comes from `src/styles/00-base.css`. Admin foundation light tokens align with it in `src/admin-styles/00-foundation.css`. The workspace owns its scoped `--admin-v2-*` tokens in `src/admin-styles/20-workspace.css`: light brand, ink, canvas, surfaces, and muted colors match the public roles; its strong border is locally `rgba(24, 33, 44, 0.32)`.

### Admin dark and functional states

The `admin-dark-*` frontmatter keys describe the workspace's dark branch, selected by `html[data-admin-theme="dark"]`; they are documentation keys, not new runtime custom properties. They map to the same scoped `--admin-v2-*` roles. Dark navigation uses the dark canvas, selected items use the dark soft surface, and light blue actions use dark canvas-colored text. The workspace hover brand uses `admin-dark-brand-hover`; the foundation's older `--ui-rose-dark` alias remains at the dark brand value.

Success, warning, danger, and info use the named foreground/soft-background pairs in each theme. Preserve their text or icon meaning, not color alone. Workspace dividers and neutral status backgrounds retain their own local values; these are existing supporting tones, not additional brand accents.

The shared `--lumi-control-focus` and a few local focus, state, and utility shadow values retain earlier color tints. This document records them as implemented exceptions, without promoting them into new palette tiers.

## Typography

Display and body typography both use DM Sans with the existing sans-serif fallback. Playfair Display is used for the existing “Lumi” logo; headings no longer use it. The footer's text wordmark uses DM Sans.

**The Sans Heading Rule.** Use the display token for content headings; reserve the existing Playfair treatment for the logo.

The frontmatter's display role is the desktop homepage hero, headline is the recurring homepage section title, and title is the desktop service card title. The global heading defaults differ deliberately: H1 uses `clamp(40px, 5vw, 72px)`, weight 600, line-height 1.08; H2 uses `clamp(28px, 3.5vw, 48px)`, weight 600, line-height 1.12. Utility and service pages own their local sizes.

Public type token sizes are micro (11px), caption (13px), label (14px), body-small (16px), body (18px), lead (19px), and control (18px). At 768px and below they become 10, 12, 13, 14, 16, 17, and 16px respectively. Public button base text is locally 14px; the separate compact button token is 12px. Text line-height belongs to the component: hero lead is 1.6, service card copy 1.65, and introduction copy 1.85 with a maximum of 65ch.

The mobile homepage hero has a compact display clamp (30px, 8.7vw, 44px) and line-height 1.06. Its factual location line follows the H1, despite the retained “kicker” class name. Decorative preheadings are hidden in the current public sections, booking, account, and admin page headings.

Admin workspace body text is 16px with line-height 1.5, while labels and row metadata are generally 11–14px. Its page heading uses the frontmatter admin-heading role and becomes 24px at 640px. Shared admin input text geometry is owned separately in `10-components.css`; see Inputs below.

## Layout

The public site uses a shared content width (1200px), responsive gutter, and responsive section rhythm from the frontmatter. The fixed header is 76px on desktop and 68px at 768px and below. The page reserves the header height and fills at least the viewport; main content expands before the shared footer.

The current homepage expressions are surface patterns, not mandatory compositions for every new page:

- Desktop hero: full-width image, minimum height `max(640px, calc(100svh - var(--ui-header-height)))`, cover framing, lower-left copy, a directional dark readability layer, upper-right benefits, and a compact lower-right gallery link.
- Mobile hero, at 768px and below: exact 16:9 image with contain framing; left-aligned copy on one directional light readability layer; centered benefits on one translucent bottom strip. The gallery link follows in a 44px row. Actions sit below the photograph with columns of 1.25fr and 1fr. Use 16:9 uploads with usable text space on the left.
- Introduction: contained two-column portrait and text inside the shared width, stacked on mobile.
- Services: four image-top cards above 900px, two between 769 and 900px, and one at 768px and below.
- Homepage gallery: a flat rail with three visible photographs on desktop, one main photograph with neighboring glimpses on mobile, and arrows plus a count below. Existing swipe and keyboard behavior remains.
- Gallery page: two-column image grid, one column at 640px and below, consistent readable captions, and a lightbox.
- Service detail: contained two-column text and untinted 3:2 image on desktop; stacked copy and image on mobile. Article copy remains justified with no automatic hyphenation.
- Booking: a single-column opening followed by the existing account/guest paths, progressive service/date/time/data steps, and summary. Account: contained introduction and authentication panel, stacked at its local breakpoint.
- Shared footer: compact white surface with identity, contact, social controls, booking-hours note, and legal metadata. It follows page content without trailing canvas.

Desktop admin has a fixed white sidebar (228px), fixed topbar (64px), and content with workspace spacing from the frontmatter. The dashboard has one four-cell metric group, then a 1.45fr/1fr content grid. At 900px it changes to two metrics per row and one content column, and the sidebar becomes a dismissible drawer. The mobile topbar is 58px. Workspace gaps become 22px/17px/42px at 900px and 18px/12px/34px at 640px. The drawer has its own scrolling and safe-area padding; opening it locks page scrolling. The authentication panel is centered with a cobalt brand header on desktop and a compact single panel on mobile.

## Elevation & Depth

Public section structure and the light admin workspace are predominantly flat. The shared soft shadow, button shadow, and light workspace shadow tokens are `none`. Separation comes from surface tone, fine borders, gaps, and image arrangement.

**The Flat Section Rule.** Keep homepage sections and the gallery rail flat; retain depth where an existing overlay, utility component, or dark admin surface requires it.

The exact reusable shadow and focus values are catalogued in the sidecar extensions. Existing exceptions include the subtle public `--ui-shadow`, booking path cards, selected account tabs, lightbox, notification panel, compact admin controls, and dark admin workspace cards. Their presence does not justify adding shadows to every surface.

Public buttons change color without moving. Service cards change border color; the gallery rail transitions transform and opacity over 350ms. Admin shell state changes generally use 160ms ease; the mobile drawer uses 190ms ease. Reduced-motion rules disable the affected public transitions and reduce admin animation/transition durations to 0.01ms.

## Shapes

Shared cards and image containers use the card radius (16px); shared public controls use the control radius (8px). The pill token (999px) belongs to actual chips and circular controls. The hero and section boundaries remain edge-to-edge.

**The Radius Ownership Rule.** One component owns each outer shape; nested fields and images must not create competing corners.

Preserved component geometry is local, not a proposed extension of the global radius scale: booking fields (14px), account action buttons (10px), account phone group (11px), compact admin controls (11px), authentication controls (12px), and admin navigation items (9px). Gallery caption and lightbox corners also retain their existing local geometry. Use the owning component's rules when extending that component.

## Components

### Buttons

Public primary actions are cobalt with white text, shared control corners, at least 48px height, horizontal padding (22px), and weight 600. Hover changes to the darker accent without lift. The gallery link is a compact outlined variant (44px height, 16px horizontal padding); desktop hero secondary actions use a white border on the image and become neutral outlined actions on mobile.

Admin primary and secondary buttons use the workspace color roles. The canonical compact control geometry in `10-components.css` supersedes workspace defaults where its context applies: visual height (34px), local radius (11px), horizontal padding (13px), and an expanded hit area (44px). Authentication controls use their local 44px geometry. Topbar icon controls stay 44px. Keep disabled and loading behavior in the owning component.

### Inputs / Fields

Public base fields use white surfaces, ink text, strong borders, shared control corners, and padding (15px). Account fields use padding (10px 13px), minimum height (46px), and the shared border/focus tokens. Booking fields retain their local corners (14px); that value describes radius, not text size.

Public mobile field text is at least 16px, with `font-size-adjust: none` and 100% text scaling. Public page zoom remains available. Booking choice focus uses a 3px accent outline; booking text fields retain a separate local focus outline. Account fields retain the shared focus-shadow treatment.

Admin fields use the canonical compact control layer: text inputs are 32px high with 18px text, selects 32px with 14px text, and date/time/month controls 34px with their dedicated 20px picker text. On mobile, text and choice fields preserve the existing `max(22px, 1em)` font-size and optical ratio (0.32). These admin rules are separate from the public form rule and the standalone PWA's intentionally disabled zoom. Do not copy public field styles over them.

Visible labels, associated error text, disabled/loading feedback, and the existing progressive booking states remain part of the component contract.

### Navigation

Public desktop navigation uses sentence-case DM Sans labels, fine active underlines, and a cobalt booking action. At 768px it switches to a 44px hamburger and a full-height white menu beneath the fixed header.

Admin navigation uses compact labeled rows on white, a pale blue selected surface, darker accent text, and a narrow edge marker. Rows are 40px on desktop and at least 44px in the mobile drawer. The drawer retains keyboard, dismiss, scrolling, and focus behavior; status counts and alerts carry accessible meaning.

### Chips

Admin statuses pair readable functional color with a soft background and explicit state text. Workspace chips use pill corners, local padding (4px 8px), 11px text, and a 26px visual height. Booking date/time controls are interactive selections with their own active, disabled, and focus states; do not treat them as decorative labels.

### Cards / Containers

Service cards use one outer border and radius, an image at the top, a text body, and a bottom detail action. Hover changes the border to cobalt; focus outlines the whole linked card. Cards stay equal-height within a row through their existing flex layout.

Account panels, admin cards, and grouped metrics use white surfaces and fine borders. Admin card headers and rows use dividers; dark mode applies the same structure through dark tokens and its existing shadow. Booking path cards and selected account tabs retain their local utility depth.

### Shared footer and content

The shared footer source is `src/html/site-footer.html`, prerendered into each page by `scripts/prerender-public.js` and styled in `src/styles/13-gallery-footer-navigation.css`. Main navigation and all four service-page links remain readable without JavaScript, wrap on smaller screens, and retain at least 44px touch targets. Keep contact and legal links readable and the social/contact/legal targets at their existing minimum heights. Booking-hours content comes from the shared current content record, with the availability caveat displayed beside the hours. Photos, prices, availability, and user data continue to come from existing product sources.

## Do's and Don'ts

### Do:

- Do use the current semantic tokens and the owning source stylesheet when extending a component.
- Do use DM Sans for content headings and body text, preserving the existing serif logo.
- Do preserve the mobile hero's uncropped 16:9 framing and actions below the image.
- Do keep focus, state labels, public mobile field text of at least 16px, and existing control hit areas visible and usable.
- Do preserve real photographs, prices, availability, and booking/account/admin workflows.

### Don't:

- Don't treat historical Figma, pink, cacao, sage, or mist-teal decisions as the current TEST direction.
- Don't create a new global radius tier from an existing local component exception.
- Don't add shadows or positional depth to the flat homepage gallery rail.
- Don't modify generated bundles directly, add duplicate override layers, or use !important.
- Don't transfer these TEST changes to LIVE or alter the standalone admin zoom policy without separate explicit authorization.
