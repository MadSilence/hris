import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  activatePublicHolidayCalendarAction,
  type ActivatePublicHolidayCalendarActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/activatePublicHolidayCalendarAction";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  useActivatePublicHolidayCalendar
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/useActivatePublicHolidayCalendar/useActivatePublicHolidayCalendar";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/actions/activatePublicHolidayCalendarAction",
  () => ({
    activatePublicHolidayCalendarAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars",
  () => ({
    useInvalidatePublicHolidaysQuery: jest.fn(),
  })
);

describe("useActivatePublicHolidayCalendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls activatePublicHolidayCalendarAction and invalidates queries on success", async () => {
    const mockPayload: ActivatePublicHolidayCalendarActionInput = {
      id: "calendar-id",
    };

    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (activatePublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useActivatePublicHolidayCalendar());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(activatePublicHolidayCalendarAction).toHaveBeenCalledWith(
      mockPayload
    );

    capturedOpts.onSuccess?.();

    expect(invalidatePublicHolidays).toHaveBeenCalled();
  });

  it("throws error when action returns error status", async () => {
    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (activatePublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useActivatePublicHolidayCalendar());

    await expect(capturedOpts.mutationFn({ id: "calendar-id" })).rejects.toThrow(
      "Failed"
    );

    expect(invalidatePublicHolidays).not.toHaveBeenCalled();
  });
});
