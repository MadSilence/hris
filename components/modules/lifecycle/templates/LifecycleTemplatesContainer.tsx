"use client";

import React, { useMemo, useState } from "react";
import { Archive, ArchiveRestore, ListChecks, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
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
import { TemplateEditorDialog } from "./TemplateEditorDialog";
import { PROCESS_TYPE_LABELS, type ProcessType, type TemplateSummary } from "@/models/lifecycle";

/** Settings → Preboarding & Onboarding: the templates processes are started from. */
export function LifecycleTemplatesContainer() {
  const [type, setType] = useState<ProcessType>("PREBOARDING");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
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

  return (
    <div className="space-y-4">
      <Tabs value={type} onValueChange={(v) => { setType(v as ProcessType); setShowArchived(false); }}>
        <TabsList>
          <TabsTrigger value="PREBOARDING">Preboarding</TabsTrigger>
          <TabsTrigger value="ONBOARDING">Onboarding</TabsTrigger>
        </TabsList>
      </Tabs>

      <ListToolbar
        search={{ value: query, onChange: setQuery }}
        archived={archivedCount > 0 ? { count: archivedCount, showing: showArchived, onChange: setShowArchived } : undefined}
        primary={
          <PermissionGate resource="PEOPLE.LIFECYCLE_TEMPLATES" action="EDIT">
            <Button className="gap-1.5" onClick={() => setEditing({ id: null })}>
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          </PermissionGate>
        }
      />

      {error ? (
        <ErrorState error={error} />
      ) : isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />)}
        </div>
      ) : rows.length === 0 ? (
        <ListEmptyState
          query={query}
          archivedView={showArchived}
          icon={<ListChecks className="h-6 w-6" />}
          title={`No ${PROCESS_TYPE_LABELS[type].toLowerCase()} templates yet`}
          description={`A template is the list of tasks a ${PROCESS_TYPE_LABELS[type].toLowerCase()} starts with.`}
          onCreate={() => setEditing({ id: null })}
          createLabel="Add Template"
          createAccess={{ resource: "PEOPLE.LIFECYCLE_TEMPLATES", action: "EDIT" }}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Name</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id} className="cursor-pointer" onClick={() => setEditing({ id: t.id })}>
                <TableCell>
                  <div className="font-medium">{t.name}</div>
                  {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                  {t.hasProblems && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-warning-700">
                      <TriangleAlert className="h-3.5 w-3.5" />
                      Names somebody who cannot take a task
                    </div>
                  )}
                </TableCell>
                <TableCell>{t.taskCount}</TableCell>
                <TableCell>{formatDisplayDate(t.updatedAt)}</TableCell>
                <TableCell><StatusBadge status={t.archivedAt ? "archived" : "active"} /></TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <PermissionGate resource="PEOPLE.LIFECYCLE_TEMPLATES" action="MANAGE">
                    <RowActionsMenu label="Template Actions">
                      {!t.archivedAt && (
                        <RowAction icon={<Pencil className="h-4 w-4 text-muted-foreground" />} onClick={() => setEditing({ id: t.id })}>
                          Edit
                        </RowAction>
                      )}
                      {t.archivedAt ? (
                        <RowAction
                          icon={<ArchiveRestore className="h-4 w-4 text-muted-foreground" />}
                          onClick={async () => {
                            const problem = await run(unarchiveTemplateAction(t.id));
                            if (problem) showActionError({ errorMessage: problem });
                          }}
                        >
                          Unarchive
                        </RowAction>
                      ) : (
                        <RowAction icon={<Archive className="h-4 w-4 text-muted-foreground" />} onClick={() => setConfirm({ kind: "archive", template: t })}>
                          Archive
                        </RowAction>
                      )}
                      <RowActionDestructive icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirm({ kind: "delete", template: t })}>
                        Delete
                      </RowActionDestructive>
                    </RowActionsMenu>
                  </PermissionGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TemplateEditorDialog
        open={editing !== null}
        templateId={editing?.id ?? null}
        type={type}
        onCloseAction={() => setEditing(null)}
      />

      <ConfirmDialog
        open={confirm?.kind === "archive"}
        title="Archive Template"
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
        title="Delete Template"
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
