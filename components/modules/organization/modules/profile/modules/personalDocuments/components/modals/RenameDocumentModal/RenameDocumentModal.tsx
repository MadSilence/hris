"use client";

import { FC, FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
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
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const [name, setName] = useState(documentName ?? "");
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(documentName ?? "");
      setTried(false);
    }
  }, [isOpen, documentName]);

  const trimmed = name.trim();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setTried(true);
    if (!trimmed) return;
    // The same name: nothing to rename, and the dialog closes as if it had.
    if (trimmed === documentName) {
      onCancelAction();
      return;
    }
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
          <DialogTitle>{t("documents.renameDocument.title")}</DialogTitle>
          <DialogDescription>
            {t("documents.renameDocument.description")}
          </DialogDescription>
        </DialogHeader>

        <FormError message={errorMessage} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <RequiredLabel htmlFor="document-name" required>{tCommon("fields.name")}</RequiredLabel>
            <Input
              id="document-name"
              autoFocus
              value={name}
              disabled={isLoading}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <FieldError>{tried && !trimmed ? tCommon("validation.enterName") : null}</FieldError>
          </div>

          <DialogFooter className="mt-8">
            <Button type="button" variant="secondary" disabled={isLoading} onClick={onCancelAction}>
              {tCommon("actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
 >
              {tCommon("actions.rename")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
