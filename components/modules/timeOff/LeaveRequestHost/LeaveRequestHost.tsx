"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { COMPANY_CALENDAR_ABSENCES_QUERY_KEY } from "@/components/modules/calendar/hooks/useCompanyCalendar";
import { LeaveRequestDialog } from "@/components/modules/timeOff/LeaveRequestDialog";
import { REQUEST_PARAM } from "@/components/modules/timeOff/lib/requestLink";

/**
 * **The request in full over any page** (AQ-12 b): a page with `?leaveRequest={id}` shows that request (Q30) on top of
 * itself; closing it takes the parameter off and leaves the page as it was. Every link to a request goes through here
 * — Home's cards, the inbox, an email's button (Home with it open), the company calendar's ↗ — so there is no request
 * page. Mounted once, in the app shell.
 */
const Host: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const requestId = searchParams?.get(REQUEST_PARAM) || null;

  const close = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete(REQUEST_PARAM);
    const rest = params.toString();
    router.replace(rest ? `${pathname}?${rest}` : (pathname ?? "/"), { scroll: false });
    // What the request was answered from may show it: the board's bars and cards.
    void queryClient.invalidateQueries({ queryKey: [COMPANY_CALENDAR_ABSENCES_QUERY_KEY] });
  };

  return <LeaveRequestDialog requestId={requestId} onClose={close} />;
};

/** `useSearchParams` needs a Suspense boundary of its own, or it takes the whole shell into client rendering. */
export const LeaveRequestHost: React.FC = () => (
  <React.Suspense fallback={null}>
    <Host />
  </React.Suspense>
);
