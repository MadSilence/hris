"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { formatDisplayDate } from "@/lib/date";
import { formatDayAmount, type TimeOffDecisionContext, type TimeOffRequest } from "@/models/timeOff";
import { useTimeOffRequestsAwaitingMe } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsAwaitingMe";
import { timeOffDecisionQueryKey } from "@/components/modules/timeOffDecision";
import { NEEDS_ACTION_INBOX_HREF } from "@/components/modules/notifications/utils/inboxFilters";
import { HomeCard, HomeCardLink, HomeRowsSkeleton } from "@/components/modules/home/components/HomeCard";

/** The newest five (sitting 2, H5); the rest are in the inbox under *Needs Action*. */
export const WAITING_ON_YOU_LIMIT = 5;

const dates = (r: TimeOffRequest) =>
  r.startDate === r.endDate
    ? formatDisplayDate(r.startDate, { style: "medium" })
    : `${formatDisplayDate(r.startDate, { style: "medium" })} – ${formatDisplayDate(r.endDate, { style: "medium" })}`;

/**
 * Who asked. The awaiting-me list carries ids only, and an approver may hold no role over the requester — so
 * the name comes from the request's own decision context, the read the decision page makes for exactly that
 * reader. It shares that page's cache key, so opening the request afterwards is instant.
 */
const RequesterName: React.FC<{ requestId: string }> = ({ requestId }) => {
  const { internalApiClient } = useAppDataContext();
  const context = useQuery<TimeOffDecisionContext>({
    queryKey: timeOffDecisionQueryKey(requestId),
    queryFn: () => internalApiClient.get<TimeOffDecisionContext>(`/time-off/requests/${requestId}/decision-context`),
    staleTime: 30_000,
  });
  if (context.isLoading) return <Skeleton className="inline-block h-3.5 w-24 align-middle" />;
  return <>{context.data?.requesterName ?? "A request"}</>;
};

/**
 * Leave requests and cancellations waiting for the reader's decision, newest first. Hidden when nothing
 * waits: a "nothing to decide" card on every employee's home is noise (HOME_AND_SEARCH_DESIGN.md § 4).
 */
export const WaitingOnYouWidget: React.FC = () => {
  const query = useTimeOffRequestsAwaitingMe();

  if (query.isLoading) {
    return (
      <HomeCard title="Waiting on You">
        <HomeRowsSkeleton rows={2} avatar={false} />
      </HomeCard>
    );
  }
  if (query.error || !query.data) {
    return (
      <HomeCard title="Waiting on You">
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
      </HomeCard>
    );
  }
  if (query.data.length === 0) return null;

  const newest = [...query.data]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, WAITING_ON_YOU_LIMIT);

  return (
    <HomeCard
      title="Waiting on You"
      action={<HomeCardLink href={NEEDS_ACTION_INBOX_HREF}>See All ({query.data.length})</HomeCardLink>}
    >
      <ul className="flex flex-col gap-1">
        {newest.map((request) => (
          <li key={request.id}>
            <Link href={`/time-off/requests/${request.id}`} className="-mx-2 flex flex-col rounded-md px-2 py-1.5 hover:bg-brown-50">
              <span className="truncate text-sm font-medium text-brown-900">
                <RequesterName requestId={request.id} />
                <span className="font-normal text-muted-foreground">
                  {request.status === "CANCELLATION_PENDING" ? " asks to cancel time off" : " requests time off"}
                </span>
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {dates(request)} · {formatDayAmount(request.requestedAmount)} {request.requestedAmount === 1 ? "day" : "days"}
                {request.awaitingOnBehalfOfName ? ` · for ${request.awaitingOnBehalfOfName}` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </HomeCard>
  );
};
