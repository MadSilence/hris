"use client";

import React from "react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
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
import { SearchableSelect } from "@/components/ui/SearchableSelect";

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
      <h3 className="m-0 text-hint font-semibold text-tertiary">{title}</h3>
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
    <aside aria-label="Preview" className="space-y-6 rounded-popover bg-subtle/50 p-5">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-body font-semibold text-primary">Preview</h2>
        {(isPending || stale) && (
          <span className="flex items-center gap-1.5 text-hint text-tertiary">
            <NodRing size="sm" label="" />
            Updating
          </span>
        )}
      </div>

      <FormError message={error} />

      {!preview ? (
        !error && <p className="m-0 text-body text-tertiary">The preview appears as soon as the rule has a trigger.</p>
      ) : (
        <>
          {preview.problems.length > 0 && (
            <div className="space-y-1 rounded-control bg-status-pending-bg px-4 py-3 text-body text-status-pending-text" data-test="preview-problems">
              <p className="m-0 flex items-center gap-2 font-medium">
                <Icon icon={Alert02Icon} size="sm" />
                Not ready to publish
              </p>
              <ul className="m-0 list-disc space-y-0.5 pl-5">
                {preview.problems.map((p, i) => <li key={`${p.path}-${i}`}>{problemText(p)}</li>)}
              </ul>
            </div>
          )}

          <Section title="Who matches now">
            <p className="m-0 text-page-title text-primary" data-test="preview-matching">
              {plural(preview.matchingCount, "person", "people")}
            </p>
            {preview.matching.length > 0 && (
              <p className="m-0 text-body text-tertiary">
                {preview.matching.slice(0, 8).map((p) => p.name).filter(Boolean).join(", ")}
                {preview.matchingCount > 8 ? `, and ${preview.matchingCount - 8} more` : ""}
              </p>
            )}
            {preview.messagesPerFiring > 1 && (
              <p className={`m-0 text-body ${preview.messagesPerFiring > preview.volumeThreshold ? "text-status-pending-text" : "text-tertiary"}`}
                data-test="preview-volume">
                One firing sends about {preview.messagesPerFiring} notifications and emails.
              </p>
            )}
            {preview.pastMomentCount > 0 && (
              <p className="m-0 text-body text-tertiary" data-test="preview-past">
                {plural(preview.pastMomentCount, "person is", "people are")} already past the moment — they are
                left out unless you choose otherwise when enabling.
              </p>
            )}
          </Section>

          <Section title="Next 30 days">
            {preview.eventDriven ? (
              <p className="m-0 text-body text-tertiary">
                This trigger waits for something to happen, so nothing can be dated ahead.
              </p>
            ) : preview.upcoming.length === 0 ? (
              <p className="m-0 text-body text-tertiary">Nothing is due in the next 30 days.</p>
            ) : (
              <ul className="m-0 list-none space-y-1.5 p-0 text-body">
                {preview.upcoming.slice(0, 12).map((u, i) => (
                  <li key={`${u.date}-${u.person.id}-${u.position}-${i}`} className="flex gap-3">
                    <span className="w-24 flex-none tabular-nums text-tertiary">{formatDisplayDate(u.date, { style: "medium" })}</span>
                    <span className="min-w-0">
                      <span className="text-primary">{u.person.name}</span>
                      <span className="text-tertiary"> · {u.summary || ACTION_LABELS[u.actionType]}</span>
                      {u.late && <span className="ml-1 text-hint text-status-pending-text">Late</span>}
                    </span>
                  </li>
                ))}
                {preview.upcoming.length > 12 && (
                  <li className="text-hint text-tertiary">and {preview.upcoming.length - 12} more</li>
                )}
              </ul>
            )}
          </Section>

          {preview.samples.length > 0 && (
            <Section title="Sample">
              {preview.matching.length > 0 && (
                <SearchableSelect
                  aria-label="Sample person"
                  className="h-8 bg-card text-body"
                  options={preview.matching.map((p) => ({ value: p.id, label: p.name ?? p.id }))}
                  value={samplePersonId ?? preview.samples[0]?.person.id ?? null}
                  onChange={(v) => v && onSampleChange(v)}
                  clearable={false}
                />
              )}
              <div className="space-y-3">
                {preview.samples.map((s) => (
                  <article key={s.position} className="space-y-1 rounded-control bg-card p-3 text-body" data-test="preview-sample">
                    <p className="m-0 text-hint text-tertiary">
                      {ACTION_LABELS[s.actionType]}
                      {s.recipients.length > 0 ? ` · to ${s.recipients.map((r) => r.name).join(", ")}` : ""}
                    </p>
                    {s.subject && <p className="m-0 font-medium text-primary">{s.subject}</p>}
                    {s.text && <p className="m-0 whitespace-pre-line text-primary">{s.text}</p>}
                    {s.missingPlaceholders.length > 0 && (
                      <p className="m-0 text-hint text-status-pending-text">
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
              <ul className="m-0 list-none space-y-2 p-0 text-body">
                {preview.assignments.map((a) => {
                  const skipped = Object.values(a.skippedByReason).reduce((n, x) => n + (x ?? 0), 0);
                  const why = skippedLine(a.skippedByReason);
                  return (
                    <li key={a.position} data-test="preview-assignment">
                      <span className="text-primary">
                        {ASSIGNABLE_LABELS[a.assignableType]} {targetName(a.assignableId) ?? ""}: {a.willAssign} will be assigned
                        {skipped > 0 ? `, ${skipped} skipped` : ""}
                      </span>
                      {why && <span className="block text-hint text-tertiary">{why}</span>}
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {preview.conflicts.length > 0 && (
            <Section title="Conflicts">
              <ul className="m-0 list-none space-y-1 p-0 text-body text-status-pending-text">
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
