"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Copy, Download } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
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
}> = ({ id, value, onChange, backup = false, disabled, autoFocus }) => (
  <div className="space-y-2">
    <RequiredLabel htmlFor={id} required>{backup ? "Backup Code" : "Code"}</RequiredLabel>
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      inputMode={backup ? "text" : "numeric"}
      autoComplete={backup ? "off" : "one-time-code"}
      maxLength={backup ? 14 : 6}
      disabled={disabled}
      autoFocus={autoFocus}
      className="h-11 font-mono tracking-widest"
    />
  </div>
);

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
}> = ({ otpauthUri, secret, busy, error, onConfirm, confirmLabel = "Turn On" }) => {
  const [qr, setQr] = React.useState<string | null>(null);
  const [showKey, setShowKey] = React.useState(false);
  const [code, setCode] = React.useState("");

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
        if (code.trim()) void onConfirm(code.trim());
      }}
    >
      <p className="text-sm text-muted-foreground">
        Scan this with an authenticator app — Google Authenticator, Microsoft Authenticator, 1Password or any other —
        then type the six-digit code it shows.
      </p>
      <div className="flex justify-center">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element -- a data URL drawn here, nothing to optimise
          <img src={qr} alt="QR code for your authenticator app" width={200} height={200} className="rounded-md border border-brown-200" />
        ) : (
          <div className="h-[200px] w-[200px] rounded-md border border-dashed border-brown-200" />
        )}
      </div>
      {showKey ? (
        <div className="space-y-1 text-center">
          <p className="text-xs text-muted-foreground">Enter this key in the app instead:</p>
          <code className="block break-all rounded bg-brown-50 px-2 py-1.5 font-mono text-sm tracking-wider">
            {secret.replace(/(.{4})/g, "$1 ").trim()}
          </code>
        </div>
      ) : (
        <button type="button" className="mx-auto block text-sm text-brown-600 underline" onClick={() => setShowKey(true)}>
          Can&apos;t scan? Enter a key instead
        </button>
      )}
      <CodeField id="mfa-enrol-code" value={code} onChange={setCode} disabled={busy} />
      <FormError message={error} />
      <Button type="submit" className="h-11 w-full" disabled={busy || code.trim().length < 6}>
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
}> = ({ codes, onDone, doneLabel = "Done" }) => {
  const [saved, setSaved] = React.useState(false);
  const text = codes.join("\n");

  const download = () => {
    const blob = new Blob([`Backup codes — each works once.\n\n${text}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Keep these somewhere safe. If you lose your phone, each one signs you in once. They are not shown again.
      </p>
      <ul className="grid grid-cols-2 gap-2 rounded-lg border border-brown-200 bg-brown-50 p-3 font-mono text-sm">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="gap-1.5" onClick={() => void navigator.clipboard?.writeText(text)}>
          <Copy className="h-4 w-4" />
          Copy
        </Button>
        <Button type="button" variant="outline" className="gap-1.5" onClick={download}>
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="mfa-codes-saved" checked={saved} onCheckedChange={(v) => setSaved(Boolean(v))} />
        <Label htmlFor="mfa-codes-saved">I have saved these codes</Label>
      </div>
      <Button type="button" className="h-11 w-full" disabled={!saved} onClick={onDone}>
        {doneLabel}
      </Button>
    </div>
  );
};
