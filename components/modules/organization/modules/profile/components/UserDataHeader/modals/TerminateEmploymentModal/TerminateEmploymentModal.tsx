"use client";

import { FC, FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import { useQuery } from "@tanstack/react-query";
import { UserRemove01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { Switch } from "@/components/desact/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type {
  LeaverReassignment,
  TerminationImpactDTO,
  TerminationReason,
} from "@/api/modules/users/clients/hrisApiUsersClient";
import {
  hasLeaverDecisions,
  LeaverDecisionsStep,
  NO_REASSIGNMENT,
  type LeaverReassignmentChoice,
} from "./LeaverDecisionsStep";
import { DatePicker } from "@/components/ui/DatePicker";
import { dateToISO, useDateFormatter } from "@/lib/date";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { InlineAlert } from "@/components/desact/alert";

const REASONS = [
  { id: "VOLUNTARY", labelKey: "profile.terminate.reasons.voluntary" },
  { id: "INVOLUNTARY", labelKey: "profile.terminate.reasons.involuntary" },
  { id: "END_OF_CONTRACT", labelKey: "profile.terminate.reasons.endOfContract" },
] as const satisfies readonly { id: TerminationReason; labelKey: string }[];

/**
 * Today, in the reader's own day.
 *
 * `new Date().toISOString().slice(0, 10)` is UTC, so east of Greenwich the default last working day
 * was **yesterday** for the whole evening — on the one field where being a day out is somebody's
 * last day at work. `dateToISO` reads the local components instead, which is the rule the shared
 * date helpers exist for (`lib/date.ts`, and `DECISIONS.md` on dates).
 *
 * The backend does the matching thing with the company's clock: an omitted `lastWorkingDay` is
 * `CompanyTimeService.today(companyId)`, not the server's date.
 */
const today = () => dateToISO(new Date());

export type TerminateSubmission = {
  lastWorkingDay: string;
  reason: TerminationReason;
  rehireEligible: boolean;
  note: string | null;
  /** Whom the leaver's decisions go to; a null group goes to its default. */
  reassign: LeaverReassignment;
};

export interface TerminateEmploymentModalProps {
  isOpen: boolean;
  userId: string;
  fullName: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  onCancelAction: () => void;
  onConfirmAction: (values: TerminateSubmission) => void;
}

/**
 * Termination is not a flag — it revokes access, ends time-off policies and moves the person's
 * reports. The dialog fetches that impact and states it before the button is pressed.
 */
export const TerminateEmploymentModal: FC<TerminateEmploymentModalProps> = ({
  isOpen,
  userId,
  fullName,
  isLoading = false,
  errorMessage,
  onCancelAction,
  onConfirmAction,
}) => {
  const t = useTranslations("organization");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");
  const { internalApiClient } = useAppDataContext();

  const [lastWorkingDay, setLastWorkingDay] = useState(today);
  const [reason, setReason] = useState<TerminationReason>("VOLUNTARY");
  const [rehireEligible, setRehireEligible] = useState(true);
  const [note, setNote] = useState("");
  const [reassign, setReassign] = useState<LeaverReassignmentChoice>(NO_REASSIGNMENT);

  useEffect(() => {
    if (!isOpen) return;
    setLastWorkingDay(today());
    setReason("VOLUNTARY");
    setRehireEligible(true);
    setNote("");
    setReassign(NO_REASSIGNMENT);
  }, [isOpen]);

  const { data: impact, isLoading: impactLoading } = useQuery<TerminationImpactDTO>({
    queryKey: ["TERMINATION_IMPACT", userId, lastWorkingDay],
    enabled: isOpen,
    queryFn: () =>
      internalApiClient.get<TerminationImpactDTO>(
        `/users/${userId}/termination-impact${lastWorkingDay ? `?lastWorkingDay=${lastWorkingDay}` : ""}`,
      ),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !lastWorkingDay) return;

    onConfirmAction({
      lastWorkingDay,
      reason,
      rehireEligible,
      note: note.trim() || null,
      reassign: {
        requestsTo: reassign.requestsTo?.id ?? null,
        tasksTo: reassign.tasksTo?.id ?? null,
        policiesTo: reassign.policiesTo?.id ?? null,
        processesTo: reassign.processesTo?.id ?? null,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancelAction()}>
      <DialogContent hideClose className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-control bg-subtle text-secondary">
              <Icon icon={UserRemove01Icon} />
            </span>
            <div>
              <DialogTitle>{t("profile.header.terminate")}</DialogTitle>
              <DialogDescription>
                {t("profile.terminate.description", { name: fullName })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <FormError message={errorMessage} />

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <RequiredLabel htmlFor="last-working-day" required>{t("profile.scheduled.lastWorkingDay")}</RequiredLabel>
              <DatePicker
                id="last-working-day"
                value={lastWorkingDay}
                disabled={isLoading}
                onChange={setLastWorkingDay}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("profile.access.reason")}</Label>
              <Select
                value={reason}
                onValueChange={(v) => setReason(v as TerminationReason)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{t(r.labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-control border border-divider px-3 py-2.5">
            <div>
              <Label htmlFor="rehire-eligible" className="text-body">{t("profile.terminate.rehire")}</Label>
              <p className="text-hint text-tertiary">
                {t("profile.terminate.rehireHint")}
              </p>
            </div>
            <Switch
              id="rehire-eligible"
              checked={rehireEligible}
              disabled={isLoading}
              onCheckedChange={setRehireEligible}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termination-note">{t("profile.terminate.note")}</Label>
            <Textarea
              id="termination-note"
              rows={2}
              value={note}
              disabled={isLoading}
              onChange={(e) => setNote(e.currentTarget.value)}
            />
          </div>

          {hasLeaverDecisions(impact?.decisions) && (
            <LeaverDecisionsStep
              fullName={fullName}
              decisions={impact.decisions}
              value={reassign}
              onChange={setReassign}
              disabled={isLoading}
            />
          )}

          <InlineAlert tone="pending">
            <p className="mb-1.5 text-body font-medium text-status-pending-text">{t("profile.terminate.impactTitle")}</p>
            {impactLoading ? (
              <p className="text-body text-status-pending-text">{t("profile.terminate.checking")}</p>
            ) : (
              <ul className="space-y-1 text-body text-status-pending-text">
                {/* The change lands on the day after the last working day (WALK_QUESTIONS § 14); until
                    then the person is an employee like any other — the whole of the last day included,
                    which is why a last day of today still reads "the end of today", not "now". */}
                {impact?.effectiveOn && impact.effectiveOn >= today() ? (
                  <li>
                    {t.rich("profile.terminate.impact.until", {
                      date: formatDisplayDate(impact.effectiveOn),
                      b: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </li>
                ) : (
                  <li>{t("profile.terminate.impact.now")}</li>
                )}
                <li>{t("profile.terminate.impact.roles", { count: impact?.rolesToRevoke ?? 0 })}</li>
                <li>{t("profile.terminate.impact.policies", { count: impact?.policyAssignmentsToEnd ?? 0 })}</li>
                <li>
                  {impact?.reportsMoveTo
                    ? t.rich("profile.terminate.impact.reports", {
                      count: impact?.directReportsToReassign ?? 0,
                      manager: impact.reportsMoveTo.name,
                      b: (chunks) => <strong>{chunks}</strong>,
                    })
                    : t.rich("profile.terminate.impact.reportsNoManager", {
                      count: impact?.directReportsToReassign ?? 0,
                      b: (chunks) => <strong>{chunks}</strong>,
                    })}
                </li>
                {(impact?.requestsAwaitingTheirDecision ?? 0) > 0 ? (
                  <li>{t("profile.terminate.impact.requests", { count: impact?.requestsAwaitingTheirDecision ?? 0 })}</li>
                ) : null}
                {(impact?.approvedLeaveAfterLastDay ?? 0) > 0 ? (
                  <li>{t("profile.terminate.impact.absences", { count: impact?.approvedLeaveAfterLastDay ?? 0 })}</li>
                ) : null}
              </ul>
            )}
          </InlineAlert>

          <DialogFooter>
            <Button type="button" variant="secondary" disabled={isLoading} onClick={onCancelAction}>
              {tCommon("actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !lastWorkingDay}
              variant="destructive-confirm"
            >
              {isLoading ? t("profile.terminate.terminating") : t("profile.terminate.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
