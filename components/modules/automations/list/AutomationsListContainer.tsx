"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Add01Icon, Calendar03Icon, CheckListIcon, FlashIcon, Mail01Icon, UserRemove01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Skeleton } from "@/components/desact/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { useAutomations } from "@/components/modules/automations/hooks";
import { RuleStatusBadge } from "@/components/modules/automations/shared/AutomationStatusBadge";
import { ruleSentence, typesInDefinition } from "@/components/modules/automations/shared/sentence";
import { startsReviews, useAutomationNames } from "@/components/modules/automations/shared/useAutomationNames";
import { STARTERS, type StarterId } from "@/components/modules/automations/builder/draft";
import { formatMoment, type AssignableType, type AutomationRuleSummary } from "@/models/automations";

const COLUMNS = ["Automation", "Status", "Last run", "Runs"] as const;
const NEW_HREF = "/settings/automation/automations/new";

const STARTER_ICONS: Record<StarterId, React.ReactNode> = {
  "welcome-email": <Icon icon={Mail01Icon} size="sm" />,
  "manager-day-one": <Icon icon={CheckListIcon} size="sm" />,
  "office-calendar": <Icon icon={Calendar03Icon} size="sm" />,
  "termination-hr": <Icon icon={UserRemove01Icon} size="sm" />,
};

const totalRuns = (r: AutomationRuleSummary) =>
  r.runs.scheduled + r.runs.inProgress + r.runs.done + r.runs.skipped + r.runs.failed + r.runs.cancelled;

/**
 * Settings → Automation → Automations. Each row reads as the rule's own sentence — "When someone is
 * hired · for everyone → Email the person" — so the list is readable without opening anything
 * (research § A.10). A live rule the assignment modal created is listed here too, as any other.
 */
export function AutomationsListContainer() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  // The archived count comes from the wider list: the toggle is not rendered when nothing is archived.
  const everything = useAutomations(true);
  const { data: fields } = useUserFields();

  const all = useMemo(() => everything.data ?? [], [everything.data]);
  const archivedCount = all.filter((r) => r.status === "ARCHIVED").length;
  const source = all.filter((r) => (showArchived ? r.status === "ARCHIVED" : r.status !== "ARCHIVED"));

  const types = useMemo(() => {
    const set = new Set<AssignableType>();
    for (const r of all) typesInDefinition(r.definition, fields).forEach((t) => set.add(t));
    return set;
  }, [all, fields]);
  const names = useAutomationNames(types, all.some((r) => r.definition?.actions.some((a) => a.recipients?.some((x) => x.kind === "ROLE"))),
    all.some((r) => startsReviews(r.definition)));

  const rows = useMemo(() => source.map((rule) => ({
    rule,
    sentence: ruleSentence(rule.definition, { fields, targets: names.targets, roles: names.roles }),
  })).filter(({ rule, sentence }) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [rule.name, rule.description ?? "", sentence.when, sentence.forWhom, sentence.does]
      .some((text) => text.toLowerCase().includes(q));
  }), [source, fields, names, query]);

  const openStarter = (id: StarterId) => router.push(`${NEW_HREF}?starter=${id}`);

  const newButton = (
    <PermissionGate resource="SETTINGS.AUTOMATIONS" action="MANAGE">
      <Button type="button" className="gap-1.5" onClick={() => router.push(NEW_HREF)}>
        <Icon icon={Add01Icon} size="sm" />
        New automation
      </Button>
    </PermissionGate>
  );

  const nothingYet = !everything.isLoading && !everything.error && all.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ListToolbar
        search={{ value: query, onChange: setQuery }}
        archived={archivedCount > 0 ? { count: archivedCount, showing: showArchived, onChange: setShowArchived } : undefined}
        primary={newButton}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {everything.error ? (
          <ErrorState error={everything.error} />
        ) : nothingYet ? (
          <FirstAutomation onStart={openStarter} onBlank={() => router.push(NEW_HREF)} />
        ) : !everything.isLoading && rows.length === 0 ? (
          <ListEmptyState
            fill
            query={query}
            archivedView={showArchived}
            scene="automations"
            title="No automations yet"
            description="An automation does something on its own when something happens to a person."
            noResultsHint="Try a different name, trigger or action."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.map((c) => <TableHead key={c} className={c === "Runs" ? "text-right" : undefined}>{c}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {everything.isLoading
                ? [0, 1, 2].map((i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-4 w-48" /><Skeleton className="mt-2 h-3 w-80" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-pill" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="ml-auto h-4 w-8" /></TableCell>
                  </TableRow>
                ))
                : rows.map(({ rule, sentence }) => (
                  <TableRow
                    key={rule.id}
                    className="cursor-pointer"
                    tabIndex={0}
                    onClick={() => router.push(`/settings/automation/automations/${rule.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") router.push(`/settings/automation/automations/${rule.id}`);
                    }}
                  >
                    <TableCell className="max-w-0 py-3">
                      <div className="truncate font-medium text-primary">{rule.name}</div>
                      {rule.definition ? (
                        <div className="mt-0.5 truncate text-body text-tertiary" data-test="rule-sentence">
                          {sentence.when} · for {sentence.forWhom} → {sentence.does}
                        </div>
                      ) : null}
                      {rule.status === "PAUSED" && rule.pausedReason ? (
                        <div className="mt-0.5 truncate text-hint text-status-pending-text">{rule.pausedReason}</div>
                      ) : null}
                    </TableCell>
                    <TableCell className="w-32"><RuleStatusBadge status={rule.status} /></TableCell>
                    <TableCell className="w-44 text-body text-tertiary">{formatMoment(rule.lastRunAt)}</TableCell>
                    <TableCell className="w-20 text-right tabular-nums">{totalRuns(rule)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

/**
 * The first-day screen: one sentence of what this place is for, the one action that fills it, and four
 * ready-made starting points — each opens the builder filled in, nothing is saved until Publish.
 */
function FirstAutomation({ onStart, onBlank }: { onStart: (id: StarterId) => void; onBlank: () => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16 text-center">
      <div className="rounded-card bg-subtle p-4 text-secondary"><Icon icon={FlashIcon} size="lg" /></div>
      <div className="space-y-2">
        <h3 className="text-section-title text-primary">Automate the first rule</h3>
        <p className="text-body text-tertiary">
          An automation does something on its own when something happens to a person — a welcome email
          before their first day, a task for their manager, the right holiday calendar for their office.
        </p>
      </div>
      <PermissionGate resource="SETTINGS.AUTOMATIONS" action="MANAGE">
        <div className="grid w-full gap-2 sm:grid-cols-2">
          {STARTERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStart(s.id)}
              className="flex items-start gap-3 rounded-card border border-divider bg-card p-4 text-left transition hover:border-divider hover:bg-subtle"
            >
              <span className="mt-0.5 text-tertiary">{STARTER_ICONS[s.id]}</span>
              <span>
                <span className="block text-body font-medium text-primary">{s.title}</span>
                <span className="block text-hint text-tertiary">{s.hint}</span>
              </span>
            </button>
          ))}
        </div>
        <Button type="button" className="gap-1.5" onClick={onBlank}>
          <Icon icon={Add01Icon} size="sm" />
          New automation
        </Button>
      </PermissionGate>
    </div>
  );
}
