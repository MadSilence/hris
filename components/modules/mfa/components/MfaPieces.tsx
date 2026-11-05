"use client";

import * as React from "react";
import { FieldError } from "@/components/desact/field-error";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { Copy01Icon, Download01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";

/**
 * The six-digit code (MFA_DESIGN.md § 6): numeric keyboard on a phone, and `one-time-code` so a phone that
 * reads codes from its own authenticator can fill it. With `backup`, the twelve-character backup code.
 */
export const CodeField: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  backup?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}> = ({ id, value, onChange, backup = false, disabled, autoFocus }) => {
  const t = useTranslations("auth");
  return (
  <div className="space-y-2">
    <RequiredLabel htmlFor={id} required>{backup ? t("mfa.backupCode") : t("passwordReset.reset.codeLabel")}</RequiredLabel>
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      inputMode={backup ? "text" : "numeric"}
      autoComplete={backup ? "off" : "one-time-code"}
      maxLength={backup ? 14 : 6}
      disabled={disabled}
      autoFocus={autoFocus}
      className="h-11 font-mono"
    />
  </div>
  );
};

/**
 * Setting up an authenticator app: the QR code drawn in the browser from the `otpauth://` address (the
 * seed is never an image on the server), the key for typing in, and the first code.
 */
export const TotpEnrolment: React.FC<{
  otpauthUri: string;
  secret: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: (code: string) => void | Promise<void>;
  confirmLabel?: string;
}> = ({ otpauthUri, secret, busy, error, onConfirm, confirmLabel: confirmLabelProp }) => {
  const t = useTranslations("auth");
  const confirmLabel = confirmLabelProp ?? t("mfa.enrolment.turnOn");
  const [qr, setQr] = React.useState<string | null>(null);
  const [showKey, setShowKey] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [tried, setTried] = React.useState(false);
  const tCommon = useTranslations("common");

  React.useEffect(() => {
    let alive = true;
    QRCode.toDataURL(otpauthUri, { width: 200, margin: 1 })
      .then((url) => alive && setQr(url))
      .catch(() => alive && setShowKey(true));
    return () => {
      alive = false;
    };
  }, [otpauthUri]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (code.trim().length >= 6) void onConfirm(code.trim());
      }}
    >
      <p className="text-body text-tertiary">
        {t("mfa.enrolment.scan")}
      </p>
      <div className="flex justify-center">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element -- a data URL drawn here, nothing to optimise
          <img src={qr} alt={t("mfa.enrolment.qrAlt")} width={200} height={200} className="rounded-control border border-divider" />
        ) : (
          <div className="h-[200px] w-[200px] rounded-control border border-dashed border-divider" />
        )}
      </div>
      {showKey ? (
        <div className="space-y-1 text-center">
          <p className="text-hint text-tertiary">{t("mfa.enrolment.keyPrompt")}</p>
          <code className="block break-all rounded-control bg-subtle px-2 py-1.5 font-mono text-body">
            {secret.replace(/(.{4})/g, "$1 ").trim()}
          </code>
        </div>
      ) : (
        <button type="button" className="mx-auto block text-body text-secondary underline" onClick={() => setShowKey(true)}>
          {t("mfa.enrolment.cantScan")}
        </button>
      )}
      <div>
        <CodeField id="mfa-enrol-code" value={code} onChange={setCode} disabled={busy} />
        <FieldError>{tried && code.trim().length < 6 ? tCommon("validation.enterCode") : null}</FieldError>
      </div>
      <FormError message={error} />
      <Button size="lg" type="submit" className="w-full" disabled={busy}>
        {busy ? `${confirmLabel}…` : confirmLabel}
      </Button>
    </form>
  );
};

/**
 * The ten backup codes, shown once (§ 3.3, § 9.8). The person copies or downloads them and says so
 * before leaving — a lost confirm response leaves a factor without codes.
 */
export const BackupCodesSheet: React.FC<{
  codes: string[];
  onDone: () => void;
  doneLabel?: string;
}> = ({ codes, onDone, doneLabel }) => {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [saved, setSaved] = React.useState(false);
  const [tried, setTried] = React.useState(false);
  const text = codes.join("\n");

  const download = () => {
    const blob = new Blob([`${t("mfa.backupCodes.fileHeading")}\n\n${text}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <p className="text-body text-tertiary">
        {t("mfa.backupCodes.keepSafe")}
      </p>
      <ul className="grid grid-cols-2 gap-2 rounded-control border border-divider bg-subtle p-3 font-mono text-body">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="gap-1.5" onClick={() => void navigator.clipboard?.writeText(text)}>
          <Icon icon={Copy01Icon} size="sm" />
          {tCommon("actions.copy")}
        </Button>
        <Button type="button" variant="secondary" className="gap-1.5" onClick={download}>
          <Icon icon={Download01Icon} size="sm" />
          {tCommon("actions.download")}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="mfa-codes-saved" checked={saved} onCheckedChange={(v) => setSaved(Boolean(v))} />
        <Label htmlFor="mfa-codes-saved">{t("mfa.backupCodes.saved")}</Label>
      </div>
      <FieldError>{tried && !saved ? t("mfa.backupCodes.confirmSaved") : null}</FieldError>
      <Button
        size="lg"
        type="button"
        className="w-full"
        onClick={() => {
          setTried(true);
          if (saved) onDone();
        }}
      >
        {doneLabel ?? tCommon("actions.done")}
      </Button>
    </div>
  );
};
