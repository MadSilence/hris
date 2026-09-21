import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiAttendanceService } from "@/api/modules/attendance/services";
import { ForbiddenError } from "@/components/clients/exceptions";
import {
  addWorkScheduleAction,
  recordAttendanceDayAction,
} from "@/components/modules/attendance/actions/attendanceActions";

jest.mock("@/api/modules/attendance/services", () => ({
  hrisApiAttendanceService: {
    recordDay: jest.fn(),
    addWorkSchedule: jest.fn(),
  },
}));

describe("attendance actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("records a day through the service", async () => {
    const entry = {
      id: "e-1", userId: "u-1", workDate: "2026-09-21", hours: 8, description: null, source: "WEB" as const,
    };
    jest.mocked(hrisApiAttendanceService.recordDay).mockResolvedValue(entry);

    const result = await recordAttendanceDayAction({ userId: "u-1", date: "2026-09-21", body: { hours: 8 } });

    expect(hrisApiAttendanceService.recordDay).toHaveBeenCalledWith("u-1", "2026-09-21", { hours: 8 });
    expect(result).toEqual({ status: ActionStatus.SUCCESS, data: entry });
  });

  /** A colleague's timesheet refused by Java arrives as the dictionary's words, never as a throw. */
  it("turns a refusal into an ERROR envelope with the dictionary's text", async () => {
    jest.mocked(hrisApiAttendanceService.recordDay).mockRejectedValue(
      new ForbiddenError("Access denied: PEOPLE.ATTENDANCE.MANAGE on target", { code: "E00403", status: 403 }),
    );

    const result = await recordAttendanceDayAction({ userId: "colleague", date: "2026-09-21", body: { hours: 8 } });

    expect(result.status).toBe(ActionStatus.ERROR);
    expect(result.errorMessage).toBeTruthy();
    expect(result.errorMessage).not.toContain("PEOPLE.ATTENDANCE");
  });

  it("adds a work schedule through the service", async () => {
    const body = {
      effectiveFrom: "2026-10-01",
      mondayHours: 8, tuesdayHours: 8, wednesdayHours: 8, thursdayHours: 8, fridayHours: 8,
      saturdayHours: 0, sundayHours: 0,
    };
    jest.mocked(hrisApiAttendanceService.addWorkSchedule).mockResolvedValue({ id: "s-1", userId: "u-1", ...body });

    const result = await addWorkScheduleAction({ userId: "u-1", body });

    expect(hrisApiAttendanceService.addWorkSchedule).toHaveBeenCalledWith("u-1", body);
    expect(result.status).toBe(ActionStatus.SUCCESS);
  });
});
