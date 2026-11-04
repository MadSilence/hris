"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { formatDisplayDate } from "@/lib/date";
import {
  archiveTemplateAction,
  deleteTemplateAction,
  unarchiveTemplateAction,
} from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useInvalidateLifecycle, useLifecycleTemplates } from "@/components/modules/lifecycle/hooks";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import { AddTemplateDialog } from "./AddTemplateDialog";
import { TemplateSparkline } from "./TemplateSparkline";
import { PROCESS_TYPE_LABELS, type ProcessType, type TemplateSummary } from "@/models/lifecycle";

type Props = {
  /** Which process's templates — each is its own tab and route in Settings. */
  type: ProcessType;
};

export const templateHref = (type: ProcessType, id: string) =>
  `/settings/automation/${type.toLowerCase()}/${id}`;

/**
 * Settings → Preboarding / Onboarding: the templates processes are started from. A quiet list — the name,
 * how many tasks and a small timeline of where they fall — each opening its canvas.
 */
export function LifecycleTemplatesContainer({ type }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "archive" | "delete"; template: TemplateSummary } | null>(null);

  const { data, isLoading, error } = useLifecycleTemplates(type);
  const invalidate = useInvalidateLifecycle();

  const all = useMemo(() => data ?? [], [data]);
  const archivedCount = all.filter((t) => t.archivedAt).length;
  const rows = all
    .filter((t) => Boolean(t.archivedAt) === showArchived)
    .filter((t) => !query.trim() || t.name.toLowerCase().includes(query.trim().toLowerCase()));

  const run = async (result: Promise<{ status: ActionStatus; errorMessage?: string }>) => {
    const res = await result;
    if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
    await invalidate();
    return null;
  };

  const open = (t: TemplateSummary) => router.push(templateHref(type, t.id));

  return (
    <div className="space-y-4">
      <ListToolbar
        search={{ value: query, onChange: setQuery }}
        archived={archivedCount > 0 ? { count: archivedCount, showing: showArchived, onChange: setShowArchived } : undefined}
        primary={
          <PermissionGate resource="PEOPLE.LIFECYCLE_TEMPLATES" action="EDIT">
            <Button type="button" className="gap-1.5" onClick={() => setAdding(true)}>
              <Icon icon={Add01Icon} size="sm" />
              Add template
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
          scene="onboarding"
          title={`No ${PROCESS_TYPE_LABELS[type].toLowerCase()} templates yet`}
          // "an onboarding", "a preboarding": the article follows the word, and a template literal
          // that always writes "a" produced "a onboarding" on one of the two tabs.
          description={`A template is the list of tasks ${
            type === "PREBOARDING" ? "a" : "an"
          } ${PROCESS_TYPE_LABELS[type].toLowerCase()} starts with.`}
          onCreate={() => setAdding(true)}
          createLabel="Add template"
          createAccess={{ resource: "PEOPLE.LIFECYCLE_TEMPLATES", action: "EDIT" }}
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((t) => (
            <li
              key={t.id}
              role="link"
              tabIndex={0}
              aria-label={t.name}
              data-test="template-row"
              onClick={() => open(t)}
              onKeyDown={(e) => { if (e.key === "Enter") open(t); }}
              className="flex cursor-pointer items-center gap-4 rounded-card border border-divider bg-card px-5 py-4 transition-colors hover:border-divider hover:bg-subtle/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-primary">{t.name}</span>
                  {t.archivedAt && <StatusBadge status="archived" />}
                </div>
                <div className="mt-0.5 text-hint text-tertiary">
                  {t.taskCount === 1 ? "1 task" : `${t.taskCount} tasks`} · Updated {formatDisplayDate(t.updatedAt)}
                  {t.description ? ` · ${t.description}` : ""}
                </div>
                {t.hasProblems && (
                  <div className="mt-1 flex items-center gap-1 text-hint text-status-pending-text">
                    <Icon icon={Alert02Icon} size="sm" />
                    Names somebody who cannot take a task
                  </div>
                )}
              </div>
              <TemplateSparkline offsets={t.dayOffsets ?? []} />
              <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <PermissionGate resource="PEOPLE.LIFECYCLE_TEMPLATES" action="MANAGE">
                  <RowActionsMenu label="Template actions">
                    {!t.archivedAt && (
                      <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" className="text-tertiary" />} onClick={() => open(t)}>
                        Edit
                      </RowAction>
                    )}
                    {t.archivedAt ? (
                      <RowAction
                        icon={<Icon icon={ArchiveArrowUpIcon} size="sm" className="text-tertiary" />}
                        onClick={async () => {
                          const problem = await run(unarchiveTemplateAction(t.id));
                          if (problem) showActionError({ errorMessage: problem });
                        }}
                      >
                        Unarchive
                      </RowAction>
                    ) : (
                      <RowAction icon={<Icon icon={Archive02Icon} size="sm" className="text-tertiary" />} onClick={() => setConfirm({ kind: "archive", template: t })}>
                        Archive
                      </RowAction>
                    )}
                    <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setConfirm({ kind: "delete", template: t })}>
                      Delete
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
        title="Archive template"
        confirmLabel="Archive"
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          const problem = confirm ? await run(archiveTemplateAction(confirm.template.id)) : null;
          if (!problem) setConfirm(null);
          return problem;
        }}
      >
        <p>
          <strong>{confirm?.template.name}</strong> can no longer be used to start a process. Processes
          already started from it keep their own copy. You can unarchive it later.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm?.kind === "delete"}
        title="Delete template"
        confirmLabel="Delete"
        destructive
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          const problem = confirm ? await run(deleteTemplateAction(confirm.template.id)) : null;
          if (!problem) setConfirm(null);
          return problem;
        }}
      >
        <p>
          <strong>{confirm?.template.name}</strong> is removed. A template that has already started a
          process cannot be deleted — archive it instead.
        </p>
      </ConfirmDialog>
    </div>
  );
}
