import { formatMoment } from "./moment";

describe("formatMoment", () => {
  it("reads a zone-less backend moment as UTC", () => {
    expect(formatMoment("2026-10-16T08:00:00")).toBe(formatMoment("2026-10-16T08:00:00Z"));
    expect(formatMoment(null)).toBe("");
  });
});
