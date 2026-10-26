"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Switch } from "@/public/desact/src/components/ui/switch";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { DateRangePicker, type IsoRange } from "@/components/ui/DatePicker";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import { showActionError } from "@/lib/errors/errorToast";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { updateUserSettingsAction } from "@/components/modules/firstRun/actions";
import { USER_SETTINGS_QK, useUserSettings } from "@/components/modules/firstRun/hooks";
import type { DelegationDTO, DelegationPersonRef } from "@/api/modules/delegations/dto";
import { useCreateDelegation, useDeleteDelegation, useDelegations } from "@/components/modules/delegations/hooks";

const range = (d: Pick<DelegationDTO, "startDate" | "endDate">) =>
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
    if (!dates) return setFormError("Choose the days the delegation covers.");
    if (!delegate) return setFormError("Choose who decides for you.");
    setFormError(null);
    try {
      await create.mutateAsync({ delegateUserId: delegate.id, startDate: dates.start, endDate: dates.end });
      setAdding(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "The delegation could not be saved.");
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    setRemoveError(null);
    try {
      await remove.mutateAsync(removing.id);
      setRemoving(null);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "The delegation could not be removed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 rounded-lg border border-brown-200 p-4">
        <div className="min-w-0">
          <Label htmlFor="delegate-on-leave" className="font-medium text-brown-900">
            Delegate My Approvals While I&apos;m on Leave
          </Label>
          <p className="mt-0.5 text-sm text-muted-foreground">
            When your own leave is approved, the requests waiting on you also go to your manager for those days.
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
            <p className="text-sm font-medium text-brown-800">Your Delegations</p>
            {(delegations.data?.given ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">You have not delegated your approvals.</p>
            ) : (
              <ul className="divide-y divide-brown-100 rounded-lg border border-brown-200">
                {delegations.data?.given.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span>
                      To <strong className="font-medium">{d.delegate.name ?? "a colleague"}</strong> · {range(d)}
                      {d.active && <span className="text-muted-foreground"> · In force now</span>}
                      {d.source === "LEAVE" && <span className="text-muted-foreground"> · For your leave</span>}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setRemoveError(null);
                        setRemoving(d);
                      }}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {(delegations.data?.received ?? []).length > 0 && (
            <section className="space-y-2">
              <p className="text-sm font-medium text-brown-800">Delegated to You</p>
              <ul className="divide-y divide-brown-100 rounded-lg border border-brown-200">
                {delegations.data?.received.map((d) => (
                  <li key={d.id} className="px-4 py-2.5 text-sm">
                    From <strong className="font-medium">{d.delegator.name ?? "a colleague"}</strong> · {range(d)}
                    {d.active && <span className="text-muted-foreground"> · In force now</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {adding ? (
            <form onSubmit={submit} noValidate className="space-y-4 rounded-lg border border-brown-200 p-4">
              <div className="space-y-2">
                <RequiredLabel htmlFor="delegation-dates" required>Dates</RequiredLabel>
                <DateRangePicker id="delegation-dates" value={dates} onChange={setDates} ariaLabel="Delegation dates" />
              </div>
              <div className="space-y-2">
                <RequiredLabel htmlFor="delegation-delegate" required>Delegate</RequiredLabel>
                <UserPickerField
                  id="delegation-delegate"
                  value={delegate}
                  onChange={setDelegate}
                  placeholder="Select a person"
                />
                <p className="text-xs text-muted-foreground">
                  They are asked beside you; whoever answers first decides, on your behalf.
                </p>
              </div>
              <FormError message={formError} />
              <div className="flex gap-2">
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? "Adding…" : "Add"}
                </Button>
                <Button type="button" variant="ghost" disabled={create.isPending} onClick={() => setAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={startAdding}>
              <Plus className="h-4 w-4" />
              Add Delegation
            </Button>
          )}
        </>
      )}

      <ConfirmActionModal
        isOpen={removing !== null}
        title="Remove Delegation?"
        description={
          removing
            ? `${removing.delegate.name ?? "Your delegate"} stops being asked for you from now on.`
            : ""
        }
        confirmLabel="Remove"
        destructive
        isLoading={remove.isPending}
        errorMessage={removeError}
        onConfirmAction={confirmRemove}
        onCancelAction={() => setRemoving(null)}
      />
    </div>
  );
};
