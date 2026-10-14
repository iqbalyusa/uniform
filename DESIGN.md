# Design

The uniform app uses the shared Pribadi design system. There is no separate design spec in this file any more.

1. **Brand:** [design-system/sekolah-pribadi-depok/MASTER.md](design-system/sekolah-pribadi-depok/MASTER.md). This is the school's design system, shared with the website and the Parent–Teacher Consultation app. It is a copy, so if the brand changes, update every copy.
2. **This app's rules:** [design-system/sekolah-pribadi-depok/pages/uniform-app.md](design-system/sekolah-pribadi-depok/pages/uniform-app.md). These are the flat app style (the same as the appointment app), the stock status colours, the data-dense type scale and the "no coloured icon tiles" rule. Where they differ, this file wins over MASTER.md.
3. **Tokens:** `app/globals.css` (`:root`). Every colour, radius and type size comes from a token there.

In short, the app uses:
- Inter, navy `#12233c` headings and action blue `#0172bb`
- a `#f2f5f9` page with white cards and 1px navy-tinted borders
- 8px buttons, and no shadows, gradients or icon tiles
- orange only for low stock
