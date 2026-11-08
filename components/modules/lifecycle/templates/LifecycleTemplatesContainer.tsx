"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Add01Icon, Alert02Icon, Archive02Icon, ArchiveArrowUpIcon, Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { showActionError } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useDateFormatter } from "@/lib/date";
import {
  archiveTemplateAction,
  deleteTemplateAction,
  unarchiveTemplateAction,
} from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useInvalidateLifecycle, useLifecycleTemplates } from "@/components/modules/lifecycle/hooks";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import { AddTemplateDialog } from "./AddTemplateDialog";
import { TemplateSparkline } from "./TemplateSparkline";
import type { ProcessType, TemplateSummary } from "@/models/lifecycle";
import type { Scene } from "@/components/illustrations";

type Props = {
  /** Which process's templates — each is its own tab and route in Settings. */
  type: ProcessType;
};

/** The empty list's picture, by process: the rocket before the first day, the open door on it, the door behind on the last. */
const TEMPLATE_SCENES = { PREBOARDING: "welcome", ONBOARDING: "onboarding", OFFBOARDING: "offboarding" } as const satisfies Record<ProcessType, Scene>;

export const templateHref =(type: ProcessType, id: string) =>
  `/settings/automation/${type.toLowerCase()}/${id}`;

/**
 * Settings → Preboarding / Onboarding: the templates processes are started from. A quiet list — the name,
 * how many tasks and a small timeline of where they fall — each opening its canvas.
 */
export function LifecycleTemplatesContainer({ type }: Props) {
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "archive" | "delete"; template: TemplateSummary } | null>(null);

  const { data, isLoading, error } = useLifecycleTemplates(type);
  const invalidate = useInvalidateLifecycle();

  const all = useMemo(() => data ?? [], [data]);
  const archivedCount = all.filter((template) => template.archivedAt).length;
  const rows = all
    .filter((template) => Boolean(template.archivedAt) === showArchived)
    .filter((template) => !query.trim() || template.name.toLowerCase().includes(query.trim().toLowerCase()));

  const run = async (result: Promise<{ status: ActionStatus; errorMessage?: string }>) => {
    const res = await result;
    if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("shared.somethingWentWrong");
    await invalidate();
    return null;
  };

  const open = (template: TemplateSummary) => router.push(templateHref(type, template.id));

  return (
    <div className="space-y-4">
      <ListToolbar
        search={{ value: query, onChange: setQuery }}
        archived={archivedCount > 0 ? { count: archivedCount, showing: showArchived, onChange: setShowArchived } : undefined}
        primary={
          <PermissionGate resource="PEOPLE.LIFECYCLE_TEMPLATES" action="EDIT">
            <Button type="button" className="gap-1.5" onClick={() => setAdding(true)}>
              <Icon icon={Add01Icon} size="sm" />
              {t("templates.addTemplate")}
            </Button>
          </PermissionGate>
        }
      />

      {error ? (
        <ErrorState error={error} />
      ) : isLoading ? (
        <ul className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex h-[72px] items-center gap-4 rounded-card border border-divider px-5">
              <div className="h-4 w-48 shimmer rounded-tag bg-mist" />
              <div className="ml-auto h-3 w-28 shimmer rounded-tag bg-mist" />
            </li>
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <ListEmptyState
          query={query}
          archivedView={showArchived}
          scene={TEMPLATE_SCENES[type]}
          title={t("templates.emptyTitle", { type })}
          // "an onboarding", "a preboarding": the article follows the word, and a template literal
          // that always wrote "a" produced "a onboarding" on one of the two tabs — the message selects it.
          description={t("templates.emptyDescription", { type })}
          onCreate={() => setAdding(true)}
          createLabel={t("templates.addTemplate")}
          createAccess={{ resource: "PEOPLE.LIFECYCLE_TEMPLATES", action: "EDIT" }}
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              role="link"
              tabIndex={0}
              aria-label={row.name}
              data-test="template-row"
              onClick={() => open(row)}
              onKeyDown={(e) => { if (e.key === "Enter") open(row); }}
              className="flex cursor-pointer items-center gap-4 rounded-card border border-divider bg-card px-5 py-4 transition-colors hover:border-divider hover:bg-subtle/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-primary">{row.name}</span>
                  {row.archivedAt && <StatusBadge status="archived" />}
                </div>
                <div className="mt-0.5 text-hint text-tertiary">
                  {row.description
                    ? t("templates.rowMetaDescription", { count: row.taskCount, date: formatDisplayDate(row.updatedAt), description: row.description })
                    : t("templates.rowMeta", { count: row.taskCount, date: formatDisplayDate(row.updatedAt) })}
                </div>
                {row.hasProblems && (
                  <div className="mt-1 flex items-center gap-1 text-hint text-status-pending-text">
                    <Icon icon={Alert02Icon} size="sm" />
                    {t("templates.hasProblems")}
                  </div>
                )}
              </div>
              <TemplateSparkline offsets={row.dayOffsets ?? []} />
              <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <PermissionGate resource="PEOPLE.LIFECYCLE_TEMPLATES" action="MANAGE">
                  <RowActionsMenu label={t("shared.templateActions")}>
                    {!row.archivedAt && (
                      <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" className="text-tertiary" />} onClick={() => open(row)}>
                        {tCommon("actions.edit")}
                      </RowAction>
                    )}
                    {row.archivedAt ? (
                      <RowAction
                        icon={<Icon icon={ArchiveArrowUpIcon} size="sm" className="text-tertiary" />}
                        onClick={async () => {
                          const problem = await run(unarchiveTemplateAction(row.id));
                          if (problem) showActionError({ errorMessage: problem });
                        }}
                      >
                        {t("shared.unarchive")}
                      </RowAction>
                    ) : (
                      <RowAction icon={<Icon icon={Archive02Icon} size="sm" className="text-tertiary" />} onClick={() => setConfirm({ kind: "archive", template: row })}>
                        {tCommon("actions.archive")}
                      </RowAction>
                    )}
                    <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setConfirm({ kind: "delete", template: row })}>
                      {tCommon("actions.delete")}
                    </RowActionDestructive>
                  </RowActionsMenu>
                </PermissionGate>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddTemplateDialog
        open={adding}
        type={type}
        onCloseAction={() => setAdding(false)}
        onAddedAction={async (template) => {
          setAdding(false);
          await invalidate();
          router.push(templateHref(type, template.id));
        }}
      />

      <ConfirmDialog
        open={confirm?.kind === "archive"}
        title={t("shared.archiveTemplate")}
        confirmLabel={tCommon("actions.archive")}
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          const problem = confirm ? await run(archiveTemplateAction(confirm.template.id)) : null;
          if (!problem) setConfirm(null);
          return problem;
        }}
      >
        <p>
          {t.rich("shared.archiveTemplateBody", { name: confirm?.template.name ?? "", b: (chunks) => <strong>{chunks}</strong> })}
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm?.kind === "delete"}
        title={t("templates.deleteTitle")}
        confirmLabel={tCommon("actions.delete")}
        destructive
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          const problem = confirm ? await run(deleteTemplateAction(confirm.template.id)) : null;
          if (!problem) setConfirm(null);
          return problem;
        }}
      >
        <p>
          {t.rich("templates.deleteBody", { name: confirm?.template.name ?? "", b: (chunks) => <strong>{chunks}</strong> })}
        </p>
      </ConfirmDialog>
    </div>
  );
}
