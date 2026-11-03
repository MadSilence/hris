"use client";

import React from "react";
import Link from "next/link";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useReviewCycle, useReviewCycleTemplates } from "@/components/modules/reviews/hooks";
import { REVIEW_KIND_LABELS, REVIEW_KINDS } from "@/models/reviews";
import type { ActionSpec } from "@/models/automations";
import { OffsetField } from "./ActionEditor";
import { Field } from "./SentenceCard";
import { defaultReviewWindows, startReviewProblems, withWindow } from "./startReview";

/**
 * A "Start a Review" action (REVIEWS_PLAN.md 11.3): the template, and each of its reviews' windows in days from the
 * trigger's moment — "hired, 90 days after: a probation review, due on day 90". The cycle is started and launched for
 * the person on the step's day; a launch the cycle's own checks refuse is written in the run log.
 */
export function StartReviewEditor({ action, prefix, onChange }: {
  action: ActionSpec;
  prefix: string;
  onChange: (patch: Partial<ActionSpec>) => void;
}) {
  const templates = useReviewCycleTemplates();
  const template = useReviewCycle(action.templateCycleId ?? null);
  const loaded = template.data && template.data.id === action.templateCycleId ? template.data : null;
  const problems = startReviewProblems(action, loaded);
  const kinds = REVIEW_KINDS.filter((k) => loaded?.kinds.some((x) => x.kind === k));
  const window = (kind: (typeof REVIEW_KINDS)[number]) => action.reviewWindows?.find((w) => w.kind === kind);

  const choose = (id: string | null) => {
    const summary = templates.data?.find((t) => t.id === id);
    onChange({
      templateCycleId: id,
      reviewWindows: summary ? defaultReviewWindows(summary.kinds, action.offsetDays ?? 0) : [],
      releaseOffsetDays: null,
    });
  };

  return (
    <div className="space-y-4">
      <Field label="Review Template" required>
        <SearchableSelect
          options={(templates.data ?? []).map((t) => ({ value: t.id, label: t.name }))}
          value={action.templateCycleId ?? null}
          onChange={choose}
          placeholder={templates.isLoading ? "Loading…" : "Select"}
          className="w-full sm:w-96"
        />
      </Field>
      {!templates.isLoading && (templates.data ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">
          No review templates yet. Save a cycle as a template in <Link href="/reviews" className="underline">Reviews</Link> first.
        </p>
      )}

      {loaded && kinds.map((kind) => {
        const w = window(kind);
        const nominates = kind === "PEER" && loaded.kinds.some((k) => k.kind === "PEER" && k.peerMode === "SUBJECT_NOMINATES");
        const set = (patch: Parameters<typeof withWindow>[2]) => onChange({ reviewWindows: withWindow(action.reviewWindows, kind, patch) });
        return (
          <fieldset key={kind} className="space-y-2 rounded-lg border border-brown-100 p-3">
            <legend className="px-1 text-sm font-medium text-brown-900">{REVIEW_KIND_LABELS[kind]}</legend>
            <div className="flex flex-wrap gap-4">
              <OffsetField id={`${prefix}-${kind}-opens`} label="Opens" allowEmpty value={w?.opensOffsetDays ?? null}
                onChange={(opensOffsetDays) => set({ opensOffsetDays })} />
              <OffsetField id={`${prefix}-${kind}-due`} label="Due" value={w?.dueOffsetDays ?? null}
                onChange={(dueOffsetDays) => set({ dueOffsetDays })} />
            </div>
            {nominates && (
              <div className="flex flex-wrap gap-4">
                <OffsetField id={`${prefix}-${kind}-nominate`} label="Peers Nominated By" value={w?.nominationOffsetDays ?? null}
                  onChange={(nominationOffsetDays) => set({ nominationOffsetDays })} />
                <OffsetField id={`${prefix}-${kind}-approve`} label="Peers Approved By" value={w?.approvalOffsetDays ?? null}
                  onChange={(approvalOffsetDays) => set({ approvalOffsetDays })} />
              </div>
            )}
          </fieldset>
        );
      })}

      {loaded?.sharingMode === "RELEASED_ON_DATE" && (
        <OffsetField id={`${prefix}-release`} label="Results Released" value={action.releaseOffsetDays ?? null}
          onChange={(releaseOffsetDays) => onChange({ releaseOffsetDays })} />
      )}

      <p className="text-xs text-muted-foreground">
        Days count from the moment the rule fires, like a task&apos;s due date. The review is started and launched for the
        person on the step&apos;s day; if the cycle cannot launch, the run log says why.
      </p>
      {problems.length > 0 && (
        <ul className="space-y-0.5 text-xs text-warning-700" aria-label="What is missing">
          {problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
    </div>
  );
}
