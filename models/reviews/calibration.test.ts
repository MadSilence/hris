import { buildNineBox, canDropInto, formatAverage, nineBoxKey, performanceBand, shares } from "./calibration";
import type { CalibrationRow, ScalePoint } from "./index";

const scale = (n: number): ScalePoint[] => Array.from({ length: n }, (_, i) => ({ value: i + 1, label: `P${i + 1}` }));

const row = (over: Partial<CalibrationRow>): CalibrationRow => ({
  participantId: "p",
  subject: { userId: "u", name: "Ann" },
  department: null,
  manager: null,
  status: "COLLECTING",
  managerReviewIn: true,
  managerRating: 3,
  finalRating: 3,
  potential: null,
  calibrated: false,
  calibrationReason: null,
  calibratedBy: null,
  calibratedAt: null,
  shared: false,
  editable: true,
  lockedReason: null,
  ...over,
});

describe("performanceBand", () => {
  it("cuts a five-point scale into 1–2, 3 and 4–5", () => {
    expect([1, 2, 3, 4, 5].map((r) => performanceBand(r, scale(5)))).toEqual(["LOW", "LOW", "MID", "HIGH", "HIGH"]);
  });

  it("gives a three-point scale a point per third and a two-point one low and high", () => {
    expect([1, 2, 3].map((r) => performanceBand(r, scale(3)))).toEqual(["LOW", "MID", "HIGH"]);
    expect([1, 2].map((r) => performanceBand(r, scale(2)))).toEqual(["LOW", "HIGH"]);
    expect([1, 2, 3, 4].map((r) => performanceBand(r, scale(4)))).toEqual(["LOW", "MID", "MID", "HIGH"]);
  });

  it("has no band for no rating or one off the scale", () => {
    expect(performanceBand(null, scale(5))).toBeNull();
    expect(performanceBand(7, scale(5))).toBeNull();
  });
});

describe("buildNineBox", () => {
  it("places people by rating and potential and keeps the rest in the tray", () => {
    const rows = [
      row({ participantId: "a", finalRating: 5, potential: "HIGH" }),
      row({ participantId: "b", finalRating: 1, potential: "MEDIUM" }),
      row({ participantId: "c", finalRating: 4, potential: null }),
      row({ participantId: "d", finalRating: null, potential: "LOW" }),
    ];
    const box = buildNineBox(rows, scale(5));
    expect(box.cells.get(nineBoxKey("HIGH", "HIGH"))?.map((r) => r.participantId)).toEqual(["a"]);
    expect(box.cells.get(nineBoxKey("LOW", "MEDIUM"))?.map((r) => r.participantId)).toEqual(["b"]);
    expect(box.unplaced.map((r) => r.participantId)).toEqual(["c", "d"]);
  });
});

describe("canDropInto", () => {
  it("lets a card move along its own performance row only (A9)", () => {
    const r = row({ finalRating: 4 });
    expect(canDropInto(r, "HIGH", scale(5))).toBe(true);
    expect(canDropInto(r, "MID", scale(5))).toBe(false);
    expect(canDropInto(row({ finalRating: 4, editable: false }), "HIGH", scale(5))).toBe(false);
    expect(canDropInto(row({ finalRating: null }), "LOW", scale(5))).toBe(false);
  });
});

describe("shares", () => {
  it("turns counts into whole percentages, and nothing into zeros", () => {
    expect(shares([1, 1, 2])).toEqual([25, 25, 50]);
    expect(shares([0, 0])).toEqual([0, 0]);
  });

  it("formats an average to two places", () => {
    expect(formatAverage(3.5)).toBe("3.50");
    expect(formatAverage(null)).toBe("—");
  });
});
