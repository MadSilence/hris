"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, FilePlus2, FileText } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { cn } from "@/public/desact/src/components/ui/utils";
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
import type { TemplateSummaryDTO } from "@/api/modules/templates/dto";

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
  const [choice, setChoice] = useState<string>(BLANK);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const templates = useTemplates("REVIEW_FORM", open);
  const template = choice === BLANK ? null : templates.data?.find((t) => t.key === choice) ?? null;
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
      setError("The library form was not added. Open the library to see why.");
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
      setNameError("Enter a name.");
      return;
    }
    setBusy(true);
    try {
      const res = await saveReviewFormAction({ id: null, body: { name: name.trim(), description: null, questions: [] } });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        if (res.fieldErrors?.name) setNameError(res.fieldErrors.name);
        else setError(res.errorMessage ?? "Something went wrong.");
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
      setError(res.errorMessage ?? "Something went wrong.");
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
              <DialogTitle>Add Form</DialogTitle>
              <DialogDescription>
                Start blank or from one of the library&apos;s forms. Either way the editor opens next, and everything in it
                can be changed.
              </DialogDescription>
            </DialogHeader>

            <div role="radiogroup" aria-label="Start From" className="grid gap-2 sm:grid-cols-2">
              <ChoiceCard
                selected={choice === BLANK}
                disabled={busy}
                icon={<FilePlus2 className="h-4 w-4" />}
                title="Blank Form"
                summary="No questions yet — write your own."
                onSelect={() => { setChoice(BLANK); setError(null); }}
              />
              {templates.isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-[76px] rounded-xl" />)}
              {library.map((t) => (
                <ChoiceCard
                  key={t.key}
                  selected={choice === t.key}
                  disabled={busy}
                  icon={<FileText className="h-4 w-4" />}
                  title={t.title}
                  summary={t.summary}
                  meta={meta(t)}
                  onSelect={() => { setChoice(t.key); setError(null); }}
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
                <RequiredLabel htmlFor="new-review-form-name" required>Name</RequiredLabel>
                <Input
                  id="new-review-form-name"
                  value={name}
                  disabled={busy}
                  placeholder="Self Review, Manager Review…"
                  aria-invalid={nameError ? true : undefined}
                  onChange={(e) => { setName(e.target.value); setNameError(null); }}
                />
                {nameError && <p role="alert" className="text-xs text-destructive">{nameError}</p>}
              </div>
            )}

            <FormError message={error} />

            <DialogFooter className="items-center sm:justify-between">
              <Link href={LIBRARY_HREF} className="text-sm text-muted-foreground underline-offset-4 hover:text-brown-900 hover:underline">
                Browse the Library
              </Link>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={requestClose} disabled={busy}>Cancel</Button>
                <Button type="submit" disabled={busy || (template !== null && (!preview.data || templateBlocked))}>
                  {busy ? "Adding…" : addedBefore ? "Open It" : "Add"}
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

// A template's itemCount counts what it creates — one form — not the form's questions; the summary says those.
const meta = (t: TemplateSummaryDTO) => (t.appliedVersion != null ? "Added here before" : undefined);

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
        "relative flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown-300",
        selected ? "border-brown-400 bg-brown-50/70" : "border-brown-100 hover:border-brown-200 hover:bg-brown-50/40",
      )}
    >
      <span className={cn(
        "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
        selected ? "bg-brown-600 text-white" : "bg-brown-50 text-brown-600",
      )}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-brown-900">{title}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{summary}</span>
        {meta && <span className="mt-1 block text-xs text-brown-600">{meta}</span>}
      </span>
      {selected && <Check className="absolute right-3 top-3 h-4 w-4 text-brown-700" aria-hidden="true" />}
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
  if (loading || !finalName) return <Skeleton className="h-5 w-80" />;
  if (addedBefore) {
    return (
      <p className="text-sm text-muted-foreground">
        Added here before as <span className="font-medium text-brown-900">{finalName}</span>, and kept as it has been
        changed since. Open it — and duplicate it there for a variant — or start blank.
      </p>
    );
  }
  if (blocked) {
    return (
      <p className="text-sm text-destructive">
        {reason ?? `“${finalName}” is taken here too. Rename the company’s own form first, or start blank.`}
      </p>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      Adds <span className="font-medium text-brown-900">{finalName}</span>
      {renamed ? " — the library’s name is already taken here." : "."}
    </p>
  );
}
