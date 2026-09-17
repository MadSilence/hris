"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Archive, ArchiveRestore, CalendarClock, CheckCheck, Link2, Link2Off, Trash2, UserRoundCog, XCircle,
} from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import {
  archiveProcessAction,
  changeProcessManagerAction,
  closeProcessAction,
  completeProcessTaskAction,
  deleteProcessAction,
  rebaseProcessAction,
  reissuePreboardingLinkAction,
  revokePreboardingLinkAction,
  unarchiveProcessAction,
} from "@/components/modules/lifecycle/actions/lifecycleActions";
import {
  useInvalidateLifecycle,
  useLifecycleProcess,
  useProcessDeleteImpact,
} from "@/components/modules/lifecycle/hooks";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import { TaskList } from "@/components/modules/lifecycle/tasks/TaskList";
import { PROCESS_TYPE_LABELS } from "@/models/lifecycle";
import { ProcessStatusBadge } from "./ProcessStatusBadge";

type Dialog = "complete" | "cancel" | "archive" | "delete" | "manager" | "revoke" | null;

/** One process: its tasks, who runs it, the hire date it was planned against, and what can be done to it. */
export function ProcessDetailContainer({ processId }: { processId: string }) {
  const { data: process, isLoading, error } = useLifecycleProcess(processId);
  const invalidate = useInvalidateLifecycle();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [manager, setManager] = useState<PickedUser | null>(null);
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const impact = useProcessDeleteImpact(processId, dialog === "delete");

  if (error) return <ErrorState error={error} />;
  if (isLoading || !process) {
    return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />)}</div>;
  }

  const open = !process.closedAt;
  const act = async (result: Promise<{ status: ActionStatus; errorMessage?: string }>, success?: string) => {
    const res = await result;
    if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
    await invalidate();
    if (success) showSuccess(success);
    return null;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-brown-900">
              {PROCESS_TYPE_LABELS[process.type]} for{" "}
              <Link className="underline-offset-4 hover:underline" href={`/organization/people/${process.target.id}/personal`}>
                {process.target.name}
              </Link>
            </h1>
            <ProcessStatusBadge status={process.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {[
              `From ${process.templateName}`,
              `Starts ${formatDisplayDate(process.anchorDate, { style: "medium" })}`,
              `Onboarding manager: ${process.manager?.name ?? "nobody"}`,
              process.type === "PREBOARDING" ? (process.linkActive ? "Preboarding link active" : "No active preboarding link") : null,
              process.archivedAt ? "Archived" : null,
            ].filter(Boolean).join(" · ")}
          </p>
        </div>

        <PermissionGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="EDIT">
          <div className="flex items-center gap-2">
            {open && (
              <Button variant="outline" className="gap-1.5" onClick={() => setDialog("complete")}>
                <CheckCheck className="h-4 w-4" />
                Mark as Complete
              </Button>
            )}
            <RowActionsMenu label="Process Actions" className="w-56">
              {open && (
                <RowAction icon={<UserRoundCog className="h-4 w-4 text-muted-foreground" />} onClick={() => { setManager(null); setDialog("manager"); }}>
                  Change Onboarding Manager
                </RowAction>
              )}
              {open && process.type === "PREBOARDING" && (
                <RowAction
                  icon={<Link2 className="h-4 w-4 text-muted-foreground" />}
                  onClick={async () => {
                    const problem = await act(reissuePreboardingLinkAction(process.id), "A new preboarding link was sent.");
                    if (problem) showActionError({ errorMessage: problem });
                  }}
                >
                  Send a New Link
                </RowAction>
              )}
              {open && process.type === "PREBOARDING" && process.linkActive && (
                <RowAction icon={<Link2Off className="h-4 w-4 text-muted-foreground" />} onClick={() => setDialog("revoke")}>
                  Revoke Link
                </RowAction>
              )}
              {open && (
                <RowAction icon={<XCircle className="h-4 w-4 text-muted-foreground" />} onClick={() => setDialog("cancel")}>
                  Cancel Process
                </RowAction>
              )}
              <PermissionGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="MANAGE">
                {process.archivedAt ? (
                  <RowAction
                    icon={<ArchiveRestore className="h-4 w-4 text-muted-foreground" />}
                    onClick={async () => {
                      const problem = await act(unarchiveProcessAction(process.id));
                      if (problem) showActionError({ errorMessage: problem });
                    }}
                  >
                    Unarchive
                  </RowAction>
                ) : (
                  <RowAction icon={<Archive className="h-4 w-4 text-muted-foreground" />} onClick={() => setDialog("archive")}>
                    Archive
                  </RowAction>
                )}
                <RowActionDestructive icon={<Trash2 className="h-4 w-4" />} onClick={() => setDialog("delete")}>
                  Delete
                </RowActionDestructive>
              </PermissionGate>
            </RowActionsMenu>
          </div>
        </PermissionGate>
      </header>

      {process.anchorDrift && (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-warning-200 bg-warning-50 px-4 py-3" role="status">
          <div className="flex items-start gap-2 text-sm">
            <CalendarClock className="mt-0.5 h-4 w-4 text-warning-700" />
            <div>
              <p className="font-medium text-warning-800">
                The hire date moved from {formatDisplayDate(process.anchorDrift.from, { style: "medium" })} to{" "}
                {formatDisplayDate(process.anchorDrift.to, { style: "medium" })}.
              </p>
              <p className="text-warning-800/80">
                {process.anchorDrift.changes.length === 0
                  ? "No open task changes date."
                  : `${process.anchorDrift.changes.length} open task(s) would move: `
                    + process.anchorDrift.changes.map((c) =>
                      `${c.title} (${formatDisplayDate(c.from ?? "")} → ${formatDisplayDate(c.to ?? "")})`).join(", ")}
              </p>
            </div>
          </div>
          <PermissionGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="EDIT">
            <Button
              size="sm"
              onClick={async () => {
                const problem = await act(rebaseProcessAction(process.id), "Dates recalculated.");
                if (problem) showActionError({ errorMessage: problem });
              }}
            >
              Recalculate Dates
            </Button>
          </PermissionGate>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Tasks</h2>
        {process.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">This process has no tasks.</p>
        ) : (
          <TaskList
            tasks={process.tasks}
            showAssignee
            busyTaskId={busyTask}
            onCompleteAction={async (task) => {
              setBusyTask(task.id);
              try {
                const problem = await act(completeProcessTaskAction({ id: process.id, taskId: task.id }));
                if (problem) showActionError({ errorMessage: problem });
              } finally {
                setBusyTask(null);
              }
            }}
          />
        )}
      </section>

      <ConfirmDialog
        open={dialog === "complete"}
        title="Mark as Complete"
        confirmLabel="Mark as Complete"
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          const problem = await act(closeProcessAction({ id: process.id, outcome: "COMPLETED" }));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <p>Tasks still open are cancelled, and nothing more is scheduled.{process.type === "PREBOARDING" ? " The preboarding link stops working." : ""}</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "cancel"}
        title="Cancel Process"
        confirmLabel="Cancel Process"
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          const problem = await act(closeProcessAction({ id: process.id, outcome: "CANCELLED" }));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <p>The process ends without being completed. Tasks still open are cancelled; what was done stays done.</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "archive"}
        title="Archive Process"
        confirmLabel="Archive"
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          const problem = await act(archiveProcessAction(process.id));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <p>It leaves the list of processes and keeps everything as it is. Unarchiving puts it back exactly as it was.</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "revoke"}
        title="Revoke Link"
        confirmLabel="Revoke"
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          const problem = await act(revokePreboardingLinkAction(process.id));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <p>The link that was sent stops working at once. Send a new link to give access again.</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "delete"}
        title="Delete Process"
        confirmLabel="Delete"
        destructive
        // Seen live: Delete was pressable while the dialog still said "Working out what this removes…".
        confirmDisabled={impact.isLoading}
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          const problem = await act(deleteProcessAction(process.id));
          if (!problem) {
            setDialog(null);
            window.location.assign("/processes");
          }
          return problem;
        }}
      >
        {impact.data ? (
          <>
            <p>{impact.data.tasksDeleted} task(s) will be deleted.</p>
            <p>{impact.data.documentsKept} document(s) stay in {process.target.name}&apos;s file.</p>
            <p>The history of what happened is kept.</p>
          </>
        ) : impact.isError ? (
          <p>We could not work out what this removes. The history of what happened is kept either way.</p>
        ) : (
          <p>Working out what this removes…</p>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "manager"}
        title="Change Onboarding Manager"
        confirmLabel="Change"
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          if (!manager) return "Choose somebody.";
          const problem = await act(changeProcessManagerAction({ id: process.id, managerUserId: manager.id }));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <div className="space-y-1.5">
          <Label>Onboarding Manager</Label>
          <UserPickerField value={manager} onChange={setManager} />
          <p className="text-xs">Their open tasks as onboarding manager move to the new one.</p>
        </div>
      </ConfirmDialog>
    </div>
  );
}
