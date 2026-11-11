"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useCanAccess } from "@/components/auth/useAccess";
import { useEmployeeTimeOffBalancesByUser } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { RequestTimeOffModal } from "@/components/modules/calendar/components/UserTimeOffBalances/RequestTimeOffModal";

type OpenRequest = (() => void) | null;

const RequestContext = createContext<OpenRequest>(null);

/**
 * "Request time off" on Home opens the request dialog where the reader is (`home-widgets` § 2), the one the profile's
 * time-off tab opens — from Time off, from Next time off's empty state and from the AI box's chip. One dialog for the
 * page; `null` while the reader has no balance to request from (the widgets then hide the button).
 */
export const HomeRequestTimeOffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const balances = useEmployeeTimeOffBalancesByUser({ userId: userId ?? "" });
  const policies = useTimeOffPolicies();
  const policyMap = useMemo(() => new Map((policies.data ?? []).map((policy) => [policy.id, policy])), [policies.data]);
  // UX only, like every gate here: the request itself is refused by the backend without the right.
  const mayRequest = useCanAccess("PEOPLE.TIME_OFF", "EDIT");
  const canRequest = mayRequest && Boolean(userId) && (balances.data ?? []).length > 0;
  const openRequest = useCallback(() => setOpen(true), []);

  return (
    <RequestContext.Provider value={canRequest ? openRequest : null}>
      {children}
      {open && userId && (
        <RequestTimeOffModal
          isOpen={open}
          userId={userId}
          balances={balances.data ?? []}
          policyMap={policyMap}
          onCloseAction={() => setOpen(false)}
        />
      )}
    </RequestContext.Provider>
  );
};

/** Opens Home's request dialog; null when there is nothing to request from, or outside Home. */
export const useRequestTimeOff = (): OpenRequest => useContext(RequestContext);
