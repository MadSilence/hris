"use client";

import * as React from "react";
import QRCode from "qrcode";
import { useTranslations } from "next-intl";
import { Marck_Script } from "next/font/google";
import { SmartPhone01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { internalApiClient } from "@/components/clients/apiClient";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import type { DrawingPickup, SigningParty } from "@/api/modules/signing/dto";
import { drawingLinkAction } from "../actions";
import { SignaturePad, type SignaturePadHandle } from "./SignaturePad";

/** The typed signature's font (Q-37): an e-signature, not design — an exception to SPEC § 5. */
const marck = Marck_Script({ weight: "400", subsets: ["latin", "cyrillic"], display: "swap" });

export type SignatureValue = { name: string; drawing: string | null };

type Phone = { kind: "off" } | { kind: "qr"; dataUrl: string; expiresAt: number } | { kind: "expired" };

/**
 * "Your signature" (documents-signing G03, G03b–G03e): **Type** — the full name, previewed in Marck Script — or
 * **Draw** — on the pad, or on the phone through a one-time QR code (ten minutes), the profile photo's mechanics: the
 * screen asks every few seconds and the phone's drawing lands on the pad by itself.
 */
export const SignatureInput = React.forwardRef<
  { value: () => SignatureValue | null; error: (message: string | null) => void },
  { party: SigningParty; defaultName: string }
>(function SignatureInput({ party, defaultName }, ref) {
  const t = useTranslations("signing");
  const [mode, setMode] = React.useState<"type" | "draw">("type");
  const [name, setName] = React.useState(defaultName);
  const [error, setError] = React.useState<string | null>(null);
  const [phone, setPhone] = React.useState<Phone>({ kind: "off" });
  const [fromPhone, setFromPhone] = React.useState<string | null>(null);
  const pad = React.useRef<SignaturePadHandle>(null);

  React.useImperativeHandle(ref, () => ({
    error: setError,
    value: () => {
      if (!name.trim()) {
        setError(t("signature.needName"));
        return null;
      }
      if (mode === "type") return { name: name.trim(), drawing: null };
      const drawing = pad.current?.toPng() ?? null;
      if (!drawing) {
        setError(t("signature.needDrawing"));
        return null;
      }
      return { name: name.trim(), drawing };
    },
  }));

  // While the code is on screen, ask for the phone's drawing every three seconds; the code expires on its own.
  React.useEffect(() => {
    if (phone.kind !== "qr") return;
    const timer = window.setInterval(async () => {
      if (Date.now() > phone.expiresAt) {
        setPhone({ kind: "expired" });
        return;
      }
      try {
        const res = await internalApiClient.post<DrawingPickup>("/signing/drawing", { party });
        if (res.drawing) {
          setFromPhone(res.drawing);
          setPhone({ kind: "off" });
        }
      } catch {
        // A missed poll is the next poll's.
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [phone, party]);

  const showQr = async () => {
    const result = await drawingLinkAction(party);
    if (result.status !== ActionStatus.SUCCESS || !result.data) {
      showActionError(result);
      return;
    }
    const url = `${window.location.origin}/m/sign?token=${encodeURIComponent(result.data.token)}`;
    const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 296 });
    setFromPhone(null);
    setPhone({ kind: "qr", dataUrl, expiresAt: Date.parse(result.data.expiresAt) || Date.now() + 10 * 60_000 });
  };

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        options={[
          { value: "type", label: t("signature.type") },
          { value: "draw", label: t("signature.draw") },
        ]}
        value={mode}
        onChange={(v) => {
          setMode(v);
          setError(null);
        }}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signature-name">{t("signature.fullName")}</Label>
        <Input id="signature-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </div>

      {mode === "type" ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-hint text-tertiary">{t("signature.preview")}</p>
          <div className="rounded-card border border-divider bg-subtle px-4 py-3">
            <p className={`${marck.className} text-section-title text-primary`}>{name || " "}</p>
            <div className="mt-1 border-b border-strong" />
          </div>
        </div>
      ) : phone.kind === "qr" ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-strong bg-subtle p-5 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- a data URL made here */}
          <img src={phone.dataUrl} alt="" width={148} height={148} className="rounded-popover border border-divider bg-card" />
          <p className="text-body font-medium text-primary">{t("signature.scan")}</p>
          <p className="text-hint text-secondary">{t("signature.scanBody")}</p>
          <p className="text-hint text-tertiary">{t("signature.scanOnce")}</p>
          <Button type="button" variant="link" onClick={() => setPhone({ kind: "off" })}>
            {t("signature.drawHere")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {fromPhone && (
            <p className="flex items-center gap-1.5 text-hint text-secondary">
              <Icon icon={Tick02Icon} size="sm" />
              {t("signature.fromPhone")}
            </p>
          )}
          <SignaturePad ref={pad} hint={t("signature.padHint")} className="h-40" image={fromPhone} />
          <div className="flex items-center justify-between">
            <Button type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                pad.current?.clear();
                setFromPhone(null);
              }}
            >
              {t("signature.clear")}
            </Button>
            <Button type="button" variant="link" onClick={showQr}>
              <Icon icon={SmartPhone01Icon} size="sm" />
              {t("signature.onPhone")}
            </Button>
          </div>
          {phone.kind === "expired" && (
            <p className="text-hint text-secondary">
              {t("signature.qrExpired")}{" "}
              <Button type="button" variant="link" onClick={showQr}>
                {t("signature.newQr")}
              </Button>
            </p>
          )}
        </div>
      )}
      <FieldError>{error}</FieldError>
    </div>
  );
});
