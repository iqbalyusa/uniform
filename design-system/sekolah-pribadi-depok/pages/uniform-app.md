# Page override: Uniform inventory app (uniform.pribadidepok.sch.id)

> Per MASTER.md's LOGIC rule, this file extends/overrides `../MASTER.md` for the
> uniform inventory app only. Everything not listed here follows MASTER.md
> unchanged: palette, Inter, the bold-label + lighter-supporting-line hierarchy,
> 8px rhythm, motion timings, the reduced-motion rule, "no emojis as icons",
> visible focus, and "every colour traces to a role".
> Tokens live in `app/globals.css` (`:root`), the single place to change them.
>
> The app rules below are the same ones the Parent–Teacher Consultation app
> ships (`pages/appointment-app.md`), so every Pribadi app looks and behaves
> alike. Only the stock-status colours and the data-dense details are new.

## 1. Same app rules as the appointment app

- **Action blue.** White on `--color-primary` (#18a8fa) is 2.62:1 and fails
  WCAG AA. Every interactive fill and every piece of blue text uses
  `--color-action` = `--color-gradient-start` (#0172bb, 5.09:1). Hover is
  `--color-action-hover` = color-mix(gradient-start 80%, foreground). #18a8fa
  stays as a brand accent for tints only.
- **Flat surfaces.** No decorative shadows or gradients. Cards, tables and
  inputs are separated by 1px `--color-border-strong` (rgba(18,35,60,.16));
  hairline dividers inside them use `--color-border` (.08). Only things that
  float above the page (toast, photo dialog, open mobile menu) cast one soft
  shadow, `--shadow-e4`.
- **Corners:** 6 / 8 / 12 / 16px (`--radius-sm…xl`). Buttons and inputs are
  8px rectangles, cards 12px, dialogs 16px. No pills.
- **Interaction:** hover and press change colour, background or border only.
  No lifts, no scale. Transitions 150ms.
- **Tabs:** underline tabs (2px `action` bar), not filled pills.
- **Live indicator:** the "Terhubung" dot is `--color-live` (brand teal);
  grey when the connection drops.
- **Font:** Inter is bundled with the app (`@fontsource/inter`, 400/500/600/700)
  instead of loaded from Google Fonts, because the server's Content Security
  Policy only allows the app's own files. A metric-matched Arial fallback
  prevents layout shift while it loads.

## 2. No colored icon tiles (new rule)

Icons are monochrome line icons (lucide-react) in the current text colour,
16–18px, with no background tile, circle or badge. Keep an icon only where it
helps scanning: navigation, buttons, row actions, notices. The number cards,
activity rows, panel titles, settings rows and loading screen carry no icons.
This deliberately does **not** use MASTER's "rounded-square gradient badge":
that belongs to the marketing website; in a data tool it reads as decoration.

## 3. Stock status colours (new)

Each status combines colour with a word, so colour is never the only cue.

| Status | Background | Text | Notes |
|---|---|---|---|
| Normal stock | `surface` | `foreground` | number + "pcs" |
| Menipis (below the limit) | `--color-warning-tint` | `--color-warning` | number + "Menipis"; orange dot in the legend |
| Kosong (0) | `surface` | `muted-foreground` | number + "Kosong"; deliberately calm, there are hundreds of empty sizes |
| Selected size / hover | `action-tint` | `action` | |

`--color-warning` is the MASTER accent darkened toward navy:
color-mix(accent 70%, foreground) ≈ #af512a, 5.2:1 on white. MASTER reserves
the raw orange for human elements; the darkened mix is a separate warning role
derived from it, used only for low stock (cells, the "Perlu diperiksa" count,
and the alert banner). Errors use `--color-destructive`.

**History labels (owner request):** "Keluar" is a red box (`destructive` on `destructive-tint` with a 1px ring) and "Masuk" a green box (`--color-success` #15803d on `success-tint`). Green is an app extension outside MASTER, used only for these Masuk/valid labels.

Notices are a palette tint with navy text and a 1px border of the same hue:
`action-tint` for information, `warning-tint` for the low-stock alert,
`destructive-tint` for errors.

## 4. Data-dense type scale

MASTER's em scale is for the website. The app uses one rem scale on Inter
(nothing below 12px):

| Role | Size / weight |
|---|---|
| Page title | 24px / 700 |
| Card title | 16–18px / 700 |
| Body, table cells | 14px / 400 |
| Controls, secondary text | 13px / 500–600 |
| Captions, table headers, units | 12px / 500–600 |
| Stock quantity in the grid | 15px / 600 |
| Metric figures | 32px / 700, tabular numbers |

All quantities use tabular figures so columns line up. On phones, text inside
fields is 16px so the browser does not zoom in on focus.

## 5. Pre-delivery checklist (in addition to MASTER's)

- [ ] No icon inside a coloured tile or circle
- [ ] Interactive blue is `--color-action`, never `--color-primary`
- [ ] No shadow except `--shadow-e4` on floating layers
- [ ] Every status shows a word, not only a colour
- [ ] Touch targets ≥44px on touch screens
