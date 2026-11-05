"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { NodRing } from "@/components/desact/nod";
import { FormError } from "@/components/feedback/FormError";
import { useDateFormatter } from "@/lib/date";
import { messageForCode } from "@/lib/errors/errorMessages";
import { skipReasonText } from "@/components/audience/assignment/assignmentSkips";
import type { AccessTranslator } from "@/components/audience/accessTranslator";
import type { AssignmentSkipReason, AutomationPreview, AutomationProblem } from "@/models/automations";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import type { AutomationsT } from "@/components/modules/automations/shared/vocabulary";

/** A problem as the dictionary words it. The detail after the colon is the `{0}` of the template. */
export const problemText = (p: AutomationProblem): string => {
  // The validator sends the bare detail ("add at least one action"); a message shaped "Code text: detail"
  // is cut at the colon. Either way the template gets its `{0}` — it was left raw in the live walk.
  const detail = p.message.includes(": ") ? p.message.slice(p.message.indexOf(": ") + 2) : p.message || undefined;
  return messageForCode(p.code, p.message, detail ? [detail] : undefined);
};

export const skippedLine = (
  t: AutomationsT,
  tAccess: AccessTranslator,
  skipped: Partial<Record<AssignmentSkipReason, number>>,
): string | null => {
  const parts = Object.entries(skipped)
    .filter(([, n]) => (n ?? 0) > 0)
    .map(([reason, n]) => t("preview.skippedPart", { count: n ?? 0, reason: skipReasonText(reason as AssignmentSkipReason, tAccess) }));
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
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("automations");
  const tCommon = useTranslations("common");
  const tAccess = useTranslations("access");
  return (
    <aside aria-label={t("preview.title")} className="space-y-6 rounded-popover bg-subtle/50 p-5">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-body font-semibold text-primary">{t("preview.title")}</h2>
        {(isPending || stale) && (
          <span className="flex items-center gap-1.5 text-hint text-tertiary">
            <NodRing size="sm" label="" />
            {t("preview.updating")}
          </span>
        )}
      </div>

      <FormError message={error} />

      {!preview ? (
        !error && <p className="m-0 text-body text-tertiary">{t("preview.noTrigger")}</p>
      ) : (
        <>
          {preview.problems.length > 0 && (
            <div className="space-y-1 rounded-control bg-status-pending-bg px-4 py-3 text-body text-status-pending-text" data-test="preview-problems">
              <p className="m-0 flex items-center gap-2 font-medium">
                <Icon icon={Alert02Icon} size="sm" />
                {t("preview.notReady")}
              </p>
              <ul className="m-0 list-disc space-y-0.5 pl-5">
                {preview.problems.map((p, i) => <li key={`${p.path}-${i}`}>{problemText(p)}</li>)}
              </ul>
            </div>
          )}

          <Section title={t("preview.whoMatches")}>
            <p className="m-0 text-page-title text-primary" data-test="preview-matching">
              {tCommon("people.count", { count: preview.matchingCount })}
            </p>
            {preview.matching.length > 0 && (
              <p className="m-0 text-body text-tertiary">
                {preview.matching.slice(0, 8).map((p) => p.name).filter(Boolean).join(", ")}
                {preview.matchingCount > 8 ? t("preview.andMore", { count: preview.matchingCount - 8 }) : ""}
              </p>
            )}
            {preview.messagesPerFiring > 1 && (
              <p className={`m-0 text-body ${preview.messagesPerFiring > preview.volumeThreshold ? "text-status-pending-text" : "text-tertiary"}`}
                data-test="preview-volume">
                {t("preview.volume", { count: preview.messagesPerFiring })}
              </p>
            )}
            {preview.pastMomentCount > 0 && (
              <p className="m-0 text-body text-tertiary" data-test="preview-past">
                {t("preview.pastMoment", { count: preview.pastMomentCount })}
              </p>
            )}
          </Section>

          <Section title={t("preview.next30")}>
            {preview.eventDriven ? (
              <p className="m-0 text-body text-tertiary">{t("preview.eventDriven")}</p>
            ) : preview.upcoming.length === 0 ? (
              <p className="m-0 text-body text-tertiary">{t("preview.nothingDue")}</p>
            ) : (
              <ul className="m-0 list-none space-y-1.5 p-0 text-body">
                {preview.upcoming.slice(0, 12).map((u, i) => (
                  <li key={`${u.date}-${u.person.id}-${u.position}-${i}`} className="flex gap-3">
                    <span className="w-24 flex-none tabular-nums text-tertiary">{formatDisplayDate(u.date, { style: "medium" })}</span>
                    <span className="min-w-0">
                      <span className="text-primary">{u.person.name}</span>
                      <span className="text-tertiary"> · {u.summary || t(`action.label.${u.actionType}`)}</span>
                      {u.late && <span className="ml-1 text-hint text-status-pending-text">{t("preview.late")}</span>}
                    </span>
                  </li>
                ))}
                {preview.upcoming.length > 12 && (
                  <li className="text-hint text-tertiary">{t("preview.moreItems", { count: preview.upcoming.length - 12 })}</li>
                )}
              </ul>
            )}
          </Section>

          {preview.samples.length > 0 && (
            <Section title={t("preview.sample")}>
              {preview.matching.length > 0 && (
                <SearchableSelect
                  aria-label={t("preview.samplePerson")}
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
                      {t(`action.label.${s.actionType}`)}
                      {s.recipients.length > 0 ? ` · ${t("preview.sampleTo", { names: s.recipients.map((r) => r.name).join(", ") })}` : ""}
                    </p>
                    {s.subject && <p className="m-0 font-medium text-primary">{s.subject}</p>}
                    {s.text && <p className="m-0 whitespace-pre-line text-primary">{s.text}</p>}
                    {s.missingPlaceholders.length > 0 && (
                      <p className="m-0 text-hint text-status-pending-text">
                        {t("preview.noValue", { tokens: s.missingPlaceholders.map((m) => `{${m}}`).join(", "), name: s.person.name ?? "" })}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </Section>
          )}

          {preview.assignments.length > 0 && (
            <Section title={t("preview.assignments")}>
              <ul className="m-0 list-none space-y-2 p-0 text-body">
                {preview.assignments.map((a) => {
                  const skipped = Object.values(a.skippedByReason).reduce((n, x) => n + (x ?? 0), 0);
                  const why = skippedLine(t, tAccess, a.skippedByReason);
                  const line = { kind: t(`assignable.${a.assignableType}`), target: targetName(a.assignableId) ?? "", count: a.willAssign };
                  return (
                    <li key={a.position} data-test="preview-assignment">
                      <span className="text-primary">
                        {skipped > 0 ? t("preview.assignmentLineSkipped", { ...line, skipped }) : t("preview.assignmentLine", line)}
                      </span>
                      {why && <span className="block text-hint text-tertiary">{why}</span>}
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {preview.conflicts.length > 0 && (
            <Section title={t("preview.conflicts")}>
              <ul className="m-0 list-none space-y-1 p-0 text-body text-status-pending-text">
                {preview.conflicts.slice(0, 10).map((c, i) => (
                  <li key={`${c.person.id}-${i}`}>
                    {t("preview.conflictLine", {
                      person: c.person.name ?? "",
                      rule: c.otherRule?.name ? t("preview.quotedRule", { name: c.otherRule.name }) : t("preview.anotherRule"),
                      kind: t(`assignable.${c.assignableType}`).toLowerCase(),
                    })}
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
