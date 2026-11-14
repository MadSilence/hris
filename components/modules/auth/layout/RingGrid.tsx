/*
 * The ring grid of the login screens (sign-in-root/spec.md § Common): an even grid of noddo rings with a few light
 * ("hot") ones that nod on the designers' scripted 24 s loop — one ring, then a pair, never more than two at once.
 * The keyframes (`rn6x4x4-*`, `rn7x1x2-*`, `rn6x3x3-*`) are theirs, in styles/globals.css, and stop under
 * prefers-reduced-motion. Decorative: hidden from assistive technology.
 */

type Ring = { cx: number; cy: number; hot?: string };

type Layout = { width: number; height: number; r: number; stroke: number; rings: Ring[] };

const grid = (cols: number, rows: number, step: number, first: number, hot: Record<string, string>, drop: Record<string, number> = {}): Ring[] => {
  const rings: Ring[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = `${col},${row}`;
      rings.push({ cx: first + col * step, cy: first + row * step + (drop[key] ?? 0), hot: hot[key] });
    }
  }
  return rings;
};

/** The pane: 6 × 4, one hot ring sits 9 px low — the nod held still. */
const PANE: Layout = {
  width: 408, height: 271, r: 17, stroke: 6,
  rings: grid(6, 4, 73.6, 20, { "2,0": "rn6x4x4-0", "4,1": "rn6x4x4-1", "1,2": "rn6x4x4-2", "5,3": "rn6x4x4-3" }, { "4,1": 9 }),
};

/** The phone's strip: one row of seven. */
const STRIP: Layout = {
  width: 335, height: 39, r: 12, stroke: 5,
  rings: Array.from({ length: 7 }, (_, i) => ({ cx: 14.5 + i * 51, cy: 14.5, hot: i === 2 ? "rn7x1x2-0" : i === 5 ? "rn7x1x2-1" : undefined })),
};

/** The invitation's pane: 6 × 3. */
const INVITATION: Layout = {
  width: 408, height: 197, r: 17, stroke: 6,
  rings: grid(6, 3, 73.6, 20, { "1,0": "rn6x3x3-0", "4,1": "rn6x3x3-1", "2,2": "rn6x3x3-2" }, { "4,1": 9 }),
};

const LAYOUTS = { pane: PANE, strip: STRIP, invitation: INVITATION } as const;

/**
 * `hotColors`: the colours the nodding rings take in turn — a logo's colours on a Light pane (sign-in-appearance);
 * without them the stylesheet paints them in the company colour.
 */
export function RingGrid({
  layout,
  className,
  hotColors,
}: {
  layout: keyof typeof LAYOUTS;
  className?: string;
  hotColors?: string[];
}) {
  const { width, height, r, stroke, rings } = LAYOUTS[layout];
  const hotRings = rings.filter((ring) => ring.hot);
  const strokeOf = (ring: Ring) =>
    hotColors?.length ? { stroke: hotColors[hotRings.indexOf(ring) % hotColors.length] } : {};
  return (
    <svg
      className={["auth-rings block max-w-full", className].filter(Boolean).join(" ")}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {rings.map((ring) => (
        <circle
          key={`${ring.cx}-${ring.cy}`}
          className={ring.hot ? "hot" : undefined}
          style={ring.hot ? { animationName: ring.hot, ...strokeOf(ring) } : undefined}
          cx={ring.cx}
          cy={ring.cy}
          r={r}
          strokeWidth={stroke}
        />
      ))}
    </svg>
  );
}
