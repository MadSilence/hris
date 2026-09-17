import { formatDisplayDate } from "@/lib/date";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import type { ComponentType } from "react";
import {
  Bell,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileText,
  ListChecks,
  Lock,
  ShieldCheck,
  TriangleAlert,
  Users,
  XCircle,
} from "lucide-react";
import type { Notification } from "@/models/notifications";

export type NotificationPresentation = {
  title: string;
  message: string;
  Icon: ComponentType<{ className?: string }>;
  href: string | null;
};

const str = (v: unknown): string => (v == null ? "" : String(v));

const dayCount = (amount: string): string => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  return `${formatDayAmount(n)} ${n === 1 ? "day" : "days"}`;
};

type Params = Record<string, unknown>;

const signedDays = (amount: string): string => {
  const n = Number(amount);
  if (!Number.isFinite(n) || amount === "") return "an amount";
  return `${n > 0 ? "+" : ""}${dayCount(amount)}`;
};

const dates = (p: Params): string => {
  const start = formatDisplayDate(str(p.startDate));
  const end = formatDisplayDate(str(p.endDate));
  if (!start) return "";
  return !end || end === start ? start : `${start} → ${end}`;
};

const leave = (p: Params): string => (str(p.policyName) ? `${str(p.policyName)} request` : "time off");

/** " by Ada Lovelace", or nothing when the change had no named actor (a scheduler, a settlement). */
const by = (p: Params): string => (str(p.actorName) ? ` by ${str(p.actorName)}` : "");

/** The sentence with the person who did it as its subject, or the passive one when nobody is named. */
const actorFirst = (p: Params, withActor: (actor: string) => string, withoutActor: string): string =>
  str(p.actorName) ? withActor(str(p.actorName)) : withoutActor;

const from = (p: Params): string => (str(p.effectiveFrom) ? ` from ${formatDisplayDate(str(p.effectiveFrom))}` : "");

const until = (p: Params): string => (str(p.effectiveTo) ? ` after ${formatDisplayDate(str(p.effectiveTo))}` : "");

const returned = (p: Params): string =>
  Number(p.restoredAmount) > 0 ? `, and ${dayCount(str(p.restoredAmount))} went back to your balance` : "";

const withReason = (message: string, reason: unknown): string =>
  str(reason).trim() ? `${message} Reason: ${str(reason).trim()}` : message;

const ownTimeOff = (userId: unknown): string | null =>
  str(userId) ? `/organization/people/${str(userId)}/time-off` : null;

const ownProfile = (userId: unknown): string | null =>
  str(userId) ? `/organization/people/${str(userId)}/personal` : null;

const capitalise = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

const roleLabel = (p: Params): string => (str(p.roleName) ? `the ${str(p.roleName)} role` : "a role");

/**
 * Turns a stored notification (type + params) into display text + a deep-link, rendered at read time
 * (templates, not snapshot strings). Deep-links are built here from target/params via a shared
 * resolver; a type with no destination yet returns href=null (renders as a non-navigating item).
 */
export const presentNotification = (n: Notification): NotificationPresentation => {
  const p = n.params ?? {};

  switch (n.type) {
    case "TIMEOFF_APPROVAL_REQUESTED": {
      const requesterId = str(p.requesterId);
      return {
        title: "Time off approval requested",
        message: `${str(p.requesterName) || "An employee"} requested ${dayCount(str(p.amount))} · ${dates(p)}`,
        Icon: CalendarClock,
        href: requesterId ? `/organization/people/${requesterId}/time-off` : null,
      };
    }
    case "TIMEOFF_CANCELLATION_REQUESTED":
      return {
        title: "Cancellation Requested",
        message: withReason(
          `${str(p.requesterName) || "An employee"} asks to cancel approved time off · ${dates(p)}.`,
          p.reason,
        ),
        Icon: CalendarClock,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_REQUEST_CANCELLED":
      return {
        title: "Time Off Cancelled",
        message: withReason(`${str(p.requesterName) || "An employee"}'s time off ${dates(p)} is cancelled.`, p.reason),
        Icon: XCircle,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_REQUEST_APPROVED":
      return {
        title: "Time Off Approved",
        message: `Your ${leave(p)} ${dates(p)} was approved${by(p)}.`,
        Icon: CheckCircle2,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_REQUEST_REJECTED":
      return {
        title: "Time Off Rejected",
        message: withReason(`Your ${leave(p)} ${dates(p)} was rejected${by(p)}.`, p.reason),
        Icon: XCircle,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_CANCELLATION_APPROVED":
      return {
        title: "Cancellation Approved",
        message: `Your request to cancel ${leave(p)} ${dates(p)} was approved${by(p)}${returned(p)}.`,
        Icon: CheckCircle2,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_CANCELLATION_DECLINED":
      return {
        title: "Cancellation Declined",
        message: `Your request to cancel ${leave(p)} ${dates(p)} was declined${by(p)}. The time off stands.`,
        Icon: XCircle,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_LEAVE_CANCELLED":
      return {
        title: "Time Off Cancelled",
        message: withReason(`Your ${leave(p)} ${dates(p)} was cancelled${by(p)}${returned(p)}.`, p.reason),
        Icon: XCircle,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_POLICY_ASSIGNED":
      return {
        title: "Leave Policy Assigned",
        message: actorFirst(
          p,
          (actor) => `${actor} assigned you ${str(p.policyName) || "a leave policy"}${from(p)}.`,
          `${str(p.policyName) || "A leave policy"} now applies to you${from(p)}.`,
        ),
        Icon: CalendarClock,
        href: ownTimeOff(p.userId),
      };
    case "TIMEOFF_POLICY_ENDED":
      return {
        title: "Leave Policy Ended",
        message: actorFirst(
          p,
          (actor) => `${actor} ended ${str(p.policyName) || "a leave policy"} for you${until(p)}.`,
          `${str(p.policyName) || "A leave policy"} no longer applies to you${until(p)}.`,
        ),
        Icon: CalendarClock,
        href: ownTimeOff(p.userId),
      };
    case "TIMEOFF_BALANCE_ADJUSTED":
      return {
        title: "Balance Adjusted",
        message: withReason(
          actorFirst(
            p,
            (actor) => `${actor} changed your ${str(p.policyName) || "leave"} balance by ${signedDays(str(p.amount))}.`,
            `Your ${str(p.policyName) || "leave"} balance changed by ${signedDays(str(p.amount))}.`,
          ),
          p.reason,
        ),
        Icon: CalendarClock,
        href: ownTimeOff(p.userId),
      };
    case "PUBLIC_HOLIDAY_CALENDAR_SOURCE_DRIFT": {
      const calendarId = str(p.calendarId);
      const counts = [
        [p.added, "added"],
        [p.changed, "changed"],
        [p.removed, "removed"],
      ]
        .filter(([count]) => Number(count) > 0)
        .map(([count, what]) => `${count} ${what}`)
        .join(", ");
      return {
        title: "Holidays Changed at the Source",
        message: `${str(p.calendarName) || "A holiday calendar"}${p.year ? ` (${str(p.year)})` : ""} differs from its source${counts ? `: ${counts}` : ""}. Review it before people plan around it.`,
        Icon: TriangleAlert,
        href: calendarId ? `/settings/time/public-holidays/${calendarId}` : null,
      };
    }
    case "ROLE_ASSIGNMENT_CREATED":
      return {
        title: "Role Assigned",
        message: `You were given ${roleLabel(p)}${by(p)}.`,
        Icon: ShieldCheck,
        href: ownProfile(p.userId),
      };
    case "ROLE_ASSIGNMENT_REMOVED":
      return {
        title: "Role Removed",
        message: `${capitalise(roleLabel(p))} was taken from you${by(p)}.`,
        Icon: ShieldCheck,
        href: ownProfile(p.userId),
      };
    case "ROLE_HOLDERS_CHANGED": {
      const roleId = str(p.roleId);
      const role = str(p.roleName) || "a role";
      const who = str(p.actorName) || "Somebody";
      const count = Number(p.count) || 0;
      const people = str(p.personName) || (count === 1 ? "1 person" : `${count} people`);
      return {
        title: "Role Holders Changed",
        message: p.added === true || p.added === "true"
          ? `${who} gave ${role} to ${people}.`
          : `${who} took ${role} from ${people}.`,
        Icon: TriangleAlert,
        href: roleId ? `/settings/people/roles/${roleId}` : null,
      };
    }
    case "MANAGER_CHANGED":
      return {
        title: "Manager Changed",
        message: str(p.managerName)
          ? actorFirst(
              p,
              (actor) => `${actor} made ${str(p.managerName)} your manager.`,
              `Your manager is now ${str(p.managerName)}.`,
            )
          : actorFirst(p, (actor) => `${actor} removed your manager.`, "You no longer have a manager."),
        Icon: Users,
        href: ownProfile(p.userId),
      };
    case "ORG_UNIT_ASSIGNED":
    case "ORG_UNIT_UNASSIGNED": {
      const kind = str(p.unitKind) === "TEAM" ? "team" : "department";
      const unit = str(p.unitName) ? `the ${str(p.unitName)} ${kind}` : `a ${kind}`;
      const joined = n.type === "ORG_UNIT_ASSIGNED";
      return {
        title: joined ? `Added to a ${capitalise(kind)}` : `Removed from a ${capitalise(kind)}`,
        message: joined
          ? actorFirst(p, (actor) => `${actor} added you to ${unit}.`, `You are now in ${unit}.`)
          : actorFirst(p, (actor) => `${actor} removed you from ${unit}.`, `You were removed from ${unit}.`),
        Icon: Users,
        href: ownProfile(p.userId),
      };
    }
    case "POSITION_CHANGED":
      return {
        title: "Position Changed",
        message: p.cleared === true || !str(p.jobName)
          ? actorFirst(p, (actor) => `${actor} cleared your position.`, "Your position was cleared.")
          : actorFirst(
              p,
              (actor) => `${actor} changed your position to ${str(p.jobName)}.`,
              `Your position is now ${str(p.jobName)}.`,
            ),
        Icon: Briefcase,
        href: ownProfile(p.userId),
      };
    case "DOCUMENT_ADDED_TO_FILE": {
      const userId = str(p.userId);
      return {
        title: "Document Added",
        message: `${str(p.actorName) || "Somebody"} added ${str(p.fileName) || "a document"} to your file.`,
        Icon: FileText,
        href: userId ? `/organization/people/${userId}/documents` : null,
      };
    }
    case "LIFECYCLE_TASKS_ASSIGNED": {
      const count = Number(p.taskCount) || 0;
      const kind = str(p.processType) === "ONBOARDING" ? "onboarding" : "preboarding";
      const due = str(p.firstDueDate) ? ` The first is due ${formatDisplayDate(str(p.firstDueDate))}.` : "";
      return {
        title: count === 1 ? "A Task for You" : "Tasks for You",
        message: `${str(p.targetName) || "A person"}'s ${kind} started, and ${count === 1 ? "1 task is" : `${count} tasks are`} yours.${due}`,
        Icon: ListChecks,
        href: "/tasks",
      };
    }
    case "LIFECYCLE_PROCESS_STEP_FAILED": {
      const processId = str(p.processId);
      const kind = str(p.processType) === "ONBOARDING" ? "onboarding" : "preboarding";
      return {
        title: `A ${kind} step failed`,
        message: `${str(p.targetName) || "A person"}'s ${kind} stopped: a scheduled step could not be done, and what came after it was not started.`,
        Icon: TriangleAlert,
        href: processId ? `/processes/${processId}` : null,
      };
    }
    case "ROLE_ACCESS_CHANGED": {
      const roleId = str(p.roleId);
      const what = str(p.what) === "FIELD_ACCESS" ? "field access" : "permissions";
      const role = str(p.roleName) || "A role";
      const who = str(p.actorName);
      return {
        title: "Role access changed",
        message: who ? `${who} changed the ${what} of ${role}.` : `The ${what} of ${role} changed.`,
        Icon: TriangleAlert,
        href: roleId ? `/settings/people/roles/${roleId}` : null,
      };
    }
    case "ACCOUNT_LOCKED": {
      // Sent to the person's manager and to whoever holds BLOCK over them — the people who can send
      // the password reset that lifts the lock, which lives in the profile's Person Actions.
      const userId = str(p.userId);
      return {
        title: "Account Locked",
        message: `${str(p.name) || "Somebody"}'s account was locked after too many failed sign-in attempts. Send them a password reset to unlock it.`,
        Icon: Lock,
        href: userId ? `/organization/people/${userId}/personal` : null,
      };
    }
    default:
      return {
        title: n.type.replaceAll("_", " ").toLowerCase(),
        message: "",
        Icon: Bell,
        href: n.targetType && n.targetId ? null : null,
      };
  }
};

const CATEGORY_LABELS: Record<string, string> = {
  APPROVALS: "Approvals",
  ORG_CHANGES: "Org changes",
  DOCUMENTS: "Documents",
  TASKS: "Tasks",
  POLICIES: "Policies",
  SYSTEM: "System",
};

/** Friendly label for a notification category (falls back to a humanized key for unknown ones). */
export const categoryLabel = (category: string): string =>
  CATEGORY_LABELS[category] ?? category.replaceAll("_", " ").toLowerCase();

export type DateGroup = { key: string; label: string; order: number };

/**
 * Buckets a notification's timestamp into a coarse date section for grouped rendering
 * (Today / Yesterday / This week / Earlier). `order` gives a stable sort, newest bucket first.
 */
export const dateGroup = (iso: string): DateGroup => {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return { key: "earlier", label: "Earlier", order: 3 };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((startOfToday.getTime() - then.getTime()) / dayMs);

  if (then.getTime() >= startOfToday.getTime()) return { key: "today", label: "Today", order: 0 };
  if (diffDays < 1) return { key: "yesterday", label: "Yesterday", order: 1 };
  if (diffDays < 7) return { key: "week", label: "This week", order: 2 };
  return { key: "earlier", label: "Earlier", order: 3 };
};

export const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  // Older than a week: an actual date, through the one formatter.
  return formatDisplayDate(iso);
};
