import type { CapturedReactQueryOptions } from "@/test/types";
import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { addWorkScheduleAction } from "@/components/modules/attendance/actions";
import { useInvalidateAttendance } from "@/components/modules/attendance/hooks/useAttendanceQueries";
import { useAddWorkSchedule } from "@/components/modules/attendance/hooks/useAddWorkSchedule";
import { AttendanceActionError } from "@/components/modules/attendance/hooks/useRecordAttendanceDay";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock("@/components/modules/attendance/actions", () => ({
  addWorkScheduleAction: jest.fn(),
}));

jest.mock("@/components/modules/attendance/hooks/useAttendanceQueries", () => ({
  useInvalidateAttendance: jest.fn(),
}));

const body = {
  effectiveFrom: "2026-10-01",
  mondayHours: 4,
  tuesdayHours: 4,
  wednesdayHours: 0,
  thursdayHours: 4,
  fridayHours: 4,
  saturdayHours: 0,
  sundayHours: 0,
};

describe("useAddWorkSchedule", () => {
  let captured!: CapturedReactQueryOptions;
  const invalidate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useInvalidateAttendance as jest.Mock).mockReturnValue(invalidate);
    (useMutation as jest.Mock).mockImplementation((opts: CapturedReactQueryOptions) => {
      captured = opts;
      return { mutateAsync: opts.mutationFn };
    });
  });

  it("adds the schedule and invalidates the months it changes", async () => {
    (addWorkScheduleAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.SUCCESS,
      data: { id: "s-1", userId: "user-1", ...body },
    });

    renderHook(() => useAddWorkSchedule());
    await act(async () => {
      await captured.mutationFn({ userId: "user-1", body });
    });

    expect(addWorkScheduleAction).toHaveBeenCalledWith({ userId: "user-1", body });
    captured.onSuccess();
    expect(invalidate).toHaveBeenCalled();
  });

  it("rejects when the action refuses", async () => {
    (addWorkScheduleAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.ERROR,
      code: "ATD00011",
      errorMessage: "A schedule already starts on this date. Choose another date.",
    });

    renderHook(() => useAddWorkSchedule());

    await expect(captured.mutationFn({ userId: "user-1", body }) as Promise<unknown>)
      .rejects.toBeInstanceOf(AttendanceActionError);
    expect(invalidate).not.toHaveBeenCalled();
  });
});
