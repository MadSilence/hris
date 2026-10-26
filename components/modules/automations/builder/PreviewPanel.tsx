"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/public/desact/src/components/ui/select";
import { FormError } from "@/components/feedback/FormError";
import { formatDisplayDate } from "@/lib/date";
import { messageForCode } from "@/lib/errors/errorMessages";
import { skipReasonText } from "@/components/audience/assignment/assignmentSkips";
import {
  ACTION_LABELS,
  ASSIGNABLE_LABELS,
  type AssignmentSkipReason,
  type AutomationPreview,
  type AutomationProblem,
} from "@/models/automations";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** A problem as the dictionary words it. The detail after the colon is the `{0}` of the template. */
export const problemText = (p: AutomationProblem): string => {
  // The validator sends the bare detail ("add at least one action"); a message shaped "Code text: detail"
  // is cut at the colon. Either way the template gets its `{0}` — it was left raw in the live walk.
  const detail = p.message.includes(": ") ? p.message.slice(p.message.indexOf(": ") + 2) : p.message || undefined;
  return messageForCode(p.code, p.message, detail ? [detail] : undefined);
};

export const skippedLine = (skipped: Partial<Record<AssignmentSkipReason, number>>): string | null => {
  const parts = Object.entries(skipped)
    .filter(([, n]) => (n ?? 0) > 0)
    .map(([reason, n]) => `${n} ${skipReasonText(reason as AssignmentSkipReason)}`);
  return parts.length ? parts.join(", ") : null;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="m-0 text-xs font-semibold uppercase tracking-wide text-brown-500">{title}</h3>
      {children}
    </section>
  );
}

/**
 * What publishing this draft would do, before anything is published (research § A.10, "Preview before
 * enabling"): who matches now, the next thirty days of dated steps, each message rendered for one real
 * matching person, the assignments with their skips, and the conflicts. Its problems are the same
 * checks publish refuses on, so Publish waits for an answer with none.
 */
export function PreviewPanel({
  preview,
  isPending,
  error,
  stale,
  samplePersonId,
  onSampleChange,
  targetName,
}: {
  preview: AutomationPreview | undefined;
  isPending: boolean;
  error: string | null;
  /** The draft changed since this preview was taken. */
  stale: boolean;
  samplePersonId: string | null;
  onSampleChange: (personId: string) => void;
  targetName: (id: string) => string | undefined;
}) {
  return (
    <aside aria-label="Preview" className="space-y-6 rounded-xl bg-brown-50/50 p-5">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-base font-semibold text-foreground">Preview</h2>
        {(isPending || stale) && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating
          </span>
        )}
      </div>

      <FormError message={error} />

      {!preview ? (
        !error && <p className="m-0 text-sm text-muted-foreground">The preview appears as soon as the rule has a trigger.</p>
      ) : (
        <>
          {preview.problems.length > 0 && (
            <div className="space-y-1 rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-800" data-test="preview-problems">
              <p className="m-0 flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" />
                Not ready to publish
              </p>
              <ul className="m-0 list-disc space-y-0.5 pl-5">
                {preview.problems.map((p, i) => <li key={`${p.path}-${i}`}>{problemText(p)}</li>)}
              </ul>
            </div>
          )}

          <Section title="Who Matches Now">
            <p className="m-0 text-2xl font-semibold text-foreground" data-test="preview-matching">
              {plural(preview.matchingCount, "person", "people")}
            </p>
            {preview.matching.length > 0 && (
              <p className="m-0 text-sm text-muted-foreground">
                {preview.matching.slice(0, 8).map((p) => p.name).filter(Boolean).join(", ")}
                {preview.matchingCount > 8 ? `, and ${preview.matchingCount - 8} more` : ""}
              </p>
            )}
            {preview.pastMomentCount > 0 && (
              <p className="m-0 text-sm text-muted-foreground" data-test="preview-past">
                {plural(preview.pastMomentCount, "person is", "people are")} already past the moment — they are
                left out unless you choose otherwise when enabling.
              </p>
            )}
          </Section>

          <Section title="Next 30 Days">
            {preview.eventDriven ? (
              <p className="m-0 text-sm text-muted-foreground">
                This trigger waits for something to happen, so nothing can be dated ahead.
              </p>
            ) : preview.upcoming.length === 0 ? (
              <p className="m-0 text-sm text-muted-foreground">Nothing is due in the next 30 days.</p>
            ) : (
              <ul className="m-0 list-none space-y-1.5 p-0 text-sm">
                {preview.upcoming.slice(0, 12).map((u, i) => (
                  <li key={`${u.date}-${u.person.id}-${u.position}-${i}`} className="flex gap-3">
                    <span className="w-24 flex-none tabular-nums text-muted-foreground">{formatDisplayDate(u.date, { style: "medium" })}</span>
                    <span className="min-w-0">
                      <span className="text-foreground">{u.person.name}</span>
                      <span className="text-muted-foreground"> · {u.summary || ACTION_LABELS[u.actionType]}</span>
                      {u.late && <span className="ml-1 text-xs text-warning-700">Late</span>}
                    </span>
                  </li>
                ))}
                {preview.upcoming.length > 12 && (
                  <li className="text-xs text-muted-foreground">and {preview.upcoming.length - 12} more</li>
                )}
              </ul>
            )}
          </Section>

          {preview.samples.length > 0 && (
            <Section title="Sample">
              {preview.matching.length > 0 && (
                <Select value={samplePersonId ?? preview.samples[0]?.person.id ?? ""} onValueChange={onSampleChange}>
                  <SelectTrigger aria-label="Sample person" className="h-8 bg-white text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {preview.matching.map((p) => <SelectItem key={p.id} value={p.id}>{p.name ?? p.id}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <div className="space-y-3">
                {preview.samples.map((s) => (
                  <article key={s.position} className="space-y-1 rounded-lg bg-white p-3 text-sm" data-test="preview-sample">
                    <p className="m-0 text-xs text-muted-foreground">
                      {ACTION_LABELS[s.actionType]}
                      {s.recipients.length > 0 ? ` · to ${s.recipients.map((r) => r.name).join(", ")}` : ""}
                    </p>
                    {s.subject && <p className="m-0 font-medium text-foreground">{s.subject}</p>}
                    {s.text && <p className="m-0 whitespace-pre-line text-foreground">{s.text}</p>}
                    {s.missingPlaceholders.length > 0 && (
                      <p className="m-0 text-xs text-warning-700">
                        No value for {s.missingPlaceholders.map((m) => `{${m}}`).join(", ")} — this step would fail for {s.person.name}.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </Section>
          )}

          {preview.assignments.length > 0 && (
            <Section title="Assignments">
              <ul className="m-0 list-none space-y-2 p-0 text-sm">
                {preview.assignments.map((a) => {
                  const skipped = Object.values(a.skippedByReason).reduce((n, x) => n + (x ?? 0), 0);
                  const why = skippedLine(a.skippedByReason);
                  return (
                    <li key={a.position} data-test="preview-assignment">
                      <span className="text-foreground">
                        {ASSIGNABLE_LABELS[a.assignableType]} {targetName(a.assignableId) ?? ""}: {a.willAssign} will be assigned
                        {skipped > 0 ? `, ${skipped} skipped` : ""}
                      </span>
                      {why && <span className="block text-xs text-muted-foreground">{why}</span>}
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {preview.conflicts.length > 0 && (
            <Section title="Conflicts">
              <ul className="m-0 list-none space-y-1 p-0 text-sm text-warning-800">
                {preview.conflicts.slice(0, 10).map((c, i) => (
                  <li key={`${c.person.id}-${i}`}>
                    {c.person.name}: {c.otherRule?.name ? `“${c.otherRule.name}”` : "another rule"} already sets the{" "}
                    {ASSIGNABLE_LABELS[c.assignableType].toLowerCase()} — the later rule does not overwrite it.
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </aside>
  );
}
