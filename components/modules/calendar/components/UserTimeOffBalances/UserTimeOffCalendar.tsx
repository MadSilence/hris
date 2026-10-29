"use client";

import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { FC, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarClock, Plus, ShieldCheck, Wallet } from "lucide-react";

import { useEmployeeTimeOffBalancesByUser } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { Button } from "@/public/desact/src/components/ui/button";
import { Card } from "@/public/desact/src/components/ui/card";
import { RowAction, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { UserCalendarContainer } from "@/components/modules/calendar/components/UserCalendarContainer/UserCalendarContainer";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { RequestTimeOffModal } from "./RequestTimeOffModal";
import { BalancesPreviewModal } from "./BalancesPreviewModal";
import { RequestsPreviewModal } from "./RequestsPreviewModal";
import { AssignTimeOffPolicyModal } from "./AssignTimeOffPolicyModal";

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
        <div className="min-w-0 lg:basis-2/3">
          <UserCalendarContainer
            userId={userId}
            variant="compact"
            toolbar="split"
            onSelectRange={hasBalances ? (start, end) => open(start, end) : undefined}
          />
        </div>

        <Card className="h-fit gap-4 border-brown-100 p-6 lg:basis-1/3">
          <div className="flex items-center gap-2">
            <Button type="button" className="flex-1" onClick={() => open()} disabled={!hasBalances}>
              <Plus className="h-4 w-4" />
              Request Time Off
            </Button>

            {/* Everything else the tab does, in the kebab beside the one primary action. The menu
                always has Requests, so it is never empty. */}
            <RowActionsMenu label="Time Off Actions">
              {/* Without an assignment there is no balance and no way to request — so the people who
                  manage policies get the entry point here, on the person, not only in settings. */}
              <PermissionGate resource="PEOPLE.TIME_OFF_POLICIES" action="EDIT">
                <RowAction icon={<ShieldCheck className="h-4 w-4" />} onClick={() => setAssignOpen(true)}>
                  Assign Policy
                </RowAction>
              </PermissionGate>
              {/* Request history + Cancel: the calendar alone cannot undo a booked absence. */}
              <RowAction icon={<CalendarClock className="h-4 w-4" />} onClick={() => setRequestsOpen(true)}>
                Requests
              </RowAction>
              <RowAction
                icon={<Wallet className="h-4 w-4" />}
                onClick={() => setPreviewOpen(true)}
                disabled={!hasBalances}
              >
                Balances
              </RowAction>
            </RowActionsMenu>
          </div>

          <p className="text-sm text-muted-foreground">
            {hasBalances
              ? "Click a day on the calendar, or drag across several, to request time off for them."
              : "No time-off policy is assigned yet, so there is nothing to request against."}
          </p>
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
