"use client";

import { FC, useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { cn } from "@/public/desact/src/components/ui/utils";
import type { Notification } from "@/models/notifications";
import type { PublicHolidayDriftApplyResult } from "@/api/modules/publicHolidays/calendars/dto";
import {
  useApplyPublicHolidayDrift,
  useDismissPublicHolidayDrift,
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayDrift";
import { useInvalidateNotifications } from "@/components/modules/notifications/hooks/useNotifications";
import { useMarkNotificationRead } from "@/components/modules/notifications/hooks/useNotificationMutations";
import { formatDisplayDate } from "@/lib/date";
import { showError } from "@/lib/errors/errorToast";

/** One change, as the backend projects it (`PublicHolidayDriftImpactService`). */
type DriftChange = {
  kind: "ADDED" | "CHANGED" | "MOVED" | "REMOVED";
  name: string | null;
  previousName: string | null;
  start: string | null;
  end: string | null;
  previousStart: string | null;
  previousEnd: string | null;
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
  changes: DriftChange[];
  changeCount: number;
  peopleOnCalendar: number;
  affectedRequests: AffectedRequest[];
  affectedRequestCount: number;
};

const OUTCOMES: Record<string, { label: string; className: string }> = {
  APPLIED: { label: "Applied", className: "text-success-700" },
  DISMISSED: { label: "Dismissed", className: "text-brown-500" },
  SUPERSEDED: { label: "Replaced by a newer check of the source", className: "text-brown-500" },
};

const REQUEST_STATUS: Record<string, string> = {
  PENDING: "pending",
  APPROVED: "approved",
  CANCELLATION_PENDING: "cancellation asked",
};

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
const asNumber = (value: unknown): number => (typeof value === "number" ? value : 0);

/** The projection's `details`, read defensively: it is untyped on the wire. */
export const readDriftDetails = (details: Record<string, unknown> | null): DriftDetails => ({
  changes: asArray<DriftChange>(details?.changes),
  changeCount: asNumber(details?.changeCount),
  peopleOnCalendar: asNumber(details?.peopleOnCalendar),
  affectedRequests: asArray<AffectedRequest>(details?.affectedRequests),
  affectedRequestCount: asNumber(details?.affectedRequestCount),
});

const day = (iso: string | null) => formatDisplayDate(iso, { style: "medium", hideYear: true });

const span = (start: string | null, end: string | null) =>
  !end || end === start ? day(start) : `${day(start)} – ${day(end)}`;

/** One line per change, in words a calendar manager would use. */
export const describeDriftChange = (change: DriftChange): string => {
  switch (change.kind) {
    case "ADDED":
      return `New: ${change.name ?? ""}, ${span(change.start, change.end)}`;
    case "REMOVED":
      return `No longer a holiday: ${change.name ?? change.previousName ?? ""}, ${span(change.previousStart, change.previousEnd)}`;
    case "MOVED":
      return `Moved: ${change.name ?? ""}, ${span(change.previousStart, change.previousEnd)} → ${span(change.start, change.end)}`;
    case "CHANGED": {
      const renamed = change.previousName && change.name && change.previousName !== change.name;
      const redated = change.previousStart !== change.start || change.previousEnd !== change.end;
      if (renamed && !redated) return `Renamed: ${change.previousName} → ${change.name}`;
      return `Changed: ${change.name ?? ""}, ${span(change.previousStart, change.previousEnd)} → ${span(change.start, change.end)}`;
    }
    default:
      return change.name ?? "";
  }
};

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

const resultSummary = (result: PublicHolidayDriftApplyResult): string => {
  const parts = [`${plural(result.applied, "change", "changes")} applied`];
  if (result.recalculatedRequests > 0) {
    parts.push(`${plural(result.recalculatedRequests, "leave request", "leave requests")} recalculated`);
  }
  if (result.skipped.length > 0) {
    parts.push(`${plural(result.skipped.length, "change", "changes")} skipped because the day was edited or is taken`);
  }
  if (result.requestsLeftUnchanged > 0) {
    parts.push(
      `${plural(result.requestsLeftUnchanged, "request", "requests")} now fall entirely on holidays and were left for you to review`
    );
  }
  return `${parts.join(", ")}.`;
};

/**
 * The drift question in the inbox: what the provider changed, whose leave it touches, and Apply or
 * Dismiss. Every calendar manager holds a copy of the same question, so whoever answers first closes all
 * of them — the next read of anybody's inbox shows the outcome instead of the buttons.
 */
export const PublicHolidayDriftActions: FC<{ notification: Notification }> = ({ notification }) => {
  const invalidateNotifications = useInvalidateNotifications();
  const markRead = useMarkNotificationRead();
  const apply = useApplyPublicHolidayDrift();
  const dismiss = useDismissPublicHolidayDrift();
  const [applied, setApplied] = useState<PublicHolidayDriftApplyResult | null>(null);

  const source = notification.source;
  if (!source) return null;

  if (!source.open) {
    const outcome = OUTCOMES[source.status ?? ""];
    return (
      <div className="mt-2 flex flex-col gap-1">
        {outcome && <p className={cn("text-xs font-medium", outcome.className)}>{outcome.label}</p>}
        {applied && <p className="text-xs text-brown-500">{resultSummary(applied)}</p>}
      </div>
    );
  }

  const details = readDriftDetails(source.details);
  const busy = apply.isPending || dismiss.isPending;
  const hiddenRequests = details.affectedRequestCount - details.affectedRequests.length;
  const moreChanges = details.changeCount - details.changes.length;

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

  return (
    <div className="mt-3 flex flex-col gap-2 text-xs text-brown-700" onClick={(e) => e.stopPropagation()}>
      {details.changes.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {details.changes.map((change, index) => (
            <li key={`${change.kind}-${change.name ?? change.previousName}-${index}`}>{describeDriftChange(change)}</li>
          ))}
          {moreChanges > 0 && <li className="text-brown-500">and {plural(moreChanges, "more change", "more changes")}</li>}
        </ul>
      )}

      <p>
        {plural(details.peopleOnCalendar, "person observes", "people observe")} this calendar.{" "}
        {details.affectedRequestCount === 0
          ? "No leave touches the changed days."
          : `${plural(details.affectedRequestCount, "leave request touches", "leave requests touch")} the changed days and will be recalculated:`}
      </p>

      {details.affectedRequests.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {details.affectedRequests.map((request) => (
            <li key={request.requestId}>
              {request.personName || "Someone"} · {span(request.startDate, request.endDate)} ·{" "}
              {REQUEST_STATUS[request.status] ?? request.status.toLowerCase()}
            </li>
          ))}
        </ul>
      )}
      {hiddenRequests > 0 && (
        <p className="text-brown-500">
          and {plural(hiddenRequests, "request", "requests")} by people whose leave you cannot see
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={busy}
          onClick={() =>
            run(async () => {
              const result = await apply.mutateAsync({ driftId: source.id });
              if (result) setApplied(result);
            })
          }
        >
          <Check className="h-4 w-4" />
          Apply Changes
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => run(() => dismiss.mutateAsync({ driftId: source.id }))}
        >
          <X className="h-4 w-4" />
          Dismiss
        </Button>
      </div>
    </div>
  );
};

export default PublicHolidayDriftActions;
