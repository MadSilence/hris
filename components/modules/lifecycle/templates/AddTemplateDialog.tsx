"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { saveTemplateAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import type { ProcessType, Template } from "@/models/lifecycle";
import { FieldError } from "@/components/desact/field-error";

type Props = {
  open: boolean;
  type: ProcessType;
  onCloseAction: () => void;
  /** The template exists now; the canvas is where its tasks are added. */
  onAddedAction: (template: Template) => void;
};

/** A name, and the template exists — its tasks are laid out on the canvas it opens on. */
export function AddTemplateDialog({ open, type, onCloseAction, onAddedAction }: Props) {
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setNameError(null);
    setError(null);
    setConfirmingCancel(false);
  }, [open]);

  // Escape and Cancel closed it with a typed name and no question (walk, SWEEP S11).
  const dirty = name.trim() !== "";
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
    if (!name.trim()) {
      setNameError(t("addTemplate.enterName"));
      return;
    }
    setBusy(true);
    try {
      const res = await saveTemplateAction({ id: null, body: { type, name: name.trim(), description: null, items: [] } });
      if (res.status !== ActionStatus.SUCCESS || !res.data) {
        if (res.fieldErrors?.name) setNameError(res.fieldErrors.name);
        else setError(res.errorMessage ?? t("shared.somethingWentWrong"));
        return;
      }
      onAddedAction(res.data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) requestClose(); }}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{t("addTemplate.title", { type })}</DialogTitle>
              <DialogDescription>{t("addTemplate.description")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="new-template-name" required>{tCommon("fields.name")}</RequiredLabel>
              <Input
                id="new-template-name"
                value={name}
                disabled={busy}
                aria-invalid={nameError ? true : undefined}
                onChange={(e) => { setName(e.target.value); setNameError(null); }}
              />
              {nameError && <FieldError>{nameError}</FieldError>}
            </div>
            <FormError message={error} />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={requestClose} disabled={busy}>{tCommon("actions.cancel")}</Button>
              <Button type="submit" disabled={busy}>{busy ? t("addTemplate.adding") : tCommon("actions.add")}</Button>
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
