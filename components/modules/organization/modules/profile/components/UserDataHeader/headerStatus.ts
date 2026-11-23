import type { StatusTone } from "@/components/ui/StatusBadge";
import type { CompanyCalendarAbsenceSpan, CompanyCalendarAbsenceSummary } from "@/models/calendar";
import type { User } from "@/models/user/User";
import { dateToISO, isoToDate } from "@/lib/date";
import { isActiveStatus, isProspectiveStatus } from "@/models/user/status";
import { backOn } from "@/components/modules/timeOff/lib/leaveDays";
import { nonWorkingDayTest } from "@/components/modules/calendar/lib/dateRange";

/** What "Back {date}" is counted from: the company's working week and the person's own holidays (W14). */
export type ReturnDays = { isNonWorking: (d: Date) => boolean; holidays: ReadonlySet<string> };

/** How far ahead the next leave is named beside the name (profile-header spec, QR3s 4). */
export const NEXT_LEAVE_DAYS = 14;

/**
 * The one thing said beside the name (profile-header spec, "Beside the name"), the first that applies: Starts →
 * Last day → Back → the next leave within 14 days → nothing. A leave's `policy` and `color` are null when the
 * reader may not see the policy — it is then drawn gray, "Away" (the board's disclosure rule).
 *
 * Somebody off today is said the one way the product says when a person returns (W14): "Back {first working day}" —
 * the day after the request's end that is a working day and not a holiday, as the leave card counts it (`backOn`) —
 * never "Off until {last day off}".
 */
export type NameStatus =
  | { kind: "starts"; date: string }
  | { kind: "lastDay"; date: string }
  | { kind: "back"; date: string; policy: string | null; color: string | null }
  | { kind: "nextLeave"; start: string; end: string; policy: string | null; color: string | null };

const policyOf = (absence: CompanyCalendarAbsenceSpan) => ({
  policy: absence.policyName ?? absence.leaveTypeName ?? null,
  color: absence.policyName || absence.leaveTypeName ? absence.policyColor ?? null : null,
});

const daysBetween = (fromIso: string, toIso: string): number =>
  Math.round((Date.UTC(...ymd(toIso)) - Date.UTC(...ymd(fromIso))) / 86_400_000);

const ymd = (iso: string): [number, number, number] => {
  const d = isoToDate(iso.slice(0, 10));
  return [d.getFullYear(), d.getMonth(), d.getDate()];
};

export const nameStatusOf = (
  user: Pick<User, "status" | "hireDate" | "terminationDate">,
  absences: CompanyCalendarAbsenceSummary | null | undefined,
  today: Date = new Date(),
  returnDays: ReturnDays = { isNonWorking: nonWorkingDayTest(), holidays: new Set() },
): NameStatus | null => {
  const todayIso = dateToISO(today);
  const hire = user.hireDate?.slice(0, 10);
  if (isProspectiveStatus(user.status) && hire && hire > todayIso) return { kind: "starts", date: hire };

  const last = user.terminationDate ? String(user.terminationDate).slice(0, 10) : null;
  if (last && (user.status ?? "").toUpperCase() !== "ARCHIVED" && last >= todayIso) return { kind: "lastDay", date: last };

  const current = absences?.current;
  if (current) {
    const lastOff = (current.requestEndDate ?? current.endDate).slice(0, 10);
    return { kind: "back", date: backOn(lastOff, returnDays.isNonWorking, returnDays.holidays), ...policyOf(current) };
  }

  const next = absences?.next;
  if (next) {
    const start = next.requestStartDate ?? next.startDate;
    const ahead = daysBetween(todayIso, start);
    if (ahead > 0 && ahead <= NEXT_LEAVE_DAYS) {
      return { kind: "nextLeave", start, end: next.requestEndDate ?? next.endDate, ...policyOf(next) };
    }
  }
  return null;
};

/**
 * The account pill on the right (profile-header spec, "On the right"; DECISIONS.md R11): Active only while the person
 * is active — not for a draft, a joiner or an archived person. Locked and Login paused live in it too.
 */
export type AccountPill = {
  tone: StatusTone;
  word: "active" | "inactive" | "invited" | "draft" | "blocked" | "locked" | "signInPaused";
};

export const accountPillOf = (
  user: Pick<User, "status" | "accountStatus" | "accountLocked" | "loginRestricted">,
): AccountPill | null => {
  if ((user.status ?? "").toUpperCase() === "ARCHIVED") return { tone: "inactive", word: "inactive" };
  switch (user.accountStatus) {
    case "BLOCKED":
      return { tone: "declined", word: "blocked" };
    case "DRAFT":
      return { tone: "draft", word: "draft" };
    case "INVITED":
      return { tone: "pending", word: "invited" };
  }
  if (user.accountLocked) return { tone: "declined", word: "locked" };
  if (user.loginRestricted) return { tone: "pending", word: "signInPaused" };
  if (user.accountStatus === "ACTIVE" && isActiveStatus(user.status)) return { tone: "approved", word: "active" };
  return null;
};

/**
 * What *Set to active* tells the reader (W12, the owner 2026-11-23): an inactive person comes back to the active lists,
 * but a blocked account is a separate decision and stays blocked until somebody unblocks it — so the line does not
 * promise a login it will not give.
 */
export const setActiveDescriptionKey = (
  user: Pick<User, "accountStatus">,
): "profile.setActive.description" | "profile.setActive.descriptionBlocked" =>
  user.accountStatus === "BLOCKED" ? "profile.setActive.descriptionBlocked" : "profile.setActive.description";
