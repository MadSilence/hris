import { accountPillOf, nameStatusOf, setActiveDescriptionKey } from "./headerStatus";
import { translatorFor } from "@/test/nextIntl";
import type { CompanyCalendarAbsenceSpan } from "@/models/calendar";

const today = new Date(2026, 10, 18); // Wed 18 Nov 2026

const leave = (over: Partial<CompanyCalendarAbsenceSpan>): CompanyCalendarAbsenceSpan => ({
  userId: "u1",
  startDate: "2026-11-16",
  endDate: "2026-11-20",
  status: "APPROVED",
  policyName: "Annual leave",
  policyColor: "ocean",
  ...over,
});

/** Beside the name, the first that applies (profile-header spec, QR3s). */
describe("nameStatusOf", () => {
  const active = { status: "ACTIVE", hireDate: "2023-06-19", terminationDate: null };

  it("says Starts before the first day, ahead of everything else", () => {
    expect(nameStatusOf({ status: "PROSPECTIVE", hireDate: "2026-12-01", terminationDate: null },
      { current: leave({}), next: null }, today)).toEqual({ kind: "starts", date: "2026-12-01" });
  });

  it("says Last day while notice is given, before any leave", () => {
    expect(nameStatusOf({ ...active, terminationDate: "2026-11-30" }, { current: leave({}), next: null }, today))
      .toEqual({ kind: "lastDay", date: "2026-11-30" });
  });

  it("says Back on the first working day after the request's own end, in the policy's colour (W14)", () => {
    // The request ends Fri 20 Nov: back Mon 23 Nov, not "Off until Fri 20 Nov".
    expect(nameStatusOf(active, { current: leave({ endDate: "2026-11-19", requestEndDate: "2026-11-20" }), next: null }, today))
      .toEqual({ kind: "back", date: "2026-11-23", policy: "Annual leave", color: "ocean" });
  });

  it("counts Back the way the leave card does — the company's week and the person's holidays (W14)", () => {
    const monFri = { isNonWorking: (d: Date) => d.getDay() === 0 || d.getDay() === 6, holidays: new Set(["2026-11-23"]) };
    expect(nameStatusOf(active, { current: leave({}), next: null }, today, monFri))
      .toEqual({ kind: "back", date: "2026-11-24", policy: "Annual leave", color: "ocean" });
  });

  it("draws a policy the reader may not see without a name or a colour (Away)", () => {
    const hidden = leave({ policyName: undefined, policyColor: undefined, leaveTypeName: undefined });
    expect(nameStatusOf(active, { current: hidden, next: null }, today))
      .toEqual({ kind: "back", date: "2026-11-23", policy: null, color: null });
  });

  it("names the next leave within 14 days, and not further", () => {
    const soon = leave({ startDate: "2026-11-25", endDate: "2026-11-27" });
    expect(nameStatusOf(active, { current: null, next: soon }, today))
      .toEqual({ kind: "nextLeave", start: "2026-11-25", end: "2026-11-27", policy: "Annual leave", color: "ocean" });
    const far = leave({ startDate: "2026-12-03", endDate: "2026-12-04" });
    expect(nameStatusOf(active, { current: null, next: far }, today)).toBeNull();
  });

  it("is empty otherwise, and when the absences were not read", () => {
    expect(nameStatusOf(active, { current: null, next: null }, today)).toBeNull();
    expect(nameStatusOf(active, undefined, today)).toBeNull();
  });
});

/** The account pill (R11): Active only while the person is active. */
describe("accountPillOf", () => {
  it("is Active for an active person with an account", () => {
    expect(accountPillOf({ status: "ACTIVE", accountStatus: "ACTIVE" })).toEqual({ tone: "approved", word: "active" });
  });

  it("is nothing for a joiner who already has an account", () => {
    expect(accountPillOf({ status: "PROSPECTIVE", accountStatus: "ACTIVE" })).toBeNull();
  });

  it("is Inactive for an archived person, whatever the account", () => {
    expect(accountPillOf({ status: "ARCHIVED", accountStatus: "BLOCKED" })).toEqual({ tone: "inactive", word: "inactive" });
  });

  it("says Draft, Invited and Blocked", () => {
    expect(accountPillOf({ status: "PROSPECTIVE", accountStatus: "DRAFT" })?.word).toBe("draft");
    expect(accountPillOf({ status: "PROSPECTIVE", accountStatus: "INVITED" })?.word).toBe("invited");
    expect(accountPillOf({ status: "ACTIVE", accountStatus: "BLOCKED" })?.word).toBe("blocked");
  });

  it("carries Locked and Login paused", () => {
    expect(accountPillOf({ status: "ACTIVE", accountStatus: "ACTIVE", accountLocked: true })?.word).toBe("locked");
    expect(accountPillOf({ status: "ACTIVE", accountStatus: "ACTIVE", loginRestricted: true })?.word).toBe("signInPaused");
  });
});

// W12: Set to active on a blocked account says the block stays; on any other it promises the login back.
describe("setActiveDescriptionKey", () => {
  const t = translatorFor("organization");

  it("says a blocked account stays blocked", () => {
    expect(t(setActiveDescriptionKey({ accountStatus: "BLOCKED" }), { name: "Anna" }))
      .toBe("Anna is back in the active lists. Their account stays blocked until somebody unblocks it.");
  });

  it("promises the login back to an account that is not blocked", () => {
    expect(t(setActiveDescriptionKey({ accountStatus: "ACTIVE" }), { name: "Anna" }))
      .toBe("Anna is back in the active lists, and can log in again if they had an account.");
  });
});
