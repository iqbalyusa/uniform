---
name: "Pribadi · Manajemen Seragam"
description: "A clear school stock workspace in Pribadi white and blue"
colors:
  bg: "#f5f7fa"
  surface: "#fff"
  surface-soft: "#f1f5f9"
  ink: "#12233c"
  muted: "#586b83"
  line: "#e0e7ef"
  accent: "#0069aa"
  accent-hover: "#00558a"
  accent-soft: "#eaf5fd"
  brand-blue: "#18a8fa"
  brand-navy: "#12233c"
  focus: "#0879b9"
  red: "#a63c34"
  red-soft: "#fff0ed"
  amber: "#8a5e1a"
  amber-soft: "#faf2e2"
typography:
  headline:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.03em"
  headline-mobile:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.03em"
  title:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-.02em"
  lead-number:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.035em"
  metric:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.035em"
  metric-compact:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.035em"
  lead-number-compact:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "38px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.035em"
  lead-number-narrow:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.035em"
  metric-narrow:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.035em"
  figure:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-.02em"
  quantity:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  ui:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  label:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.55
  micro:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  panel: "16px"
  control: "10px"
  soft: "12px"
  entry: "18px"
  tag: "6px"
spacing:
  control-gap: "12px"
  panel-padding: "22px"
  desktop-inset: "36px"
  mobile-inset: "16px"
  rail-width: "248px"
  topbar-height: "76px"
  touch-target: "44px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.ui}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
    height: "44px"
  text-action:
    textColor: "{colors.accent}"
    typography: "{typography.ui}"
    padding: "5px 0"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "11px 13px"
    height: "46px"
  navigation-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    typography: "{typography.ui}"
    rounded: "{rounded.control}"
    padding: "13px 14px"
    height: "48px"
  status-valid:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    typography: "{typography.micro}"
    rounded: "{rounded.tag}"
    padding: "4px 7px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-padding}"
  stock-cell:
    textColor: "{colors.ink}"
    typography: "{typography.quantity}"
    padding: "8px 2px"
    height: "64px"
---

# Design System: Pribadi · Manajemen Seragam

## Overview

**Creative North Star: "The School Stock Workspace"**

Pribadi’s school identity gives daily stock administration a clear, coherent home. White navigation and working surfaces carry navy text, while blue identifies actions, selected sizes, and active destinations. The official school logo sits directly on the sidebar with no colored box; retain its original red detail and proportions.

The workspace is compact and operational. Tables, direct Indonesian labels, visible quantities, and quick entry take priority. School identity comes from the palette, typography, and logo rather than decorative illustrations. The same language carries through stock lookup, movement, history, imports, and settings. Temporary shared mode hides application sign-in and officer management; the rail omits technical connection and shared-mode labels. Preserved account screens remain available when account enforcement is restored.

**Key Characteristics:**
- White working surfaces and navy hierarchy
- Blue actions, selection, and focus
- Self-hosted Geist and tabular quantities
- Horizontal size matrices and exact-cell movement handoff
- Name and total kept visible on mobile
- 44px touch targets, and a navigation rail that scrolls on short screens

## Colors

The school palette combines bright identity blue with a darker action blue and cool working neutrals. Frontmatter is normative.

### Primary

School Blue (`brand-blue`) marks identity and the connected indicator. Action Blue (`accent`) provides legible actions, active navigation, selected filters, valid status, and size highlights. Navy (`brand-navy` and `ink`) anchors typography, toast messages, and exported workbook headers.

**The School Identity Rule.** Use the school blue and navy roles consistently across every screen and exported interface; preserve the official logo artwork.

**The Legible Action Rule.** Use Action Blue for text and filled actions. School Blue is an identity accent, not a substitute for the darker action color.

### Secondary

Error Red and its pale background communicate validation failures and low-stock cells. Attention Amber and its pale background communicate stock warnings and outgoing activity. Pair status colors with explicit Indonesian words such as Menipis, Kosong, and Valid.

### Neutral

White surfaces hold editable fields and data. Cool Ground separates the workspace from those surfaces; Soft Surface distinguishes headers and secondary areas. Muted Ink carries supporting labels, and Divider defines rows and section boundaries. The light rail uses the same white, navy, and muted ink roles as working surfaces.

## Typography

**Display and Body Font:** Geist, with the system and Arial fallbacks recorded in frontmatter. Geist is self-hosted through the 400, 500, and 600 Latin font files (a 700 file used to ship but no screen used it); new interface text uses these available weights. The 400 and 600 files are preloaded in `index.html`.

The type is direct and compact. Headings establish the destination, body copy explains the task, and small supporting text stays secondary. Numeric quantities use tabular figures so changes do not disrupt alignment.

### Hierarchy

One family, ten steps. Every piece of text takes a role, never a loose size. The scale is written in rem (1rem = 16px), so browser font settings and zoom still resize the interface. Nothing renders below 11px, and the 11px step is only for tags, units and system text.

- **Headline (32px; 26px on phones, 24px under 400px):** the page destination, weight 600, tight tracking, balanced wrapping.
- **Title (18px):** panel, matrix and preview headings.
- **Lead number (44px) and Metric (36px):** the overview totals. They step down to 38/32px under 1250px and 34/30px under 1050px.
- **Figure (24px):** the app title under the logo, matrix totals and the purchase total.
- **Quantity (16px):** the number in each size cell, weight 600, with weight 400 for zero.
- **Body (14px):** page introductions (65ch maximum) and form group headings at weight 600.
- **UI (13px):** navigation, buttons, tabs, table cells, panel descriptions and form labels. Phones keep this size; controls never shrink on small screens.
- **Label (12px):** table headers, helper text, captions and activity detail.
- **Micro (11px):** level tags, badges, size-cell units and states, the connection note and the footer.

Weights in use are 400, 500 and 600, the three files that are loaded. Numerals are tabular in tables, metrics, stock preview and purchase review so columns line up. A metric-matched Arial fallback (`Geist Fallback`) keeps the layout from jumping while Geist loads.

**The Quantity Rule.** Show the complete quantity, its size-system context, and a readable unit or state. Do not truncate numeric data to make a table fit.

## Layout

The desktop shell uses a white navigation rail (248px) and a flexible workspace. The topbar is 76px high. Main content is centered within a 1480px maximum width, with 36px side insets and a 36px top inset. Working panels use the panel-padding token (the movement and preview panels use 26–28px); related desktop sections use gaps of 22–24px. The overview and movement screens pair a flexible column with a 300–310px side column.

At 1250px and below, the rail becomes 224px, content insets become 26px, and panel padding drops to 18px. At 1050px and below, the dashboard, movement, import, and settings columns collapse and the overview totals step down in size. At 768px and below, navigation becomes a 248px off-canvas drawer with a dim navy backdrop, the topbar becomes 64px high, and content uses the mobile-inset token. Metrics form a two-column grid. Below 400px, form fields form one column.

**Short and touch screens.** The rail scrolls on its own when the screen is shorter than its content, so no destination is ever out of reach. Under 560px of height (a phone held sideways) its logo block and rows tighten to 44px. On coarse pointers (touch) every icon button, tab, filter, text link and pagination button reaches a 44px target; a mouse sees the compact sizes.

The mobile overview keeps each uniform name and its total together. Intermediate category and old/new breakdown columns are hidden only in that overview; its total remains visible. Inventory retains horizontal size matrices instead of collapsing each size into a card. Matrix tables scroll within their own surface, and the size-system label remains sticky on the left. Desktop matrix minimum width is 860px; mobile is 820px. Header totals remain outside the scroller.

Keep uniform name and total visible around the horizontal matrix, and keep size-system identity attached to the quantities while scrolling.

## Elevation & Depth

This is a mostly flat system. White and soft surfaces, thin divider strokes, and spacing establish depth. The selected movement segment is a bordered white control with no shadow. Toasts use the ambient shadow; drawer depth comes from its navy backdrop. Avoid adding heavy shadows to ordinary panels.

Shadow vocabulary: panels carry a near-invisible ambient hairline (`0 2px 8px #12233c04`); a filled primary button gains `0 3px 9px #0069aa18` on hover; the photo zoom hint uses `0 1px 3px #12233c26`; toasts use `0 8px 30px #12233c14`. Motion is restrained: buttons, rail items, size cells and links ease color and background changes over 0.18s; the page heading arrives with a 0.22s ease-out rise of 4px; the mobile drawer slides over 0.2s; pressed buttons move down 1px; reduced-motion preference disables all of it.

**The Flat Workspace Rule.** Give stock data a stable plane; reserve floating depth for transient feedback and navigation overlays.

## Shapes

Panels and the metrics block use the panel radius (16px); fields and main action controls use the control radius (10px). Alerts, the balance result and the segmented control use the soft radius (12px); tabs, selected segments and the dashed upload area use 8–9px; tags and badges use 5–6px; uniform photos use 7px (36px), 10px (64px) and 12px (120px) corners. The logo has no enclosing box; the sign-in content uses the entry radius. Thin borders structure surfaces and rows without turning every stock value into a separate card. The upload area uses a dashed border to identify file selection.

## Components

### Buttons

Primary actions are compact filled blue controls (44px minimum height, 13px, weight 600), with the primary frontmatter tokens and a darker hover that adds a faint blue lift. Secondary actions are white with a divider border and weight 500; hover adds a soft surface and stronger border. Text actions use blue, gain an underline on hover, and remain secondary to a filled action. Primary and secondary pressed states move down 1px. Disabled controls show half opacity and a disabled cursor.

All keyboard targets use a 3px focus outline with a 3px offset. Preserve text labels beside SVG icons where the action needs a destination or result.

### Inputs / Fields

Fields are white, thinly bordered, and gently rounded. Form controls have a minimum 46px height (search fields 48px) and 14px field text. Search fields combine an inline SVG with compact input text and a focus-within ring. Place the label above each form control; helper text explains old/new size rules or validation. Errors use explicit text on a pale red surface.

### Multi-uniform stock-out

A student purchase uses one recipient section and flat, numbered uniform groups separated by divider lines. The add and remove controls have 44px touch targets; adding a uniform focuses its name selector. Multiple items share a review showing every uniform, size system, quantity, and before/after balance. Insufficient balances retain explicit red text. The review stays available beside the desktop form and follows it on mobile. Mobile form controls use 16px text, and the form is disabled while saving.

### Navigation

The rail has the school logo directly on its surface, a white destination list, and account details at the bottom only when accounts are enabled. Navigation targets have a minimum 48px height (44px on short screens). Active destinations use pale blue, blue text, and weight 600, with no marker dot; hover uses a soft surface. On mobile, the menu opens the drawer and the backdrop closes it. A destination selection closes the drawer.

### Cards / Containers

Working panels use white, a divider border, the panel radius, and panel-padding. Data tables align within the panel rather than stacking card shadows. Metrics share one divided surface. Stock previews use a pale blue balance-result region to make the result of a change visible before saving.

### Chips / Status

Neutral tags show scope or role. Valid and incoming status use pale blue and blue text; outgoing status uses amber, and invalid status uses red. Never rely on the tint alone. Stock cells separately label empty and low quantities.

### Size Matrix

Headers identify each size, with a sticky first column identifying Ukuran lama or Ukuran baru. Cells are 64px tall and show an unabridged quantity plus a unit or stock-state label. Hover uses pale blue; selected columns use pale blue and blue text while other columns receive a soft surface. Low stock retains its explicit Menipis label.

Selecting a size through a header or the size filter centers that column in every applicable matrix scroller. Centering is recalculated after relevant filters and on resize. A stock-cell activation passes the exact uniform, size version, and size into the movement form; it defaults to Stok keluar and visibly shows the selected context and current balance. Changing to Stok masuk enforces the new size system.

### Import Preview

The import workflow uses the same panel, field, button, and status language. A dashed upload area uses a full-area native file input beneath an Indonesian blue choice control. Selected filenames wrap, keyboard focus outlines the area, and reading shows a busy state. It leads to explicit column mapping and source preview. The change table shows current, file, and resulting quantities. Valid status, validation errors, application mode, backup notice, and a separate confirmation checkbox precede the final action. Mobile preview tables scroll horizontally inside their panel.

## Do's and Don'ts

### Do:

- **Do** preserve the official Pribadi logo and use white, navy, and school blue across all screens.
- **Do** use Action Blue for legible actions and School Blue for identity accents.
- **Do** keep quantities complete, aligned with tabular figures, and paired with size context.
- **Do** preserve selected-size centering and exact-cell movement handoff.
- **Do** keep uniform names and totals visible on mobile.
- **Do** pair stock and validation colors with explicit Indonesian labels.
- **Do** respect the reduced-motion preference.
- **Do** give every piece of text a role from the type scale, and keep touch targets at 44px.

### Don't:

- **Don't** introduce an unrelated brand palette or recolor the official logo.
- **Don't** replace horizontal size matrices with disconnected cards.
- **Don't** hide or truncate quantities or the mobile overview total.
- **Don't** combine old and new size identity in a stock cell.
- **Don't** add heavy shadows to ordinary working panels.
- **Don't** use color alone to indicate low stock, empty stock, or validation.
- **Don't** set text below 11px or outside the type scale, or shrink controls on small screens.
- **Don't** let a short screen hide navigation: the rail scrolls instead.
- **Don't** use `content-visibility` on size matrices; selected-size centering needs every scroller measured.

## Application title and navigation copy

Manajemen Seragam is the application title beneath the school logo, set at 24px (the Figure step) with navy text and weight 600. Navigation omits Ruang kerja sekolah, database explanations, and shared-mode labels. The dashboard omits the two-size-system explanation card; inventory context and size-system labels remain attached to actual stock data.

## Taste modernisation · 2026-10-13

Direction: preserve the Pribadi identity while modernising a task-focused school inventory app. Use the existing React and CSS stack, white and navy surfaces, one blue action accent, the school logo, and self-hosted Geist in 400/500/600 weights.

Audit: the original hierarchy made four stock totals equally prominent, labels and tables were small, and spacing differed between stock, movement, and history screens. The update emphasises total inventory with a pale blue cell, strengthens page titles and numeric hierarchy, and aligns controls, table text, and spacing across the workflow. Navigation keeps its labels and highlights the selected destination without a decorative dot.

Desktop navigation is 248px wide, narrowing to 224px on compact screens; mobile uses the existing off-canvas drawer. Headlines use 32px desktop and 24–26px mobile. Controls use 44px or larger targets, 13–14px desktop text, and 16px mobile field text. Panels use 16px corners and controls use 10px corners. Hover and press feedback are restrained; the short page-heading entrance respects reduced motion.

Preserve the removed workspace/database/mode labels and explanation card. Stock matrices retain horizontal scrolling, exact-size handoff, and complete quantities. Multiple-item student purchases retain atomic saving, validation, and their complete before/after stock review.

## Staff on stock movements

Stok masuk and Stok keluar end with a required Staff selector after Catatan and before Save. Options are Anna Ratna, Afro Mutmainah, and Rahmawati, with no name selected by default. One selection applies to every uniform in a student purchase. The selected staff name is stored separately from the request actor, appears in activity lists, can be searched, and is included in history exports and backups. Legacy records keep their original attribution.

## Uniform photos

Each of the 21 uniforms has a studio photo, cropped by `scripts/uniform-images.py` to one 4:5 portrait frame with the garment centred at the same scale. Photos sit in a thin-bordered frame with a soft surface behind it and appear next to the uniform name, never instead of it: 36px in the overview table, beside every Nama seragam select, and in the purchase review; 64px (52px on mobile) on each Data stok card; 120px (104px on mobile) in the movement preview. The Data stok and preview photos open a larger photo in a modal dialog (Esc, backdrop or the 44px close button closes it; focus returns to the photo). Small photos are lazy-loaded WebP with reserved space, so nothing shifts while they load; they stay silent for screen readers because the name is beside them. A uniform without a photo shows the Shirt icon in the same frame.
