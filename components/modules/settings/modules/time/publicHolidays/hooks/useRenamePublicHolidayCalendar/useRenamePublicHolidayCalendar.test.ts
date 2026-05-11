import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  renamePublicHolidayCalendarAction,
  type RenamePublicHolidayCalendarActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/renamePublicHolidayCalendarAction";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  useRenamePublicHolidayCalendar
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/useRenamePublicHolidayCalendar/useRenamePublicHolidayCalendar";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/actions/renamePublicHolidayCalendarAction",
  () => ({
    renamePublicHolidayCalendarAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars",
  () => ({
    useInvalidatePublicHolidaysQuery: jest.fn(),
  })
);

describe("useRenamePublicHolidayCalendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls renamePublicHolidayCalendarAction and invalidates queries on success", async () => {
    const mockPayload = {
      id: "calendar-id",
      body: { name: "New name" },
    } as RenamePublicHolidayCalendarActionInput;

    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (renamePublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.SUCCESS,
      data: { id: "calendar-id", version: 1 },
    });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;

      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useRenamePublicHolidayCalendar());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(renamePublicHolidayCalendarAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(invalidatePublicHolidays).toHaveBeenCalled();
  });

  it("throws error when action returns error status", async () => {
    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (renamePublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.ERROR,
      errorMessage: "Failed",
    });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;

      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useRenamePublicHolidayCalendar());

    await expect(capturedOpts.mutationFn({} as any)).rejects.toThrow("Failed");

    expect(invalidatePublicHolidays).not.toHaveBeenCalled();
  });
});
