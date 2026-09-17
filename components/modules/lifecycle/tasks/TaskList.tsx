"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, FileUp, ListChecks, TextCursorInput } from "lucide-react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { formatDisplayDate } from "@/lib/date";
import { PROCESS_TYPE_LABELS, TASK_KIND_LABELS, type Task } from "@/models/lifecycle";

const KIND_ICON = {
  CHECKLIST: ListChecks,
  FILL_FIELDS: TextCursorInput,
  DOCUMENT: FileUp,
} as const;

type Props = {
  tasks: Task[];
  /** Show whose task it is — on a process page, where tasks belong to several people. */
  showAssignee?: boolean;
  /** Show whom it is about — in the Tasks tab, where tasks are about several people. */
  showSubject?: boolean;
  onCompleteAction?: (task: Task) => void;
  canComplete?: (task: Task) => boolean;
  busyTaskId?: string | null;
};

/**
 * Tasks, one row each. A checklist is ticked here; filling in fields and uploading a document close
 * by themselves, so their row links to where that is done instead of offering a tick.
 */
export function TaskList({ tasks, showAssignee, showSubject, onCompleteAction, canComplete, busyTaskId }: Props) {
  return (
    <ul className="divide-y divide-brown-100 rounded-md border border-brown-200">
      {tasks.map((task) => {
        const Icon = KIND_ICON[task.kind];
        const done = task.status === "DONE";
        const cancelled = task.status === "CANCELLED";
        const overdue = task.status === "OPEN" && task.dueReached;
        return (
          <li key={task.id} className="flex items-start gap-3 px-4 py-3" data-testid="task-row">
            {done ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-success-600" aria-label="Done" />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" aria-label={cancelled ? "Cancelled" : "Open"} />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-medium ${cancelled ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                <Badge variant="outline" className="gap-1">
                  <Icon className="h-3 w-3" />
                  {TASK_KIND_LABELS[task.kind]}
                </Badge>
                {task.processType && <Badge variant="outline">{PROCESS_TYPE_LABELS[task.processType]}</Badge>}
                {overdue && <Badge variant="outline" className="border-warning-200 bg-warning-50 text-warning-700">Due</Badge>}
                {cancelled && <Badge variant="outline">Cancelled</Badge>}
              </div>
              {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {[
                  task.dueDate ? `Due ${formatDisplayDate(task.dueDate, { style: "medium" })}` : null,
                  showSubject && task.subject ? `About ${task.subject.name ?? ""}` : null,
                  showAssignee ? `Done by ${task.assignee?.name ?? "nobody"}` : null,
                  done && task.completedAt ? `Done ${formatDisplayDate(task.completedAt, { style: "medium" })}` : null,
                ].filter(Boolean).join(" · ")}
              </p>
              {task.kind === "FILL_FIELDS" && task.fields && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {task.fields.map((f) => `${f.name ?? "Field"}${f.filled ? " ✓" : ""}`).join(", ")}
                </p>
              )}
              {task.kind === "DOCUMENT" && task.category && (
                <p className="mt-1 text-xs text-muted-foreground">A file in {task.category.name ?? "the named category"}</p>
              )}
            </div>
            <div className="shrink-0">
              {task.status === "OPEN" && task.kind === "CHECKLIST" && onCompleteAction && (canComplete?.(task) ?? true) && (
                <Button size="sm" variant="outline" disabled={busyTaskId === task.id} onClick={() => onCompleteAction(task)}>
                  Mark Done
                </Button>
              )}
              {task.status === "OPEN" && task.kind === "FILL_FIELDS" && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/organization/people/${task.subject.id}/personal`}>Fill In</Link>
                </Button>
              )}
              {task.status === "OPEN" && task.kind === "DOCUMENT" && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/organization/people/${task.subject.id}/documents`}>Upload</Link>
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
