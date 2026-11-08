import { EMPTY_FILTERS, filterAutomations, menuFor, pauseFixFor, triggerKey, triggerKeysOf } from "./listModel";
import { summary } from "./testSummary";

describe("the ⋯ menu per status", () => {
  it.each([
    ["ACTIVE", 3, ["edit", "duplicate", "turnOff", "runHistory", "changeOwner", "archive"]],
    ["PAUSED", 3, ["edit", "duplicate", "turnOn", "runHistory", "changeOwner", "archive"]],
    ["DRAFT", 0, ["edit", "duplicate", "changeOwner", "delete"]],
    ["ARCHIVED", 94, ["unarchive", "duplicate", "runHistory"]],
  ] as const)("%s", (status, runs, items) => {
    expect(menuFor(summary({ status, runs }))).toEqual(items);
  });

  it("archives a draft that has run instead of deleting it", () => {
    expect(menuFor(summary({ status: "DRAFT", runs: 2 }))).toEqual(["edit", "duplicate", "changeOwner", "archive"]);
  });

  it("offers a holiday calendar's binding its history alone", () => {
    expect(menuFor(summary({ origin: "SYSTEM" }))).toEqual(["runHistory"]);
  });
});

describe("the paused card's one button", () => {
  const paused = (reason: "MANUAL" | "OWNER_LEFT" | "OWNER_LACKS_RIGHT" | "TARGET_GONE") =>
    summary({ status: "PAUSED", pause: { reason, by: null, at: null, detail: null, stepId: "s2" } });

  it.each([
    ["OWNER_LEFT", "makeMeOwner"],
    ["OWNER_LACKS_RIGHT", "makeMeOwner"],
    ["TARGET_GONE", "fixStep"],
    ["MANUAL", "turnOn"],
  ] as const)("%s → %s", (reason, fix) => {
    expect(pauseFixFor(paused(reason))).toBe(fix);
  });

  it("is absent on a card that is not paused", () => {
    expect(pauseFixFor(summary())).toBeNull();
  });
});

describe("the filters", () => {
  const list = [
    summary({ id: "a", name: "Welcome email", status: "ACTIVE", trigger: { type: "PERSON_HIRED" } }),
    summary({ id: "b", name: "Long time off approval", status: "PAUSED", trigger: { type: "EVENT", event: "TIME_OFF_REQUESTED" } }),
    summary({ id: "c", name: "Sick day notice", status: "DRAFT", trigger: { type: "EVENT", event: "TIME_OFF_REQUESTED" } }),
    summary({ id: "d", name: "Laptop order", status: "ACTIVE", trigger: { type: "DATE_OFFSET", field: "FIXED" } }),
  ];

  it("keeps one status for a chip", () => {
    expect(filterAutomations(list, { ...EMPTY_FILTERS, chip: "DRAFT" }).map((a) => a.id)).toEqual(["c"]);
    expect(filterAutomations(list, { ...EMPTY_FILTERS, chip: "ACTIVE" }).map((a) => a.id)).toEqual(["a", "d"]);
  });

  it("keeps what starts the same way for Starts when", () => {
    expect(filterAutomations(list, { ...EMPTY_FILTERS, startsWhen: "TIME_OFF_REQUESTED" }).map((a) => a.id)).toEqual(["b", "c"]);
  });

  it("searches the name, case aside", () => {
    expect(filterAutomations(list, { ...EMPTY_FILTERS, q: "LAPTOP" }).map((a) => a.id)).toEqual(["d"]);
  });

  it("puts a fresh duplicate first", () => {
    expect(filterAutomations(list, EMPTY_FILTERS, "c").map((a) => a.id)).toEqual(["c", "a", "b", "d"]);
  });

  it("names a trigger by its event, or as a picked date", () => {
    expect(triggerKey({ type: "EVENT", event: "PROCESS_COMPLETED" })).toBe("PROCESS_COMPLETED");
    expect(triggerKey({ type: "DATE_OFFSET", field: "FIXED" })).toBe("FIXED_DATE");
    expect(triggerKey({ type: "DATE_OFFSET", field: "HIRE_DATE" })).toBe("DATE_OFFSET");
    expect(triggerKeysOf(list)).toEqual(["PERSON_HIRED", "TIME_OFF_REQUESTED", "FIXED_DATE"]);
  });
});
