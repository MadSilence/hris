"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Download01Icon,
  InformationCircleIcon,
  Pdf01Icon,
  SignatureIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { NodRing } from "@/components/desact/nod";
import { internalApiClient } from "@/components/clients/apiClient";
import { ActionStatus } from "@/components/models/ActionStatus";
import { cn } from "@/lib/cn";
import { useShortDates } from "@/lib/date";
import type { EnvelopeDTO, EnvelopeSignerDTO, SigningParty } from "@/api/modules/signing/dto";
import { checkSigningCodeAction, declineSigningAction, sendSigningCodeAction, signAction } from "../actions";
import { CodeBoxes } from "./CodeBoxes";
import { PdfViewer } from "@/components/ui/PdfViewer";
import { StepList, type StepListPerson } from "@/components/ui/StepList";
import { SignatureInput, type SignatureValue } from "./SignatureInput";

type Step = "read" | "code" | "signature" | "signed" | "declining" | "declined";

/** The code's refusal (D00044): wrong, old, or never sent — one answer for all three. */
const CODE_INVALID = "D00044";

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

/** The company's own look on a guest's or a joiner's page (G09–G13, P08): its name and its logo. */
export type SigningBrand = { companyName: string | null; logoUrl?: string | null };

/**
 * The signing screen (documents-signing G02–G08, G09–G13, P08): the document on a grey stage, on the right who asks,
 * the step chain, Sign and Decline. Sign shows the code step at once while the code goes to the signer's email (G12);
 * the code is checked on its own step (G0), then the signature — typed or drawn — signs. One screen for the three
 * signers: a person in the company, a guest by their link, a new joiner from their preboarding page; `party` says
 * which, and what they hold. A guest's and a joiner's page wear the company's band (`brand`).
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
  brand?: SigningBrand | null;
}) {
  const t = useTranslations("signing");
  const dates = useShortDates();
  const [step, setStep] = React.useState<Step>("read");
  const [pdf, setPdf] = React.useState<string | null>(null);
  const [pdfFailed, setPdfFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  // The code step's one line under the boxes: G05's words for a wrong code, the catalogue's for anything else.
  const [codeError, setCodeError] = React.useState<string | null>(null);
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
  const company = brand?.companyName ?? null;
  // Formatted once in the browser: a guest's page is rendered on the server, which cannot know the browser's own date
  // order, and the two disagreed — "18 Dec 2026" against "Dec 18, 2026", a hydration error (walk of 2026-11-18).
  const [mounted, setMounted] = React.useState(false);
  // The last signature: the copy is already on its way, not "when everyone has signed" (walk of 2026-11-18).
  const [completed, setCompleted] = React.useState(false);
  // "sign by 17 Dec" — no year in the current year (G2).
  const due = mounted && envelope.expiresAt ? dates.date(envelope.expiresAt) : "";

  React.useEffect(() => {
    token.current = browserToken();
    setMounted(true);
  }, []);

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

  const clearCode = () => {
    setCodeError(null);
    setCodeInvalid(false);
  };

  // G12: the code step comes at once; the email goes in the background, and a refusal lands on the code step.
  const startSigning = async () => {
    setFormError(null);
    clearCode();
    setStep("code");
    const r = await sendSigningCodeAction(party, token.current);
    if (r.status !== ActionStatus.SUCCESS) setCodeError(r.errorMessage ?? null);
  };

  const resend = async () => {
    clearCode();
    const r = await sendSigningCodeAction(party, token.current);
    if (r.status !== ActionStatus.SUCCESS) setCodeError(r.errorMessage ?? null);
  };

  // G0: the sixth digit checks the code here; a wrong one keeps the step, its digits red.
  const checkCode = async (typed: string) => {
    setChecking(true);
    clearCode();
    const r = await checkSigningCodeAction(party, typed, token.current);
    setChecking(false);
    if (r.status === ActionStatus.SUCCESS) {
      setCode(typed);
      setFormError(null);
      setStep("signature");
      return;
    }
    setCodeInvalid(true);
    setCodeError(r.code === CODE_INVALID ? t("code.wrong") : (r.errorMessage ?? t("code.wrong")));
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
    if (r.code === CODE_INVALID) {
      // The code went stale while the signature was being drawn: back to a fresh one.
      setCodeInvalid(true);
      setCodeError(t("code.wrong"));
      setStep("code");
      return;
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

  const back = (to: Step) => () => {
    setFormError(null);
    clearCode();
    setStep(to);
  };

  const download = pdf ? (
    <Button asChild variant="secondary">
      <a href={pdf} download={`${envelope.title}.pdf`}>
        <Icon icon={Download01Icon} size="sm" />
        {t("screen.download")}
      </a>
    </Button>
  ) : null;

  const backToStart = backHref ? (
    <Button asChild variant="secondary" size="lg" className="w-full">
      <Link href={backHref}>{backLabel}</Link>
    </Button>
  ) : null;

  // G08 / G14b: closed — the full-screen sign page with its header, the message in the middle, no document.
  if (!open && step !== "signed" && step !== "declined") {
    return (
      <Frame brand={brand} white={Boolean(brand)}>
        {!brand && <TopBar backHref={backHref} title={envelope.title} sub={t("screen.fromNoDue", { name: senderName })} />}
        <Centered>
          <span className="flex size-14 items-center justify-center rounded-pill border border-divider bg-card text-secondary">
            <Icon icon={CancelCircleIcon} size="lg" />
          </span>
          <h1 className="text-section-title text-primary">{t("states.closed")}</h1>
          <p className="max-w-[420px] text-body text-secondary">{t("states.closedBody")}</p>
          {backHref && (
            <Button asChild variant="secondary">
              <Link href={backHref}>{backLabel}</Link>
            </Button>
          )}
        </Centered>
      </Frame>
    );
  }

  // G11: a guest who signed gets a page of its own — the company band, the green circle, one line.
  if (step === "signed" && party.kind === "guest") {
    return (
      <Frame brand={brand} white>
        <Centered>
          <span className="flex size-14 items-center justify-center rounded-pill bg-status-approved-bg text-status-approved-icon">
            <Icon icon={CheckmarkCircle02Icon} />
          </span>
          <h1 className="text-section-title text-primary">{t("signed.title")}</h1>
          <p className="text-body text-secondary">{completed ? t("signed.guestCopyNow") : t("signed.guestCopy")}</p>
        </Centered>
      </Frame>
    );
  }

  const panel = (() => {
    switch (step) {
      case "code":
        return (
          <div className="flex flex-col">
            <BackLink label={t("screen.back")} onClick={back("read")} />
            <h2 className="mt-4.5 text-section-title text-primary">{t("code.title")}</h2>
            <p className="mt-2.5 text-body text-secondary">
              {you?.email
                ? t.rich("code.sentTo", { email: you.email, b: (c) => <b className="font-medium text-primary">{c}</b> })
                : t("code.bodyNoEmail")}
            </p>
            <div className="mt-4.5">
              <CodeBoxes invalid={codeInvalid} disabled={checking} onEditAction={clearCode} onCompleteAction={checkCode} />
            </div>
            {codeError && <p className="mt-2.5 text-hint text-danger" role="alert">{codeError}</p>}
            <button
              type="button"
              onClick={resend}
              className="mt-2.5 self-start text-label font-medium text-accent-text hover:text-accent-hover"
            >
              {t("code.resend")}
            </button>
          </div>
        );
      case "signature":
        return (
          <div className="flex h-full flex-col">
            <BackLink label={t("screen.back")} onClick={back("read")} />
            <h2 className="mt-4.5 text-section-title text-primary">{t("signature.title")}</h2>
            <p className="mt-2.5 flex items-center gap-1.5 text-hint text-status-approved-text">
              <Icon icon={CheckmarkCircle02Icon} size="sm" className="text-status-approved-icon" />
              {t("signature.confirmed")}
            </p>
            <div className="mt-5">
              <SignatureInput ref={signature} party={party} defaultName={you?.name ?? ""} />
            </div>
            <div className="mt-auto flex flex-col gap-2 pt-6">
              <FormError message={formError} />
              <Button type="button" size="lg" className="w-full" loading={busy} onClick={finish}>
                <Icon icon={SignatureIcon} size="sm" />
                {t("signature.sign")}
              </Button>
            </div>
          </div>
        );
      case "signed": {
        // G04 "Next to sign" by the step rule (7-product-wide/STEPS.md): the later steps keep their numbers, no frame.
        const next = signingSteps(envelope.signers)
          .map((people, i) => ({ people, number: i + 1 }))
          .filter(({ people }) => people.every((s) => s.status === "WAITING" && s.id !== youSignerId));
        return (
          <div className="flex h-full flex-col">
            <span className="flex size-12 items-center justify-center rounded-pill bg-status-approved-bg text-status-approved-icon">
              <Icon icon={CheckmarkCircle02Icon} />
            </span>
            <h2 className="mt-2.5 text-section-title text-primary">{t("signed.title")}</h2>
            {!completed && next.length > 0 && (
              <StepList
                className="mt-7"
                label={t("signed.next")}
                steps={next.map(({ people, number }) => ({
                  key: String(number),
                  number,
                  state: "next",
                  people: people.map((s) => signerRow(s, null, t("screen.you"))),
                }))}
              />
            )}
            <div className="mt-7 flex flex-col gap-3 rounded-card bg-subtle p-4">
              <p className="text-label font-normal text-secondary">{completed ? t("signed.copyNow") : t("signed.copyLater")}</p>
            </div>
            <div className="mt-auto flex flex-col gap-5 pt-6">
              <p className="flex gap-2 text-hint text-tertiary">
                <Icon icon={InformationCircleIcon} size="sm" />
                {t("signed.certificate")}
              </p>
              {backToStart}
            </div>
          </div>
        );
      }
      case "declining":
        return (
          <div className="flex h-full flex-col">
            <BackLink label={t("screen.back")} onClick={back("read")} />
            <h2 className="mt-4.5 text-section-title text-primary">{t("decline.title")}</h2>
            <p className="mt-2.5 text-body text-secondary">{t("decline.body", { name: senderName })}</p>
            <div className="mt-6.5 flex flex-col gap-1.5">
              <Label htmlFor="decline-comment">{t("decline.comment")}</Label>
              <Textarea
                id="decline-comment"
                value={comment}
                className="h-[120px]"
                aria-invalid={commentError ? true : undefined}
                placeholder={t("decline.placeholder")}
                onChange={(e) => {
                  setComment(e.target.value);
                  setCommentError(null);
                }}
              />
              <FieldError>{commentError}</FieldError>
            </div>
            <div className="mt-auto flex flex-col gap-2 pt-6">
              <FormError message={formError} />
              <Button type="button" variant="destructive-confirm" size="lg" className="w-full" loading={busy} onClick={decline}>
                {t("decline.submit")}
              </Button>
            </div>
          </div>
        );
      case "declined":
        // G04b (19 Nov): like "You signed", in red — the comment kept, and who sees it.
        return (
          <div className="flex h-full flex-col">
            <span className="flex size-12 items-center justify-center rounded-pill bg-status-declined-bg text-danger">
              <Icon icon={CancelCircleIcon} />
            </span>
            <h2 className="mt-2.5 text-section-title text-primary">{t("decline.declinedTitle")}</h2>
            <div className="mt-7 flex flex-col gap-3 rounded-card bg-subtle p-4">
              <p className="text-label text-tertiary">{t("decline.yourComment")}</p>
              <p className="whitespace-pre-line break-words text-body text-secondary">{t("decline.quoted", { comment: comment.trim() })}</p>
              <p className="text-label font-normal text-secondary">{t("decline.body", { name: senderName })}</p>
            </div>
            {backToStart && <div className="mt-auto pt-6">{backToStart}</div>}
          </div>
        );
      default:
        return (
          <div className="flex h-full flex-col">
            {waiting ? (
              // G07: no title — a blue note on top, then who signs.
              <div className="flex gap-2.5 rounded-card bg-status-info-bg px-3.5 py-3">
                <Icon icon={Clock01Icon} size="sm" className="mt-0.5 text-status-info-icon" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <b className="text-body font-semibold text-primary">{t("states.notYourTurn")}</b>
                  <span className="text-label font-normal text-secondary">
                    {firstPending
                      ? t("states.notYourTurnBody", { name: firstPending.name })
                      : t("states.notYourTurnSomebody")}
                  </span>
                </span>
              </div>
            ) : (
              <h2 className="text-section-title text-primary">
                {company && party.kind === "guest"
                  ? t("screen.asksFrom", { name: senderName, company })
                  : t("screen.asks", { name: senderName })}
              </h2>
            )}
            <div className="mt-6.5">
              <WhoSigns signers={envelope.signers} youId={youSignerId} youLabel={t("screen.you")} label={t("screen.whoSigns")} />
            </div>
            <div className="mt-auto flex flex-col gap-2 pt-6">
              {yourTurn && (
                <p className="mb-2 text-hint text-tertiary">
                  {party.kind !== "member" && you?.email
                    ? t.rich("screen.hintTo", { email: you.email, b: (c) => <b className="font-medium text-secondary">{c}</b> })
                    : t("screen.hint")}
                </p>
              )}
              <FormError message={formError} />
              {yourTurn && (
                <Button type="button" size="lg" className="w-full" onClick={startSigning}>
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

  const viewer = pdf ? (
    <PdfViewer src={pdf} title={envelope.title} layout="stage" className="size-full" />
  ) : pdfFailed ? (
    <Centered>
      <p className="text-body text-secondary">{t("screen.documentError")}</p>
    </Centered>
  ) : (
    <Centered>
      <NodRing />
      <p className="text-hint text-tertiary">{t("screen.loadingDocument")}</p>
    </Centered>
  );

  // G09 / P08: a guest's and a joiner's page — the band, then the document and a white card, centred, 1192 at most.
  if (brand) {
    return (
      <Frame brand={brand} signingAs={party.kind === "guest" && you ? t("screen.signingAs", { name: you.name }) : null}>
        <div className="mx-auto flex min-h-0 w-full max-w-[1192px] flex-1 flex-col gap-4 px-4 pt-6 md:px-6">
          {party.kind === "joiner" && backHref && (
            <BackLink label={backLabel} href={backHref} />
          )}
          <div className="flex items-center gap-3">
            <PdfTile />
            <div className="min-w-0 flex-1">
              <p className="truncate text-card-title text-primary">{envelope.title}</p>
              {due && <p className="truncate text-hint text-tertiary">{t("screen.signBy", { date: due })}</p>}
            </div>
            {download}
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
            <section className="min-h-[50vh] flex-1 md:min-h-0">{viewer}</section>
            <aside className="flex w-full shrink-0 flex-col overflow-auto rounded-card border border-divider bg-card p-6 md:w-[380px]">
              {panel}
            </aside>
          </div>
        </div>
      </Frame>
    );
  }

  return (
    <Frame brand={null}>
      <TopBar
        backHref={backHref}
        title={envelope.title}
        sub={due ? t("screen.from", { name: senderName, date: due }) : t("screen.fromNoDue", { name: senderName })}
        action={download}
      />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section className="min-h-[50vh] flex-1 md:min-h-0">{viewer}</section>
        <aside className="flex w-full shrink-0 flex-col overflow-auto border-t border-divider bg-card px-6 py-7 md:w-[380px] md:border-l md:border-t-0">
          {panel}
        </aside>
      </div>
    </Frame>
  );
}

/** The whole screen: grey, over the app; a company's page has its band on top and the footer at the foot. */
function Frame({
  brand,
  signingAs,
  white,
  children,
}: {
  brand: SigningBrand | null | undefined;
  signingAs?: string | null;
  /** A company page with only a message on it (G10–G12) is white; one with the document is grey. */
  white?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("fixed inset-0 z-40 flex flex-col overflow-auto", white ? "bg-card" : "bg-subtle")}>
      {brand && <CompanyBand brand={brand} trailing={signingAs ?? null} />}
      {children}
      {brand && <PoweredBy />}
    </div>
  );
}

/** G02's top bar: back, the file's tile, the title and who it is from, Download on the right. */
function TopBar({ backHref, title, sub, action }: { backHref: string | null; title: string; sub: string; action?: React.ReactNode }) {
  const t = useTranslations("signing");
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-divider bg-card px-6">
      {backHref && (
        <Button asChild variant="ghost" size="icon" aria-label={t("screen.back")}>
          <Link href={backHref}>
            <Icon icon={ArrowLeft01Icon} className="text-secondary" />
          </Link>
        </Button>
      )}
      <PdfTile />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold text-primary">{title}</p>
        <p className="truncate text-hint text-tertiary">{sub}</p>
      </div>
      {action}
    </header>
  );
}

/**
 * The company's band on its own pages (G09–G13, G03f–G03i, P08): the company colour, its logo on a white tile and its
 * name; on a guest's page "Signing as …" on the right. 64 high on a computer, 52 on the phone pages.
 */
export function CompanyBand({ brand, trailing, compact }: { brand: SigningBrand; trailing?: string | null; compact?: boolean }) {
  const name = brand.companyName ?? "";
  return (
    <div className={cn("flex shrink-0 items-center gap-2.5 bg-accent text-on-accent", compact ? "h-[52px] px-4" : "h-16 px-8")}>
      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-control bg-card text-label text-accent-text">
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- the company's own logo, any size
          <img src={brand.logoUrl} alt="" className="size-full object-contain" />
        ) : (
          name.slice(0, 1).toUpperCase()
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-card-title">{name}</span>
      {trailing && <span className="shrink-0 truncate text-label font-normal opacity-80">{trailing}</span>}
    </div>
  );
}

/** "‹ Back" over a step's title (G03, G03a, G06). */
function BackLink({ label, onClick, href }: { label: string; onClick?: () => void; href?: string }) {
  const className = "flex items-center gap-1.5 self-start text-label font-normal text-secondary hover:text-primary";
  const content = (
    <>
      <Icon icon={ArrowLeft01Icon} size="sm" />
      {label}
    </>
  );
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

/** The PDF's tile (the file-type tile, 28, Berry). */
function PdfTile() {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-control bg-tag-berry-bg text-tag-berry-bar">
      <Icon icon={Pdf01Icon} size="sm" />
    </span>
  );
}

function SignerAvatar({ signer }: { signer: EnvelopeSignerDTO }) {
  return signer.isGuest ? (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-mist text-secondary">
      <Icon icon={UserIcon} size="sm" className="size-3" />
    </span>
  ) : (
    <Avatar className="size-6 shrink-0">
      {signer.avatarUrl ? <AvatarImage src={signer.avatarUrl} alt="" /> : null}
      <AvatarFallback name={signer.name}>{initials(signer.name)}</AvatarFallback>
    </Avatar>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "—";

/** The signers grouped by their step, in order: the people of one step sign at the same time. */
function signingSteps(signers: EnvelopeSignerDTO[]): EnvelopeSignerDTO[][] {
  const byOrder = new Map<number, EnvelopeSignerDTO[]>();
  for (const s of [...signers].sort((a, b) => a.order - b.order)) {
    byOrder.set(s.order, [...(byOrder.get(s.order) ?? []), s]);
  }
  return [...byOrder.values()];
}

/** One signer as a step's row: their 24 avatar and name, "You" for the reader. */
function signerRow(signer: EnvelopeSignerDTO, youId: string | null, youLabel: string): StepListPerson {
  return {
    key: signer.id,
    avatar: <SignerAvatar signer={signer} />,
    name: youId !== null && signer.id === youId ? youLabel : signer.name,
  };
}

/**
 * "Who signs" on the signer's own screen (G02, G03, G07, G09), by the product-wide step rule (7-product-wide/STEPS.md):
 * a signed step is a Mist circle with a tick, the step being signed an accent ring with its number and its names in the
 * accent, a later step a grey ring; the people of one step stacked. A guest's page never shows another signer's email —
 * the backend leaves it out.
 */
function WhoSigns({ signers, youId, youLabel, label }: { signers: EnvelopeSignerDTO[]; youId: string | null; youLabel: string; label: string }) {
  const steps = React.useMemo(() => signingSteps(signers), [signers]);
  return (
    <StepList
      label={label}
      steps={steps.map((people, i) => ({
        key: String(people[0]?.order ?? i),
        state: people.some((s) => s.status === "DECLINED")
          ? "declined"
          : people.every((s) => s.status === "SIGNED")
            ? "done"
            : people.some((s) => s.status === "PENDING")
              ? "now"
              : "next",
        people: people.map((s) => signerRow(s, youId, youLabel)),
      }))}
    />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 p-8 text-center">{children}</div>;
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
