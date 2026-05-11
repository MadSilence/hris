import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  deletePublicHolidayAction,
  type DeletePublicHolidayActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/deletePublicHolidayAction";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  useDeletePublicHoliday
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/useDeletePublicHoliday/useDeletePublicHoliday";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/actions/deletePublicHolidayAction",
  () => ({
    deletePublicHolidayAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars",
  () => ({
    useInvalidatePublicHolidaysQuery: jest.fn(),
  })
);

describe("useDeletePublicHoliday", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls deletePublicHolidayAction and invalidates queries on success", async () => {
    const mockPayload: DeletePublicHolidayActionInput = {
      id: "holiday-id",
    };

    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (deletePublicHolidayAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useDeletePublicHoliday());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(deletePublicHolidayAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(invalidatePublicHolidays).toHaveBeenCalled();
  });

  it("throws error when action returns error status", async () => {
    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (deletePublicHolidayAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useDeletePublicHoliday());

    await expect(capturedOpts.mutationFn({ id: "holiday-id" })).rejects.toThrow(
      "Failed"
    );

    expect(invalidatePublicHolidays).not.toHaveBeenCalled();
  });
});
