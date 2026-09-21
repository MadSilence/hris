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
import { useAttributeDeleteImpact } from "@/components/modules/settings/modules/attributes/hooks/useDeleteImpact";
import { messageForError } from "@/lib/errors/errorMessages";

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

  const {
    data: impact,
    isLoading: isImpactLoading,
    error: impactError,
  } = useAttributeDeleteImpact(isOpen ? attribute?.id ?? null : null);

  const hasOptions =
    attribute?.type === AttributeType.MULTI_SELECT ||
    attribute?.type === AttributeType.SELECT;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onRequestCloseAction();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-100 text-danger-600">
              <Trash2 className="h-5 w-5"/>
            </span>
            <div className="space-y-1">
              <AlertDialogTitle>Delete attribute</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Attribute{" "}
                <strong>{attributeName}</strong> will be permanently deleted.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-danger-600"/>

            <div>
              <h4 className="mb-1 font-medium text-danger-800">Warning</h4>

              <div className="space-y-1 text-sm text-danger-700">
                {hasOptions && (
                  <p>
                    All options associated with this attribute will also be
                    deleted.
                  </p>
                )}

                {/*
                  Three outcomes, not two. This block read `impact &&` alone, so "we have not asked
                  yet" and "we asked and could not get an answer" both rendered as silence \u2014 and
                  silence here is indistinguishable from "this attribute has no values", which is
                  the one thing the reader is trying to find out before pressing Delete. The pattern
                  is `DeleteRoleModal`, one folder away.
                */}
                {isImpactLoading && <p>Checking how many people have a value for this\u2026</p>}

                {!isImpactLoading && !impact && !!impactError && (
                  <p>
                    {messageForError(impactError)} Until then, how many values this deletes is
                    unknown.
                  </p>
                )}

                {!isImpactLoading && impact && impact.valueCount > 0 && (
                  <p>
                    This will permanently delete{" "}
                    <strong>{impact.valueCount}</strong> value
                    {impact.valueCount === 1 ? "" : "s"} from{" "}
                    <strong>{impact.peopleCount}</strong>{" "}
                    {impact.peopleCount === 1 ? "person" : "people"}.
                  </p>
                )}

                {!isImpactLoading && impact && impact.valueCount === 0 && (
                  <p>Nobody has a value for this attribute.</p>
                )}

                {/* Nothing asked yet, and nothing to report. */}
                {!isImpactLoading && !impact && !impactError && (
                  <p>Any values people have for it will be deleted with it.</p>
                )}

                <p>
                  Any saved views or filters referencing this attribute will be
                  updated. Deleted attributes cannot be restored.
                </p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>

          {/*
            Disabled *only* while the question is still open. Once the answer is in \u2014 or once we
            know it is not coming \u2014 the decision is the admin's to make; refusing to delete because
            an impact endpoint is down would be a second failure on top of the first.
          */}
          <AlertDialogAction
            disabled={isLoading || isImpactLoading}
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
            className="bg-danger-600 text-white hover:bg-danger-700"
          >
            Delete attribute
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
