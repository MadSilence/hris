"use client";

import { FC } from "react";
import Link from "next/link";
import { NEEDS_ACTION_INBOX_HREF } from "@/components/modules/notifications/utils/inboxFilters";
import { useTimeOffRequestsAwaitingMe } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsAwaitingMe";


/**
 * "N requests are waiting for your approval", above the board (sitting 2, C7). The bars themselves carry
 * *Pending your approval*; this line is for the requests outside the window or the rows on screen. It says
 * nothing when nothing waits, and a failed read is silent — it is a pointer, not part of the board.
 */
export const AwaitingApprovalLine: FC = () => {
  const { data } = useTimeOffRequestsAwaitingMe();
  const count = data?.length ?? 0;
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-sm text-brown-800">
      <span className="h-2 w-2 shrink-0 rounded-full bg-warning-500" aria-hidden />
      <span className="flex-1">
        {count === 1 ? "1 request is" : `${count} requests are`} waiting for your approval
      </span>
      <Link href={NEEDS_ACTION_INBOX_HREF} className="font-medium text-brown-900 underline-offset-2 hover:underline">
        Review
      </Link>
    </div>
  );
};
