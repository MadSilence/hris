"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Clock01Icon, Download04Icon, Tick02Icon, Unlink01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { FormError } from "@/components/feedback/FormError";
import { internalApiClient } from "@/components/clients/apiClient";
import { ActionStatus } from "@/components/models/ActionStatus";
import { uploadPhoneDrawingAction } from "../actions";
import { PoweredBy } from "./SigningScreen";
import { SignaturePad, type SignaturePadHandle } from "./SignaturePad";

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">{children}</main>
      <PoweredBy />
    </div>
  );
}

function Circle({ icon, good }: { icon: typeof Tick02Icon; good?: boolean }) {
  return (
    <span
      className={
        good
          ? "flex size-12 items-center justify-center rounded-pill bg-accent-subtle text-accent-text"
          : "flex size-12 items-center justify-center rounded-pill bg-mist text-secondary"
      }
    >
      <Icon icon={icon} />
    </span>
  );
}

/** G10: a guest's link that no longer works — the login's dead-link words. */
export function DeadLink({ company }: { company: string | null }) {
  const t = useTranslations("signing");
  return (
    <Page>
      <Circle icon={Unlink01Icon} />
      <h1 className="text-section-title text-primary">{t("states.deadLink")}</h1>
      <p className="max-w-sm text-body text-secondary">{t("states.deadLinkBody", { company: company ?? "" })}</p>
    </Page>
  );
}

/** G12: the guest's signed copy, by the link they were emailed, for thirty days. */
export function SignedCopy({ token, company }: { token: string; company: string | null }) {
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
    <Page>
      <Circle icon={failed ? Clock01Icon : Tick02Icon} good={!failed} />
      <h1 className="text-section-title text-primary">{t("copy.title")}</h1>
      {failed ? (
        <p className="max-w-sm text-body text-secondary">{t("copy.expired", { company: company ?? "" })}</p>
      ) : (
        <>
          <Button type="button" size="lg" loading={busy} onClick={download}>
            <Icon icon={Download04Icon} size="sm" />
            {t("copy.download")}
          </Button>
          <p className="text-hint text-tertiary">{t("copy.until")}</p>
        </>
      )}
    </Page>
  );
}

/**
 * The phone page (G03f–G03i): opened by the QR code, one-time and ten minutes, for one signer. A big pad, Clear and
 * Done; Done sends the drawing, and the signer's computer picks it up by itself.
 */
export function PhoneDraw({ token, title, signerName }: { token: string; title: string; signerName: string }) {
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

  if (state !== "drawing") return <PhoneEnd expired={state === "expired"} />;
  return (
    <div className="flex min-h-screen flex-col bg-card">
      <div className="h-[52px] shrink-0 bg-accent" />
      <main className="flex flex-1 flex-col gap-3 p-5">
        <h1 className="text-section-title text-primary">{t("phone.title")}</h1>
        <p className="text-hint text-secondary">{t("phone.for", { title, name: signerName })}</p>
        <SignaturePad ref={pad} hint={t("phone.pad")} className="min-h-[260px] flex-1" />
        <p className="text-hint text-tertiary">{t("phone.sideways")}</p>
        <FormError message={error} />
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => pad.current?.clear()}>
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
export function PhoneEnd({ expired }: { expired: boolean }) {
  const t = useTranslations("signing");
  return (
    <div className="flex min-h-screen flex-col bg-card">
      <div className="h-[52px] shrink-0 bg-accent" />
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <Circle icon={expired ? Clock01Icon : Tick02Icon} good={!expired} />
        <h1 className="text-section-title text-primary">{expired ? t("phone.expiredTitle") : t("phone.sentTitle")}</h1>
        <p className="max-w-xs text-body text-secondary">{expired ? t("phone.expiredBody") : t("phone.sentBody")}</p>
      </main>
      <PoweredBy />
    </div>
  );
}
