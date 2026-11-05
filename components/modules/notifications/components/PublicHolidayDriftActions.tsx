"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Cancel01Icon, PencilEdit02Icon, Shield01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { cn } from "@/lib/cn";
import type { Notification } from "@/models/notifications";
import type { PublicHolidayDriftApplyResult } from "@/api/modules/publicHolidays/calendars/dto";
import {
  useApplyPublicHolidayDrift,
  useDismissPublicHolidayDrift,
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayDrift";
import { useInvalidateNotifications } from "@/components/modules/notifications/hooks/useNotifications";
import { useMarkNotificationRead } from "@/components/modules/notifications/hooks/useNotificationMutations";
import { formatDisplayDate, useDisplayLanguage } from "@/lib/date";
import { showError } from "@/lib/errors/errorToast";
import type { NotificationsTranslator } from "@/components/modules/notifications/components/notificationPresenter";

/**
 * One change, as the backend projects it (`PublicHolidayDriftImpactService`). On a conflict the
 * `previous…` fields are the company's day as it stands and the others what the provider says now.
 */
type DriftChange = {
  kind: "ADDED" | "CHANGED" | "MOVED" | "REMOVED";
  name: string | null;
  previousName: string | null;
  start: string | null;
  end: string | null;
  previousStart: string | null;
  previousEnd: string | null;
  conflict?: boolean;
};

/** A live leave request covering a day the change moves — listed only when the reader may see it. */
type AffectedRequest = {
  requestId: string;
  personName: string;
  startDate: string;
  endDate: string;
  status: string;
};

type DriftDetails = {
  /** `CONFLICT`: the provider changed days the company overrode. */
  kind: "ORDINARY" | "CONFLICT";
  changes: DriftChange[];
  changeCount: number;
  peopleOnCalendar: number;
  affectedRequests: AffectedRequest[];
  affectedRequestCount: number;
};

type Outcome = {
  labelKey:
    | "drift.outcomes.applied"
    | "drift.outcomes.dismissed"
    | "drift.outcomes.superseded"
    | "drift.outcomes.conflictApplied"
    | "drift.outcomes.conflictDismissed";
  className: string;
};

const OUTCOMES: Record<string, Outcome> = {
  APPLIED: { labelKey: "drift.outcomes.applied", className: "text-status-approved-text" },
  DISMISSED: { labelKey: "drift.outcomes.dismissed", className: "text-tertiary" },
  SUPERSEDED: { labelKey: "drift.outcomes.superseded", className: "text-tertiary" },
};

/** The same statuses, read as the answers to a conflict. */
const CONFLICT_OUTCOMES: Record<string, Outcome> = {
  APPLIED: { labelKey: "drift.outcomes.conflictApplied", className: "text-status-approved-text" },
  DISMISSED: { labelKey: "drift.outcomes.conflictDismissed", className: "text-tertiary" },
  SUPERSEDED: OUTCOMES.SUPERSEDED,
};

const REQUEST_STATUS = {
  PENDING: "drift.requestStatus.PENDING",
  APPROVED: "drift.requestStatus.APPROVED",
  CANCELLATION_PENDING: "drift.requestStatus.CANCELLATION_PENDING",
} as const;

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
const asNumber = (value: unknown): number => (typeof value === "number" ? value : 0);

/** The projection's `details`, read defensively: it is untyped on the wire. */
export const readDriftDetails = (details: Record<string, unknown> | null): DriftDetails => ({
  kind: details?.kind === "CONFLICT" ? "CONFLICT" : "ORDINARY",
  changes: asArray<DriftChange>(details?.changes),
  changeCount: asNumber(details?.changeCount),
  peopleOnCalendar: asNumber(details?.peopleOnCalendar),
  affectedRequests: asArray<AffectedRequest>(details?.affectedRequests),
  affectedRequestCount: asNumber(details?.affectedRequestCount),
});

/** A conflict is the same notification asking another question; either half of it can say so. */
export const isConflictDrift = (notification: Notification): boolean =>
  notification.params?.conflict === true ||
  notification.params?.conflict === "true" ||
  notification.source?.details?.kind === "CONFLICT";

const day = (iso: string | null, language?: string) => formatDisplayDate(iso, { style: "medium", hideYear: true, language });

const span = (start: string | null, end: string | null, language?: string) =>
  !end || end === start ? day(start, language) : `${day(start, language)} – ${day(end, language)}`;

/** One line per change, in words a calendar manager would use. */
export const describeDriftChange = (change: DriftChange, t: NotificationsTranslator, language?: string): string => {
  switch (change.kind) {
    case "ADDED":
      return t("drift.change.added", { name: change.name ?? "", span: span(change.start, change.end, language) });
    case "REMOVED":
      return t("drift.change.removed", {
        name: change.name ?? change.previousName ?? "",
        span: span(change.previousStart, change.previousEnd, language),
      });
    case "MOVED":
      return t("drift.change.moved", {
        name: change.name ?? "",
        from: span(change.previousStart, change.previousEnd, language),
        to: span(change.start, change.end, language),
      });
    case "CHANGED": {
      const renamed = change.previousName && change.name && change.previousName !== change.name;
      const redated = change.previousStart !== change.start || change.previousEnd !== change.end;
      if (renamed && !redated) return t("drift.change.renamed", { previous: change.previousName ?? "", name: change.name ?? "" });
      return t("drift.change.changed", {
        name: change.name ?? "",
        from: span(change.previousStart, change.previousEnd, language),
        to: span(change.start, change.end, language),
      });
    }
    default:
      return change.name ?? "";
  }
};

/** "The source now says X; yours says Y" — a conflict, one line per day. */
export const describeConflict = (change: DriftChange, t: NotificationsTranslator, language?: string): string => {
  const theirs = change.start
    ? t("drift.conflict.day", { name: change.name ?? "", span: span(change.start, change.end, language) })
    : t("drift.conflict.noHoliday");
  const ours = change.previousStart
    ? t("drift.conflict.day", { name: change.previousName ?? "", span: span(change.previousStart, change.previousEnd, language) })
    : t("drift.conflict.removedByYou");
  return t("drift.conflict.line", { theirs, ours });
};

/** What applying did, one clause per kind of outcome (a list, so the clauses are joined with commas). */
const resultSummary = (result: PublicHolidayDriftApplyResult, t: NotificationsTranslator): string => {
  const parts = [t("drift.result.applied", { count: result.applied })];
  if (result.recalculatedRequests > 0) {
    parts.push(t("drift.result.recalculated", { count: result.recalculatedRequests }));
  }
  if (result.skipped.length > 0) {
    parts.push(t("drift.result.skipped", { count: result.skipped.length }));
  }
  if (result.requestsLeftUnchanged > 0) {
    parts.push(t("drift.result.leftUnchanged", { count: result.requestsLeftUnchanged }));
  }
  return t("drift.result.sentence", { parts: parts.join(", ") });
};

/**
 * The drift question in the inbox: what the provider changed, whose leave it touches, and the answer.
 *
 * An ordinary drift — days nobody overrode — is Apply or Dismiss; dismissing keeps the day as it is, as
 * an override. A conflict — the provider changed days the company overrode — is Keep Ours, Take Theirs
 * or Edit, and blocks nothing: the company's version stays in force until somebody takes the source's.
 *
 * Every calendar manager holds a copy of the same question, so whoever answers first closes all of
 * them — the next read of anybody's inbox shows the outcome instead of the buttons.
 */
export const PublicHolidayDriftActions: FC<{ notification: Notification }> = ({ notification }) => {
  const t = useTranslations("notifications");
  const language = useDisplayLanguage();
  const tCommon = useTranslations("common");
  const invalidateNotifications = useInvalidateNotifications();
  const markRead = useMarkNotificationRead();
  const apply = useApplyPublicHolidayDrift();
  const dismiss = useDismissPublicHolidayDrift();
  const [applied, setApplied] = useState<PublicHolidayDriftApplyResult | null>(null);

  const source = notification.source;
  if (!source) return null;

  const conflict = isConflictDrift(notification);

  if (!source.open) {
    const outcome = (conflict ? CONFLICT_OUTCOMES : OUTCOMES)[source.status ?? ""];
    return (
      <div className="mt-2 flex flex-col gap-1">
        {outcome && <p className={cn("text-hint font-medium", outcome.className)}>{t(outcome.labelKey)}</p>}
        {applied && <p className="text-hint text-tertiary">{resultSummary(applied, t)}</p>}
      </div>
    );
  }

  const details = readDriftDetails(source.details);
  const busy = apply.isPending || dismiss.isPending;
  const hiddenRequests = details.affectedRequestCount - details.affectedRequests.length;
  const moreChanges = details.changeCount - details.changes.length;
  const calendarHref = notification.targetId ? `/settings/time/public-holidays/${notification.targetId}` : null;

  const answered = () => {
    invalidateNotifications();
    if (!notification.read) markRead.mutate(notification.id);
  };

  const run = async (act: () => Promise<unknown>) => {
    try {
      await act();
      answered();
    } catch (error) {
      showError(error);
      // Nearly always: somebody else answered first, or a newer check replaced this one. Re-reading the
      // inbox shows what happened instead of leaving the buttons up to be refused again.
      invalidateNotifications();
    }
  };

  const applyDrift = () =>
    run(async () => {
      const result = await apply.mutateAsync({ driftId: source.id });
      if (result) setApplied(result);
    });
  const dismissDrift = () => run(() => dismiss.mutateAsync({ driftId: source.id }));

  const leaveLine =
    details.affectedRequestCount === 0
      ? t("drift.noLeave")
      : conflict
        ? t("drift.leaveConflict", { count: details.affectedRequestCount })
        : t("drift.leaveOrdinary", { count: details.affectedRequestCount });

  return (
    <div className="mt-3 flex flex-col gap-2 text-hint text-secondary" onClick={(e) => e.stopPropagation()}>
      {details.changes.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {details.changes.map((change, index) => (
            <li key={`${change.kind}-${change.name ?? change.previousName}-${index}`}>
              {conflict ? describeConflict(change, t, language) : describeDriftChange(change, t, language)}
            </li>
          ))}
          {moreChanges > 0 && <li className="text-tertiary">{t("drift.moreChanges", { count: moreChanges })}</li>}
        </ul>
      )}

      {conflict && (
        <p className="text-tertiary">{t("drift.conflict.staysInForce")}</p>
      )}

      <p>{t("drift.observers", { count: details.peopleOnCalendar, leaveLine })}</p>

      {details.affectedRequests.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {details.affectedRequests.map((request) => (
            <li key={request.requestId}>
              {request.personName || t("drift.someone")} · {span(request.startDate, request.endDate, language)} ·{" "}
              {request.status in REQUEST_STATUS
                ? t(REQUEST_STATUS[request.status as keyof typeof REQUEST_STATUS])
                : request.status.toLowerCase()}
            </li>
          ))}
        </ul>
      )}
      {hiddenRequests > 0 && (
        <p className="text-tertiary">
          {t("drift.hiddenRequests", { count: hiddenRequests })}
        </p>
      )}

      {conflict ? (
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" disabled={busy} onClick={dismissDrift}>
            <Icon icon={Shield01Icon} size="sm" />
            {t("drift.keepOurs")}
          </Button>
          <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={applyDrift}>
            <Icon icon={Tick02Icon} size="sm" />
            {t("drift.takeTheirs")}
          </Button>
          {calendarHref && (
            <Button size="sm" variant="ghost" asChild>
              <Link href={calendarHref}>
                <Icon icon={PencilEdit02Icon} size="sm" />
                {tCommon("actions.edit")}
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" disabled={busy} onClick={applyDrift}>
            <Icon icon={Tick02Icon} size="sm" />
            {t("drift.applyChanges")}
          </Button>
          <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={dismissDrift}>
            <Icon icon={Cancel01Icon} size="sm" />
            {t("drift.dismiss")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PublicHolidayDriftActions;
