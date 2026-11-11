import { ago } from "./ago";


describe("how long ago a request was made", () => {
  it("reads the backend's zone-less timestamp as UTC (walk of 2026-11-11)", () => {
    const now = Date.parse("2026-11-11T19:08:37Z");
    expect(ago("2026-11-11T19:07:31.794612", "en", now)).toBe("1 min. ago");
  });

  it("reads a timestamp that names its zone as it is", () => {
    const now = Date.parse("2026-11-11T19:00:00Z");
    expect(ago("2026-11-11T17:00:00Z", "en", now)).toBe("2 hr. ago");
  });
});
