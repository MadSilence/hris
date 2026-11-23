"use client";

import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { APP_HOME } from "@/lib/companyAddress";
import { REQUEST_PARAM } from "./requestLink";

/** `(id) => the current page with ?leaveRequest=id` — every in-app link to a request (Home's cards, the board's ↗). */
export const useLeaveRequestHref = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return useCallback(
    (requestId: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set(REQUEST_PARAM, requestId);
      return `${pathname ?? APP_HOME}?${params.toString()}`;
    },
    [pathname, searchParams],
  );
};
