# LumiNails design context

## Direction

The TEST public UI keeps the supplied Figma file's light editorial beauty-salon structure, but uses a quieter pearl-sage accent, slate ink, warm greige canvas, and clean ivory surfaces. The admin keeps its separately owned light/dark theme.

## Core tokens

- Public primary `#C9D4CF`; ink/footer `#31383f`.
- Background `#e3dcd2`; surface `#f5f1eb`; soft sage `#dfe7e3`; accent text `#4b625a`.
- Display typography: Playfair Display. Functional typography: DM Sans.
- Card radius 4px; control radius 3px; pill only for semantic pills/circular controls.
- Shared content width 1200px and responsive `--ui-gutter`.

## Patterns

- Full-width split homepage hero with existing homepage imagery.
- Mobile hero: edge-to-edge 16:9 image with contain (no crop/zoom), compact left-aligned slate copy over one directional readability scrim, and one unified translucent benefit strip with centered labels. The gallery caption is a compact 44–48px transition row; two equal-width account/booking actions stay below it.
- Full-width split introduction, dark service showcase, and pearl-sage booking CTA.
- Homepage gallery cards use crisp borders and positional depth, without clipped glow or floating card/control shadows.
- Two-column desktop gallery with consistent caption backgrounds on every image; one column on mobile.
- Service detail pages use a compact 3:2 image followed by neutral editorial copy on mobile; desktop uses a directional slate readability layer instead of a brown wash. Article paragraphs are justified without automatic hyphenation.
- One shared compact dark footer across all public pages, pinned after the page content without trailing canvas. Its identity, contact and legal information form three dense rows while preserving readable details and 44px interactive targets.
- Compact admin workspace using the same light palette while preserving its functional dark theme.

## Constraints

- Source CSS only; rebuild generated bundles.
- Preserve existing flows, gallery image files and admin PWA zoom policy.
- No `!important`, duplicate override layers or GitHub test jobs.
- Visible focus, minimum 44px touch targets and minimum 16px mobile form text.
