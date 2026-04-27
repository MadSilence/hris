"use client";

import { FC } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/public/desact/src/components/ui/alert-dialog";
import { Attribute } from "@/models/attribute/Attribute";
import { AttributeType } from "@/models/attribute";

type DeleteAttributeModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
  attribute: Attribute;
};

export const DeleteAttributeModal: FC<DeleteAttributeModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirmAction,
  onRequestCloseAction,
  attribute,
}) => {
  const attributeName = attribute?.name ?? "Untitled attribute";

  const hasOptions =
    attribute?.type === AttributeType.MULTI_SELECT ||
    attribute?.type === AttributeType.SELECT ||
    attribute?.type === AttributeType.STATUS;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onRequestCloseAction();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5"/>
            Delete attribute
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. Attribute{" "}
            <strong>{attributeName}</strong> will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600"/>

            <div>
              <h4 className="mb-1 font-medium text-red-800">Warning</h4>

              <div className="space-y-1 text-sm text-red-700">
                {hasOptions && (
                  <p>
                    All options associated with this attribute will also be
                    deleted.
                  </p>
                )}

                <p>Deleted attributes cannot be restored.</p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={isLoading}
            onClick={onConfirmAction}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete attribute
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
