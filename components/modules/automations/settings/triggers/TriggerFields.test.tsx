import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";

import type { AutomationDefinition, TriggerSpec } from "@/models/automations";
import { automationCatalogFixture, definitionFixture } from "@/test/fixtures/automationCatalog";
import { TriggerFields } from "./TriggerFields";
import { TriggerList } from "./TriggerList";
import { defaultTrigger } from "./triggerChoices";

jest.mock("@/components/modules/automations/settings/conditions/chrome", () => jest.requireActual("@/test/automationPickersMock"));
jest.mock("@/components/ui/SearchableSelect", () => jest.requireActual("@/test/searchableSelectMock"));
jest.mock("@/components/hooks/useReferenceOptions", () => jest.requireActual("@/test/automationSettingsMocks").referenceOptions);
jest.mock("@/components/modules/organization/hooks/useUserFields", () => jest.requireActual("@/test/automationSettingsMocks").userFields);
jest.mock("@/components/auth/useAccess", () => jest.requireActual("@/test/automationSettingsMocks").access);
jest.mock("@/components/audience/hooks/useAudienceFieldOptions", () => jest.requireActual("@/test/automationSettingsMocks").audienceFieldOptions);
jest.mock("@/components/hooks/useUser/useUser", () => jest.requireActual("@/test/automationSettingsMocks").user);
jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => jest.requireActual("@/test/automationSettingsMocks").userPicker);

const catalog = automationCatalogFixture();

const renderTrigger = (trigger: TriggerSpec, patch: Partial<AutomationDefinition> = {}) => {
  const seen: { definition: AutomationDefinition } = { definition: definitionFixture({ trigger, ...patch }) };
  const Harness = () => {
    const [definition, setDefinition] = React.useState(seen.definition);
    return (
      <TriggerFields
        definition={definition}
        catalog={catalog}
        readOnly={false}
        problems={[]}
        onChange={(next) => {
          seen.definition = next;
          setDefinition(next);
        }}
      />
    );
  };
  render(<Harness />);
  return seen;
};

describe("TriggerList", () => {
  it("lists the events in their groups and hands out a trigger with its defaults", () => {
    const onPick = jest.fn();
    render(<TriggerList catalog={catalog} current={null} onPick={onPick} />);
    expect(screen.getAllByRole("group").map((g) => g.getAttribute("aria-label"))).toEqual(["People", "Dates", "Time off", "Processes"]);
    fireEvent.click(screen.getByRole("button", { name: "A related date comes up" }));
    expect(onPick).toHaveBeenLastCalledWith({ type: "DATE_OFFSET", field: "HIRE_DATE", days: 14, direction: "BEFORE", everyYear: false });
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
    expect(onPick).toHaveBeenLastCalledWith({ type: "SCHEDULE", frequency: "MONTHLY", dayOfMonth: 1, at: "09:00", timeZone: "PERSON" });
    fireEvent.click(screen.getByRole("button", { name: "Time off is declined" }));
    expect(onPick).toHaveBeenLastCalledWith(expect.objectContaining({ type: "EVENT", event: "TIME_OFF_REJECTED" }));
  });

  it("filters by what is typed, and says so when nothing matches", () => {
    render(<TriggerList catalog={catalog} current={null} onPick={jest.fn()} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Search events" }), { target: { value: "time off" } });
    expect(screen.getAllByRole("button").filter((b) => b.textContent?.startsWith("Time off"))).toHaveLength(4);
    expect(screen.queryByRole("button", { name: "Schedule" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Search events" }), { target: { value: "zzz" } });
    expect(screen.getByText("No events match")).toBeInTheDocument();
  });

  it("keeps the settings of the trigger already in use", () => {
    const onPick = jest.fn();
    const current: TriggerSpec = { type: "DATE_OFFSET", field: "PROBATION_END", days: 3, direction: "AFTER" };
    render(<TriggerList catalog={catalog} current={current} onPick={onPick} />);
    fireEvent.click(screen.getByRole("button", { name: "A related date comes up" }));
    expect(onPick).toHaveBeenCalledWith(current);
  });
});

describe("TriggerFields", () => {
  it("a related date: the date, On the day, every year, and the late policy on the definition", () => {
    const seen = renderTrigger(defaultTrigger("DATE_OFFSET"));
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "ATTRIBUTE:a-visa" } });
    expect(seen.definition.trigger).toMatchObject({ field: "ATTRIBUTE", attributeId: "a-visa" });
    fireEvent.click(screen.getByRole("radio", { name: "After" }));
    expect(seen.definition.trigger?.direction).toBe("AFTER");
    fireEvent.click(screen.getByRole("checkbox", { name: "On the day" }));
    expect(seen.definition.trigger?.direction).toBe("ON");
    expect(screen.getByRole("textbox", { name: "How many days" })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "On the day" }));
    expect(seen.definition.trigger?.direction).toBe("AFTER");
    fireEvent.click(screen.getByRole("switch"));
    expect(seen.definition.trigger?.everyYear).toBe(true);
    fireEvent.change(screen.getByRole("textbox", { name: "Run late for up to" }), { target: { value: "45" } });
    expect(seen.definition.lateWindowDays).toBe(45);
    fireEvent.click(screen.getByRole("radio", { name: "Skip it" }));
    expect(seen.definition.latePolicy).toBe("SKIP");
    expect(screen.queryByRole("textbox", { name: "Run late for up to" })).not.toBeInTheDocument();
  });

  it("Pick a date switches to one date: no Every year, no late policy", () => {
    const seen = renderTrigger(defaultTrigger("DATE_OFFSET"));
    fireEvent.click(screen.getByRole("button", { name: "Pick a date" }));
    expect(seen.definition.trigger).toMatchObject({ field: "FIXED", everyYear: false });
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(screen.queryByText("If the date has already passed")).not.toBeInTheDocument();
  });

  it("a field changes: the field, and a value of it to change to", () => {
    const seen = renderTrigger(defaultTrigger("FIELD_CHANGED"));
    expect(within(screen.getByLabelText("To")).getByRole("option", { name: "Any office" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "o-vil" } });
    expect(seen.definition.trigger?.to).toBe("o-vil");
    fireEvent.click(screen.getByRole("radio", { name: /As soon as the change is saved/ }));
    expect(seen.definition.trigger?.when).toBe("RECORDED");
    fireEvent.change(screen.getByLabelText("Field"), { target: { value: "attr:a-contact" } });
    expect(seen.definition.trigger).toMatchObject({ field: "attr:a-contact", from: null, to: null });
    expect(screen.queryByLabelText("From")).not.toBeInTheDocument();
  });

  it("time off: the event, Only when as an EventCondition tree, and what step days count from", () => {
    const seen = renderTrigger(defaultTrigger("TIME_OFF_REQUESTED"));
    fireEvent.click(screen.getByRole("radio", { name: "Approved" }));
    expect(seen.definition.trigger?.event).toBe("TIME_OFF_APPROVED");
    fireEvent.click(screen.getByRole("radio", { name: "Last day" }));
    expect(seen.definition.trigger?.anchor).toBe("LEAVE_END");
    expect(screen.getByText(/count them from the last day off/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add a condition" }));
    fireEvent.change(screen.getByLabelText("Field"), { target: { value: "days" } });
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "10" } });
    expect(seen.definition.trigger?.eventConditions).toEqual({
      kind: "ALL",
      children: [{ kind: "MATCH", field: "days", op: "gt", value: "10" }],
    });
  });

  it("a schedule: every week on several days, a month's weekday, the last day, the time zone", () => {
    const seen = renderTrigger(defaultTrigger("SCHEDULE"));
    fireEvent.click(screen.getByRole("radio", { name: "Week" }));
    expect(seen.definition.trigger).toMatchObject({ frequency: "WEEKLY", weekdays: [1] });
    fireEvent.click(screen.getByRole("button", { name: "Th" }));
    expect(seen.definition.trigger?.weekdays).toEqual([1, 4]);
    fireEvent.click(screen.getByRole("radio", { name: "Month" }));
    fireEvent.click(screen.getByRole("button", { name: "15" }));
    expect(seen.definition.trigger).toMatchObject({ frequency: "MONTHLY", dayOfMonth: 15, weekOfMonth: null });
    fireEvent.click(screen.getByRole("button", { name: "Last day" }));
    expect(seen.definition.trigger?.dayOfMonth).toBe(0);
    fireEvent.click(screen.getByRole("radio", { name: "A weekday" }));
    fireEvent.change(screen.getByLabelText("Which week"), { target: { value: "0" } });
    expect(seen.definition.trigger).toMatchObject({ weekOfMonth: 0, weekdays: [1], dayOfMonth: null });
    fireEvent.change(screen.getByRole("textbox", { name: "At" }), { target: { value: "1730" } });
    fireEvent.blur(screen.getByRole("textbox", { name: "At" }));
    expect(seen.definition.trigger?.at).toBe("17:30");
    fireEvent.change(screen.getByLabelText("Time zone"), { target: { value: "COMPANY" } });
    expect(seen.definition.trigger?.timeZone).toBe("COMPANY");
  });

  it("a quarter says the dates it runs on", () => {
    renderTrigger({ type: "SCHEDULE", frequency: "QUARTERLY", monthOfPeriod: 1, dayOfMonth: 1, at: "09:00" });
    // The order of day and month is the reader's; the four months are the quarter's first.
    expect(screen.getByText(/^Runs on .*Jan.*Apr.*Jul.*Oct.*\.$/)).toBeInTheDocument();
  });

  it("a quarter's 31st in its second month runs on the last day of February, not on 1 March", () => {
    // Walk of 2026-11-07: the month's length came from 2024 (29 days) and the date from this year, so 2026's
    // "29 February" rolled over to 1 March.
    jest.useFakeTimers({ now: new Date(2026, 10, 7) });
    try {
      renderTrigger({ type: "SCHEDULE", frequency: "QUARTERLY", monthOfPeriod: 2, dayOfMonth: 31, at: "09:00" });
      const hint = screen.getByText(/^Runs on /).textContent ?? "";
      expect(hint).toMatch(/Feb 28|28 Feb/);
      expect(hint).not.toMatch(/Mar/);
    } finally {
      jest.useRealTimers();
    }
  });

  it("someone joins a group: what happens when they stop matching", () => {
    const seen = renderTrigger(defaultTrigger("JOINS_SEGMENT"), {
      conditions: { filters: [{ field: "sys:office", op: "eq", value: "o-vil" }], excludeUserIds: [] },
    });
    expect(screen.getByText("Office is Vilnius")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Leave everything as it is" }));
    expect(seen.definition.trigger?.onLeave).toBe("KEEP");
  });

  it("a process is completed: any offboarding, or one template", () => {
    const seen = renderTrigger(defaultTrigger("PROCESS_COMPLETED"));
    fireEvent.change(screen.getByLabelText("Process"), { target: { value: "ANY_OFFBOARDING" } });
    expect(seen.definition.trigger?.process).toBe("ANY_OFFBOARDING");
    fireEvent.change(screen.getByLabelText("Process"), { target: { value: "t-eng" } });
    expect(seen.definition.trigger?.process).toBe("t-eng");
  });

  it("someone is hired has nothing to set: one grey line", () => {
    renderTrigger({ type: "PERSON_HIRED" });
    expect(screen.getByText("It runs for each new person, on their hire date.")).toBeInTheDocument();
  });
});
