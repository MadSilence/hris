"use client";

import { FC, FormEvent, useEffect, useState } from "react";
import { FormError } from "@/components/feedback/FormError";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";

export interface RenameDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  documentName?: string;
  errorMessage?: string | null;
  onCancelAction: () => void;
  onConfirmAction: (name: string) => void;
}

export const RenameDocumentModal: FC<RenameDocumentModalProps> = ({
  isOpen,
  isLoading = false,
  documentName,
  errorMessage,
  onCancelAction,
  onConfirmAction,
}) => {
  const [name, setName] = useState(documentName ?? "");

  useEffect(() => {
    if (isOpen) setName(documentName ?? "");
  }, [isOpen, documentName]);

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && trimmed !== documentName;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !canSubmit) return;
    onConfirmAction(trimmed);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onCancelAction();
      }}
    >
      <DialogContent hideClose className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rename document</DialogTitle>
          <DialogDescription>
            Changes the display name only — the file itself is untouched.
          </DialogDescription>
        </DialogHeader>

        <FormError message={errorMessage} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <RequiredLabel htmlFor="document-name" required>Name</RequiredLabel>
            <Input
              id="document-name"
              autoFocus
              value={name}
              disabled={isLoading}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </div>

          <DialogFooter className="mt-8">
            <Button type="button" variant="outline" disabled={isLoading} onClick={onCancelAction}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !canSubmit}
              className="bg-brown-600 text-white hover:bg-brown-700"
            >
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
