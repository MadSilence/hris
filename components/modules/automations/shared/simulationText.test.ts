import { translatorFor } from "@/test/nextIntl";
import type { SimulatedStep } from "@/models/automations";
import type { AutomationsT } from "./vocabulary";
import { simulatedStepText, simulationNotes, stepNoteText, stepSummaryText } from "./simulationText";

const t = translatorFor("automations") as unknown as AutomationsT;
const code = (c: string, params: Record<string, string> = {}) => ({ code: c, params });

describe("the simulation's notes", () => {
  it("words a note from its code", () => {
    expect(simulationNotes(t, ["x"], [code("NO_ANCHOR_DATE")])).toEqual(["This person has no date for the rule to count from."]);
    expect(simulationNotes(t, ["x"], [code("EVENT_COUNTED_TODAY_LEAVE_DATES")]))
      .toEqual(["Counted as if the event happened today; a leave's own dates move these days."]);
  });

  it("keeps the server's English for an unknown code or no codes", () => {
    expect(simulationNotes(t, ["Server words."], [code("SOMETHING_NEW")])).toEqual(["Server words."]);
    expect(simulationNotes(t, ["Server words."], undefined)).toEqual(["Server words."]);
  });

  it("words a step's note, a wait's timeout included", () => {
    expect(stepNoteText(t, code("STEP_WAITS_FOR_APPROVAL", { maxDays: "1" })))
      .toBe("Waits for the approval, at most 1 day; a refusal stops the rest");
    expect(stepNoteText(t, code("STEP_WAITS", { maxDays: "5", onTimeout: "STOP" }))).toBe("Waits, at most 5 days, then stops the rest");
    expect(stepNoteText(t, code("STEP_WAITS", { maxDays: "5", onTimeout: "LATER" }))).toBeNull();
  });
});

describe("a step's summary", () => {
  it("words the action from its parts, the company's texts as typed", () => {
    expect(stepSummaryText(t, code("SEND_EMAIL", { recipients: "PERSON,MANAGER", subject: "Welcome" })))
      .toBe("Email the person and their manager: Welcome");
    expect(stepSummaryText(t, code("NOTIFY", { recipients: "", text: "Hi" }))).toBe("Notify nobody yet: Hi");
    expect(stepSummaryText(t, code("ASSIGN", { target: "OFFICE", targetName: "Berlin" }))).toBe("Assign office Berlin");
    expect(stepSummaryText(t, code("WAIT_UNTIL", { until: "TASK_DONE", taskStep: "2", maxDays: "30" })))
      .toBe("Wait until task 2 is done, at most 30 days");
    expect(stepSummaryText(t, code("START_REVIEW", { templateName: "Probation review" }))).toBe("Start a review: Probation review");
  });

  it("falls back to the server's English for an unknown code or kind", () => {
    const step: SimulatedStep = {
      position: 0, actionType: "NOTIFY", summary: "Notify the person: Hi", date: null, late: false, conditionMet: null,
      note: "Server note", summaryCode: code("NOTIFY", { recipients: "SOMEONE_NEW", text: "Hi" }), noteCode: code("STEP_LATER"),
    };
    expect(simulatedStepText(t, step)).toEqual({ summary: "Notify the person: Hi", note: "Server note" });
    expect(simulatedStepText(t, { ...step, summaryCode: undefined, noteCode: undefined }))
      .toEqual({ summary: "Notify the person: Hi", note: "Server note" });
    expect(stepSummaryText(t, code("SOMETHING_NEW"))).toBeNull();
  });
});
