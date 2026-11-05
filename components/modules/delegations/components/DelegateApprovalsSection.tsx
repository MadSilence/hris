"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { Skeleton } from "@/components/desact/skeleton";
import { Switch } from "@/components/desact/switch";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { DateRangePicker, type IsoRange } from "@/components/ui/DatePicker";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { ActionStatus } from "@/components/models/ActionStatus";
import { type DateFormatter, useDateFormatter } from "@/lib/date";
import { showActionError } from "@/lib/errors/errorToast";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { updateUserSettingsAction } from "@/components/modules/firstRun/actions";
import { USER_SETTINGS_QK, useUserSettings } from "@/components/modules/firstRun/hooks";
import type { DelegationDTO, DelegationPersonRef } from "@/api/modules/delegations/dto";
import { useCreateDelegation, useDeleteDelegation, useDelegations } from "@/components/modules/delegations/hooks";

const range = (d: Pick<DelegationDTO, "startDate" | "endDate">, formatDisplayDate: DateFormatter) =>
  d.startDate === d.endDate
    ? formatDisplayDate(d.startDate)
    : `${formatDisplayDate(d.startDate)} – ${formatDisplayDate(d.endDate)}`;

const toPicked = (ref: DelegationPersonRef | null): PickedUser | null => {
  if (!ref) return null;
  const [firstName, ...rest] = (ref.name ?? "").split(" ");
  return { id: ref.id, firstName: firstName || null, lastName: rest.join(" ") || null };
};

/**
 * "Delegate Approvals" on a person's own preferences (DECISIONS.md § "Owner decisions of 2026-10-16",
 * item 6). While a delegation is in force both people are asked and the first to answer wins; the
 * journal says the delegate answered on the approver's behalf.
 *
 * Three things, in the order somebody needs them: whether their own approved leave delegates for them
 * (on by default), the delegations they gave and the ones they were given, and adding one by hand —
 * proposing their own manager, as the automatic one does, but any colleague may be chosen.
 */
export const DelegateApprovalsSection: React.FC = () => {
  const t = useTranslations("timeOff");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");
  const strong = (chunks: React.ReactNode) => <strong className="font-medium">{chunks}</strong>;
  const queryClient = useQueryClient();
  const settings = useUserSettings();
  const delegations = useDelegations();
  const create = useCreateDelegation();
  const remove = useDeleteDelegation();

  const [adding, setAdding] = React.useState(false);
  const [dates, setDates] = React.useState<IsoRange | null>(null);
  const [delegate, setDelegate] = React.useState<PickedUser | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [savingToggle, setSavingToggle] = React.useState(false);
  const [removing, setRemoving] = React.useState<DelegationDTO | null>(null);
  const [removeError, setRemoveError] = React.useState<string | null>(null);

  const startAdding = () => {
    setAdding(true);
    setDates(null);
    setDelegate(toPicked(delegations.data?.defaultDelegate ?? null));
    setFormError(null);
  };

  const toggle = async (on: boolean) => {
    setSavingToggle(true);
    const result = await updateUserSettingsAction({ delegateApprovalsOnLeave: on });
    setSavingToggle(false);
    if (result.status === ActionStatus.ERROR) {
      showActionError(result);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: USER_SETTINGS_QK });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dates) return setFormError(t("delegations.form.datesRequired"));
    if (!delegate) return setFormError(t("delegations.form.delegateRequired"));
    setFormError(null);
    try {
      await create.mutateAsync({ delegateUserId: delegate.id, startDate: dates.start, endDate: dates.end });
      setAdding(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("delegations.form.saveFailed"));
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    setRemoveError(null);
    try {
      await remove.mutateAsync(removing.id);
      setRemoving(null);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : t("delegations.remove.failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 rounded-card border border-divider p-4">
        <div className="min-w-0">
          <Label htmlFor="delegate-on-leave" className="font-medium text-primary">
            {t("delegations.onLeave.label")}
          </Label>
          <p className="mt-0.5 text-body text-tertiary">
            {t("delegations.onLeave.hint")}
          </p>
        </div>
        {settings.isLoading ? (
          <Skeleton className="h-5 w-9" />
        ) : (
          <Switch
            id="delegate-on-leave"
            className="mt-0.5"
            checked={settings.data?.delegateApprovalsOnLeave ?? true}
            disabled={savingToggle}
            onCheckedChange={(v) => void toggle(v)}
          />
        )}
      </div>

      {delegations.isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : delegations.error ? (
        <ErrorState error={delegations.error} onRetry={() => void delegations.refetch()} />
      ) : (
        <>
          <section className="space-y-2">
            <p className="text-body font-medium text-primary">{t("delegations.given.title")}</p>
            {(delegations.data?.given ?? []).length === 0 ? (
              <p className="text-body text-tertiary">{t("delegations.given.none")}</p>
            ) : (
              <ul className="divide-y divide-divider rounded-control border border-divider">
                {delegations.data?.given.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-body">
                    <span>
                      {t.rich("delegations.given.to", {
                        name: d.delegate.name ?? t("delegations.aColleague"),
                        range: range(d, formatDisplayDate),
                        b: strong,
                      })}
                      {d.active && <span className="text-tertiary"> · {t("delegations.inForce")}</span>}
                      {d.source === "LEAVE" && <span className="text-tertiary"> · {t("delegations.forYourLeave")}</span>}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-tertiary hover:text-danger-text"
                      onClick={() => {
                        setRemoveError(null);
                        setRemoving(d);
                      }}
                    >
                      {tCommon("actions.remove")}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {(delegations.data?.received ?? []).length > 0 && (
            <section className="space-y-2">
              <p className="text-body font-medium text-primary">{t("delegations.received.title")}</p>
              <ul className="divide-y divide-divider rounded-control border border-divider">
                {delegations.data?.received.map((d) => (
                  <li key={d.id} className="px-4 py-2.5 text-body">
                    {t.rich("delegations.received.from", {
                      name: d.delegator.name ?? t("delegations.aColleague"),
                      range: range(d, formatDisplayDate),
                      b: strong,
                    })}
                    {d.active && <span className="text-tertiary"> · {t("delegations.inForce")}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {adding ? (
            <form onSubmit={submit} noValidate className="space-y-4 rounded-card border border-divider p-4">
              <div className="space-y-2">
                <RequiredLabel htmlFor="delegation-dates" required>{t("delegations.form.dates")}</RequiredLabel>
                <DateRangePicker id="delegation-dates" value={dates} onChange={setDates} ariaLabel={t("delegations.form.datesAria")} />
              </div>
              <div className="space-y-2">
                <RequiredLabel htmlFor="delegation-delegate" required>{t("delegations.form.delegate")}</RequiredLabel>
                <UserPickerField
                  id="delegation-delegate"
                  value={delegate}
                  onChange={setDelegate}
                  placeholder={t("delegations.form.delegatePlaceholder")}
                />
                <p className="text-hint text-tertiary">
                  {t("delegations.form.delegateHint")}
                </p>
              </div>
              <FormError message={formError} />
              <div className="flex gap-2">
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? t("delegations.form.adding") : tCommon("actions.add")}
                </Button>
                <Button type="button" variant="ghost" disabled={create.isPending} onClick={() => setAdding(false)}>
                  {tCommon("actions.cancel")}
                </Button>
              </div>
            </form>
          ) : (
            <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={startAdding}>
              <Icon icon={Add01Icon} size="sm" />
              {t("delegations.form.add")}
            </Button>
          )}
        </>
      )}

      <ConfirmActionModal
        isOpen={removing !== null}
        title={t("delegations.remove.title")}
        description={
          removing
            ? t("delegations.remove.description", {
                name: removing.delegate.name ?? t("delegations.remove.yourDelegate"),
              })
            : ""
        }
        confirmLabel={tCommon("actions.remove")}
        destructive
        isLoading={remove.isPending}
        errorMessage={removeError}
        onConfirmAction={confirmRemove}
        onCancelAction={() => setRemoving(null)}
      />
    </div>
  );
};
