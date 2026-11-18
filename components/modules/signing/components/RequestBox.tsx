"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { DatePicker } from "@/components/ui/DatePicker";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useDateFormatter } from "@/lib/date";
import type { Task } from "@/models/lifecycle";
import { uploadForRequestAction } from "../actions";

/** A request for a document: a DOCUMENT task outside any process — what documents-requests R07 shows. */
export const isDocumentRequest = (task: Task) => task.kind === "DOCUMENT" && task.processId === null && task.status === "OPEN";

/**
 * The person's requests on top of their own tab (documents-requests R07): what is asked, by whom, by when, the note
 * set apart, and **Upload** — which asks no folder and no category, they are the request's (R08).
 */
export function RequestBoxes({ tasks, onUploadedAction }: { tasks: Task[]; onUploadedAction: () => void }) {
  const t = useTranslations("signing");
  const formatDate = useDateFormatter();
  const [uploading, setUploading] = React.useState<Task | null>(null);
  if (tasks.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-start gap-4 rounded-card border border-accent-ring bg-accent-subtle p-4">
          <div className="min-w-0 flex-1">
            <p className="text-body font-medium text-primary">{task.title}</p>
            {task.requestedBy?.name && <p className="text-hint text-secondary">{t("requests.box.askedBy", { name: task.requestedBy.name })}</p>}
            <p className="text-hint text-secondary">
              {task.assignee?.name && task.subject.id !== task.assignee.id ? `${task.subject.name} · ` : ""}
              {task.dueDate ? t("requests.box.due", { date: formatDate(task.dueDate, { style: "medium" }) }) : null}
            </p>
            {task.description && <p className="mt-2 border-l-2 border-strong pl-2 text-body text-secondary">{task.description}</p>}
          </div>
          <Button type="button" onClick={() => setUploading(task)}>
            {t("requests.box.upload")}
          </Button>
        </div>
      ))}
      {uploading && (
        <UploadForRequestDialog
          task={uploading}
          onCloseAction={() => setUploading(null)}
          onDoneAction={() => {
            setUploading(null);
            onUploadedAction();
          }}
        />
      )}
    </div>
  );
}

function UploadForRequestDialog({ task, onCloseAction, onDoneAction }: { task: Task; onCloseAction: () => void; onDoneAction: () => void }) {
  const t = useTranslations("signing");
  const [file, setFile] = React.useState<File | null>(null);
  const [date, setDate] = React.useState("");
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!file) {
      setFileError(t("requests.upload.needFile"));
      return;
    }
    const form = new FormData();
    form.append("taskId", task.id);
    form.append("file", file);
    if (date) form.append("expiresOn", date);
    setBusy(true);
    const r = await uploadForRequestAction(form);
    setBusy(false);
    if (r.status !== ActionStatus.SUCCESS) {
      setError(r.errorMessage ?? null);
      return;
    }
    onDoneAction();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t("requests.upload.title", { what: task.title })}</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-file">{t("requests.upload.file")} *</Label>
            <Input
              id="request-file"
              type="file"
              aria-invalid={fileError ? true : undefined}
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setFileError(null);
              }}
            />
            <FieldError>{fileError}</FieldError>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-date">{t("requests.upload.validUntil")}</Label>
            <DatePicker id="request-date" value={date} onChange={setDate} />
          </div>
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onCloseAction}>
              {t("requests.cancel")}
            </Button>
            <Button type="submit" loading={busy}>
              {t("requests.upload.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
