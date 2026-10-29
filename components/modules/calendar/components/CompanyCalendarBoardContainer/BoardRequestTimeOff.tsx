"use client";

import { FC, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useEmployeeTimeOffBalancesByUser } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { RequestTimeOffModal } from "@/components/modules/calendar/components/UserTimeOffBalances/RequestTimeOffModal";
import {
  COMPANY_CALENDAR_ABSENCES_QUERY_KEY,
  COMPANY_CALENDAR_CAPACITY_QUERY_KEY,
} from "@/components/modules/calendar/hooks/useCompanyCalendar";

export type BoardRequest = { userId: string; name: string; start: string; end: string };

type Props = {
  request: BoardRequest;
  onClose: () => void;
};

/**
 * Requesting leave from the board (sitting 2, C7): for oneself, or — for someone allowed to file leave
 * for others — on a colleague's row. The same request dialog as the profile, opened with the days dragged
 * across. Whether it may be filed for this person is the server's answer, not this component's: a refusal
 * comes back into the dialog like any other.
 */
export const BoardRequestTimeOff: FC<Props> = ({ request, onClose }) => {
  const queryClient = useQueryClient();
  const { data: balances, isLoading, isError, error, refetch } = useEmployeeTimeOffBalancesByUser({
    userId: request.userId,
  });
  const { data: policies } = useTimeOffPolicies();
  const policyMap = useMemo(() => new Map((policies ?? []).map((p) => [p.id, p])), [policies]);

  const close = () => {
    // The new request is a bar on the board and may tip a limit.
    void queryClient.invalidateQueries({ queryKey: [COMPANY_CALENDAR_ABSENCES_QUERY_KEY] });
    void queryClient.invalidateQueries({ queryKey: [COMPANY_CALENDAR_CAPACITY_QUERY_KEY] });
    onClose();
  };

  if (isLoading) return null;

  if (isError || !balances || balances.length === 0) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Time Off</DialogTitle>
            <DialogDescription>
              {isError
                ? `Time off for ${request.name} could not be loaded.`
                : `${request.name} has no time-off policy assigned, so there is nothing to request against.`}
            </DialogDescription>
          </DialogHeader>
          {isError ? <ErrorState compact error={error} onRetry={() => void refetch()} /> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <RequestTimeOffModal
      isOpen
      userId={request.userId}
      balances={balances}
      policyMap={policyMap}
      initialStartDate={request.start}
      initialEndDate={request.end}
      onCloseAction={close}
    />
  );
};
