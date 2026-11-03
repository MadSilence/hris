"use client";

import React, { useState } from "react";
import { AlertTriangle, Ban } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { launchCycleAction } from "@/components/modules/reviews/actions/reviewCycleActions";
import { useLaunchPreview } from "@/components/modules/reviews/hooks";
import type { Cycle } from "@/models/reviews";

/**
 * Launch, after a preview of what it will do (REVIEWS_DESIGN.md § 5.3): how many people, how many reviews, what
 * stops it and who it leaves without a manager review. Nothing is written until Launch is pressed.
 */
export function LaunchDialog({ cycleId, open, onCloseAction, onLaunchedAction }: {
  cycleId: string;
  open: boolean;
  onCloseAction: () => void;
  onLaunchedAction: (cycle: Cycle) => void;
}) {
  const preview = useLaunchPreview(cycleId, open);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const p = preview.data;
  const blocked = !p || p.blockers.length > 0;

  const launch = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await launchCycleAction(cycleId);
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        setError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      onLaunchedAction(res.data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) { setError(null); onCloseAction(); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Launch Cycle</DialogTitle>
          <DialogDescription>
            Launching asks everybody below for their reviews and puts them in their Tasks. After launch the forms, the
            kinds of review, the scale and anonymity can no longer change; dates still can.
          </DialogDescription>
        </DialogHeader>

        {preview.error ? (
          <ErrorState error={preview.error} />
        ) : !p ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <Fact label="People" value={p.participants} />
              <Fact label="Self Reviews" value={p.selfReviews} />
              <Fact label="Manager Reviews" value={p.managerReviews} />
              {p.upwardReviews > 0 && <Fact label="Upward Reviews" value={p.upwardReviews} />}
              {p.nominations > 0 && <Fact label="Nominating Peers" value={p.nominations} />}
            </div>
            {p.fewReports.length > 0 && (
              <p className="text-muted-foreground" data-test="few-reports">
                Upward reviews held back for: {p.fewReports.slice(0, 12).map((n) => n.name).join(", ")}
                {p.fewReports.length > 12 ? "…" : ""}.
              </p>
            )}
            {p.sample.length > 0 && (
              <p className="text-muted-foreground">
                {p.sample.map((s) => s.name).join(", ")}
                {p.participants > p.sample.length ? ` and ${p.participants - p.sample.length} more` : ""}.
              </p>
            )}
            {p.excludedByHireDate > 0 && (
              <p className="text-muted-foreground">
                {p.excludedByHireDate === 1 ? "1 person was" : `${p.excludedByHireDate} people were`} hired after the
                eligibility date and are not included.
              </p>
            )}
            {p.blockers.length > 0 && (
              <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-danger-700" role="alert">
                <p className="flex items-center gap-1.5 font-medium"><Ban className="h-4 w-4" /> Fix these to launch</p>
                <ul className="mt-1 list-disc pl-5">
                  {p.blockers.map((b) => <li key={b}>{b.charAt(0).toUpperCase() + b.slice(1)}.</li>)}
                </ul>
              </div>
            )}
            {p.noManager.length > 0 && (
              <div className="rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 text-warning-700">
                <p className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  {p.noManager.length === 1 ? "1 person has" : `${p.noManager.length} people have`} no manager and get no
                  manager review
                </p>
                <p className="mt-1">{p.noManager.slice(0, 12).map((n) => n.name).join(", ")}{p.noManager.length > 12 ? "…" : ""}</p>
              </div>
            )}
            {(p.warnings ?? []).length > 0 && (
              <div className="rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 text-warning-700" data-test="launch-warnings">
                <p className="flex items-center gap-1.5 font-medium"><AlertTriangle className="h-4 w-4" /> Before you launch</p>
                <ul className="mt-1 list-disc pl-5">
                  {p.warnings.map((w) => <li key={w}>{w.charAt(0).toUpperCase() + w.slice(1)}.</li>)}
                </ul>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {p.nominations > 0
                ? "Each person gets a task to nominate their peers; their manager approves them."
                : "Peers are chosen after launch, on the cycle\u2019s page."} Anonymity and its threshold are fixed at launch.
            </p>
          </div>
        )}

        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCloseAction} disabled={busy}>Cancel</Button>
          <Button type="button" onClick={() => void launch()} disabled={busy || blocked}>
            {busy ? "Launching…" : "Launch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Fact({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-brown-100 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold text-brown-900">{value}</div>
    </div>
  );
}
