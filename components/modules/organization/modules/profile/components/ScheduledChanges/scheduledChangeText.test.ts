import type { ScheduledChange } from "@/models/user/ScheduledChange";
import type { useTranslations } from "next-intl";
import { translatorFor } from "@/test/nextIntl";
import { labelOfChange, pendingSteps } from "./scheduledChangeText";

const change = (over: Partial<ScheduledChange>): ScheduledChange => ({
  id: "c1",
  kind: "ASSIGNMENT_START",
  labelKey: "ASSIGNMENT_START.OFFICE",
  effectiveAt: "2026-12-01",
  scheduledBy: null,
  scheduledAt: null,
  canCancel: true,
  canReschedule: false,
  rescheduleDate: null,
  fieldId: "sys:office",
  operation: "SET",
  value: { id: "paris", name: "Paris" },
  subject: null,
  ...over,
});

const london = { id: "london", name: "London" };
const tCommon = translatorFor("common") as unknown as ReturnType<typeof useTranslations<"common">>;

describe("pendingSteps", () => {
  it("reads nothing for a field nothing is scheduled on", () => {
    expect(pendingSteps(tCommon, [change({})], "sys:department", [])).toEqual([]);
    expect(pendingSteps(tCommon, undefined, "sys:office", [london])).toEqual([]);
  });

  it("applies a start and its end in date order", () => {
    const steps = pendingSteps(
      tCommon,
      [
        change({ id: "end", kind: "ASSIGNMENT_END", operation: "REMOVE", effectiveAt: "2027-01-01" }),
        change({}),
      ],
      "sys:office",
      [london],
    );
    expect(steps).toEqual([
      { date: "2026-12-01", label: "Paris" },
      { date: "2027-01-01", label: "None" },
    ]);
  });

  it("adds to and removes from a field that holds several", () => {
    const steps = pendingSteps(
      tCommon,
      [
        change({ fieldId: "sys:team", operation: "ADD", value: { id: "t2", name: "Design" } }),
        change({ fieldId: "sys:team", operation: "REMOVE", value: { id: "t1", name: "Sales" }, effectiveAt: "2026-12-05" }),
      ],
      "sys:team",
      [{ id: "t1", name: "Sales" }],
    );
    expect(steps).toEqual([
      { date: "2026-12-01", label: "Sales, Design" },
      { date: "2026-12-05", label: "Design" },
    ]);
  });

  it("draws no step for the removal of a value the field does not hold", () => {
    const steps = pendingSteps(
      tCommon,
      [change({ kind: "ASSIGNMENT_END", operation: "REMOVE", value: { id: "elsewhere", name: "Berlin" } })],
      "sys:office",
      [london],
    );
    expect(steps).toEqual([]);
  });

  it("names a status by its word", () => {
    const steps = pendingSteps(
      tCommon,
      [change({ kind: "TERMINATION", fieldId: "sys:status", value: { id: "ARCHIVED", name: null } })],
      "sys:status",
      [{ id: "ACTIVE", name: "Active" }],
    );
    expect(steps).toEqual([{ date: "2026-12-01", label: "Archived" }]);
  });
});

describe("labelOfChange", () => {
  it("names each kind", () => {
    const t = translatorFor("organization") as unknown as ReturnType<typeof useTranslations<"organization">>;
    expect(labelOfChange(t, tCommon, change({}))).toBe("Office Starts: Paris");
    expect(labelOfChange(t, tCommon, change({ kind: "TERMINATION" }))).toBe("Employment ends");
    expect(labelOfChange(t, tCommon, change({ kind: "TASK_DUE", subject: "Laptop", fieldId: null, value: null }))).toBe(
      "Task due: Laptop",
    );
  });
});
