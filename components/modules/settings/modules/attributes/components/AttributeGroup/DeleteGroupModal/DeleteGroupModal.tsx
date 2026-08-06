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
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { useGroupDeleteImpact } from "@/components/modules/settings/modules/attributes/hooks/useDeleteImpact";

type DeleteGroupModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
  group: AttributeGroup;
};

export const DeleteGroupModal: FC<DeleteGroupModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirmAction,
  onRequestCloseAction,
  group,
}) => {
  const groupName = group?.name ?? "Untitled section";

  const { data: impact } = useGroupDeleteImpact(isOpen ? group?.id ?? null : null);

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
            Delete section
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. Section <strong>{groupName}</strong>{" "}
            will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600"/>

            <div>
              <h4 className="mb-1 font-medium text-red-800">Warning</h4>

              <div className="space-y-1 text-sm text-red-700">
                {impact && impact.attributeCount > 0 ? (
                  <p>
                    <strong>{impact.attributeCount}</strong> attribute
                    {impact.attributeCount === 1 ? "" : "s"} in this section will
                    also be deleted
                    {impact.valueCount > 0 && (
                      <>
                        , removing <strong>{impact.valueCount}</strong> value
                        {impact.valueCount === 1 ? "" : "s"} from{" "}
                        <strong>{impact.peopleCount}</strong>{" "}
                        {impact.peopleCount === 1 ? "person" : "people"}
                      </>
                    )}
                    .
                  </p>
                ) : (
                  <p>All attributes assigned to this section will also be deleted.</p>
                )}
                <p>
                  Saved views or filters referencing them will be updated. This
                  cannot be undone.
                </p>
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
            Delete section
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
