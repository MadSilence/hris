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
import { Attribute, AttributePatch } from "@/models/attribute/Attribute";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { AttributeOptions } from "@/components/modules/settings/modules/attributes/components/AttributeOptions";

type EditAttributeModalProps = {
  attribute: Attribute | null;
  groups?: AttributeGroup[];
  isOpen: boolean;
  onSaveAction: (id: string, patch: AttributePatch) => void;
  onRequestCloseAction: () => void;
};

/**
 * Edit an attribute in a modal (replaces the old inline expand). Reuses the shared
 * AttributeOptions editor (group / options / validation) which owns its own Save/Cancel.
 */
export const EditAttributeModal: FC<EditAttributeModalProps> = ({
  attribute,
  groups,
  isOpen,
  onSaveAction,
  onRequestCloseAction,
}) => {
  const draftRef = useRef<AttributePatch>({});

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onRequestCloseAction();
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

        {attribute && (
          <AttributeOptions
            key={attribute.id}
            attribute={attribute}
            groups={groups}
            isPreset={!!attribute.system}
            onChange={(patch) => {
              draftRef.current = { ...draftRef.current, ...patch };
            }}
            onSave={() => {
              onSaveAction(attribute.id, draftRef.current);
              draftRef.current = {};
              onRequestCloseAction();
            }}
            onCancel={() => {
              draftRef.current = {};
              onRequestCloseAction();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
