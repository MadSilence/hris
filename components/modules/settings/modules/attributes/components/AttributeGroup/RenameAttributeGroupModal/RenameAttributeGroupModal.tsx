"use client";

import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import { PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
import { ConfirmCancelModal } from "@/components/ui/ConfirmCancelModal/ConfirmCancelModal";
import {
  RenameAttributeGroupForm,
  RenameAttributeGroupFormValues,
} from "@/components/modules/settings/modules/attributes/components/AttributeGroup/RenameAttributeGroupForm";
import { InlineAlert } from "@/components/desact/alert";

type RenameAttributeGroupModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  /** The section being edited — its name and description prefill the form. */
  initialName?: string;
  initialDescription?: string | null;
  /** Server-side failure — the modal stays open and shows it instead of closing silently. */
  errorMessage?: string | null;
  onConfirmAction: (submission: RenameAttributeGroupFormValues) => void;
  onRequestCloseAction: () => void;
};

export const RenameAttributeGroupModal: FC<
  RenameAttributeGroupModalProps
> = ({
  isOpen,
  isLoading = false,
  initialName,
  initialDescription,
  errorMessage,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const t = useTranslations("settings.attributes.editSection");
  const [isDirty, setIsDirty] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const requestClose = () => {
    if (isLoading) return;

    if (isDirty) {
      setIsConfirmCancelOpen(true);
      return;
    }

    onRequestCloseAction();
  };

  const confirmClose = () => {
    setIsConfirmCancelOpen(false);
    onRequestCloseAction();
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent
          hideClose
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        >
          <DialogHeader>
            <div className="flex items-center gap-3 text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-popover bg-mist text-secondary">
                <Icon icon={PencilEdit02Icon} />
              </span>
              <div className="space-y-1">
                <DialogTitle>{t("title")}</DialogTitle>
                <DialogDescription>
                  {t("description")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMessage && (
            <InlineAlert tone="declined">
              {errorMessage}
            </InlineAlert>
          )}

          <RenameAttributeGroupForm
            isLoading={isLoading}
            initialName={initialName}
            initialDescription={initialDescription}
            onCancelAction={requestClose}
            onDirtyChangeAction={setIsDirty}
            onSubmitAction={onConfirmAction}
          />
        </DialogContent>
      </Dialog>

      <ConfirmCancelModal
        isOpen={isConfirmCancelOpen}
        onCancelAction={() => setIsConfirmCancelOpen(false)}
        onConfirmAction={confirmClose}
      />
    </>
  );
};
