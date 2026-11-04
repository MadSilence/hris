import { formatDisplayDate } from "@/lib/date";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { Alert02Icon, Briefcase01Icon, CalendarLock01Icon, CancelCircleIcon, CheckListIcon, CheckmarkCircle02Icon, FileTextIcon, FlashIcon, Notification01Icon, ShieldCheckIcon, SquareLock02Icon, TaskDone01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import type { Notification } from "@/models/notifications";
import type { IconSvgElement } from "@/components/desact/icon";

/** "preboarding", "onboarding" or "offboarding" — the process a lifecycle notification is about. */
const processKind = (p: Record<string, unknown>): string => {
  const type = typeof p.processType === "string" ? p.processType : "";
  return type === "ONBOARDING" ? "onboarding" : type === "OFFBOARDING" ? "offboarding" : "preboarding";
};

export type NotificationPresentation = {
  title: string;
  message: string;
  icon: IconSvgElement;
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
      // The request itself, with what the decision needs beside Approve and Reject (WALK_QUESTIONS § 7):
      // the person's time-off tab refused an approver without a role over them.
      const requestId = n.targetType === "TIME_OFF_REQUEST" ? str(n.targetId) : "";
      return {
        title: "Time off approval requested",
        // A delegate's copy says whom they are answering for ("for Anna").
        message: `${str(p.requesterName) || "An employee"} requested ${dayCount(str(p.amount))} · ${dates(p)}${
          str(p.onBehalfOfName) ? ` · for ${str(p.onBehalfOfName)}` : ""
        }`,
        icon: CalendarLock01Icon,
        href: requestId
          ? `/time-off/requests/${requestId}`
          : requesterId ? `/organization/people/${requesterId}/time-off` : null,
      };
    }
    case "TIMEOFF_CANCELLATION_REQUESTED":
      return {
        title: "Cancellation requested",
        message: withReason(
          // A delegate is asked too, and is told whom they answer for — as with the request itself.
          `${str(p.requesterName) || "An employee"} asks to cancel approved time off · ${dates(p)}${
            str(p.onBehalfOfName) ? ` · for ${str(p.onBehalfOfName)}` : ""
          }.`,
          p.reason,
        ),
        icon: CalendarLock01Icon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_REQUEST_CANCELLED":
      return {
        title: "Time off cancelled",
        message: withReason(`${str(p.requesterName) || "An employee"}'s time off ${dates(p)} is cancelled.`, p.reason),
        icon: CancelCircleIcon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_REQUEST_APPROVED":
      return {
        title: "Time off approved",
        message: `Your ${leave(p)} ${dates(p)} was approved${by(p)}.`,
        icon: CheckmarkCircle02Icon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_REQUEST_REJECTED":
      return {
        title: "Time off rejected",
        message: withReason(`Your ${leave(p)} ${dates(p)} was rejected${by(p)}.`, p.reason),
        icon: CancelCircleIcon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_CANCELLATION_APPROVED":
      return {
        title: "Cancellation approved",
        message: `Your request to cancel ${leave(p)} ${dates(p)} was approved${by(p)}${returned(p)}.`,
        icon: CheckmarkCircle02Icon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_CANCELLATION_DECLINED":
      return {
        title: "Cancellation declined",
        message: `Your request to cancel ${leave(p)} ${dates(p)} was declined${by(p)}. The time off stands.`,
        icon: CancelCircleIcon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_LEAVE_CANCELLED":
      return {
        title: "Time off cancelled",
        message: withReason(`Your ${leave(p)} ${dates(p)} was cancelled${by(p)}${returned(p)}.`, p.reason),
        icon: CancelCircleIcon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_POLICY_ASSIGNED":
      return {
        title: "Leave policy assigned",
        message: actorFirst(
          p,
          (actor) => `${actor} assigned you ${str(p.policyName) || "a leave policy"}${from(p)}.`,
          `${str(p.policyName) || "A leave policy"} now applies to you${from(p)}.`,
        ),
        icon: CalendarLock01Icon,
        href: ownTimeOff(p.userId),
      };
    case "TIMEOFF_POLICY_ENDED":
      return {
        title: "Leave policy ended",
        message: actorFirst(
          p,
          (actor) => `${actor} ended ${str(p.policyName) || "a leave policy"} for you${until(p)}.`,
          `${str(p.policyName) || "A leave policy"} no longer applies to you${until(p)}.`,
        ),
        icon: CalendarLock01Icon,
        href: ownTimeOff(p.userId),
      };
    case "TIMEOFF_APPROVALS_DELEGATED":
      return {
        title: "Approvals delegated to you",
        message: `${str(p.delegatorName) || "A colleague"} delegated their leave approvals to you${
          dates(p) ? ` · ${dates(p)}` : ""
        }${str(p.delegationSource) === "LEAVE" ? ", while they are on leave" : ""}. You are asked beside them; whoever answers first decides.`,
        icon: UserGroupIcon,
        href: "/preferences",
      };
    case "TIMEOFF_BALANCE_ADJUSTED":
      return {
        title: "Balance adjusted",
        message: withReason(
          actorFirst(
            p,
            (actor) => `${actor} changed your ${str(p.policyName) || "leave"} balance by ${signedDays(str(p.amount))}.`,
            `Your ${str(p.policyName) || "leave"} balance changed by ${signedDays(str(p.amount))}.`,
          ),
          p.reason,
        ),
        icon: CalendarLock01Icon,
        href: ownTimeOff(p.userId),
      };
    case "TIMEOFF_REQUEST_REPRICED":
      return {
        title: "Time off re-priced",
        message: `The holidays under your ${leave(p)} ${dates(p)} changed, so it now costs ${dayCount(str(p.amount))}${
          str(p.previousAmount) ? ` instead of ${dayCount(str(p.previousAmount))}` : ""
        }.`,
        icon: CalendarLock01Icon,
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
      // A conflict: the provider changed days the company overrode. It blocks nothing — the company's
      // version stays in force until somebody takes the source's.
      if (p.conflict === true || p.conflict === "true") {
        const conflictOutcome =
          n.source?.status === "APPLIED"
            ? "The source's version was taken."
            : n.source?.status === "DISMISSED"
              ? "Your version was kept."
              : n.source?.status === "SUPERSEDED"
                ? "A newer check replaced it."
                : "Your version stays in force until someone takes the source's.";
        return {
          title: "Your holiday edits differ from the source",
          message: `The source of ${str(p.calendarName) || "a holiday calendar"}${p.year ? ` (${str(p.year)})` : ""} changed ${counts ? `days you edited: ${counts}` : "days you edited"}. ${conflictOutcome}`,
          icon: Alert02Icon,
          href: calendarId ? `/settings/time/public-holidays/${calendarId}` : null,
        };
      }
      // The last sentence follows the drift as it is now, not as it was when the card was sent: every
      // calendar manager holds a copy and one person's Apply closes them all (WALK_QUESTIONS § 17).
      const outcome =
        n.source?.status === "APPLIED"
          ? "It has been applied."
          : n.source?.status === "DISMISSED"
            ? "It was dismissed; nothing changed."
            : n.source?.status === "SUPERSEDED"
              ? "A newer check replaced it."
              : "Nothing changes until someone applies it.";
      return {
        title: "Holidays changed at the source",
        message: `${str(p.calendarName) || "A holiday calendar"}${p.year ? ` (${str(p.year)})` : ""} differs from its source${counts ? `: ${counts}` : ""}. ${outcome}`,
        icon: Alert02Icon,
        href: calendarId ? `/settings/time/public-holidays/${calendarId}` : null,
      };
    }
    case "ROLE_ASSIGNMENT_CREATED":
      return {
        title: "Role assigned",
        message: `You were given ${roleLabel(p)}${by(p)}.`,
        icon: ShieldCheckIcon,
        href: ownProfile(p.userId),
      };
    case "ROLE_ASSIGNMENT_REMOVED":
      return {
        title: "Role removed",
        message: `${capitalise(roleLabel(p))} was taken from you${by(p)}.`,
        icon: ShieldCheckIcon,
        href: ownProfile(p.userId),
      };
    case "ROLE_HOLDERS_CHANGED": {
      const roleId = str(p.roleId);
      const role = str(p.roleName) || "a role";
      const who = str(p.actorName) || "Somebody";
      const count = Number(p.count) || 0;
      const people = str(p.personName) || (count === 1 ? "1 person" : `${count} people`);
      return {
        title: "Role holders changed",
        message: p.added === true || p.added === "true"
          ? `${who} gave ${role} to ${people}.`
          : `${who} took ${role} from ${people}.`,
        icon: Alert02Icon,
        href: roleId ? `/settings/people/roles/${roleId}` : null,
      };
    }
    case "MANAGER_CHANGED":
      return {
        title: "Manager changed",
        message: str(p.managerName)
          ? actorFirst(
              p,
              (actor) => `${actor} made ${str(p.managerName)} your manager.`,
              `Your manager is now ${str(p.managerName)}.`,
            )
          : actorFirst(p, (actor) => `${actor} removed your manager.`, "You no longer have a manager."),
        icon: UserGroupIcon,
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
        icon: UserGroupIcon,
        href: ownProfile(p.userId),
      };
    }
    case "POSITION_CHANGED":
      return {
        title: "Position changed",
        message: p.cleared === true || !str(p.jobName)
          ? actorFirst(p, (actor) => `${actor} cleared your position.`, "Your position was cleared.")
          : actorFirst(
              p,
              (actor) => `${actor} changed your position to ${str(p.jobName)}.`,
              `Your position is now ${str(p.jobName)}.`,
            ),
        icon: Briefcase01Icon,
        href: ownProfile(p.userId),
      };
    case "DOCUMENT_ADDED_TO_FILE": {
      const userId = str(p.userId);
      return {
        title: "Document added",
        message: `${str(p.actorName) || "Somebody"} added ${str(p.fileName) || "a document"} to your file.`,
        icon: FileTextIcon,
        href: userId ? `/organization/people/${userId}/documents` : null,
      };
    }
    case "LIFECYCLE_TASK_DUE": {
      return {
        title: "A task Is due",
        message: `"${str(p.taskTitle) || "A task"}" in ${str(p.targetName) || "a person"}'s ${processKind(p)} is due today.`,
        icon: CheckListIcon,
        href: "/tasks",
      };
    }
    case "LIFECYCLE_TASK_OVERDUE": {
      const processId = str(p.processId);
      const who = str(p.assigneeName) ? ` ${str(p.assigneeName)} has not done it yet.` : "";
      return {
        title: "A task Is overdue",
        message: `"${str(p.taskTitle) || "A task"}" in ${str(p.targetName) || "a person"}'s ${processKind(p)} was due ${
          str(p.dueDate) ? formatDisplayDate(str(p.dueDate)) : "three days ago"}.${who}`,
        icon: Alert02Icon,
        href: processId ? `/processes/${processId}` : "/tasks",
      };
    }
    case "LIFECYCLE_TASK_COMMENTED": {
      const processId = str(p.processId);
      return {
        title: "A new comment",
        message: `${str(p.authorName) || "Somebody"} commented on "${str(p.taskTitle) || "a task"}" in ${
          str(p.targetName) || "a person"}'s ${processKind(p)}.`,
        icon: CheckListIcon,
        href: p.forAssignee === true || !processId ? "/tasks" : `/processes/${processId}`,
      };
    }
    case "LIFECYCLE_TASKS_ASSIGNED": {
      const count = Number(p.taskCount) || 0;
      const kind = processKind(p);
      // A task added to a running process, or given to somebody else (C2): one task, named.
      if (str(p.assignedTaskTitle)) {
        const dueOn = str(p.firstDueDate) ? ` It is due ${formatDisplayDate(str(p.firstDueDate))}.` : "";
        return {
          title: "A task for you",
          message: `"${str(p.assignedTaskTitle)}" in ${str(p.targetName) || "a person"}'s ${kind} is yours now.${dueOn}`,
          icon: CheckListIcon,
          href: "/tasks",
        };
      }
      const due = str(p.firstDueDate) ? ` The first is due ${formatDisplayDate(str(p.firstDueDate))}.` : "";
      // A task that waited for another and has just opened (decision 10): one task, named.
      if (str(p.openedTaskTitle)) {
        const dueOn = str(p.firstDueDate) ? ` It is due ${formatDisplayDate(str(p.firstDueDate))}.` : "";
        return {
          title: "A task for you",
          message: `"${str(p.openedTaskTitle)}" in ${str(p.targetName) || "a person"}'s ${kind} is ready: what it waited for is done.${dueOn}`,
          icon: CheckListIcon,
          href: "/tasks",
        };
      }
      return {
        title: count === 1 ? "A task for you" : "Tasks for you",
        message: `${str(p.targetName) || "A person"}'s ${kind} started, and ${count === 1 ? "1 task is" : `${count} tasks are`} yours.${due}`,
        icon: CheckListIcon,
        href: "/tasks",
      };
    }
    case "LIFECYCLE_PROCESS_STEP_FAILED": {
      const processId = str(p.processId);
      const kind = processKind(p);
      return {
        title: `A ${kind} step failed`,
        message: `${str(p.targetName) || "A person"}'s ${kind} stopped: a scheduled step could not be done, and what came after it was not started.`,
        icon: Alert02Icon,
        href: processId ? `/processes/${processId}` : null,
      };
    }
    // Automations (AUTOMATIONS_DESIGN.md § 4–6). A rule's own message is the author's text, rendered
    // for this person by the engine; the other three are about the rule, and are told to its author.
    case "AUTOMATION_MESSAGE": {
      return {
        title: str(p.ruleName) || "Automation",
        message: str(p.text) || "An automation sent you a message.",
        icon: FlashIcon,
        href: ownProfile(p.personId),
      };
    }
    case "AUTOMATION_TASK_ASSIGNED": {
      const due = str(p.dueDate) ? ` Due ${formatDisplayDate(str(p.dueDate))}.` : "";
      const forWhom = str(p.personName) ? ` for ${str(p.personName)}` : "";
      return {
        title: "A task for you",
        message: `${str(p.taskTitle) || "A task"}${forWhom} — set by the automation ${str(p.ruleName) || "of your company"}.${due}`,
        icon: CheckListIcon,
        href: "/tasks",
      };
    }
    case "AUTOMATION_RUN_FAILED": {
      const ruleId = str(p.automationRuleId);
      const error = str(p.error).trim();
      return {
        title: "Automation failed",
        message: `${str(p.ruleName) || "An automation"} could not finish for ${str(p.personName) || "a person"}${error ? `: ${error.replace(/\.$/, "")}.` : "."} Open its run log to retry.`,
        icon: Alert02Icon,
        href: ruleId ? `/settings/automation/automations/${ruleId}` : null,
      };
    }
    case "AUTOMATION_RULE_PAUSED": {
      const ruleId = str(p.automationRuleId);
      const reason = str(p.reason).trim();
      return {
        title: "Automation paused",
        message: `${str(p.ruleName) || "An automation"} was paused: something it uses is gone.${reason ? ` ${reason}` : ""} Fix it and resume the rule.`,
        icon: Alert02Icon,
        href: ruleId ? `/settings/automation/automations/${ruleId}` : null,
      };
    }
    case "INVITATION_FAILED": {
      // A scheduled invitation outside any process that could not go out — told to whoever scheduled it.
      const userId = str(p.userId);
      return {
        title: "Invitation not sent",
        message: `The invitation scheduled for ${str(p.targetName) || "a person"} could not be sent. Open their profile to invite them again.`,
        icon: Alert02Icon,
        href: userId ? `/organization/people/${userId}` : null,
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
        icon: Alert02Icon,
        href: roleId ? `/settings/people/roles/${roleId}` : null,
      };
    }
    case "ACCOUNT_LOCKED": {
      // Sent to the person's manager and to whoever holds BLOCK over them — the people who can send
      // the password reset that lifts the lock, which lives in the profile's Person Actions.
      const userId = str(p.userId);
      return {
        title: "Account locked",
        message: `${str(p.name) || "Somebody"}'s account was locked after too many failed sign-in attempts. Send them a password reset to unlock it.`,
        icon: SquareLock02Icon,
        href: userId ? `/organization/people/${userId}/personal` : null,
      };
    }
    case "SECURITY_CHANGED": {
      // Every System Owner is told when somebody changes how people sign in (R2.4, MFA_DESIGN.md § 7).
      const who = str(p.actorName) || "Somebody";
      const whom = str(p.name);
      const what: Record<string, string> = {
        MFA_RESET: `reset ${whom || "a person"}'s two-step sign-in`,
        MFA_POLICY_CHANGED: "changed who must use two-step sign-in",
        IDENTITY_CONNECTION_UPDATED: "changed single sign-on",
        SCIM_TOKEN_ISSUED: "issued a provisioning token",
        IDP_GROUP_ROLES_CHANGED: "changed the roles an identity provider group grants",
      };
      const event = str(p.event);
      const message = event === "SCIM_BLOCK_REFUSED"
        ? `The identity provider tried to block ${whom || "a System Owner"}. A System Owner is never blocked that way.`
        : `${who} ${what[event] ?? "changed sign-in security"}.`;
      const securityUserId = str(p.userId);
      return {
        title: "Sign-in security changed",
        message,
        icon: SquareLock02Icon,
        href: securityUserId ? `/organization/people/${securityUserId}/personal` : "/settings/tech/login-and-sso",
      };
    }
    // Performance reviews (REVIEWS_DESIGN.md § 8.3). A review's own page is the reviewer's; a cycle's is its runner's.
    case "REVIEW_CYCLE_LAUNCHED": {
      const due = str(p.firstDueOn) ? ` The first is due ${formatDisplayDate(str(p.firstDueOn))}.` : "";
      return {
        title: "Reviews to write",
        message: `${str(p.cycleName) || "A review cycle"} has started and asks you for reviews.${due}`,
        icon: TaskDone01Icon,
        href: "/reviews/me",
      };
    }
    case "REVIEW_ASSIGNED": {
      const about = str(p.subjectName) ? ` of ${str(p.subjectName)}` : "";
      return {
        title: "A review for you",
        message: `You are asked to write a ${reviewKind(p.kind)}${about} in ${str(p.cycleName) || "a review cycle"}.`,
        icon: TaskDone01Icon,
        href: n.targetId ? `/reviews/write/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_DUE_SOON": {
      const about = str(p.subjectName) ? ` of ${str(p.subjectName)}` : "";
      const due = str(p.dueDate) ? ` on ${formatDisplayDate(str(p.dueDate))}` : " in two days";
      return {
        title: "Review due soon",
        message: `Your ${reviewKind(p.kind)}${about} in ${str(p.cycleName) || "a review cycle"} is due${due}.`,
        icon: CalendarLock01Icon,
        href: n.targetId ? `/reviews/write/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_DUE": {
      const about = str(p.subjectName) ? ` of ${str(p.subjectName)}` : "";
      return {
        title: "Review due today",
        message: `Your ${reviewKind(p.kind)}${about} in ${str(p.cycleName) || "a review cycle"} is due today.`,
        icon: CalendarLock01Icon,
        href: n.targetId ? `/reviews/write/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_REMINDER": {
      return {
        title: "Your review Is waiting",
        message: `You are reminded to write your ${reviewKind(p.kind)} in ${str(p.cycleName) || "a review cycle"}.`,
        icon: Notification01Icon,
        href: n.targetId ? `/reviews/write/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_OVERDUE": {
      return {
        title: "Review overdue",
        message: `${str(p.reviewerName) || "A reviewer"} has not written the ${reviewKind(p.kind)} of ${str(p.subjectName) || "a person"} in ${str(p.cycleName) || "your cycle"}, due ${formatDisplayDate(str(p.dueDate))}.`,
        icon: Alert02Icon,
        href: str(p.cycleId) ? `/reviews/cycles/${str(p.cycleId)}` : "/reviews",
      };
    }
    case "REVIEW_DECLINED": {
      return {
        title: "Peer review declined",
        message: `${str(p.reviewerName) || "A colleague"} declined to review ${str(p.subjectName) || "a person"} in ${str(p.cycleName) || "your cycle"}. You may ask somebody else.`,
        icon: CancelCircleIcon,
        href: str(p.cycleId) ? `/reviews/cycles/${str(p.cycleId)}` : "/reviews",
      };
    }
    case "REVIEW_SELF_SUBMITTED": {
      return {
        title: "Self review in",
        message: `${str(p.subjectName) || "One of your people"} submitted their self review in ${str(p.cycleName) || "a review cycle"}.`,
        icon: CheckmarkCircle02Icon,
        href: "/reviews/me",
      };
    }
    case "REVIEW_SHARED": {
      return {
        title: "Your review Is ready",
        message: `Your review in ${str(p.cycleName) || "a review cycle"} has been shared with you.`,
        icon: TaskDone01Icon,
        href: n.targetId ? `/reviews/packets/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_AMENDED": {
      return {
        title: "Your review was updated",
        message: `Your manager updated your review in ${str(p.cycleName) || "a review cycle"}. Read the new version and acknowledge it again.`,
        icon: TaskDone01Icon,
        href: n.targetId ? `/reviews/packets/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_ACKNOWLEDGED": {
      return {
        title: "Review acknowledged",
        message: `${str(p.subjectName) || "One of your people"} read their review in ${str(p.cycleName) || "a review cycle"}${p.commented === true ? " and left a comment" : ""}.`,
        icon: CheckmarkCircle02Icon,
        href: n.targetId ? `/reviews/packets/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_PEERS_TO_APPROVE": {
      return {
        title: "Peers to approve",
        message: `${str(p.subjectName) || "One of your people"} nominated their peers in ${str(p.cycleName) || "a review cycle"}. Approve them, or change the list first.`,
        icon: TaskDone01Icon,
        href: n.targetId ? `/reviews/nominations/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_PEERS_APPROVED": {
      return {
        title: "Your peers were approved",
        message: p.autoApproved === true
          ? `Nobody changed your nomination in ${str(p.cycleName) || "a review cycle"} by the approval date, so your peers stood and were asked.`
          : `Your peers in ${str(p.cycleName) || "a review cycle"} were approved and asked for their reviews.`,
        icon: CheckmarkCircle02Icon,
        href: n.targetId ? `/reviews/nominations/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_TO_APPROVE": {
      return {
        title: "A review to approve",
        message: `The manager review of ${str(p.subjectName) || "a person"} in ${str(p.cycleName) || "a review cycle"} waits for your approval.`,
        icon: TaskDone01Icon,
        href: n.targetId ? `/reviews/packets/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_APPROVED": {
      return {
        title: "Your review was approved",
        message: `Your review of ${str(p.subjectName) || "a person"} in ${str(p.cycleName) || "a review cycle"} was approved.`,
        icon: CheckmarkCircle02Icon,
        href: n.targetId ? `/reviews/packets/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_SENT_BACK": {
      return {
        title: "Your review was sent back",
        message: `Your review of ${str(p.subjectName) || "a person"} in ${str(p.cycleName) || "a review cycle"} was sent back with a comment. Change it and submit it again.`,
        icon: Alert02Icon,
        href: n.targetId ? `/reviews/write/${str(n.targetId)}` : "/reviews/me",
      };
    }
    default:
      return {
        title: n.type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        message: "",
        icon: Notification01Icon,
        href: n.targetType && n.targetId ? null : null,
      };
  }
};

function reviewKind(kind: unknown): string {
  return kind === "SELF" ? "self review" : kind === "MANAGER" ? "manager review" : kind === "PEER" ? "peer review"
    : kind === "UPWARD" ? "upward review" : "review";
}

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
