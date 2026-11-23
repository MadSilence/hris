"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  ArrowLeftIcon,
  ArrowRight01Icon,
  NotificationIcon,
  Pdf01Icon,
  SignatureIcon,
} from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { FormError } from "@/components/feedback/FormError";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StepList, type StepListState, type StepListTone } from "@/components/ui/StepList";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { useDisplayLocale, useShortDates, useTimeFormatter } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { EnvelopeDTO, EnvelopeSignerDTO, SigningHistoryEvent } from "@/api/modules/signing/dto";
import { cancelSigningAction, remindSigningAction } from "../actions";
import { useSigningHistory } from "../hooks/useSigning";

const DAY = 86_400_000;
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** "Signing · 1 of 3", or how it ended — the pill on the document's row (S06, S08). */
export function SigningPill({ envelope }: { envelope: EnvelopeDTO }) {
  const t = useTranslations("signing");
  if (envelope.status === "SENT") {
    const done = envelope.signers.filter((s) => s.status === "SIGNED").length;
    return <StatusBadge status="in-progress" size="sm" label={t("panel.pill", { done, total: envelope.signers.length })} />;
  }
  if (envelope.status === "EXPIRED") return <StatusBadge status="declined" size="sm" label={t("panel.pillExpired")} />;
  if (envelope.status === "DECLINED") return <StatusBadge status="declined" size="sm" label={t("panel.pillDeclined")} />;
  if (envelope.status === "CANCELLED") return <StatusBadge status="inactive" size="sm" label={t("panel.pillCancelled")} />;
  if (envelope.status === "COMPLETED") return <StatusBadge status="approved" size="sm" label={t("panel.pillSigned")} />;
  return null;
}

/** The pill on the right of "Signing" in the panel (S07, S08a–d). */
function PanelPill({ envelope }: { envelope: EnvelopeDTO }) {
  const t = useTranslations("signing");
  if (envelope.status === "SENT") {
    const done = envelope.signers.filter((s) => s.status === "SIGNED").length;
    return (
      <span className="inline-flex h-5 shrink-0 items-center gap-1 rounded-pill bg-status-in-progress-bg px-1.5 text-hint font-semibold text-status-in-progress-text">
        <Icon icon={SignatureIcon} size="sm" className="size-3 text-status-in-progress-icon" />
        {t("panel.countSigned", { done, total: envelope.signers.length })}
      </span>
    );
  }
  if (envelope.status === "COMPLETED") return <StatusBadge status="approved" size="sm" label={t("panel.endSigned")} />;
  if (envelope.status === "DECLINED") return <StatusBadge status="declined" size="sm" label={t("panel.pillDeclined")} />;
  if (envelope.status === "EXPIRED") return <StatusBadge status="declined" size="sm" label={t("panel.pillExpired")} />;
  if (envelope.status === "CANCELLED") return <StatusBadge status="inactive" size="sm" label={t("panel.pillCanceled")} />;
  return null;
}

/**
 * The Signing panel (documents-send-for-signature S07, S08a–d, S13): who sent it and when, the steps with each
 * signer's state and time; at the foot the due date with the days left, a time bar, the reminders' rule and "Send a
 * reminder now" — or how it ended, with the signed copy or Send again. "Signing history" replaces the panel's content
 * in place (S13b). Cancel signing confirms (S09); it sits in the preview's footer when the preview carries it
 * (`cancelInFooter` + {@link CancelSigningButton}), otherwise at the panel's foot.
 */
export function SigningPanel({
  envelope,
  canSend,
  onChangedAction,
  onSendAgainAction,
  onOpenSignedAction,
  managerId = null,
  signedCopy = null,
  cancelInFooter = false,
}: {
  envelope: EnvelopeDTO;
  canSend: boolean;
  onChangedAction: () => void;
  onSendAgainAction: () => void;
  onOpenSignedAction?: (documentId: string) => void;
  /** The person's manager today: their step reads "· Their manager" (S07). */
  managerId?: string | null;
  /** The signed copy's name and folder, for the card at the foot of a completed signing (S08a). */
  signedCopy?: { name: string; folderName?: string | null } | null;
  /** The preview draws Cancel signing in its own footer (S07); the panel then leaves it out. */
  cancelInFooter?: boolean;
}) {
  const t = useTranslations("signing");
  const dates = useShortDates();
  const [view, setView] = React.useState<"status" | "history">("status");
  const [reminding, setReminding] = React.useState(false);
  const history = useSigningHistory(view === "history" || envelope.status === "CANCELLED" ? envelope.sourceDocumentId : null);

  const sent = new Date(envelope.sentAt).getTime();
  const due = new Date(envelope.expiresAt).getTime();
  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((due - now) / DAY));
  const share = Math.min(1, Math.max(0, (now - sent) / Math.max(1, due - sent)));
  const overdue = now > due;
  const closed = envelope.status !== "SENT" && envelope.status !== "COMPLETED";

  const remind = async () => {
    setReminding(true);
    const r = await remindSigningAction(envelope.id);
    setReminding(false);
    if (r.status !== ActionStatus.SUCCESS) showActionError(r);
    else {
      showSuccess(t("panel.reminded"));
      onChangedAction();
    }
  };

  if (view === "history") {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("history.back")} onClick={() => setView("status")}>
            <Icon icon={ArrowLeftIcon} size="sm" />
          </Button>
          <p className="text-card-title text-primary">{t("history.title")}</p>
        </div>
        <SigningTimeline events={history.data ?? null} />
      </div>
    );
  }

  // Who cancelled it, from the history: the envelope keeps only the reason (S08d).
  const cancelEvent = envelope.status === "CANCELLED"
    ? [...(history.data ?? [])].reverse().find((e) => e.kind === "CANCELLED" && e.envelopeId === envelope.id) ?? null
    : null;
  const pending = envelope.signers.find((s) => s.status === "PENDING");
  const sendAgain = canSend && closed && (
    <Button type="button" variant="secondary" size="sm" className="w-fit" onClick={onSendAgainAction}>
      <Icon icon={SignatureIcon} size="sm" />
      {t("panel.sendAgain")}
    </Button>
  );

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-card-title text-primary">{t("panel.title")}</p>
          <PanelPill envelope={envelope} />
        </div>
        <p className="text-hint text-tertiary">
          {t("panel.sentBy", { name: envelope.sentByName ?? "—", date: dates.date(envelope.sentAt) })}
        </p>
      </div>

      <SignerSteps envelope={envelope} managerId={managerId} />

      <div className="mt-auto flex flex-col gap-2 border-t border-divider pt-4">
        {envelope.status === "SENT" && (
          <>
            <div className="flex items-baseline justify-between">
              <p className="text-card-title text-primary">{t("panel.due", { date: dates.date(envelope.expiresAt) })}</p>
              <p className={cn("text-hint", overdue ? "text-status-declined-text" : "text-tertiary")}>
                {overdue ? t("panel.overdue") : t("panel.daysLeft", { count: daysLeft })}
              </p>
            </div>
            <TimeBar share={share} over={overdue} />
            <p className="text-hint text-tertiary">{t("panel.reminders")}</p>
            {canSend && (
              <Button type="button" variant="secondary" size="sm" className="mt-1 w-fit" loading={reminding} onClick={remind}>
                <Icon icon={NotificationIcon} size="sm" />
                {t("panel.remind")}
              </Button>
            )}
          </>
        )}

        {envelope.status === "COMPLETED" && (
          <>
            <p className="text-card-title text-primary">{t("panel.completedOn", { date: dates.date(envelope.completedAt ?? envelope.closedAt ?? envelope.sentAt) })}</p>
            {envelope.signedDocumentId && onOpenSignedAction && (
              <button
                type="button"
                onClick={() => onOpenSignedAction(envelope.signedDocumentId!)}
                className="flex items-center gap-2.5 rounded-card border border-divider px-3 py-2.5 text-left hover:bg-row-hover"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-control bg-tag-berry-bg text-tag-berry-bar">
                  <Icon icon={Pdf01Icon} size="sm" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-medium text-primary">{signedCopy?.name ?? t("panel.openSigned")}</span>
                  {signedCopy?.folderName && (
                    <span className="block truncate text-hint text-tertiary">{t("panel.inFolder", { folder: signedCopy.folderName })}</span>
                  )}
                </span>
                <Icon icon={ArrowRight01Icon} size="sm" className="shrink-0 text-tertiary" />
              </button>
            )}
          </>
        )}

        {envelope.status === "DECLINED" && (
          <>
            <p className="text-card-title text-primary">
              {t("panel.declinedOn", { date: dates.date(envelope.closedAt ?? envelope.signers.find((s) => s.declinedAt)?.declinedAt ?? envelope.sentAt) })}
            </p>
            <p className="text-hint text-tertiary">{t("panel.declinedBody")}</p>
            {sendAgain}
          </>
        )}

        {envelope.status === "EXPIRED" && (
          <>
            <div className="flex items-baseline justify-between">
              <p className="text-card-title text-primary">{t("panel.closedOn", { date: dates.date(envelope.closedAt ?? envelope.expiresAt) })}</p>
              <p className="text-hint text-status-declined-text">{t("panel.duePassed")}</p>
            </div>
            <TimeBar share={1} over />
            <p className="text-hint text-tertiary">
              {pending ? t("panel.didntSignInTime", { name: firstName(pending.name) }) : t("panel.declinedBody")}
            </p>
            {sendAgain}
          </>
        )}

        {envelope.status === "CANCELLED" && (
          <>
            <p className="text-card-title text-primary">{t("panel.canceledOn", { date: dates.date(envelope.closedAt ?? envelope.sentAt) })}</p>
            {(cancelEvent?.who || envelope.closeReason) && (
              <div className="flex flex-col gap-1.5 rounded-card bg-mist px-3 py-2.5">
                {cancelEvent?.who && (
                  <span className="flex items-center gap-1.5 text-label text-primary">
                    <Avatar className="size-4">
                      <AvatarFallback name={cancelEvent.who} />
                    </Avatar>
                    {cancelEvent.who}
                  </span>
                )}
                {envelope.closeReason && <p className="text-body text-secondary">{envelope.closeReason}</p>}
              </div>
            )}
            {sendAgain}
          </>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {canSend && envelope.status === "SENT" && !cancelInFooter && (
            <CancelSigningButton envelope={envelope} onDoneAction={onChangedAction} />
          )}
          <Button type="button" variant="ghost" size="sm" className="-ml-2 text-accent-text" onClick={() => setView("history")}>
            {t("panel.history")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimeBar({ share, over }: { share: number; over: boolean }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-pill bg-mist">
      <div
        className={cn("h-full rounded-pill", over ? "bg-status-declined-fill" : "bg-accent")}
        style={{ width: `${Math.round(share * 100)}%` }}
      />
    </div>
  );
}

/**
 * "Who signs" as the sender reads it (S07, S08), by the product-wide step rule (7-product-wide/STEPS.md): done a tick,
 * the step being signed an accent ring with its number, a later one a grey ring; under each name its role and state.
 */
function SignerSteps({ envelope, managerId }: { envelope: EnvelopeDTO; managerId: string | null }) {
  const t = useTranslations("signing");
  const dates = useShortDates();
  const time = useTimeFormatter();
  const steps = React.useMemo(() => {
    const byOrder = new Map<number, EnvelopeSignerDTO[]>();
    for (const s of [...envelope.signers].sort((a, b) => a.order - b.order)) {
      byOrder.set(s.order, [...(byOrder.get(s.order) ?? []), s]);
    }
    return [...byOrder.values()];
  }, [envelope.signers]);

  const roleOf = (s: EnvelopeSignerDTO) =>
    s.label?.trim() ||
    (s.userId && s.userId === envelope.subjectUserId ? t("send.person") : s.userId && s.userId === managerId ? t("send.theirManager") : null);

  const stateOf = (s: EnvelopeSignerDTO): { text: string; tone: StepListTone } => {
    if (s.status === "SIGNED" && s.signedAt) {
      return { text: t("panel.signedOn", { date: dates.date(s.signedAt), time: time(s.signedAt) }), tone: "approved" };
    }
    if (s.status === "DECLINED") {
      return { text: t("panel.declinedOn", { date: dates.date(s.declinedAt ?? envelope.closedAt ?? envelope.sentAt) }), tone: "declined" };
    }
    if (envelope.status === "EXPIRED" && s.status === "PENDING") return { text: t("panel.didntSign"), tone: "declined" };
    if (envelope.status !== "SENT") return { text: t("panel.notAsked"), tone: "neutral" };
    if (s.status === "PENDING") return { text: t("panel.toSign"), tone: "pending" };
    // B11 (2026-11-23): a signer whose turn has not come reads "To sign" too, in grey, as drawn.
    return { text: t("panel.toSign"), tone: "neutral" };
  };

  const stepState = (people: EnvelopeSignerDTO[]): StepListState => {
    if (people.some((s) => s.status === "DECLINED")) return "declined";
    if (people.every((s) => s.status === "SIGNED")) return "done";
    if (envelope.status === "SENT" && people.some((s) => s.status === "PENDING")) return "now";
    return "next";
  };

  return (
    <StepList
      label={t("screen.whoSigns")}
      steps={steps.map((people) => ({
        key: String(people[0]?.order ?? 0),
        state: stepState(people),
        people: people.map((s) => {
          const state = stateOf(s);
          const role = roleOf(s);
          return {
            key: s.id,
            avatar: (
              <Avatar className="size-6">
                {s.avatarUrl ? <AvatarImage src={s.avatarUrl} alt="" /> : null}
                <AvatarFallback name={s.isGuest ? null : s.name} />
              </Avatar>
            ),
            name: s.name,
            status: role ? t("panel.roleStatus", { role, status: state.text }) : state.text,
            statusTone: state.tone,
            after:
              s.status === "DECLINED" && s.declineReason ? <p className="mt-1 text-body text-secondary">“{s.declineReason}”</p> : undefined,
          };
        }),
      }))}
    />
  );
}

/** S13b: every send, signature, decline and cancel, oldest first; a decline's comment as a grey quote. */
function SigningTimeline({ events }: { events: SigningHistoryEvent[] | null }) {
  const t = useTranslations("signing");
  const dates = useShortDates();
  const time = useTimeFormatter();
  if (!events) return null;
  if (events.length === 0) return <p className="text-body text-secondary">{t("history.empty")}</p>;

  // "Signed by everyone" rides on the last signature at the same moment (S13b), not a line of its own.
  const rows: { event: SigningHistoryEvent; last: boolean }[] = [];
  for (const e of events) {
    const previous = rows[rows.length - 1];
    if (e.kind === "COMPLETED" && previous?.event.kind === "SIGNED" && previous.event.envelopeId === e.envelopeId) {
      previous.last = true;
      continue;
    }
    rows.push({ event: e, last: false });
  }

  const dot = (kind: SigningHistoryEvent["kind"]) =>
    kind === "SIGNED" || kind === "COMPLETED" ? "bg-status-approved-fill" : kind === "DECLINED" || kind === "EXPIRED" ? "bg-danger" : "bg-strong";
  const who = (e: SigningHistoryEvent) => (e.who ? (e.guest ? `${e.who} (${t("history.guest")})` : e.who) : "—");

  return (
    <ol className="flex flex-col gap-4">
      {rows.map(({ event: e, last }, i) => {
        const key = e.kind === "SIGNED" && last ? "SIGNED_LAST" : e.kind;
        return (
          <li key={`${e.envelopeId}-${i}`} className="flex gap-3">
            <span aria-hidden className={cn("mt-1 size-2.5 shrink-0 rounded-pill", dot(e.kind))} />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-hint text-tertiary">{`${dates.date(e.at)}, ${time(e.at)}`}</span>
              <p className="text-label font-normal text-secondary">
                {t.rich(`history.line.${key}`, { who: who(e), b: (chunks) => <span className="font-medium text-primary">{chunks}</span> })}
              </p>
              {e.comment && <q className="mt-1 rounded-control bg-mist px-2.5 py-2 text-label font-normal text-primary">{e.comment}</q>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** "Cancel signing" as red text, with its confirm (S07, S09) — in the preview's footer or at the panel's foot. */
export function CancelSigningButton({ envelope, onDoneAction }: { envelope: EnvelopeDTO; onDoneAction: () => void }) {
  const t = useTranslations("signing");
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        {t("panel.cancel")}
      </Button>
      <CancelSigningDialog
        open={open}
        envelope={envelope}
        onCloseAction={() => setOpen(false)}
        onDoneAction={() => {
          setOpen(false);
          onDoneAction();
        }}
      />
    </>
  );
}

/** S09: "Cancel this signing?" — the file, what happens to signatures already given, an optional comment. */
export function CancelSigningDialog({
  open,
  envelope,
  onCloseAction,
  onDoneAction,
}: {
  open: boolean;
  envelope: EnvelopeDTO;
  onCloseAction: () => void;
  onDoneAction: () => void;
}) {
  const t = useTranslations("signing");
  const locale = useDisplayLocale();
  const [comment, setComment] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const signed = envelope.signers.filter((s) => s.status === "SIGNED").map((s) => firstName(s.name));
  const body = signed.length
    ? t("cancel.bodySigned", { names: new Intl.ListFormat(locale, { type: "conjunction" }).format(signed), count: signed.length })
    : t("cancel.body");

  const confirm = async () => {
    setBusy(true);
    const r = await cancelSigningAction(envelope.id, comment.trim() || null);
    setBusy(false);
    if (r.status !== ActionStatus.SUCCESS) {
      setError(r.errorMessage ?? null);
      return;
    }
    showSuccess(t("cancel.done"));
    onDoneAction();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent className="gap-5 sm:max-w-[440px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t("cancel.title")}</DialogTitle>
          <DialogDescription className="truncate">{envelope.title}</DialogDescription>
        </DialogHeader>
        <p className="text-body text-secondary">{body}</p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cancel-comment">
            {t("cancel.commentLabel")} <span className="font-normal text-tertiary">{t("cancel.optional")}</span>
          </Label>
          <Textarea id="cancel-comment" value={comment} placeholder={t("cancel.placeholder")} onChange={(e) => setComment(e.target.value)} />
        </div>
        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction}>
            {t("cancel.keep")}
          </Button>
          <Button type="button" variant="destructive-confirm" loading={busy} onClick={confirm}>
            {t("cancel.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** S13: the document's signing history, oldest first, in a dialog — for the ⋯ on a signed file (S10). */
export function SigningHistoryDialog({
  open,
  documentId,
  onCloseAction,
}: {
  open: boolean;
  documentId: string | null;
  onCloseAction: () => void;
}) {
  const t = useTranslations("signing");
  const history = useSigningHistory(open ? documentId : null);
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t("history.title")}</DialogTitle>
        </DialogHeader>
        <SigningTimeline events={history.data ?? null} />
      </DialogContent>
    </Dialog>
  );
}
