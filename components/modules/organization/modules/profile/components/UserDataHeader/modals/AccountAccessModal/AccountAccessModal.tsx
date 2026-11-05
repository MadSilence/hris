"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/desact/textarea";
import { Label } from "@/components/desact/label";
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
import { Checkbox } from "@/components/desact/checkbox";

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
  const t = useTranslations("organization");
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
            ? t("profile.access.resetSentUnlock", { name: fullName })
            : t("profile.access.resetSent", { name: fullName }));
        } else {
          showActionError(res);
        }
        return;
      }

      if (kind === "RESET_MFA") {
        const res = await withStepUpAction(() => resetUserMfaAction(userId, verified));
        if (res.status === ActionStatus.SUCCESS) {
          onCloseAction();
          showSuccess(t("profile.access.mfaReset", { name: fullName }));
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
            ? t("profile.access.noSessions", { name: fullName })
            : t("profile.access.sessionsEnded", { name: fullName, count: n }));
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

  const copy = kind ? COPY[kind](t, fullName, accountLocked) : null;

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
            {t("profile.access.verified", { name: fullName })}
          </Label>
        </div>
      )}
      {(kind === "BLOCK" || kind === "UNBLOCK") && (
        <div className="space-y-1.5">
          <Label htmlFor="account-access-reason">{t("profile.access.reason")}</Label>
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

type OrgTranslator = ReturnType<typeof useTranslations<"organization">>;

const COPY: Record<AccountAccessKind, (t: OrgTranslator, name: string, locked: boolean) => {
  title: string;
  description: string;
  confirmLabel: string;
}> = {
  BLOCK: (t, name) => ({
    title: t("profile.header.block"),
    description: t("profile.access.blockDescription", { name }),
    confirmLabel: t("profile.access.blockConfirm"),
  }),
  UNBLOCK: (t, name) => ({
    title: t("profile.header.unblock"),
    description: t("profile.access.unblockDescription", { name }),
    confirmLabel: t("profile.access.unblockConfirm"),
  }),
  RESET: (t, name, locked) => ({
    title: locked ? t("profile.header.sendResetToUnlock") : t("profile.header.sendReset"),
    description: locked
      ? t("profile.access.resetLockedDescription", { name })
      : t("profile.access.resetDescription", { name }),
    confirmLabel: t("profile.access.resetConfirm"),
  }),
  RESET_MFA: (t, name) => ({
    title: t("profile.header.resetMfa"),
    description: t("profile.access.mfaDescription", { name }),
    confirmLabel: t("profile.access.mfaConfirm"),
  }),
  END_SESSIONS: (t, name) => ({
    title: t("profile.header.endSessions"),
    description: t("profile.access.endSessionsDescription", { name }),
    confirmLabel: t("profile.access.endSessionsConfirm"),
  }),
};
