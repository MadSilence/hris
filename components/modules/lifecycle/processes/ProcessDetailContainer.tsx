"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
import { useDateFormatter } from "@/lib/date";
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
import type { Task } from "@/models/lifecycle";
import { assigneeKindText } from "@/components/modules/lifecycle/i18n";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { cancelProcessTaskAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { ProcessStatusBadge } from "./ProcessStatusBadge";
import { ProcessTaskDialog } from "./ProcessTaskDialog";
import { InlineAlert } from "@/components/desact/alert";

type Dialog = "complete" | "cancel" | "archive" | "delete" | "manager" | "revoke" | "task" | "cancelTask" | null;

/** One process: its tasks, who runs it, the hire date it was planned against, and what can be done to it. */
export function ProcessDetailContainer({ processId }: { processId: string }) {
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
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
  const managerLabel = assigneeKindText(t, "ONBOARDING_MANAGER", process.type);
  const leavingArg = leaving ? "yes" : "no";
  const act = async (result: Promise<{ status: ActionStatus; errorMessage?: string }>, success?: string) => {
    const res = await result;
    if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("shared.somethingWentWrong");
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
              {t.rich("processDetail.title", {
                type: t(`processType.${process.type}`),
                name: process.target.name ?? "",
                link: (chunks) => (
                  <Link className="text-accent-text underline-offset-4 hover:underline" href={`/organization/people/${process.target.id}/personal`}>
                    {chunks}
                  </Link>
                ),
              })}
            </h1>
            <ProcessStatusBadge status={process.status} />
            {/* Said in the text line only, an archived process looked like any other (walk, SWEEP S11). */}
            {process.archivedAt && <StatusBadge status="archived" />}
          </div>
          <p className="text-body text-tertiary">
            {[
              t("processDetail.fromTemplate", { template: process.templateName }),
              t(leaving ? "processDetail.lastDay" : "processDetail.starts", { date: formatDisplayDate(process.anchorDate, { style: "medium" }) }),
              t("processDetail.managerLine", { leaving: leavingArg, name: process.manager?.name ?? t("shared.nobody") }),
              process.type === "PREBOARDING" ? (process.linkActive ? t("processDetail.linkActive") : t("processDetail.noLink")) : null,
            ].filter(Boolean).join(" · ")}
          </p>
        </div>

        <PermissionGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="EDIT">
          <div className="flex items-center gap-2">
            {open && (
              <Button type="button" variant="secondary" className="gap-1.5" onClick={() => setDialog("complete")}>
                <Icon icon={TickDouble02Icon} size="sm" />
                {t("processDetail.markComplete")}
              </Button>
            )}
            <RowActionsMenu label={t("processDetail.actions")} className="w-56">
              {open && (
                <RowAction icon={<Icon icon={UserSettings01Icon} size="sm" className="text-tertiary" />} onClick={() => { setManager(null); setDialog("manager"); }}>
                  {t("processDetail.changeManager", { leaving: leavingArg })}
                </RowAction>
              )}
              {open && process.type === "PREBOARDING" && (
                <RowAction
                  icon={<Icon icon={Link01Icon} size="sm" className="text-tertiary" />}
                  onClick={async () => {
                    const problem = await act(reissuePreboardingLinkAction(process.id), t("processDetail.newLinkSent"));
                    if (problem) showActionError({ errorMessage: problem });
                  }}
                >
                  {t("processDetail.sendNewLink")}
                </RowAction>
              )}
              {open && process.type === "PREBOARDING" && process.linkActive && (
                <RowAction icon={<Icon icon={Unlink01Icon} size="sm" className="text-tertiary" />} onClick={() => setDialog("revoke")}>
                  {t("processDetail.revokeLink")}
                </RowAction>
              )}
              {open && (
                <RowAction icon={<Icon icon={CancelCircleIcon} size="sm" className="text-tertiary" />} onClick={() => setDialog("cancel")}>
                  {t("processDetail.cancelProcess")}
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
                    {t("shared.unarchive")}
                  </RowAction>
                ) : (
                  <RowAction icon={<Icon icon={Archive02Icon} size="sm" className="text-tertiary" />} onClick={() => setDialog("archive")}>
                    {tCommon("actions.archive")}
                  </RowAction>
                )}
                <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setDialog("delete")}>
                  {tCommon("actions.delete")}
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
            t("processDetail.drift", {
              leaving: leavingArg,
              from: formatDisplayDate(process.anchorDrift.from, { style: "medium" }),
              to: formatDisplayDate(process.anchorDrift.to, { style: "medium" }),
            })
          }
          action={
            <PermissionGate resource="PEOPLE.LIFECYCLE_PROCESSES" action="EDIT">
              <Button type="button"
                size="sm"
                onClick={async () => {
                  const problem = await act(rebaseProcessAction(process.id), t("processDetail.datesRecalculated"));
                  if (problem) showActionError({ errorMessage: problem });
                }}
              >
                {t("processDetail.recalculate")}
              </Button>
            </PermissionGate>
          }
        >
              <p>
                {process.anchorDrift.changes.length === 0
                  ? t("processDetail.driftNone")
                  : t("processDetail.driftChanges", {
                    count: process.anchorDrift.changes.length,
                    list: process.anchorDrift.changes.map((c) => t("processDetail.driftChange", {
                      title: c.title,
                      from: formatDisplayDate(c.from ?? "", { style: "medium" }),
                      to: formatDisplayDate(c.to ?? "", { style: "medium" }),
                    })).join(", "),
                  })}
              </p>
        </InlineAlert>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-section-title">{t("processDetail.tasks")}</h2>
          {open && canEdit && (
            <Button type="button" variant="secondary" size="sm" onClick={() => { setTaskOf(null); setDialog("task"); }}>
              {t("shared.addTask")}
            </Button>
          )}
        </div>
        {process.tasks.length === 0 ? (
          <p className="text-body text-tertiary">{t("processDetail.noTasks")}</p>
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
        title={t("processDetail.markComplete")}
        confirmLabel={t("processDetail.markComplete")}
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          const problem = await act(closeProcessAction({ id: process.id, outcome: "COMPLETED" }));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <p>{process.type === "PREBOARDING" ? t("processDetail.completeBodyPreboarding") : t("processDetail.completeBody")}</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "cancel"}
        title={t("processDetail.cancelProcess")}
        confirmLabel={t("processDetail.cancelProcess")}
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          const problem = await act(closeProcessAction({ id: process.id, outcome: "CANCELLED" }));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <p>{t("processDetail.cancelBody")}</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "archive"}
        title={t("processDetail.archiveTitle")}
        confirmLabel={tCommon("actions.archive")}
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          const problem = await act(archiveProcessAction(process.id));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <p>{t("processDetail.archiveBody")}</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "revoke"}
        title={t("processDetail.revokeLink")}
        confirmLabel={t("processDetail.revoke")}
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          const problem = await act(revokePreboardingLinkAction(process.id));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <p>{t("processDetail.revokeBody")}</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "delete"}
        title={t("processDetail.deleteTitle")}
        confirmLabel={tCommon("actions.delete")}
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
            <p>{t("processDetail.tasksDeleted", { count: impact.data.tasksDeleted })}</p>
            <p>{t("processDetail.documentsKept", { count: impact.data.documentsKept, name: process.target.name ?? "" })}</p>
            {impact.data.answersKept > 0 && (
              <p>{t("processDetail.answersKept", { count: impact.data.answersKept, name: process.target.name ?? "" })}</p>
            )}
            <p>{t("processDetail.historyKept")}</p>
          </>
        ) : impact.isError ? (
          <p>{t("processDetail.impactFailed")}</p>
        ) : (
          <p>{t("processDetail.impactLoading")}</p>
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
        title={t("shared.cancelTask")}
        confirmLabel={t("shared.cancelTask")}
        destructive
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          if (!taskOf) return null;
          const problem = await act(cancelProcessTaskAction({ id: process.id, taskId: taskOf.id }));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <p>{t("processDetail.cancelTaskBody", { title: taskOf?.title ?? "" })}</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "manager"}
        title={t("processDetail.changeManager", { leaving: leavingArg })}
        confirmLabel={t("processDetail.change")}
        onCancelAction={() => setDialog(null)}
        onConfirmAction={async () => {
          if (!manager) return t("processDetail.chooseSomebody");
          const problem = await act(changeProcessManagerAction({ id: process.id, managerUserId: manager.id }));
          if (!problem) setDialog(null);
          return problem;
        }}
      >
        <div className="space-y-1.5">
          <Label>{managerLabel}</Label>
          <UserPickerField value={manager} onChange={setManager} />
          <p className="text-hint">{t("processDetail.managerHint", { leaving: leavingArg })}</p>
        </div>
      </ConfirmDialog>
    </div>
  );
}
