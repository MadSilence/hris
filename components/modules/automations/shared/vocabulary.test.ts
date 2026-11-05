import { translatorFor } from "@/test/nextIntl";
import { actionSentence, offsetText, reasonText, triggerSentence, type AutomationsT } from "./vocabulary";

const t = translatorFor("automations") as unknown as AutomationsT;

describe("automation sentences", () => {
  it("reads a dated trigger as prose, every year included", () => {
    expect(triggerSentence(t, { type: "DATE_OFFSET", field: "HIRE_DATE", direction: "BEFORE", days: 3 })).toBe("3 days before the hire date");
    expect(triggerSentence(t, { type: "DATE_OFFSET", field: "DATE_OF_BIRTH", direction: "ON", days: 0, everyYear: true })).toBe("On the date of birth, every year");
    expect(triggerSentence(t, { type: "PERSON_HIRED" })).toBe("When someone is hired");
  });

  it("reads an action with its target's name", () => {
    expect(actionSentence(t, { type: "ASSIGN", assignableType: "PUBLIC_HOLIDAY_CALENDAR", assignableId: "c1" },
      { targets: new Map([["c1", "Germany 2026"]]) },
    )).toBe("Assign holiday calendar Germany 2026");
    expect(actionSentence(t, { type: "SEND_EMAIL", recipients: [{ kind: "PERSON" }, { kind: "MANAGER" }], subject: "Welcome" }))
      .toBe("Email the person and their manager: Welcome");
  });

  it("says an offset in days, before or after", () => {
    expect(offsetText(t, 0)).toBe("on the day");
    expect(offsetText(t, -2)).toBe("2 days before");
    expect(offsetText(t, 1)).toBe("1 day after");
  });
});

describe("reasonText", () => {
  it("reads a pause about the author in words, with what happened", () => {
    expect(reasonText(t, "AUTHOR_LEFT: its author has left")).toBe("Paused — its author has left");
  });

  it("words a known reason and keeps its detail", () => {
    expect(reasonText(t, "MISSING_PLACEHOLDER: managerName")).toBe("Failed: {managerName} has no value");
    expect(reasonText(t, "NO_LONGER_MATCHES")).toBe("Skipped: no longer matches the conditions");
    expect(reasonText(t, "LATE_DATA: planned for 2026-10-14")).toMatch(/^Ran late: planned for /);
  });

  it("shows an engine error as it is — it is the only account of what went wrong", () => {
    expect(reasonText(t, "SMTP connection refused")).toBe("SMTP connection refused");
  });
});

