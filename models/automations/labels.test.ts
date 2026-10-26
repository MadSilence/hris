import { actionSentence, formatMoment, offsetText, reasonText, triggerSentence } from "./labels";
import { insertPlaceholder } from "@/components/modules/automations/builder/draft";

describe("automation sentences", () => {
  it("reads a dated trigger as prose, every year included", () => {
    expect(triggerSentence({ type: "DATE_OFFSET", field: "HIRE_DATE", direction: "BEFORE", days: 3 })).toBe("3 days before the hire date");
    expect(triggerSentence({ type: "DATE_OFFSET", field: "DATE_OF_BIRTH", direction: "ON", days: 0, everyYear: true })).toBe("On the date of birth, every year");
    expect(triggerSentence({ type: "PERSON_HIRED" })).toBe("When someone is hired");
  });

  it("reads an action with its target's name", () => {
    expect(actionSentence(
      { type: "ASSIGN", assignableType: "PUBLIC_HOLIDAY_CALENDAR", assignableId: "c1" },
      { targets: new Map([["c1", "Germany 2026"]]) },
    )).toBe("Assign holiday calendar Germany 2026");
    expect(actionSentence({ type: "SEND_EMAIL", recipients: [{ kind: "PERSON" }, { kind: "MANAGER" }], subject: "Welcome" }))
      .toBe("Email the person and their manager: Welcome");
  });

  it("says an offset in days, before or after", () => {
    expect(offsetText(0)).toBe("on the day");
    expect(offsetText(-2)).toBe("2 days before");
    expect(offsetText(1)).toBe("1 day after");
  });
});

describe("reasonText", () => {
  it("words a known reason and keeps its detail", () => {
    expect(reasonText("MISSING_PLACEHOLDER: managerName")).toBe("Failed: {managerName} has no value");
    expect(reasonText("NO_LONGER_MATCHES")).toBe("Skipped: no longer matches the conditions");
    expect(reasonText("LATE_DATA: planned for 2026-10-14")).toMatch(/^Ran late: planned for /);
  });

  it("shows an engine error as it is — it is the only account of what went wrong", () => {
    expect(reasonText("SMTP connection refused")).toBe("SMTP connection refused");
  });
});

describe("formatMoment", () => {
  it("reads a zone-less backend moment as UTC", () => {
    expect(formatMoment("2026-10-16T08:00:00")).toBe(formatMoment("2026-10-16T08:00:00Z"));
    expect(formatMoment(null)).toBe("");
  });
});

describe("insertPlaceholder", () => {
  it("puts the token at the caret and moves the caret after it", () => {
    expect(insertPlaceholder("Hi ,", "firstName", 3, 3)).toEqual({ text: "Hi {firstName},", caret: 14 });
  });

  it("replaces a selection, and appends when there is no caret", () => {
    expect(insertPlaceholder("Hi NAME", "firstName", 3, 7)).toEqual({ text: "Hi {firstName}", caret: 14 });
    expect(insertPlaceholder("Hi ", "firstName", null, null).text).toBe("Hi {firstName}");
  });
});
