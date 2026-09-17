"use client";

import React, { useEffect, useState } from "react";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { Label } from "@/public/desact/src/components/ui/label";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import {
  blockUserAction,
  sendPasswordResetAction,
  unblockUserAction,
} from "@/components/modules/organization/modules/profile/actions/userLifecycleActions/userLifecycleActions";

export type AccountAccessKind = "BLOCK" | "UNBLOCK" | "RESET";

type Props = {
  /** Which confirmation is open; null when none is. */
  kind: AccountAccessKind | null;
  userId: string;
  fullName: string;
  /** Locked after too many failed sign-ins — the reset is then also what unlocks the account. */
  accountLocked?: boolean;
  onCloseAction: () => void;
  /** After a block or unblock went through, so the header can show the new state. */
  onChangedAction: () => void | Promise<unknown>;
};

/**
 * The three account-access confirmations of the profile: Block, Unblock, Send Password Reset.
 *
 * Block and Unblock take an optional reason, and keep the dialog open on a refusal — the reason typed
 * is still there. A refused reset has nothing the dialog could fix (not registered, blocked, no
 * address, mail failed), so the dialog closes and the card says why.
 */
export function AccountAccessModal({
  kind, userId, fullName, accountLocked = false, onCloseAction, onChangedAction,
}: Props) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kind) {
      setReason("");
      setError(null);
    }
  }, [kind]);

  const confirm = async () => {
    if (!kind) return;
    setBusy(true);
    setError(null);
    try {
      if (kind === "RESET") {
        const res = await sendPasswordResetAction({ userId });
        onCloseAction();
        if (res.status === ActionStatus.SUCCESS) {
          showSuccess(accountLocked
            ? `Password reset sent to ${fullName}. Setting a new password unlocks the account.`
            : `Password reset sent to ${fullName}.`);
        } else {
          showActionError(res);
        }
        return;
      }

      const submission = { userId, reason: reason.trim() || null };
      const res = kind === "BLOCK" ? await blockUserAction(submission) : await unblockUserAction(submission);
      if (res.status === ActionStatus.SUCCESS) {
        onCloseAction();
        await onChangedAction();
      } else {
        setError(res.errorMessage ?? null);
      }
    } finally {
      setBusy(false);
    }
  };

  const copy = kind ? COPY[kind](fullName, accountLocked) : null;

  return (
    <ConfirmActionModal
      isOpen={kind !== null}
      title={copy?.title ?? ""}
      description={copy?.description ?? ""}
      confirmLabel={copy?.confirmLabel ?? ""}
      // Not destructive: a block is undone by Unblock, the way an archive is undone by Unarchive.
      destructive={false}
      isLoading={busy}
      errorMessage={error}
      onConfirmAction={confirm}
      onCancelAction={onCloseAction}
    >
      {kind !== null && kind !== "RESET" && (
        <div className="space-y-1.5">
          <Label htmlFor="account-access-reason">Reason</Label>
          <Textarea
            id="account-access-reason"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            disabled={busy}
            rows={3}
          />
        </div>
      )}
    </ConfirmActionModal>
  );
}

const COPY: Record<AccountAccessKind, (name: string, locked: boolean) => {
  title: string;
  description: string;
  confirmLabel: string;
}> = {
  BLOCK: (name) => ({
    title: "Block Account",
    description: `${name} will be signed out everywhere and will not be able to sign in until the account is unblocked.`,
    confirmLabel: "Block",
  }),
  UNBLOCK: (name) => ({
    title: "Unblock Account",
    description: `${name} will be able to sign in again.`,
    confirmLabel: "Unblock",
  }),
  RESET: (name, locked) => ({
    title: locked ? "Send Password Reset to Unlock" : "Send Password Reset",
    description: locked
      ? `${name}'s account is locked after too many failed sign-ins. They will get an email with a link to set a new password, which unlocks it. The link works for one hour.`
      : `${name} will get an email with a link to set a new password. The link works for one hour.`,
    confirmLabel: "Send",
  }),
};
