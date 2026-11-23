"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckmarkCircle02Icon, Clock01Icon, Download01Icon, EraserIcon, FileValidationIcon, Unlink04Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { FormError } from "@/components/feedback/FormError";
import { internalApiClient } from "@/components/clients/apiClient";
import { ActionStatus } from "@/components/models/ActionStatus";
import { uploadPhoneDrawingAction } from "../actions";
import { CompanyBand, PoweredBy, type SigningBrand } from "./SigningScreen";
import { SignaturePad, type SignaturePadHandle } from "./SignaturePad";

/** A company's page with one message on it (G10–G12): the band, the message in the middle, the footer. */
function Page({ brand, children }: { brand: SigningBrand; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-card">
      <CompanyBand brand={brand} />
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">{children}</main>
      <PoweredBy />
    </div>
  );
}

/** The state's circle, 56: green when it went well — never the accent (G9) — Mist otherwise. */
function Circle({ icon, good }: { icon: typeof CheckmarkCircle02Icon; good?: boolean }) {
  return (
    <span
      className={
        good
          ? "flex size-14 items-center justify-center rounded-pill bg-status-approved-bg text-status-approved-icon"
          : "flex size-14 items-center justify-center rounded-pill bg-mist text-secondary"
      }
    >
      <Icon icon={icon} />
    </span>
  );
}

/** G10: a guest's link that no longer works — the login's dead-link words. */
export function DeadLink({ company, logoUrl }: { company: string | null; logoUrl?: string | null }) {
  const t = useTranslations("signing");
  return (
    <Page brand={{ companyName: company, logoUrl }}>
      <Circle icon={Unlink04Icon} />
      <h1 className="text-section-title text-primary">{t("states.deadLink")}</h1>
      <p className="max-w-[420px] text-body text-secondary">{t("states.deadLinkBody", { company: company ?? "" })}</p>
    </Page>
  );
}

/** G12: the guest's signed copy, by the link they were emailed, for thirty days. */
export function SignedCopy({ token, company, logoUrl }: { token: string; company: string | null; logoUrl?: string | null }) {
  const t = useTranslations("signing");
  const [failed, setFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const r = await internalApiClient.fetch("/signing/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "signed.pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page brand={{ companyName: company, logoUrl }}>
      <Circle icon={failed ? Clock01Icon : FileValidationIcon} good={!failed} />
      <h1 className="text-section-title text-primary">{t("copy.title")}</h1>
      {failed ? (
        <p className="max-w-sm text-body text-secondary">{t("copy.expired", { company: company ?? "" })}</p>
      ) : (
        <>
          <Button type="button" loading={busy} onClick={download}>
            <Icon icon={Download01Icon} size="sm" />
            {t("copy.download")}
          </Button>
          <p className="mt-1 text-hint text-secondary">{t("copy.until")}</p>
        </>
      )}
    </Page>
  );
}

/**
 * The phone page (G03f–G03i): opened by the QR code, one-time and ten minutes, for one signer. A big pad, Clear and
 * Done; Done sends the drawing, and the signer's computer picks it up by itself.
 */
export function PhoneDraw({
  token,
  title,
  signerName,
  brand,
}: {
  token: string;
  title: string;
  signerName: string;
  brand: SigningBrand;
}) {
  const t = useTranslations("signing");
  const pad = React.useRef<SignaturePadHandle>(null);
  const [state, setState] = React.useState<"drawing" | "sent" | "expired">("drawing");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const done = async () => {
    const png = pad.current?.toPng();
    if (!png) {
      setError(t("signature.needDrawing"));
      return;
    }
    setBusy(true);
    const r = await uploadPhoneDrawingAction(token, png);
    setBusy(false);
    if (r.status === ActionStatus.SUCCESS) setState("sent");
    else if (r.code === "D00051") setState("expired");
    else setError(r.errorMessage ?? null);
  };

  if (state !== "drawing") return <PhoneEnd expired={state === "expired"} brand={brand} />;
  return (
    <div className="flex min-h-screen flex-col bg-card">
      <CompanyBand brand={brand} compact />
      <main className="flex flex-1 flex-col p-5 pt-6">
        <h1 className="text-section-title text-primary">{t("phone.title")}</h1>
        <p className="mt-2 text-label font-normal text-secondary">{t("phone.for", { title, name: signerName })}</p>
        <SignaturePad ref={pad} hint={t("phone.pad")} className="mt-4 h-[300px]" />
        <p className="mt-2 text-label font-normal text-secondary">{t("phone.sideways")}</p>
        <FormError message={error} />
        <div className="mt-auto flex gap-2 pt-6">
          <Button type="button" variant="secondary" size="lg" className="w-[136px]" onClick={() => pad.current?.clear()}>
            <Icon icon={EraserIcon} size="sm" />
            {t("phone.clear")}
          </Button>
          <Button type="button" size="lg" className="flex-1" loading={busy} onClick={done}>
            {t("phone.done")}
          </Button>
        </div>
      </main>
      <PoweredBy />
    </div>
  );
}

/** G03h sent, G03i expired or used. */
export function PhoneEnd({ expired, brand }: { expired: boolean; brand: SigningBrand }) {
  const t = useTranslations("signing");
  return (
    <div className="flex min-h-screen flex-col bg-card">
      <CompanyBand brand={brand} compact />
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <Circle icon={expired ? Clock01Icon : CheckmarkCircle02Icon} good={!expired} />
        <h1 className="text-section-title text-primary">{expired ? t("phone.expiredTitle") : t("phone.sentTitle")}</h1>
        <p className="max-w-[280px] text-body text-secondary">{expired ? t("phone.expiredBody") : t("phone.sentBody")}</p>
      </main>
      <PoweredBy />
    </div>
  );
}
