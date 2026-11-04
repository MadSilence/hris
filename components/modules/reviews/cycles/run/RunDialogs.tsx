"use client";

import React, { useEffect, useState } from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { showSuccess } from "@/lib/errors/errorToast";
import {
  addPeersAction,
  reassignReviewAction,
  updateCycleDatesAction,
} from "@/components/modules/reviews/actions/reviewCycleActions";
import { REVIEW_KIND_LABELS, type Cycle, type PersonRow, type ReviewKind } from "@/models/reviews";

const nameOf = (u: PickedUser) => [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "Somebody";

/** Peers for one person, chosen by whoever runs the cycle (R2), within the cycle's fewest and most. */
export function ChoosePeersDialog({ person, open, onCloseAction, onDoneAction }: {
  person: PersonRow | null;
  open: boolean;
  onCloseAction: () => void;
  onDoneAction: () => void;
}) {
  const [picked, setPicked] = useState<PickedUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setPicked([]); setError(null); } }, [open]);
  if (!person) return null;
  const room = (person.peerMax ?? 0) - person.peers;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await addPeersAction({ participantId: person.participantId, reviewerUserIds: picked.map((p) => p.id) });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        setError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      showSuccess(res.data.warnings.length ? res.data.warnings.join(". ") + "." : "Peers asked.");
      onDoneAction();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose peers</DialogTitle>
          <DialogDescription>
            Colleagues who review {person.subject.name}. They have {person.peers} now; this cycle asks for
            {person.peerMin != null ? ` ${person.peerMin}` : ""}–{person.peerMax ?? ""}. Each is asked at once and gets a task.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {picked.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-control border border-divider px-3 py-1.5 text-body">
              {nameOf(p)}
              <button type="button" aria-label={`Remove ${nameOf(p)}`} className="text-tertiary hover:text-primary"
                onClick={() => setPicked(picked.filter((x) => x.id !== p.id))}>
                <Icon icon={Cancel01Icon} size="sm" />
              </button>
            </div>
          ))}
          {picked.length < room && (
            <UserPickerField value={null} placeholder="Add a person"
              onChange={(u) => u && !picked.some((x) => x.id === u.id) && u.id !== person.subject.userId && setPicked([...picked, u])} />
          )}
          {room <= 0 && <p className="text-body text-tertiary">This person already has the most peers the cycle allows.</p>}
        </div>
        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>Cancel</Button>
          <Button type="button" onClick={() => void save()} disabled={busy || picked.length === 0}>
            {busy ? "Asking…" : "Ask them"}
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
  const [picked, setPicked] = useState<PickedUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setPicked(target?.suggestion ?? null); setError(null); } }, [open, target]);
  if (!target) return null;

  const save = async () => {
    if (!picked) return;
    setBusy(true);
    setError(null);
    try {
      const res = await reassignReviewAction({ assignmentId: target.assignmentId, reviewerUserId: picked.id });
      if (res.status !== ActionStatus.SUCCESS) {
        setError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      showSuccess("Review handed on.");
      onDoneAction();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hand to someone else</DialogTitle>
          <DialogDescription>
            The {REVIEW_KIND_LABELS[target.kind].toLowerCase()} of {target.subjectName}, now with {target.reviewerName}. Anything
            already typed goes with it.
            {target.kind === "MANAGER" && " The new reviewer becomes the manager who shares this review."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <RequiredLabel required>New reviewer</RequiredLabel>
          <UserPickerField value={picked} onChange={setPicked} />
        </div>
        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>Cancel</Button>
          <Button type="button" onClick={() => void save()} disabled={busy || !picked}>{busy ? "Handing on…" : "Hand on"}</Button>
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
        setError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      showSuccess("Dates saved.");
      onDoneAction();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit dates</DialogTitle>
          <DialogDescription>Open reviews take the new due date, and their reminders move with it.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {cycle.kinds.map((k) => (
            <div key={k.kind} className="grid grid-cols-[1fr_1fr_1fr] items-end gap-2">
              <span className="pb-2 text-body font-medium text-primary">{REVIEW_KIND_LABELS[k.kind]}</span>
              <div className="space-y-1">
                <RequiredLabel htmlFor={`dates-${k.kind}-opens`}>Opens on</RequiredLabel>
                <DatePicker id={`dates-${k.kind}-opens`} value={dates[k.kind]?.opensOn ?? ""} clearable
                  onChange={(v) => setDates({ ...dates, [k.kind]: { ...dates[k.kind], opensOn: v } })} />
              </div>
              <div className="space-y-1">
                <RequiredLabel htmlFor={`dates-${k.kind}-due`} required>Due on</RequiredLabel>
                <DatePicker id={`dates-${k.kind}-due`} value={dates[k.kind]?.dueOn ?? ""}
                  onChange={(v) => setDates({ ...dates, [k.kind]: { ...dates[k.kind], dueOn: v } })} />
              </div>
            </div>
          ))}
          {releases && (
            <div className="max-w-xs space-y-1">
              <RequiredLabel htmlFor="dates-release" required>Release date</RequiredLabel>
              <DatePicker id="dates-release" value={release} onChange={setRelease} />
            </div>
          )}
        </div>
        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>Cancel</Button>
          <Button type="button" onClick={() => void save()} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
