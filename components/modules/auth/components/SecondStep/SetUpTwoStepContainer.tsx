"use client";

import * as React from "react";
import QRCode from "qrcode";
import { useTranslations } from "next-intl";
import { Alert02Icon, Copy01Icon, Download01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { Button, buttonVariants } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Label } from "@/components/desact/label";
import { Icon } from "@/components/desact/icon";
import { FieldError } from "@/components/desact/field-error";
import { AuthHeading, AuthSplit, CodeInput, type AuthBrand } from "@/components/modules/auth/layout";
import { useAuthService } from "@/components/modules/auth/hooks/useAuthService";
import { ApiError } from "@/components/clients/exceptions";
import { messageForError } from "@/lib/errors/errorMessages";

/*
 * Setting two-step login up inside a login, because the company requires it (sign-in-second-step D4–D6). No back
 * arrow: it cannot be skipped. Two numbered steps on one screen instead of a stepper (the owner's exception), then the
 * backup codes, then the app.
 */

const CODE_WRONG = new Set(["AUTH00006", "AUTH00008"]);

function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      className="gap-1.5"
      onClick={() => {
        void navigator.clipboard?.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
    >
      <Icon icon={copied ? Tick02Icon : Copy01Icon} size="sm" />
      {copied ? done : label}
    </Button>
  );
}

export function SetUpTwoStepContainer({ brand, returnTo }: { brand: AuthBrand; returnTo: string }) {
  const t = useTranslations("auth");
  const auth = useAuthService();
  const [enrolment, setEnrolment] = React.useState<{ otpauthUri: string; secret: string } | null>(null);
  const [qr, setQr] = React.useState<string | null>(null);
  const [showKey, setShowKey] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [codes, setCodes] = React.useState<string[] | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [savedError, setSavedError] = React.useState(false);

  React.useEffect(() => {
    auth.enrolAtSignInStart().then(setEnrolment).catch(() => setFailed(true));
  }, [auth]);

  React.useEffect(() => {
    if (!enrolment) return;
    let alive = true;
    QRCode.toDataURL(enrolment.otpauthUri, { width: 168, margin: 1 })
      .then((url) => alive && setQr(url))
      .catch(() => alive && setShowKey(true));
    return () => { alive = false; };
  }, [enrolment]);

  const confirm = async (value: string = code) => {
    if (busy) return;
    if (value.length < 6) {
      setFieldError(t("fields.codeRequired"));
      return;
    }
    setBusy(true);
    setFieldError(null);
    try {
      const res = await auth.enrolAtSignInConfirm(value);
      setCodes(res.backupCodes);
    } catch (error) {
      if (error instanceof ApiError && error.code && CODE_WRONG.has(error.code)) setFieldError(t("setUp.wrongCode"));
      else setFieldError(messageForError(error));
    } finally {
      setBusy(false);
    }
  };

  if (failed) {
    return (
      <AuthSplit brand={brand}>
        <AuthHeading icon={Alert02Icon} title={t("setUp.failedTitle")} lead={t("setUp.failedBody")} />
        <a href="/login" className={buttonVariants({ size: "lg", className: "w-full" })}>{t("setUp.logInAgain")}</a>
      </AuthSplit>
    );
  }

  if (codes) {
    const text = codes.join("\n");
    const download = () => {
      const url = URL.createObjectURL(new Blob([`${text}\n`], { type: "text/plain" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup-codes.txt";
      a.click();
      URL.revokeObjectURL(url);
    };
    return (
      <AuthSplit brand={brand}>
        <AuthHeading title={t("setUp.codesTitle")} lead={t("setUp.codesLead")} />
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-control bg-mist p-4 font-mono text-body text-primary">
          {codes.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="gap-1.5" onClick={download}>
            <Icon icon={Download01Icon} size="sm" />
            {t("setUp.download")}
          </Button>
          <CopyButton text={text} label={t("setUp.copy")} done={t("setUp.copied")} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id="codes-saved" checked={saved} onCheckedChange={(v) => { setSaved(Boolean(v)); setSavedError(false); }} />
            <Label htmlFor="codes-saved">{t("setUp.saved")}</Label>
          </div>
          <FieldError>{savedError ? t("setUp.confirmSaved") : null}</FieldError>
        </div>
        <Button type="button" size="lg" className="w-full" onClick={() => (saved ? window.location.assign(returnTo) : setSavedError(true))}>
          {t("setUp.continue")}
        </Button>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit brand={brand} long>
      <AuthHeading
        title={t("setUp.title")}
        lead={t("setUp.lead", { company: brand.kind === "company" ? brand.name : "noddo" })}
      />
      <div className="flex flex-col gap-3">
        <p className="text-body font-medium text-primary">{t("setUp.scan")}</p>
        <div className="flex size-[184px] items-center justify-center rounded-control border border-divider bg-card">
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element -- a data URL drawn here
            <img src={qr} alt={t("mfa.enrolment.qrAlt")} width={168} height={168} />
          )}
        </div>
        {showKey && enrolment ? (
          <div className="flex flex-col gap-2">
            <p className="text-hint text-tertiary">{t("setUp.keyLead")}</p>
            <code className="block break-all rounded-control bg-mist px-3 py-2 font-mono text-body">
              {enrolment.secret.replace(/(.{4})/g, "$1 ").trim()}
            </code>
            <div><CopyButton text={enrolment.secret} label={t("setUp.copyKey")} done={t("setUp.copied")} /></div>
          </div>
        ) : (
          <Button type="button" variant="link" className="self-start" onClick={() => setShowKey(true)}>{t("setUp.cantScan")}</Button>
        )}
      </div>
      <form noValidate className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void confirm(); }}>
        <p className="text-body font-medium text-primary">{t("setUp.enterCode")}</p>
        <CodeInput
          label={t("fields.appCode")}
          value={code}
          onChange={(v) => { setCode(v); setFieldError(null); }}
          onComplete={(v) => void confirm(v)}
          invalid={Boolean(fieldError)}
          disabled={busy || !enrolment}
        />
        <FieldError>{fieldError}</FieldError>
        <Button type="submit" size="lg" className="w-full" loading={busy} loadingLabel={t("busy.turningOn")}>
          {t("setUp.turnOn")}
        </Button>
      </form>
    </AuthSplit>
  );
}
