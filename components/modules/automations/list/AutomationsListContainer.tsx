"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useDisplayLanguage } from "@/lib/date";
import { useRouter } from "next/navigation";
import { Add01Icon, FlashIcon } from "@hugeicons/core-free-icons";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { TemplateGallery } from "./TemplateGallery";
import { formatMoment, type AssignableType, type AutomationRuleSummary } from "@/models/automations";
import { reasonText } from "@/components/modules/automations/shared/vocabulary";

const NEW_HREF = "/settings/automation/automations/new";

const totalRuns = (r: AutomationRuleSummary) =>
  r.runs.scheduled + r.runs.inProgress + r.runs.done + r.runs.skipped + r.runs.failed + r.runs.cancelled;

/**
 * Settings → Automation → Automations. Each row reads as the rule's own sentence — "When someone is
 * hired · for everyone → Email the person" — so the list is readable without opening anything
 * (research § A.10). A live rule the assignment modal created is listed here too, as any other.
 */
export function AutomationsListContainer() {
  const t = useTranslations("automations");
  const tCommon = useTranslations("common");
  const tAccess = useTranslations("access");
  const language = useDisplayLanguage();
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
    sentence: ruleSentence(t, tAccess, rule.definition, { fields, targets: names.targets, roles: names.roles }),
  })).filter(({ rule, sentence }) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [rule.name, rule.description ?? "", sentence.when, sentence.forWhom, sentence.does]
      .some((text) => text.toLowerCase().includes(q));
  }), [source, fields, names, query, t, tAccess]);

  const openTemplate = (key: string) => router.push(`${NEW_HREF}?template=${encodeURIComponent(key)}`);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const newButton = (
    <PermissionGate resource="SETTINGS.AUTOMATIONS" action="MANAGE">
      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" onClick={() => setGalleryOpen(true)}>{t("list.fromTemplate")}</Button>
        <Button type="button" className="gap-1.5" onClick={() => router.push(NEW_HREF)}>
          <Icon icon={Add01Icon} size="sm" />
          {t("list.new")}
        </Button>
      </div>
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
          <FirstAutomation onStart={openTemplate} onBlank={() => router.push(NEW_HREF)} />
        ) : !everything.isLoading && rows.length === 0 ? (
          <ListEmptyState
            fill
            query={query}
            archivedView={showArchived}
            scene="automations"
            title={t("list.emptyTitle")}
            description={t("list.emptyDescription")}
            noResultsHint={t("list.noResultsHint")}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("list.columns.automation")}</TableHead>
                <TableHead>{tCommon("fields.status")}</TableHead>
                <TableHead>{t("list.columns.lastRun")}</TableHead>
                <TableHead className="text-right">{t("list.columns.runs")}</TableHead>
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
                          {t("sentence.rule.row", { when: sentence.when, forWhom: sentence.forWhom, does: sentence.does })}
                        </div>
                      ) : null}
                      {rule.status === "PAUSED" && rule.pausedReason ? (
                        <div className="mt-0.5 truncate text-hint text-status-pending-text">{reasonText(t, rule.pausedReason, language)}</div>
                      ) : null}
                    </TableCell>
                    <TableCell className="w-32"><RuleStatusBadge status={rule.status} /></TableCell>
                    <TableCell className="w-44 text-body text-tertiary">{formatMoment(rule.lastRunAt, language)}</TableCell>
                    <TableCell className="w-20 text-right tabular-nums">{totalRuns(rule)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("list.galleryTitle")}</DialogTitle>
            <DialogDescription>{t("list.galleryDescription")}</DialogDescription>
          </DialogHeader>
          {galleryOpen && <TemplateGallery onPick={openTemplate} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * The first-day screen: one sentence of what this place is for, the one action that fills it, and four
 * ready-made starting points — each opens the builder filled in, nothing is saved until Publish.
 */
function FirstAutomation({ onStart, onBlank }: { onStart: (key: string) => void; onBlank: () => void }) {
  const t = useTranslations("automations");
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16 text-center">
      <div className="rounded-card bg-subtle p-4 text-secondary"><Icon icon={FlashIcon} size="lg" /></div>
      <div className="space-y-2">
        <h3 className="text-section-title text-primary">{t("list.firstTitle")}</h3>
        <p className="text-body text-tertiary">{t("list.firstDescription")}</p>
      </div>
      <PermissionGate resource="SETTINGS.AUTOMATIONS" action="MANAGE">
        <TemplateGallery onPick={onStart} />
        <Button type="button" className="gap-1.5" onClick={onBlank}>
          <Icon icon={Add01Icon} size="sm" />
          {t("list.new")}
        </Button>
      </PermissionGate>
    </div>
  );
}
