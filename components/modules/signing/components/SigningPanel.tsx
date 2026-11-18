"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { FormError } from "@/components/feedback/FormError";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { useDateFormatter } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { EnvelopeDTO } from "@/api/modules/signing/dto";
import { cancelSigningAction, remindSigningAction } from "../actions";
import { useSigningHistory } from "../hooks/useSigning";
import { SignerChain } from "./SignerChain";

const DAY = 86_400_000;

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

/**
 * The Signing panel (documents-send-for-signature S07, S08a–d): who sent it and when, the step chain with each signer's
 * state, the due date with the days left and a time bar, the reminders' rule and "Send a reminder now"; or how it ended
 * — signed by everyone, declined with the comment, expired, cancelled — with Send again. Cancel signing confirms (S09).
 */
export function SigningPanel({
  envelope,
  canSend,
  onChangedAction,
  onSendAgainAction,
  onOpenSignedAction,
}: {
  envelope: EnvelopeDTO;
  canSend: boolean;
  onChangedAction: () => void;
  onSendAgainAction: () => void;
  onOpenSignedAction?: (documentId: string) => void;
}) {
  const t = useTranslations("signing");
  const formatDate = useDateFormatter();
  const [cancelling, setCancelling] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [reminding, setReminding] = React.useState(false);

  const sent = new Date(envelope.sentAt).getTime();
  const due = new Date(envelope.expiresAt).getTime();
  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((due - now) / DAY));
  const share = Math.min(1, Math.max(0, (now - sent) / Math.max(1, due - sent)));
  const overdue = now > due;
  const decliner = envelope.signers.find((s) => s.status === "DECLINED");

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

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="text-card-title text-primary">{t("panel.title")}</p>
        <p className="text-hint text-tertiary">
          {t("panel.sentBy", { name: envelope.sentByName ?? "—", date: formatDate(envelope.sentAt, { style: "medium" }) })}
        </p>
      </div>

      {envelope.status === "COMPLETED" && (
        <div className="flex flex-col gap-2 rounded-card bg-status-approved-bg p-3">
          <p className="text-body font-medium text-status-approved-text">{t("panel.endSigned")}</p>
          {envelope.signedDocumentId && onOpenSignedAction && (
            <Button type="button" variant="link" onClick={() => onOpenSignedAction(envelope.signedDocumentId!)}>
              {t("panel.openSigned")}
            </Button>
          )}
        </div>
      )}
      {envelope.status === "DECLINED" && (
        <div className="flex flex-col gap-2 rounded-card bg-status-declined-bg p-3">
          <p className="text-body font-medium text-status-declined-text">{t("panel.endDeclined", { name: decliner?.name ?? "—" })}</p>
          {decliner?.declineReason && (
            <blockquote className="border-l-2 border-strong pl-2 text-body text-secondary">
              {decliner.name}: {decliner.declineReason}
            </blockquote>
          )}
        </div>
      )}
      {envelope.status === "EXPIRED" && (
        <div className="flex flex-col gap-1 rounded-card bg-status-declined-bg p-3">
          <StatusBadge status="declined" label={t("panel.endExpired")} />
          <p className="text-hint text-secondary">{t("panel.endExpiredBody", { date: formatDate(envelope.closedAt ?? envelope.expiresAt, { style: "medium" }) })}</p>
        </div>
      )}
      {envelope.status === "CANCELLED" && (
        <div className="flex flex-col gap-2 rounded-card bg-mist p-3">
          <p className="text-body font-medium text-primary">{t("panel.endCancelled", { name: envelope.sentByName ?? "—" })}</p>
          {envelope.closeReason && <blockquote className="border-l-2 border-strong pl-2 text-body text-secondary">{envelope.closeReason}</blockquote>}
        </div>
      )}

      <SignerChain signers={envelope.signers} youId={null} />

      {envelope.status === "SENT" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <p className="text-body text-primary">{t("panel.due", { date: formatDate(envelope.expiresAt, { style: "medium" }) })}</p>
            <p className={cn("text-hint", overdue ? "text-status-declined-text" : "text-tertiary")}>
              {overdue ? t("panel.overdue") : t("panel.daysLeft", { count: daysLeft })}
            </p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-pill bg-mist">
            <div
              className={cn("h-full rounded-pill", overdue ? "bg-status-declined-fill" : "bg-accent")}
              style={{ width: `${Math.round(share * 100)}%` }}
            />
          </div>
          <p className="text-hint text-tertiary">{t("panel.reminders")}</p>
          {canSend && (
            <Button type="button" variant="secondary" loading={reminding} onClick={remind}>
              {t("panel.remind")}
            </Button>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2">
        {canSend && envelope.status === "SENT" && (
          <Button type="button" variant="destructive" onClick={() => setCancelling(true)}>
            {t("panel.cancel")}
          </Button>
        )}
        {canSend && (envelope.status === "DECLINED" || envelope.status === "EXPIRED" || envelope.status === "CANCELLED") && (
          <Button type="button" onClick={onSendAgainAction}>
            {t("panel.sendAgain")}
          </Button>
        )}
        <Button type="button" variant="link" onClick={() => setHistoryOpen(true)}>
          {t("panel.history")}
        </Button>
      </div>

      <CancelSigningDialog
        open={cancelling}
        envelopeId={envelope.id}
        onCloseAction={() => setCancelling(false)}
        onDoneAction={() => {
          setCancelling(false);
          onChangedAction();
        }}
      />
      <SigningHistoryDialog
        open={historyOpen}
        documentId={envelope.sourceDocumentId}
        onCloseAction={() => setHistoryOpen(false)}
      />
    </div>
  );
}

/** S09: "Cancel this signing?" with an optional comment the signers already asked will read. */
export function CancelSigningDialog({
  open,
  envelopeId,
  onCloseAction,
  onDoneAction,
}: {
  open: boolean;
  envelopeId: string;
  onCloseAction: () => void;
  onDoneAction: () => void;
}) {
  const t = useTranslations("signing");
  const [comment, setComment] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const confirm = async () => {
    setBusy(true);
    const r = await cancelSigningAction(envelopeId, comment.trim() || null);
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
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t("cancel.title")}</DialogTitle>
          <DialogDescription>{t("cancel.body")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cancel-comment">{t("cancel.comment")}</Label>
          <Textarea id="cancel-comment" value={comment} placeholder={t("cancel.placeholder")} onChange={(e) => setComment(e.target.value)} />
        </div>
        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCloseAction}>
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

/** S13: the document's signing history, oldest first, across every signing of it. */
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
  const formatDate = useDateFormatter();
  const history = useSigningHistory(open ? documentId : null);
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t("history.title")}</DialogTitle>
        </DialogHeader>
        {history.data && history.data.length === 0 && <p className="text-body text-secondary">{t("history.empty")}</p>}
        <ol className="flex flex-col gap-3">
          {(history.data ?? []).map((e, i) => (
            <li key={`${e.envelopeId}-${i}`} className="flex flex-col">
              <span className="text-body text-primary">
                {t(`history.${e.kind}`, { who: e.who ? (e.guest ? `${e.who} (${t("history.guest")})` : e.who) : "—" })}
              </span>
              {e.comment && <span className="text-hint text-secondary">“{e.comment}”</span>}
              <span className="text-hint text-tertiary">{formatDate(e.at, { style: "medium" })}</span>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
