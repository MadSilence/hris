"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Add01Icon, Archive02Icon, ArchiveArrowUpIcon, Copy01Icon, Delete02Icon, Heading01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Skeleton } from "@/components/desact/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/desact/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/desact/dropdown-menu";
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
import { useUnsavedChangesGuard } from "@/components/hooks/useUnsavedChangesGuard";
import { ConfirmDialog } from "@/components/modules/lifecycle/shared/ConfirmDialog";
import {
  archiveReviewFormAction,
  deleteReviewFormAction,
  duplicateReviewFormAction,
  saveReviewFormAction,
  unarchiveReviewFormAction,
} from "@/components/modules/reviews/actions/reviewFormActions";
import { useInvalidateReviewForms, useReviewForm } from "@/components/modules/reviews/hooks";
import { REVIEW_QUESTION_TYPE_KEYS, type ReviewForm, type ReviewQuestionType } from "@/models/reviews";
import { copyOf, draftOf, markOverall, move, newQuestion, problemsOf, sameDraft, toWrite, type Draft } from "./draft";
import { QuestionCard } from "./QuestionCard";
import { MentionField } from "./MentionField";
import { FormPreview } from "./FormPreview";
import { FieldError } from "@/components/desact/field-error";
import { Illustration } from "@/components/illustrations";

const FORMS_HREF = "/reviews/forms";

/**
 * Reviews → Forms → one form (REVIEWS_DESIGN.md § 4). The whole form is edited here and saved as one
 * thing, with the version it was opened with; Preview shows it as a reviewer will see it.
 *
 * Read-only for somebody without EDIT, and for an archived form until it is unarchived.
 */
export function ReviewFormEditorContainer({ formId }: { formId: string }) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
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
  const problems = useMemo(() => (draft ? problemsOf(draft.questions, t) : {}), [draft, t]);
  const problemCount = Object.keys(problems).length;

  if (form.error) return <div className="mx-auto max-w-4xl"><ErrorState error={form.error} /></div>;
  if (!draft || !form.data) {
    return (
      <div className="mx-auto max-w-4xl space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32 w-full rounded-popover" />
        <Skeleton className="h-40 w-full rounded-popover" />
      </div>
    );
  }

  const patch = (p: Partial<Draft>) => setDraft({ ...draft, ...p });
  const setQuestions = (questions: Draft["questions"]) => patch({ questions });
  const add = (type: ReviewQuestionType) => setQuestions([...draft.questions, newQuestion(type)]);

  const gateReason = !dirty
    ? null
    : !draft.name.trim()
      ? t("editor.gate.name")
      : showProblems && problemCount > 0
        ? t("editor.gate.unfinished", { count: problemCount })
        : null;

  const save = async () => {
    // Nothing changed: nothing to send.
    if (!dirty || saving) return;
    setSaveError(null);
    setNameError(null);
    if (!draft.name.trim()) {
      setNameError(tCommon("validation.enterName"));
      setTab("questions");
      return;
    }
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
        else setSaveError(res.errorMessage ?? t("error.generic"));
        return;
      }
      adopt(res.data);
      setShowProblems(false);
      await invalidate();
      showSuccess(t("editor.saved"));
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (result: Promise<{ status: ActionStatus; errorMessage?: string }>) => {
    const res = await result;
    if (res.status !== ActionStatus.SUCCESS) return res.errorMessage ?? t("error.generic");
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
              <Button type="button" onClick={() => void save()} disabled={saving} loading={saving} loadingLabel={tCommon("actions.saving")}>
                {tCommon("actions.save")}
              </Button>
            )}
            {(canEdit || canManage) && (
              <RowActionsMenu label={t("forms.row.actions")}>
                {canEdit && (
                  <RowAction icon={<Icon icon={Copy01Icon} size="sm" className="text-tertiary" />} onClick={() => void duplicate()}>
                    {tCommon("actions.duplicate")}
                  </RowAction>
                )}
                {canManage && (archived ? (
                  <RowAction icon={<Icon icon={ArchiveArrowUpIcon} size="sm" className="text-tertiary" />} onClick={() => void unarchive()}>
                    {t("forms.row.unarchive")}
                  </RowAction>
                ) : (
                  <RowAction icon={<Icon icon={Archive02Icon} size="sm" className="text-tertiary" />} onClick={() => setConfirm("archive")}>
                    {tCommon("actions.archive")}
                  </RowAction>
                ))}
                {canManage && (
                  <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setConfirm("delete")}>
                    {tCommon("actions.delete")}
                  </RowActionDestructive>
                )}
              </RowActionsMenu>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="questions">{t("editor.tabs.questions")}</TabsTrigger>
            <TabsTrigger value="preview">{tCommon("actions.preview")}</TabsTrigger>
          </TabsList>
          {!readOnly && (gateReason || dirty) && (
            <p className="text-hint text-tertiary">{gateReason ?? t("editor.unsaved")}</p>
          )}
        </div>
      </StickyPageBar>
      {archived && (
        <p className="rounded-card border border-divider bg-subtle/60 px-4 py-3 text-body text-primary">
          {canManage ? t("editor.archivedManage") : t("editor.archived")}
        </p>
      )}
      <FormError message={saveError} />

        <TabsContent value="questions" className="mt-0 space-y-4">
          <section className="space-y-4 rounded-card border border-divider bg-card p-5">
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="review-form-name" required>{tCommon("fields.name")}</RequiredLabel>
              <Input
                id="review-form-name"
                value={draft.name}
                disabled={readOnly}
                aria-invalid={nameError ? true : undefined}
                onChange={(e) => { patch({ name: e.target.value }); setNameError(null); }}
              />
              {nameError && <FieldError>{nameError}</FieldError>}
            </div>
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="review-form-description">{t("editor.introduction")}</RequiredLabel>
              <MentionField
                id="review-form-description"
                multiline
                rows={2}
                value={draft.description}
                disabled={readOnly}
                onChange={(description) => patch({ description })}
              />
              <p className="text-hint text-tertiary">
                {t("editor.introductionHint")}
              </p>
            </div>
          </section>

          {draft.questions.length === 0 ? (
            <div className="flex flex-col items-center rounded-card border border-dashed border-divider px-6 py-10 text-center">
              <Illustration scene="forms-s" size="s" className="mb-3" />
              <p className="text-body font-medium text-primary">{t("editor.empty.title")}</p>
              <p className="mx-auto mt-1 max-w-md text-body text-tertiary">
                {readOnly
                  ? t("editor.empty.readOnly")
                  : t("editor.empty.description")}
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
                  <Button type="button" variant="secondary" className="gap-1.5">
                    <Icon icon={Add01Icon} size="sm" />
                    {t("editor.addQuestion")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {(Object.keys(REVIEW_QUESTION_TYPE_KEYS) as (keyof typeof REVIEW_QUESTION_TYPE_KEYS)[]).map((type) => (
                    <DropdownMenuItem key={type} onSelect={() => add(type)}>{t(REVIEW_QUESTION_TYPE_KEYS[type])}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button type="button" variant="ghost" className="gap-1.5 text-secondary" onClick={() => add("SECTION")}>
                <Icon icon={Heading01Icon} size="sm" />
                {t("editor.addSection")}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <FormPreview name={draft.name} description={draft.description} questions={draft.questions} />
        </TabsContent>

      <ConfirmDialog
        open={confirm === "archive"}
        title={t("forms.archiveDialog.title")}
        confirmLabel={tCommon("actions.archive")}
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
          {t.rich(dirty ? "editor.archiveBodyDirty" : "forms.archiveDialog.body", {
            name: form.data.name,
            b: (c) => <strong>{c}</strong>,
          })}
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm === "delete"}
        title={t("forms.deleteDialog.title")}
        confirmLabel={tCommon("actions.delete")}
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
          {t.rich("forms.deleteDialog.body", { name: form.data.name, b: (c) => <strong>{c}</strong> })}
        </p>
      </ConfirmDialog>

      <ConfirmCancelModal
        isOpen={guard.pendingHref !== null}
        title={t("editor.leave.title")}
        description={t("editor.leave.description")}
        cancelText={t("editor.leave.stay")}
        confirmText={t("editor.leave.leave")}
        onCancelAction={guard.stay}
        onConfirmAction={guard.leave}
      />
    </Tabs>
  );
}
