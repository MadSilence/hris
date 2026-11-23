"use client";

import * as React from "react";
import QRCode from "qrcode";
import { useTranslations } from "next-intl";
import { Marck_Script } from "next/font/google";
import { EraserIcon, PenTool01Icon, PencilEdit02Icon, SmartPhone01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { cn } from "@/lib/cn";
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
  // Clear shows only once there is ink (G03b against G03c).
  const [inked, setInked] = React.useState(false);
  const pad = React.useRef<SignaturePadHandle>(null);

  React.useImperativeHandle(ref, () => ({
    error: setError,
    value: () => {
      // The name is asked on Type only (G5); a drawn signature carries the signer's name as the company knows it.
      const signedName = (mode === "type" ? name : name || defaultName).trim();
      if (!signedName) {
        setError(t("signature.needName"));
        return null;
      }
      if (mode === "type") return { name: signedName, drawing: null };
      const drawing = pad.current?.toPng() ?? null;
      if (!drawing) {
        setError(t("signature.needDrawing"));
        return null;
      }
      return { name: signedName, drawing };
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
    <div className="flex flex-col">
      <SegmentedControl
        options={[
          {
            value: "type",
            label: (
              <span className="flex items-center gap-1.5">
                <Icon icon={PencilEdit02Icon} size="sm" />
                {t("signature.type")}
              </span>
            ),
          },
          {
            value: "draw",
            label: (
              <span className="flex items-center gap-1.5">
                <Icon icon={PenTool01Icon} size="sm" />
                {t("signature.draw")}
              </span>
            ),
          },
        ]}
        value={mode}
        onChange={(v) => {
          setMode(v);
          setError(null);
        }}
      />

      {mode === "type" ? (
        <>
          <div className="mt-3.5 flex flex-col gap-1.5">
            <Label htmlFor="signature-name">{t("signature.fullName")}</Label>
            <Input id="signature-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div className="mt-2.5 flex flex-col gap-0.5 rounded-card bg-mist px-3.5 py-3">
            <p className={cn(marck.className, "truncate text-page-title font-normal text-primary")}>{name || " "}</p>
            <p className="text-hint text-tertiary">{t("signature.preview")}</p>
          </div>
        </>
      ) : phone.kind === "qr" ? (
        <div className="mt-4.5 flex flex-col items-center">
          <div className="flex w-full flex-col items-center gap-2 rounded-card border border-dashed border-strong p-5 text-center">
            <span className="rounded-popover border border-divider bg-card p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- a data URL made here */}
              <img src={phone.dataUrl} alt="" width={148} height={148} />
            </span>
            <p className="mt-2 text-body font-semibold text-primary">{t("signature.scan")}</p>
            <p className="text-hint text-tertiary">{t("signature.scanBody")}</p>
            <p className="mt-3 text-hint text-tertiary">{t("signature.scanOnce")}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" className="mt-3.5 text-secondary" onClick={() => setPhone({ kind: "off" })}>
            {t("signature.drawHere")}
          </Button>
        </div>
      ) : (
        <div className="mt-4.5 flex flex-col">
          <SignaturePad ref={pad} hint={t("signature.padHint")} className="h-[180px]" image={fromPhone} onChangeAction={setInked} />
          <div className="mt-2.5 flex min-h-8 items-center justify-between gap-2">
            {fromPhone ? (
              <p className="text-hint text-tertiary">{t("signature.fromPhone")}</p>
            ) : inked ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 text-secondary"
                onClick={() => {
                  pad.current?.clear();
                  setFromPhone(null);
                }}
              >
                <Icon icon={EraserIcon} size="sm" />
                {t("signature.clear")}
              </Button>
            ) : (
              <span />
            )}
            {fromPhone ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-mr-2 text-secondary"
                onClick={() => {
                  pad.current?.clear();
                  setFromPhone(null);
                }}
              >
                <Icon icon={EraserIcon} size="sm" />
                {t("signature.clear")}
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" className="-mr-2 text-accent-text" onClick={showQr}>
                <Icon icon={SmartPhone01Icon} size="sm" />
                {t("signature.onPhone")}
              </Button>
            )}
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
