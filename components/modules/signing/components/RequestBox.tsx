"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon, CloudUploadIcon, FileImportIcon, HourglassIcon, Upload01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { DatePicker } from "@/components/ui/DatePicker";
import { PersonAvatar } from "@/components/modules/automations/shared";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showSuccess } from "@/lib/errors/errorToast";
import { useDateFormatter } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { Task } from "@/models/lifecycle";
import { uploadForRequestAction } from "../actions";
import { FileTypeTile } from "./DocumentPieces";

/** A request for a document: a DOCUMENT task outside any process — what documents-requests R07 shows. */
export const isDocumentRequest = (task: Task) => task.kind === "DOCUMENT" && task.processId === null && task.status === "OPEN";

/**
 * The requests on top of a Documents tab (documents-requests R07, R7b, R9): one box per request, stacked — a white
 * 40 tile with the request icon, "Upload: Passport" 16/22 600, who asked (avatar 16 + name), the due date in amber,
 * the note set apart, and **Upload** (primary 36 with its icon). Shown to whoever is asked to upload, on the tab of
 * the person it is about — the person, or someone uploading for them (R7). Uploading asks no folder and no category:
 * they are the request's (R08).
 */
export function RequestBoxes({
  tasks,
  onUploadedAction,
  openTaskId,
  onOpenedAction,
}: {
  tasks: Task[];
  onUploadedAction: () => void;
  /** A request to open at once — the Home card's Upload lands here with it (R7). */
  openTaskId?: string | null;
  onOpenedAction?: () => void;
}) {
  const t = useTranslations("signing");
  const formatDate = useDateFormatter();
  const [uploading, setUploading] = React.useState<Task | null>(null);

  React.useEffect(() => {
    if (!openTaskId) return;
    const task = tasks.find((x) => x.id === openTaskId);
    if (task) {
      setUploading(task);
      onOpenedAction?.();
    }
  }, [openTaskId, tasks, onOpenedAction]);

  if (tasks.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-start gap-4 rounded-card border border-accent-muted bg-accent-subtle px-6 py-5">
          <span className="grid size-10 flex-none place-items-center rounded-control bg-card text-accent-text">
            <Icon icon={FileImportIcon} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-card-title text-primary">{t("section.upload", { what: task.title })}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-hint text-secondary">
              {task.requestedBy?.name && (
                <span className="inline-flex items-center gap-1.5">
                  <PersonAvatar name={task.requestedBy.name} size={20} className="size-4" />
                  {t("requests.box.askedBy", { name: task.requestedBy.name })}
                </span>
              )}
              {task.assignee && task.subject.id !== task.assignee.id && task.subject.name && (
                <span>{task.subject.name}</span>
              )}
              {task.dueDate && (
                <span className="inline-flex items-center gap-1 font-medium text-status-pending-text">
                  <Icon icon={HourglassIcon} size="sm" className="size-3.5 text-status-pending-icon" />
                  {t("requests.box.due", { date: formatDate(task.dueDate, { style: "medium" }) })}
                </span>
              )}
            </div>
            {task.description && <p className="mt-2 border-l-2 border-strong pl-2 text-body text-secondary">{task.description}</p>}
          </div>
          <Button type="button" onClick={() => setUploading(task)}>
            <Icon icon={Upload01Icon} size="sm" />
            {t("requests.box.upload")}
          </Button>
        </div>
      ))}
      {uploading && (
        <UploadForRequestDialog
          task={uploading}
          own={uploading.subject.id === uploading.assignee?.id}
          onCloseAction={() => setUploading(null)}
          onDoneAction={(fileName) => {
            setUploading(null);
            // R7d: the list shows the new file at once, and says so.
            showSuccess(t("requests.uploadedToast", { name: fileName }));
            onUploadedAction();
          }}
        />
      )}
    </div>
  );
}

/**
 * Upload for a request (R08, R7c): 800 wide — "Upload documents" / "To your documents", a strip naming the request,
 * the drop zone on the left with the file under it, Valid until (optional) on the right.
 */
function UploadForRequestDialog({
  task,
  own,
  onCloseAction,
  onDoneAction,
}: {
  task: Task;
  own: boolean;
  onCloseAction: () => void;
  onDoneAction: (fileName: string) => void;
}) {
  const t = useTranslations("signing");
  const tOrg = useTranslations("organization");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [date, setDate] = React.useState("");
  const [dragging, setDragging] = React.useState(false);
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
    onDoneAction(file.name);
  };

  const asker = task.requestedBy?.name?.trim().split(/\s+/)[0] ?? null;

  return (
    <Dialog open onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{tOrg("documents.upload.title")}</DialogTitle>
          <DialogDescription>
            {own ? tOrg("documents.upload.toOwn") : tOrg("documents.upload.toPerson", { name: task.subject.name ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <p className="flex items-center gap-2 rounded-popover bg-accent-subtle px-3 py-2.5 text-body font-medium text-accent-text">
            <Icon icon={FileImportIcon} size="sm" />
            {asker ? t("requests.upload.forRequest", { name: asker, what: task.title }) : t("section.upload", { what: task.title })}
          </p>
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
            <div className="flex min-w-0 flex-col gap-2">
              <div
                role="button"
                tabIndex={0}
                aria-label={tOrg("documents.upload.files")}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) {
                    setFile(dropped);
                    setFileError(null);
                  }
                }}
                className={cn(
                  "flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-1 rounded-card border border-dashed p-6 text-center",
                  dragging ? "border-accent bg-accent-subtle" : fileError ? "border-status-declined-border" : "border-field hover:bg-subtle",
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setFileError(null);
                    e.currentTarget.value = "";
                  }}
                />
                <span className="mb-2 grid size-10 place-items-center rounded-pill bg-mist text-secondary">
                  <Icon icon={CloudUploadIcon} />
                </span>
                <p className="text-body font-medium text-primary">{tOrg("documents.upload.dropHere")}</p>
                <p className="text-body text-accent-text">{tOrg("documents.upload.orChoose")}</p>
              </div>
              {file && (
                <div className="flex items-center gap-3 rounded-control border border-divider px-3 py-2">
                  <FileTypeTile mimeType={file.type} name={file.name} />
                  <span className="min-w-0 flex-1 truncate text-body text-primary" title={file.name}>{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={tOrg("documents.upload.removeFile", { name: file.name })}
                    onClick={() => setFile(null)}
                  >
                    <Icon icon={Cancel01Icon} size="sm" />
                  </Button>
                </div>
              )}
              <FieldError>{fileError}</FieldError>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="request-date">
                {t("requests.upload.validUntil")} <span className="font-normal text-tertiary">{t("expiry.optional")}</span>
              </Label>
              <DatePicker id="request-date" value={date} onChange={setDate} />
            </div>
          </div>
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onCloseAction}>
              {t("requests.cancel")}
            </Button>
            <Button type="submit" loading={busy}>
              <Icon icon={Upload01Icon} size="sm" />
              {t("requests.upload.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
