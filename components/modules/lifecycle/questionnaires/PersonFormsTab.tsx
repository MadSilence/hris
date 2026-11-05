"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { type DateFormatter, useDateFormatter } from "@/lib/date";
import { useQuestionnaires } from "@/components/modules/lifecycle/hooks";
import type { QuestionnaireResponse } from "@/models/lifecycle";
import type { LifecycleT } from "@/components/modules/lifecycle/i18n";

const answerText = (a: QuestionnaireResponse["answers"][number], t: LifecycleT, yes: string, no: string, formatDisplayDate: DateFormatter): string => {
  const v = a.value;
  if (v === null || v === undefined || v === "") return t("forms.notAnswered");
  if (a.type === "YES_NO") return v === true ? yes : no;
  if (a.type === "DATE" && typeof v === "string") return formatDisplayDate(v, { style: "medium" });
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
};

/**
 * The profile's Forms tab (DECISIONS.md § "Lifecycle tasks", E1): the questionnaires answered about this person,
 * newest first, each with its questions as they were asked. Whoever may see the person's processes reads them
 * all; the person themself reads what they answered — the backend decides which.
 */
export function PersonFormsTab({ userId }: { userId: string }) {
  const t = useTranslations("lifecycle");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");
  const { data, isLoading, error } = useQuestionnaires(userId);

  if (error) return <ErrorState error={error} />;
  if (isLoading) {
    return <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-28 shimmer rounded-control bg-mist" />)}</div>;
  }
  if (!data || data.length === 0) {
    return (
      <EmptyState
        fill
        scene="forms"
        title={t("forms.emptyTitle")}
        description={t("forms.emptyDescription")}
      />
    );
  }

  return (
    <div className="space-y-4" data-test="person-forms">
      {data.map((r) => (
        <section key={r.id} className="rounded-card border border-divider p-4" aria-labelledby={`form-${r.id}`}>
          <h3 id={`form-${r.id}`} className="font-medium text-primary">{r.title}</h3>
          <p className="text-hint text-tertiary">
            {[
              r.processType ? t(`processType.${r.processType}`) : null,
              t("forms.answered", { date: formatDisplayDate(r.submittedAt, { style: "medium" }) }),
              r.submittedBy?.name ? t("forms.by", { name: r.submittedBy.name }) : null,
            ].filter(Boolean).join(" · ")}
          </p>
          <dl className="mt-3 space-y-2">
            {r.answers.map((a) => (
              <div key={a.questionId}>
                <dt className="text-hint text-tertiary">{a.label}</dt>
                <dd className="whitespace-pre-wrap text-body">{answerText(a, t, tCommon("values.yes"), tCommon("values.no"), formatDisplayDate)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
