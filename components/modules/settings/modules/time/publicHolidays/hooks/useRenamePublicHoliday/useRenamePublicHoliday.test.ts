import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  renamePublicHolidayAction,
  type RenamePublicHolidayActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/renamePublicHolidayAction";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  useRenamePublicHoliday
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/useRenamePublicHoliday/useRenamePublicHoliday";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/actions/renamePublicHolidayAction",
  () => ({
    renamePublicHolidayAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars",
  () => ({
    useInvalidatePublicHolidaysQuery: jest.fn(),
  })
);

describe("useRenamePublicHoliday", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls renamePublicHolidayAction and invalidates queries on success", async () => {
    const mockPayload: RenamePublicHolidayActionInput = {
      id: "holiday-id",
      body: {
        name: "Renamed holiday",
      },
    };

    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (renamePublicHolidayAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useRenamePublicHoliday());

    await act(async () => {
      await capturedOpts.mutationFn(mockPayload);
    });

    expect(renamePublicHolidayAction).toHaveBeenCalledWith(mockPayload);

    capturedOpts.onSuccess?.();

    expect(invalidatePublicHolidays).toHaveBeenCalled();
  });

  it("throws error when action returns error status", async () => {
    const invalidatePublicHolidays = jest.fn();

    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
      invalidatePublicHolidays
    );

    (renamePublicHolidayAction as jest.Mock).mockResolvedValue({
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

    renderHook(() => useRenamePublicHoliday());

    await expect(capturedOpts.mutationFn({} as any)).rejects.toThrow("Failed");

    expect(invalidatePublicHolidays).not.toHaveBeenCalled();
  });
});
