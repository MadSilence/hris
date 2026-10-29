"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { saveTemplateAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { PROCESS_TYPE_LABELS, type ProcessType, type Template } from "@/models/lifecycle";

type Props = {
  open: boolean;
  type: ProcessType;
  onCloseAction: () => void;
  /** The template exists now; the canvas is where its tasks are added. */
  onAddedAction: (template: Template) => void;
};

/** A name, and the template exists — its tasks are laid out on the canvas it opens on. */
export function AddTemplateDialog({ open, type, onCloseAction, onAddedAction }: Props) {
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
      setNameError("Enter a name.");
      return;
    }
    setBusy(true);
    try {
      const res = await saveTemplateAction({ id: null, body: { type, name: name.trim(), description: null, items: [] } });
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

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) requestClose(); }}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add {PROCESS_TYPE_LABELS[type]} Template</DialogTitle>
              <DialogDescription>
                Name it here; its tasks are laid out on a timeline from the start day, which opens next.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <RequiredLabel htmlFor="new-template-name" required>Name</RequiredLabel>
              <Input
                id="new-template-name"
                value={name}
                disabled={busy}
                aria-invalid={nameError ? true : undefined}
                onChange={(e) => { setName(e.target.value); setNameError(null); }}
              />
              {nameError && <p role="alert" className="text-xs text-destructive">{nameError}</p>}
            </div>
            <FormError message={error} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={requestClose} disabled={busy}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? "Adding…" : "Add"}</Button>
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
