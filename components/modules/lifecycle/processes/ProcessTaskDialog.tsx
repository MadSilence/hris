"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/public/desact/src/components/ui/select";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { DatePicker } from "@/components/ui/DatePicker";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { addProcessTaskAction, updateProcessTaskAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { TaskKindConfigFields } from "@/components/modules/lifecycle/templates/canvas/TaskKindConfigFields";
import {
  ASSIGNEE_KIND_LABELS,
  EDITABLE_TASK_KINDS,
  TASK_KIND_LABELS,
  assigneeKindLabel,
  type Material,
  type Process,
  type Question,
  type Task,
  type TaskKind,
  type TemplateAssigneeKind,
} from "@/models/lifecycle";

type Props = {
  process: Process;
  /** The task being changed; null to add one. */
  task: Task | null;
  open: boolean;
  onCloseAction: () => void;
  onSavedAction: () => void | Promise<void>;
};

type Form = {
  title: string;
  description: string;
  kind: TaskKind;
  dueDate: string;
  assigneeKind: TemplateAssigneeKind;
  assignee: PickedUser | null;
  attributeIds: string[];
  categoryId: string | null;
  materials: Material[];
  questions: Question[];
};

const formOf = (process: Process, task: Task | null): Form => ({
  title: task?.title ?? "",
  description: task?.description ?? "",
  kind: task?.kind ?? "TODO",
  dueDate: task?.dueDate ?? process.anchorDate,
  assigneeKind: task && task.assigneeKind !== "LINE_MANAGER" ? task.assigneeKind : "SPECIFIC_USER",
  assignee: task?.assigneeKind === "SPECIFIC_USER" && task.assignee
    ? { id: task.assignee.id, firstName: task.assignee.name ?? "" } : null,
  attributeIds: [],
  categoryId: null,
  materials: [],
  questions: [],
});

/**
 * One task of a running process, added or changed (DECISIONS.md § "Lifecycle tasks", C2). Its date is a day on
 * the calendar; the backend keeps it as an offset from the process's date, so moving that date moves this task
 * with the others. A new task follows the template's rules; a changed one keeps its kind and what it asks for.
 */
export function ProcessTaskDialog({ process, task, open, onCloseAction, onSavedAction }: Props) {
  const adding = task === null;
  const [form, setForm] = useState<Form>(() => formOf(process, task));
  const [initial, setInitial] = useState<Form>(form);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next = formOf(process, task);
    setForm(next);
    setInitial(next);
    setError(null);
    setConfirmingCancel(false);
  }, [open, process, task]);

  const patch = (p: Partial<Form>) => setForm((f) => ({ ...f, ...p }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const requestClose = () => {
    if (busy) return;
    if (dirty) {
      setConfirmingCancel(true);
      return;
    }
    onCloseAction();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) return setError("Give the task a title.");
    if (form.assigneeKind === "SPECIFIC_USER" && !form.assignee) return setError("Choose who does it.");
    setBusy(true);
    try {
      const assigneeUserId = form.assigneeKind === "SPECIFIC_USER" ? form.assignee?.id ?? null : null;
      const res = adding
        ? await addProcessTaskAction({
          id: process.id,
          body: {
            kind: form.kind,
            title: form.title.trim(),
            description: form.description.trim() || null,
            dueDate: form.dueDate || null,
            assigneeKind: form.assigneeKind,
            assigneeUserId,
            config: {
              attributeIds: form.attributeIds,
              categoryId: form.categoryId,
              materials: form.materials.length ? form.materials : null,
              questions: form.kind === "QUESTIONNAIRE" ? form.questions : null,
            },
          },
        })
        : await updateProcessTaskAction({
          id: process.id,
          taskId: task.id,
          body: {
            title: form.title.trim(),
            description: form.description,
            dueDate: form.dueDate || null,
            assigneeKind: form.assigneeKind,
            assigneeUserId,
          },
        });
      if (res.status !== ActionStatus.SUCCESS) {
        setError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      await onSavedAction();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) requestClose(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{adding ? "Add Task" : "Edit Task"}</DialogTitle>
              <DialogDescription>
                {adding
                  ? "Its person hears about it at once. It is dated from this process, so moving the process's date moves it too."
                  : "A new assignee hears about it; what the task asks for stays as it is."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <RequiredLabel htmlFor="process-task-title" required>Title</RequiredLabel>
              <Input id="process-task-title" value={form.title} disabled={busy} onChange={(e) => patch({ title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="process-task-description">Description</Label>
              <Textarea id="process-task-description" value={form.description} disabled={busy}
                onChange={(e) => patch({ description: e.target.value })} />
            </div>

            {adding && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="process-task-kind">Kind</Label>
                  <Select value={form.kind} disabled={busy}
                    onValueChange={(v) => patch({ kind: v as TaskKind, categoryId: null, attributeIds: [], questions: [] })}>
                    <SelectTrigger id="process-task-kind"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EDITABLE_TASK_KINDS.map((k) => (
                        <SelectItem key={k} value={k}>{TASK_KIND_LABELS[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <TaskKindConfigFields
                  idPrefix="process-task"
                  kind={form.kind}
                  type={process.type}
                  attributeIds={form.attributeIds}
                  categoryId={form.categoryId}
                  materials={form.materials}
                  questions={form.questions}
                  disabled={busy}
                  onChange={(p) => patch(p)}
                />
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="process-task-due">Due</Label>
              <DatePicker id="process-task-due" value={form.dueDate} onChange={(v) => patch({ dueDate: v })} disabled={busy} ariaLabel="Due" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="process-task-assignee">Done By</Label>
              <Select value={form.assigneeKind} disabled={busy}
                onValueChange={(v) => patch({ assigneeKind: v as TemplateAssigneeKind })}>
                <SelectTrigger id="process-task-assignee"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ASSIGNEE_KIND_LABELS) as TemplateAssigneeKind[]).map((k) => (
                    <SelectItem key={k} value={k}>{assigneeKindLabel(k, process.type)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.assigneeKind === "SPECIFIC_USER" && (
                <UserPickerField value={form.assignee} onChange={(u) => patch({ assignee: u })} disabled={busy} />
              )}
            </div>

            <FormError message={error} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={requestClose} disabled={busy}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? "Saving…" : adding ? "Add Task" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmCancelModal
        isOpen={confirmingCancel}
        onCancelAction={() => setConfirmingCancel(false)}
        onConfirmAction={() => {
          setConfirmingCancel(false);
          onCloseAction();
        }}
      />
    </>
  );
}
