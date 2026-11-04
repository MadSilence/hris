"use client";

import React, { useState } from "react";
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
import {
  REVIEW_KIND_LABELS,
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
            <Icon icon={Download01Icon} size="sm" />Export {readable} {readable === 1 ? "person" : "people"}
          </Button>
        </div>
      )}

      <Section title="Completion by kind">
        <table className="w-full text-body">
          <thead className="text-left text-hint text-tertiary">
            <tr className="border-b border-divider">
              <th className="px-4 py-2 font-medium">Review</th>
              <th className="px-4 py-2 font-medium">Submitted</th>
              <th className="px-4 py-2 font-medium">Overdue</th>
              <th className="w-1/3 px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {r.byKind.map((k) => (
              <tr key={k.kind} className="border-b border-divider last:border-0">
                <td className="px-4 py-2 text-primary">{REVIEW_KIND_LABELS[k.kind]}</td>
                <td className="px-4 py-2">{k.submitted} of {k.total}</td>
                <td className={`px-4 py-2 ${k.overdue > 0 ? "text-status-pending-text" : ""}`}>{k.overdue}</td>
                <td className="px-4 py-2"><Bar value={k.submitted} of={k.total} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Completion by department" hint="Every review about the people of a department, together.">
        <table className="w-full text-body">
          <thead className="text-left text-hint text-tertiary">
            <tr className="border-b border-divider">
              <th className="px-4 py-2 font-medium">Department</th>
              <th className="px-4 py-2 font-medium">People</th>
              <th className="px-4 py-2 font-medium">Reviews submitted</th>
              <th className="px-4 py-2 font-medium">Shared</th>
              <th className="w-1/3 px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {r.byDepartment.map((d) => (
              <tr key={d.department} className="border-b border-divider last:border-0">
                <td className="px-4 py-2 text-primary">{d.department}</td>
                <td className="px-4 py-2">{d.people}</td>
                <td className="px-4 py-2">{d.submitted} of {d.total}</td>
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
            ? "Ratings are shown only for people whose results you can read."
            : `${r.ratingsHidden} ${r.ratingsHidden === 1 ? "person is" : "people are"} outside the results you can read and left out of the ratings below.`}
        </p>
      )}

      {readable > 0 && (
        <>
          <Section title="Rating distribution" hint="Final ratings — calibrated where a session changed them.">
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

          <Section title="Ratings by manager" hint="What each manager gave, and what their people were finally given.">
            {r.byManager.length === 0 ? (
              <p className="py-4 text-body text-tertiary">No manager has rated anybody in this cycle yet.</p>
            ) : (
            <table className="w-full text-body">
              <thead className="text-left text-hint text-tertiary">
                <tr className="border-b border-divider">
                  <th className="px-4 py-2 font-medium">Manager</th>
                  <th className="px-4 py-2 font-medium">People</th>
                  <th className="px-4 py-2 font-medium">Rated</th>
                  <th className="px-4 py-2 font-medium">Average manager rating</th>
                  <th className="px-4 py-2 font-medium">Average final rating</th>
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
        title="Export results"
        rowCount={readable}
        rowNoun="people"
        description={`The results of ${cycleName}: one row a person whose results you can read. No answers are exported.`}
        includedText="Included: person, email, department, manager, status, manager rating, final rating and its label, potential, calibrated, shared on, acknowledged on."
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
        {distribution.rated} rated · average {formatAverage(distribution.average)}
      </p>
    </div>
  );
}
