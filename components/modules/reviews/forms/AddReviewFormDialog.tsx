"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FileAddIcon, FileTextIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Skeleton } from "@/components/desact/skeleton";
import { cn } from "@/lib/cn";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { saveReviewFormAction } from "@/components/modules/reviews/actions/reviewFormActions";
import {
  useApplyTemplate,
  useTemplateApplication,
  useTemplatePreview,
  useTemplates,
} from "@/components/modules/settings/modules/templates/hooks";
import { FieldError } from "@/components/desact/field-error";

const LIBRARY_HREF = "/settings/general/templates?kind=REVIEW_FORM";
const BLANK = "blank";

type Props = {
  open: boolean;
  onCloseAction: () => void;
  /** The form exists now; its questions are written in the editor it opens on. */
  onAddedAction: (form: { id: string }) => void;
  /** The company's forms, to find the one a library form already made here. */
  existingForms?: { id: string; name: string }[];
};

/**
 * A new review form: blank under a name, or a copy of one of the library's forms (REVIEWS_PLAN.md 9.3)
 * — either way it opens in the editor next, where everything about it can change.
 *
 * A library form is applied like any template — previewed for this company, then applied with the
 * preview's defaults — so the copy is recorded as an application and a name already taken here gets
 * the library's "(template)" suffix instead of a refusal. A library form this company added before is not
 * added twice — the template leaves it as the company has it — so the dialog opens that one instead.
 */
export function AddReviewFormDialog({ open, onCloseAction, onAddedAction, existingForms = [] }: Props) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const [choice, setChoice] = useState<string>(BLANK);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const templates = useTemplates("REVIEW_FORM", open);
  const template = choice === BLANK ? null : templates.data?.find((tpl) => tpl.key === choice) ?? null;
  const preview = useTemplatePreview(template?.key ?? "", {}, Boolean(template));
  const apply = useApplyTemplate(template?.key ?? "");
  const application = useTemplateApplication(applicationId);

  useEffect(() => {
    if (!open) return;
    setChoice(BLANK);
    setName("");
    setNameError(null);
    setError(null);
    setBusy(false);
    setConfirmingCancel(false);
    setApplicationId(null);
  }, [open]);

  // The application names what it created; the editor opens on that form.
  useEffect(() => {
    if (!application.data) return;
    const form = application.data.items.find((i) => i.type === "FORM" && i.objectId);
    if (form?.objectId) {
      onAddedAction({ id: form.objectId });
    } else {
      setBusy(false);
      setError(t("addForm.notAdded"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.data]);

  const previewItem = preview.data?.parts.flatMap((p) => p.items).find((i) => i.type === "FORM") ?? null;
  const addedBefore = previewItem?.outcome === "EXISTING"
    ? existingForms.find((f) => f.name === previewItem.existingName) ?? null
    : null;
  const templateBlocked = Boolean(previewItem && (
    previewItem.renameTaken || previewItem.outcome === "DROPPED" || (previewItem.outcome === "EXISTING" && !addedBefore)
  ));

  const dirty = name.trim() !== "";
  const requestClose = () => {
    if (busy) return;
    if (dirty) {
      setConfirmingCancel(true);
      return;
    }
    onCloseAction();
  };

  const createBlank = async () => {
    if (!name.trim()) {
      setNameError(t("addForm.nameRequired"));
      return;
    }
    setBusy(true);
    try {
      const res = await saveReviewFormAction({ id: null, body: { name: name.trim(), description: null, questions: [] } });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        if (res.fieldErrors?.name) setNameError(res.fieldErrors.name);
        else setError(res.errorMessage ?? t("error.generic"));
        return;
      }
      onAddedAction(res.data);
    } finally {
      setBusy(false);
    }
  };

  const createFromTemplate = async () => {
    if (!preview.data) return;
    setBusy(true);
    const res = await apply.mutateAsync({ fingerprint: preview.data.fingerprint });
    if (res.status !== ActionStatus.SUCCESS || !res.data) {
      setBusy(false);
      setError(res.errorMessage ?? t("error.generic"));
      return;
    }
    // Busy until the application is read and the editor opens.
    setApplicationId(res.data.id);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (addedBefore) onAddedAction({ id: addedBefore.id });
    else if (template) await createFromTemplate();
    else await createBlank();
  };

  const library = templates.data ?? [];

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) requestClose(); }}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={submit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>{t("forms.addForm")}</DialogTitle>
              <DialogDescription>{t("addForm.description")}</DialogDescription>
            </DialogHeader>

            <div role="radiogroup" aria-label={t("addForm.startFrom")} className="grid gap-2 sm:grid-cols-2">
              <ChoiceCard
                selected={choice === BLANK}
                disabled={busy}
                icon={<Icon icon={FileAddIcon} size="sm" />}
                title={t("addForm.blank.title")}
                summary={t("addForm.blank.summary")}
                onSelect={() => { setChoice(BLANK); setError(null); }}
              />
              {templates.isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-[76px] rounded-popover" />)}
              {library.map((tpl) => (
                <ChoiceCard
                  key={tpl.key}
                  selected={choice === tpl.key}
                  disabled={busy}
                  icon={<Icon icon={FileTextIcon} size="sm" />}
                  title={tpl.title}
                  summary={tpl.summary}
                  meta={tpl.appliedVersion != null ? t("addForm.addedBefore") : undefined}
                  onSelect={() => { setChoice(tpl.key); setError(null); }}
                />
              ))}
            </div>

            {template ? (
              <TemplateNote
                loading={preview.isLoading}
                finalName={previewItem?.finalName ?? null}
                renamed={Boolean(previewItem && previewItem.finalName !== previewItem.name)}
                blocked={templateBlocked}
                addedBefore={Boolean(addedBefore)}
                reason={previewItem?.reason ?? null}
              />
            ) : (
              <div className="space-y-1.5">
                <RequiredLabel htmlFor="new-review-form-name" required>{tCommon("fields.name")}</RequiredLabel>
                <Input
                  id="new-review-form-name"
                  value={name}
                  disabled={busy}
                  placeholder={t("addForm.namePlaceholder")}
                  aria-invalid={nameError ? true : undefined}
                  onChange={(e) => { setName(e.target.value); setNameError(null); }}
                />
                {nameError && <FieldError>{nameError}</FieldError>}
              </div>
            )}

            <FormError message={error} />

            <DialogFooter className="items-center sm:justify-between">
              <Link href={LIBRARY_HREF} className="text-body text-accent-text underline-offset-4 hover:underline">
                {t("addForm.browseLibrary")}
              </Link>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={requestClose} disabled={busy}>{tCommon("actions.cancel")}</Button>
                <Button type="submit" disabled={busy || (template !== null && (!preview.data || templateBlocked))}>
                  {busy ? t("addForm.adding") : addedBefore ? t("addForm.openIt") : tCommon("actions.add")}
                </Button>
              </div>
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

// A template's itemCount counts what it creates — one form — not the form's questions; the summary says those, so
// a library card's only extra line is whether it was added here before.

function ChoiceCard({ selected, disabled, icon, title, summary, meta, onSelect }: {
  selected: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  summary: string;
  meta?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "relative flex items-start gap-3 rounded-card border px-4 py-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field",
        selected ? "border-accent-ring bg-accent-subtle" : "border-divider hover:border-field hover:bg-subtle",
      )}
    >
      <span className={cn(
        "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-control",
        selected ? "bg-accent text-on-accent" : "bg-subtle text-secondary",
      )}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body font-medium text-primary">{title}</span>
        <span className="mt-0.5 line-clamp-2 block text-hint text-tertiary">{summary}</span>
        {meta && <span className="mt-1 block text-hint text-secondary">{meta}</span>}
      </span>
      {selected && <Icon icon={Tick02Icon} size="sm" className="absolute right-3 top-3 text-secondary" />}
    </button>
  );
}

function TemplateNote({ loading, finalName, renamed, blocked, addedBefore, reason }: {
  loading: boolean;
  finalName: string | null;
  renamed: boolean;
  blocked: boolean;
  addedBefore: boolean;
  reason: string | null;
}) {
  const t = useTranslations("reviews");
  if (loading || !finalName) return <Skeleton className="h-5 w-80" />;
  if (addedBefore) {
    return (
      <p className="text-body text-tertiary">
        {t.rich("addForm.note.addedBefore", { name: finalName, b: (c) => <span className="font-medium text-primary">{c}</span> })}
      </p>
    );
  }
  if (blocked) {
    return (
      <FormError message={reason ?? t("addForm.note.taken", { name: finalName })} />
    );
  }
  return (
    <p className="text-body text-tertiary">
      {t.rich(renamed ? "addForm.note.addsRenamed" : "addForm.note.adds", {
        name: finalName,
        b: (c) => <span className="font-medium text-primary">{c}</span>,
      })}
    </p>
  );
}
