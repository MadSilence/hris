"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/public/desact/src/components/ui/radio-group";
import { FormError } from "@/components/feedback/FormError";
import type { BackfillChoice, InFlightChoice, InFlightImpact } from "@/models/automations";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function Choice({ value, title, detail }: { value: string; title: string; detail: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-brown-100 p-3 has-[[data-state=checked]]:border-brown-300 has-[[data-state=checked]]:bg-brown-50/60">
      <RadioGroupItem value={value} className="mt-0.5" aria-label={title} />
      <span className="text-sm">
        <span className="block font-medium text-foreground">{title}</span>
        <span className="block text-muted-foreground">{detail}</span>
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
        title="Only People From Now On"
        detail="Whoever reaches the moment from today. Anybody already past it is left as they are."
      />
      <Choice
        value="ALL"
        title="Also People Who Already Match"
        detail={
          pastMomentCount == null
            ? "Also everybody whose moment has already passed — their steps run today."
            : `Also ${plural(pastMomentCount, "person", "people")} whose moment has already passed — their steps run today.`
        }
      />
    </RadioGroup>
  );
}

export type PublishChoices = { inFlight: InFlightChoice; enable: boolean; backfill: BackfillChoice };

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
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
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

  useEffect(() => {
    if (!isOpen) return;
    setInFlightChoice("KEEP");
    setEnable(isNew);
    setBackfill("NONE");
  }, [isOpen, isNew]);

  const underWay = inFlight ? inFlight.scheduledRuns + inFlight.inProgressRuns : 0;
  const askInFlight = !isNew && inFlight != null && underWay > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onCancel(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "Publish Automation" : `Publish Version ${versionNo + 1}`}</DialogTitle>
          <DialogDescription>
            {isNew
              ? `The rule is saved as version 1.${matchingCount != null ? ` ${plural(matchingCount, "person matches", "people match")} it now.` : ""}`
              : "A published version is never edited — this becomes the version every new run follows."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {askInFlight && inFlight && (
            <div className="space-y-2" data-test="publish-in-flight">
              <p className="m-0 text-sm font-medium text-foreground">
                {plural(underWay, "run is", "runs are")} under way
              </p>
              <RadioGroup value={inFlightChoice} onValueChange={(v) => setInFlightChoice(v as InFlightChoice)} className="gap-2">
                <Choice
                  value="KEEP"
                  title="Keep In-Flight on the Current Version"
                  detail={`${plural(inFlight.scheduledRuns, "scheduled run finishes", "scheduled runs finish")} as version ${versionNo} said. Only new firings use the new version.`}
                />
                <Choice
                  value="MOVE"
                  title="Move Everyone to the New Version"
                  detail={`Runs not started yet are planned again: ${inFlight.wouldCancel} cancelled, ${inFlight.wouldAdd} added. ${plural(inFlight.inProgressRuns, "run already part-done stays", "runs already part-done stay")} on version ${versionNo}.`}
                />
              </RadioGroup>
              <p className="m-0 text-xs text-muted-foreground">
                {plural(inFlight.completedRuns, "completed run is", "completed runs are")} unaffected either way —
                what was sent or assigned is never rewritten.
              </p>
            </div>
          )}

          {canEnable && (
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <Checkbox checked={enable} onCheckedChange={(c) => setEnable(c === true)} aria-label="Enable It Now" />
                Enable It Now
              </label>
              {enable && <EnableChoice value={backfill} onChange={setBackfill} pastMomentCount={pastMomentCount} />}
              {!enable && (
                <p className="m-0 text-xs text-muted-foreground">It stays disabled; enable it from the menu when you are ready.</p>
              )}
            </div>
          )}

          <FormError message={errorMessage} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button type="button"
            onClick={() => onConfirm({ inFlight: inFlightChoice, enable: canEnable && enable, backfill })}
            disabled={isLoading}
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
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  pastMomentCount: number | null;
  isLoading: boolean;
  errorMessage: string | null;
  onConfirm: (backfill: BackfillChoice) => void;
  onCancel: () => void;
}) {
  const [backfill, setBackfill] = useState<BackfillChoice>("NONE");
  useEffect(() => {
    if (isOpen) setBackfill("NONE");
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onCancel(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enable Automation</DialogTitle>
          <DialogDescription>From now on the rule runs on its own. Who should it cover?</DialogDescription>
        </DialogHeader>
        <EnableChoice value={backfill} onChange={setBackfill} pastMomentCount={pastMomentCount} />
        <FormError message={errorMessage} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button type="button" onClick={() => onConfirm(backfill)} disabled={isLoading}>{isLoading ? "Enabling…" : "Enable"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
