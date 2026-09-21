import type { WorkSchedule } from "@/models/attendance";
import { scheduleInForce } from "@/components/modules/attendance/schedule/WorkSchedulePanel";

// The panel's hooks reach the app providers; the rule under test needs none of them.
jest.mock("@/components/modules/attendance/hooks", () => ({}));

const schedule = (id: string, effectiveFrom: string): WorkSchedule => ({
  id,
  userId: "u-1",
  effectiveFrom,
  mondayHours: 8,
  tuesdayHours: 8,
  wednesdayHours: 8,
  thursdayHours: 8,
  fridayHours: 8,
  saturdayHours: 0,
  sundayHours: 0,
});

describe("scheduleInForce", () => {
  // Rows arrive newest first, as the backend sorts them.
  const rows = [schedule("future", "2026-12-01"), schedule("current", "2026-07-01"), schedule("old", "2025-01-01")];

  it("is the latest schedule not after today", () => {
    expect(scheduleInForce(rows, "2026-09-21")?.id).toBe("current");
    expect(scheduleInForce(rows, "2026-07-01")?.id).toBe("current");
  });

  it("is none before the first one, and none without a today to compare with", () => {
    expect(scheduleInForce(rows, "2024-12-31")).toBeNull();
    expect(scheduleInForce(rows)).toBeNull();
  });
});
