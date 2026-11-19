# Design fixes — Edit home, round 2 (Ulia, 18 Nov)

Two fixes to Edit home (`/dashboard` in edit mode). Same rules as the Home package `design-fixes-round-1` (E1–E21). Screenshots of the live state are in this folder.

| # | Where | Now | Must be |
|---|---|---|---|
| EH1 | A widget on the page in edit mode — the size tag and the remove button (`widget-edit-controls-now.png`) | Two round controls on the widget's corners: the **remove "−"** (22 × 22, white, shadow-2, red #C42B1C minus 12) on the **top-left** corner (−9, −9), and a **size tag** "S" / "M" / "L" (18 high, 12/16 600 #45454A on white, padding 0 6, shadow-2) on the **top-right** corner (right −8, top −7) | **Remove the size tag entirely** — in edit mode the widget's size is not shown on the widget (it is changed in the panel and the size popover, as now). **The remove "−" moves to the top-right corner**: same control (22 × 22, radius full, white, shadow `0 1px 2px rgba(11,11,12,.06), 0 4px 12px rgba(11,11,12,.08)`, minus icon 12 #C42B1C), placed `top:-9px; right:-9px`. Nothing on the top-left corner. Widgets that can't be removed (Waiting on you, My time) still show no "−". |
| EH2 | Widget panel — a row on hover (`panel-row-hover-now.png`) | The hover fill #F3F3F5 covers the row from edge to edge with **no inner spacing** (padding 12 0): it runs straight into the preview tile, whose own background is the **same #F3F3F5**, so the preview's frame disappears; the "+" button sits on the fill's right edge, half outside it. It looks broken | The hover fill sits **around** the content: on hover the row gets `margin: 0 -12px; padding: 12px; border-radius: 12px; background: #F7F7F8` (Mist), so there is 12 of fill on every side of the preview and of the "+". The preview tile keeps #F3F3F5 and stays readable on it; the "+" stays inside the fill, 12 from its right edge. The hairline between rows stays (E19). No other change on hover: the "+" keeps its 1 px #6E1630 border and icon. |

Words: none change.
