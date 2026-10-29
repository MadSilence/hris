import { render, screen } from "@testing-library/react";
import { CapacityDot, capacityTitle } from "@/components/modules/calendar/components/CompanyCalendarBoard/CapacityDot";

describe("the capacity mark", () => {
  it("says what the next request meets, and the numbers when they were sent", () => {
    expect(capacityTitle({ date: "2026-11-04", behavior: "BLOCK", away: 3, cap: 3 }, "this team")).toBe(
      "At its limit — new requests from this team will be refused · 3 of 3 away · The request form decides for each person",
    );
  });

  it("says nothing about how many when the reader does not see the whole group", () => {
    const title = capacityTitle({ date: "2026-11-04", behavior: "WARN" }, "this team");
    expect(title).toContain("will be warned");
    expect(title).not.toContain("away");
  });

  it("is red where a request is refused and amber where it is warned", () => {
    render(<CapacityDot mark={{ date: "2026-11-04", behavior: "WARN" }} who="this team" />);
    expect(screen.getByRole("img").className).toContain("bg-warning-500");
  });
});
