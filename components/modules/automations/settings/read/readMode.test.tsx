import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import type { AutomationCheck, StepSpec } from "@/models/automations";
import type { Segment } from "@/models/segment/Segment";
import { automationCatalogFixture, definitionFixture } from "@/test/fixtures/automationCatalog";
import { StepFields } from "../steps/StepFields";
import { TriggerFields } from "../triggers/TriggerFields";
import { WhoItRunsFor } from "../who/WhoItRunsFor";

jest.mock("@/components/modules/automations/settings/conditions/chrome", () => jest.requireActual("@/test/automationPickersMock"));
jest.mock("@/components/hooks/useReferenceOptions", () => jest.requireActual("@/test/automationSettingsMocks").referenceOptions);
jest.mock("@/components/modules/organization/hooks/useUserFields", () => jest.requireActual("@/test/automationSettingsMocks").userFields);
jest.mock("@/components/auth/useAccess", () => jest.requireActual("@/test/automationSettingsMocks").access);
jest.mock("@/components/audience/hooks/useAudienceFieldOptions", () => jest.requireActual("@/test/automationSettingsMocks").audienceFieldOptions);
jest.mock("@/components/hooks/useUser/useUser", () => jest.requireActual("@/test/automationSettingsMocks").user);
jest.mock("@/components/modules/automations/hooks", () => jest.requireActual("@/test/automationSettingsMocks").automationHooks);

const catalog = automationCatalogFixture();

const check = (matchingCount: number): AutomationCheck =>
  ({ matchingCount, matching: [{ id: "u1", name: "Lena Kowalska" }] }) as AutomationCheck;

describe("read mode", () => {
  it("a step is icon rows, no inputs (R3)", () => {
    const step: StepSpec = { id: "s1", type: "CREATE_TASK", title: "Pick a time with {firstName}", assignee: { kind: "MANAGER" }, dueDays: 7 };
    render(<StepFields definition={definitionFixture({ steps: [step] })} step={step} catalog={catalog} readOnly problems={[]} onChange={jest.fn()} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Their manager")).toBeInTheDocument();
    expect(screen.getByText("Gets the task")).toBeInTheDocument();
    expect(screen.getByText(/^Due in 7.days$/)).toBeInTheDocument();
    expect(screen.getByText("Right away")).toBeInTheDocument();
    expect(screen.getByText("For everyone")).toBeInTheDocument();
    expect(screen.getByText("First name")).toBeInTheDocument();
  });

  it("a trigger is icon rows", () => {
    render(
      <TriggerFields
        definition={definitionFixture({ trigger: { type: "DATE_OFFSET", field: "PROBATION_END", days: 14, direction: "BEFORE" } })}
        catalog={catalog}
        readOnly
        problems={[]}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText(/^14.days before the end of probation$/)).toBeInTheDocument();
    expect(screen.getByText("Every person, once")).toBeInTheDocument();
    expect(screen.getByText("If the date has already passed")).toBeInTheDocument();
  });

  it("Who it runs for: the conditions as cards and the count (R4)", () => {
    const conditions: Segment = { filters: [{ field: "sys:office", op: "eq", value: "o-vil" }], excludeUserIds: [] };
    render(<WhoItRunsFor conditions={conditions} readOnly check={check(48)} onChange={jest.fn()} />);
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByText("Only some people")).toBeInTheDocument();
    expect(screen.getByText("Vilnius")).toBeInTheDocument();
    expect(screen.getByText(/^48.people match$/)).toBeInTheDocument();
    expect(screen.getByText("New teammates who match join automatically.")).toBeInTheDocument();
  });
});

describe("WhoItRunsFor", () => {
  it("Everyone clears the conditions; Only some people opens the builder with its field list", () => {
    const onChange = jest.fn();
    const conditions: Segment = { filters: [{ field: "sys:office", op: "eq", value: "o-vil" }], excludeUserIds: ["u-x"] };
    render(<WhoItRunsFor conditions={conditions} readOnly={false} check={check(1)} onChange={onChange} />);
    expect(screen.getByText(/^1.person matches$/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Everyone" }));
    expect(onChange).toHaveBeenLastCalledWith({ filters: [], excludeUserIds: ["u-x"] });
  });

  it("starts the builder with a condition to pick when Only some people is chosen", () => {
    const Harness = () => {
      const [value, setValue] = React.useState<Segment>({ filters: [], excludeUserIds: [] });
      return <WhoItRunsFor conditions={value} readOnly={false} check={null} onChange={setValue} />;
    };
    render(<Harness />);
    fireEvent.click(screen.getByRole("radio", { name: "Only some people" }));
    expect(screen.getByLabelText("Field")).toBeInTheDocument();
  });
});
