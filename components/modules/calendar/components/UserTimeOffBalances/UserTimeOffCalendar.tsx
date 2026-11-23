"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Illustration } from "@/components/illustrations";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { useUser } from "@/components/hooks/useUser/useUser";
import { dateToISO } from "@/lib/date";

import { useEmployeeTimeOffBalancesByUser } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/hooks/useEmployeeTimeOffBalancesByUser";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { useTimeOffRequestsByUser } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useTimeOffRequestsAwaitingMe } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsAwaitingMe";
import { useUserPublicHolidays } from "@/components/modules/calendar/hooks/useUserPublicHolidays";
import { expandSpanToDays, nonWorkingDayTest } from "@/components/modules/calendar/lib/dateRange";
import { DeclineLeaveDialog, LeaveRequestDialog } from "@/components/modules/timeOff";
import { RequestTimeOffModal } from "./RequestTimeOffModal";
import { AssignTimeOffPolicyModal } from "./AssignTimeOffPolicyModal";
import { TimeOffSidePanel } from "./TimeOffSidePanel";
import { TimeOffMonth } from "./TimeOffMonth";
import { BalanceHistoryDialog } from "./BalanceHistoryDialog";
import { AllRequestsDialog } from "./AllRequestsDialog";

type Props = { userId: string };

type RequestState = { open: boolean; start?: string; end?: string };
type Opened = { id: string; fromAll?: boolean } | null;

/**
 * **The person profile's Time off tab** (`hris/design/screens/profile-time-off`, Q01–Q32, built 2026-11-20): a grid of
 * 340 and the rest — the time off card on the left, the person's month on the right with no frame.
 *
 * The card: **Request time off** (never disabled; with no policy the card is the empty state instead, Q08), the
 * balances — each opening its history (Q20) — what is coming up, **All requests ›**; under it **+ Assign policy** for
 * whoever may assign, never on one's own view (Q11). The month: leave as pills with their card, days picked by click
 * or drag straight into the request window (Q12). A request opens in full (Q30) from the card's ↗, Upcoming, and All
 * requests. Loading draws the month at once and the balances as shapes (Q09); a month that cannot load says so in its
 * place (Q10).
 */
export const UserTimeOffCalendar: FC<Props> = ({ userId }) => {
  const t = useTranslations("leave");
  const balancesQuery = useEmployeeTimeOffBalancesByUser({ userId });
  const { data: policies, isLoading: policiesLoading } = useTimeOffPolicies();
  const requestsQuery = useTimeOffRequestsByUser({ userId, year: null, status: null });
  const { data: awaiting } = useTimeOffRequestsAwaitingMe();
  const holidaysQuery = useUserPublicHolidays({ userId });
  const { data: person } = useUser(userId);
  const { userId: me } = useCurrentUser();
  const { company } = useCompanyData();
  const canAdjust = useCanAccess("PEOPLE.TIME_OFF", "MANAGE");
  const own = me === userId;
  const firstName = own ? null : person?.firstName ?? null;
  const todayISO = useMemo(() => dateToISO(new Date()), []);

  const balances = balancesQuery.data;
  const requests = useMemo(() => requestsQuery.data ?? [], [requestsQuery.data]);
  const policyMap = useMemo(() => new Map((policies ?? []).map((p) => [p.id, p])), [policies]);
  const isNonWorking = useMemo(() => nonWorkingDayTest(company?.workingDays), [company?.workingDays]);
  const holidays = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const h of holidaysQuery.data ?? []) {
      for (const iso of expandSpanToDays(h.holidayDate, h.endDate)) map.set(iso, [...(map.get(iso) ?? []), h.name]);
    }
    return map;
  }, [holidaysQuery.data]);
  const awaitingIds = useMemo(() => new Set((awaiting ?? []).map((r) => r.id)), [awaiting]);

  const loadingCard = balancesQuery.isLoading || policiesLoading;
  const hasBalances = Boolean(balances && balances.length > 0);

  const [request, setRequest] = useState<RequestState>({ open: false });
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [opened, setOpened] = useState<Opened>(null);
  const [declining, setDeclining] = useState<string | null>(null);
  const declined = declining ? requests.find((r) => r.id === declining) : undefined;

  // `?request=1` opens the request window on arrival — the entry point a link or a redirect uses.
  const searchParams = useSearchParams();
  const requestedFromLink = searchParams.get("request") === "1";
  useEffect(() => {
    if (requestedFromLink && hasBalances) setRequest({ open: true });
  }, [requestedFromLink, hasBalances]);

  const historyBalances = historyFor ? (balances ?? []).filter((b) => b.policyId === historyFor) : [];
  // What Adjust changes: the period running today, failing that the latest.
  const historyCurrent =
    historyBalances.find((b) => b.periodStart <= todayISO && (b.periodEnd === null || b.periodEnd >= todayISO))
    ?? [...historyBalances].sort((a, b) => b.periodStart.localeCompare(a.periodStart))[0];

  const monthError = requestsQuery.error ?? holidaysQuery.error;

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3.5 rounded-card border border-divider bg-card p-5">
            {!loadingCard && !balancesQuery.error && !hasBalances ? (
              <NoPolicy firstName={firstName} own={own} onAssign={() => setAssignOpen(true)} />
            ) : (
              <>
                <Button type="button" className="w-full" onClick={() => setRequest({ open: true })}>
                  <Icon icon={Add01Icon} size="sm" />
                  {t("tab.request")}
                </Button>
                {balancesQuery.error ? (
                  <ErrorState compact error={balancesQuery.error} onRetry={() => void balancesQuery.refetch()} />
                ) : (
                  <TimeOffSidePanel
                    balances={balances}
                    balancesLoading={loadingCard}
                    requests={requestsQuery.data}
                    policyMap={policyMap}
                    todayISO={todayISO}
                    onOpenBalance={setHistoryFor}
                    onOpenRequest={(id) => setOpened({ id })}
                    onOpenAll={() => setAllOpen(true)}
                  />
                )}
              </>
            )}
          </div>

          {/* Without an assignment there is no balance and no way to request — the people who manage policies get
              the entry point on the person. Not on one's own view (Q11); with no policy the empty state carries it. */}
          {!own && hasBalances ? (
            <PermissionGate resource="PEOPLE.TIME_OFF_POLICIES" action="EDIT">
              <button
                type="button"
                onClick={() => setAssignOpen(true)}
                className="inline-flex w-fit items-center gap-2 rounded-control px-3 py-1.5 text-body font-medium text-accent-text hover:bg-subtle"
              >
                <Icon icon={Add01Icon} size="sm" />
                {t("tab.assignPolicy")}
              </button>
            </PermissionGate>
          ) : null}
        </div>

        {monthError ? (
          <ErrorState
            error={monthError}
            title={t("tab.errorTitle")}
            message={firstName ? t("tab.errorText", { name: firstName }) : t("tab.errorTextOwn")}
            onRetry={() => { void requestsQuery.refetch(); void holidaysQuery.refetch(); }}
          />
        ) : (
          <TimeOffMonth
            requests={requests}
            policyMap={policyMap}
            holidays={holidays}
            isNonWorking={isNonWorking}
            awaitingIds={awaitingIds}
            onPick={hasBalances ? (start, end) => setRequest({ open: true, start, end }) : undefined}
            onOpenRequest={(id, options) => (options?.decline ? setDeclining(id) : setOpened({ id }))}
          />
        )}
      </div>

      {request.open && balances && (
        <RequestTimeOffModal
          isOpen={request.open}
          userId={userId}
          balances={balances}
          policyMap={policyMap}
          initialStartDate={request.start}
          initialEndDate={request.end}
          onCloseAction={() => setRequest({ open: false })}
        />
      )}

      {historyFor && (
        <BalanceHistoryDialog
          userId={userId}
          policy={policyMap.get(historyFor)}
          balances={historyBalances}
          current={historyCurrent}
          requests={requests}
          canAdjust={canAdjust}
          firstName={firstName}
          onClose={() => setHistoryFor(null)}
        />
      )}

      {allOpen && (
        <AllRequestsDialog
          userId={userId}
          requests={requests}
          policyMap={policyMap}
          firstName={firstName}
          open={!opened?.fromAll}
          onOpenRequest={(id) => setOpened({ id, fromAll: true })}
          onClose={() => setAllOpen(false)}
        />
      )}

      <LeaveRequestDialog
        requestId={opened?.id ?? null}
        onBack={opened?.fromAll ? () => setOpened(null) : undefined}
        onClose={() => {
          if (opened?.fromAll) setAllOpen(false);
          setOpened(null);
        }}
      />

      <DeclineLeaveDialog
        target={declined
          ? {
              requestId: declined.id,
              startDate: declined.startDate,
              endDate: declined.endDate,
              policyName: policyMap.get(declined.policyId)?.name ?? null,
              policyColor: policyMap.get(declined.policyId)?.color ?? null,
              firstName: person?.firstName ?? null,
            }
          : null}
        onClose={() => setDeclining(null)}
      />

      {assignOpen && (
        <AssignTimeOffPolicyModal
          isOpen={assignOpen}
          userId={userId}
          policies={policies ?? []}
          balances={balances ?? []}
          onCloseAction={() => setAssignOpen(false)}
        />
      )}
    </>
  );
};

/** The card with no policy to show (Q08): the picture, what is missing, and Assign for whoever may. */
const NoPolicy: FC<{ firstName: string | null; own: boolean; onAssign: () => void }> = ({ firstName, own, onAssign }) => {
  const t = useTranslations("leave");
  return (
    <div className="flex flex-col items-center gap-1.5 py-6 text-center">
      <Illustration scene="time-off-s" size="s" />
      <p className="mt-2 text-card-title text-primary">{t("tab.noPolicyTitle")}</p>
      <p className="text-body text-secondary">
        {own || !firstName ? t("tab.noPolicyTextOwn") : t("tab.noPolicyText", { name: firstName })}
      </p>
      {!own ? (
        <PermissionGate resource="PEOPLE.TIME_OFF_POLICIES" action="EDIT">
          <Button type="button" className="mt-4" onClick={onAssign}>
            <Icon icon={Add01Icon} size="sm" />
            {t("tab.assignPolicy")}
          </Button>
        </PermissionGate>
      ) : null}
    </div>
  );
};

export default UserTimeOffCalendar;
