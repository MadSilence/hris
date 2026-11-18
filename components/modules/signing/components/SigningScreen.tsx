"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft01Icon, Download04Icon, SignatureIcon, Tick02Icon, Clock01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { NodRing } from "@/components/desact/nod";
import { internalApiClient } from "@/components/clients/apiClient";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useDateFormatter } from "@/lib/date";
import type { EnvelopeDTO, EnvelopeSignerDTO, SigningParty } from "@/api/modules/signing/dto";
import { declineSigningAction, sendSigningCodeAction, signAction } from "../actions";
import { CodeBoxes } from "./CodeBoxes";
import { PdfViewer } from "@/components/ui/PdfViewer";
import { SignatureInput, type SignatureValue } from "./SignatureInput";
import { SignerChain } from "./SignerChain";

type Step = "read" | "code" | "signature" | "signed" | "declining" | "declined";

const browserToken = (): string => {
  try {
    const kept = window.sessionStorage.getItem("noddo.signing.browser");
    if (kept) return kept;
    const fresh = crypto.randomUUID();
    window.sessionStorage.setItem("noddo.signing.browser", fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
};

/**
 * The signing screen (documents-signing G02–G08, G09–G11, P08): the document on the left, on the right who asks, the
 * step chain, Sign and Decline. Sign sends a code to the signer's email; the code, then the signature — typed or drawn
 * — sign it. One screen for the three signers: a person in the company, a guest by their link, a new joiner from
 * their preboarding page; `party` says which, and what they hold.
 */
export function SigningScreen({
  party,
  envelope,
  youSignerId,
  senderName,
  backHref,
  backLabel,
  brand,
}: {
  party: SigningParty;
  envelope: EnvelopeDTO;
  /** Which of the signers is the reader; null when the backend did not say. */
  youSignerId: string | null;
  senderName: string;
  backHref: string | null;
  backLabel: string;
  /** A guest's or a joiner's page wears the company's name; the app's own screen does not. */
  brand?: { companyName: string | null } | null;
}) {
  const t = useTranslations("signing");
  const formatDate = useDateFormatter();
  const [step, setStep] = React.useState<Step>("read");
  const [pdf, setPdf] = React.useState<string | null>(null);
  const [pdfFailed, setPdfFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [codeInvalid, setCodeInvalid] = React.useState(false);
  const [code, setCode] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [comment, setComment] = React.useState("");
  const [commentError, setCommentError] = React.useState<string | null>(null);
  const signature = React.useRef<{ value: () => SignatureValue | null; error: (m: string | null) => void }>(null);
  const token = React.useRef<string>("");

  const you: EnvelopeSignerDTO | null = envelope.signers.find((s) => s.id === youSignerId) ?? null;
  const open = envelope.status === "SENT";
  const yourTurn = open && you?.status === "PENDING";
  const waiting = open && you?.status === "WAITING";
  const firstPending = envelope.signers.find((s) => s.status === "PENDING");
  // Formatted once in the browser: a guest's page is rendered on the server, which cannot know the browser's own date
  // order, and the two disagreed — "18 Dec 2026" against "Dec 18, 2026", a hydration error (walk of 2026-11-18).
  const [mounted, setMounted] = React.useState(false);
  // The last signature: the copy is already on its way, not "when everyone has signed" (walk of 2026-11-18).
  const [completed, setCompleted] = React.useState(false);
  const due = mounted ? formatDate(envelope.expiresAt, { style: "medium" }) : "";

  React.useEffect(() => {
    token.current = browserToken();
    setMounted(true);
  }, []);

  // The document, as bytes into an object URL: the browser's own viewer shows it (no viewer of our own — QUESTION A2).
  React.useEffect(() => {
    if (!open && envelope.status !== "COMPLETED") return;
    let url: string | null = null;
    let cancelled = false;
    internalApiClient
      .fetch("/signing/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ party }) })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPdf(url);
      })
      .catch(() => !cancelled && setPdfFailed(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [party, open, envelope.status]);

  const startSigning = async () => {
    setBusy(true);
    setFormError(null);
    const r = await sendSigningCodeAction(party, token.current);
    setBusy(false);
    if (r.status !== ActionStatus.SUCCESS) {
      setFormError(r.errorMessage ?? null);
      return;
    }
    setCodeInvalid(false);
    setStep("code");
  };

  const resend = async () => {
    setFormError(null);
    const r = await sendSigningCodeAction(party, token.current);
    if (r.status !== ActionStatus.SUCCESS) setFormError(r.errorMessage ?? null);
  };

  const finish = async () => {
    const value = signature.current?.value();
    if (!value || !code) return;
    setBusy(true);
    setFormError(null);
    const r = await signAction(party, { code, signedName: value.name, browserToken: token.current, drawing: value.drawing });
    setBusy(false);
    if (r.status === ActionStatus.SUCCESS) {
      setCompleted(Boolean(r.data?.completed));
      setStep("signed");
      return;
    }
    if (r.code === "D00044") {
      // The code went stale while the signature was being drawn: back to a fresh one.
      setCodeInvalid(true);
      setStep("code");
    }
    setFormError(r.errorMessage ?? null);
  };

  const decline = async () => {
    if (!comment.trim()) {
      setCommentError(t("decline.needComment"));
      return;
    }
    setBusy(true);
    const r = await declineSigningAction(party, comment.trim());
    setBusy(false);
    if (r.status !== ActionStatus.SUCCESS) {
      setFormError(r.errorMessage ?? null);
      return;
    }
    setStep("declined");
  };

  // G08: closed — the document is not shown.
  if (!open && step !== "signed" && step !== "declined") {
    return (
      <Centered>
        <StateCircle icon={Clock01Icon} />
        <h1 className="text-section-title text-primary">{t("states.closed")}</h1>
        <p className="max-w-sm text-body text-secondary">{t("states.closedBody")}</p>
        {backHref && (
          <Button asChild variant="secondary">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        )}
      </Centered>
    );
  }

  const panel = (() => {
    switch (step) {
      case "code":
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-card-title text-primary">{t("code.title")}</h2>
            <p className="text-body text-secondary">
              {you?.email ? t("code.body", { email: you.email }) : t("code.bodyNoEmail")}
            </p>
            <CodeBoxes
              invalid={codeInvalid}
              disabled={busy}
              onCompleteAction={(c) => {
                setCode(c);
                setCodeInvalid(false);
                setStep("signature");
              }}
            />
            <FieldError>{codeInvalid ? formError : null}</FieldError>
            <Button type="button" variant="link" onClick={resend}>
              {t("code.resend")}
            </Button>
          </div>
        );
      case "signature":
        return (
          <div className="flex flex-col gap-4">
            <p className="flex items-center gap-1.5 text-label text-status-approved-text">
              <Icon icon={Tick02Icon} size="sm" />
              {t("signature.confirmed")}
            </p>
            <SignatureInput ref={signature} party={party} defaultName={you?.name ?? ""} />
            <FormError message={codeInvalid ? null : formError} />
            <Button type="button" size="lg" className="w-full" loading={busy} onClick={finish}>
              <Icon icon={SignatureIcon} size="sm" />
              {t("signature.sign")}
            </Button>
          </div>
        );
      case "signed": {
        const next = envelope.signers.filter((s) => s.status === "WAITING" && s.id !== youSignerId);
        return (
          <div className="flex flex-col gap-4">
            <StateCircle icon={Tick02Icon} tone="good" />
            <h2 className="text-card-title text-primary">{t("signed.title")}</h2>
            {!completed && next.length > 0 && (
              <div className="rounded-card border border-divider bg-subtle p-3">
                <p className="text-hint text-tertiary">{t("signed.next")}</p>
                <p className="text-body text-primary">{next.map((s) => s.name).join(", ")}</p>
              </div>
            )}
            <p className="text-body text-secondary">
              {completed
                ? party.kind === "guest" ? t("signed.guestCopyNow") : t("signed.copyNow")
                : party.kind === "guest" ? t("signed.guestCopy") : t("signed.copyLater")}
            </p>
            <p className="text-hint text-tertiary">{t("signed.certificate")}</p>
            {backHref && (
              <Button asChild variant="secondary">
                <Link href={backHref}>{backLabel}</Link>
              </Button>
            )}
          </div>
        );
      }
      case "declining":
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-card-title text-primary">{t("decline.title")}</h2>
            <p className="text-body text-secondary">{t("decline.body", { name: senderName })}</p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="decline-comment">{t("decline.comment")} *</Label>
              <Textarea
                id="decline-comment"
                value={comment}
                aria-invalid={commentError ? true : undefined}
                placeholder={t("decline.placeholder")}
                onChange={(e) => {
                  setComment(e.target.value);
                  setCommentError(null);
                }}
              />
              <FieldError>{commentError}</FieldError>
            </div>
            <FormError message={formError} />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep("read")}>
                {t("decline.cancel")}
              </Button>
              <Button type="button" variant="destructive-confirm" loading={busy} onClick={decline}>
                {t("decline.submit")}
              </Button>
            </div>
          </div>
        );
      case "declined":
        return (
          <div className="flex flex-col gap-4">
            <p className="text-body text-secondary">{t("decline.done", { name: senderName })}</p>
            {backHref && (
              <Button asChild variant="secondary">
                <Link href={backHref}>{backLabel}</Link>
              </Button>
            )}
          </div>
        );
      default:
        return (
          <div className="flex h-full flex-col gap-5">
            <h2 className="text-card-title text-primary">{t("screen.asks", { name: senderName })}</h2>
            <div className="flex flex-col gap-3">
              <p className="text-label text-tertiary">{t("screen.whoSigns")}</p>
              <SignerChain signers={envelope.signers} youId={youSignerId} />
            </div>
            {waiting && (
              <div className="rounded-card border border-divider bg-subtle p-3">
                <p className="text-body font-medium text-primary">{t("states.notYourTurn")}</p>
                <p className="text-hint text-secondary">
                  {firstPending
                    ? t("states.notYourTurnBody", { name: firstPending.name })
                    : t("states.notYourTurnSomebody")}
                </p>
              </div>
            )}
            <div className="mt-auto flex flex-col gap-2">
              {yourTurn && <p className="text-hint text-secondary">{t("screen.hint")}</p>}
              <FormError message={formError} />
              {yourTurn && (
                <Button type="button" size="lg" className="w-full" loading={busy} onClick={startSigning}>
                  <Icon icon={SignatureIcon} size="sm" />
                  {t("screen.sign")}
                </Button>
              )}
              {yourTurn && party.kind !== "joiner" && (
                <Button type="button" variant="secondary" size="lg" className="w-full" onClick={() => setStep("declining")}>
                  {t("screen.decline")}
                </Button>
              )}
            </div>
          </div>
        );
    }
  })();

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-page">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-divider bg-card px-4">
        {backHref && (
          <Button asChild variant="ghost" size="icon" aria-label={t("screen.back")}>
            <Link href={backHref}>
              <Icon icon={ArrowLeft01Icon} />
            </Link>
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium text-primary">{envelope.title}</p>
          <p className="truncate text-hint text-tertiary">
            {brand?.companyName ? `${brand.companyName} · ` : ""}
            {due ? t("screen.from", { name: senderName, date: due }) : t("screen.fromNoDue", { name: senderName })}
          </p>
        </div>
        {pdf && (
          <Button asChild variant="secondary">
            <a href={pdf} download={`${envelope.title}.pdf`}>
              <Icon icon={Download04Icon} size="sm" />
              {t("screen.download")}
            </a>
          </Button>
        )}
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section className="min-h-[50vh] flex-1 bg-subtle md:min-h-0">
          {pdf ? (
            <PdfViewer src={pdf} title={envelope.title} className="size-full" />
          ) : pdfFailed ? (
            <Centered>
              <p className="text-body text-secondary">{t("screen.documentError")}</p>
            </Centered>
          ) : (
            <Centered>
              <NodRing />
              <p className="text-hint text-tertiary">{t("screen.loadingDocument")}</p>
            </Centered>
          )}
        </section>
        <aside className="flex w-full shrink-0 flex-col overflow-auto border-t border-divider bg-card p-6 md:w-[360px] md:border-l md:border-t-0">
          {party.kind === "guest" && you && step === "read" && (
            <p className="mb-4 text-hint text-tertiary">{t("screen.signingAs", { name: you.name })}</p>
          )}
          {panel}
        </aside>
      </div>
      {brand && <PoweredBy />}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">{children}</div>;
}

function StateCircle({ icon, tone }: { icon: typeof Tick02Icon; tone?: "good" }) {
  return (
    <span
      className={
        tone === "good"
          ? "flex size-12 items-center justify-center rounded-pill bg-accent-subtle text-accent-text"
          : "flex size-12 items-center justify-center rounded-pill bg-mist text-secondary"
      }
    >
      <Icon icon={icon} />
    </span>
  );
}

/** "Signing powered by noddo" (PRODUCT-RULES, pages in the company's brand): one line, centred, the wordmark an image. */
export function PoweredBy() {
  const t = useTranslations("signing");
  return (
    <footer className="flex h-11 shrink-0 items-center justify-center gap-[5px] text-hint text-tertiary">
      <span>{t("footer")}</span>
      {/* eslint-disable-next-line @next/next/no-img-element -- the wordmark is an image, never typed (SPEC § 3) */}
      <img src="/email/noddo-ink.png" alt="noddo" height={15} className="relative -top-px h-[15px] w-auto opacity-70" />
    </footer>
  );
}
