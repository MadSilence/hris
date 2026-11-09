"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";
import { ActionStatus } from "@/components/models/ActionStatus";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { showSuccess } from "@/lib/errors/errorToast";
import {
  addPeersAction,
  reassignReviewAction,
  updateCycleDatesAction,
} from "@/components/modules/reviews/actions/reviewCycleActions";
import { REVIEW_KIND_KEYS, reviewNoticeLines, type Cycle, type PersonRow, type ReviewKind } from "@/models/reviews";

const nameOf = (u: PickedUser, fallback: string) => [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || fallback;

/** Peers for one person, chosen by whoever runs the cycle (R2), within the cycle's fewest and most. */
export function ChoosePeersDialog({ person, open, onCloseAction, onDoneAction }: {
  person: PersonRow | null;
  open: boolean;
  onCloseAction: () => void;
  onDoneAction: () => void;
}) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const [picked, setPicked] = useState<PickedUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  useEffect(() => { if (open) { setPicked([]); setError(null); setTried(false); } }, [open]);
  if (!person) return null;
  const room = (person.peerMax ?? 0) - person.peers;

  const save = async () => {
    setTried(true);
    if (picked.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await addPeersAction({ participantId: person.participantId, reviewerUserIds: picked.map((p) => p.id) });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        setError(res.errorMessage ?? t("error.generic"));
        return;
      }
      const warnings = reviewNoticeLines(t, res.data.warnings, res.data.warningCodes);
      showSuccess(warnings.length ? warnings.join(" ") : t("run.peers.asked"));
      onDoneAction();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("run.choosePeers")}</DialogTitle>
          <DialogDescription>
            {t("run.peers.description", {
              name: person.subject.name,
              count: person.peers,
              min: person.peerMin ?? "",
              max: person.peerMax ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {picked.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-control border border-divider px-3 py-1.5 text-body">
              {nameOf(p, t("nomination.somebody"))}
              <button type="button" aria-label={t("nomination.remove", { name: nameOf(p, t("nomination.somebody")) })} className="text-tertiary hover:text-primary"
                onClick={() => setPicked(picked.filter((x) => x.id !== p.id))}>
                <Icon icon={Cancel01Icon} size="sm" />
              </button>
            </div>
          ))}
          {picked.length < room && (
            <UserPickerField value={null} placeholder={t("nomination.addPerson")}
              onChange={(u) => u && !picked.some((x) => x.id === u.id) && u.id !== person.subject.userId && setPicked([...picked, u])} />
          )}
          {room <= 0 && <p className="text-body text-tertiary">{t("run.peers.full")}</p>}
          <FieldError>{tried && picked.length === 0 ? t("run.peers.pickSomeone") : null}</FieldError>
        </div>
        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>{tCommon("actions.cancel")}</Button>
          <Button type="button" onClick={() => void save()} disabled={busy}>
            {busy ? t("run.peers.asking") : t("run.peers.ask")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Hands an open review to somebody else; what was typed goes with it (R6). */
export function ReassignDialog({ target, open, onCloseAction, onDoneAction }: {
  target: { assignmentId: string; kind: ReviewKind; subjectName: string; reviewerName: string; suggestion?: PickedUser | null } | null;
  open: boolean;
  onCloseAction: () => void;
  onDoneAction: () => void;
}) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const [picked, setPicked] = useState<PickedUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  useEffect(() => { if (open) { setPicked(target?.suggestion ?? null); setError(null); setTried(false); } }, [open, target]);
  if (!target) return null;

  const save = async () => {
    setTried(true);
    if (!picked) return;
    setBusy(true);
    setError(null);
    try {
      const res = await reassignReviewAction({ assignmentId: target.assignmentId, reviewerUserId: picked.id });
      if (res.status !== ActionStatus.SUCCESS) {
        setError(res.errorMessage ?? t("error.generic"));
        return;
      }
      showSuccess(t("run.handOnDialog.done"));
      onDoneAction();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("run.handOn")}</DialogTitle>
          <DialogDescription>
            {t(target.kind === "MANAGER" ? "run.handOnDialog.descriptionManager" : "run.handOnDialog.description", {
              kind: target.kind,
              subject: target.subjectName,
              reviewer: target.reviewerName,
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <RequiredLabel required>{t("run.handOnDialog.newReviewer")}</RequiredLabel>
          <UserPickerField value={picked} onChange={setPicked} />
          <FieldError>{tried && !picked ? tCommon("validation.required") : null}</FieldError>
        </div>
        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>{tCommon("actions.cancel")}</Button>
          <Button type="button" onClick={() => void save()} disabled={busy}>{busy ? t("run.handOnDialog.handingOn") : t("run.handOnDialog.handOn")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** The windows of a running cycle; open reviews' due dates and reminders move with them. */
export function EditDatesDialog({ cycle, open, onCloseAction, onDoneAction }: {
  cycle: Cycle;
  open: boolean;
  onCloseAction: () => void;
  onDoneAction: () => void;
}) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const [dates, setDates] = useState<Record<string, { opensOn: string; dueOn: string }>>({});
  const [release, setRelease] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setDates(Object.fromEntries(cycle.kinds.map((k) => [k.kind, { opensOn: k.opensOn ?? "", dueOn: k.dueOn ?? "" }])));
    setRelease(cycle.releaseDate ?? "");
    setError(null);
  }, [open, cycle]);
  const releases = cycle.sharingMode === "RELEASED_ON_DATE" && !cycle.releasedAt;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await updateCycleDatesAction({
        id: cycle.id,
        kinds: cycle.kinds.map((k) => ({
          kind: k.kind, formId: k.formId, opensOn: dates[k.kind]?.opensOn || null, dueOn: dates[k.kind]?.dueOn || null,
        })),
        releaseDate: releases ? release || null : null,
      });
      if (res.status !== ActionStatus.SUCCESS) {
        setError(res.errorMessage ?? t("error.generic"));
        return;
      }
      showSuccess(t("run.datesDialog.done"));
      onDoneAction();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("run.editDates")}</DialogTitle>
          <DialogDescription>{t("run.datesDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {cycle.kinds.map((k) => {
            const opensId = `dates-${k.kind}-opens`;
            const dueId = `dates-${k.kind}-due`;
            return (
            <div key={k.kind} className="grid grid-cols-[1fr_1fr_1fr] items-end gap-2">
              <span className="pb-2 text-body font-medium text-primary">{t(REVIEW_KIND_KEYS[k.kind])}</span>
              <div className="space-y-1">
                <RequiredLabel htmlFor={opensId}>{t("builder.kind.opensOn")}</RequiredLabel>
                <DatePicker id={opensId} value={dates[k.kind]?.opensOn ?? ""} clearable
                  onChange={(v) => setDates({ ...dates, [k.kind]: { ...dates[k.kind], opensOn: v } })} />
              </div>
              <div className="space-y-1">
                <RequiredLabel htmlFor={dueId} required>{t("builder.kind.dueOn")}</RequiredLabel>
                <DatePicker id={dueId} value={dates[k.kind]?.dueOn ?? ""}
                  onChange={(v) => setDates({ ...dates, [k.kind]: { ...dates[k.kind], dueOn: v } })} />
              </div>
            </div>
            );
          })}
          {releases && (
            <div className="max-w-xs space-y-1">
              <RequiredLabel htmlFor="dates-release" required>{t("builder.results.releaseDate")}</RequiredLabel>
              <DatePicker id="dates-release" value={release} onChange={setRelease} />
            </div>
          )}
        </div>
        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>{tCommon("actions.cancel")}</Button>
          <Button type="button" onClick={() => void save()} disabled={busy} loading={busy} loadingLabel={tCommon("actions.saving")}>{tCommon("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
