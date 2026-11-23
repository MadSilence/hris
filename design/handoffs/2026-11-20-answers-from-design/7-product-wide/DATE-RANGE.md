# Picked date range — one look everywhere (Ulia, 20 Nov 2026)

Applies to every month grid where a range of days is picked or shown:
- the request time off window (Q13–Q17, Q13h);
- the request in full (Q29b, Q30–Q30f, AQ16a–d);
- the shared date picker in range mode (AQ-02);
- attendance range picking, the reports period, the calendar's period picker.

## Rule
- **The end days** — the first and last day — are filled circles in the accent, with a white number in 600.
- **The band** between them is `color-mix(in srgb, var(--accent) 6%, #fff)`.
- **Where the band ends.** It runs from the centre of the first circle to the centre of the last. It never reaches the edges of the end cells, and has no rounded ends: the circles round it.
- **Band height = circle size:** 34 in the request windows (38 cells), 30 in the 34-high grids. Never the full cell height.
- **Days inside** keep normal text on the band. Weekends inside take the band too.
- **A range of one day** is just the circle.
- **A range that starts in the previous month** shows the band from the left edge of the grid to the first visible end circle (AQ02).

## Board CSS (cal.css, the shared rule — exact)
```css
.rm-g .rm-d.sel,.cl-cal .rm-g .rm-d.we.sel{border-radius:0;background:linear-gradient(color-mix(in srgb,var(--accent) 6%,#fff),color-mix(in srgb,var(--accent) 6%,#fff)) center/100% calc(100% - 4px) no-repeat}
.rm-g .rm-d.sel.s0{background:linear-gradient(to right,transparent 50%,color-mix(in srgb,var(--accent) 6%,#fff) 50%) center/100% calc(100% - 4px) no-repeat}
.rm-g .rm-d.sel.s1{background:linear-gradient(to left,transparent 50%,color-mix(in srgb,var(--accent) 6%,#fff) 50%) center/100% calc(100% - 4px) no-repeat}
.rm-g .rm-d.sel.s0.s1{background:none}
```
The full cal.css is in `1-time-off/screens/profile-time-off-answers/export/assets/cal.css`.

## Measured in
`1-time-off/measurements/profile-time-off-answers/` — Q13h, AQ16a–d and AQ02 (every `rm-d` cell, with its background).
