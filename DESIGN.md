---
name: "Pribadi · Manajemen Seragam"
description: "A clear school stock workspace in Pribadi white and blue"
colors:
  bg: "#f6f8fc"
  surface: "#fff"
  surface-soft: "#f4f7fc"
  ink: "#12233c"
  muted: "#586b83"
  line: "#dfe6ef"
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
  dark-bg: "#0b1526"
  dark-surface: "#13233a"
  dark-surface-soft: "#182b46"
  dark-ink: "#edf4fd"
  dark-muted: "#adbed4"
  dark-line: "#30435e"
  dark-accent: "#7dccfa"
  dark-accent-hover: "#ade1ff"
  dark-accent-soft: "#193b59"
  dark-rail: "#102037"
  dark-red: "#f3a99f"
  dark-red-soft: "#462d29"
  dark-amber: "#e9c58a"
  dark-amber-soft: "#3a3223"
typography:
  headline:
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "29px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-.03em"
  title:
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-.015em"
  body:
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  metric:
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-.03em"
rounded:
  panel: "14px"
  control: "8px"
  brand: "12px"
  entry: "18px"
  tag: "5px"
spacing:
  control-gap: "10px"
  panel-padding: "22px"
  desktop-inset: "36px"
  mobile-inset: "16px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
    height: "40px"
  text-action:
    textColor: "{colors.accent}"
    padding: "5px 0"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 11px"
    height: "42px"
  navigation-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    padding: "12px"
    height: "44px"
  status-valid:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.tag}"
    padding: "4px 7px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-padding}"
  stock-cell:
    textColor: "{colors.ink}"
    padding: "8px 2px"
    height: "64px"
---

# Design System: Pribadi · Manajemen Seragam

## Overview

**Creative North Star: "The School Stock Workspace"**

Pribadi’s school identity gives daily stock administration a clear, coherent home. White navigation and working surfaces carry navy text, while blue identifies actions, selected sizes, and active destinations. The official school logo sits directly on the sidebar with no colored box; retain its original red detail and proportions.

The workspace is compact and operational. Tables, direct Indonesian labels, visible quantities, and quick entry take priority. School identity comes from the palette, typography, and logo rather than decorative illustrations. The same language carries through stock lookup, movement, history, imports, settings, and the optional navy dark theme. Temporary shared mode hides application sign-in and officer management; the rail identifies Mode bersama instead of an officer or role. Preserved account screens remain available when account enforcement is restored.

**Key Characteristics:**
- White working surfaces and navy hierarchy
- Blue actions, selection, and focus
- Self-hosted Inter and tabular quantities
- Horizontal size matrices and exact-cell movement handoff
- Name and total kept visible on mobile

## Colors

The school palette combines bright identity blue with a darker action blue and cool working neutrals. Frontmatter is normative for both themes; dark-prefixed tokens are the implemented dark overrides.

### Primary

School Blue (`brand-blue`) marks identity and the connected indicator. Action Blue (`accent`) provides legible actions, active navigation, selected filters, valid status, and size highlights. Navy (`brand-navy` and `ink`) anchors typography, toast messages, and exported workbook headers.

**The School Identity Rule.** Use the school blue and navy roles consistently across every screen and exported interface; preserve the official logo artwork.

**The Legible Action Rule.** Use Action Blue for text and filled actions. School Blue is an identity accent, not a substitute for the darker action color.

### Secondary

Error Red and its pale background communicate validation failures and low-stock cells. Attention Amber and its pale background communicate stock warnings and outgoing activity. Pair status colors with explicit Indonesian words such as Menipis, Kosong, and Valid.

### Neutral

White surfaces hold editable fields and data. Cool Ground separates the workspace from those surfaces; Soft Surface distinguishes headers and secondary areas. Muted Ink carries supporting labels, and Divider defines rows and section boundaries. The light rail uses the same white, navy, and muted ink roles as working surfaces.

Dark mode maps these roles to the dark-prefixed tokens: deep navy ground, navy surfaces, light text, blue-gray borders, and light blue actions. The rail uses `dark-rail`, and focus uses `dark-accent`. Red and amber retain their meaning with the dark semantic tokens. The school logo has a transparent background in either theme.

## Typography

**Display and Body Font:** Inter, with the system and Arial fallbacks recorded in frontmatter. Inter is self-hosted through the 400, 500, 600, and 700 Latin font files; new interface text uses these available weights.

The type is direct and compact. Headings establish the destination, body copy explains the task, and small supporting text stays secondary. Numeric quantities use tabular figures so changes do not disrupt alignment.

### Hierarchy

- **Headline:** frontmatter headline role; mobile headings reduce to 24px.
- **Title:** frontmatter title role; panel and matrix headings use 15px, reducing to 14px on mobile.
- **Body:** frontmatter body role; explanatory page text uses 13px with a 1.6 line height.
- **Label:** frontmatter label role; navigation and action labels use 12px, with 11px supporting labels and 10px stock-state labels.
- **Metric:** frontmatter metric role; totals reduce to 30px on compact and mobile layouts. Matrix totals use 22px, reducing to 19px on mobile.
- **Stock quantity:** 15px, weight 600, with tabular figures and a separate state or unit label.

**The Quantity Rule.** Show the complete quantity, its size-system context, and a readable unit or state. Do not truncate numeric data to make a table fit.

## Layout

The desktop shell uses a white navigation rail (240px) and a flexible workspace. The topbar is 72px high. Main content is centered within a 1540px maximum width, with desktop side insets from frontmatter and a 32px top inset. Working panels generally use the panel-padding token; related desktop sections use gaps of 22–24px.

At 1250px and below, the rail becomes 220px and content insets become 26px. At 1050px and below, the dashboard, movement, import, and settings columns collapse. At 768px and below, navigation becomes a 240px drawer with a dim navy backdrop, the topbar becomes 60px high, and content uses the mobile-inset token. Metrics form a two-column grid. Below 400px, form fields form one column.

The mobile overview keeps each uniform name and its total together. Intermediate category and old/new breakdown columns are hidden only in that overview; its total remains visible. Inventory retains horizontal size matrices instead of collapsing each size into a card. Matrix tables scroll within their own surface, and the size-system label remains sticky on the left. Desktop matrix minimum width is 860px; mobile is 820px. Header totals remain outside the scroller.

Keep uniform name and total visible around the horizontal matrix, and keep size-system identity attached to the quantities while scrolling.

## Elevation & Depth

This is a mostly flat system. White and soft surfaces, thin divider strokes, and spacing establish depth. The selected movement segment is a bordered white control with no shadow. Toasts use the ambient shadow; drawer depth comes from its navy backdrop. Avoid adding heavy shadows to ordinary panels.

The toast shadow follows the implemented theme variable: light uses `0 8px 30px #12233c14`, dark uses `0 8px 30px #000e2738`. Motion is restrained: the mobile drawer uses a 0.2s ease transition, buttons move down 1px while pressed, and reduced-motion preference disables transitions and animation.

**The Flat Workspace Rule.** Give stock data a stable plane; reserve floating depth for transient feedback and navigation overlays.

## Shapes

Panels use the frontmatter panel radius; fields and main action controls use the control radius. The logo has no enclosing box; the sign-in content uses the entry radius. Tags are smaller and tighter. Thin borders structure surfaces and rows without turning every stock value into a separate card. The upload area uses a dashed border to identify file selection.

## Components

### Buttons

Primary actions are compact filled blue controls, with the primary frontmatter tokens and a darker hover. Secondary actions are white with a divider border and weight 500; hover adds a soft surface and stronger border. Text actions use blue, gain an underline on hover, and remain secondary to a filled action. Primary and secondary pressed states move down 1px. Disabled controls show half opacity and a disabled cursor.

All keyboard targets use a 3px theme-aware focus outline with a 3px offset. Preserve text labels beside SVG icons where the action needs a destination or result.

### Inputs / Fields

Fields are white, thinly bordered, and gently rounded. Form controls have a minimum 42px height and 13px field text. Search fields combine an inline SVG with compact input text and a focus-within ring. Place the label above each form control; helper text explains old/new size rules or validation. Errors use explicit text on a pale red surface.

### Multi-uniform stock-out

A student purchase uses one recipient section and flat, numbered uniform groups separated by divider lines. The add and remove controls have 44px touch targets; adding a uniform focuses its name selector. Multiple items share a review showing every uniform, size system, quantity, and before/after balance. Insufficient balances retain explicit red text. The review stays available beside the desktop form and follows it on mobile. Mobile form controls use 16px text, and the form is disabled while saving.

### Navigation

The rail has the school logo directly on its surface, a white destination list, and the current shared-mode indicator at the bottom (account details when accounts are enabled). Navigation targets have a minimum 44px height. Active destinations use pale blue, blue text, weight 700, and a blue dot; hover uses a soft surface. On mobile, the menu opens the drawer and the backdrop closes it. A destination selection closes the drawer.

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
- **Do** respect dark-theme role mapping and reduced-motion preference.

### Don't:

- **Don't** introduce an unrelated brand palette or recolor the official logo.
- **Don't** replace horizontal size matrices with disconnected cards.
- **Don't** hide or truncate quantities or the mobile overview total.
- **Don't** combine old and new size identity in a stock cell.
- **Don't** add heavy shadows to ordinary working panels.
- **Don't** use color alone to indicate low stock, empty stock, or validation.
