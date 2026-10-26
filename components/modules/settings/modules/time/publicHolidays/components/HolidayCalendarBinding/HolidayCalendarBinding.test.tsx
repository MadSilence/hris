import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HolidayCalendarBindingSection } from "./HolidayCalendarBindingSection";
import { previewLines } from "./bindingCopy";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  previewHolidayCalendarBindingAction,
  setHolidayCalendarBindingAction,
} from "@/components/modules/settings/modules/time/publicHolidays/actions/holidayCalendarBindingActions";
import { holidayCalendarBindingsService } from "@/components/modules/settings/modules/time/publicHolidays/services/holidayCalendarBindingsService";
import { showSuccess } from "@/lib/errors/errorToast";
import { PublicHolidayCalendarStatus } from "@/api/modules/publicHolidays/calendars/dto";
import type { HolidayCalendarBinding, HolidayCalendarBindingPreview } from "@/models/publicHolidays/binding";

jest.mock("@/components/modules/settings/modules/time/publicHolidays/actions/holidayCalendarBindingActions");
jest.mock("@/components/modules/settings/modules/time/publicHolidays/services/holidayCalendarBindingsService");
jest.mock("@/lib/errors/errorToast", () => ({ showError: jest.fn(), showSuccess: jest.fn() }));
jest.mock("@/components/auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars", () => ({
  usePublicHolidayCalendars: () => ({
    data: [
      { id: "cal-de", name: "Germany 2026", status: PublicHolidayCalendarStatus.Active },
      { id: "cal-old", name: "Old Calendar", status: PublicHolidayCalendarStatus.Archived },
      { id: "cal-uk", name: "United Kingdom 2026", status: PublicHolidayCalendarStatus.Inactive },
    ],
  }),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

const unbound: HolidayCalendarBinding = {
  kind: "OFFICE",
  refId: "berlin",
  refName: "Berlin",
  calendarId: null,
  calendarName: null,
  ruleId: null,
  ruleName: null,
  ruleStatus: null,
  inheriting: 0,
};

const bound: HolidayCalendarBinding = {
  ...unbound,
  calendarId: "cal-de",
  calendarName: "Germany 2026",
  ruleId: "rule-1",
  ruleName: "Holiday Calendar · Office Berlin → Germany 2026",
  ruleStatus: "ENABLED",
  inheriting: 12,
};

const preview: HolidayCalendarBindingPreview = {
  kind: "OFFICE",
  refId: "berlin",
  calendarId: "cal-de",
  calendarName: "Germany 2026",
  currentRuleId: null,
  members: 17,
  willInherit: 12,
  unchanged: 0,
  alreadyByHand: 3,
  keepOwn: 2,
  outranked: 0,
  losing: 0,
  keepOwnPeople: [{ id: "u1", name: "Fiona Tester" }, { id: "u2", name: "Jana Tester" }],
  outrankedPeople: [],
};

const renderSection = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
      <HolidayCalendarBindingSection kind="OFFICE" refId="berlin" placeName="Berlin" />
    </QueryClientProvider>,
  );

describe("HolidayCalendarBindingSection", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the bound calendar, how many inherit it, and the binding's run log", async () => {
    (holidayCalendarBindingsService.get as jest.Mock).mockResolvedValue(bound);
    renderSection();

    expect(await screen.findByText("Germany 2026")).toBeInTheDocument();
    expect(screen.getByText(/12 people inherit it/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Run Log" })).toHaveAttribute("href", "/settings/automation/automations/rule-1");
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
    expect(holidayCalendarBindingsService.get).toHaveBeenCalledWith("OFFICE", "berlin");
  });

  it("says what people get when nothing is bound", async () => {
    (holidayCalendarBindingsService.get as jest.Mock).mockResolvedValue(unbound);
    renderSection();

    expect(await screen.findByText("None")).toBeInTheDocument();
    expect(screen.getByText(/legal entity's calendar, or the company default/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set Calendar" })).toBeInTheDocument();
  });

  it("previews the counts before anything is applied, then applies", async () => {
    (holidayCalendarBindingsService.get as jest.Mock).mockResolvedValue(unbound);
    (previewHolidayCalendarBindingAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: preview });
    (setHolidayCalendarBindingAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: bound });
    renderSection();

    await screen.findByText("None");
    fireEvent.click(screen.getByRole("button", { name: "Set Calendar" }));
    // An archived calendar is not offered; an inactive one is.
    expect(screen.queryByRole("radio", { name: "Old Calendar" })).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "United Kingdom 2026" })).toBeInTheDocument();
    // Nothing chosen yet: the field already says None.
    expect(screen.getByRole("button", { name: "Review" })).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: "Germany 2026" }));
    fireEvent.click(screen.getByRole("button", { name: "Review" }));

    expect(await screen.findByText("12 people will get Germany 2026.")).toBeInTheDocument();
    expect(screen.getByText("3 people already have it by hand and will now inherit it.")).toBeInTheDocument();
    expect(screen.getByText("2 people keep their own calendar as an override.")).toBeInTheDocument();
    expect(screen.getByText(/Keeping their own: Fiona Tester, Jana Tester/)).toBeInTheDocument();
    expect(previewHolidayCalendarBindingAction).toHaveBeenCalledWith({ kind: "OFFICE", refId: "berlin", calendarId: "cal-de" });
    expect(setHolidayCalendarBindingAction).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => expect(setHolidayCalendarBindingAction).toHaveBeenCalledWith({
      kind: "OFFICE", refId: "berlin", calendarId: "cal-de",
    }));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith("Holiday calendar set."));
  });

  it("keeps the dialog open with the refusal when the apply is refused", async () => {
    (holidayCalendarBindingsService.get as jest.Mock).mockResolvedValue(unbound);
    (previewHolidayCalendarBindingAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: preview });
    (setHolidayCalendarBindingAction as jest.Mock).mockResolvedValue({
      status: ActionStatus.ERROR,
      code: "PH00014",
      errorMessage: "An archived office or legal entity cannot be given a holiday calendar.",
    });
    renderSection();

    await screen.findByText("None");
    fireEvent.click(screen.getByRole("button", { name: "Set Calendar" }));
    fireEvent.click(screen.getByRole("radio", { name: "Germany 2026" }));
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    fireEvent.click(await screen.findByRole("button", { name: "Apply" }));

    expect(await screen.findByText("An archived office or legal entity cannot be given a holiday calendar.")).toBeInTheDocument();
    expect(showSuccess).not.toHaveBeenCalled();
  });
});

describe("previewLines", () => {
  it("names those a more specific binding reaches, and says what clearing does", () => {
    expect(previewLines({ ...preview, kind: "LEGAL_ENTITY", willInherit: 1, alreadyByHand: 0, keepOwn: 0, outranked: 4 }, null))
      .toEqual(["1 person will get Germany 2026.", "4 people keep their office's calendar, which comes first."]);
    expect(previewLines({ ...preview, calendarId: null, calendarName: null, losing: 5 }, "Germany 2026"))
      .toEqual(["5 people will stop inheriting Germany 2026 from today and fall back to the next binding down, if there is one."]);
    expect(previewLines({ ...preview, members: 0 }, null)).toEqual(["Nobody works here yet. Whoever joins will get Germany 2026."]);
  });
});
