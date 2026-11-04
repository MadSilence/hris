"use client";

import * as React from "react";
import { ComputerIcon, Key01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Skeleton } from "@/components/desact/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import { showActionError } from "@/lib/errors/errorToast";
import { describeUserAgent } from "@/components/modules/sessions/components/describeUserAgent";
import { useMfaStatus, useInvalidateMfaStatus } from "@/components/modules/mfa/hooks";
import {
  confirmMfaEnrolmentAction,
  disableMfaAction,
  forgetAllTrustedDevicesAction,
  forgetTrustedDeviceAction,
  regenerateBackupCodesAction,
  startMfaEnrolmentAction,
} from "@/components/modules/mfa/actions";
import { withStepUpAction } from "@/components/modules/mfa/stepUp";
import { BackupCodesSheet, CodeField, TotpEnrolment } from "./MfaPieces";

type Dialogs = "setup" | "disable" | "codes" | null;

/**
 * "Two-Step Sign-In" on a person's own preferences (MFA_DESIGN.md § 6): on or off, setting it up, new
 * backup codes, switching it off, and the devices that skip the code.
 */
export const TwoStepSection: React.FC = () => {
  const status = useMfaStatus();
  const invalidate = useInvalidateMfaStatus();
  const [dialog, setDialog] = React.useState<Dialogs>(null);
  const [codes, setCodes] = React.useState<string[] | null>(null);

  if (status.isLoading) return <Skeleton className="h-24 w-full" />;
  if (status.error) return <ErrorState error={status.error} />;
  const s = status.data!;

  const regenerate = async () => {
    const res = await withStepUpAction(() => regenerateBackupCodesAction());
    if (res.status === ActionStatus.SUCCESS && res.data) {
      setCodes(res.data.backupCodes);
      setDialog("codes");
      void invalidate();
    } else if (res.status === ActionStatus.ERROR) {
      showActionError(res);
    }
  };

  const forget = async (id?: string) => {
    const res = id ? await forgetTrustedDeviceAction(id) : await forgetAllTrustedDevicesAction();
    if (res.status === ActionStatus.ERROR) showActionError(res);
    void invalidate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-card border border-divider px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Icon icon={Key01Icon} className="flex-none text-tertiary" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-body font-medium text-primary">Authenticator app</span>
              <StatusBadge status={s.enrolled ? "active" : "inactive"} label={s.enrolled ? "On" : "Off"} />
            </div>
            <p className="text-hint text-tertiary">
              {s.enrolled
                ? `${s.backupCodesLeft} backup ${s.backupCodesLeft === 1 ? "code" : "codes"} left.`
                : s.required
                  ? "Your company requires it: you will set it up at your next sign-in if you do not now."
                  : "A code from your phone after your password, so a stolen password alone does not sign anybody in."}
            </p>
          </div>
        </div>
        <div className="flex flex-none gap-2">
          {s.enrolled ? (
            <>
              <Button type="button" variant="secondary" size="sm" onClick={regenerate}>New backup codes</Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={s.required}
                title={s.required ? "Your company requires two-step sign-in" : undefined}
                onClick={() => setDialog("disable")}
              >
                Switch off
              </Button>
            </>
          ) : (
            <Button type="button" size="sm" onClick={() => setDialog("setup")}>Set up</Button>
          )}
        </div>
      </div>

      {s.trustedDevices.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-body font-medium text-primary">Remembered devices</h3>
          <ul className="divide-y divide-divider rounded-control border border-divider">
            {s.trustedDevices.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <Icon icon={ComputerIcon} size="sm" className="flex-none text-tertiary" />
                  <p className="truncate text-body">
                    {describeUserAgent(d.label)}
                    <span className="text-hint text-tertiary">
                      {" "}· remembered {formatDisplayDate(d.createdAt, { style: "medium" })} · until{" "}
                      {formatDisplayDate(d.expiresAt, { style: "medium" })}
                    </span>
                  </p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={() => void forget(d.id)}>Forget</Button>
              </li>
            ))}
          </ul>
          {s.trustedDevices.length > 1 && (
            <Button type="button" variant="secondary" size="sm" onClick={() => void forget()}>Forget all</Button>
          )}
        </div>
      )}

      <SetUpDialog open={dialog === "setup"} onClose={() => { setDialog(null); void invalidate(); }} />
      <DisableDialog open={dialog === "disable"} onClose={() => { setDialog(null); void invalidate(); }} />
      <Dialog open={dialog === "codes"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New backup codes</DialogTitle>
            <DialogDescription>The old codes no longer work.</DialogDescription>
          </DialogHeader>
          {codes && <BackupCodesSheet codes={codes} onDone={() => setDialog(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/** Password again (a stolen session alone cannot enrol a phone), then the app, then the codes. */
const SetUpDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [password, setPassword] = React.useState("");
  const [enrolment, setEnrolment] = React.useState<{ otpauthUri: string; secret: string } | null>(null);
  const [signOutOthers, setSignOutOthers] = React.useState(true);
  const [codes, setCodes] = React.useState<string[] | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setPassword("");
      setEnrolment(null);
      setCodes(null);
      setSignOutOthers(true);
      setError(null);
    }
  }, [open]);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    const res = await startMfaEnrolmentAction(password);
    setBusy(false);
    if (res.status === ActionStatus.SUCCESS && res.data) setEnrolment(res.data);
    else setError(res.errorMessage ?? null);
  };

  const confirm = async (code: string) => {
    setBusy(true);
    setError(null);
    const res = await confirmMfaEnrolmentAction(code, signOutOthers);
    setBusy(false);
    if (res.status === ActionStatus.SUCCESS && res.data) setCodes(res.data.backupCodes);
    else setError(res.errorMessage ?? null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && !codes && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set up two-step sign-in</DialogTitle>
          <DialogDescription>
            {codes ? "Two-step sign-in is on." : enrolment ? "Add your account to an authenticator app." : "Enter your password to begin."}
          </DialogDescription>
        </DialogHeader>
        {codes ? (
          <BackupCodesSheet codes={codes} onDone={onClose} />
        ) : enrolment ? (
          <div className="space-y-4">
            <TotpEnrolment otpauthUri={enrolment.otpauthUri} secret={enrolment.secret} busy={busy} error={error} onConfirm={confirm} />
            <div className="flex items-center gap-2">
              <Checkbox id="mfa-sign-out-others" checked={signOutOthers} onCheckedChange={(v) => setSignOutOthers(Boolean(v))} />
              <Label htmlFor="mfa-sign-out-others">Sign out my other sessions</Label>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={start}>
            <div className="space-y-2">
              <RequiredLabel htmlFor="mfa-setup-password" required>Password</RequiredLabel>
              <Input
                id="mfa-setup-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                disabled={busy}
                autoFocus
              />
            </div>
            <FormError message={error} />
            <Button type="submit" className="w-full" disabled={busy || !password}>{busy ? "Continue…" : "Continue"}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

/** A current code or a backup code — never the password alone (§ 3.6). */
const DisableDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [value, setValue] = React.useState("");
  const [backup, setBackup] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setValue("");
      setBackup(false);
      setError(null);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    setError(null);
    const res = await disableMfaAction(backup ? undefined : value.trim(), backup ? value.trim() : undefined);
    setBusy(false);
    if (res.status === ActionStatus.SUCCESS) onClose();
    else setError(res.errorMessage ?? null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form className="space-y-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Switch off two-step sign-in?</DialogTitle>
            <DialogDescription>Your password alone will sign you in again, and remembered devices are forgotten.</DialogDescription>
          </DialogHeader>
          <CodeField id="mfa-disable-code" value={value} onChange={setValue} backup={backup} disabled={busy} autoFocus />
          <button type="button" className="text-body text-secondary underline" onClick={() => { setBackup((v) => !v); setValue(""); }}>
            {backup ? "Use the app instead" : "Use a backup code"}
          </button>
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy || !value.trim()}>{busy ? "Switch off…" : "Switch off"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
