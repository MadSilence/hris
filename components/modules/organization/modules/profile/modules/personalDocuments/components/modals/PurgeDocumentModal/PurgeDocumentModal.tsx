"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/desact/alert-dialog";
import { Alert02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

export interface PurgeDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  documentName?: string;
  errorMessage?: string | null;
  onRequestCloseAction: () => void;
  onConfirmAction: () => void;
}

/**
 * Confirmation for **Delete forever** — the one action in the documents module that cannot be
 * undone.
 *
 * It had none: the irreversible purge fired on a single click while the *reversible* delete beside
 * it opened a full dialog. The confirmations were on backwards, which is the shape of mistake that
 * only shows up once, on someone else's file.
 */
export const PurgeDocumentModal: FC<PurgeDocumentModalProps> = ({
  isOpen,
  isLoading = false,
  documentName,
  errorMessage,
  onRequestCloseAction,
  onConfirmAction,
}) => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onRequestCloseAction();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon icon={Delete02Icon} />
            {t("documents.purge.title")}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {t.rich("documents.purge.description", {
              name: documentName ?? t("documents.deleteDocument.untitled"),
              b: (chunks) => <strong>{chunks}</strong>,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-card border border-divider bg-mist p-4">
          <div className="flex items-start gap-3">
            <Icon icon={Alert02Icon} className="mt-0.5 text-secondary" />
            <div>
              <h4 className="mb-1 font-medium text-primary">{t("documents.purge.noTrashTitle")}</h4>
              <p className="text-body text-secondary">
                {t("documents.purge.noTrashBody")}
              </p>
            </div>
          </div>
        </div>

        <FormError message={errorMessage} />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{tCommon("actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            // AlertDialogAction closes its dialog on click by default, which throws the failure
            // away before it can render.
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
            destructive
          >
            {t("documents.purge.title")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
