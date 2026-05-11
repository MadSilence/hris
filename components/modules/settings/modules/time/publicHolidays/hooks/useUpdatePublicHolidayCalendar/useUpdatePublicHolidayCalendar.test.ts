import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  updatePublicHolidayCalendarAction,
  type UpdatePublicHolidayCalendarActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/updatePublicHolidayCalendarAction";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  useUpdatePublicHolidayCalendar
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/useUpdatePublicHolidayCalendar/useUpdatePublicHolidayCalendar";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/actions/updatePublicHolidayCalendarAction",
  () => ({
    updatePublicHolidayCalendarAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars",
  () => ({
    useInvalidatePublicHolidaysQuery: jest.fn(),
  })
);

describe("useUpdatePublicHolidayCalendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls updatePublicHolidayCalendarAction and invalidates queries on success", async () => {
    const mockPayload = {
      id: "calendar-id",
      body: { name: "Updated calendar" },
    } as UpdatePublicHolidayCalendarActionInput;

    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (updatePublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useUpdatePublicHolidayCalendar());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(updatePublicHolidayCalendarAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(invalidatePublicHolidays).toHaveBeenCalled();
  });

  it("throws error when action returns error status", async () => {
    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (updatePublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useUpdatePublicHolidayCalendar());

    await expect(capturedOpts.mutationFn({} as any)).rejects.toThrow("Failed");

    expect(invalidatePublicHolidays).not.toHaveBeenCalled();
  });
});
