"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Copy, Heading, Plus, Trash2 } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { StickyPageBar } from "@/components/layout/StickyPageBar";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FormError } from "@/components/feedback/FormError";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { useCanAccess } from "@/components/auth/useAccess";
import { showActionError, showSuccess } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useUnsavedChangesGuard } from "@/components/modules/automations/builder/useUnsavedChangesGuard";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import {
  archiveReviewFormAction,
  deleteReviewFormAction,
  duplicateReviewFormAction,
  saveReviewFormAction,
  unarchiveReviewFormAction,
} from "@/components/modules/reviews/actions/reviewFormActions";
import { useInvalidateReviewForms, useReviewForm } from "@/components/modules/reviews/hooks";
import { REVIEW_QUESTION_TYPE_LABELS, type ReviewForm, type ReviewQuestionType } from "@/models/reviews";
import { copyOf, draftOf, markOverall, move, newQuestion, problemsOf, sameDraft, toWrite, type Draft } from "./draft";
import { QuestionCard } from "./QuestionCard";
import { MentionField } from "./MentionField";
import { FormPreview } from "./FormPreview";

const FORMS_HREF = "/reviews/forms";

/**
 * Reviews → Forms → one form (REVIEWS_DESIGN.md § 4). The whole form is edited here and saved as one
 * thing, with the version it was opened with; Preview shows it as a reviewer will see it.
 *
 * Read-only for somebody without EDIT, and for an archived form until it is unarchived.
 */
export function ReviewFormEditorContainer({ formId }: { formId: string }) {
  const router = useRouter();
  const form = useReviewForm(formId);
  const invalidate = useInvalidateReviewForms();
  const canEdit = useCanAccess("REVIEWS.FORM", "EDIT");
  const canManage = useCanAccess("REVIEWS.FORM", "MANAGE");

  const [baseline, setBaseline] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [version, setVersion] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [tab, setTab] = useState("questions");
  // An entry just added is empty by nature; it is called unfinished only once a save is tried.
  const [showProblems, setShowProblems] = useState(false);
  const [confirm, setConfirm] = useState<"archive" | "delete" | null>(null);

  // The draft follows the server while nothing is typed — after a save, an archive, an unarchive, each of
  // which moves the version — and never while something is, which a background refetch would throw away.
  useEffect(() => {
    if (!form.data) return;
    if (version === null || !draft || !baseline || sameDraft(draft, baseline)) adopt(form.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.data]);

  const adopt = (f: ReviewForm) => {
    const d = draftOf(f);
    setBaseline(d);
    setDraft(d);
    setVersion(f.version);
  };

  const archived = Boolean(form.data?.archivedAt);
  const readOnly = !canEdit || archived;
  const dirty = Boolean(draft && baseline && !sameDraft(draft, baseline));
  const guard = useUnsavedChangesGuard(dirty && !readOnly);
  const problems = useMemo(() => (draft ? problemsOf(draft.questions) : {}), [draft]);
  const problemCount = Object.keys(problems).length;

  if (form.error) return <div className="mx-auto max-w-4xl"><ErrorState error={form.error} /></div>;
  if (!draft || !form.data) {
    return (
      <div className="mx-auto max-w-4xl space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const patch = (p: Partial<Draft>) => setDraft({ ...draft, ...p });
  const setQuestions = (questions: Draft["questions"]) => patch({ questions });
  const add = (type: ReviewQuestionType) => setQuestions([...draft.questions, newQuestion(type)]);

  const gateReason = !dirty
    ? null
    : !draft.name.trim()
      ? "Give the form a name to save it."
      : showProblems && problemCount > 0
        ? problemCount === 1 ? "One question is not finished yet." : `${problemCount} questions are not finished yet.`
        : null;

  const save = async () => {
    setSaveError(null);
    setNameError(null);
    if (problemCount > 0) {
      setShowProblems(true);
      setTab("questions");
      return;
    }
    setSaving(true);
    try {
      const res = await saveReviewFormAction({ id: formId, body: toWrite(draft, version) });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        if (res.fieldErrors?.name) setNameError(res.fieldErrors.name);
        else setSaveError(res.errorMessage ?? "Something went wrong.");
        return;
      }
      adopt(res.data);
      setShowProblems(false);
      await invalidate();
      showSuccess("Form saved.");
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (result: Promise<{ status: ActionStatus; errorMessage?: string }>) => {
    const res = await result;
    if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? "Something went wrong.";
    await invalidate();
    return null;
  };

  const duplicate = async () => {
    const res = await duplicateReviewFormAction(formId);
    if (res.status !== ActionStatus.SUCCESS || !res.data) {
      showActionError(res);
      return;
    }
    await invalidate();
    router.push(`${FORMS_HREF}/${res.data.id}`);
  };

  const unarchive = async () => {
    const problem = await runAction(unarchiveReviewFormAction(formId));
    if (problem) showActionError({ errorMessage: problem });
  };

  let number = 0;
  const numbers = draft.questions.map((q) => (q.type === "SECTION" ? null : ++number));

  return (
    <Tabs value={tab} onValueChange={setTab} className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16">
      <StickyPageBar className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SettingsPageHeader title={form.data.name} backHref={FORMS_HREF} className="min-w-0 flex-1" />
          {archived && <StatusBadge status="archived" />}
          <div className="flex items-center gap-2">
            {!readOnly && (
              <Button type="button" onClick={() => void save()} disabled={!dirty || saving || !draft.name.trim()}>
                {saving ? "Saving…" : "Save"}
              </Button>
            )}
            {(canEdit || canManage) && (
              <RowActionsMenu label="Form Actions">
                {canEdit && (
                  <RowAction icon={<Copy className="h-4 w-4 text-muted-foreground" />} onClick={() => void duplicate()}>
                    Duplicate
                  </RowAction>
                )}
                {canManage && (archived ? (
                  <RowAction icon={<ArchiveRestore className="h-4 w-4 text-muted-foreground" />} onClick={() => void unarchive()}>
                    Unarchive
                  </RowAction>
                ) : (
                  <RowAction icon={<Archive className="h-4 w-4 text-muted-foreground" />} onClick={() => setConfirm("archive")}>
                    Archive
                  </RowAction>
                ))}
                {canManage && (
                  <RowActionDestructive icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirm("delete")}>
                    Delete
                  </RowActionDestructive>
                )}
              </RowActionsMenu>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="grid w-full max-w-xs grid-cols-2 bg-brown-50">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          {!readOnly && (gateReason || dirty) && (
            <p className="text-xs text-muted-foreground">{gateReason ?? "You have unsaved changes."}</p>
          )}
        </div>
      </StickyPageBar>
      {archived && (
        <p className="rounded-lg border border-brown-100 bg-brown-50/60 px-4 py-3 text-sm text-brown-800">
          This form is archived and cannot be changed or chosen for a review cycle.
          {canManage && " Unarchive it to edit it."}
        </p>
      )}
      <FormError message={saveError} />

        <TabsContent value="questions" className="mt-0 space-y-4">
          <section className="space-y-4 rounded-xl border border-brown-100 bg-white p-5">
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="review-form-name" required>Name</RequiredLabel>
              <Input
                id="review-form-name"
                value={draft.name}
                disabled={readOnly}
                aria-invalid={nameError ? true : undefined}
                onChange={(e) => { patch({ name: e.target.value }); setNameError(null); }}
              />
              {nameError && <p role="alert" className="text-xs text-destructive">{nameError}</p>}
            </div>
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="review-form-description">Introduction</RequiredLabel>
              <MentionField
                id="review-form-description"
                multiline
                rows={2}
                value={draft.description}
                disabled={readOnly}
                onChange={(description) => patch({ description })}
              />
              <p className="text-xs text-muted-foreground">
                Shown to the reviewer above the questions. Here and in every question, type @ to name the person
                reviewed (@subject, @subjectFullName), their manager (@manager) or the cycle (@cycle).
              </p>
            </div>
          </section>

          {draft.questions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-brown-200 px-6 py-10 text-center">
              <p className="text-sm font-medium text-brown-900">No questions yet</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                {readOnly
                  ? "Nobody has added a question to this form."
                  : "Add the questions a reviewer answers. Group them under sections, and type @ where a name belongs: @subject for the person reviewed, @manager for their manager, @cycle for the cycle."}
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {draft.questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  number={numbers[i]}
                  first={i === 0}
                  last={i === draft.questions.length - 1}
                  readOnly={readOnly}
                  problem={showProblems ? problems[q.id] : undefined}
                  onChange={(next) => setQuestions(draft.questions.map((x) => (x.id === q.id ? next : x)))}
                  onOverallChange={(on) => setQuestions(markOverall(draft.questions, q.id, on))}
                  onMove={(by) => setQuestions(move(draft.questions, i, by))}
                  onDuplicate={() => setQuestions([...draft.questions.slice(0, i + 1), copyOf(q), ...draft.questions.slice(i + 1)])}
                  onRemove={() => setQuestions(draft.questions.filter((x) => x.id !== q.id))}
                />
              ))}
            </ol>
          )}

          {!readOnly && (
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Add Question
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {(Object.keys(REVIEW_QUESTION_TYPE_LABELS) as (keyof typeof REVIEW_QUESTION_TYPE_LABELS)[]).map((t) => (
                    <DropdownMenuItem key={t} onSelect={() => add(t)}>{REVIEW_QUESTION_TYPE_LABELS[t]}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button type="button" variant="ghost" className="gap-1.5 text-brown-700" onClick={() => add("SECTION")}>
                <Heading className="h-4 w-4" />
                Add Section
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <FormPreview name={draft.name} description={draft.description} questions={draft.questions} />
        </TabsContent>

      <ConfirmDialog
        open={confirm === "archive"}
        title="Archive Form"
        confirmLabel="Archive"
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          // Unsaved changes are dropped first, so the archived form is shown as it is saved.
          if (baseline) setDraft(baseline);
          const problem = await runAction(archiveReviewFormAction(formId));
          if (!problem) setConfirm(null);
          return problem;
        }}
      >
        <p>
          <strong>{form.data.name}</strong> can no longer be chosen for a review cycle.
          {dirty && " Unsaved changes on this page are discarded."} You can unarchive it later.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm === "delete"}
        title="Delete Form"
        confirmLabel="Delete"
        destructive
        onCancelAction={() => setConfirm(null)}
        onConfirmAction={async () => {
          const problem = await runAction(deleteReviewFormAction(formId));
          if (problem) return problem;
          setConfirm(null);
          setBaseline(draft);
          router.push(FORMS_HREF);
          return null;
        }}
      >
        <p>
          <strong>{form.data.name}</strong> and its questions are removed. This cannot be undone.
        </p>
      </ConfirmDialog>

      <ConfirmCancelModal
        isOpen={guard.pendingHref !== null}
        title="Leave Without Saving?"
        description="The changes to this form are only on this page. Leaving now discards them."
        cancelText="Stay"
        confirmText="Leave"
        onCancelAction={guard.stay}
        onConfirmAction={guard.leave}
      />
    </Tabs>
  );
}
