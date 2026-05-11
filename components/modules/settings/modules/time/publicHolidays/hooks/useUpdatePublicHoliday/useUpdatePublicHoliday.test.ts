import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  updatePublicHolidayAction,
  type UpdatePublicHolidayActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/updatePublicHolidayAction";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  useUpdatePublicHoliday
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/useUpdatePublicHoliday/useUpdatePublicHoliday";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/actions/updatePublicHolidayAction",
  () => ({
    updatePublicHolidayAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars",
  () => ({
    useInvalidatePublicHolidaysQuery: jest.fn(),
  })
);

describe("useUpdatePublicHoliday", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls updatePublicHolidayAction and invalidates queries on success", async () => {
    const mockPayload = {
      id: "holiday-id",
      body: {
        name: "Updated holiday",
        holidayDate: "2026-01-01",
      },
    } as UpdatePublicHolidayActionInput;

    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (updatePublicHolidayAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.SUCCESS,
      data: { id: "holiday-id", version: 1 },
    });

    let capturedOpts: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      capturedOpts = opts;

      return {
        mutate: jest.fn(),
        mutateAsync: opts.mutationFn,
      };
    });

    renderHook(() => useUpdatePublicHoliday());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(updatePublicHolidayAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(invalidatePublicHolidays).toHaveBeenCalled();
  });

  it("throws error when action returns error status", async () => {
    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (updatePublicHolidayAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useUpdatePublicHoliday());

    await expect(capturedOpts.mutationFn({} as any)).rejects.toThrow("Failed");

    expect(invalidatePublicHolidays).not.toHaveBeenCalled();
  });
});
