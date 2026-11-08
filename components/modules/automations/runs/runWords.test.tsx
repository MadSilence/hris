import { renderHook } from "@testing-library/react";
import type { AutomationRun } from "@/models/automations";
import { partialMock } from "@/test/types";
import { resetDisplayPreferences, setDisplayPreferences } from "@/lib/date";
import { parseReason, useRunWords } from "./runWords";
import { useVersionWords } from "./VersionsWindow";
import { versionChanges } from "./versionSummary";

const words = () => renderHook(() => useRunWords()).result.current;
const year = new Date().getFullYear();

// Day before month, as the frames write dates.
beforeAll(() => setDisplayPreferences({ dateFormat: "DMY" }));
afterAll(() => resetDisplayPreferences());

describe("a reason as a sentence", () => {
  it("splits a code from its detail", () => {
    expect(parseReason("NO_APPROVER: nobody to approve this for Anna")).toEqual({
      code: "NO_APPROVER",
      detail: "nobody to approve this for Anna",
    });
    expect(parseReason("DUPLICATE")).toEqual({ code: "DUPLICATE", detail: null });
    expect(parseReason("  ")).toBeNull();
    expect(parseReason(null)).toBeNull();
  });

  it("says what happened, then why — the code's sentence, never the backend's detail", () => {
    const w = words();
    expect(w.reason("NO_ASSIGNEE: Marta left the team")).toBe("We couldn't create the task: there is nobody to give it to.");
    expect(w.reason("CONDITION_NOT_MET")).toBe("It was skipped: its “Only if” didn't hold for this person.");
    expect(w.reason("RULE_PAUSED")).toBe("It was cancelled: the automation was paused.");
    expect(w.reason("NO_APPROVER: nobody to approve this for Anna")).toBe("It failed: there is nobody to approve it.");
    expect(w.reason("TIMED_OUT")).toBe("It waited as long as it may.");
  });

  it("falls back to a plain sentence for a code it does not know, and says nothing for no reason", () => {
    const w = words();
    expect(w.reason("SOMETHING_NEW: detail")).toBe("Something went wrong.");
    expect(w.reason(null)).toBeNull();
  });
});

describe("a run row's words", () => {
  const run = (about: Record<string, unknown>, extra: Partial<AutomationRun> = {}) =>
    partialMock<AutomationRun>({ about, triggerType: "EVENT", ranLate: false, daysLate: 0, person: null, ...extra });

  it("words a leave by its type and dates, or its days", () => {
    const w = words();
    expect(w.about(run({ kind: "TIME_OFF", leaveType: "Vacation", start: `${year}-12-09`, end: `${year}-12-27` }))).toBe(
      "Vacation, 9–27 Dec",
    );
    expect(w.about(run({ kind: "TIME_OFF", leaveType: "Vacation", days: 12 }))).toBe("Vacation, 12 days");
    expect(w.about(run({ kind: "PROCESS", name: "Engineering onboarding" }))).toBe("Engineering onboarding");
    expect(w.about(run({ kind: "DATE_OFFSET", anchorDate: `${year}-11-04` }, { triggerType: "DATE_OFFSET" }))).toBe(
      "A related date comes up · 4 Nov",
    );
  });

  it("titles a run by the person and what it was about", () => {
    const w = words();
    const r = run(
      { kind: "TIME_OFF", leaveType: "Vacation", days: 3 },
      { person: { id: "p", name: "Lena Kowalska", avatarUrl: null, jobTitle: null, office: null } },
    );
    expect(w.title(r)).toBe("Lena Kowalska, Vacation");
  });

  it("says how late a run ran", () => {
    const w = words();
    expect(w.late({ ranLate: true, daysLate: 2 })).toBe("Ran 2 days late");
    expect(w.late({ ranLate: true, daysLate: 1 })).toBe("Ran 1 day late");
    expect(w.late({ ranLate: true, daysLate: 0 })).toBe("Ran late");
    expect(w.late({ ranLate: false, daysLate: 0 })).toBeNull();
  });

  it("reads today and yesterday as words", () => {
    const w = words();
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(w.day(now.toISOString())).toBe("Today");
    expect(w.day(yesterday.toISOString())).toBe("Yesterday");
    expect(w.day(`${year}-11-04`)).toMatch(/Nov|4/);
  });
});

describe("what changed in a version", () => {
  const word = () => renderHook(() => useVersionWords()).result.current;

  it("words the first version as turned on", () => {
    expect(versionChanges(null).map(word())).toEqual(["Turned on"]);
  });

  it("words each change on its own, with the counts in their plural", () => {
    const summary = JSON.stringify({ trigger: true, whoItRunsFor: false, added: 1, removed: 2, changed: 0 });
    expect(versionChanges(summary).map(word())).toEqual(["Changed what starts it", "Added 1 step", "Removed 2 steps"]);
    expect(versionChanges(JSON.stringify({ whoItRunsFor: true, changed: 3 })).map(word())).toEqual([
      "Changed who it runs for",
      "Changed 3 steps",
    ]);
  });

  it("says nothing changed in the steps when the summary holds no change, or cannot be read", () => {
    const none = JSON.stringify({ trigger: false, whoItRunsFor: false, added: 0, removed: 0, changed: 0 });
    expect(versionChanges(none).map(word())).toEqual(["Saved with no changes to the steps"]);
    expect(versionChanges("{not json").map(word())).toEqual(["Saved with no changes to the steps"]);
  });
});
