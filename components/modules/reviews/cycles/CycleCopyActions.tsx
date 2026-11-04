"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { Label } from "@/components/desact/label";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { formatDisplayDate } from "@/lib/date";
import {
  duplicateCycleAction,
  saveCycleAsTemplateAction,
  startCycleFromTemplateAction,
} from "@/components/modules/reviews/actions/reviewCycleActions";
import { useInvalidateReviews } from "@/components/modules/reviews/hooks";
import type { Cycle } from "@/models/reviews";
import { MAX_REPEAT_MONTHS, REPEAT_MONTH_PRESETS, shiftedCycleDates, validRepeatMonths } from "./cycleCopies";

const draftHref = (id: string) => `/reviews/cycles/${id}`;

/**
 * A cycle copied into a new draft (REVIEWS_PLAN.md 11.1–11.2): duplicated, saved as a template, or started from a
 * template. Each opens the new draft; a refusal slides in as a card, since nothing here has a form to hold it.
 */
export function useCycleCopies() {
  const router = useRouter();
  const invalidate = useInvalidateReviews();
  const [busy, setBusy] = useState(false);

  const run = async (result: Promise<Awaited<ReturnType<typeof duplicateCycleAction>>>, done: string, open = true) => {
    setBusy(true);
    try {
      const res = await result;
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        showActionError(res);
        return null;
      }
      await invalidate();
      showSuccess(done);
      if (open) router.push(draftHref(res.data.id));
      return res.data;
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    duplicate: (id: string) => run(duplicateCycleAction({ id, shiftMonths: null }), "Cycle duplicated."),
    saveAsTemplate: (id: string) => run(saveCycleAsTemplateAction(id), "Saved as a template.", false),
    startFromTemplate: (templateId: string) => run(startCycleFromTemplateAction(templateId), "Cycle added from the template."),
  };
}

/**
 * "Repeat…": a new draft with every date of the cycle moved by a chosen number of months, the moved dates shown
 * before anything is written. The name moves its period too when it states one ("H1 2026" → "H2 2026").
 */
export function RepeatCycleDialog({ cycle, open, onCloseAction }: {
  cycle: Cycle;
  open: boolean;
  onCloseAction: () => void;
}) {
  const router = useRouter();
  const invalidate = useInvalidateReviews();
  const [preset, setPreset] = useState<string>("12");
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) { setPreset("12"); setCustom(""); setError(null); }
  }, [open]);

  const months = preset === "other" ? Number(custom) : Number(preset);
  const valid = validRepeatMonths(months);
  const dates = valid ? shiftedCycleDates(cycle, months) : [];

  const repeat = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      const res = await duplicateCycleAction({ id: cycle.id, shiftMonths: months });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        setError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      await invalidate();
      showSuccess(`${res.data.name} added as a draft.`);
      onCloseAction();
      router.push(draftHref(res.data.id));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={(e) => { e.preventDefault(); void repeat(); }}>
          <DialogHeader>
            <DialogTitle>Repeat cycle</DialogTitle>
            <DialogDescription>
              A new draft with the same people, reviews, forms and settings as {cycle.name}, every date moved later.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <Label>Move every date by</Label>
            <RadioGroup value={preset} onValueChange={setPreset} className="flex flex-wrap gap-4">
              {REPEAT_MONTH_PRESETS.map((m) => (
                <label key={m} className="flex items-center gap-2 text-body">
                  <RadioGroupItem value={String(m)} /> {m} months
                </label>
              ))}
              <label className="flex items-center gap-2 text-body">
                <RadioGroupItem value="other" /> Other
              </label>
            </RadioGroup>
            {preset === "other" && (
              <div className="flex items-center gap-2">
                <Input type="number" min={1} max={MAX_REPEAT_MONTHS} value={custom} aria-label="Months"
                  className="w-24" onChange={(e) => setCustom(e.target.value)} />
                <span className="text-body text-tertiary">months, 1 to {MAX_REPEAT_MONTHS}</span>
              </div>
            )}
            {valid && dates.length > 0 && (
              <ul className="space-y-1 rounded-control border border-divider p-3 text-body" aria-label="Moved dates">
                {dates.map((d) => (
                  <li key={d.label} className="flex justify-between gap-3">
                    <span className="text-tertiary">{d.label}</span>
                    <span className="text-primary">
                      {formatDisplayDate(d.from, { style: "medium" })} → {formatDisplayDate(d.to, { style: "medium" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {valid && dates.length === 0 && (
              <p className="text-body text-tertiary">This cycle has no dates to move; the new draft has none either.</p>
            )}
          </div>
          <FormError message={error} />
          <DialogFooter className="mt-4">
            <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy || !valid}>{busy ? "Repeating…" : "Repeat"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
