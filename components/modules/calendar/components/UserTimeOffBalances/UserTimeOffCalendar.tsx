"use client";

import { Skeleton } from "@/components/desact/skeleton";
import { FC, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { useEmployeeTimeOffBalancesByUser } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { Button } from "@/components/desact/button";
import { Card } from "@/components/desact/card";
import { UserCalendarContainer } from "@/components/modules/calendar/components/UserCalendarContainer/UserCalendarContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { RequestTimeOffModal } from "./RequestTimeOffModal";
import { BalancesPreviewModal } from "./BalancesPreviewModal";
import { RequestsPreviewModal } from "./RequestsPreviewModal";
import { AssignTimeOffPolicyModal } from "./AssignTimeOffPolicyModal";
import { TimeOffSidePanel } from "./TimeOffSidePanel";

type Props = { userId: string };

type ModalState = { open: boolean; start?: string; end?: string };

/**
 * The person's time-off calendar plus its request flow. Owns the balances/policies data and the
 * request modal so the SAME modal can be opened two ways: the side panel's button (no preset) or a
 * click/drag on the calendar (which presets the request's start/end to the picked day-range).
 */
export const UserTimeOffCalendar: FC<Props> = ({ userId }) => {
  const { data: balances, isLoading: balancesLoading } =
    useEmployeeTimeOffBalancesByUser({ userId });
  const { data: policies, isLoading: policiesLoading } = useTimeOffPolicies();

  const [modal, setModal] = useState<ModalState>({ open: false });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const policyMap = useMemo(
    () => new Map((policies ?? []).map((p) => [p.id, p])),
    [policies],
  );

  const hasBalances = Boolean(balances && balances.length > 0);

  const open = (start?: string, end?: string) => setModal({ open: true, start, end });
  const close = () => setModal({ open: false });

  // `?request=1` opens the request modal on arrival — the entry point a link or a redirect uses,
  // since the modal needs this person's balances and therefore lives on this tab.
  const searchParams = useSearchParams();
  const requestedFromHeader = searchParams.get("request") === "1";

  useEffect(() => {
    if (requestedFromHeader && hasBalances) setModal({ open: true });
  }, [requestedFromHeader, hasBalances]);

  // The tab rendered nothing at all while these were in flight, so it flashed "no policies" at
  // somebody who has several — the same shape the shared Skeleton solves in thirteen other modules.
  if (balancesLoading || policiesLoading) {
    return (
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="space-y-3 lg:basis-2/3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <Skeleton className="h-40 lg:basis-1/3" />
      </div>
    );
  }

  // Laid out like the Attendance tab: the month on the left, a stepper above it and seven columns
  // in it, and the tab's actions in a side panel on the right.
  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 lg:flex-1">
          <UserCalendarContainer
            userId={userId}
            variant="compact"
            toolbar="split"
            onSelectRange={hasBalances ? (start, end) => open(start, end) : undefined}
          />
        </div>

        <Card className="h-fit gap-6 border-divider p-5 lg:w-[340px] lg:shrink-0">
          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => open()} disabled={!hasBalances}>
              <Icon icon={Add01Icon} size="sm" />
              Request time off
            </Button>
            {/* Without an assignment there is no balance and no way to request — so the people who
                manage policies get the entry point here, on the person, not only in settings. */}
            <PermissionGate resource="PEOPLE.TIME_OFF_POLICIES" action="EDIT">
              <Button type="button" variant="secondary" onClick={() => setAssignOpen(true)}>
                Assign policy
              </Button>
            </PermissionGate>

          </div>

          {hasBalances && balances ? (
            <TimeOffSidePanel userId={userId} balances={balances} policyMap={policyMap} />
          ) : (
            <p className="text-body text-tertiary">No time off policy is assigned yet.</p>
          )}

          {/* The history and the ledger, as links under the panel: a kebab beside the two buttons did not fit
              the 340 px panel and pushed the page sideways (walk of 2026-11-04). Requests carry Cancel too. */}
          <div className="flex items-center gap-4 border-t border-divider pt-3">
            <Button type="button" variant="link" size="sm" onClick={() => setRequestsOpen(true)}>
              All requests
            </Button>
            {hasBalances && (
              <Button type="button" variant="link" size="sm" onClick={() => setPreviewOpen(true)}>
                Balance history
              </Button>
            )}
          </div>
        </Card>
      </div>

      {modal.open && balances && (
        <RequestTimeOffModal
          isOpen={modal.open}
          userId={userId}
          balances={balances}
          policyMap={policyMap}
          initialStartDate={modal.start}
          initialEndDate={modal.end}
          onCloseAction={close}
        />
      )}

      {previewOpen && balances && (
        <BalancesPreviewModal
          isOpen={previewOpen}
          userId={userId}
          balances={balances}
          policyMap={policyMap}
          onCloseAction={() => setPreviewOpen(false)}
        />
      )}

      {assignOpen && (
        <AssignTimeOffPolicyModal
          isOpen={assignOpen}
          userId={userId}
          policies={policies ?? []}
          balances={balances ?? []}
          onCloseAction={() => setAssignOpen(false)}
        />
      )}

      {requestsOpen && (
        <RequestsPreviewModal
          isOpen={requestsOpen}
          userId={userId}
          onCloseAction={() => setRequestsOpen(false)}
        />
      )}
    </>
  );
};

export default UserTimeOffCalendar;
