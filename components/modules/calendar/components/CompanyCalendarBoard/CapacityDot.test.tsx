import { render, screen } from "@testing-library/react";
import { CapacityDot, capacityTitle } from "@/components/modules/calendar/components/CompanyCalendarBoard/CapacityDot";
import { translatorFor } from "@/test/nextIntl";
import type { CalendarTranslator } from "@/components/modules/calendar/lib/i18n";

const t = translatorFor("calendar") as unknown as CalendarTranslator;

describe("the capacity mark", () => {
  it("says what the next request meets, and the numbers when they were sent", () => {
    expect(capacityTitle(t, { date: "2026-11-04", behavior: "BLOCK", away: 3, cap: 3 }, "team")).toBe(
      "At its limit — new requests from this team will be refused · 3 of 3 away · The request form decides for each person",
    );
  });

  it("says nothing about how many when the reader does not see the whole group", () => {
    const title = capacityTitle(t, { date: "2026-11-04", behavior: "WARN" }, "team");
    expect(title).toContain("will be warned");
    expect(title).not.toContain("away");
  });

  it("is red where a request is refused and amber where it is warned", () => {
    render(<CapacityDot mark={{ date: "2026-11-04", behavior: "WARN" }} who="team" />);
    expect(screen.getByRole("img").className).toContain("bg-status-pending-fill");
  });
});
