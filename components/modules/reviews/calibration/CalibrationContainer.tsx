"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
import { FieldError } from "@/components/desact/field-error";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { useDateFormatter } from "@/lib/date";
import {
  calibrateRatingAction,
  closeCalibrationAction,
  setPotentialAction,
} from "@/components/modules/reviews/actions/reviewCycleActions";
import { useCalibration, useInvalidateReviews } from "@/components/modules/reviews/hooks";
import { CalibrationStatusBadge, PacketStatusBadge } from "@/components/modules/reviews/shared/ReviewBadges";
import {
  lockedText,
  REVIEW_POTENTIAL_KEYS,
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
  const t = useTranslations("reviews");
  const formatDisplayDate = useDateFormatter();
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
          <RowActionsMenu label={t("calibration.sessionActions")}>
            <RowActionDestructive icon={<Icon icon={SquareLock02Icon} size="sm" />} onClick={() => setClosing(true)}>
              {t("calibration.closeSession")}
            </RowActionDestructive>
          </RowActionsMenu>
        )}
      </div>
      <p className="-mt-4 text-body text-tertiary">
        {t("calibration.intro", {
          cycle: s.cycleName,
          count: s.rows.length + s.hidden,
          hasClosed: s.closedAt ? "yes" : "no",
          closed: s.closedAt ? formatDisplayDate(s.closedAt, { style: "medium" }) : "",
        })}
      </p>
      {s.hidden > 0 && (
        <p className="flex items-center gap-2 text-body text-tertiary">
          <Icon icon={ViewOffSlashIcon} size="sm" />
          {t("calibration.hidden", { count: s.hidden })}
        </p>
      )}

      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">{t("calibration.tabs.table")}</TabsTrigger>
          <TabsTrigger value="nine-box">{t("calibration.tabs.nineBox")}</TabsTrigger>
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
        title={t("calibration.closeSession")}
        confirmLabel={t("calibration.closeSession")}
        destructive
        onCancelAction={() => setClosing(false)}
        onConfirmAction={async () => {
          const res = await closeCalibrationAction(s.id);
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("error.generic");
          setClosing(false);
          showSuccess(t("calibration.closed"));
          await invalidate();
          return null;
        }}
      >
        <p>
          {t("calibration.closeBody")}
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
  const t = useTranslations("reviews");
  const label = (rating: number | null) => {
    if (rating == null) return "—";
    const point = s.scale.find((p) => p.value === rating);
    return point ? `${rating} · ${point.label}` : String(rating);
  };
  if (s.rows.length === 0) {
    return (
      <EmptyState compact scene="reviews-and-one-on-ones" title={t("calibration.empty.title")}
        description={t("calibration.empty.description")} />
    );
  }
  return (
    <div className="overflow-x-auto rounded-popover border border-divider bg-card">
      <table className="w-full text-body">
        <thead className="text-left text-hint text-tertiary">
          <tr className="border-b border-divider">
            <th className="px-4 py-2 font-medium">{t("calibration.col.person")}</th>
            <th className="px-4 py-2 font-medium">{t("calibration.col.department")}</th>
            <th className="px-4 py-2 font-medium">{t("calibration.col.manager")}</th>
            <th className="px-4 py-2 font-medium">{t("calibration.col.status")}</th>
            <th className="px-4 py-2 font-medium">{t("calibration.col.managerRating")}</th>
            <th className="px-4 py-2 font-medium">{t("calibration.col.finalRating")}</th>
            <th className="px-4 py-2 font-medium">{t("calibration.col.potential")}</th>
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
                <td className="px-4 py-2">{r.managerReviewIn ? label(r.managerRating) : t("calibration.notInYet")}</td>
                <td className="px-4 py-2">
                  <div className="text-primary">{label(r.finalRating)}</div>
                  {r.calibrated && (
                    <div className="max-w-xs text-hint text-tertiary">
                      {t("packet.calibrated", {
                        hasFrom: "no",
                        from: "",
                        hasBy: r.calibratedBy ? "yes" : "no",
                        by: r.calibratedBy?.name ?? "",
                        hasAt: "no",
                        at: "",
                        hasReason: r.calibrationReason ? "yes" : "no",
                        reason: r.calibrationReason ?? "",
                      })}
                    </div>
                  )}
                  {!editable && lockedText(t, r) && (
                    <div className="max-w-xs text-hint text-tertiary" data-test="locked-hint">
                      {lockedText(t, r)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editable ? (
                    <Select value={r.potential ?? NONE}
                      onValueChange={(v) => onPotential(r, v === NONE ? null : (v as ReviewPotential))}>
                      <SelectTrigger className="h-8 w-32" aria-label={t("calibration.potentialOf", { name: r.subject.name })}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>{t("calibration.noPotential")}</SelectItem>
                        {REVIEW_POTENTIALS.map((p) => <SelectItem key={p} value={p}>{t(REVIEW_POTENTIAL_KEYS[p])}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (r.potential ? t(REVIEW_POTENTIAL_KEYS[r.potential]) : "—")}
                </td>
                <td className="px-4 py-2 text-right">
                  {editable && r.managerReviewIn && (
                    <RowActionsMenu label={t("run.person.actions")}>
                      <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" className="text-tertiary" />} onClick={() => onAdjust(r)}>
                        {t("calibration.changeRating")}
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
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const [rating, setRating] = useState<string>("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (row) {
      setRating(row.finalRating != null ? String(row.finalRating) : "");
      setReason("");
      setError(null);
      setTried(false);
    }
  }, [row]);
  if (!row) return null;
  const changed = rating !== "" && Number(rating) !== row.finalRating;

  const save = async () => {
    setTried(true);
    if (!changed || !reason.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await calibrateRatingAction({ id: session.id, participantId: row.participantId, rating: Number(rating), reason: reason.trim() });
      if (res.status !== ActionStatus.SUCCESS) {
        setError(res.errorMessage ?? t("error.generic"));
        return;
      }
      showSuccess(t("calibration.adjust.done"));
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
            <DialogTitle>{t("calibration.changeRating")}</DialogTitle>
            <DialogDescription>
              {t("calibration.adjust.description", {
                name: row.subject.name,
                hasRating: row.managerRating != null ? "yes" : "no",
                rating: row.managerRating ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="calibration-rating">{t("calibration.col.finalRating")}</RequiredLabel>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger id="calibration-rating"><SelectValue placeholder={t("calibration.adjust.selectRating")} /></SelectTrigger>
                <SelectContent>
                  {session.scale.map((p) => <SelectItem key={p.value} value={String(p.value)}>{p.value} · {p.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError>
                {tried && !changed
                  ? rating === "" ? tCommon("validation.required") : t("calibration.adjust.sameRating")
                  : null}
              </FieldError>
            </div>
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="calibration-reason">{t("write.declineDialog.reason")}</RequiredLabel>
              <Textarea id="calibration-reason" value={reason} maxLength={2000} rows={3}
                onChange={(e) => setReason(e.target.value)} placeholder={t("calibration.adjust.reasonPlaceholder")} />
              <FieldError>{tried && !reason.trim() ? tCommon("validation.required") : null}</FieldError>
              <p className="text-hint text-tertiary">
                {t("calibration.adjust.reasonHint", { name: row.subject.name.split(" ")[0] })}
              </p>
            </div>
          </div>
          <FormError message={error} />
          <DialogFooter className="mt-4">
            <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>{tCommon("actions.cancel")}</Button>
            <Button type="submit" disabled={busy} loading={busy} loadingLabel={tCommon("actions.saving")}>
              {tCommon("actions.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
