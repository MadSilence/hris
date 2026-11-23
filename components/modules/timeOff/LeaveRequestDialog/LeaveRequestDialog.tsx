"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/desact/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { StepList, type StepListState, type StepListStep, type StepListTone } from "@/components/ui/StepList";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { cn } from "@/lib/cn";
import { dateToISO, useShortDates, useTimeFormatter } from "@/lib/date";
import { showSuccess } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import type { TimeOffDecisionContext, TimeOffPolicy } from "@/models/timeOff";
import { TimeOffRequestStatus, type TimeOffApprovalStepDTO } from "@/api/modules/timeOff/timeOffRequests/dto";
import { nonWorkingDayTest, expandSpanToDays } from "@/components/modules/calendar/lib/dateRange";
import { useUserPublicHolidays } from "@/components/modules/calendar/hooks/useUserPublicHolidays";
import { RequestTimeOffModal } from "@/components/modules/calendar/components/UserTimeOffBalances/RequestTimeOffModal";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { useEmployeeTimeOffBalancesByUser } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useCancelTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useCancelTimeOffRequest";
import { useDecideCancellation } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideCancellation";
import { useInvalidateNotifications } from "@/components/modules/notifications/hooks/useNotifications";
import { DecideAnywayControls } from "@/components/modules/timeOff/DecideAnywayControls";
import { DeclineLeaveDialog } from "@/components/modules/timeOff/DeclineLeaveDialog";
import { backOn } from "@/components/modules/timeOff/lib/leaveDays";
import { balanceUnit, lengthOf, requestUnitOf } from "@/components/modules/timeOff/lib/leaveWords";
import { timeOffDecisionQueryKey, useLeaveRequestContext } from "@/components/modules/timeOff/lib/requestQuery";
import { LeaveBalanceRow } from "@/components/modules/timeOff/LeaveBalanceRow";
import { LeaveDays } from "@/components/modules/timeOff/LeaveMonthGrid";
import { CancelLeaveRequestDialog } from "@/components/modules/timeOff/CancelLeaveRequestDialog";

type StatusKey = "status.pending" | "status.approved" | "status.cancellationPending" | "status.rejected" | "status.cancelled";

const STATUS: Record<TimeOffRequestStatus, { tone: StatusTone; key: StatusKey }> = {
  [TimeOffRequestStatus.Pending]: { tone: "pending", key: "status.pending" },
  [TimeOffRequestStatus.Approved]: { tone: "approved", key: "status.approved" },
  [TimeOffRequestStatus.CancellationPending]: { tone: "pending", key: "status.cancellationPending" },
  [TimeOffRequestStatus.Rejected]: { tone: "declined", key: "status.rejected" },
  [TimeOffRequestStatus.Cancelled]: { tone: "archived", key: "status.cancelled" },
};

/** The status of a request as its pill says it ("Pending", "Declined", "Canceled"). */
export const useLeaveStatus = () => {
  const t = useTranslations("leave");
  return (status: TimeOffRequestStatus) => ({
    tone: STATUS[status].tone,
    label: t(STATUS[status].key),
  });
};

const initials = (name: string | null | undefined) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

const Face: React.FC<{ name: string | null | undefined; url?: string | null; className: string }> = ({ name, url, className }) => (
  <Avatar className={className}>
    {url ? <AvatarImage src={url} alt="" /> : null}
    <AvatarFallback name={name}>{initials(name)}</AvatarFallback>
  </Avatar>
);

type Props = {
  /** The request to show; null keeps the dialog closed. */
  requestId: string | null;
  onClose: () => void;
  /** Opened from All requests: a ‹ back to the list, top left (Q29b). */
  onBack?: () => void;
};

/**
 * **A time off request opened in full** (profile-time-off Q29b, Q30, Q30b–f; the answers of 2026-11-20 AQ16a–d,
 * AQ04a–c): one column, 680 wide, radius 24. The label row (policy, status, when it was asked), the dates as the
 * headline and the day the person is back, then where the approval stands — a status block, or for an approver of a
 * chain of several the steps (STEPS) — the days on a month, the balance row, the person's note, and the footer for who
 * is reading it:
 *
 * - **their own waiting request** — "Cancel request" (red text, left, into the Q31 confirm) · "Edit dates";
 * - **their own approved leave still ahead** — "Ask to cancel" (red text): the backend asks the approver when the
 *   policy wants it, or cancels at once;
 * - **the approver it waits on** — Decline (the AQ-13 window) · Approve, "Approve anyway" when the balance is short
 *   (the row turns red: "Rūta has 3 days left" · "−2 days");
 * - **the approver answering a cancel ask** — the badge stays Approved; "Rūta asks to cancel this time off", the days
 *   back on the balance row, her comment; "Keep it" · the red "Cancel time off", at once.
 *
 * The requester never sees who has not decided: "Waiting for approval", with several approvers "1 of 3 approved";
 * once approved, every approver's name. There is no request page — this opens over the page it was asked from
 * (AQ-12 b: `LeaveRequestHost`, `?leaveRequest={id}`), and in the profile's own tab.
 */
export const LeaveRequestDialog: React.FC<Props> = ({ requestId, onClose, onBack }) => (
  <Dialog open={requestId !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent
      aria-describedby={undefined}
      className="max-h-[calc(100vh-2rem)] gap-0 overflow-y-auto rounded-leave-dialog p-8 sm:max-w-[680px]"
    >
      {requestId ? <LeaveRequestBody key={requestId} requestId={requestId} onClose={onClose} onBack={onBack} /> : null}
    </DialogContent>
  </Dialog>
);

const LeaveRequestBody: React.FC<{
  requestId: string;
  onClose: () => void;
  onBack?: () => void;
}> = ({ requestId, onClose, onBack }) => {
  const t = useTranslations("leave");
  const tCalendar = useTranslations("calendar");
  const shortDates = useShortDates();
  const time = useTimeFormatter();
  const statusOf = useLeaveStatus();
  const queryClient = useQueryClient();
  const invalidateNotifications = useInvalidateNotifications();

  const context = useLeaveRequestContext(requestId);
  const { data: policies } = useTimeOffPolicies();
  const { userId: me, user: meUser } = useCurrentUser();
  const { company } = useCompanyData();
  const isNonWorking = React.useMemo(() => nonWorkingDayTest(company?.workingDays), [company?.workingDays]);
  const requesterId = context.data?.request.userId ?? "";
  const { data: holidayRows } = useUserPublicHolidays({ userId: requesterId });
  const holidays = React.useMemo(
    () => new Set((holidayRows ?? []).flatMap((h) => expandSpanToDays(h.holidayDate, h.endDate))),
    [holidayRows],
  );

  const approve = useApproveTimeOffRequest();
  const cancel = useCancelTimeOffRequest();
  const decideCancellation = useDecideCancellation();
  const [error, setError] = React.useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [declineOpen, setDeclineOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  if (context.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <DialogTitle className="sr-only">{t("month.open")}</DialogTitle>
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (context.error || !context.data) {
    return (
      <>
        <DialogTitle className="sr-only">{t("full.loadError")}</DialogTitle>
        <ErrorState compact error={context.error} title={t("full.loadError")} onRetry={() => void context.refetch()} />
      </>
    );
  }

  const data = context.data;
  const { request, requesterName, balance, awaitingYou, canDecideAnyway, steps, workingDays, chain, cancelNeedsApproval } = data;
  const policy = (policies ?? []).find((p) => p.id === request.policyId);
  const unit = request.countingMode ? requestUnitOf(policy, request.countingMode) : requestUnitOf(policy, workingDays ? "WORKING_DAYS" : null);
  const bUnit = balanceUnit(unit);
  const own = me === request.userId;
  const firstName = requesterName?.split(" ")[0] ?? null;
  const pending = request.status === TimeOffRequestStatus.Pending;
  const approved = request.status === TimeOffRequestStatus.Approved;
  const cancellationPending = request.status === TimeOffRequestStatus.CancellationPending;
  const answeringCancel = cancellationPending && awaitingYou && !own;
  const ahead = request.startDate > dateToISO(new Date());
  const busy = approve.isPending || cancel.isPending || decideCancellation.isPending;
  const range = { start: request.startDate, end: request.endDate };
  const back = backOn(request.endDate, isNonWorking, holidays);
  const unlimited = policy?.unlimitedQuota ?? false;
  // A chain of several, as an approver sees it, takes the status block's place (AQ04a, AQ04b).
  const showsSteps = !own && pending && steps.length > 1;

  // The badge stays Approved while its approver answers a cancel ask (AQ16c); the person who asked sees their ask.
  const status = answeringCancel ? statusOf(TimeOffRequestStatus.Approved) : statusOf(request.status);

  // U7: a waiting request is not counted in the balance — what is left after it is the balance minus every request
  // still waiting, this one included (`availableBalance`). An approved one is already counted; a cancel ask gives
  // its days back if agreed.
  const leftAfter = balance
    ? pending
      ? balance.availableBalance ?? balance.currentBalance - request.requestedAmount
      : answeringCancel
        ? balance.currentBalance + request.requestedAmount
        : balance.currentBalance
    : undefined;
  const short = pending && !unlimited && leftAfter !== undefined && leftAfter < 0;

  const refresh = async () => {
    invalidateNotifications();
    await queryClient.invalidateQueries({ queryKey: timeOffDecisionQueryKey(requestId) });
  };

  const run = async (act: () => Promise<unknown>, toast?: string) => {
    setError(null);
    try {
      await act();
      await refresh();
      if (toast) showSuccess(toast);
      onClose();
    } catch (e) {
      setError(messageForError(e));
    }
  };

  // "Ask to cancel" or "Cancel time off": the decision context says which the policy's edit rules make it
  // (`cancelNeedsApproval`); the backend decides, and the toast says which it was.
  const askToCancel = async () => {
    setError(null);
    try {
      await cancel.mutateAsync({ requestId: request.id, userId: request.userId, cancellationReason: null });
      await refresh();
      const after = await queryClient.fetchQuery<TimeOffDecisionContext>({ queryKey: timeOffDecisionQueryKey(requestId) })
        .catch(() => null);
      showSuccess(after?.request.status === TimeOffRequestStatus.Cancelled ? t("full.timeOffCanceled") : t("full.cancelAsked"));
      onClose();
    } catch (e) {
      setError(messageForError(e));
    }
  };

  const approvedNames = chain?.approvedByNames?.length
    ? chain.approvedByNames.join(", ")
    : ([...steps].reverse().find((s) => s.signed)?.decidedByName ?? null);
  const approvedCount = chain && chain.required > 1 ? t("full.approvedCount", { approved: chain.approved, total: chain.required }) : null;

  const statusBlock = (() => {
    if (answeringCancel) {
      return {
        tone: "pending",
        face: <Face name={requesterName} className="size-9" />,
        title: t("full.asksToCancel", { name: firstName ?? "" }),
        sub: t("full.daysGoBack", {
          count: request.requestedAmount,
          length: lengthOf(t, request.requestedAmount, bUnit),
          name: firstName ?? "",
        }),
      };
    }
    if (pending && awaitingYou) {
      return { tone: "pending", face: <Face name={meUser ? `${meUser.firstName} ${meUser.lastName}` : null} url={meUser?.avatarUrl} className="size-9" />,
        title: t("full.waitingForYou"), sub: t("full.youApprove", { name: firstName ?? "" }) };
    }
    if (pending) {
      // Nobody named to the requester — a count when several decide (AQ04c).
      return { tone: "pending", face: <ClockFace />, title: t("full.waitingForApproval"), sub: approvedCount };
    }
    if (approved || (cancellationPending && !own)) {
      const at = request.approvedAt
        ? t("full.at", { date: shortDates.date(request.approvedAt, { weekday: true }), time: time(request.approvedAt) })
        : null;
      return { tone: "approved", face: approvedNames && !approvedNames.includes(",") ? <Face name={approvedNames} className="size-9" /> : null,
        title: approvedNames ? t("full.approvedBy", { name: approvedNames }) : t("full.approved"), sub: at };
    }
    if (request.status === TimeOffRequestStatus.Rejected) {
      return { tone: "declined", face: null, title: t("full.declined"), sub: request.rejectionReason };
    }
    if (cancellationPending) {
      return { tone: "pending", face: <ClockFace />, title: t("full.cancellationRequested"), sub: request.cancellationReason };
    }
    return null;
  })();

  const counted = pending || approved || cancellationPending;
  const bubble = answeringCancel ? request.cancellationReason || request.reason : request.reason;

  const footer = (() => {
    if (own && pending) {
      return (
        <>
          <Button type="button" variant="ghost" className="-ml-3.5 text-danger-text" disabled={busy} onClick={() => setCancelOpen(true)}>
            {t("full.cancelRequest")}
          </Button>
          <Button type="button" variant="secondary" className="ml-auto" disabled={busy} onClick={() => setEditOpen(true)}>
            {t("full.editDates")}
          </Button>
        </>
      );
    }
    if (own && approved && ahead) {
      return (
        <Button type="button" variant="ghost" className="-mr-3.5 ml-auto text-danger-text" loading={cancel.isPending}
                onClick={() => void askToCancel()}>
          {cancelNeedsApproval ? t("full.askToCancel") : t("full.cancelTimeOff")}
        </Button>
      );
    }
    if (pending && awaitingYou) {
      return (
        <span className="ml-auto flex items-center gap-2">
          <Button type="button" variant="secondary" disabled={busy} onClick={() => setDeclineOpen(true)}>
            {t("full.decline")}
          </Button>
          <Button type="button" variant="approve" loading={approve.isPending}
                  onClick={() => void run(() => approve.mutateAsync({ requestId: request.id }), t("full.approvedToast"))}>
            {short ? t("full.approveAnyway") : t("full.approve")}
          </Button>
        </span>
      );
    }
    if (answeringCancel) {
      return (
        <span className="ml-auto flex items-center gap-2">
          <Button type="button" variant="secondary" disabled={busy}
                  onClick={() => void run(() => decideCancellation.mutateAsync({
                    requestId: request.id, userId: request.userId, decision: "DECLINE" }))}>
            {t("full.keepIt")}
          </Button>
          <Button type="button" variant="destructive-confirm" loading={decideCancellation.isPending}
                  onClick={() => void run(() => decideCancellation.mutateAsync({
                    requestId: request.id, userId: request.userId, decision: "CONFIRM" }), t("full.timeOffCanceled"))}>
            {t("full.cancelTimeOff")}
          </Button>
        </span>
      );
    }
    if (canDecideAnyway) {
      return (
        <span className="flex flex-wrap items-center gap-2">
          <DecideAnywayControls requestId={request.id} requesterName={requesterName} onDecided={refresh} />
        </span>
      );
    }
    return null;
  })();

  return (
    <>
      {/* The label row: (‹ back) · the policy · its status · when it was asked; the dialog's × is on the right. */}
      <div className="flex min-h-8 items-center gap-2.5 pr-8">
        {onBack ? (
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("full.back")} onClick={onBack} className="-ml-2">
            <Icon icon={ArrowLeft01Icon} size="sm" />
          </Button>
        ) : null}
        <span className="flex min-w-0 items-center gap-2 text-body font-medium text-secondary">
          <PolicyMarker color={policy?.color} />
          <span className="truncate">{policy?.name ?? tCalendar("balances.fallbackName")}</span>
        </span>
        <StatusBadge status={status.tone} label={status.label} />
        <span className="truncate text-label font-normal text-tertiary">
          {answeringCancel && request.approvedAt
            ? t("full.approvedOn", { date: shortDates.date(request.approvedAt, { weekday: true }) })
            : t("full.requested", { date: shortDates.date(request.createdAt, { weekday: true }) })}
        </span>
      </div>

      <DialogTitle className="mt-6 font-heading text-leave-dates text-primary">
        {shortDates.range(request.startDate, request.endDate, { weekday: true })}
      </DialogTitle>
      <p className="mt-1 text-card-title font-normal text-secondary">
        {t("full.backOn", { date: shortDates.date(back, { weekday: true }) })}
      </p>

      {showsSteps ? (
        <ApprovalSteps data={data} me={me} meName={meUser ? `${meUser.firstName} ${meUser.lastName}` : null} meAvatar={meUser?.avatarUrl} />
      ) : statusBlock ? (
        <div
          className={cn(
            "mt-8 flex items-center gap-3 rounded-card px-4 py-3",
            statusBlock.tone === "pending" && "bg-status-pending-bg/50",
            statusBlock.tone === "approved" && "bg-status-approved-bg/50",
            statusBlock.tone === "declined" && "bg-status-declined-bg/50",
          )}
        >
          {statusBlock.face}
          <span className="flex min-w-0 flex-col">
            <span className="text-body font-medium text-primary">{statusBlock.title}</span>
            {statusBlock.sub ? <span className="text-label font-normal text-secondary">{statusBlock.sub}</span> : null}
          </span>
        </div>
      ) : null}

      <div className="mt-4">
        <LeaveDays range={range} holidays={holidays} isNonWorking={isNonWorking} />
      </div>

      {counted ? (
        <LeaveBalanceRow
          className="mt-3"
          short={short}
          change={answeringCancel
            ? t("full.changeBack", { length: lengthOf(t, request.requestedAmount, unit, "+") })
            : lengthOf(t, request.requestedAmount, unit, "−")}
          note={short && balance
            ? own
              ? t("full.youHave", { length: lengthOf(t, leftAfter! + request.requestedAmount, bUnit) })
              : t("full.hasLeft", { name: firstName ?? "", length: lengthOf(t, leftAfter! + request.requestedAmount, bUnit) })
            : undefined}
          noLimit={unlimited ? t("noLimit") : undefined}
          value={leftAfter !== undefined ? (leftAfter < 0 ? `−${formatDayAmount(-leftAfter)}` : formatDayAmount(leftAfter)) : undefined}
          unit={leftAfter !== undefined
            ? short
              ? t("unitWord", { unit: bUnit, count: Math.abs(leftAfter) })
              : t("leftAfter", { unit: bUnit, count: leftAfter })
            : undefined}
        />
      ) : null}

      {bubble ? (
        <div className="mt-4 flex items-start gap-3">
          <Face name={requesterName} className="size-7" />
          <p className="rounded-card bg-mist px-3 py-2 text-body whitespace-pre-line text-primary">{bubble}</p>
        </div>
      ) : null}

      <FormError message={error} className="mt-4" />

      {footer ? <div className="mt-8 flex flex-wrap items-center gap-2">{footer}</div> : null}

      <CancelLeaveRequestDialog
        request={cancelOpen ? request : null}
        policy={policy}
        own={own}
        firstName={firstName}
        workingDays={unit === "working"}
        onClose={() => setCancelOpen(false)}
        onCanceled={() => {
          void queryClient.invalidateQueries({ queryKey: timeOffDecisionQueryKey(requestId) });
          onClose();
        }}
      />
      <DeclineLeaveDialog
        target={declineOpen
          ? { requestId: request.id, startDate: request.startDate, endDate: request.endDate,
              policyName: policy?.name, policyColor: policy?.color, firstName }
          : null}
        onClose={() => setDeclineOpen(false)}
        onDeclined={async () => {
          await queryClient.invalidateQueries({ queryKey: timeOffDecisionQueryKey(requestId) });
          onClose();
        }}
      />
      {editOpen ? (
        <EditDates
          request={request}
          policies={policies ?? []}
          onClose={() => {
            setEditOpen(false);
            void queryClient.invalidateQueries({ queryKey: timeOffDecisionQueryKey(requestId) });
          }}
        />
      ) : null}
    </>
  );
};

/** "Edit dates" (AQ16a): the request window, filled in with the request, over it. */
const EditDates: React.FC<{
  request: TimeOffDecisionContext["request"];
  policies: TimeOffPolicy[];
  onClose: () => void;
}> = ({ request, policies, onClose }) => {
  const { data: balances } = useEmployeeTimeOffBalancesByUser({ userId: request.userId });
  const policyMap = React.useMemo(() => new Map(policies.map((p) => [p.id, p])), [policies]);
  if (!balances) return null;
  return (
    <RequestTimeOffModal
      isOpen
      userId={request.userId}
      balances={balances}
      policyMap={policyMap}
      editing={request}
      onCloseAction={onClose}
    />
  );
};

/** The step's state in the shared step list's words. */
const MARK: Record<NonNullable<TimeOffApprovalStepDTO["state"]>, StepListState> = {
  DONE: "done",
  NOW: "now",
  NOT_YET: "next",
  DECLINED: "declined",
  SKIPPED: "skipped",
};

/**
 * Who approves (AQ04a in order, AQ04b any N of M; STEPS): done is a tick; the step waiting now — "You" when it is the
 * reader's — in the accent; the rest grey. A step never needed (the chain finished without it) is a grey dot.
 */
const ApprovalSteps: React.FC<{
  data: TimeOffDecisionContext;
  me: string | null | undefined;
  meName: string | null;
  meAvatar?: string | null;
}> = ({ data, me, meName, meAvatar }) => {
  const t = useTranslations("leave");
  const shortDates = useShortDates();
  const { steps, chain, awaitingYou } = data;
  const ordered = chain?.ordered ?? true;
  const total = chain?.total ?? steps.length;
  const required = chain?.required ?? total;
  const done = chain?.approved ?? steps.filter((s) => s.signed).length;

  const items: StepListStep[] = steps.map((step) => {
    const state: StepListState = step.state ? MARK[step.state] : step.signed ? "done" : "next";
    const asked = step.reassignedToUserId ?? step.askedUserId;
    const mine = state === "now" && asked !== null && asked === me;
    const name = state === "done" || state === "declined"
      ? step.decidedByName ?? step.askedUserName
      : step.reassignedToName ?? step.askedUserName;
    // The approver's job title when the server sends one (C5); otherwise the fallback role, or "Manager".
    const role = step.approverJobTitle
      ? step.approverJobTitle
      : step.askedReason === "FALLBACK" && step.askedRoleName
        ? step.askedRoleName
        : step.approverType === "MANAGER" ? t("full.steps.manager") : null;
    const when = step.decidedAt ? shortDates.date(step.decidedAt, { weekday: true }) : "";
    const [status, tone]: [string, StepListTone] =
      state === "done" ? [t("full.steps.approved", { date: when }), "approved"]
        : state === "declined" ? [t("full.steps.declined", { date: when }), "declined"]
          : state === "now" ? (mine ? [t("full.steps.waitingForYou"), "pending"] : [t("full.steps.waiting"), "neutral"])
            : state === "skipped" ? [t("full.steps.notNeeded"), "neutral"]
              : [awaitingYou && ordered ? t("full.steps.afterYou") : t("full.steps.waiting"), "neutral"];
    const shownName = mine ? t("full.steps.you") : name ?? t("full.steps.nobody");
    return {
      key: String(step.approvalOrder),
      state,
      number: step.approvalOrder,
      people: [{
        key: String(step.approvalOrder),
        avatar: <Face name={mine ? meName : name} url={mine ? meAvatar : null} className="size-6 text-hint" />,
        name: shownName,
        status: role ? t("full.steps.line", { role, status }) : status,
        statusTone: tone,
      }],
    };
  });

  return (
    <StepList
      className="mt-8"
      label={ordered ? t("full.steps.whoApproves") : t("full.steps.anyOf", { required, total })}
      // Any N of M has no "of": the designers' STEPS.md says the count alone, "1 approved" (2026-11-20).
      summary={ordered ? t("full.approvedCount", { approved: done, total }) : t("full.approvedSoFar", { approved: done })}
      ordered={ordered}
      steps={items}
    />
  );
};

/** In place of a face when nobody is named: a clock on the card. */
const ClockFace: React.FC = () => (
  <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-card text-status-pending-icon">
    <Icon icon={Clock01Icon} size="sm" />
  </span>
);
