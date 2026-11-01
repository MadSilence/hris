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
import { endAllSessionsOfUserAction } from "@/components/modules/sessions/actions";
import { withStepUpAction } from "@/components/modules/mfa/stepUp";
import { resetUserMfaAction } from "@/components/modules/mfa/actions";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";

export type AccountAccessKind = "BLOCK" | "UNBLOCK" | "RESET" | "END_SESSIONS" | "RESET_MFA";

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
 * The account-access confirmations of the profile: Block, Unblock, Send Password Reset, End All Sessions.
 *
 * Block and Unblock take an optional reason, and keep the dialog open on a refusal — the reason typed
 * is still there. A refused reset has nothing the dialog could fix (not registered, blocked, no
 * address, mail failed), so the dialog closes and the card says why.
 */
export function AccountAccessModal({
  kind, userId, fullName, accountLocked = false, onCloseAction, onChangedAction,
}: Props) {
  const [reason, setReason] = useState("");
  // Email is the channel an attacker most likely holds: the actor says they checked another way (§ 3.7).
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kind) {
      setReason("");
      setVerified(false);
      setError(null);
    }
  }, [kind]);

  const confirm = async () => {
    if (!kind) return;
    setBusy(true);
    setError(null);
    try {
      if (kind === "RESET") {
        // A protected account's sign-in is changed only by an owner who confirms it is them (§ 3.8).
        const res = await withStepUpAction(() => sendPasswordResetAction({ userId }));
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

      if (kind === "RESET_MFA") {
        const res = await withStepUpAction(() => resetUserMfaAction(userId, verified));
        if (res.status === ActionStatus.SUCCESS) {
          onCloseAction();
          showSuccess(`${fullName}'s two-step sign-in was reset. They were signed out everywhere.`);
        } else {
          setError(res.errorMessage ?? null);
        }
        return;
      }

      if (kind === "END_SESSIONS") {
        // Like a reset, nothing in the dialog could fix a refusal: it closes and the card says why.
        const res = await endAllSessionsOfUserAction(userId);
        onCloseAction();
        if (res.status === ActionStatus.SUCCESS) {
          const n = res.data?.ended ?? 0;
          showSuccess(n === 0
            ? `${fullName} was not signed in anywhere.`
            : `${fullName} was signed out of ${n} ${n === 1 ? "session" : "sessions"}.`);
        } else {
          showActionError(res);
        }
        return;
      }

      const submission = { userId, reason: reason.trim() || null };
      const res = await withStepUpAction(() =>
        kind === "BLOCK" ? blockUserAction(submission) : unblockUserAction(submission));
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
      {kind === "RESET_MFA" && (
        <div className="flex items-start gap-2">
          <Checkbox id="account-access-verified" checked={verified} onCheckedChange={(v) => setVerified(Boolean(v))} disabled={busy} />
          <Label htmlFor="account-access-verified" className="font-normal leading-snug">
            I confirmed this request with {fullName} by a call or in person, not by email.
          </Label>
        </div>
      )}
      {(kind === "BLOCK" || kind === "UNBLOCK") && (
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
  RESET_MFA: (name) => ({
    title: "Reset Two-Step Sign-In",
    description: `${name}'s authenticator app, backup codes and remembered devices stop working, and they are signed out everywhere. If your company requires two-step sign-in, they set it up again at their next sign-in.`,
    confirmLabel: "Reset",
  }),
  END_SESSIONS: (name) => ({
    title: "End All Sessions",
    description: `${name} will be signed out of every browser at once. They can sign in again straight away — to keep them out, block the account instead.`,
    confirmLabel: "End Sessions",
  }),
};
