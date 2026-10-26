import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { PublicHolidayOverride } from "@/models/publicHolidays/holiday";
import { PublicHolidayType } from "@/api/modules/publicHolidays/holidays/dto";
import {
  PublicHolidayEditedMarker,
  PublicHolidayOverrideRowActions,
  RemovedProviderDays,
  describeProviderVersion,
} from "./PublicHolidayOverrides";

const override = (patch: Partial<PublicHolidayOverride> = {}): PublicHolidayOverride => ({
  id: "o-1",
  calendarId: "calendar-1",
  calendarYear: 2026,
  holidayId: "h-1",
  sourceEventId: "nager:GB:2026-05-04",
  providerPresent: true,
  providerName: "Early May Bank Holiday",
  providerHolidayDate: "2026-05-04",
  providerEndDate: "2026-05-04",
  providerType: PublicHolidayType.Bank,
  ...patch,
});

describe("PublicHolidayEditedMarker", () => {
  it("is a quiet Edited mark that tells, on hover, what the provider has instead", () => {
    render(<PublicHolidayEditedMarker override={override()} />);

    const marker = screen.getByText("Edited");
    expect(marker).toHaveAttribute("title", expect.stringMatching(/^Edited by your company\. The provider has Early May Bank Holiday on /));
  });

  it("says so when the provider no longer lists the day", () => {
    expect(describeProviderVersion(override({ providerPresent: false, providerName: null }))).toBe(
      "The provider no longer lists this day.",
    );
  });
});

describe("PublicHolidayOverrideRowActions", () => {
  it("offers Revert to Provider from the row's menu", async () => {
    const onRevert = jest.fn();
    render(<PublicHolidayOverrideRowActions override={override()} onRevert={onRevert} />);

    await userEvent.click(screen.getByRole("button", { name: "Holiday actions" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: /Revert to Provider/ }));

    expect(onRevert).toHaveBeenCalledWith(expect.objectContaining({ id: "o-1" }));
  });
});

describe("RemovedProviderDays", () => {
  const removed = override({ id: "o-2", holidayId: null, providerName: "Summer Bank Holiday", providerHolidayDate: "2026-08-31", providerEndDate: "2026-08-31" });

  it("lists the provider's days the company removed, each with Revert to Provider", async () => {
    const onRevert = jest.fn();
    render(<RemovedProviderDays overrides={[removed]} canRevert onRevert={onRevert} />);

    expect(screen.getByRole("heading", { name: "Removed Provider Days" })).toBeInTheDocument();
    expect(screen.getByText("Summer Bank Holiday")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Revert to Provider/ }));
    expect(onRevert).toHaveBeenCalledWith(removed);
  });

  it("offers no button to someone who cannot manage the calendar", () => {
    render(<RemovedProviderDays overrides={[removed]} canRevert={false} onRevert={jest.fn()} />);

    expect(screen.getByText("Summer Bank Holiday")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders nothing when nothing was removed", () => {
    const { container } = render(<RemovedProviderDays overrides={[]} canRevert onRevert={jest.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
