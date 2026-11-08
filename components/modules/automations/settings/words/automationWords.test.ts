import { translatorFor } from "@/test/nextIntl";
import type { StepSpec } from "@/models/automations";
import { definitionFixture } from "@/test/fixtures/automationCatalog";
import { automationWords, type AutomationsTranslator, type NameBook } from "./automationWords";
import type { SettingsTranslator } from "../parts/problems";

const names: NameBook = {
  role: (id) => (id === "r-hr" ? "HR Admin" : null),
  policy: (id) => (id === "p-vac" ? "Vacation" : null),
  calendar: (id) => (id === "c-lt" ? "Lithuania" : null),
  form: (id) => (id === "f-prob" ? "Probation review" : null),
  processTemplate: () => null,
  dateAttribute: (id) => (id === "a-visa" ? "Visa expires" : null),
  changeableField: (v) => (v === "office" ? "Office" : v ?? null),
  assignable: (_type, id) => (id === "d-eng" ? "Engineering" : null),
  fieldLabel: (f) => (f === "sys:office" ? "Office" : null),
  filterValue: (f) => (f.value === "o-vil" ? "Vilnius" : f.value ?? ""),
  fillable: (f) => (f === "attr:a-contact" ? "Emergency contact" : f ?? ""),
  placeholder: (n) => (n === "firstName" ? "First name" : n),
  eventField: (n) => (n === "days" ? "Days" : n),
  eventValue: (v) => v,
};

const words = automationWords({
  t: translatorFor("automationsSettings") as unknown as SettingsTranslator,
  tA: translatorFor("automations") as unknown as AutomationsTranslator,
  names,
  date: (iso) => iso,
  list: (items) => new Intl.ListFormat("en", { type: "conjunction" }).format(items),
  weekday: (d) => ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][d],
  dayOfMonth: (m, d) => `${d} ${["", "January", "February", "March"][m] ?? m}`,
});

const nb = (s: string) => s.replace(/ /g, " ");

describe("the words of an automation", () => {
  it("names an approval by who approves and what happens with no answer", () => {
    const step: StepSpec = { id: "s1", type: "REQUEST_APPROVAL", assignee: { kind: "MANAGER" }, maxDays: 3, ifNoAnswer: "ASK_THEIR_MANAGER" };
    expect(words.stepKind(step)).toBe("Ask for approval");
    expect(words.stepTitle(step)).toBe("Their manager approves");
    expect(nb(words.stepSubtitle(step) ?? "")).toBe("No answer in 3 days: ask their manager");
  });

  it("names a task by its title, its assignee and due date, and its timing and condition", () => {
    const step: StepSpec = {
      id: "s1",
      type: "CREATE_TASK",
      title: "Book the review with {firstName}",
      assignee: { kind: "MANAGER" },
      dueDays: 7,
      when: { mode: "LATER", days: 80, direction: "AFTER", countedFrom: "HIRE_DATE" },
      condition: { filters: [{ field: "sys:office", op: "eq", value: "o-vil" }], excludeUserIds: [] },
    };
    expect(words.stepTitle(step)).toBe("Book the review with First name");
    expect(nb(words.stepSubtitle(step) ?? "")).toBe(
      "For their manager · due in 7 days · 80 days after the hire date · only if Office is Vilnius",
    );
  });

  it("names a notification by its recipients, and a wait by what it waits for", () => {
    expect(words.stepTitle({ id: "s1", type: "NOTIFY", recipients: [{ kind: "ROLE", roleId: "r-hr" }, { kind: "MANAGER" }] })).toBe(
      "Tell HR Admin and their manager",
    );
    const wait: StepSpec = { id: "s2", type: "WAIT_UNTIL", until: "TASK_DONE", maxDays: 10, onTimeout: "STOP_AND_TELL", tell: [{ kind: "ROLE", roleId: "r-hr" }] };
    expect(words.stepTitle(wait)).toBe("The task is done");
    expect(nb(words.stepSubtitle(wait) ?? "")).toBe("At most 10 days, then stop and tell HR Admin");
    expect(words.stepTitle({ id: "s3", type: "WAIT_UNTIL", until: "FIELD_FILLED", field: "attr:a-contact" })).toBe("Emergency contact is filled");
  });

  it("names an assignment by what changes with each person, and a split by its paths", () => {
    expect(words.stepTitle({ id: "s1", type: "ASSIGN", assignableType: "PUBLIC_HOLIDAY_CALENDAR", relation: "OFFICE_CALENDAR" })).toBe(
      "Their office's calendar",
    );
    const split: StepSpec = { id: "s2", type: "SPLIT", question: "Which office are they in?", paths: [{ id: "p1", name: "Warsaw", steps: [] }, { id: "p2", name: "Vilnius", steps: [] }] };
    expect(words.stepTitle(split)).toBe("Which office are they in?");
    expect(nb(words.stepSubtitle(split) ?? "")).toBe("3 paths");
  });

  it("titles a trigger and its second line", () => {
    expect(nb(words.triggerTitle({ type: "DATE_OFFSET", field: "PROBATION_END", days: 14, direction: "BEFORE" }))).toBe(
      "14 days before the end of probation",
    );
    expect(words.triggerSubtitle({ type: "DATE_OFFSET", field: "PROBATION_END", days: 14, direction: "BEFORE" })).toBe("Every person, once");
    expect(words.triggerTitle({ type: "FIELD_CHANGED", field: "office" })).toBe("Office changes");
    expect(words.triggerSubtitle({ type: "FIELD_CHANGED", field: "office" })).toBe("From any office to any office");
    expect(words.triggerTitle({ type: "SCHEDULE", frequency: "MONTHLY", dayOfMonth: 15, at: "09:00" })).toBe("15th of every month, 09:00");
    expect(words.triggerTitle({ type: "SCHEDULE", frequency: "WEEKLY", weekdays: [1, 4], at: "09:00" })).toBe("Every Monday and Thursday, 09:00");
    expect(nb(words.triggerSubtitle({
      type: "EVENT",
      event: "TIME_OFF_REQUESTED",
      eventConditions: { kind: "ALL", children: [{ kind: "MATCH", field: "days", op: "gt", value: "10" }] },
    }) ?? "")).toBe("Days more than 10");
    expect(words.triggerTitle({ type: "EVENT", event: "PROCESS_COMPLETED", process: "ANY_ONBOARDING" })).toBe("An onboarding is completed");
  });

  it("reads the whole automation as one sentence, each step's words marked with its id", () => {
    const definition = definitionFixture({
      trigger: { type: "DATE_OFFSET", field: "PROBATION_END", days: 14, direction: "BEFORE" },
      steps: [
        { id: "s1", type: "CREATE_TASK", title: "Book", assignee: { kind: "MANAGER" } },
        { id: "s2", type: "WAIT_UNTIL", until: "TASK_DONE" },
        { id: "s3", type: "NOTIFY", recipients: [{ kind: "ROLE", roleId: "r-hr" }] },
      ],
    });
    const parts = words.sentence(definition);
    expect(nb(parts.map((p) => p.text).join(""))).toBe(
      "When the end of probation is 14 days away, noddo gives their manager a task, then waits until the task is done and tells HR Admin.",
    );
    expect(parts.filter((p) => p.stepId).map((p) => p.stepId)).toEqual(["s1", "s2", "s3"]);
    expect(parts.find((p) => p.stepId === "s3")?.chip).toBe(true);
  });

  it("puts grey placeholders in the sentence before anything is picked", () => {
    const parts = words.sentence(definitionFixture({ trigger: null, steps: [] }));
    expect(parts.filter((p) => p.placeholder).map((p) => p.text)).toEqual(["something happens", "does the steps"]);
  });
});
