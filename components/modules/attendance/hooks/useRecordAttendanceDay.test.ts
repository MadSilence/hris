import type { CapturedReactQueryOptions } from "@/test/types";
import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { recordAttendanceDayAction } from "@/components/modules/attendance/actions";
import { useInvalidateAttendance } from "@/components/modules/attendance/hooks/useAttendanceQueries";
import {
  AttendanceActionError,
  useRecordAttendanceDay,
} from "@/components/modules/attendance/hooks/useRecordAttendanceDay";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock("@/components/modules/attendance/actions", () => ({
  recordAttendanceDayAction: jest.fn(),
}));

jest.mock("@/components/modules/attendance/hooks/useAttendanceQueries", () => ({
  useInvalidateAttendance: jest.fn(),
}));

const input = { userId: "user-1", date: "2026-09-21", body: { hours: 7.5, description: "Review" } };

describe("useRecordAttendanceDay", () => {
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

  it("records the day through the action and invalidates the timesheet", async () => {
    const entry = { id: "e-1", userId: "user-1", workDate: "2026-09-21", hours: 7.5, description: "Review", source: "WEB" };
    (recordAttendanceDayAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: entry });

    renderHook(() => useRecordAttendanceDay());

    let result: unknown;
    await act(async () => {
      result = await captured.mutationFn(input);
    });

    expect(recordAttendanceDayAction).toHaveBeenCalledWith(input);
    expect(result).toEqual(entry);

    captured.onSuccess();
    expect(invalidate).toHaveBeenCalled();
  });

  it("rejects with the envelope intact, so the row can show the reason and the field", async () => {
    const envelope = {
      status: ActionStatus.ERROR,
      code: "ATD00004",
      errorMessage: "This day is approved leave.",
      fieldErrors: { hours: "x" },
    };
    (recordAttendanceDayAction as jest.Mock).mockResolvedValue(envelope);

    renderHook(() => useRecordAttendanceDay());

    const rejection = captured.mutationFn(input) as Promise<unknown>;
    await expect(rejection).rejects.toBeInstanceOf(AttendanceActionError);
    await expect(rejection).rejects.toMatchObject({ result: envelope, message: "This day is approved leave." });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
