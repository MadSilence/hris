import type { useTranslations } from "next-intl";
import { formatDisplayDate } from "@/lib/date";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { Alert02Icon, Briefcase01Icon, CalendarLock01Icon, CancelCircleIcon, CheckListIcon, CheckmarkCircle02Icon, FileTextIcon, FlashIcon, Notification01Icon, ShieldCheckIcon, SquareLock02Icon, TaskDone01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import type { Notification } from "@/models/notifications";
import type { IconSvgElement } from "@/components/desact/icon";

/** The `notifications` translator, handed to the pure helpers that build a notification's sentence. */
export type NotificationsTranslator = ReturnType<typeof useTranslations<"notifications">>;

/** "preboarding", "onboarding" or "offboarding" — the process a lifecycle notification is about (a `select` in the messages). */
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

/** A select argument: whether an optional part of the sentence is there. */
const has = (v: unknown): "yes" | "no" => (str(v).trim() ? "yes" : "no");
const yesNo = (b: boolean): "yes" | "no" => (b ? "yes" : "no");

/** The arguments of an inline `{count, plural, … {{amount} days}}`: the plural by the number, the number as people write it. */
const dayArgs = (amount: string): { count: number; amount: string } => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return { count: 0, amount };
  return { count: n, amount: formatDayAmount(n) };
};

type Params = Record<string, unknown>;

const signedDays = (t: NotificationsTranslator, amount: string): string => {
  const n = Number(amount);
  if (!Number.isFinite(n) || amount === "") return t("presenter.anAmount");
  return t("presenter.signedDays", { sign: n > 0 ? "+" : "", ...dayArgs(amount) });
};

const dates = (p: Params, language?: string): string => {
  const start = formatDisplayDate(str(p.startDate), { language });
  const end = formatDisplayDate(str(p.endDate), { language });
  if (!start) return "";
  return !end || end === start ? start : `${start} → ${end}`;
};

/** The policy of a leave notification: `{hasPolicy, select, yes {{policy} request} other {time off}}`. */
const leave = (p: Params) => ({ hasPolicy: has(p.policyName), policy: str(p.policyName) });

/** The person who did it: `{hasActor, select, yes { by {actor}} other {}}`. */
const by = (p: Params) => ({ hasActor: has(p.actorName), actor: str(p.actorName) });

/** The days a cancellation gave back. */
const returned = (p: Params) => {
  const restored = dayArgs(str(p.restoredAmount));
  return { hasRestored: yesNo(Number(p.restoredAmount) > 0), restoredCount: restored.count, restored: restored.amount };
};

const withReason = (t: NotificationsTranslator, message: string, reason: unknown): string =>
  str(reason).trim() ? t("presenter.withReason", { message, reason: str(reason).trim() }) : message;

const ownTimeOff = (userId: unknown): string | null =>
  str(userId) ? `/organization/people/${str(userId)}/time-off` : null;

const ownProfile = (userId: unknown): string | null =>
  str(userId) ? `/organization/people/${str(userId)}/personal` : null;

/** The `{kind, select, …}` argument of a review message. */
const reviewKind = (kind: unknown): string =>
  kind === "SELF" || kind === "MANAGER" || kind === "PEER" || kind === "UPWARD" ? kind : "other";

/** An automation in the editor (`/automations/<id>`), with a run's window open when there is one. */
const automationHref = (ruleId: string, query?: { run: string }): string =>
  query ? `/automations/${ruleId}?run=${encodeURIComponent(query.run)}` : `/automations/${ruleId}`;

/** The `{reason, select, …}` argument of a pause: one of the four codes, else `other`. */
const pauseReason = (reason: unknown): string =>
  reason === "MANUAL" || reason === "OWNER_LEFT" || reason === "OWNER_LACKS_RIGHT" || reason === "TARGET_GONE" ? reason : "other";

/** A formatted due date, with its select. */
const dueOn = (value: unknown, language?: string) => ({ hasDue: has(value), due: str(value) ? formatDisplayDate(str(value), { language }) : "" });

/**
 * Turns a stored notification (type + params) into display text + a deep-link, rendered at read time
 * (templates, not snapshot strings). Deep-links are built here from target/params via a shared
 * resolver; a type with no destination yet returns href=null (renders as a non-navigating item).
 * Every type is one message of the `notifications` catalogue with named arguments.
 */
export const presentNotification = (n: Notification, t: NotificationsTranslator, language?: string): NotificationPresentation => {
  const p = n.params ?? {};
  const person = str(p.targetName) || t("fallback.aPerson");
  const cycle = str(p.cycleName) || t("fallback.aReviewCycle");

  switch (n.type) {
    case "TIMEOFF_APPROVAL_REQUESTED": {
      const requesterId = str(p.requesterId);
      // The request itself, with what the decision needs beside Approve and Reject (WALK_QUESTIONS § 7):
      // the person's time-off tab refused an approver without a role over them.
      const requestId = n.targetType === "TIME_OFF_REQUEST" ? str(n.targetId) : "";
      return {
        title: t("presenter.approvalRequested.title"),
        // A delegate's copy says whom they are answering for ("for Anna").
        message: t("presenter.approvalRequested.message", {
          requester: str(p.requesterName) || t("fallback.anEmployee"),
          ...dayArgs(str(p.amount)),
          dates: dates(p, language),
          forSomeone: has(p.onBehalfOfName),
          onBehalfOf: str(p.onBehalfOfName),
        }),
        icon: CalendarLock01Icon,
        href: requestId
          ? `/time-off/requests/${requestId}`
          : requesterId ? `/organization/people/${requesterId}/time-off` : null,
      };
    }
    case "TIMEOFF_CANCELLATION_REQUESTED":
      return {
        title: t("presenter.cancellationRequested.title"),
        message: withReason(
          t,
          // A delegate is asked too, and is told whom they answer for — as with the request itself.
          t("presenter.cancellationRequested.message", {
            requester: str(p.requesterName) || t("fallback.anEmployee"),
            dates: dates(p, language),
            forSomeone: has(p.onBehalfOfName),
            onBehalfOf: str(p.onBehalfOfName),
          }),
          p.reason,
        ),
        icon: CalendarLock01Icon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_REQUEST_CANCELLED":
      return {
        title: t("presenter.requestCancelled.title"),
        message: withReason(
          t,
          t("presenter.requestCancelled.message", { requester: str(p.requesterName) || t("fallback.anEmployee"), dates: dates(p, language) }),
          p.reason,
        ),
        icon: CancelCircleIcon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_REQUEST_APPROVED":
      return {
        title: t("presenter.requestApproved.title"),
        message: t("presenter.requestApproved.message", { ...leave(p), dates: dates(p, language), ...by(p) }),
        icon: CheckmarkCircle02Icon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_REQUEST_REJECTED":
      return {
        title: t("presenter.requestRejected.title"),
        message: withReason(t, t("presenter.requestRejected.message", { ...leave(p), dates: dates(p, language), ...by(p) }), p.reason),
        icon: CancelCircleIcon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_CANCELLATION_APPROVED":
      return {
        title: t("presenter.cancellationApproved.title"),
        message: t("presenter.cancellationApproved.message", { ...leave(p), dates: dates(p, language), ...by(p), ...returned(p) }),
        icon: CheckmarkCircle02Icon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_CANCELLATION_DECLINED":
      return {
        title: t("presenter.cancellationDeclined.title"),
        message: t("presenter.cancellationDeclined.message", { ...leave(p), dates: dates(p, language), ...by(p) }),
        icon: CancelCircleIcon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_LEAVE_CANCELLED":
      return {
        title: t("presenter.leaveCancelled.title"),
        message: withReason(
          t,
          t("presenter.leaveCancelled.message", { ...leave(p), dates: dates(p, language), ...by(p), ...returned(p) }),
          p.reason,
        ),
        icon: CancelCircleIcon,
        href: ownTimeOff(p.requesterId),
      };
    case "TIMEOFF_POLICY_ASSIGNED": {
      const args = {
        ...leave(p),
        hasFrom: has(p.effectiveFrom),
        from: str(p.effectiveFrom) ? formatDisplayDate(str(p.effectiveFrom), { language }) : "",
      };
      return {
        title: t("presenter.policyAssigned.title"),
        message: str(p.actorName)
          ? t("presenter.policyAssigned.withActor", { ...args, actor: str(p.actorName) })
          : t("presenter.policyAssigned.withoutActor", args),
        icon: CalendarLock01Icon,
        href: ownTimeOff(p.userId),
      };
    }
    case "TIMEOFF_POLICY_ENDED": {
      const args = {
        ...leave(p),
        hasUntil: has(p.effectiveTo),
        until: str(p.effectiveTo) ? formatDisplayDate(str(p.effectiveTo), { language }) : "",
      };
      return {
        title: t("presenter.policyEnded.title"),
        message: str(p.actorName)
          ? t("presenter.policyEnded.withActor", { ...args, actor: str(p.actorName) })
          : t("presenter.policyEnded.withoutActor", args),
        icon: CalendarLock01Icon,
        href: ownTimeOff(p.userId),
      };
    }
    case "TIMEOFF_APPROVALS_DELEGATED":
      return {
        title: t("presenter.approvalsDelegated.title"),
        message: t("presenter.approvalsDelegated.message", {
          delegator: str(p.delegatorName) || t("fallback.aColleague"),
          hasDates: has(dates(p, language)),
          dates: dates(p, language),
          onLeave: yesNo(str(p.delegationSource) === "LEAVE"),
        }),
        icon: UserGroupIcon,
        href: "/preferences",
      };
    case "TIMEOFF_BALANCE_ADJUSTED": {
      const args = { ...leave(p), amount: signedDays(t, str(p.amount)) };
      return {
        title: t("presenter.balanceAdjusted.title"),
        message: withReason(
          t,
          str(p.actorName)
            ? t("presenter.balanceAdjusted.withActor", { ...args, actor: str(p.actorName) })
            : t("presenter.balanceAdjusted.withoutActor", args),
          p.reason,
        ),
        icon: CalendarLock01Icon,
        href: ownTimeOff(p.userId),
      };
    }
    case "TIMEOFF_REQUEST_REPRICED": {
      const previous = dayArgs(str(p.previousAmount));
      return {
        title: t("presenter.requestRepriced.title"),
        message: t("presenter.requestRepriced.message", {
          ...leave(p),
          dates: dates(p, language),
          ...dayArgs(str(p.amount)),
          hasPrevious: has(p.previousAmount),
          previousCount: previous.count,
          previous: previous.amount,
        }),
        icon: CalendarLock01Icon,
        href: ownTimeOff(p.userId),
      };
    }
    case "PUBLIC_HOLIDAY_CALENDAR_SOURCE_DRIFT": {
      const calendarId = str(p.calendarId);
      const counts = (
        [
          [p.added, "added"],
          [p.changed, "changed"],
          [p.removed, "removed"],
        ] as const
      )
        .filter(([count]) => Number(count) > 0)
        .map(([count, what]) => t(`presenter.driftCount.${what}`, { count: str(count) }))
        .join(", ");
      const year = { hasYear: has(p.year), year: str(p.year), hasCounts: has(counts), counts };
      const status = n.source?.status;
      // A conflict: the provider changed days the company overrode. It blocks nothing — the company's
      // version stays in force until somebody takes the source's.
      if (p.conflict === true || p.conflict === "true") {
        const conflictOutcome =
          status === "APPLIED"
            ? t("presenter.holidayConflict.applied")
            : status === "DISMISSED"
              ? t("presenter.holidayConflict.dismissed")
              : status === "SUPERSEDED"
                ? t("presenter.holidayConflict.superseded")
                : t("presenter.holidayConflict.open");
        return {
          title: t("presenter.holidayConflict.title"),
          message: t("presenter.holidayConflict.message", {
            calendar: str(p.calendarName) || t("fallback.aHolidayCalendar"),
            ...year,
            outcome: conflictOutcome,
          }),
          icon: Alert02Icon,
          href: calendarId ? `/settings/time/public-holidays/${calendarId}` : null,
        };
      }
      // The last sentence follows the drift as it is now, not as it was when the card was sent: every
      // calendar manager holds a copy and one person's Apply closes them all (WALK_QUESTIONS § 17).
      const outcome =
        status === "APPLIED"
          ? t("presenter.holidayDrift.applied")
          : status === "DISMISSED"
            ? t("presenter.holidayDrift.dismissed")
            : status === "SUPERSEDED"
              ? t("presenter.holidayDrift.superseded")
              : t("presenter.holidayDrift.open");
      return {
        title: t("presenter.holidayDrift.title"),
        message: t("presenter.holidayDrift.message", {
          calendar: str(p.calendarName) || t("fallback.AHolidayCalendar"),
          ...year,
          outcome,
        }),
        icon: Alert02Icon,
        href: calendarId ? `/settings/time/public-holidays/${calendarId}` : null,
      };
    }
    case "ROLE_ASSIGNMENT_CREATED":
      return {
        title: t("presenter.roleAssigned.title"),
        message: t("presenter.roleAssigned.message", { hasRole: has(p.roleName), role: str(p.roleName), ...by(p) }),
        icon: ShieldCheckIcon,
        href: ownProfile(p.userId),
      };
    case "ROLE_ASSIGNMENT_REMOVED":
      return {
        title: t("presenter.roleRemoved.title"),
        message: t("presenter.roleRemoved.message", { hasRole: has(p.roleName), role: str(p.roleName), ...by(p) }),
        icon: ShieldCheckIcon,
        href: ownProfile(p.userId),
      };
    case "ROLE_HOLDERS_CHANGED": {
      const roleId = str(p.roleId);
      const args = {
        who: str(p.actorName) || t("fallback.somebody"),
        role: str(p.roleName) || t("fallback.aRole"),
        hasPerson: has(p.personName),
        person: str(p.personName),
        count: Number(p.count) || 0,
      };
      return {
        title: t("presenter.roleHoldersChanged.title"),
        message: p.added === true || p.added === "true"
          ? t("presenter.roleHoldersChanged.added", args)
          : t("presenter.roleHoldersChanged.removed", args),
        icon: Alert02Icon,
        href: roleId ? `/settings/people/roles/${roleId}` : null,
      };
    }
    case "MANAGER_CHANGED": {
      const actor = str(p.actorName);
      const manager = str(p.managerName);
      return {
        title: t("presenter.managerChanged.title"),
        message: manager
          ? actor
            ? t("presenter.managerChanged.setWithActor", { actor, manager })
            : t("presenter.managerChanged.setWithoutActor", { manager })
          : actor
            ? t("presenter.managerChanged.removedWithActor", { actor })
            : t("presenter.managerChanged.removedWithoutActor"),
        icon: UserGroupIcon,
        href: ownProfile(p.userId),
      };
    }
    case "ORG_UNIT_ASSIGNED":
    case "ORG_UNIT_UNASSIGNED": {
      const unit = {
        kind: str(p.unitKind) === "TEAM" ? "team" : "department",
        hasUnit: has(p.unitName),
        unit: str(p.unitName),
      };
      const actor = str(p.actorName);
      const joined = n.type === "ORG_UNIT_ASSIGNED";
      return {
        title: joined
          ? t("presenter.orgUnit.assignedTitle", { kind: unit.kind })
          : t("presenter.orgUnit.unassignedTitle", { kind: unit.kind }),
        message: joined
          ? actor
            ? t("presenter.orgUnit.assignedWithActor", { ...unit, actor })
            : t("presenter.orgUnit.assignedWithoutActor", unit)
          : actor
            ? t("presenter.orgUnit.unassignedWithActor", { ...unit, actor })
            : t("presenter.orgUnit.unassignedWithoutActor", unit),
        icon: UserGroupIcon,
        href: ownProfile(p.userId),
      };
    }
    case "POSITION_CHANGED": {
      const actor = str(p.actorName);
      const job = str(p.jobName);
      return {
        title: t("presenter.positionChanged.title"),
        message: p.cleared === true || !job
          ? actor
            ? t("presenter.positionChanged.clearedWithActor", { actor })
            : t("presenter.positionChanged.clearedWithoutActor")
          : actor
            ? t("presenter.positionChanged.setWithActor", { actor, job })
            : t("presenter.positionChanged.setWithoutActor", { job }),
        icon: Briefcase01Icon,
        href: ownProfile(p.userId),
      };
    }
    case "DOCUMENT_ADDED_TO_FILE": {
      const userId = str(p.userId);
      return {
        title: t("presenter.documentAdded.title"),
        message: t("presenter.documentAdded.message", {
          who: str(p.actorName) || t("fallback.somebody"),
          file: str(p.fileName) || t("fallback.aDocument"),
        }),
        icon: FileTextIcon,
        href: userId ? `/organization/people/${userId}/documents` : null,
      };
    }
    case "LIFECYCLE_TASK_DUE": {
      return {
        title: t("presenter.taskDue.title"),
        message: t("presenter.taskDue.message", {
          task: str(p.taskTitle) || t("fallback.ATask"),
          target: person,
          kind: processKind(p),
        }),
        icon: CheckListIcon,
        href: "/tasks",
      };
    }
    case "LIFECYCLE_TASK_OVERDUE": {
      const processId = str(p.processId);
      return {
        title: t("presenter.taskOverdue.title"),
        message: t("presenter.taskOverdue.message", {
          task: str(p.taskTitle) || t("fallback.ATask"),
          target: person,
          kind: processKind(p),
          ...dueOn(p.dueDate, language),
          hasAssignee: has(p.assigneeName),
          assignee: str(p.assigneeName),
        }),
        icon: Alert02Icon,
        href: processId ? `/processes/${processId}` : "/tasks",
      };
    }
    case "LIFECYCLE_TASK_COMMENTED": {
      const processId = str(p.processId);
      return {
        title: t("presenter.taskCommented.title"),
        message: t("presenter.taskCommented.message", {
          author: str(p.authorName) || t("fallback.somebody"),
          task: str(p.taskTitle) || t("fallback.aTask"),
          target: person,
          kind: processKind(p),
        }),
        icon: CheckListIcon,
        href: p.forAssignee === true || !processId ? "/tasks" : `/processes/${processId}`,
      };
    }
    case "LIFECYCLE_TASKS_ASSIGNED": {
      const count = Number(p.taskCount) || 0;
      const kind = processKind(p);
      const due = dueOn(p.firstDueDate, language);
      // A task added to a running process, or given to somebody else (C2): one task, named.
      if (str(p.assignedTaskTitle)) {
        return {
          title: t("presenter.tasksAssigned.oneTitle"),
          message: t("presenter.tasksAssigned.assigned", { task: str(p.assignedTaskTitle), target: person, kind, ...due }),
          icon: CheckListIcon,
          href: "/tasks",
        };
      }
      // A task that waited for another and has just opened (decision 10): one task, named.
      if (str(p.openedTaskTitle)) {
        return {
          title: t("presenter.tasksAssigned.oneTitle"),
          message: t("presenter.tasksAssigned.opened", { task: str(p.openedTaskTitle), target: person, kind, ...due }),
          icon: CheckListIcon,
          href: "/tasks",
        };
      }
      return {
        title: t("presenter.tasksAssigned.title", { count }),
        message: t("presenter.tasksAssigned.started", {
          target: str(p.targetName) || t("fallback.APerson"),
          kind,
          count,
          ...due,
        }),
        icon: CheckListIcon,
        href: "/tasks",
      };
    }
    case "LIFECYCLE_PROCESS_STEP_FAILED": {
      const processId = str(p.processId);
      const kind = processKind(p);
      return {
        title: t("presenter.stepFailed.title", { kind }),
        message: t("presenter.stepFailed.message", { target: str(p.targetName) || t("fallback.APerson"), kind }),
        icon: Alert02Icon,
        href: processId ? `/processes/${processId}` : null,
      };
    }
    // Automations (AUTOMATIONS_DESIGN.md § 4–6). A rule's own message is the author's text, rendered
    // for this person by the engine; the failures, the pause and a wait that ran out are about the automation, and go to
    // its owner (or whom the step names); an approval reminder goes to the approver.
    case "AUTOMATION_MESSAGE": {
      return {
        title: str(p.ruleName) || t("fallback.automation"),
        message: str(p.text) || t("fallback.automationMessage"),
        icon: FlashIcon,
        href: ownProfile(p.personId),
      };
    }
    case "AUTOMATION_TASK_ASSIGNED": {
      return {
        title: t("presenter.automationTask.title"),
        message: t("presenter.automationTask.message", {
          task: str(p.taskTitle) || t("fallback.ATask"),
          hasPerson: has(p.personName),
          person: str(p.personName),
          hasRule: has(p.ruleName),
          rule: str(p.ruleName),
          ...dueOn(p.dueDate, language),
        }),
        icon: CheckListIcon,
        href: "/tasks",
      };
    }
    case "AUTOMATION_RUN_FAILED": {
      // "{Automation} couldn't finish for {Name}." — opens the run, where its failed step says why.
      const ruleId = str(p.automationRuleId);
      const runId = str(p.runId);
      return {
        title: t("presenter.automationRunFailed.title"),
        message: t("presenter.automationRunFailed.message", {
          rule: str(p.ruleName) || t("fallback.anAutomation"),
          person: str(p.personName) || t("fallback.aPerson"),
        }),
        icon: Alert02Icon,
        href: ruleId ? automationHref(ruleId, runId ? { run: runId } : undefined) : null,
      };
    }
    case "AUTOMATION_RULE_PAUSED": {
      // The reason is a code (MANUAL, OWNER_LEFT, OWNER_LACKS_RIGHT, TARGET_GONE); `detail` is the engine's and not shown.
      const ruleId = str(p.automationRuleId);
      return {
        title: t("presenter.automationPaused.title"),
        message: t("presenter.automationPaused.message", {
          rule: str(p.ruleName) || t("fallback.anAutomation"),
          reason: pauseReason(p.reason),
        }),
        icon: Alert02Icon,
        href: ruleId ? automationHref(ruleId) : null,
      };
    }
    case "AUTOMATION_WAIT_TIMED_OUT": {
      // A wait set to "Stop and tell someone" ran out: the people it names are told.
      const ruleId = str(p.automationRuleId);
      const runId = str(p.runId);
      const days = Number(p.maxDays);
      const hasDays = str(p.maxDays) !== "" && Number.isFinite(days) && days > 0;
      return {
        title: t("presenter.automationWaitTimedOut.title"),
        message: t("presenter.automationWaitTimedOut.message", {
          rule: str(p.ruleName) || t("fallback.anAutomation"),
          person: str(p.personName) || t("fallback.aPerson"),
          what: str(p.until) === "TASK_DONE" || str(p.until) === "FIELD_FILLED" ? str(p.until) : "other",
          hasDays: yesNo(hasDays),
          days: hasDays ? days : 0,
        }),
        icon: Alert02Icon,
        href: ruleId ? automationHref(ruleId, runId ? { run: runId } : undefined) : null,
      };
    }
    case "AUTOMATION_APPROVAL_REMINDER": {
      // "Remind them every day" on an approval nobody has answered yet: the approver is reminded.
      return {
        title: t("presenter.automationApprovalReminder.title"),
        message: t("presenter.automationApprovalReminder.message", {
          task: str(p.taskTitle) || t("fallback.ATask"),
          hasPerson: has(p.personName),
          person: str(p.personName),
        }),
        icon: CheckListIcon,
        href: "/tasks",
      };
    }
    case "INVITATION_FAILED": {
      // A scheduled invitation outside any process that could not go out — told to whoever scheduled it.
      const userId = str(p.userId);
      return {
        title: t("presenter.invitationFailed.title"),
        message: t("presenter.invitationFailed.message", { target: person }),
        icon: Alert02Icon,
        href: userId ? `/organization/people/${userId}` : null,
      };
    }
    case "ROLE_ACCESS_CHANGED": {
      const roleId = str(p.roleId);
      const args = {
        what: str(p.what) === "FIELD_ACCESS" ? "fieldAccess" : "permissions",
        role: str(p.roleName) || t("fallback.ARole"),
      };
      const who = str(p.actorName);
      const field = str(p.fieldName);
      const namesField = field
        ? (who
          ? t("presenter.roleAccessChanged.fieldWithActor", { field, role: args.role, actor: who })
          : t("presenter.roleAccessChanged.fieldWithoutActor", { field, role: args.role }))
        : null;
      return {
        title: t("presenter.roleAccessChanged.title"),
        message: namesField ?? (who
          ? t("presenter.roleAccessChanged.withActor", { ...args, actor: who })
          : t("presenter.roleAccessChanged.withoutActor", args)),
        icon: Alert02Icon,
        href: roleId ? `/settings/people/roles/${roleId}` : null,
      };
    }
    case "ACCOUNT_LOCKED": {
      // Sent to the person's manager and to whoever holds BLOCK over them — the people who can send
      // the password reset that lifts the lock, which lives in the profile's Person Actions.
      const userId = str(p.userId);
      return {
        title: t("presenter.accountLocked.title"),
        message: t("presenter.accountLocked.message", { name: str(p.name) || t("fallback.somebody") }),
        icon: SquareLock02Icon,
        href: userId ? `/organization/people/${userId}/personal` : null,
      };
    }
    case "SECURITY_CHANGED": {
      // Every System Owner is told when somebody changes how people sign in (R2.4, MFA_DESIGN.md § 7).
      const who = str(p.actorName) || t("fallback.somebody");
      const whom = str(p.name);
      const event = str(p.event);
      const message =
        event === "SCIM_BLOCK_REFUSED"
          ? t("presenter.securityChanged.scimBlockRefused", { whom: whom || t("fallback.aSystemOwner") })
          : event === "MFA_RESET"
            ? t("presenter.securityChanged.mfaReset", { who, whom: whom || t("fallback.aPerson") })
            : event === "MFA_POLICY_CHANGED"
              ? t("presenter.securityChanged.mfaPolicyChanged", { who })
              : event === "IDENTITY_CONNECTION_UPDATED"
                ? t("presenter.securityChanged.identityConnectionUpdated", { who })
                : event === "SCIM_TOKEN_ISSUED"
                  ? t("presenter.securityChanged.scimTokenIssued", { who })
                  : event === "IDP_GROUP_ROLES_CHANGED"
                    ? t("presenter.securityChanged.idpGroupRolesChanged", { who })
                    : t("presenter.securityChanged.other", { who });
      const securityUserId = str(p.userId);
      return {
        title: t("presenter.securityChanged.title"),
        message,
        icon: SquareLock02Icon,
        href: securityUserId ? `/organization/people/${securityUserId}/personal` : "/settings/tech/login-and-sso",
      };
    }
    // Performance reviews (REVIEWS_DESIGN.md § 8.3). A review's own page is the reviewer's; a cycle's is its runner's.
    case "REVIEW_CYCLE_LAUNCHED": {
      return {
        title: t("presenter.reviewCycleLaunched.title"),
        message: t("presenter.reviewCycleLaunched.message", {
          cycle: str(p.cycleName) || t("fallback.AReviewCycle"),
          ...dueOn(p.firstDueOn, language),
        }),
        icon: TaskDone01Icon,
        href: "/reviews/me",
      };
    }
    case "REVIEW_ASSIGNED": {
      return {
        title: t("presenter.reviewAssigned.title"),
        message: t("presenter.reviewAssigned.message", {
          kind: reviewKind(p.kind),
          hasSubject: has(p.subjectName),
          subject: str(p.subjectName),
          cycle,
        }),
        icon: TaskDone01Icon,
        href: n.targetId ? `/reviews/write/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_DUE_SOON": {
      return {
        title: t("presenter.reviewDueSoon.title"),
        message: t("presenter.reviewDueSoon.message", {
          kind: reviewKind(p.kind),
          hasSubject: has(p.subjectName),
          subject: str(p.subjectName),
          cycle,
          ...dueOn(p.dueDate, language),
        }),
        icon: CalendarLock01Icon,
        href: n.targetId ? `/reviews/write/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_DUE": {
      return {
        title: t("presenter.reviewDue.title"),
        message: t("presenter.reviewDue.message", {
          kind: reviewKind(p.kind),
          hasSubject: has(p.subjectName),
          subject: str(p.subjectName),
          cycle,
        }),
        icon: CalendarLock01Icon,
        href: n.targetId ? `/reviews/write/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_REMINDER": {
      return {
        title: t("presenter.reviewReminder.title"),
        message: t("presenter.reviewReminder.message", { kind: reviewKind(p.kind), cycle }),
        icon: Notification01Icon,
        href: n.targetId ? `/reviews/write/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_OVERDUE": {
      return {
        title: t("presenter.reviewOverdue.title"),
        message: t("presenter.reviewOverdue.message", {
          reviewer: str(p.reviewerName) || t("fallback.aReviewer"),
          kind: reviewKind(p.kind),
          subject: str(p.subjectName) || t("fallback.aPerson"),
          cycle: str(p.cycleName) || t("fallback.yourCycle"),
          due: formatDisplayDate(str(p.dueDate), { language }),
        }),
        icon: Alert02Icon,
        href: str(p.cycleId) ? `/reviews/cycles/${str(p.cycleId)}` : "/reviews",
      };
    }
    case "REVIEW_DECLINED": {
      return {
        title: t("presenter.reviewDeclined.title"),
        message: t("presenter.reviewDeclined.message", {
          reviewer: str(p.reviewerName) || t("fallback.aColleague"),
          subject: str(p.subjectName) || t("fallback.aPerson"),
          cycle: str(p.cycleName) || t("fallback.yourCycle"),
        }),
        icon: CancelCircleIcon,
        href: str(p.cycleId) ? `/reviews/cycles/${str(p.cycleId)}` : "/reviews",
      };
    }
    case "REVIEW_SELF_SUBMITTED": {
      return {
        title: t("presenter.reviewSelfSubmitted.title"),
        message: t("presenter.reviewSelfSubmitted.message", {
          subject: str(p.subjectName) || t("fallback.oneOfYourPeople"),
          cycle,
        }),
        icon: CheckmarkCircle02Icon,
        href: "/reviews/me",
      };
    }
    case "REVIEW_SHARED": {
      return {
        title: t("presenter.reviewShared.title"),
        message: t("presenter.reviewShared.message", { cycle }),
        icon: TaskDone01Icon,
        href: n.targetId ? `/reviews/packets/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_AMENDED": {
      return {
        title: t("presenter.reviewAmended.title"),
        message: t("presenter.reviewAmended.message", { cycle }),
        icon: TaskDone01Icon,
        href: n.targetId ? `/reviews/packets/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_ACKNOWLEDGED": {
      return {
        title: t("presenter.reviewAcknowledged.title"),
        message: t("presenter.reviewAcknowledged.message", {
          subject: str(p.subjectName) || t("fallback.oneOfYourPeople"),
          cycle,
          commented: yesNo(p.commented === true),
        }),
        icon: CheckmarkCircle02Icon,
        href: n.targetId ? `/reviews/packets/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_PEERS_TO_APPROVE": {
      return {
        title: t("presenter.reviewPeersToApprove.title"),
        message: t("presenter.reviewPeersToApprove.message", {
          subject: str(p.subjectName) || t("fallback.oneOfYourPeople"),
          cycle,
        }),
        icon: TaskDone01Icon,
        href: n.targetId ? `/reviews/nominations/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_PEERS_APPROVED": {
      return {
        title: t("presenter.reviewPeersApproved.title"),
        message: p.autoApproved === true
          ? t("presenter.reviewPeersApproved.auto", { cycle })
          : t("presenter.reviewPeersApproved.manual", { cycle }),
        icon: CheckmarkCircle02Icon,
        href: n.targetId ? `/reviews/nominations/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_TO_APPROVE": {
      return {
        title: t("presenter.reviewToApprove.title"),
        message: t("presenter.reviewToApprove.message", { subject: str(p.subjectName) || t("fallback.aPerson"), cycle }),
        icon: TaskDone01Icon,
        href: n.targetId ? `/reviews/packets/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_APPROVED": {
      return {
        title: t("presenter.reviewApproved.title"),
        message: t("presenter.reviewApproved.message", { subject: str(p.subjectName) || t("fallback.aPerson"), cycle }),
        icon: CheckmarkCircle02Icon,
        href: n.targetId ? `/reviews/packets/${str(n.targetId)}` : "/reviews/me",
      };
    }
    case "REVIEW_SENT_BACK": {
      return {
        title: t("presenter.reviewSentBack.title"),
        message: t("presenter.reviewSentBack.message", { subject: str(p.subjectName) || t("fallback.aPerson"), cycle }),
        icon: Alert02Icon,
        href: n.targetId ? `/reviews/write/${str(n.targetId)}` : "/reviews/me",
      };
    }
    default:
      return {
        // An unknown type shows its own code, humanised — there is no text for it to translate.
        title: n.type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        message: "",
        icon: Notification01Icon,
        href: n.targetType && n.targetId ? null : null,
      };
  }
};

const CATEGORY_KEYS = {
  APPROVALS: "categories.APPROVALS",
  ORG_CHANGES: "categories.ORG_CHANGES",
  DOCUMENTS: "categories.DOCUMENTS",
  TASKS: "categories.TASKS",
  POLICIES: "categories.POLICIES",
  SYSTEM: "categories.SYSTEM",
} as const;

/** Friendly label for a notification category (falls back to a humanized key for unknown ones). */
export const categoryLabel = (category: string, t: NotificationsTranslator): string =>
  category in CATEGORY_KEYS
    ? t(CATEGORY_KEYS[category as keyof typeof CATEGORY_KEYS])
    : category.replaceAll("_", " ").toLowerCase();

export type DateGroupKey = "today" | "yesterday" | "week" | "earlier";
export type DateGroup = { key: DateGroupKey; order: number };

/**
 * Buckets a notification's timestamp into a coarse date section for grouped rendering
 * (Today / Yesterday / This week / Earlier — `inbox.dateGroup.<key>`). `order` gives a stable sort, newest bucket first.
 */
export const dateGroup = (iso: string): DateGroup => {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return { key: "earlier", order: 3 };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((startOfToday.getTime() - then.getTime()) / dayMs);

  if (then.getTime() >= startOfToday.getTime()) return { key: "today", order: 0 };
  if (diffDays < 1) return { key: "yesterday", order: 1 };
  if (diffDays < 7) return { key: "week", order: 2 };
  return { key: "earlier", order: 3 };
};

export const timeAgo = (iso: string, t: NotificationsTranslator, language?: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return t("inbox.timeAgo.justNow");
  const mins = Math.floor(secs / 60);
  if (mins < 60) return t("inbox.timeAgo.minutes", { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("inbox.timeAgo.hours", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t("inbox.timeAgo.days", { count: days });
  // Older than a week: an actual date, through the one formatter.
  return formatDisplayDate(iso, { language });
};
