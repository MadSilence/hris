import type { CapturedReactQueryOptions } from "@/test/types";
import { act, renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  applyPublicHolidayDriftAction,
  dismissPublicHolidayDriftAction,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/publicHolidayDriftActions";
import {
  useInvalidatePublicHolidaysQuery
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import {
  useApplyPublicHolidayDrift,
  useDismissPublicHolidayDrift,
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayDrift/usePublicHolidayDrift";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/actions/publicHolidayDriftActions",
  () => ({
    applyPublicHolidayDriftAction: jest.fn(),
    dismissPublicHolidayDriftAction: jest.fn(),
  })
);

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars",
  () => ({
    useInvalidatePublicHolidaysQuery: jest.fn(),
  })
);

/** Captures the options the hook hands to useMutation, so its callbacks can be called directly. */
const captureMutation = (): { current: CapturedReactQueryOptions | null } => {
  const captured: { current: CapturedReactQueryOptions | null } = { current: null };
  (useMutation as jest.Mock).mockImplementation((opts: CapturedReactQueryOptions) => {
    captured.current = opts;
    return { mutate: jest.fn(), mutateAsync: opts.mutationFn };
  });
  return captured;
};

const optionsOf = (captured: { current: CapturedReactQueryOptions | null }): CapturedReactQueryOptions => {
  if (!captured.current) throw new Error("useMutation was not called");
  return captured.current;
};

describe("useApplyPublicHolidayDrift", () => {
  const invalidatePublicHolidays = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useInvalidatePublicHolidaysQuery as jest.Mock).mockReturnValue(invalidatePublicHolidays);
  });

  it("applies the drift and refreshes the holiday queries", async () => {
    const captured = captureMutation();
    const data = {
      driftId: "drift-1",
      calendarId: "calendar-1",
      year: 2026,
      applied: 1,
      skipped: [],
      recalculatedRequests: 2,
      requestsLeftUnchanged: 0,
    };
    (applyPublicHolidayDriftAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data });

    renderHook(() => useApplyPublicHolidayDrift());

    let result: unknown;
    await act(async () => {
      result = await optionsOf(captured).mutationFn({ driftId: "drift-1" });
    });

    expect(applyPublicHolidayDriftAction).toHaveBeenCalledWith({ driftId: "drift-1" });
    expect(result).toEqual(data);

    optionsOf(captured).onSuccess();
    expect(invalidatePublicHolidays).toHaveBeenCalled();
  });

  it("turns a refusal into a rejected mutation carrying the dictionary's sentence", async () => {
    const captured = captureMutation();
    (applyPublicHolidayDriftAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.ERROR,
      errorMessage: "Somebody has already dealt with these holiday changes.",
    });

    renderHook(() => useApplyPublicHolidayDrift());

    await expect(optionsOf(captured).mutationFn({ driftId: "drift-1" })).rejects.toThrow(
      "Somebody has already dealt with these holiday changes."
    );
    expect(invalidatePublicHolidays).not.toHaveBeenCalled();
  });
});

describe("useDismissPublicHolidayDrift", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("dismisses the drift", async () => {
    const captured = captureMutation();
    (dismissPublicHolidayDriftAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS });

    renderHook(() => useDismissPublicHolidayDrift());

    await act(async () => {
      await optionsOf(captured).mutationFn({ driftId: "drift-1" });
    });

    expect(dismissPublicHolidayDriftAction).toHaveBeenCalledWith({ driftId: "drift-1" });
  });

  it("rejects when the backend refuses", async () => {
    const captured = captureMutation();
    (dismissPublicHolidayDriftAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.ERROR,
      errorMessage: "These holiday changes no longer exist. Refresh the page.",
    });

    renderHook(() => useDismissPublicHolidayDrift());

    await expect(optionsOf(captured).mutationFn({ driftId: "drift-1" })).rejects.toThrow(
      "These holiday changes no longer exist. Refresh the page."
    );
  });
});
