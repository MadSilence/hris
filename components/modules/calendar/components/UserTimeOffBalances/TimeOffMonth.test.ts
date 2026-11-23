import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { partialMock } from "@/test/types";
import type { TimeOffRequest } from "@/models/timeOff";
import { monthWeeks } from "@/components/modules/timeOff/lib/leaveDays";
import { layoutWeek } from "./TimeOffMonth";

const request = (id: string, startDate: string, endDate: string) =>
  partialMock<TimeOffRequest>({ id, startDate, endDate, status: TimeOffRequestStatus.Approved, policyId: "p" });

// The week of Mon 9 – Sun 15 Nov 2026.
const week = monthWeeks(2026, 10, 1)[2];

describe("layoutWeek — the profile month's pills (Q05, Q05b, Q06)", () => {
  it("puts two overlapping requests in two lanes", () => {
    const { segments, more } = layoutWeek(week, [request("a", "2026-11-10", "2026-11-11"), request("b", "2026-11-11", "2026-11-12")], false, false);
    expect(segments.map((s) => [s.request.id, s.lane])).toEqual([["a", 0], ["b", 1]]);
    expect(more).toEqual([]);
  });

  it("turns the second lane into \"+N more\" on a day with more than two, cutting the second lane around it", () => {
    const { segments, more } = layoutWeek(week, [
      request("a", "2026-11-10", "2026-11-11"),
      request("b", "2026-11-11", "2026-11-12"),
      request("c", "2026-11-11", "2026-11-11"),
      request("d", "2026-11-11", "2026-11-11"),
    ], false, false);
    expect(more).toEqual([{ col: 2, count: 3 }]);
    expect(segments.filter((s) => s.lane === 1).map((s) => [s.request.id, s.startCol, s.endCol])).toEqual([["b", 3, 3]]);
  });

  it("squares a run into the next week and fades one past the month's grid", () => {
    const { segments } = layoutWeek(week, [request("long", "2026-11-12", "2027-02-26")], false, true);
    expect(segments[0]).toMatchObject({ startCol: 3, endCol: 6, toRight: true, fadeRight: true });
  });
});
