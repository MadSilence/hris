"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
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
import { reviewNoticeLines, type Cycle } from "@/models/reviews";
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
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const preview = useLaunchPreview(cycleId, open);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const p = preview.data;
  const blocked = !p || p.blockers.length > 0;
  const blockers = p ? reviewNoticeLines(t, p.blockers, p.blockerCodes) : [];
  const warnings = p ? reviewNoticeLines(t, p.warnings, p.warningCodes) : [];

  const launch = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await launchCycleAction(cycleId);
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        setError(res.errorMessage ?? t("error.generic"));
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
          <DialogTitle>{t("launch.title")}</DialogTitle>
          <DialogDescription>
            {t("launch.description")}
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
              <Fact label={t("launch.fact.people")} value={p.participants} />
              <Fact label={t("launch.fact.self")} value={p.selfReviews} />
              <Fact label={t("launch.fact.manager")} value={p.managerReviews} />
              {p.upwardReviews > 0 && <Fact label={t("launch.fact.upward")} value={p.upwardReviews} />}
              {p.nominations > 0 && <Fact label={t("launch.fact.nominating")} value={p.nominations} />}
            </div>
            {p.fewReports.length > 0 && (
              <p className="text-tertiary" data-test="few-reports">
                {t("launch.fewReports", {
                  names: p.fewReports.slice(0, 12).map((n) => n.name).join(", ") + (p.fewReports.length > 12 ? "…" : ""),
                })}
              </p>
            )}
            {p.sample.length > 0 && (
              <p className="text-tertiary">
                {p.participants > p.sample.length
                  ? t("launch.sampleMore", { names: p.sample.map((s) => s.name).join(", "), count: p.participants - p.sample.length })
                  : t("launch.sample", { names: p.sample.map((s) => s.name).join(", ") })}
              </p>
            )}
            {p.excludedByHireDate > 0 && (
              <p className="text-tertiary">
                {t("launch.excludedByHireDate", { count: p.excludedByHireDate })}
              </p>
            )}
            {blockers.length > 0 && (
              <InlineAlert tone="declined">
                <p className="flex items-center gap-1.5 font-medium"><Icon icon={UnavailableIcon} size="sm" /> {t("launch.blockers")}</p>
                <ul className="mt-1 list-disc pl-5">
                  {blockers.map((b, i) => <li key={`${i}-${b}`}>{b}</li>)}
                </ul>
              </InlineAlert>
            )}
            {p.noManager.length > 0 && (
              <InlineAlert tone="pending">
                <p className="flex items-center gap-1.5 font-medium">
                  <Icon icon={Alert02Icon} size="sm" />
                  {t("launch.noManager", { count: p.noManager.length })}
                </p>
                <p className="mt-1">{p.noManager.slice(0, 12).map((n) => n.name).join(", ")}{p.noManager.length > 12 ? "…" : ""}</p>
              </InlineAlert>
            )}
            {warnings.length > 0 && (
              <div data-test="launch-warnings">
                <InlineAlert tone="pending" icon={Alert02Icon} title={t("launch.warnings")}>
                  <ul className="mt-1 list-disc pl-5">
                    {warnings.map((w, i) => <li key={`${i}-${w}`}>{w}</li>)}
                  </ul>
                </InlineAlert>
              </div>
            )}
            <p className="text-hint text-tertiary">
              {p.nominations > 0 ? t("launch.footNominate") : t("launch.footAdmin")}
            </p>
          </div>
        )}

        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction} disabled={busy}>{tCommon("actions.cancel")}</Button>
          <Button type="button" onClick={() => void launch()} disabled={busy || blocked}>
            {busy ? t("launch.launching") : t("launch.launch")}
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
