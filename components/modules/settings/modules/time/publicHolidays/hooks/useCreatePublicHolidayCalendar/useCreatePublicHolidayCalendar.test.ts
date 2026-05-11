import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  createPublicHolidayCalendarAction,
  type CreatePublicHolidayCalendarActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/createPublicHolidayCalendarAction";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  useCreatePublicHolidayCalendar
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/useCreatePublicHolidayCalendar/useCreatePublicHolidayCalendar";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/actions/createPublicHolidayCalendarAction",
  () => ({
    createPublicHolidayCalendarAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars",
  () => ({
    useInvalidatePublicHolidaysQuery: jest.fn(),
  })
);

describe("useCreatePublicHolidayCalendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls createPublicHolidayCalendarAction and invalidates queries on success", async () => {
    const mockPayload = {
      name: "Poland 2026",
      year: 2026,
    } as CreatePublicHolidayCalendarActionInput;

    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (createPublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.SUCCESS,
      data: { id: "calendar-id" },
    });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;

      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useCreatePublicHolidayCalendar());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(createPublicHolidayCalendarAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(invalidatePublicHolidays).toHaveBeenCalled();
  });

  it("throws error when action returns error status", async () => {
    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (createPublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useCreatePublicHolidayCalendar());

    await expect(capturedOpts.mutationFn({} as any)).rejects.toThrow("Failed");

    expect(invalidatePublicHolidays).not.toHaveBeenCalled();
  });
});
