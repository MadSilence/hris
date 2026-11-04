"use client";

import { FC } from "react";
import Link from "next/link";
import { NEEDS_ACTION_INBOX_HREF } from "@/components/modules/notifications/utils/inboxFilters";
import { useTimeOffRequestsAwaitingMe } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsAwaitingMe";
import { Banner } from "@/components/desact/alert";
import { HourglassIcon } from "@hugeicons/core-free-icons";


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
    // The state of the page, so a neutral banner (SPEC § 13.7): what waits for a decision is the Approve
    // button's to show, not an amber box.
    <Banner
      icon={HourglassIcon}
      action={
        <Link href={NEEDS_ACTION_INBOX_HREF} className="font-medium text-accent-text underline-offset-4 hover:underline">
          Review
        </Link>
      }
    >
      <span className="text-primary">
        {count === 1 ? "1 request is" : `${count} requests are`} waiting for your approval
      </span>
    </Banner>
  );
};
