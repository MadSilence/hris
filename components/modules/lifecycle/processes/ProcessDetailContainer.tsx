"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Archive02Icon, ArchiveArrowUpIcon, CalendarLock01Icon, CancelCircleIcon, Delete02Icon, Link01Icon, TickDouble02Icon, Unlink01Icon, UserSettings01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
import { PROCESS_TYPE_LABELS, assigneeKindLabel, type Task } from "@/models/lifecycle";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { cancelProcessTaskAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { ProcessStatusBadge } from "./ProcessStatusBadge";
import { ProcessTaskDialog } from "./ProcessTaskDialog";
import { InlineAlert } from "@/components/desact/alert";

type Dialog = "complete" | "cancel" | "archive" | "delete" | "manager" | "revoke" | "task" | "cancelTask" | null;

/** One process: its tasks, who runs it, the hire date it was planned against, and what can be done to it. */
export function ProcessDetailContainer({ processId }: { processId: string }) {
  const { data: process, isLoading, error } = useLifecycleProcess(processId);
  const invalidate = useInvalidateLifecycle();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [manager, setManager] = useState<PickedUser | null>(null);
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const impact = useProcessDeleteImpact(processId, dialog === "delete");
  // The task being edited or cancelled; null with the task dialog open means a new one.
  const [taskOf, setTaskOf] = useState<Task | null>(null);
  const canEdit = useCanAccess("PEOPLE.LIFECYCLE_PROCESSES", "EDIT");
  const { userId: me } = useCurrentUser();

  if (error) return <ErrorState error={error} />;
  if (isLoading || !process) {
    return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-16 shimmer rounded-control bg-mist" />)}</div>;
  }

  const open = !process.closedAt;
  const leaving = process.type === "OFFBOARDING";
  // The same role either way; an offboarding calls it by its own name (Q4 of 2026-11-02).
  const managerLabel = assigneeKindLabel("ONBOARDING_MANAGER", process.type);
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
            <h1 className="text-page-title text-primary">
              {PROCESS_TYPE_LABELS[process.type]} for{" "}
              <Link className="text-accent-text underline-offset-4 hover:underline" href={`/organization/people/${process.target.id}/personal`}>
                {process.target.name}
              </Link>
            </h1>
            <ProcessStatusBadge status={process.status} />
            {/* Said in the text line only, an archived process looked like any other (walk, SWEEP S11). */}
            {process.archivedAt && <StatusBadge status="archived" />}
          </div>
          <p className="text-body text-tertiary">
            {[
              `From ${process.templateName}`,
              `${leaving ? "Last day" : "Starts"} ${formatDisplayDate(process.anchorDate, { style: "medium" })}`,
              `${leaving ? "Offboarding" : "Onboarding"} manager: ${process.manager?.name ?? "nobody"}`,
              process.type === "PREBOARDING" ? (process.linkActive ? "Preboarding link active" : "No active preboarding link") : null,
            ].filter(Boolean).join(" · ")}
          </p>
        </div>

        <PermissionGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="EDIT">
          <div className="flex items-center gap-2">
            {open && (
              <Button type="button" variant="secondary" className="gap-1.5" onClick={() => setDialog("complete")}>
                <Icon icon={TickDouble02Icon} size="sm" />
                Mark as complete
              </Button>
            )}
            <RowActionsMenu label="Process actions" className="w-56">
              {open && (
                <RowAction icon={<Icon icon={UserSettings01Icon} size="sm" className="text-tertiary" />} onClick={() => { setManager(null); setDialog("manager"); }}>
                  Change {managerLabel}
                </RowAction>
              )}
              {open && process.type === "PREBOARDING" && (
                <RowAction
                  icon={<Icon icon={Link01Icon} size="sm" className="text-tertiary" />}
                  onClick={async () => {
                    const problem = await act(reissuePreboardingLinkAction(process.id), "A new preboarding link was sent.");
                    if (problem) showActionError({ errorMessage: problem });
                  }}
                >
                  Send a new link
                </RowAction>
              )}
              {open && process.type === "PREBOARDING" && process.linkActive && (
                <RowAction icon={<Icon icon={Unlink01Icon} size="sm" className="text-tertiary" />} onClick={() => setDialog("revoke")}>
                  Revoke link
                </RowAction>
              )}
              {open && (
                <RowAction icon={<Icon icon={CancelCircleIcon} size="sm" className="text-tertiary" />} onClick={() => setDialog("cancel")}>
                  Cancel process
                </RowAction>
              )}
              <PermissionGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="MANAGE">
                {process.archivedAt ? (
                  <RowAction
                    icon={<Icon icon={ArchiveArrowUpIcon} size="sm" className="text-tertiary" />}
                    onClick={async () => {
                      const problem = await act(unarchiveProcessAction(process.id));
                      if (problem) showActionError({ errorMessage: problem });
                    }}
                  >
                    Unarchive
                  </RowAction>
                ) : (
                  <RowAction icon={<Icon icon={Archive02Icon} size="sm" className="text-tertiary" />} onClick={() => setDialog("archive")}>
                    Archive
                  </RowAction>
                )}
                <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setDialog("delete")}>
                  Delete
                </RowActionDestructive>
              </PermissionGate>
            </RowActionsMenu>
          </div>
        </PermissionGate>
      </header>

      {process.anchorDrift && (
        <InlineAlert
          tone="pending"
          icon={CalendarLock01Icon}
          title={
            <>
              {leaving ? "The last working day" : "The hire date"} moved from {formatDisplayDate(process.anchorDrift.from, { style: "medium" })} to{" "}
              {formatDisplayDate(process.anchorDrift.to, { style: "medium" })}.
            </>
          }
          action={
            <PermissionGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="EDIT">
              <Button type="button"
                size="sm"
                onClick={async () => {
                  const problem = await act(rebaseProcessAction(process.id), "Dates recalculated.");
                  if (problem) showActionError({ errorMessage: problem });
                }}
              >
                Recalculate dates
              </Button>
            </PermissionGate>
          }
        >
              <p>
                {process.anchorDrift.changes.length === 0
                  ? "No open task changes date."
                  : `${process.anchorDrift.changes.length} open task(s) would move: `
                    + process.anchorDrift.changes.map((c) =>
                      `${c.title} (${formatDisplayDate(c.from ?? "")} → ${formatDisplayDate(c.to ?? "")})`).join(", ")}
              </p>
        </InlineAlert>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-section-title">Tasks</h2>
          {open && canEdit && (
            <Button type="button" variant="secondary" size="sm" onClick={() => { setTaskOf(null); setDialog("task"); }}>
              Add task
            </Button>
          )}
        </div>
        {process.tasks.length === 0 ? (
          <p className="text-body text-tertiary">This process has no tasks.</p>
        ) : (
          <TaskList
            tasks={process.tasks}
            showAssignee
            busyTaskId={busyTask}
            canComplete={() => canEdit}
            isMine={(task) => task.assignee?.id === me}
            onCompleteAction={async (task, documentId) => {
              setBusyTask(task.id);
              try {
                const problem = await act(completeProcessTaskAction({ id: process.id, taskId: task.id, documentId }));
                if (problem) showActionError({ errorMessage: problem });
              } finally {
                setBusyTask(null);
              }
            }}
            onChangedAction={async () => { await invalidate(); }}
            onEditAction={open && canEdit ? (task) => { setTaskOf(task); setDialog("task"); } : undefined}
            onCancelAction={open && canEdit ? (task) => { setTaskOf(task); setDialog("cancelTask"); } : undefined}
          />
        )}
      </section>

      <ConfirmDialog
        open={dialog === "complete"}
        title="Mark as complete"
        confirmLabel="Mark as complete"
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
        title="Cancel process"
        confirmLabel="Cancel process"
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
        title="Archive process"
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
        title="Revoke link"
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
        title="Delete process"
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
            {impact.data.answersKept > 0 && (
              <p>{impact.data.answersKept} answered questionnaire(s) stay on {process.target.name}&apos;s Forms tab.</p>
            )}
            <p>The history of what happened is kept.</p>
          </>
        ) : impact.isError ? (
          <p>We could not work out what this removes. The history of what happened is kept either way.</p>
        ) : (
          <p>Working out what this removes…</p>
        )}
      </ConfirmDialog>

      <ProcessTaskDialog
        process={process}
        task={taskOf}
        open={dialog === "task"}
        onCloseAction={() => setDialog(null)}
        onSavedAction={async () => { await invalidate(); setDialog(null); }}
      />

      <ConfirmDialog
        open={dialog === "cancelTask"}
        title="Cancel task"
        confirmLabel="Cancel task"
        destructive
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          if (!taskOf) return null;
          const problem = await act(cancelProcessTaskAction({ id: process.id, taskId: taskOf.id }));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <p>&ldquo;{taskOf?.title}&rdquo; will not be done. A task waiting for it opens now, as if it were done.</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "manager"}
        title={`Change ${managerLabel}`}
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
          <Label>{managerLabel}</Label>
          <UserPickerField value={manager} onChange={setManager} />
          <p className="text-hint">Their open tasks as {managerLabel.toLowerCase()} move to the new one.</p>
        </div>
      </ConfirmDialog>
    </div>
  );
}
