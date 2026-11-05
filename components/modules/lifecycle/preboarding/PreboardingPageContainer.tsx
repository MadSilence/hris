"use client";

import { Illustration } from "@/components/illustrations/Illustration";
import { Progress } from "@/components/desact/progress";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckmarkCircle02Icon, CircleIcon, Message01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";
import { showError } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useDateFormatter } from "@/lib/date";
import {
  preboardingAnswerAction,
  preboardingCommentAction,
  preboardingCommentsAction,
  preboardingCompleteAction,
  preboardingDocumentAction,
  preboardingFieldsAction,
} from "@/components/modules/lifecycle/actions/preboardingActions";
import { requiresFile, type Material, type PreboardingPage } from "@/models/lifecycle";
import { describeDue } from "@/components/modules/lifecycle/i18n";
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
const openFile = (token: string, unavailable: string) => async (material: Material) => {
  if (!material.fileId) return;
  try {
    // Raw fetch on purpose: the page has no session, so InternalApiClient's renewal has nothing to renew.
    const res = await fetch(`/api/public/preboarding/files/${material.fileId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error(unavailable);
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
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("lifecycle");
  const [page, setPage] = useState(initialPage);
  const open = page.tasks.filter((task) => task.status === "OPEN").length;
  const company = page.companyName;
  const date = page.startDate ? formatDisplayDate(page.startDate, { style: "medium" }) : null;
  const intro = company && date ? t("preboarding.introCompanyDate", { company, date })
    : company ? t("preboarding.introCompany", { company })
      : date ? t("preboarding.introDate", { date }) : t("preboarding.intro");

  return (
    <div className="w-full space-y-8 py-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <Illustration scene={open === 0 ? "all-caught-up" : "onboarding"} />
        <h1 className="text-greeting">{page.firstName ? t("preboarding.welcomeName", { name: page.firstName }) : t("preboarding.welcome")}</h1>
        <p className="text-body text-secondary">{intro}</p>
        {page.tasks.length > 0 && (
          <div className="flex w-full max-w-xs flex-col gap-1.5">
            <Progress value={((page.tasks.length - open) / page.tasks.length) * 100} aria-label={t("preboarding.progressLabel")} />
            <p className="text-hint text-tertiary">
              {open === 0 ? t("preboarding.allDone") : t("preboarding.progress", { done: page.tasks.length - open, total: page.tasks.length })}
            </p>
          </div>
        )}
      </header>

      <ul className="space-y-4">
        {page.tasks.map((task) => (
          <li key={task.id} className="space-y-3 rounded-card border border-divider bg-card p-4 shadow-card" data-testid="preboarding-task">
            <div className="flex items-start gap-3">
              {task.status === "DONE"
                ? <Icon icon={CheckmarkCircle02Icon} className="mt-0.5 text-status-approved-icon" label={t("shared.done")} />
                : <Icon icon={CircleIcon} className="mt-0.5 text-tertiary" label={t("preboarding.toDo")} />}
              <div className="flex-1">
                {/* The icon alone did not read as done in the walk (SWEEP S11): a finished task says so. */}
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`text-body font-medium leading-6 ${task.status === "DONE" ? "text-tertiary" : ""}`}>{task.title}</h2>
                  {task.status === "DONE" && <StatusBadge status="active" label={t("shared.done")} />}
                </div>
                <p className="text-hint text-tertiary">
                  {task.dueDate
                    ? t("preboarding.metaDate", {
                      kind: t(`taskKind.${task.kind}`),
                      due: describeDue(t, task.dueKind, null),
                      date: formatDisplayDate(task.dueDate, { style: "medium" }),
                    })
                    : t("preboarding.meta", { kind: t(`taskKind.${task.kind}`), due: describeDue(t, task.dueKind, null) })}
                </p>
                {task.description && <p className="mt-1 whitespace-pre-wrap text-body text-tertiary">{task.description}</p>}
                <TaskMaterials materials={task.materials ?? []} onOpenFile={onOpenFile ?? openFile(token, t("preboarding.fileUnavailable"))} />
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
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [file, setFile] = useState<File | null>(null);
  const [tried, setTried] = useState(false);

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
            return res.errorMessage ?? t("shared.answersNotSent");
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
          {task.kind === "ACKNOWLEDGE" ? t("shared.iHaveReadIt") : t("shared.markDone")}
        </Button>
        <FormError message={error} />
      </div>
    );
  }

  // A document task, or a to-do that requires a file: the upload closes it (B2).
  if (task.kind === "DOCUMENT" || task.kind === "TODO") {
    return (
      <div className="space-y-2 pl-8">
        {task.categoryName && <Label htmlFor={`${task.id}-file`}>{t("preboarding.fileOf", { category: task.categoryName })}</Label>}
        <FilePickButton id={`${task.id}-file`} file={file} disabled={busy} onPickAction={setFile} />
        <FieldError>{tried && !file ? t("shared.pickFile") : null}</FieldError>
        <Button type="button"
          size="sm"
          disabled={busy || preview}
          onClick={async () => {
            setTried(true);
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
          {task.kind === "TODO" ? t("shared.attachAndMarkDone") : tCommon("actions.upload")}
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
      <FieldError>{tried && Object.keys(values).length === 0 ? t("shared.fillSomething") : null}</FieldError>
      <Button type="button"
        size="sm"
        disabled={busy || preview}
        onClick={async () => {
          setTried(true);
          if (Object.keys(values).length === 0) return;
          setBusy(true);
          setError(null);
          try { finish(await preboardingFieldsAction({ token, taskId: task.id, values })); } finally { setBusy(false); }
        }}
      >
        {tCommon("actions.save")}
      </Button>
      <FormError message={error} />
    </div>
  );
}

/** The comments of one task — the preboarding's messages (C3): the joiner asks, whoever runs it answers. */
function PageComments({ token, task }: { token: string; task: PageTask }) {
  const t = useTranslations("lifecycle");
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
        {task.commentCount > 0 ? t("shared.commentsCount", { count: task.commentCount }) : t("preboarding.askQuestion")}
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
