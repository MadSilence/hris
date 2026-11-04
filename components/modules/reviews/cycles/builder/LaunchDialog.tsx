"use client";

import React, { useState } from "react";
import { Alert02Icon, UnavailableIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { launchCycleAction } from "@/components/modules/reviews/actions/reviewCycleActions";
import { useLaunchPreview } from "@/components/modules/reviews/hooks";
import type { Cycle } from "@/models/reviews";
import { InlineAlert } from "@/components/desact/alert";

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
          <DialogTitle>Launch cycle</DialogTitle>
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
          <div className="space-y-4 text-body">
            <div className="grid grid-cols-3 gap-2">
              <Fact label="People" value={p.participants} />
              <Fact label="Self reviews" value={p.selfReviews} />
              <Fact label="Manager reviews" value={p.managerReviews} />
              {p.upwardReviews > 0 && <Fact label="Upward reviews" value={p.upwardReviews} />}
              {p.nominations > 0 && <Fact label="Nominating peers" value={p.nominations} />}
            </div>
            {p.fewReports.length > 0 && (
              <p className="text-tertiary" data-test="few-reports">
                Upward reviews held back for: {p.fewReports.slice(0, 12).map((n) => n.name).join(", ")}
                {p.fewReports.length > 12 ? "…" : ""}.
              </p>
            )}
            {p.sample.length > 0 && (
              <p className="text-tertiary">
                {p.sample.map((s) => s.name).join(", ")}
                {p.participants > p.sample.length ? ` and ${p.participants - p.sample.length} more` : ""}.
              </p>
            )}
            {p.excludedByHireDate > 0 && (
              <p className="text-tertiary">
                {p.excludedByHireDate === 1 ? "1 person was" : `${p.excludedByHireDate} people were`} hired after the
                eligibility date and are not included.
              </p>
            )}
            {p.blockers.length > 0 && (
              <InlineAlert tone="declined">
                <p className="flex items-center gap-1.5 font-medium"><Icon icon={UnavailableIcon} size="sm" /> Fix these to launch</p>
                <ul className="mt-1 list-disc pl-5">
                  {p.blockers.map((b) => <li key={b}>{b.charAt(0).toUpperCase() + b.slice(1)}.</li>)}
                </ul>
              </InlineAlert>
            )}
            {p.noManager.length > 0 && (
              <InlineAlert tone="pending">
                <p className="flex items-center gap-1.5 font-medium">
                  <Icon icon={Alert02Icon} size="sm" />
                  {p.noManager.length === 1 ? "1 person has" : `${p.noManager.length} people have`} no manager and get no
                  manager review
                </p>
                <p className="mt-1">{p.noManager.slice(0, 12).map((n) => n.name).join(", ")}{p.noManager.length > 12 ? "…" : ""}</p>
              </InlineAlert>
            )}
            {(p.warnings ?? []).length > 0 && (
              <div data-test="launch-warnings">
                <InlineAlert tone="pending" icon={Alert02Icon} title="Before you launch">
                  <ul className="mt-1 list-disc pl-5">
                    {p.warnings.map((w) => <li key={w}>{w.charAt(0).toUpperCase() + w.slice(1)}.</li>)}
                  </ul>
                </InlineAlert>
              </div>
            )}
            <p className="text-hint text-tertiary">
              {p.nominations > 0
                ? "Each person gets a task to nominate their peers; their manager approves them."
                : "Peers are chosen after launch, on the cycle\u2019s page."} Anonymity and its threshold are fixed at launch.
            </p>
          </div>
        )}

        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>Cancel</Button>
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
    <div className="rounded-control border border-divider px-3 py-2">
      <div className="text-hint text-tertiary">{label}</div>
      <div className="text-section-title text-primary">{value}</div>
    </div>
  );
}
