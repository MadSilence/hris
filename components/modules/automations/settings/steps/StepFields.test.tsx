import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";

import type { AutomationDefinition, AutomationProblem, StepSpec } from "@/models/automations";
import { automationCatalogFixture, definitionFixture } from "@/test/fixtures/automationCatalog";
import { StepFields } from "./StepFields";

jest.mock("@/components/modules/automations/settings/conditions/chrome", () => jest.requireActual("@/test/automationPickersMock"));
jest.mock("@/components/hooks/useReferenceOptions", () => jest.requireActual("@/test/automationSettingsMocks").referenceOptions);
jest.mock("@/components/modules/organization/hooks/useUserFields", () => jest.requireActual("@/test/automationSettingsMocks").userFields);
jest.mock("@/components/auth/useAccess", () => jest.requireActual("@/test/automationSettingsMocks").access);
jest.mock("@/components/audience/hooks/useAudienceFieldOptions", () => jest.requireActual("@/test/automationSettingsMocks").audienceFieldOptions);
jest.mock("@/components/audience/hooks/useSegmentResolve", () => jest.requireActual("@/test/automationSettingsMocks").segmentResolve);
jest.mock("@/components/hooks/useUser/useUser", () => jest.requireActual("@/test/automationSettingsMocks").user);
jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => jest.requireActual("@/test/automationSettingsMocks").userPicker);
jest.mock("@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars", () =>
  jest.requireActual("@/test/automationSettingsMocks").holidayCalendars);
jest.mock("@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies", () =>
  jest.requireActual("@/test/automationSettingsMocks").timeOffPolicies);

const catalog = automationCatalogFixture();

/** The window as the editor holds it: the step in state, the last one handed out kept for the assertions. */
const renderStep = (initial: StepSpec, options: { definition?: AutomationDefinition; problems?: AutomationProblem[] } = {}) => {
  const seen: { step: StepSpec } = { step: initial };
  const Harness = () => {
    const [step, setStep] = React.useState(initial);
    const definition = options.definition ?? definitionFixture({ steps: [step] });
    return (
      <StepFields
        definition={definition}
        step={step}
        catalog={catalog}
        readOnly={false}
        problems={options.problems ?? []}
        onChange={(next) => {
          seen.step = next;
          setStep(next);
        }}
      />
    );
  };
  render(<Harness />);
  return seen;
};

describe("StepFields", () => {
  it("Send a notification: a role picked in Who gets it is a recipient, roles first in the list", () => {
    const seen = renderStep({ id: "s1", type: "NOTIFY", recipients: [], text: "" });
    fireEvent.focus(screen.getByRole("combobox", { name: "Who gets it" }));
    const list = screen.getByRole("listbox");
    const options = within(list).getAllByRole("option").map((o) => o.textContent);
    expect(options[0]).toContain("The person");
    expect(options.findIndex((o) => o?.includes("HR Admin"))).toBeLessThan(options.findIndex((o) => o?.includes("Aistė")));
    fireEvent.click(within(list).getByText("Their manager"));
    expect(seen.step.recipients).toEqual([{ kind: "MANAGER" }]);
    fireEvent.click(within(screen.getByRole("listbox")).getByText("Marta Nowak"));
    expect(seen.step.recipients).toEqual([{ kind: "MANAGER" }, { kind: "USER", userId: "u-marta" }]);
  });

  it("Send a notification: the message keeps its fields as {name} text", () => {
    renderStep({ id: "s1", type: "NOTIFY", recipients: [{ kind: "PERSON" }], text: "Hi {firstName}" });
    const message = screen.getByRole("textbox", { name: "Message" });
    expect(message.querySelector('[data-token="firstName"]')).toHaveTextContent("First name");
    expect(screen.getByText("Type @ to insert a field.")).toBeInTheDocument();
  });

  it("Create a task: the due days and the assignee", () => {
    const seen = renderStep({ id: "s1", type: "CREATE_TASK", title: "Book", assignee: null, dueDays: 7 });
    fireEvent.change(screen.getByRole("textbox", { name: "Due" }), { target: { value: "10" } });
    expect(seen.step.dueDays).toBe(10);
    fireEvent.focus(screen.getByRole("combobox", { name: "Assignee" }));
    fireEvent.click(within(screen.getByRole("listbox")).getByText("Their manager's manager"));
    expect(seen.step.assignee).toEqual({ kind: "MANAGERS_MANAGER" });
    expect(screen.getByText("If there's no one to assign, the step fails and the run tells you why.")).toBeInTheDocument();
  });

  it("Ask for approval: what happens with no answer, and the daily reminder", () => {
    const seen = renderStep({ id: "s1", type: "REQUEST_APPROVAL", assignee: { kind: "MANAGER" }, maxDays: 3, ifNoAnswer: "ASK_THEIR_MANAGER" });
    fireEvent.change(screen.getByLabelText("What happens then"), { target: { value: "DECLINE" } });
    expect(seen.step.ifNoAnswer).toBe("DECLINE");
    expect(screen.getByRole("option", { name: "Treat it as declined" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Remind them every day" }));
    expect(seen.step.remindDaily).toBe(true);
  });

  it("Wait until: with no task above, waiting for a task is disabled and says why", () => {
    const seen = renderStep({ id: "s1", type: "WAIT_UNTIL", until: "TASK_DONE", maxDays: 10, onTimeout: "STOP" });
    expect(screen.getByRole("radio", { name: /A task from this run is done/ })).toBeDisabled();
    expect(screen.getByText("Add a “Create a task” step before this one.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Field"), { target: { value: "attr:a-contact" } });
    expect(seen.step).toMatchObject({ until: "FIELD_FILLED", field: "attr:a-contact" });
  });

  it("Wait until: a task step above it is offered, and Stop and tell someone opens Tell", () => {
    const task: StepSpec = { id: "t1", type: "CREATE_TASK", title: "Book the review" };
    const wait: StepSpec = { id: "w1", type: "WAIT_UNTIL", until: "TASK_DONE", maxDays: 10, onTimeout: "STOP" };
    const seen = renderStep(wait, { definition: definitionFixture({ steps: [task, wait] }) });
    fireEvent.change(screen.getByLabelText("Task"), { target: { value: "t1" } });
    expect(seen.step.taskStepId).toBe("t1");
    expect(screen.getByRole("option", { name: "1 · Book the review" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Stop and tell someone" }));
    expect(seen.step.onTimeout).toBe("STOP_AND_TELL");
    expect(screen.getByRole("combobox", { name: "Tell" })).toBeInTheDocument();
  });

  it("Assign or unassign: the action, what, and a calendar that changes with each person", () => {
    const seen = renderStep({ id: "s1", type: "ASSIGN", assignableType: null, assignableId: null });
    fireEvent.click(screen.getByRole("radio", { name: "Unassign" }));
    expect(seen.step.type).toBe("UNASSIGN");
    const what = screen.getByLabelText("What");
    expect(within(what).queryByRole("option", { name: "Time-off policy" })).not.toBeInTheDocument();
    fireEvent.change(what, { target: { value: "PUBLIC_HOLIDAY_CALENDAR" } });
    expect(seen.step).toMatchObject({ assignableType: "PUBLIC_HOLIDAY_CALENDAR", assignableId: null, relation: null });
    const which = screen.getByLabelText("Which");
    const names = within(which).getAllByRole("option").map((o) => o.textContent);
    expect(names.slice(1, 4)).toEqual(["Their office's calendar", "Their country's calendar", "Their legal entity's calendar"]);
    expect(names.slice(4)).toEqual(["Lithuania", "Poland"]);
    fireEvent.change(which, { target: { value: "rel:COUNTRY_CALENDAR" } });
    expect(seen.step).toMatchObject({ relation: "COUNTRY_CALENDAR", assignableId: null });
    fireEvent.change(which, { target: { value: "c-pl" } });
    expect(seen.step).toMatchObject({ relation: null, assignableId: "c-pl" });
  });

  it("Grant a time-off policy: policies A–Z, no group that changes with each person", () => {
    const seen = renderStep({ id: "s1", type: "GRANT_TIME_OFF_POLICY" });
    const policy = screen.getByLabelText("Policy");
    expect(within(policy).getAllByRole("option").map((o) => o.textContent)).toEqual(["-", "Parental leave", "Vacation"]);
    fireEvent.change(policy, { target: { value: "p-vac" } });
    expect(seen.step.policyId).toBe("p-vac");
    expect(screen.getByText("If they already have this policy, the step is skipped.")).toBeInTheDocument();
  });

  it("Start a review: the form and the due days", () => {
    const seen = renderStep({ id: "s1", type: "START_REVIEW", assignee: { kind: "MANAGER" }, dueDays: 14 });
    fireEvent.change(screen.getByLabelText("Review form"), { target: { value: "f-prob" } });
    expect(seen.step.formId).toBe("f-prob");
    fireEvent.change(screen.getByRole("textbox", { name: "Due" }), { target: { value: "21" } });
    expect(seen.step.dueDays).toBe(21);
  });

  it("Ask to sign a document: documents by name, and the note that it is not connected", () => {
    const seen = renderStep({ id: "s1", type: "SIGN_DOCUMENT" });
    const docs = screen.getByRole("textbox", { name: "Documents" });
    fireEvent.change(docs, { target: { value: "Handbook" } });
    fireEvent.keyDown(docs, { key: "Enter" });
    expect(seen.step.documents).toEqual(["Handbook"]);
    expect(screen.getByText(/Not connected yet/)).toBeInTheDocument();
  });

  it("Send a survey: the survey's name", () => {
    const seen = renderStep({ id: "s1", type: "SEND_SURVEY" });
    fireEvent.change(screen.getByRole("textbox", { name: "Survey" }), { target: { value: "Pulse" } });
    expect(seen.step.survey).toBe("Pulse");
  });

  it("Split by a condition: the question, a new path, and Anyone else fixed last", () => {
    const seen = renderStep({ id: "s1", type: "SPLIT", question: "", paths: [{ id: "p1", name: "", condition: null, steps: [] }],
      otherwise: { id: "otherwise", name: "", steps: [] } });
    fireEvent.change(screen.getByRole("textbox", { name: "Question" }), { target: { value: "Which office are they in?" } });
    expect(seen.step.question).toBe("Which office are they in?");
    fireEvent.click(screen.getByRole("button", { name: "Add a path" }));
    expect(seen.step.paths).toHaveLength(2);
    expect(seen.step.paths?.[1]).toMatchObject({ id: "p2", name: "", steps: [] });
    expect(screen.getByText("Anyone else")).toBeInTheDocument();
  });

  it("When: Later opens a day after the step before at 09:00, and Right away keeps it", () => {
    const seen = renderStep({ id: "s1", type: "NOTIFY", recipients: [{ kind: "PERSON" }], text: "Hi" });
    fireEvent.click(screen.getByRole("radio", { name: "Later" }));
    expect(seen.step.when).toEqual({ mode: "LATER", days: 1, direction: "AFTER", countedFrom: "PREVIOUS_STEP", at: "09:00" });
    fireEvent.click(screen.getByRole("radio", { name: "Before" }));
    fireEvent.change(screen.getByLabelText("Counted from"), { target: { value: "HIRE_DATE" } });
    expect(seen.step.when).toMatchObject({ direction: "BEFORE", countedFrom: "HIRE_DATE" });
    fireEvent.click(screen.getByRole("radio", { name: "Right away" }));
    expect(seen.step.when).toMatchObject({ mode: "RIGHT_AWAY", direction: "BEFORE", countedFrom: "HIRE_DATE" });
  });

  it("Only if: Add a condition opens the builder, and a complete condition is the step's segment", () => {
    const seen = renderStep({ id: "s1", type: "NOTIFY", recipients: [{ kind: "PERSON" }], text: "Hi" });
    fireEvent.click(screen.getByRole("button", { name: "Add a condition" }));
    fireEvent.change(screen.getByLabelText("Field"), { target: { value: "sys:office" } });
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "o-vil" } });
    expect(seen.step.condition).toEqual({ filters: [{ field: "sys:office", op: "eq", value: "o-vil" }], excludeUserIds: [] });
  });

  it("a problem shows under its field, worded by this part", () => {
    renderStep(
      { id: "s1", type: "REQUEST_APPROVAL", assignee: null, maxDays: 3 },
      { problems: [{ stepId: "s1", field: "assignee", code: "AU00004", message: "choose who approves" }] },
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Choose who approves, like “Their manager”.");
  });
});
