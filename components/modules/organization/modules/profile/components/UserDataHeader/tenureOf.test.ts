import { translatorFor } from "@/test/nextIntl";
import { tenureOf } from "./UserDataHeader";

type Translator = Parameters<typeof tenureOf>[0];

/** "With us" in the person header never rounds up (the designers' hub fixes Z2, 2026-11-19). */
describe("tenureOf", () => {
  const t = translatorFor("organization") as unknown as Translator;
  const today = new Date(2026, 10, 19);

  it("says Joined today on the first day, not a week", () => {
    expect(tenureOf(t, "2026-11-19", today)).toBe("Joined today");
  });

  it("counts days under a week, then whole weeks", () => {
    expect(tenureOf(t, "2026-11-18", today)).toBe("1 day");
    expect(tenureOf(t, "2026-11-13", today)).toBe("6 days");
    expect(tenureOf(t, "2026-11-12", today)).toBe("1 week");
    expect(tenureOf(t, "2026-10-30", today)).toBe("2 weeks");
  });

  it("has nothing before the first day", () => {
    expect(tenureOf(t, "2026-11-20", today)).toBeNull();
  });
});
