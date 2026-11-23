import { alsoAway, backDay, pillSuffix } from "@/components/modules/calendar/lib/leaveText";
import type { CompanyCalendarAbsence } from "@/models/calendar";

const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
const leave = (over: Partial<CompanyCalendarAbsence> = {}): CompanyCalendarAbsence => ({
  userId: "u1",
  startDate: "2026-11-16",
  endDate: "2026-11-20",
  status: "APPROVED",
  ...over,
});

describe("what a pill and a card say", () => {
  it("is back on the next working day", () => {
    expect(backDay("2026-11-20", weekend)).toBe("2026-11-23");
    expect(backDay("2026-11-17", weekend)).toBe("2026-11-18");
  });

  it("says the length in a month, the dates in a week, and where a long leave ends", () => {
    expect(pillSuffix(leave({ amount: 5, unit: "DAYS" }), "month", weekend)).toEqual({ kind: "amount", amount: 5, unit: "DAYS" });
    expect(pillSuffix(leave(), "month", weekend)).toEqual({ kind: "none" });
    expect(pillSuffix(leave(), "week", weekend)).toEqual({ kind: "dates", start: "2026-11-16", end: "2026-11-20" });
    expect(pillSuffix(leave({ endDate: "2027-01-01", amount: 34 }), "month", weekend)).toEqual({ kind: "back", date: "2027-01-04" });
  });

  it("reads the request's own dates, not the ones cut to the window", () => {
    expect(
      pillSuffix(leave({ startDate: "2026-11-16", endDate: "2026-11-20", requestEndDate: "2027-01-01" }), "week", weekend).kind,
    ).toBe("back");
  });

  it("names who else is away during a request, the reader's own row left out", () => {
    const mine = leave({ startDate: "2026-12-14", endDate: "2026-12-18", status: "PENDING" });
    const names: Record<string, string> = { u2: "Urs Baumann", u3: "Lena Novak" };
    const everyone = [
      mine,
      leave({ userId: "u2", startDate: "2026-12-10", endDate: "2026-12-15" }),
      leave({ userId: "u3", startDate: "2026-12-18", endDate: "2026-12-22" }),
      leave({ userId: "u4", startDate: "2027-01-04", endDate: "2027-01-05" }),
    ];
    expect(alsoAway(mine, everyone, (id) => names[id])).toEqual({ first: "Urs Baumann", others: 1, start: "2026-12-14", end: "2026-12-15" });
    expect(alsoAway(mine, [mine], (id) => names[id])).toBeNull();
  });
});
