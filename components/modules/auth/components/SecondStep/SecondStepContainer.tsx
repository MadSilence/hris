"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckmarkCircle02Icon, Clock01Icon, Alert02Icon } from "@hugeicons/core-free-icons";

import { Button, buttonVariants } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { AuthBack, AuthHeading, AuthSplit, CodeInput, type AuthBrand } from "@/components/modules/auth/layout";
import { useAuthService } from "@/components/modules/auth/hooks/useAuthService";
import { ApiError } from "@/components/clients/exceptions";
import { messageForError } from "@/lib/errors/errorMessages";
import { SetUpTwoStepContainer } from "./SetUpTwoStepContainer";

/*
 * The second step of a login (sign-in-second-step D1–D3 and the timeout; D3's "Set up again" hands over to D4–D5 for a
 * new phone), on its own route — the challenge is a cookie
 * this page cannot read, so the page asks the server what it is: whether *Remember this device* is offered and for how
 * many days (0 = not offered: the company does not allow it, or a System Owner).
 */

const CHALLENGE_GONE = "AUTH00007";
const CODE_WRONG = "AUTH00006";

export function SecondStepContainer({ brand, returnTo }: { brand: AuthBrand; returnTo: string }) {
  const t = useTranslations("auth");
  const auth = useAuthService();
  const [useBackup, setUseBackup] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [rememberDays, setRememberDays] = React.useState(0);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [timedOut, setTimedOut] = React.useState(false);
  const [codesLeft, setCodesLeft] = React.useState<number | null>(null);
  const [settingUp, setSettingUp] = React.useState(false);

  // Asked once: after a backup code logs in, the challenge is spent, and asking again (a new client once the session
  // cookie is set) answered "gone" and put "Your login timed out" over D3 (walk of 2026-11-19).
  const described = React.useRef(false);
  React.useEffect(() => {
    if (described.current) return;
    described.current = true;
    auth.describeMfaChallenge()
      .then((v) => setRememberDays(v.rememberDays))
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.code === CHALLENGE_GONE) setTimedOut(true);
      });
  }, [auth]);

  const open = () => window.location.assign(returnTo);

  const submit = async (value: string = code) => {
    if (busy) return;
    if (!value.trim()) {
      setFieldError(useBackup ? t("fields.backupCodeRequired") : t("fields.codeRequired"));
      return;
    }
    setBusy(true);
    setFieldError(null);
    try {
      const rememberDevice = remember && rememberDays > 0;
      const res = await auth.verifyMfa(useBackup ? { backupCode: value.trim(), rememberDevice } : { code: value.trim(), rememberDevice });
      if (useBackup && res.backupCodesLeft != null) {
        setCodesLeft(res.backupCodesLeft);
        return;
      }
      open();
    } catch (error) {
      if (error instanceof ApiError && error.code === CHALLENGE_GONE) setTimedOut(true);
      else if (error instanceof ApiError && error.code === CODE_WRONG) setFieldError(useBackup ? t("secondStep.wrongBackup") : t("secondStep.wrongCode"));
      else setFieldError(messageForError(error));
    } finally {
      setBusy(false);
    }
  };

  if (timedOut && codesLeft === null) {
    return (
      <AuthSplit brand={brand}>
        <AuthHeading icon={Clock01Icon} title={t("secondStep.timedOut.title")} lead={t("secondStep.timedOut.body")} />
        <a href="/login" className={buttonVariants({ size: "lg", className: "w-full" })}>{t("secondStep.timedOut.action")}</a>
      </AuthSplit>
    );
  }

  // D3's "Set up again" (Q-17): D4 and D5 for a new phone, inside the session the backup code just opened.
  if (codesLeft != null && settingUp) {
    return <SetUpTwoStepContainer brand={brand} returnTo={returnTo} replace />;
  }

  if (codesLeft != null) {
    const last = codesLeft === 0;
    // With one code left or none, D3 offers to set a new phone up; with more, only *Continue*.
    const offerSetUp = codesLeft <= 1;
    return (
      <AuthSplit brand={brand}>
        <AuthHeading
          icon={last ? Alert02Icon : CheckmarkCircle02Icon}
          tone={last ? "grey" : "accent"}
          title={t("secondStep.backupUsed.title")}
          lead={last ? t("secondStep.backupUsed.last") : t("secondStep.backupUsed.left", { count: codesLeft })}
        />
        {offerSetUp ? (
          <div className="flex flex-col gap-2">
            <Button type="button" size="lg" className="w-full" onClick={() => setSettingUp(true)}>
              {t("secondStep.backupUsed.setUpAgain")}
            </Button>
            <Button type="button" size="lg" variant="secondary" className="w-full" onClick={open}>
              {t("secondStep.backupUsed.later")}
            </Button>
          </div>
        ) : (
          <Button type="button" size="lg" className="w-full" onClick={open}>{t("secondStep.backupUsed.continue")}</Button>
        )}
      </AuthSplit>
    );
  }

  const back = useBackup
    ? <AuthBack onClick={() => { setUseBackup(false); setCode(""); setFieldError(null); }} />
    : <AuthBack href="/login" />;

  return (
    <AuthSplit brand={brand} back={back}>
      <AuthHeading title={t("secondStep.title")} lead={useBackup ? t("secondStep.backupLead") : t("secondStep.appLead")} />
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => { e.preventDefault(); void submit(); }}
      >
        {useBackup ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="backup-code">{t("fields.backupCode")}</Label>
            <Input
              id="backup-code"
              value={code}
              onChange={(e) => { setCode(e.currentTarget.value); setFieldError(null); }}
              autoComplete="one-time-code"
              aria-invalid={Boolean(fieldError)}
              className="h-11 font-mono"
              autoFocus
            />
            <FieldError>{fieldError}</FieldError>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <CodeInput
              label={t("fields.appCode")}
              value={code}
              onChange={(v) => { setCode(v); setFieldError(null); }}
              onComplete={(v) => void submit(v)}
              invalid={Boolean(fieldError)}
              disabled={busy}
              autoFocus
            />
            <FieldError>{fieldError}</FieldError>
          </div>
        )}
        {rememberDays > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox id="mfa-remember" checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} disabled={busy} />
            <Label htmlFor="mfa-remember">{t("mfaSignIn.challenge.rememberDevice", { days: rememberDays })}</Label>
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" loading={busy} loadingLabel={t("busy.loggingIn")}>
          {t("secondStep.submit")}
        </Button>
      </form>
      {!useBackup && (
        // A link 13/18 500 accent-text, 28 under the form — the step's own gap (the designers' login fix D7).
        <button type="button" className="self-start text-label text-accent-text underline-offset-4 hover:underline"
                onClick={() => { setUseBackup(true); setCode(""); setFieldError(null); }}>
          {t("secondStep.useBackup")}
        </button>
      )}
    </AuthSplit>
  );
}
