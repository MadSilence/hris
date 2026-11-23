"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/desact/textarea";
import { Label } from "@/components/desact/label";
import { Input } from "@/components/desact/input";
import { FieldError } from "@/components/desact/field-error";
import { Checkbox } from "@/components/desact/checkbox";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import {
  blockUserAction,
  unblockUserAction,
  unlockUserAction,
} from "@/components/modules/organization/modules/profile/actions/userLifecycleActions/userLifecycleActions";
import { withStepUpAction } from "@/components/modules/mfa/stepUp";
import { resetUserMfaAction } from "@/components/modules/mfa/actions";
import { useMfaStatus } from "@/components/modules/mfa/hooks";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { SignInOverviewDTO } from "@/api/modules/identity/services";

/**
 * The small windows Manage account opens over itself (manage-account-answers spec): Block and Unblock with an
 * optional reason (AQ-07), Reset two-step login in one window with the admin's own proof (AQ-06) and the out-of-band
 * tick the owner kept (U3), and Unlock, which our lock keeps (U2).
 */
export type AccountAccessKind = "BLOCK" | "UNBLOCK" | "UNLOCK" | "RESET_MFA";

/** The same key the step-up dialog and the preferences read, so one answer serves all three. */
const SIGN_IN_OVERVIEW_QK = ["ME", "SIGN_IN"] as const;

/** A wrong current password, as step-up answers it. */
const WRONG_PASSWORD = "AUTH00004";
/** A wrong or expired code: the authenticator's, a backup code, the emailed one. */
const WRONG_CODE = new Set(["AUTH00006", "AUTH00008", "AUTH00022", "AUTH00023", "AUTH00024"]);
/** The tick was not ticked. */
const NOT_VERIFIED = "AUTH00032";

type Props = {
  /** Which window is open; null when none is. */
  kind: AccountAccessKind | null;
  userId: string;
  fullName: string;
  /** The first name the windows speak of ("Reset Reza’s two-step login?"). */
  firstName: string;
  onCloseAction: () => void;
  /** After a change went through, so the header and the dialog can show the new state. */
  onChangedAction: () => void | Promise<unknown>;
};

export function AccountAccessModal({ kind, userId, fullName, firstName, onCloseAction, onChangedAction }: Props) {
  if (kind === "RESET_MFA") {
    return (
      <ResetTwoStepWindow
        open
        userId={userId}
        firstName={firstName}
        onCloseAction={onCloseAction}
        onChangedAction={onChangedAction}
      />
    );
  }
  return (
    <SimpleAccessWindow
      kind={kind}
      userId={userId}
      fullName={fullName}
      firstName={firstName}
      onCloseAction={onCloseAction}
      onChangedAction={onChangedAction}
    />
  );
}

/** Block, Unblock (each with an optional reason that goes to the journal) and Unlock. */
function SimpleAccessWindow({
  kind, userId, fullName, firstName, onCloseAction, onChangedAction,
}: Omit<Props, "kind"> & { kind: Exclude<AccountAccessKind, "RESET_MFA"> | null }) {
  const t = useTranslations("organization");
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
      if (kind === "UNLOCK") {
        const res = await withStepUpAction(() => unlockUserAction({ userId }));
        onCloseAction();
        if (res.status === ActionStatus.SUCCESS) {
          showSuccess(t("profile.access.unlocked", { name: fullName }));
          await onChangedAction();
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
        // B3: unblocking ends with a toast; a block shows itself in the dialog's red line.
        if (kind === "UNBLOCK") showSuccess(t("profile.access.unblocked"));
        await onChangedAction();
      } else {
        setError(res.errorMessage ?? null);
      }
    } finally {
      setBusy(false);
    }
  };

  const copy = kind === "BLOCK"
    ? {
      title: t("profile.access.blockTitle", { name: firstName }),
      description: t("profile.access.blockText", { name: firstName }),
      confirmLabel: t("profile.manageAccount.block.button"),
      placeholder: t("profile.access.blockPlaceholder"),
    }
    : kind === "UNBLOCK"
      ? {
        title: t("profile.access.unblockTitle", { name: firstName }),
        description: t("profile.access.unblockText", { name: firstName }),
        confirmLabel: t("profile.manageAccount.unblock.button"),
        placeholder: t("profile.access.unblockPlaceholder"),
      }
      : {
        title: t("profile.header.unlock"),
        description: t("profile.access.unlockDescription", { name: fullName }),
        confirmLabel: t("profile.access.unlockConfirm"),
        placeholder: "",
      };

  return (
    <ConfirmActionModal
      isOpen={kind !== null}
      title={copy.title}
      description={copy.description}
      confirmLabel={copy.confirmLabel}
      // Block is red (AQ-07); it is undone by Unblock, but it ends somebody's sign-in at once.
      destructive={kind === "BLOCK"}
      isLoading={busy}
      errorMessage={error}
      onConfirmAction={confirm}
      onCancelAction={onCloseAction}
    >
      {(kind === "BLOCK" || kind === "UNBLOCK") && (
        <div className="space-y-1.5">
          <Label htmlFor="account-access-reason">{t("profile.access.reason")}</Label>
          <Textarea
            id="account-access-reason"
            value={reason}
            placeholder={copy.placeholder}
            onChange={(e) => setReason(e.currentTarget.value)}
            rows={2}
          />
        </div>
      )}
    </ConfirmActionModal>
  );
}

/**
 * AQ-06 · one window. The admin proves it is them in it — the password for somebody with no factor, a code from
 * their authenticator app for somebody with one (step-up's rule, MFA_DESIGN.md § 3.5), or the code emailed to them
 * for somebody who logs in by code — and ticks that the person was checked another way than email (U3). A wrong
 * password turns the field red; Reset stays pressable.
 */
function ResetTwoStepWindow({
  open, userId, firstName, onCloseAction, onChangedAction,
}: { open: boolean } & Pick<Props, "userId" | "firstName" | "onCloseAction" | "onChangedAction">) {
  const t = useTranslations("organization");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const { internalApiClient } = useAppDataContext();
  const status = useMfaStatus(open);
  const ways = useQuery<SignInOverviewDTO>({
    queryKey: SIGN_IN_OVERVIEW_QK,
    queryFn: () => internalApiClient.get<SignInOverviewDTO>("/me/sign-in"),
    enabled: open,
  });
  const [value, setValue] = useState("");
  const [backup, setBackup] = useState(false);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [tickError, setTickError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  const enrolled = status.data?.enrolled ?? false;
  const known = !status.isLoading && !ways.isLoading;
  const mode: "code" | "password" | "email" = enrolled ? "code" : (ways.data?.hasPassword ?? true) ? "password" : "email";

  // Somebody who logs in by code gets one at once: the field reads "Enter the code we sent to you".
  useEffect(() => {
    if (!open || !known || mode !== "email" || codeSent) return;
    setCodeSent(true);
    internalApiClient.post("/auth/step-up/email-code").catch((e: unknown) => setError(messageForError(e)));
  }, [open, known, mode, codeSent, internalApiClient]);

  const confirm = async () => {
    setError(null);
    setTickError(null);
    if (!value.trim()) {
      setFieldError(mode === "password" ? tCommon("validation.enterPassword") : t("profile.access.mfaEnterCode"));
      return;
    }
    setFieldError(null);
    const proof = mode === "password"
      ? { password: value }
      : mode === "email"
        ? { emailCode: value.trim() }
        : backup ? { backupCode: value.trim() } : { code: value.trim() };
    setBusy(true);
    try {
      const res = await withStepUpAction(() => resetUserMfaAction(userId, verified, proof));
      if (res.status === ActionStatus.SUCCESS) {
        onCloseAction();
        showSuccess(t("profile.access.mfaReset"));
        await onChangedAction();
      } else if (res.code === WRONG_PASSWORD) {
        setFieldError(t("profile.access.mfaWrongPassword"));
      } else if (res.code && WRONG_CODE.has(res.code)) {
        setFieldError(res.errorMessage ?? null);
      } else if (res.code === NOT_VERIFIED) {
        setTickError(res.errorMessage ?? null);
      } else {
        setError(res.errorMessage ?? null);
      }
    } finally {
      setBusy(false);
    }
  };

  const label = mode === "password"
    ? t("profile.access.mfaYourPassword")
    : mode === "email"
      ? t("profile.access.mfaEmailCode")
      : backup ? tAuth("mfa.backupCode") : t("profile.access.mfaAppCode");

  return (
    <ConfirmActionModal
      isOpen={open}
      title={t("profile.access.mfaTitle", { name: firstName })}
      description={t("profile.access.mfaText", { name: firstName, mode })}
      confirmLabel={t("profile.access.mfaConfirm")}
      isLoading={busy}
      errorMessage={error}
      onConfirmAction={confirm}
      onCancelAction={onCloseAction}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy) void confirm();
        }}
      >
        <div>
          <Label htmlFor="reset-mfa-proof" className="mb-1.5">{label}</Label>
          <Input
            id="reset-mfa-proof"
            type={mode === "password" ? "password" : "text"}
            autoComplete={mode === "password" ? "current-password" : "one-time-code"}
            inputMode={mode === "password" || backup ? undefined : "numeric"}
            value={value}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? "reset-mfa-proof-error" : undefined}
            onChange={(e) => {
              setValue(e.currentTarget.value);
              if (fieldError) setFieldError(null);
            }}
            autoFocus
          />
          <FieldError id="reset-mfa-proof-error">{fieldError}</FieldError>
          {mode === "code" && (
            <button
              type="button"
              className="mt-2 text-label text-secondary underline"
              onClick={() => { setBackup((v) => !v); setValue(""); setFieldError(null); }}
            >
              {backup ? tAuth("mfaSignIn.challenge.useApp") : tAuth("mfaSignIn.challenge.useBackup")}
            </button>
          )}
        </div>
        {/* U3: email is the channel an attacker most likely holds, so the admin says they checked another way. */}
        <div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="reset-mfa-verified"
              checked={verified}
              aria-invalid={tickError ? true : undefined}
              onCheckedChange={(v) => {
                setVerified(Boolean(v));
                if (tickError) setTickError(null);
              }}
            />
            <Label htmlFor="reset-mfa-verified" className="font-normal leading-snug">
              {t("profile.access.verified", { name: firstName })}
            </Label>
          </div>
          <FieldError>{tickError}</FieldError>
        </div>
      </form>
    </ConfirmActionModal>
  );
}
