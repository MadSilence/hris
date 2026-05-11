import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  deletePublicHolidayCalendarAction,
  type DeletePublicHolidayCalendarActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/deletePublicHolidayCalendarAction";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  useDeletePublicHolidayCalendar
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/useDeletePublicHolidayCalendar/useDeletePublicHolidayCalendar";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/actions/deletePublicHolidayCalendarAction",
  () => ({
    deletePublicHolidayCalendarAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars",
  () => ({
    useInvalidatePublicHolidaysQuery: jest.fn(),
  })
);

describe("useDeletePublicHolidayCalendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls deletePublicHolidayCalendarAction and invalidates queries on success", async () => {
    const mockPayload: DeletePublicHolidayCalendarActionInput = {
      id: "calendar-id",
    };

    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (deletePublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.SUCCESS,
    });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;

      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useDeletePublicHolidayCalendar());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(deletePublicHolidayCalendarAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(invalidatePublicHolidays).toHaveBeenCalled();
  });

  it("throws error when action returns error status", async () => {
    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (deletePublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useDeletePublicHolidayCalendar());

    await expect(capturedOpts.mutationFn({ id: "calendar-id" })).rejects.toThrow(
      "Failed"
    );

    expect(invalidatePublicHolidays).not.toHaveBeenCalled();
  });
});
