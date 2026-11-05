"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useReviewCycle, useReviewCycleTemplates } from "@/components/modules/reviews/hooks";
import { REVIEW_KIND_KEYS, REVIEW_KINDS } from "@/models/reviews";
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
  const t = useTranslations("automations");
  const tCommon = useTranslations("common");
  const tReviews = useTranslations("reviews");
  const templates = useReviewCycleTemplates();
  const template = useReviewCycle(action.templateCycleId ?? null);
  const loaded = template.data && template.data.id === action.templateCycleId ? template.data : null;
  const problems = startReviewProblems(action, loaded, { t, kindLabel: (kind) => tReviews(REVIEW_KIND_KEYS[kind]) });
  const kinds = REVIEW_KINDS.filter((k) => loaded?.kinds.some((x) => x.kind === k));
  const window = (kind: (typeof REVIEW_KINDS)[number]) => action.reviewWindows?.find((w) => w.kind === kind);

  const choose = (id: string | null) => {
    const summary = templates.data?.find((x) => x.id === id);
    onChange({
      templateCycleId: id,
      reviewWindows: summary ? defaultReviewWindows(summary.kinds, action.offsetDays ?? 0) : [],
      releaseOffsetDays: null,
    });
  };

  return (
    <div className="space-y-4">
      <Field label={t("startReview.template")} required>
        <SearchableSelect
          options={(templates.data ?? []).map((x) => ({ value: x.id, label: x.name }))}
          value={action.templateCycleId ?? null}
          onChange={choose}
          placeholder={templates.isLoading ? tCommon("states.loading") : tCommon("actions.select")}
          className="w-full sm:w-96"
        />
      </Field>
      {!templates.isLoading && (templates.data ?? []).length === 0 && (
        <p className="text-body text-tertiary">
          {t.rich("startReview.noTemplates", {
            link: (chunks) => <Link href="/reviews" className="text-accent-text underline-offset-4 hover:underline">{chunks}</Link>,
          })}
        </p>
      )}

      {loaded && kinds.map((kind) => {
        const w = window(kind);
        const nominates = kind === "PEER" && loaded.kinds.some((k) => k.kind === "PEER" && k.peerMode === "SUBJECT_NOMINATES");
        const set = (patch: Parameters<typeof withWindow>[2]) => onChange({ reviewWindows: withWindow(action.reviewWindows, kind, patch) });
        const idOf = (field: string) => `${prefix}-${kind}-${field}`;
        return (
          <fieldset key={kind} className="space-y-2 rounded-control border border-divider p-3">
            <legend className="px-1 text-body font-medium text-primary">{tReviews(REVIEW_KIND_KEYS[kind])}</legend>
            <div className="flex flex-wrap gap-4">
              <OffsetField id={idOf("opens")} label={t("startReview.opens")} allowEmpty value={w?.opensOffsetDays ?? null}
                onChange={(opensOffsetDays) => set({ opensOffsetDays })} />
              <OffsetField id={idOf("due")} label={t("actionEditor.due")} value={w?.dueOffsetDays ?? null}
                onChange={(dueOffsetDays) => set({ dueOffsetDays })} />
            </div>
            {nominates && (
              <div className="flex flex-wrap gap-4">
                <OffsetField id={idOf("nominate")} label={t("startReview.nominatedBy")} value={w?.nominationOffsetDays ?? null}
                  onChange={(nominationOffsetDays) => set({ nominationOffsetDays })} />
                <OffsetField id={idOf("approve")} label={t("startReview.approvedBy")} value={w?.approvalOffsetDays ?? null}
                  onChange={(approvalOffsetDays) => set({ approvalOffsetDays })} />
              </div>
            )}
          </fieldset>
        );
      })}

      {loaded?.sharingMode === "RELEASED_ON_DATE" && (
        <OffsetField id={`${prefix}-release`} label={t("startReview.released")} value={action.releaseOffsetDays ?? null}
          onChange={(releaseOffsetDays) => onChange({ releaseOffsetDays })} />
      )}

      <p className="text-hint text-tertiary">{t("startReview.hint")}</p>
      {problems.length > 0 && (
        <ul className="space-y-0.5 text-hint text-status-pending-text" aria-label={t("startReview.missing")}>
          {problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
    </div>
  );
}
