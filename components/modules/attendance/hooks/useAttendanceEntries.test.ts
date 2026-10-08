import type { CapturedReactQueryOptions } from "@/test/types";
import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { logAttendanceAction, removeAttendanceAction } from "@/components/modules/attendance/actions";
import { useInvalidateAttendance } from "@/components/modules/attendance/hooks/useAttendanceQueries";
import {
  AttendanceActionError,
  useLogAttendance,
  useRemoveAttendance,
} from "@/components/modules/attendance/hooks/useAttendanceEntries";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock("@/components/modules/attendance/actions", () => ({
  logAttendanceAction: jest.fn(),
  amendAttendanceAction: jest.fn(),
  removeAttendanceAction: jest.fn(),
}));

jest.mock("@/components/modules/attendance/hooks/useAttendanceQueries", () => ({
  useInvalidateAttendance: jest.fn(),
}));

const input = {
  userId: "user-1",
  body: { dates: ["2026-09-21", "2026-09-22"], startTime: "09:00", endTime: "17:30", description: "Review" },
};

describe("attendance entry mutations", () => {
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

  it("logs the span and invalidates what it changed", async () => {
    (logAttendanceAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: [] });

    renderHook(() => useLogAttendance());
    await act(async () => {
      await captured.mutationFn(input);
    });

    expect(logAttendanceAction).toHaveBeenCalledWith(input);
    captured.onSuccess();
    expect(invalidate).toHaveBeenCalled();
  });

  it("rejects with the envelope when the action refuses, and invalidates nothing", async () => {
    (logAttendanceAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.ERROR,
      code: "ATD00002",
      errorMessage: "This overlaps time already logged on 2026-09-22.",
    });

    renderHook(() => useLogAttendance());

    const failure = captured.mutationFn(input) as Promise<unknown>;
    await expect(failure).rejects.toBeInstanceOf(AttendanceActionError);
    await expect(failure).rejects.toMatchObject({ result: { code: "ATD00002" } });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("removes a span", async () => {
    (removeAttendanceAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: null });

    renderHook(() => useRemoveAttendance());
    await act(async () => {
      await captured.mutationFn({ userId: "user-1", entryId: "e-1" });
    });

    expect(removeAttendanceAction).toHaveBeenCalledWith({ userId: "user-1", entryId: "e-1" });
  });
});
