"use client";

import { FC, useMemo, useState } from "react";
import { CalendarClock, Plus, Wallet } from "lucide-react";

import { useEmployeeTimeOffBalancesByUser } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { Button } from "@/public/desact/src/components/ui/button";
import { UserCalendarContainer } from "@/components/modules/calendar/components/UserCalendarContainer/UserCalendarContainer";
import { RequestTimeOffModal } from "./RequestTimeOffModal";
import { BalancesPreviewModal } from "./BalancesPreviewModal";
import { RequestsPreviewModal } from "./RequestsPreviewModal";

type Props = { userId: string };

type ModalState = { open: boolean; start?: string; end?: string };

/**
 * The person's time-off calendar plus its request flow. Owns the balances/policies data and the
 * request modal so the SAME modal can be opened two ways: the toolbar button (no preset) or a
 * click/drag on the calendar (which presets the request's start/end to the picked day-range).
 */
export const UserTimeOffCalendar: FC<Props> = ({ userId }) => {
  const { data: balances } = useEmployeeTimeOffBalancesByUser({ userId });
  const { data: policies } = useTimeOffPolicies();

  const [modal, setModal] = useState<ModalState>({ open: false });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);

  const policyMap = useMemo(
    () => new Map((policies ?? []).map((p) => [p.id, p])),
    [policies],
  );

  const hasBalances = Boolean(balances && balances.length > 0);

  const open = (start?: string, end?: string) => setModal({ open: true, start, end });
  const close = () => setModal({ open: false });

  return (
    <>
      <UserCalendarContainer
        userId={userId}
        variant="compact"
        onSelectRange={hasBalances ? (start, end) => open(start, end) : undefined}
        headerAction={
          <>
            {/* Request history + Cancel: the calendar alone cannot undo a booked absence. */}
            <Button variant="outline" size="sm" onClick={() => setRequestsOpen(true)}>
              <CalendarClock className="h-4 w-4" />
              Requests
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              disabled={!hasBalances}
            >
              <Wallet className="h-4 w-4" />
              Balances
            </Button>
            <Button size="sm" onClick={() => open()} disabled={!hasBalances}>
              <Plus className="h-4 w-4" />
              Request time off
            </Button>
          </>
        }
      />

      {modal.open && balances && (
        <RequestTimeOffModal
          isOpen={modal.open}
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
