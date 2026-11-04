"use client";

import React, { useEffect, useState } from "react";
import { PencilEdit02Icon, SquareLock02Icon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Textarea } from "@/components/desact/textarea";
import { Skeleton } from "@/components/desact/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/desact/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/desact/select";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { formatDisplayDate } from "@/lib/date";
import {
  calibrateRatingAction,
  closeCalibrationAction,
  setPotentialAction,
} from "@/components/modules/reviews/actions/reviewCycleActions";
import { useCalibration, useInvalidateReviews } from "@/components/modules/reviews/hooks";
import { CalibrationStatusBadge, PacketStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";
import {
  REVIEW_POTENTIAL_LABELS,
  REVIEW_POTENTIALS,
  type CalibrationRow,
  type CalibrationSession,
  type ReviewPotential,
} from "@/models/reviews";
import { NineBoxView } from "./NineBoxView";

const NONE = "NONE";

/**
 * One calibration session (REVIEWS_PLAN.md 12.1–12.2): the table, where a final rating changes with a reason and a
 * potential is set, and the 9-box over the same people. A person whose review is shared is read-only (A8); a closed
 * session is read-only throughout.
 */
export function CalibrationContainer({ sessionId }: { sessionId: string }) {
  const session = useCalibration(sessionId);
  const invalidate = useInvalidateReviews();
  const [adjusting, setAdjusting] = useState<CalibrationRow | null>(null);
  const [closing, setClosing] = useState(false);

  if (session.error) return <div className="mx-auto max-w-6xl"><ErrorState error={session.error} /></div>;
  if (!session.data) {
    return (
      <div className="mx-auto max-w-6xl space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-64 w-full rounded-popover" />
      </div>
    );
  }
  const s = session.data;

  const setPotential = async (row: CalibrationRow, potential: ReviewPotential | null) => {
    const res = await setPotentialAction({ id: s.id, participantId: row.participantId, potential });
    if (res.status !== ActionStatus.SUCCESS) {
      showActionError(res);
      return;
    }
    await invalidate();
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <SettingsPageHeader title={s.name} backHref={`/reviews/cycles/${s.cycleId}`} className="min-w-0 flex-1" />
        <CalibrationStatusBadge status={s.status} />
        {s.canEdit && (
          <RowActionsMenu label="Session actions">
            <RowActionDestructive icon={<Icon icon={SquareLock02Icon} size="sm" />} onClick={() => setClosing(true)}>
              Close session
            </RowActionDestructive>
          </RowActionsMenu>
        )}
      </div>
      <p className="-mt-4 text-body text-tertiary">
        {s.cycleName} · {s.rows.length + s.hidden} people
        {s.closedAt ? ` · closed ${formatDisplayDate(s.closedAt, { style: "medium" })}` : ""}.
        {" "}A changed rating becomes the person&apos;s final rating; the manager review stays as written. Calibrating
        does not share or approve anything.
      </p>
      {s.hidden > 0 && (
        <p className="flex items-center gap-2 text-body text-tertiary">
          <Icon icon={ViewOffSlashIcon} size="sm" />
          {s.hidden} {s.hidden === 1 ? "person" : "people"} in this session {s.hidden === 1 ? "is" : "are"} outside the
          results you can read, and not shown.
        </p>
      )}

      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="nine-box">9-Box</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="mt-4">
          <CalibrationTable session={s} onAdjust={setAdjusting} onPotential={(r, p) => void setPotential(r, p)} />
        </TabsContent>
        <TabsContent value="nine-box" className="mt-4">
          <NineBoxView rows={s.rows} scale={s.scale} canEdit={s.canEdit}
            onPotentialAction={(r, p) => void setPotential(r, p)} />
        </TabsContent>
      </Tabs>

      <AdjustRatingDialog session={s} row={adjusting} onCloseAction={() => setAdjusting(null)}
        onDoneAction={async () => { setAdjusting(null); await invalidate(); }} />

      <ConfirmDialog
        open={closing}
        title="Close session"
        confirmLabel="Close session"
        destructive
        onCancelAction={() => setClosing(false)}
        onConfirmAction={async () => {
          const res = await closeCalibrationAction(s.id);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
          setClosing(false);
          showSuccess("Session closed.");
          await invalidate();
          return null;
        }}
      >
        <p>
          Ratings and potentials in this session are frozen. The ratings stand as calibrated; a closed session cannot be
          reopened.
        </p>
      </ConfirmDialog>
    </div>
  );
}

function CalibrationTable({ session: s, onAdjust, onPotential }: {
  session: CalibrationSession;
  onAdjust: (row: CalibrationRow) => void;
  onPotential: (row: CalibrationRow, potential: ReviewPotential | null) => void;
}) {
  const label = (rating: number | null) => {
    if (rating == null) return "—";
    const point = s.scale.find((p) => p.value === rating);
    return point ? `${rating} · ${point.label}` : String(rating);
  };
  if (s.rows.length === 0) {
    return (
      <EmptyState compact scene="reviews-and-one-on-ones" title="Nobody to calibrate here"
        description="The people of this session are outside the results you may read." />
    );
  }
  return (
    <div className="overflow-x-auto rounded-popover border border-divider bg-card">
      <table className="w-full text-body">
        <thead className="text-left text-hint text-tertiary">
          <tr className="border-b border-divider">
            <th className="px-4 py-2 font-medium">Person</th>
            <th className="px-4 py-2 font-medium">Department</th>
            <th className="px-4 py-2 font-medium">Manager</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Manager rating</th>
            <th className="px-4 py-2 font-medium">Final rating</th>
            <th className="px-4 py-2 font-medium">Potential</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {s.rows.map((r) => {
            const editable = s.canEdit && r.editable;
            return (
              <tr key={r.participantId} className="border-b border-divider align-top last:border-0" data-test="calibration-row">
                <td className="px-4 py-2 text-primary">{r.subject.name}</td>
                <td className="px-4 py-2">{r.department ?? "—"}</td>
                <td className="px-4 py-2">{r.manager?.name ?? "—"}</td>
                <td className="px-4 py-2"><PacketStatusBadge status={r.status} /></td>
                <td className="px-4 py-2">{r.managerReviewIn ? label(r.managerRating) : "Not in yet"}</td>
                <td className="px-4 py-2">
                  <div className="text-primary">{label(r.finalRating)}</div>
                  {r.calibrated && (
                    <div className="max-w-xs text-hint text-tertiary">
                      Calibrated{r.calibratedBy ? ` by ${r.calibratedBy.name}` : ""}
                      {r.calibrationReason ? `: ${r.calibrationReason}` : ""}
                    </div>
                  )}
                  {!editable && r.lockedReason && (
                    <div className="max-w-xs text-hint text-tertiary" data-test="locked-hint">
                      Read-only: {r.lockedReason}.
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editable ? (
                    <Select value={r.potential ?? NONE}
                      onValueChange={(v) => onPotential(r, v === NONE ? null : (v as ReviewPotential))}>
                      <SelectTrigger className="h-8 w-32" aria-label={`Potential of ${r.subject.name}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>No potential</SelectItem>
                        {REVIEW_POTENTIALS.map((p) => <SelectItem key={p} value={p}>{REVIEW_POTENTIAL_LABELS[p]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (r.potential ? REVIEW_POTENTIAL_LABELS[r.potential] : "—")}
                </td>
                <td className="px-4 py-2 text-right">
                  {editable && r.managerReviewIn && (
                    <RowActionsMenu label="Person actions">
                      <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" className="text-tertiary" />} onClick={() => onAdjust(r)}>
                        Change rating
                      </RowAction>
                    </RowActionsMenu>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** A new final rating, with the reason that is required for it (12.1). */
function AdjustRatingDialog({ session, row, onCloseAction, onDoneAction }: {
  session: CalibrationSession;
  row: CalibrationRow | null;
  onCloseAction: () => void;
  onDoneAction: () => void;
}) {
  const [rating, setRating] = useState<string>("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (row) {
      setRating(row.finalRating != null ? String(row.finalRating) : "");
      setReason("");
      setError(null);
    }
  }, [row]);
  if (!row) return null;
  const changed = rating !== "" && Number(rating) !== row.finalRating;

  const save = async () => {
    if (!changed || !reason.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await calibrateRatingAction({ id: session.id, participantId: row.participantId, rating: Number(rating), reason: reason.trim() });
      if (res.status !== ActionStatus.SUCCESS) {
        setError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      showSuccess("Rating calibrated.");
      onDoneAction();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={(e) => { e.preventDefault(); void save(); }}>
          <DialogHeader>
            <DialogTitle>Change rating</DialogTitle>
            <DialogDescription>
              {row.subject.name}&apos;s final rating. Their manager gave {row.managerRating ?? "no rating"}; what the
              manager wrote stays as it is. The change and its reason are recorded.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="calibration-rating">Final rating</RequiredLabel>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger id="calibration-rating"><SelectValue placeholder="Select a rating" /></SelectTrigger>
                <SelectContent>
                  {session.scale.map((p) => <SelectItem key={p.value} value={String(p.value)}>{p.value} · {p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="calibration-reason">Reason</RequiredLabel>
              <Textarea id="calibration-reason" value={reason} maxLength={2000} rows={3}
                onChange={(e) => setReason(e.target.value)} placeholder="Why the rating changes" />
              <p className="text-hint text-tertiary">
                Read by the manager, the approver and HR. Never shown to {row.subject.name.split(" ")[0]}.
              </p>
            </div>
          </div>
          <FormError message={error} />
          <DialogFooter className="mt-4">
            <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy || !changed || !reason.trim()}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
