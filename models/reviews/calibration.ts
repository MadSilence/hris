import type { CalibrationRow, ReviewPotential, ScalePoint } from "./index";

/** The 9-box's performance axis: the final rating in thirds of the cycle's scale (REVIEWS_PLAN.md 12.2). */
export type PerformanceBand = "LOW" | "MID" | "HIGH";

export const PERFORMANCE_BANDS: PerformanceBand[] = ["HIGH", "MID", "LOW"];

export const PERFORMANCE_BAND_LABELS: Record<PerformanceBand, string> = {
  HIGH: "High Performance",
  MID: "Mid Performance",
  LOW: "Low Performance",
};

/**
 * Which third of the scale a rating falls in. The points are placed evenly from 0 (the lowest) to 1 (the highest):
 * below a third is low, above two thirds high, the rest mid — so a five-point scale reads 1–2 low, 3 mid, 4–5 high,
 * a three-point one a point each, and a two-point one low and high. A rating off the scale has no band.
 */
export const performanceBand = (rating: number | null, scale: ScalePoint[]): PerformanceBand | null => {
  if (rating == null || scale.length === 0) return null;
  const values = scale.map((s) => s.value).sort((a, b) => a - b);
  const index = values.indexOf(rating);
  if (index < 0) return null;
  if (values.length === 1) return "MID";
  const position = index / (values.length - 1);
  if (position < 1 / 3) return "LOW";
  if (position > 2 / 3) return "HIGH";
  return "MID";
};

export type NineBoxKey = `${PerformanceBand}:${ReviewPotential}`;

export const nineBoxKey = (band: PerformanceBand, potential: ReviewPotential): NineBoxKey => `${band}:${potential}`;

export type NineBox = {
  cells: Map<NineBoxKey, CalibrationRow[]>;
  /** No potential yet, or no rating to place them by. */
  unplaced: CalibrationRow[];
};

/** People into the grid by their final rating and potential; everybody missing either waits in the tray. */
export const buildNineBox = (rows: CalibrationRow[], scale: ScalePoint[]): NineBox => {
  const cells = new Map<NineBoxKey, CalibrationRow[]>();
  const unplaced: CalibrationRow[] = [];
  for (const row of rows) {
    const band = performanceBand(row.finalRating, scale);
    if (band == null || row.potential == null) {
      unplaced.push(row);
      continue;
    }
    const key = nineBoxKey(band, row.potential);
    cells.set(key, [...(cells.get(key) ?? []), row]);
  }
  return { cells, unplaced };
};

/**
 * Where a card may be dropped (A9): only a box of its own performance row — dragging changes potential, never the
 * rating, which changes in the table where the reason is asked. A person with no rating has no row to go to.
 */
export const canDropInto = (row: CalibrationRow, band: PerformanceBand, scale: ScalePoint[]): boolean =>
  row.editable && performanceBand(row.finalRating, scale) === band;

/** Whole percentages of the total, for the distribution bars; zero of zero is zero. */
export const shares = (counts: number[]): number[] => {
  const total = counts.reduce((sum, n) => sum + n, 0);
  return counts.map((n) => (total === 0 ? 0 : Math.round((n / total) * 100)));
};

/** "3.25", or a dash when nobody is rated. */
export const formatAverage = (value: number | null): string => (value == null ? "—" : value.toFixed(2));
