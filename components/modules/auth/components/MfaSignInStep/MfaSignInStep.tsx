"use client";

import * as React from "react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Label } from "@/public/desact/src/components/ui/label";
import { FormError } from "@/components/feedback/FormError";
import { messageForError } from "@/lib/errors/errorMessages";
import { useAuthService } from "@/components/modules/auth/hooks/useAuthService";
import { BackupCodesSheet, CodeField, TotpEnrolment } from "@/components/modules/mfa/components";

/**
 * The second step of a sign-in (MFA_DESIGN.md § 6) — a state of the login screen, not a route of its own.
 *
 * `CHALLENGE`: the code from the authenticator app, or a backup code, and *Remember this device*. `ENROL`:
 * the company requires a factor the person has not got, so it is set up here, inside the sign-in, and the
 * backup codes are shown before the app opens. Refusals stay inline — never a card.
 */
export const MfaSignInStep: React.FC<{
  mode: "CHALLENGE" | "ENROL";
  /** Where the app opens once the step is done — already checked on the server. */
  returnTo: string;
  /** Back to the password, when the challenge has died. */
  onRestart: () => void;
}> = ({ mode, returnTo, onRestart }) => {
  const auth = useAuthService();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [code, setCode] = React.useState("");
  const [useBackup, setUseBackup] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [enrolment, setEnrolment] = React.useState<{ otpauthUri: string; secret: string } | null>(null);
  const [codes, setCodes] = React.useState<string[] | null>(null);
  const [codesLeft, setCodesLeft] = React.useState<number | null>(null);

  // A full navigation, as after a password: signing in changes identity and the layout reads the cookie.
  const open = React.useCallback(() => window.location.assign(returnTo), [returnTo]);

  React.useEffect(() => {
    if (mode !== "ENROL") return;
    auth.enrolAtSignInStart().then(setEnrolment).catch((e: unknown) => setError(messageForError(e)));
  }, [auth, mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await auth.verifyMfa(useBackup ? { backupCode: code.trim(), rememberDevice: remember } : { code: code.trim(), rememberDevice: remember });
      if (useBackup && res.backupCodesLeft != null) {
        // A backup code was spent: say how many are left before going on, and where to set up a new phone.
        setCodesLeft(res.backupCodesLeft);
        return;
      }
      open();
    } catch (err) {
      setError(messageForError(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmEnrolment = async (first: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await auth.enrolAtSignInConfirm(first);
      setCodes(res.backupCodes);
    } catch (err) {
      setError(messageForError(err));
    } finally {
      setBusy(false);
    }
  };

  if (codesLeft != null) {
    return (
      <div className="w-full space-y-6 text-center">
        <h1 className="text-3xl font-medium">Signed in with a backup code</h1>
        <p className="text-sm text-muted-foreground">
          {codesLeft === 1 ? "1 backup code is left." : `${codesLeft} backup codes are left.`} If you have lost your phone,
          set up a new one in My Preferences → Two-Step Sign-In.
        </p>
        <Button type="button" className="h-11 w-full" onClick={open}>Continue</Button>
      </div>
    );
  }

  if (mode === "ENROL") {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium">Set up two-step sign-in</h1>
          <p className="text-sm text-muted-foreground">Your company asks for a second step when you sign in.</p>
        </div>
        {codes ? (
          <BackupCodesSheet codes={codes} onDone={open} doneLabel="Continue" />
        ) : enrolment ? (
          <TotpEnrolment
            otpauthUri={enrolment.otpauthUri}
            secret={enrolment.secret}
            busy={busy}
            error={error}
            onConfirm={confirmEnrolment}
          />
        ) : (
          <>
            <FormError message={error} />
            {error && (
              <Button type="button" variant="outline" className="w-full" onClick={onRestart}>
                Sign In Again
              </Button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-medium">Two-step sign-in</h1>
        <p className="text-sm text-muted-foreground">
          {useBackup ? "Enter one of your backup codes." : "Enter the six-digit code from your authenticator app."}
        </p>
      </div>
      <form className="space-y-5" onSubmit={submit} noValidate>
        <CodeField id="mfa-code" value={code} onChange={setCode} backup={useBackup} disabled={busy} autoFocus />
        <div className="flex items-center gap-2">
          <Checkbox id="mfa-remember" checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} disabled={busy} />
          <Label htmlFor="mfa-remember">Remember this device</Label>
        </div>
        <FormError message={error} />
        <Button type="submit" className="h-11 w-full" disabled={busy || !code.trim()}>
          {busy ? "Checking…" : "Sign in"}
        </Button>
      </form>
      <div className="flex justify-between text-sm">
        <button
          type="button"
          className="text-brown-600 underline"
          onClick={() => {
            setUseBackup((v) => !v);
            setCode("");
            setError(null);
          }}
        >
          {useBackup ? "Use the app instead" : "Use a backup code"}
        </button>
        <button type="button" className="text-brown-600 underline" onClick={onRestart}>
          Start over
        </button>
      </div>
    </div>
  );
};

export default MfaSignInStep;
