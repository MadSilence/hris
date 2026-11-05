"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { FormError } from "@/components/feedback/FormError";
import type { BackfillChoice, InFlightChoice, InFlightImpact } from "@/models/automations";

function Choice({ value, title, detail }: { value: string; title: string; detail: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-control border border-divider p-3 has-[[data-state=checked]]:border-field has-[[data-state=checked]]:bg-subtle/60">
      <RadioGroupItem value={value} className="mt-0.5" aria-label={title} />
      <span className="text-body">
        <span className="block font-medium text-primary">{title}</span>
        <span className="block text-tertiary">{detail}</span>
      </span>
    </label>
  );
}

/**
 * Who a rule applies to on the day it is switched on (A2). Forward only is the default; the other
 * choice says how many people it adds, from the preview, before anybody picks it.
 */
export function EnableChoice({
  value,
  onChange,
  pastMomentCount,
}: {
  value: BackfillChoice;
  onChange: (value: BackfillChoice) => void;
  pastMomentCount: number | null;
}) {
  const t = useTranslations("automations");
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as BackfillChoice)} className="gap-2">
      <Choice
        value="NONE"
        title={t("publish.none.title")}
        detail={t("publish.none.detail")}
      />
      <Choice
        value="ALL"
        title={t("publish.all.title")}
        detail={
          pastMomentCount == null
            ? t("publish.all.detail")
            : t("publish.all.detailCount", { count: pastMomentCount })
        }
      />
    </RadioGroup>
  );
}

export type PublishChoices = { inFlight: InFlightChoice; enable: boolean; backfill: BackfillChoice; confirmVolume: boolean };

/** A11: one firing sends this many messages; above the threshold the author confirms it. */
export type Volume = { messages: number; threshold: number } | null;

/** The confirmation tick for a firing that sends more than the threshold. */
function VolumeConfirm({ volume, checked, onChange }: { volume: Volume; checked: boolean; onChange: (v: boolean) => void }) {
  const t = useTranslations("automations");
  if (!volume || volume.messages <= volume.threshold) return null;
  return (
    <label className="flex cursor-pointer items-start gap-2 rounded-control bg-status-pending-bg px-3 py-2 text-body text-status-pending-text">
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(c === true)} aria-label={t("publish.volumeLabel")} className="mt-0.5" />
      <span>{t("publish.volumeConfirm", { count: volume.messages })}</span>
    </label>
  );
}

const overVolume = (volume: Volume) => volume != null && volume.messages > volume.threshold;

/**
 * Publishing writes the next immutable version. Two questions, each asked only when it applies: what
 * happens to runs already under way (KEEP / MOVE, with the preview's counts — "in flight" is defined,
 * not felt: scheduled firings not yet executed, research § A.10), and, for a rule that is not on yet,
 * whether to switch it on now and for whom.
 */
export function PublishDialog({
  isOpen,
  isNew,
  versionNo,
  inFlight,
  canEnable,
  pastMomentCount,
  matchingCount,
  isLoading,
  errorMessage,
  volume = null,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  volume?: Volume;
  isNew: boolean;
  versionNo: number;
  inFlight: InFlightImpact | null;
  /** The rule is new or disabled — not enabled, paused or archived. */
  canEnable: boolean;
  pastMomentCount: number | null;
  matchingCount: number | null;
  isLoading: boolean;
  errorMessage: string | null;
  onConfirm: (choices: PublishChoices) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("automations");
  const tCommon = useTranslations("common");
  const [inFlightChoice, setInFlightChoice] = useState<InFlightChoice>("KEEP");
  const [enable, setEnable] = useState(isNew);
  const [backfill, setBackfill] = useState<BackfillChoice>("NONE");
  const [confirmVolume, setConfirmVolume] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setInFlightChoice("KEEP");
    setEnable(isNew);
    setBackfill("NONE");
    setConfirmVolume(false);
  }, [isOpen, isNew]);

  const underWay = inFlight ? inFlight.scheduledRuns + inFlight.inProgressRuns : 0;
  const askInFlight = !isNew && inFlight != null && underWay > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onCancel(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? t("publish.titleNew") : t("publish.titleVersion", { version: versionNo + 1 })}</DialogTitle>
          <DialogDescription>
            {isNew
              ? matchingCount != null ? t("publish.descNewMatching", { count: matchingCount }) : t("publish.descNew")
              : t("publish.descExisting")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {askInFlight && inFlight && (
            <div className="space-y-2" data-test="publish-in-flight">
              <p className="m-0 text-body font-medium text-primary">
                {t("publish.underWay", { count: underWay })}
              </p>
              <RadioGroup value={inFlightChoice} onValueChange={(v) => setInFlightChoice(v as InFlightChoice)} className="gap-2">
                <Choice
                  value="KEEP"
                  title={t("publish.keepTitle")}
                  detail={t("publish.keepDetail", { count: inFlight.scheduledRuns, version: versionNo })}
                />
                <Choice
                  value="MOVE"
                  title={t("publish.moveTitle")}
                  detail={t("publish.moveDetail", {
                    cancelled: inFlight.wouldCancel, added: inFlight.wouldAdd, partDone: inFlight.inProgressRuns, version: versionNo,
                  })}
                />
              </RadioGroup>
              <p className="m-0 text-hint text-tertiary">
                {t("publish.completed", { count: inFlight.completedRuns })}
              </p>
            </div>
          )}

          {canEnable && (
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-2 text-body text-primary">
                <Checkbox checked={enable} onCheckedChange={(c) => setEnable(c === true)} aria-label={t("publish.enableNow")} />
                {t("publish.enableNow")}
              </label>
              {enable && <EnableChoice value={backfill} onChange={setBackfill} pastMomentCount={pastMomentCount} />}
              {!enable && (
                <p className="m-0 text-hint text-tertiary">{t("publish.staysDisabled")}</p>
              )}
            </div>
          )}

          {askInFlight && inFlight && inFlight.waitingRuns > 0 && (
            <p className="m-0 text-hint text-tertiary">
              {t("publish.waiting", { count: inFlight.waitingRuns, version: versionNo })}
            </p>
          )}

          <VolumeConfirm volume={volume} checked={confirmVolume} onChange={setConfirmVolume} />

          <FormError message={errorMessage} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>{tCommon("actions.cancel")}</Button>
          <Button type="button"
            onClick={() => onConfirm({ inFlight: inFlightChoice, enable: canEnable && enable, backfill, confirmVolume })}
            disabled={isLoading || (overVolume(volume) && !confirmVolume)}
          >
            {isLoading ? t("publish.publishing") : tCommon("actions.publish")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Switching on a rule that already exists, from the kebab. The same question as in the publish dialog. */
export function EnableDialog({
  isOpen,
  pastMomentCount,
  isLoading,
  errorMessage,
  volume = null,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  pastMomentCount: number | null;
  isLoading: boolean;
  errorMessage: string | null;
  volume?: Volume;
  onConfirm: (backfill: BackfillChoice, confirmVolume: boolean) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("automations");
  const tCommon = useTranslations("common");
  const [backfill, setBackfill] = useState<BackfillChoice>("NONE");
  const [confirmVolume, setConfirmVolume] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setBackfill("NONE");
      setConfirmVolume(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onCancel(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("publish.enableTitle")}</DialogTitle>
          <DialogDescription>{t("publish.enableDescription")}</DialogDescription>
        </DialogHeader>
        <EnableChoice value={backfill} onChange={setBackfill} pastMomentCount={pastMomentCount} />
        <VolumeConfirm volume={volume} checked={confirmVolume} onChange={setConfirmVolume} />
        <FormError message={errorMessage} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>{tCommon("actions.cancel")}</Button>
          <Button type="button" onClick={() => onConfirm(backfill, confirmVolume)} disabled={isLoading || (overVolume(volume) && !confirmVolume)}>{isLoading ? t("publish.enabling") : t("rule.menu.enable")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
