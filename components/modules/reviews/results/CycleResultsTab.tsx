"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Download01Icon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import {
  ExportDataModal,
  triggerExportDownload,
  type ExportDataFormValues,
} from "@/components/modules/settings/shared/ExportDataModal";
import { useCycleResults } from "@/components/modules/reviews/hooks";
import { Illustration } from "@/components/illustrations";
import {
  REVIEW_KIND_KEYS,
  formatAverage,
  shares,
  type RatingDistribution,
  type ScalePoint,
} from "@/models/reviews";

/**
 * A cycle's results in numbers (REVIEWS_PLAN.md 12.3): completion by kind and by department, the rating distribution
 * overall and by department, and ratings by manager. No answer is shown here; ratings are counted only over the people
 * whose results the reader may read (A25). The export (12.4) is for whoever runs cycles.
 */
export function CycleResultsTab({ cycleId, cycleName, canExport }: { cycleId: string; cycleName: string; canExport: boolean }) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const results = useCycleResults(cycleId);
  const [exporting, setExporting] = useState(false);
  const [busy, setBusy] = useState(false);

  if (results.error) return <ErrorState error={results.error} />;
  if (!results.data) return <Skeleton className="h-64 w-full rounded-popover" aria-busy="true" />;
  const r = results.data;
  const readable = r.people - r.ratingsHidden;

  const doExport = async ({ format }: ExportDataFormValues) => {
    setBusy(true);
    try {
      await triggerExportDownload(`/api/reviews/cycles/${cycleId}/results/export`, format);
      setExporting(false);
    } catch {
      // The refusal is already on screen (triggerExportDownload shows it); the dialog stays open to try again.
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {canExport && (
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={() => setExporting(true)}>
            <Icon icon={Download01Icon} size="sm" />{t("results.exportPeople", { people: tCommon("people.count", { count: readable }) })}
          </Button>
        </div>
      )}

      <Section title={t("results.byKind")}>
        <table className="w-full text-body">
          <thead className="text-left text-hint text-tertiary">
            <tr className="border-b border-divider">
              <th className="px-4 py-2 font-medium">{t("results.col.review")}</th>
              <th className="px-4 py-2 font-medium">{t("run.fact.submitted")}</th>
              <th className="px-4 py-2 font-medium">{t("status.assignment.overdue")}</th>
              <th className="w-1/3 px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {r.byKind.map((k) => (
              <tr key={k.kind} className="border-b border-divider last:border-0">
                <td className="px-4 py-2 text-primary">{t(REVIEW_KIND_KEYS[k.kind])}</td>
                <td className="px-4 py-2">{t("run.ofTotal", { count: k.submitted, total: k.total })}</td>
                <td className={`px-4 py-2 ${k.overdue > 0 ? "text-status-pending-text" : ""}`}>{k.overdue}</td>
                <td className="px-4 py-2"><Bar value={k.submitted} of={k.total} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title={t("results.byDepartment")} hint={t("results.byDepartmentHint")}>
        <table className="w-full text-body">
          <thead className="text-left text-hint text-tertiary">
            <tr className="border-b border-divider">
              <th className="px-4 py-2 font-medium">{t("calibration.col.department")}</th>
              <th className="px-4 py-2 font-medium">{t("launch.fact.people")}</th>
              <th className="px-4 py-2 font-medium">{t("results.col.reviewsSubmitted")}</th>
              <th className="px-4 py-2 font-medium">{t("status.participant.shared")}</th>
              <th className="w-1/3 px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {r.byDepartment.map((d) => (
              <tr key={d.department} className="border-b border-divider last:border-0">
                <td className="px-4 py-2 text-primary">{d.department}</td>
                <td className="px-4 py-2">{d.people}</td>
                <td className="px-4 py-2">{t("run.ofTotal", { count: d.submitted, total: d.total })}</td>
                <td className="px-4 py-2">{d.shared}</td>
                <td className="px-4 py-2"><Bar value={d.submitted} of={d.total} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {r.ratingsHidden > 0 && (
        <p className="flex items-center gap-2 text-body text-tertiary" data-test="ratings-hidden">
          <Icon icon={ViewOffSlashIcon} size="sm" />
          {readable === 0
            ? t("results.ratingsOnlyReadable")
            : t("results.ratingsHidden", { count: r.ratingsHidden })}
        </p>
      )}

      {readable > 0 && (
        <>
          <Section title={t("results.distribution")} hint={t("results.distributionHint")}>
            <div className="space-y-4 p-4">
              <DistributionRows distribution={r.overall} scale={r.scale} />
              {r.ratingsByDepartment.length > 0 && (
                <div className="space-y-4 border-t border-divider pt-4">
                  {r.ratingsByDepartment.map((d) => (
                    <div key={d.label ?? "all"}>
                      <h4 className="mb-1 text-hint font-medium text-primary">{d.label}</h4>
                      <DistributionRows distribution={d} scale={r.scale} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          <Section title={t("results.byManager")} hint={t("results.byManagerHint")}>
            {r.byManager.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <Illustration scene="reviews-and-one-on-ones-s" size="s" />
                <p className="text-body text-tertiary">{t("results.noManagerRatings")}</p>
              </div>
            ) : (
            <table className="w-full text-body">
              <thead className="text-left text-hint text-tertiary">
                <tr className="border-b border-divider">
                  <th className="px-4 py-2 font-medium">{t("calibration.col.manager")}</th>
                  <th className="px-4 py-2 font-medium">{t("launch.fact.people")}</th>
                  <th className="px-4 py-2 font-medium">{t("results.col.rated")}</th>
                  <th className="px-4 py-2 font-medium">{t("results.col.averageManager")}</th>
                  <th className="px-4 py-2 font-medium">{t("results.col.averageFinal")}</th>
                </tr>
              </thead>
              <tbody>
                {r.byManager.map((m) => (
                  <tr key={m.manager.userId ?? m.manager.name} className="border-b border-divider last:border-0">
                    <td className="px-4 py-2 text-primary">{m.manager.name}</td>
                    <td className="px-4 py-2">{m.people}</td>
                    <td className="px-4 py-2">{m.rated}</td>
                    <td className="px-4 py-2">{formatAverage(m.averageManagerRating)}</td>
                    <td className="px-4 py-2">{formatAverage(m.averageFinalRating)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </Section>
        </>
      )}

      <ExportDataModal
        isOpen={exporting}
        isLoading={busy}
        title={t("results.export.title")}
        rowCount={readable}
        rowKind="people"
        description={t("results.export.description", { name: cycleName })}
        includedText={t("results.export.included")}
        onCancelAction={() => setExporting(false)}
        onConfirmAction={(values) => void doExport(values)}
      />
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="overflow-x-auto rounded-popover border border-divider bg-card">
      <div className="border-b border-divider px-4 py-3">
        <h3 className="text-body font-medium text-primary">{title}</h3>
        {hint && <p className="text-hint text-tertiary">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Bar({ value, of }: { value: number; of: number }) {
  const percent = of === 0 ? 0 : Math.round((value / of) * 100);
  return (
    <div className="h-2 w-full rounded-pill bg-mist" role="img" aria-label={`${percent}%`}>
      <div className="h-full rounded-pill bg-accent" style={{ width: `${percent}%` }} />
    </div>
  );
}

function DistributionRows({ distribution, scale }: { distribution: RatingDistribution; scale: ScalePoint[] }) {
  const t = useTranslations("reviews");
  const pct = shares(distribution.counts);
  return (
    <div className="space-y-1">
      {scale.map((point, i) => (
        <div key={point.value} className="grid grid-cols-[10rem_1fr_4rem] items-center gap-3 text-hint">
          <span className="truncate text-primary">{point.value} · {point.label}</span>
          <div className="h-2 w-full rounded-pill bg-mist" role="img" aria-label={`${pct[i]}%`}>
            <div className="h-full rounded-pill bg-accent" style={{ width: `${pct[i]}%` }} />
          </div>
          <span className="text-right text-tertiary">{distribution.counts[i] ?? 0} · {pct[i]}%</span>
        </div>
      ))}
      <p className="text-hint text-tertiary">
        {t("results.ratedAverage", { rated: distribution.rated, average: formatAverage(distribution.average) })}
      </p>
    </div>
  );
}
