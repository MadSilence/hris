import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  archivePublicHolidayCalendarAction,
  type ArchivePublicHolidayCalendarActionInput,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/archivePublicHolidayCalendarAction";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  useArchivePublicHolidayCalendar
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/useArchivePublicHolidayCalendar/useArchivePublicHolidayCalendar";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/actions/archivePublicHolidayCalendarAction",
  () => ({
    archivePublicHolidayCalendarAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars",
  () => ({
    useInvalidatePublicHolidaysQuery: jest.fn(),
  })
);

describe("useArchivePublicHolidayCalendar", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("calls archivePublicHolidayCalendarAction and invalidates queries on success", async () => {
      const mockPayload: ArchivePublicHolidayCalendarActionInput = {
        id: "calendar-id",
      };

      const invalidatePublicHolidays = jest.fn();

      (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(
        invalidatePublicHolidays
      );

      (archivePublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
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

      renderHook(() => useArchivePublicHolidayCalendar());

      await act(async () => {
        await capturedOpts.mutationFn(mockPayload);
      });

      expect(archivePublicHolidayCalendarAction).toHaveBeenCalledWith(
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

      (archivePublicHolidayCalendarAction as jest.Mock).mockResolvedValue({
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

      renderHook(() => useArchivePublicHolidayCalendar());

      await expect(capturedOpts.mutationFn({ id: "calendar-id" })).rejects.toThrow(
        "Failed"
      );

      expect(invalidatePublicHolidays).not.toHaveBeenCalled();
    });
  }
);
