import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublicHolidaysSettingsComponent } from "./PublicHolidaysSettingsComponent";
import {
  PublicHolidayCalendarSourceType,
  PublicHolidayCalendarStatus,
  PublicHolidayCalendarWeekendSubstitution,
} from "@/api/modules/publicHolidays/calendars/dto";
import type { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// The template picker fetches through react-query; it has nothing to do with the row menu.
jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/components/modals/ChoosePublicHolidayTemplateModal",
  () => ({ ChoosePublicHolidayTemplateModal: () => null }),
);

const mutations = {
  duplicate: jest.fn(),
  archive: jest.fn(),
  restore: jest.fn(),
  remove: jest.fn(),
  activate: jest.fn(),
  deactivate: jest.fn(),
};

const mutation = (mutateAsync: jest.Mock) => ({
  mutateAsync,
  isPending: false,
  isError: false,
});

jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/useDuplicatePublicHolidayCalendar",
  () => ({ useDuplicatePublicHolidayCalendar: () => mutation(mutations.duplicate) }),
);
jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/useArchivePublicHolidayCalendar",
  () => ({ useArchivePublicHolidayCalendar: () => mutation(mutations.archive) }),
);
jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/useRestorePublicHolidayCalendar",
  () => ({ useRestorePublicHolidayCalendar: () => mutation(mutations.restore) }),
);
jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/useDeletePublicHolidayCalendar",
  () => ({ useDeletePublicHolidayCalendar: () => mutation(mutations.remove) }),
);
jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/useActivatePublicHolidayCalendar",
  () => ({ useActivatePublicHolidayCalendar: () => mutation(mutations.activate) }),
);
jest.mock(
  "@/components/modules/settings/modules/time/publicHolidays/hooks/useDeactivatePublicHolidayCalendar",
  () => ({ useDeactivatePublicHolidayCalendar: () => mutation(mutations.deactivate) }),
);

const calendar = (overrides: Partial<PublicHolidayCalendar> = {}): PublicHolidayCalendar => ({
  id: "cal-1",
  name: "Germany",
  status: PublicHolidayCalendarStatus.Active,
  sourceType: PublicHolidayCalendarSourceType.Manual,
  sourceExternalId: null,
  sourceCountryCode: "DE",
  sourceRegionCode: null,
  sourceLocale: null,
  weekendSubstitution: PublicHolidayCalendarWeekendSubstitution.None,
  autoFillEnabled: true,
  archivedAt: null,
  archivedBy: null,
  holidayCount: 12,
  years: [2026, 2027],
  ...overrides,
});

const openRowMenu = async (name: string) => {
  const user = userEvent.setup();
  const row = screen.getByRole("link", { name }).closest("tr");
  await user.click(within(row as HTMLElement).getByRole("button", { name: "Calendar Actions" }));
  return user;
};

describe("PublicHolidaysSettingsComponent — activating and deactivating", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("offers Deactivate for an active calendar", async () => {
    render(<PublicHolidaysSettingsComponent calendars={[calendar()]} isLoading={false} />);

    await openRowMenu("Germany");

    expect(screen.getByRole("menuitem", { name: "Deactivate" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Activate" })).not.toBeInTheDocument();
  });

  it("offers Activate for an inactive calendar", async () => {
    render(
      <PublicHolidaysSettingsComponent
        calendars={[calendar({ status: PublicHolidayCalendarStatus.Inactive })]}
        isLoading={false}
      />,
    );

    await openRowMenu("Germany");

    expect(screen.getByRole("menuitem", { name: "Activate" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Deactivate" })).not.toBeInTheDocument();
  });

  it("activates straight away — switching a calendar on takes nothing away", async () => {
    render(
      <PublicHolidaysSettingsComponent
        calendars={[calendar({ status: PublicHolidayCalendarStatus.Inactive })]}
        isLoading={false}
      />,
    );

    const user = await openRowMenu("Germany");
    await user.click(screen.getByRole("menuitem", { name: "Activate" }));

    expect(mutations.activate).toHaveBeenCalledWith({ id: "cal-1" });
  });

  it("asks before deactivating, then deactivates", async () => {
    render(<PublicHolidaysSettingsComponent calendars={[calendar()]} isLoading={false} />);

    const user = await openRowMenu("Germany");
    await user.click(screen.getByRole("menuitem", { name: "Deactivate" }));

    // The dialog has to say what it costs: assigned people quietly start working those days again.
    expect(screen.getByText(/no longer count as holidays/i)).toBeInTheDocument();
    expect(mutations.deactivate).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Deactivate" }));

    expect(mutations.deactivate).toHaveBeenCalledWith({ id: "cal-1" });
  });

  it("shows neither on an archived calendar — it has to be unarchived first", async () => {
    render(
      <PublicHolidaysSettingsComponent
        calendars={[calendar({ status: PublicHolidayCalendarStatus.Archived })]}
        isLoading={false}
      />,
    );

    const user = await userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^Archived \(/ }));
    await openRowMenu("Germany");

    expect(screen.getByRole("menuitem", { name: "Unarchive" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Activate" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Deactivate" })).not.toBeInTheDocument();
  });
});
