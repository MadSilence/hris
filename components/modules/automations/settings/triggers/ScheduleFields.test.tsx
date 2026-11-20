import * as React from "react";
import { render, screen } from "@testing-library/react";
import type { TriggerSpec } from "@/models/automations";
import { automationCatalogFixture, definitionFixture } from "@/test/fixtures/automationCatalog";
import { ScheduleFields } from "./ScheduleFields";

// The time zone list's second lines are what is checked: a pick drawn as its options' label and hint.
jest.mock("@/components/modules/automations/settings/conditions/chrome", () => ({
  ...jest.requireActual("@/test/automationPickersMock"),
  CompactPick: ({ options }: { options: { value: string; label: string; hint?: string }[] }) => (
    <ul>
      {options.map((o) => (
        <li key={o.value}>{o.hint ? `${o.label}: ${o.hint}` : o.label}</li>
      ))}
    </ul>
  ),
}));
jest.mock("@/components/providers/CurrentUserProvider", () => ({ useCurrentUser: () => ({ user: { firstName: "Lena" } }) }));
jest.mock("@/components/ui/SearchableSelect", () => jest.requireActual("@/test/searchableSelectMock"));

const schedule: TriggerSpec = { type: "SCHEDULE", frequency: "DAILY", at: "09:00", timeZone: "COMPANY" };

const renderSchedule = (companyTimeZone: string | null) =>
  render(
    <ScheduleFields
      definition={definitionFixture({ trigger: schedule })}
      trigger={schedule}
      catalog={{ ...automationCatalogFixture(), companyTimeZone }}
      problems={[]}
      onTrigger={jest.fn()}
      onDefinition={jest.fn()}
    />,
  );

describe("ScheduleFields — the company's time zone (automations-triggers C32)", () => {
  it("names the company's zone on the Company time zone line", () => {
    renderSchedule("Europe/Vilnius");
    expect(screen.getByText("Company time zone: Europe/Vilnius · everyone at the same moment.")).toBeInTheDocument();
  });

  it("says only the moment while the zone is not known", () => {
    renderSchedule(null);
    expect(screen.getByText("Company time zone: Everyone at the same moment.")).toBeInTheDocument();
  });
});
