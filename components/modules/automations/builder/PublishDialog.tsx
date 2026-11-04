"use client";

import React, { useEffect, useState } from "react";
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

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

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
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as BackfillChoice)} className="gap-2">
      <Choice
        value="NONE"
        title="Only people from now on"
        detail="Whoever reaches the moment from today. Anybody already past it is left as they are."
      />
      <Choice
        value="ALL"
        title="Also people who already match"
        detail={
          pastMomentCount == null
            ? "Also everybody whose moment has already passed — their steps run today."
            : `Also ${plural(pastMomentCount, "person", "people")} whose moment has already passed — their steps run today.`
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
  if (!volume || volume.messages <= volume.threshold) return null;
  return (
    <label className="flex cursor-pointer items-start gap-2 rounded-control bg-status-pending-bg px-3 py-2 text-body text-status-pending-text">
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(c === true)} aria-label="Confirm the number of messages" className="mt-0.5" />
      <span>One firing sends about {volume.messages} notifications and emails at once. I mean it.</span>
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
          <DialogTitle>{isNew ? "Publish automation" : `Publish version ${versionNo + 1}`}</DialogTitle>
          <DialogDescription>
            {isNew
              ? `The rule is saved as version 1.${matchingCount != null ? ` ${plural(matchingCount, "person matches", "people match")} it now.` : ""}`
              : "A published version is never edited — this becomes the version every new run follows."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {askInFlight && inFlight && (
            <div className="space-y-2" data-test="publish-in-flight">
              <p className="m-0 text-body font-medium text-primary">
                {plural(underWay, "run is", "runs are")} under way
              </p>
              <RadioGroup value={inFlightChoice} onValueChange={(v) => setInFlightChoice(v as InFlightChoice)} className="gap-2">
                <Choice
                  value="KEEP"
                  title="Keep in-flight on the current version"
                  detail={`${plural(inFlight.scheduledRuns, "scheduled run finishes", "scheduled runs finish")} as version ${versionNo} said. Only new firings use the new version.`}
                />
                <Choice
                  value="MOVE"
                  title="Move everyone to the new version"
                  detail={`Runs not started yet are planned again: ${inFlight.wouldCancel} cancelled, ${inFlight.wouldAdd} added. ${plural(inFlight.inProgressRuns, "run already part-done stays", "runs already part-done stay")} on version ${versionNo}.`}
                />
              </RadioGroup>
              <p className="m-0 text-hint text-tertiary">
                {plural(inFlight.completedRuns, "completed run is", "completed runs are")} unaffected either way —
                what was sent or assigned is never rewritten.
              </p>
            </div>
          )}

          {canEnable && (
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-2 text-body text-primary">
                <Checkbox checked={enable} onCheckedChange={(c) => setEnable(c === true)} aria-label="Enable it now" />
                Enable it now
              </label>
              {enable && <EnableChoice value={backfill} onChange={setBackfill} pastMomentCount={pastMomentCount} />}
              {!enable && (
                <p className="m-0 text-hint text-tertiary">It stays disabled; enable it from the menu when you are ready.</p>
              )}
            </div>
          )}

          {askInFlight && inFlight && inFlight.waitingRuns > 0 && (
            <p className="m-0 text-hint text-tertiary">
              {plural(inFlight.waitingRuns, "run is", "runs are")} waiting for a task, a field or an approval — they stay
              on version {versionNo} either way.
            </p>
          )}

          <VolumeConfirm volume={volume} checked={confirmVolume} onChange={setConfirmVolume} />

          <FormError message={errorMessage} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button type="button"
            onClick={() => onConfirm({ inFlight: inFlightChoice, enable: canEnable && enable, backfill, confirmVolume })}
            disabled={isLoading || (overVolume(volume) && !confirmVolume)}
          >
            {isLoading ? "Publishing…" : "Publish"}
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
          <DialogTitle>Enable automation</DialogTitle>
          <DialogDescription>From now on the rule runs on its own. Who should it cover?</DialogDescription>
        </DialogHeader>
        <EnableChoice value={backfill} onChange={setBackfill} pastMomentCount={pastMomentCount} />
        <VolumeConfirm volume={volume} checked={confirmVolume} onChange={setConfirmVolume} />
        <FormError message={errorMessage} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button type="button" onClick={() => onConfirm(backfill, confirmVolume)} disabled={isLoading || (overVolume(volume) && !confirmVolume)}>{isLoading ? "Enabling…" : "Enable"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
