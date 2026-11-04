"use client";

import { Illustration } from "@/components/illustrations/Illustration";
import { Progress } from "@/components/desact/progress";
import React, { useState } from "react";
import { CheckmarkCircle02Icon, CircleIcon, Message01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FormError } from "@/components/feedback/FormError";
import { showError } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import {
  preboardingAnswerAction,
  preboardingCommentAction,
  preboardingCommentsAction,
  preboardingCompleteAction,
  preboardingDocumentAction,
  preboardingFieldsAction,
} from "@/components/modules/lifecycle/actions/preboardingActions";
import { TASK_KIND_LABELS, describeDue, requiresFile, type Material, type PreboardingPage } from "@/models/lifecycle";
import { TaskFieldInput } from "@/components/modules/lifecycle/tasks/TaskFieldInput";
import { FilePickButton } from "@/components/modules/lifecycle/shared/FilePickButton";
import { TaskMaterials, saveBlob } from "@/components/modules/lifecycle/tasks/TaskMaterials";
import { TaskComments } from "@/components/modules/lifecycle/tasks/TaskComments";
import { QuestionnaireForm } from "@/components/modules/lifecycle/tasks/QuestionnaireForm";

type PageTask = PreboardingPage["tasks"][number];

/**
 * A material file, through the page's own route: the token travels in the body, never in the address, and
 * the backend hands out only a file one of the joiner's own tasks names.
 */
const openFile = (token: string) => async (material: Material) => {
  if (!material.fileId) return;
  try {
    // Raw fetch on purpose: the page has no session, so InternalApiClient's renewal has nothing to renew.
    const res = await fetch(`/api/public/preboarding/files/${material.fileId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error("This file is not available any more.");
    saveBlob(await res.blob(), material.name ?? "file");
  } catch (e) {
    showError(e);
  }
};

/**
 * The joiner's preboarding page: their own tasks and nothing else — no people, no organisation
 * (design § 5.2). Each action answers with the page as it now is.
 */
export function PreboardingPageContainer({ token, initialPage, preview, onOpenFile }: {
  token: string;
  initialPage: PreboardingPage;
  /**
   * The template editor's preview: the page as the joiner will see it, its fields usable, nothing sent —
   * every button that would act stays off, and there are no comments.
   */
  preview?: boolean;
  /** How a material file opens when there is no token to fetch it with — the preview's own route. */
  onOpenFile?: (material: Material) => void;
}) {
  const [page, setPage] = useState(initialPage);
  const open = page.tasks.filter((t) => t.status === "OPEN").length;

  return (
    <div className="w-full space-y-8 py-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <Illustration scene={open === 0 ? "all-caught-up" : "onboarding"} />
        <h1 className="text-greeting">{page.firstName ? `Welcome, ${page.firstName}` : "Welcome"}</h1>
        <p className="text-body text-secondary">
          {page.companyName ? `A few things to do before you start at ${page.companyName}` : "A few things to do before you start"}
          {page.startDate ? ` on ${formatDisplayDate(page.startDate, { style: "medium" })}` : ""}.
        </p>
        {page.tasks.length > 0 && (
          <div className="flex w-full max-w-xs flex-col gap-1.5">
            <Progress value={((page.tasks.length - open) / page.tasks.length) * 100} aria-label="Tasks done" />
            <p className="text-hint text-tertiary">
              {open === 0 ? "You're all done. Thank you." : `${page.tasks.length - open} of ${page.tasks.length} done. This link stays valid, so you can come back.`}
            </p>
          </div>
        )}
      </header>

      <ul className="space-y-4">
        {page.tasks.map((task) => (
          <li key={task.id} className="space-y-3 rounded-card border border-divider bg-card p-4 shadow-card" data-testid="preboarding-task">
            <div className="flex items-start gap-3">
              {task.status === "DONE"
                ? <Icon icon={CheckmarkCircle02Icon} className="mt-0.5 text-status-approved-icon" label="Done" />
                : <Icon icon={CircleIcon} className="mt-0.5 text-tertiary" label="To do" />}
              <div className="flex-1">
                {/* The icon alone did not read as done in the walk (SWEEP S11): a finished task says so. */}
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`text-body font-medium leading-6 ${task.status === "DONE" ? "text-tertiary" : ""}`}>{task.title}</h2>
                  {task.status === "DONE" && <StatusBadge status="active" label="Done" />}
                </div>
                <p className="text-hint text-tertiary">
                  {TASK_KIND_LABELS[task.kind]} · {describeDue(task.dueKind, null)}
                  {task.dueDate ? ` · by ${formatDisplayDate(task.dueDate, { style: "medium" })}` : ""}
                </p>
                {task.description && <p className="mt-1 whitespace-pre-wrap text-body text-tertiary">{task.description}</p>}
                <TaskMaterials materials={task.materials ?? []} onOpenFile={onOpenFile ?? openFile(token)} />
              </div>
            </div>
            {task.status === "OPEN" && (
              <TaskBody token={token} task={task} onPageAction={setPage} preview={preview} />
            )}
            {!preview && <PageComments token={token} task={task} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TaskBody({ token, task, onPageAction, preview }: {
  token: string; task: PageTask; onPageAction: (p: PreboardingPage) => void; preview?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [file, setFile] = useState<File | null>(null);

  const finish = (res: { status: ActionStatus; data?: PreboardingPage; errorMessage?: string }) => {
    if (res.status === ActionStatus.SUCCESS && res.data) onPageAction(res.data);
    else setError(res.errorMessage ?? null);
  };

  if (task.kind === "QUESTIONNAIRE") {
    return (
      <div className="pl-8">
        <QuestionnaireForm taskId={task.id} questions={task.questions ?? []} sendDisabled={preview}
          onSubmit={async (answers) => {
            const res = await preboardingAnswerAction({ token, taskId: task.id, answers });
            if (res.status === ActionStatus.SUCCESS && res.data) {
              onPageAction(res.data);
              return null;
            }
            return res.errorMessage ?? "The answers could not be sent.";
          }}
        />
      </div>
    );
  }

  if ((task.kind === "TODO" && !requiresFile(task)) || task.kind === "ACKNOWLEDGE") {
    return (
      <div className="space-y-2 pl-8">
        <Button type="button"
          size="sm"
          disabled={busy || preview}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try { finish(await preboardingCompleteAction({ token, taskId: task.id })); } finally { setBusy(false); }
          }}
        >
          {task.kind === "ACKNOWLEDGE" ? "I have read it" : "Mark done"}
        </Button>
        <FormError message={error} />
      </div>
    );
  }

  // A document task, or a to-do that requires a file: the upload closes it (B2).
  if (task.kind === "DOCUMENT" || task.kind === "TODO") {
    return (
      <div className="space-y-2 pl-8">
        {task.categoryName && <Label htmlFor={`${task.id}-file`}>File: {task.categoryName}</Label>}
        <FilePickButton id={`${task.id}-file`} file={file} disabled={busy} onPickAction={setFile} />
        <Button type="button"
          size="sm"
          disabled={busy || preview || !file}
          onClick={async () => {
            if (!file) return;
            setBusy(true);
            setError(null);
            const form = new FormData();
            form.set("token", token);
            form.set("taskId", task.id);
            form.set("file", file);
            try { finish(await preboardingDocumentAction(form)); } finally { setBusy(false); }
          }}
        >
          {task.kind === "TODO" ? "Attach and mark done" : "Upload"}
        </Button>
        <FormError message={error} />
      </div>
    );
  }

  const fields = task.fields ?? [];
  return (
    <div className="space-y-3 pl-8">
      {fields.map((f) => (
        <TaskFieldInput key={f.id} field={f} value={values[f.id]} onChange={(v) => setValues((all) => ({ ...all, [f.id]: v }))} disabled={busy} />
      ))}
      <Button type="button"
        size="sm"
        disabled={busy || preview || Object.keys(values).length === 0}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try { finish(await preboardingFieldsAction({ token, taskId: task.id, values })); } finally { setBusy(false); }
        }}
      >
        Save
      </Button>
      <FormError message={error} />
    </div>
  );
}

/** The comments of one task — the preboarding's messages (C3): the joiner asks, whoever runs it answers. */
function PageComments({ token, task }: { token: string; task: PageTask }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pl-8">
      <button
        type="button"
        className="inline-flex items-center gap-1 text-hint text-tertiary hover:text-primary"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon icon={Message01Icon} size="sm" />
        {task.commentCount > 0 ? `Comments (${task.commentCount})` : "Ask a question"}
      </button>
      {open && (
        <TaskComments
          load={() => preboardingCommentsAction({ token, taskId: task.id })}
          send={(body) => preboardingCommentAction({ token, taskId: task.id, body })}
        />
      )}
    </div>
  );
}
