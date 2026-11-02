"use client";

import React from "react";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDisplayDate } from "@/lib/date";
import { useQuestionnaires } from "@/components/modules/lifecycle/hooks";
import { PROCESS_TYPE_LABELS, type QuestionnaireResponse } from "@/models/lifecycle";

const answerText = (a: QuestionnaireResponse["answers"][number]): string => {
  const v = a.value;
  if (v === null || v === undefined || v === "") return "Not answered";
  if (a.type === "YES_NO") return v === true ? "Yes" : "No";
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
  const { data, isLoading, error } = useQuestionnaires(userId);

  if (error) return <ErrorState error={error} />;
  if (isLoading) {
    return <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-28 animate-pulse rounded-md bg-muted" />)}</div>;
  }
  if (!data || data.length === 0) {
    return (
      <EmptyState
        fill
        icon={<ClipboardList className="h-6 w-6" />}
        title="No forms yet"
        description="Questionnaires answered in a preboarding, an onboarding or an offboarding appear here."
      />
    );
  }

  return (
    <div className="space-y-4" data-test="person-forms">
      {data.map((r) => (
        <section key={r.id} className="rounded-lg border border-brown-200 p-4" aria-labelledby={`form-${r.id}`}>
          <h3 id={`form-${r.id}`} className="font-medium text-brown-900">{r.title}</h3>
          <p className="text-xs text-muted-foreground">
            {[
              r.processType ? PROCESS_TYPE_LABELS[r.processType] : null,
              `Answered ${formatDisplayDate(r.submittedAt, { style: "medium" })}`,
              r.submittedBy?.name ? `by ${r.submittedBy.name}` : null,
            ].filter(Boolean).join(" · ")}
          </p>
          <dl className="mt-3 space-y-2">
            {r.answers.map((a) => (
              <div key={a.questionId}>
                <dt className="text-xs text-muted-foreground">{a.label}</dt>
                <dd className="whitespace-pre-wrap text-sm">{answerText(a)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
