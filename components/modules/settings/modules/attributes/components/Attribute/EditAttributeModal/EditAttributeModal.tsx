"use client";

import { FC, useRef } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { FormError } from "@/components/feedback/FormError";
import { Attribute, AttributePatch } from "@/models/attribute/Attribute";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { AttributeOptions } from "@/components/modules/settings/modules/attributes/components/AttributeOptions";

type EditAttributeModalProps = {
  attribute: Attribute | null;
  groups?: AttributeGroup[];
  isOpen: boolean;
  /**
   * Resolves `false` when the save was refused — the modal then stays open with what was typed and
   * shows `errorMessage`. Anything else closes it.
   */
  onSaveAction: (id: string, patch: AttributePatch) => boolean | void | Promise<boolean | void>;
  isSaving?: boolean;
  /** A refusal of the last save (a stale version, a name collision…), shown inside the form. */
  errorMessage?: string | null;
  onRequestCloseAction: () => void;
};

/**
 * Edit an attribute in a modal (replaces the old inline expand). Reuses the shared
 * AttributeOptions editor (group / options / validation) which owns its own Save/Cancel.
 *
 * It used to close the moment Save was clicked, before the request had answered — so a refused save
 * (somebody else edited the field meanwhile, E00409) closed the form, dropped what was typed, and
 * showed nothing. It now waits for the answer and closes only on success.
 */
export const EditAttributeModal: FC<EditAttributeModalProps> = ({
  attribute,
  groups,
  isOpen,
  onSaveAction,
  isSaving = false,
  errorMessage,
  onRequestCloseAction,
}) => {
  const draftRef = useRef<AttributePatch>({});

  const requestClose = () => {
    if (isSaving) return;
    draftRef.current = {};
    onRequestCloseAction();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <DialogContent
        hideClose
        className="flex h-[min(85vh,44rem)] flex-col gap-4 overflow-hidden sm:max-w-2xl"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brown-100 text-brown-700">
              <Pencil className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <DialogTitle>Edit attribute</DialogTitle>
              <DialogDescription>
                {attribute ? attribute.name : "Update this attribute's settings and validation."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && <FormError message={errorMessage} />}

        {attribute && (
          <AttributeOptions
            key={attribute.id}
            attribute={attribute}
            groups={groups}
            isPreset={!!attribute.isSystem}
            isSaving={isSaving}
            onChange={(patch) => {
              // The editor hands over its whole patch on every save. Replaced, not merged: after a
              // refused save a field put back to its original value must not ride along from the
              // previous attempt.
              draftRef.current = patch;
            }}
            onSave={async () => {
              const saved = await onSaveAction(attribute.id, draftRef.current);
              if (saved === false) return;
              draftRef.current = {};
              onRequestCloseAction();
            }}
            onCancel={requestClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
