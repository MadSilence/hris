"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Alert02Icon, CancelCircleIcon, CheckmarkCircle02Icon, CircleIcon, HourglassIcon, Message01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TASK_KIND_ICON } from "@/components/modules/lifecycle/templates/canvas/TaskKindIcon";
import { Badge } from "@/components/desact/badge";
import { Button } from "@/components/desact/button";
import { FormError } from "@/components/feedback/FormError";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { internalApiClient } from "@/components/clients/apiClient";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import { messageForError } from "@/lib/errors/errorMessages";
import { showError } from "@/lib/errors/errorToast";
import { documentService } from "@/components/modules/organization/modules/profile/modules/personalDocuments/services/documentService";
import { updateUserAttributesAction } from "@/components/modules/organization/modules/profile/actions/updateUserAttributesAction";
import { addTaskCommentAction, answerQuestionnaireAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import {
  PROCESS_TYPE_LABELS,
  TASK_KIND_LABELS,
  requiresFile,
  type Material,
  type Task,
  type TaskComment,
} from "@/models/lifecycle";
import { TaskMaterials, saveBlob } from "./TaskMaterials";
import { TaskComments } from "./TaskComments";
import { QuestionnaireForm } from "./QuestionnaireForm";
import { TaskFieldInput, canFillInPlace } from "./TaskFieldInput";
import { FilePickButton } from "@/components/modules/lifecycle/shared/FilePickButton";


type Props = {
  tasks: Task[];
  /** Show whose task it is — on a process page, where tasks belong to several people. */
  showAssignee?: boolean;
  /** Show whom it is about — in the Tasks tab, where tasks are about several people. */
  showSubject?: boolean;
  /** Tick a to-do or acknowledge; a to-do that requires a file is ticked with the file it was given. */
  onCompleteAction?: (task: Task, documentId?: string | null) => void | Promise<void>;
  canComplete?: (task: Task) => boolean;
  /** Whether the reader is the one the task is assigned to: only they acknowledge and answer. */
  isMine?: (task: Task) => boolean;
  /** Something was done in place — a field filled, a file uploaded, answers sent: read the tasks again. */
  onChangedAction?: () => void | Promise<void>;
  /** A running process's own edits (C2); without them the row has no menu. */
  onEditAction?: (task: Task) => void;
  onCancelAction?: (task: Task) => void;
  busyTaskId?: string | null;
  /**
   * The template editor's preview of what the person sees: the rows as they will look, their fields usable,
   * nothing sent — no button acts, and there are no comments or menus.
   */
  preview?: boolean;
};

/**
 * Tasks, one row each, done where they are shown (DECISIONS.md § "Lifecycle tasks", B3): a to-do is ticked —
 * with its file when it asks for one —, fields are filled, a document uploaded and a questionnaire answered in
 * the row itself. The profile is reached only for a field the row cannot show. Whatever is done goes through
 * the profile's own checks; nothing here grants anything.
 */
export function TaskList({
  tasks, showAssignee, showSubject, onCompleteAction, canComplete, isMine, onChangedAction, onEditAction,
  onCancelAction, busyTaskId, preview,
}: Props) {
  return (
    <ul className="divide-y divide-divider rounded-control border border-divider">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          showAssignee={showAssignee}
          showSubject={showSubject}
          onCompleteAction={onCompleteAction}
          canComplete={canComplete?.(task) ?? true}
          mine={isMine?.(task) ?? true}
          onChangedAction={onChangedAction}
          onEditAction={onEditAction}
          onCancelAction={onCancelAction}
          busy={busyTaskId === task.id}
          preview={preview}
        />
      ))}
    </ul>
  );
}

function TaskRow({
  task, showAssignee, showSubject, onCompleteAction, canComplete, mine, onChangedAction, onEditAction, onCancelAction, busy, preview,
}: {
  task: Task;
  showAssignee?: boolean;
  showSubject?: boolean;
  onCompleteAction?: Props["onCompleteAction"];
  canComplete: boolean;
  mine: boolean;
  onChangedAction?: Props["onChangedAction"];
  onEditAction?: Props["onEditAction"];
  onCancelAction?: Props["onCancelAction"];
  busy: boolean;
  preview?: boolean;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const kindIcon = TASK_KIND_ICON[task.kind];
  const done = task.status === "DONE";
  const cancelled = task.status === "CANCELLED";
  const open = task.status === "OPEN";
  const overdue = open && task.dueReached;
  // Decision 10: until what it waits for is done, the task is not its assignee's yet — said in words,
  // with the names, rather than drawn as an ordinary open task.
  const waiting = task.status === "WAITING";
  const waitingFor = (task.waitingFor ?? []).map((t) => t.name ?? "another task").join(", ");
  const live = open || waiting;

  return (
    <li className="flex items-start gap-3 px-4 py-3" data-testid="task-row">
      {done ? (
        <Icon icon={CheckmarkCircle02Icon} className="mt-0.5 text-status-approved-icon" label="Done" />
      ) : waiting ? (
        <Icon icon={HourglassIcon} className="mt-0.5 text-tertiary" label="Waiting" />
      ) : (
        <Icon icon={CircleIcon} className="mt-0.5 text-tertiary" label={cancelled ? "Cancelled" : "Open"} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-medium ${cancelled ? "line-through text-tertiary" : waiting ? "text-tertiary" : ""}`}>{task.title}</span>
          <Badge variant="outline">
            <Icon icon={kindIcon} size="sm" className="size-3.5" />
            {TASK_KIND_LABELS[task.kind]}
          </Badge>
          {task.processType && <Badge variant="outline">{PROCESS_TYPE_LABELS[task.processType]}</Badge>}
          {overdue && <StatusBadge status="pending" label="Due" size="sm" />}
          {cancelled && <Badge variant="outline">Cancelled</Badge>}
          {waiting && (
            <Badge variant="outline" className="gap-1 text-tertiary">
              <Icon icon={HourglassIcon} size="sm" />
              {waitingFor ? `Waiting for ${waitingFor}` : "Waiting"}
            </Badge>
          )}
        </div>
        {task.description && <p className="mt-1 whitespace-pre-wrap text-body text-tertiary">{task.description}</p>}
        <p className="mt-1 text-hint text-tertiary">
          {[
            task.dueDate ? `${waiting ? "Planned for" : "Due"} ${formatDisplayDate(task.dueDate, { style: "medium" })}` : null,
            showSubject && task.subject ? `About ${task.subject.name ?? ""}` : null,
            showAssignee ? `Done by ${task.assignee?.name ?? "nobody"}` : null,
            done && task.completedAt ? `Done ${formatDisplayDate(task.completedAt, { style: "medium" })}` : null,
          ].filter(Boolean).join(" · ")}
        </p>
        {task.kind === "FILL_FIELDS" && task.fields && (
          <p className="mt-1 text-hint text-tertiary">
            {task.fields.map((f) => `${f.name ?? "Field"}${f.filled ? " ✓" : ""}`).join(", ")}
          </p>
        )}
        {(task.kind === "DOCUMENT" || requiresFile(task)) && task.category && (
          <p className="mt-1 text-hint text-tertiary">A file in {task.category.name ?? "the named category"}</p>
        )}
        <TaskMaterials materials={task.materials ?? []} onOpenFile={openFile} />

        {open && (
          <TaskBody task={task} mine={mine} canComplete={canComplete} busy={busy} preview={preview}
            onCompleteAction={onCompleteAction} onChangedAction={onChangedAction} />
        )}
        {done && task.kind === "APPROVE_REVIEW" && mine && (
          <Link href={`/reviews/steps/by-task/${task.id}`} className="mt-2 block w-fit text-hint text-accent-text underline-offset-4 hover:underline">
            See the review
          </Link>
        )}
        {done && task.kind === "REVIEW" && mine && (
          <Link href={`/reviews/write/by-task/${task.id}`} className="mt-2 block w-fit text-hint text-accent-text underline-offset-4 hover:underline">
            See the review
          </Link>
        )}
        {done && task.kind === "QUESTIONNAIRE" && (
          <Link href={`/organization/people/${task.subject.id}/forms`} className="mt-2 block w-fit text-hint text-accent-text underline-offset-4 hover:underline">
            See the answers
          </Link>
        )}

        {!preview && <button
          type="button"
          className="mt-2 inline-flex items-center gap-1 text-hint text-tertiary hover:text-primary"
          aria-expanded={commentsOpen}
          onClick={() => setCommentsOpen((o) => !o)}
        >
          <Icon icon={Message01Icon} size="sm" />
          {task.commentCount > 0 ? `Comments (${task.commentCount})` : "Comment"}
        </button>}
        {commentsOpen && (
          <TaskComments
            load={() => loadComments(task.id)}
            send={async (body) => {
              const res = await addTaskCommentAction({ id: task.id, body });
              if (res.status === ActionStatus.SUCCESS) await onChangedAction?.();
              return res;
            }}
          />
        )}
      </div>
      {live && !preview && (onEditAction || onCancelAction) && (
        <RowActionsMenu label="Task actions" className="w-48">
          {onEditAction && (
            <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" className="text-tertiary" />} onClick={() => onEditAction(task)}>
              Edit task
            </RowAction>
          )}
          {onCancelAction && (
            <RowActionDestructive icon={<Icon icon={CancelCircleIcon} size="sm" />} onClick={() => onCancelAction(task)}>
              Cancel task
            </RowActionDestructive>
          )}
        </RowActionsMenu>
      )}
    </li>
  );
}

/** What an open task asks for, in the row. */
function TaskBody({ task, mine, canComplete, busy, preview, onCompleteAction, onChangedAction }: {
  task: Task;
  mine: boolean;
  canComplete: boolean;
  busy: boolean;
  preview?: boolean;
  onCompleteAction?: Props["onCompleteAction"];
  onChangedAction?: Props["onChangedAction"];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answering, setAnswering] = useState(false);
  const disabled = busy || working;
  // What would act; in a preview it never does, while the fields stay usable.
  const act = disabled || Boolean(preview);

  const run = async (body: () => Promise<void>) => {
    setWorking(true);
    setError(null);
    try {
      await body();
    } catch (e) {
      setError(messageForError(e));
    } finally {
      setWorking(false);
    }
  };

  /** Into the person's Documents, under the task's category: one place for files (B2). */
  const upload = async (picked: File) =>
    documentService.uploadPersonalDocument({ userId: task.subject.id, file: picked, categoryId: task.category?.id ?? null });

  // A review is written on its own page and closes when it is submitted there (REVIEWS_DESIGN.md § 8.1).
  if (task.kind === "REVIEW") {
    if (!mine || preview) return null;
    return (
      <div className="mt-3">
        <Button asChild size="sm" variant="secondary">
          <Link href={`/reviews/write/by-task/${task.id}`} className="no-underline">Write the review</Link>
        </Button>
      </div>
    );
  }

  // The steps of a review are done on their own pages, and close there (REVIEWS_PLAN.md 10.2–10.3).
  if (task.kind === "NOMINATE_PEERS" || task.kind === "APPROVE_PEERS" || task.kind === "APPROVE_REVIEW") {
    if (!mine || preview) return null;
    const label = task.kind === "NOMINATE_PEERS" ? "Nominate peers" : task.kind === "APPROVE_PEERS" ? "Approve peers" : "Open the review";
    return (
      <div className="mt-3">
        <Button asChild size="sm" variant="secondary">
          <Link href={`/reviews/steps/by-task/${task.id}`} className="no-underline">{label}</Link>
        </Button>
      </div>
    );
  }

  if (task.kind === "TODO" && requiresFile(task)) {
    if (!onCompleteAction || !canComplete) return null;
    return (
      <div className="mt-3 space-y-2">
        <FilePickButton file={file} disabled={disabled} onPickAction={setFile} />
        <Button type="button" size="sm" variant="secondary" disabled={act || !file}
          onClick={() => file && run(async () => {
            const doc = await upload(file);
            await onCompleteAction(task, doc.id);
          })}
        >
          Attach and mark done
        </Button>
        <FormError message={error} />
      </div>
    );
  }

  if (task.kind === "TODO" || task.kind === "ACKNOWLEDGE") {
    // An acknowledgement is only its assignee's to give; somebody else sees it waiting for them.
    if (task.kind === "ACKNOWLEDGE" && !mine) {
      return <p className="mt-2 text-hint text-tertiary">Waiting for {task.assignee?.name ?? "its assignee"} to confirm they have read it.</p>;
    }
    if (!onCompleteAction || !canComplete) return null;
    return (
      <div className="mt-3">
        <Button type="button" size="sm" variant="secondary" disabled={act} onClick={() => run(async () => { await onCompleteAction(task); })}>
          {task.kind === "ACKNOWLEDGE" ? "I have read it" : "Mark done"}
        </Button>
        <FormError message={error} />
      </div>
    );
  }

  if (task.kind === "DOCUMENT") {
    return (
      <div className="mt-3 space-y-2">
        <FilePickButton file={file} disabled={disabled} onPickAction={setFile} />
        <Button type="button" size="sm" variant="secondary" disabled={act || !file}
          onClick={() => file && run(async () => {
            const doc = await upload(file);
            // With no category the file closes the task itself; with one, its arrival does (the listener).
            if (!task.category && onCompleteAction) await onCompleteAction(task, doc.id);
            else await onChangedAction?.();
          })}
        >
          Upload
        </Button>
        <FormError message={error} />
      </div>
    );
  }

  if (task.kind === "FILL_FIELDS") {
    const fields = task.fields ?? [];
    if (!canFillInPlace(fields)) {
      return (
        <Button size="sm" variant="secondary" className="mt-3" asChild>
          <Link href={`/organization/people/${task.subject.id}/personal`}>Fill in on the profile</Link>
        </Button>
      );
    }
    return (
      <div className="mt-3 space-y-3">
        {fields.map((f) => (
          <TaskFieldInput key={f.id}
            field={{ ...f, isFilled: f.filled }}
            value={values[f.id]}
            onChange={(v) => setValues((all) => ({ ...all, [f.id]: v }))}
            disabled={disabled}
          />
        ))}
        <Button type="button" size="sm" variant="secondary" disabled={act || Object.keys(values).length === 0}
          onClick={() => run(async () => {
            const res = await updateUserAttributesAction({ userId: task.subject.id, values });
            if (res.status !== ActionStatus.SUCCESS) {
              setError(res.errorMessage ?? null);
              return;
            }
            setValues({});
            await onChangedAction?.();
          })}
        >
          Save
        </Button>
        <FormError message={error} />
      </div>
    );
  }

  // A questionnaire: only its assignee answers, once.
  if (!mine) {
    return <p className="mt-2 text-hint text-tertiary">Waiting for {task.assignee?.name ?? "its assignee"} to answer.</p>;
  }
  return answering ? (
    <div className="mt-3">
      <QuestionnaireForm taskId={task.id} questions={task.questions ?? []} sendDisabled={preview}
        onSubmit={async (answers) => {
          const res = await answerQuestionnaireAction({ id: task.id, answers });
          if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "The answers could not be sent.";
          await onChangedAction?.();
          return null;
        }}
      />
    </div>
  ) : (
    <Button type="button" size="sm" variant="secondary" className="mt-3" onClick={() => setAnswering(true)}>
      Answer
    </Button>
  );
}

async function loadComments(taskId: string): Promise<{ status: ActionStatus; data?: TaskComment[]; errorMessage?: string }> {
  try {
    return { status: ActionStatus.SUCCESS, data: await internalApiClient.get<TaskComment[]>(`/tasks/${taskId}/comments`) };
  } catch (e) {
    return { status: ActionStatus.ERROR, errorMessage: messageForError(e) };
  }
}

async function openFile(material: Material) {
  if (!material.fileId) return;
  try {
    const res = await internalApiClient.fetch(`/lifecycle/files/${material.fileId}/download`, { method: "GET" });
    saveBlob(await res.blob(), material.name ?? "file");
  } catch (e) {
    showError(e);
  }
}

/** Shown beside a task the person it goes to cannot do as things stand (C4). */
export function AccessWarning({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-hint text-status-pending-text">
      <Icon icon={Alert02Icon} size="sm" />
      {text}
    </span>
  );
}
