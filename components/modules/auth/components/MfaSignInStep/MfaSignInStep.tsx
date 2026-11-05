"use client";

import * as React from "react";
import { FieldError } from "@/components/desact/field-error";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Label } from "@/components/desact/label";
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
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const auth = useAuthService();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [code, setCode] = React.useState("");
  // The button is always pressable (C2): pressing it empty says so under the field.
  const [tried, setTried] = React.useState(false);
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
    if (busy) return;
    setTried(true);
    if (!code.trim()) return;
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
        <h1 className="text-page-title">{t("mfaSignIn.backupUsed.title")}</h1>
        <p className="text-body text-tertiary">
          {t("mfaSignIn.backupUsed.body", { count: codesLeft })}
        </p>
        <Button type="button" size="lg" className="w-full" onClick={open}>{tCommon("actions.continue")}</Button>
      </div>
    );
  }

  if (mode === "ENROL") {
    return (
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-page-title">{t("mfaSignIn.enrol.title")}</h1>
          <p className="text-body text-tertiary">{t("mfaSignIn.enrol.description")}</p>
        </div>
        {codes ? (
          <BackupCodesSheet codes={codes} onDone={open} doneLabel={tCommon("actions.continue")} />
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
              <Button type="button" variant="secondary" className="w-full" onClick={onRestart}>
                {t("mfaSignIn.signInAgain")}
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
        <h1 className="text-page-title">{t("mfaSignIn.challenge.title")}</h1>
        <p className="text-body text-tertiary">
          {useBackup ? t("mfaSignIn.challenge.backupPrompt") : t("mfaSignIn.challenge.appPrompt")}
        </p>
      </div>
      <form className="space-y-5" onSubmit={submit} noValidate>
        <div>
          <CodeField id="mfa-code" value={code} onChange={setCode} backup={useBackup} disabled={busy} autoFocus />
          <FieldError>{tried && !code.trim() ? tCommon("validation.enterCode") : null}</FieldError>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="mfa-remember" checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} disabled={busy} />
          <Label htmlFor="mfa-remember">{t("mfaSignIn.challenge.rememberDevice")}</Label>
        </div>
        <FormError message={error} />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? t("mfaSignIn.challenge.checking") : t("login.submit")}
        </Button>
      </form>
      <div className="flex justify-between text-body">
        <button
          type="button"
          className="text-secondary underline"
          onClick={() => {
            setUseBackup((v) => !v);
            setCode("");
            setError(null);
          }}
        >
          {useBackup ? t("mfaSignIn.challenge.useApp") : t("mfaSignIn.challenge.useBackup")}
        </button>
        <button type="button" className="text-secondary underline" onClick={onRestart}>
          {t("mfaSignIn.challenge.startOver")}
        </button>
      </div>
    </div>
  );
};

export default MfaSignInStep;
