---
version: alpha
name: Institutional Trust
description: Grounded, data-forward B2B design system for a group-procurement platform serving schools, universities, government offices, NGOs, and companies.
colors:
  primary: "#1B4332"
  primary-hover: "#143026"
  primary-subtle: "#E4EDE8"
  accent: "#C9820A"
  accent-hover: "#B87408"
  accent-subtle: "#F7EAD1"
  neutral: "#FAF8F4"
  surface: "#FFFFFF"
  surface-muted: "#F1EFE9"
  border: "#DEDAD0"
  on-primary: "#FFFFFF"
  on-neutral: "#1F2421"
  on-accent: "#120B02"
  text-secondary: "#5B6660"
  text-disabled: "#595D56"
  success: "#266B43"
  success-hover: "#1D5233"
  success-bg: "#E8F4ED"
  on-success: "#FFFFFF"
  warning: "#C9820A"
  warning-hover: "#B87408"
  warning-bg: "#F7EAD1"
  on-warning: "#0A0601"
  error: "#B33A3A"
  error-hover: "#8F2E2E"
  error-bg: "#F4E8E8"
  on-error: "#FFFFFF"
  info: "#3A6B8A"
  info-hover: "#2E5670"
  info-bg: "#E8F1F6"
  on-info: "#FFFFFF"
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.1
  h1:
    fontFamily: Space Grotesk
    fontSize: 2rem
    fontWeight: 600
    lineHeight: 1.2
  h2:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
  h2-alt:
    fontFamily: IBM Plex Sans
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
  h3:
    fontFamily: Space Grotesk
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.6
  body-md-strong:
    fontFamily: IBM Plex Sans
    fontSize: 0.9375rem
    fontWeight: 600
    lineHeight: 1.6
  label-caps:
    fontFamily: IBM Plex Sans
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.05em
  label-caps-strong:
    fontFamily: IBM Plex Sans
    fontSize: 0.8125rem
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0.05em
  data-figure:
    fontFamily: IBM Plex Mono
    fontSize: 1.125rem
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: 4px
  md: 6px
  lg: 10px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    padding: 12px
  button-accent-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    padding: 12px
  button-success-hover:
    backgroundColor: "{colors.success-hover}"
    textColor: "{colors.on-success}"
    rounded: "{rounded.md}"
    padding: 12px
  button-warning-hover:
    backgroundColor: "{colors.warning-hover}"
    textColor: "{colors.on-warning}"
    rounded: "{rounded.md}"
    padding: 12px
  button-error-hover:
    backgroundColor: "{colors.error-hover}"
    textColor: "{colors.on-error}"
    rounded: "{rounded.md}"
    padding: 12px
  button-info-hover:
    backgroundColor: "{colors.info-hover}"
    textColor: "{colors.on-info}"
    rounded: "{rounded.md}"
    padding: 12px
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  card-neutral:
    backgroundColor: "{colors.neutral}"
    rounded: "{rounded.lg}"
    padding: 16px
  card-subtle:
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.on-neutral}"
    rounded: "{rounded.lg}"
    padding: 16px
  badge-savings:
    backgroundColor: "{colors.accent-subtle}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: 8px
    typography: "{typography.label-caps}"
  badge-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.sm}"
    padding: 8px
    typography: "{typography.label-caps}"
  badge-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.on-warning}"
    rounded: "{rounded.sm}"
    padding: 8px
    typography: "{typography.label-caps}"
  badge-error:
    backgroundColor: "{colors.error-bg}"
    textColor: "{colors.error}"
    rounded: "{rounded.sm}"
    padding: 8px
    typography: "{typography.label-caps}"
  badge-info:
    backgroundColor: "{colors.info-bg}"
    textColor: "{colors.info}"
    rounded: "{rounded.sm}"
    padding: 8px
    typography: "{typography.label-caps}"
  table-header:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label-caps}"
    padding: 12px
  table-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-neutral}"
    typography: "{typography.body-md}"
    padding: 12px
  table-row-alt:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.on-neutral}"
    typography: "{typography.body-md}"
    padding: 12px
  nav-sidebar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 8px
  nav-sidebar-active:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 8px
  input-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-neutral}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px
  input-disabled:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-disabled}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px
  toast-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.md}"
    padding: 12px
    typography: "{typography.body-md}"
  toast-error:
    backgroundColor: "{colors.error-bg}"
    textColor: "{colors.error}"
    rounded: "{rounded.md}"
    padding: 12px
    typography: "{typography.body-md}"
  toast-info:
    backgroundColor: "{colors.info-bg}"
    textColor: "{colors.info}"
    rounded: "{rounded.md}"
    padding: 12px
    typography: "{typography.body-md}"
---

## Overview

Architectural clarity meets cooperative trust. This is a B2B group-procurement
platform: schools, universities, government offices, NGOs, and companies pool
orders into baskets to unlock wholesale pricing from Merkato suppliers, track
two years of price history, and manage deliveries. Users are procurement
officers and administrators — budget-accountable, not necessarily technical.
They need to trust numbers at a glance, not be dazzled.

The UI should feel like a well-run cooperative's back office: calm surfaces,
legible data, decisive color reserved for money and savings signals. It
should explicitly avoid glossy SaaS marketing energy, purple/blue gradients,
glassmorphism, and rounded-pill-everything — the visual tells of a
default-template AI app.

## Colors

The palette is rooted in a deep forest green and a single warm accent,
deliberately avoiding blue/purple/indigo, which read as generic SaaS
defaults.

- **Primary (#1B4332):** deep forest green. Primary actions, active nav,
  brand marks, positive/savings emphasis. Never combined with the accent as
  a large fill in the same view — one dominates per screen.
- **Accent (#C9820A):** warm ochre. The platform's *only* secondary accent
  — savings badges, "best price" highlights, high-value CTAs like "Join
  Basket." Used like a highlighter, not a base color. No third accent
  color is introduced anywhere in the product.
- **Neutral (#FAF8F4):** warm off-white app background, softer than pure
  white.
- **Surface (#FFFFFF):** cards, panels, modals.
- **Surface-muted (#F1EFE9):** table stripes, secondary panels.
- **Border (#DEDAD0):** default borders and dividers.
- **On-neutral (#1F2421):** primary text on light backgrounds.
- **Text-secondary (#5B6660):** labels, captions.
- **Success / Warning / Error / Info:** status colors for order and basket
  states (delivered, closing soon, cancelled, informational). Color is
  never the only signal — always paired with text or an icon.

## Typography

Avoid an Inter-only setup, the most common AI-default tell. Pair a headline
face with character against a highly legible UI face, plus a dedicated
monospace for financial figures.

- **Space Grotesk** (`display`, `h1`, `h2`, `h3`) — page titles, section
  headers, dashboard KPI numbers.
- **IBM Plex Sans** (`body-md`, `label-caps`) — all body copy, labels,
  forms, navigation.
- **IBM Plex Mono** (`data-figure`) — prices, quantities,
  percentages in tables and the price trend chart. This is what makes
  numeric data feel trustworthy and scannable rather than decorative.

**Typography Usage Guide:**
- `display` — Hero headlines, dashboard mega-stats
- `h1` — Page titles
- `h2` — Section headings
- `h2-alt` — Alternative section heading with neutral utility voice (IBM Plex Sans)
- `h3` — Sub-section headings
- `body-md` — Default body copy
- `body-md-strong` — Bold inline body emphasis
- `label-caps` — Form labels, table headers, metadata (uppercase, 0.05em letter-spacing)
- `label-caps-strong` — Emphasized labels, active nav items
- `data-figure` — Prices, quantities, percentages in tables and charts (tabular-nums)

Strict role separation: a component never mixes Space Grotesk into body
copy or IBM Plex Sans into a page title. The contrast between the two
faces is what carries hierarchy, so it has to stay consistent everywhere.

## Layout

- Container: max-width 1280px, centered, 16px (`spacing.md`) horizontal
  padding on mobile, 48px (`spacing.2xl`) on desktop.
- Grid: 12-column, 24px (`spacing.lg`) gutter on desktop; single column
  under 768px.
- Breakpoints, matched to Playwright MCP test viewports: mobile 390px,
  tablet 768px, desktop 1440px.
- Dashboard views (basket lists, price trend charts, admin tables) carry
  higher information density than marketing/landing pages — don't force
  generous landing-page whitespace onto a 40-row pricing table.

## Elevation & Depth

The system uses three elevation strategies, chosen deliberately per context
rather than mixed at random. **Prefer surface contrast (Level 1) over
shadows** — it reads calmer and avoids the generic app aesthetic.

| Level | Treatment | Use |
|---|---|---|
| Level 0 — Flat | No shadow, just a 1px `{colors.border}` border. | Forms, inline cards, admin tables — functional surfaces where contrast comes from content density rather than visual lift. |
| Level 1 — Surface Contrast | No shadow, no border — a `{colors.surface}` white card sitting on the `{colors.neutral}` warm-off-white page background. The tonal jump between the two *is* the elevation cue. | **Preferred default.** Marketing/landing sections, basket cards on dashboard, feature cards, empty states. Any card that sits *on* the page rather than *in* a dense layout. |
| Level 2 — Raised | `0 4px 12px rgba(31,36,33,0.08)` shadow. | Dropdowns, modals, toasts — anything that floats *above* the page rather than sitting *on* it. |

**Implementation principle:** The page canvas uses `{colors.neutral}` as the
base background. Cards, panels, and feature surfaces use `{colors.surface}`
white. The 6-point tonal difference (#FAF8F4 → #FFFFFF) provides sufficient
contrast to establish hierarchy without shadows. This approach:
- Reduces visual noise in dense data views.
- Feels institutional and trustworthy rather than consumer-app glossy.
- Reserves shadows for truly floating UI (modals, menus) where z-index
  hierarchy must be unmistakable.

## Shapes

- `rounded.sm` (4px): badges, tags.
- `rounded.md` (6px): buttons, inputs.
- `rounded.lg` (10px): cards.
- Never `rounded-full` except avatars and status dots.
- Borders: 1px solid, no double borders, no gradient borders.

## Components

- **Buttons:** `button-primary` (forest green) for the main action per
  view; outline for secondary; ghost/text for tertiary. `button-accent`
  (ochre) reserved for high-value actions only — "Join Basket," "Lock in
  Price."
- **Forms:** labels above inputs, `rounded.md`, 1px border, green focus
  ring at 40% opacity. Inline validation, not toast-only errors.
- **Card:** used for baskets, suppliers, organizations. A basket card
  always shows, in order: product(s), current estimated price,
  participants/target, a progress bar, time remaining. Sits at Elevation
  Level 1 (surface contrast) on the dashboard background.
- **Basket Progress Indicator:** signature component, not a generic
  progress bar — horizontal bar filled with `{colors.primary}`, showing
  participants vs. target and the estimated price shifting live as it
  fills.
- **Price Trend Chart:** line/area chart, 2-year range toggle, line in
  `{colors.primary}`, seasonal-low band in `{colors.accent-subtle}`, axis
  labels in the `data-figure` typography token.
- **Savings Badge (`badge-savings`):** small pill showing "% below last
  basket" or "% below market," ochre background.
- **Table:** admin management and price history. `table-row-alt` striping,
  right-aligned tabular-mono figures, sticky header on scroll, sort +
  filter + pagination past ~50 rows.
- **Navigation:** organization dashboard and admin panel are visually
  distinct — admin uses a `{colors.primary}` sidebar with white text so
  the two contexts are never confused.
- **Feedback:** toasts bottom-right, 4s auto-dismiss for success, manual
  dismiss for errors, rendered at Elevation Level 2.

### Component Reference

**Basket & Data Components:**
- `card` — Default white card on neutral canvas (Level 1 elevation)
- `card-neutral` — Warm off-white card for secondary surfaces
- `card-subtle` — Subtle green-tinted card for featured content
- `table-header` — Muted header with label-caps typography
- `table-row` / `table-row-alt` — Standard and alternating table rows

**Status & Feedback:**
- `badge-savings` — Ochre savings indicator
- `badge-success` / `badge-warning` / `badge-error` / `badge-info` — Semantic status badges
- `toast-success` / `toast-error` / `toast-info` — Toast notification variants

**Navigation & Input:**
- `nav-sidebar` / `nav-sidebar-active` — Primary sidebar navigation with active state
- `input-text` / `input-disabled` — Form input states

**Buttons:**
- `button-primary` / `button-primary-hover` — Forest green primary action
- `button-accent` / `button-accent-hover` — Ochre high-value action

## Do's and Don'ts

**Do:**
- Let numbers be the loudest thing on screen where numbers matter (prices,
  savings %, participant counts).
- Use the ochre accent like a highlighter, not a base color.
- Prefer surface-contrast elevation (Level 1: white cards on warm-neutral
  canvas) over shadows; reserve real shadows for things genuinely floating
  above the page (modals, toasts, dropdowns).
- Keep admin and org-facing dashboards visually distinguishable at a
  glance.
- Use semantic color hover states (`success-hover`, `error-hover`, etc.)
  for interactive elements — never leave a colored button without a
  documented hover treatment.
- Pair `data-figure` typography with tabular-nums for all financial data
  so columns align optically.
- Use `h2-alt` (IBM Plex Sans Semibold) when you need a section heading
  with less typographic drama than Space Grotesk — particularly in dense
  admin layouts.

**Don't:**
- Don't default to blue/purple/indigo — the generic-agent tell this whole
  design system exists to avoid.
- Don't introduce a second or third accent color beyond ochre.
- Don't animate core functional UI for its own sake (see AGENTS.md React
  Bits rule).
- Don't use emoji in UI copy or empty states.
- Don't round every element into a pill.
- Don't let marketing-page whitespace conventions bleed into dense
  admin/data tables.
- Don't use shadows as the default elevation strategy — reach for Level 1
  surface contrast first, shadows only when content is truly floating.
- Don't mix Space Grotesk into body copy or IBM Plex Sans into page
  titles — strict role separation is what carries hierarchy.
