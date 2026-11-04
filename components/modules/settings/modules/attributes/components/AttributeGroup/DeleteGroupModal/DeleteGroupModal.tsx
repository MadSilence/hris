"use client";

import { FC } from "react";
import { Alert02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
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
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import { useGroupDeleteImpact } from "@/components/modules/settings/modules/attributes/hooks/useDeleteImpact";
import { messageForError } from "@/lib/errors/errorMessages";

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

  const {
    data: impact,
    isLoading: isImpactLoading,
    error: impactError,
  } = useGroupDeleteImpact(isOpen ? group?.id ?? null : null);

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
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-popover bg-mist text-secondary">
              <Icon icon={Delete02Icon} />
            </span>
            <div className="space-y-1">
              <AlertDialogTitle>Delete section</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Section <strong>{groupName}</strong>{" "}
                will be permanently deleted.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="rounded-card border border-divider bg-mist p-4">
          <div className="flex items-start gap-3">
            <Icon icon={Alert02Icon} className="mt-0.5 text-secondary" />

            <div>
              <h4 className="mb-1 font-medium text-primary">Warning</h4>

              <div className="space-y-1 text-body text-secondary">
                {/*
                  The `else` branch used to catch three different situations \u2014 still loading, failed
                  to load, and genuinely empty \u2014 and told the reader the same vague sentence for all
                  three. Split, following `DeleteRoleModal`.
                */}
                {isImpactLoading && <p>Checking what this section contains\u2026</p>}

                {!isImpactLoading && !impact && !!impactError && (
                  <p>
                    {messageForError(impactError)} Until then, what this section contains is
                    unknown.
                  </p>
                )}

                {!isImpactLoading && impact && impact.attributeCount > 0 && (
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
                )}

                {!isImpactLoading && impact && impact.attributeCount === 0 && (
                  <p>This section is empty \u2014 no attributes will be deleted with it.</p>
                )}

                {/* Nothing asked yet, and nothing to report: the sentence this block always had. */}
                {!isImpactLoading && !impact && !impactError && (
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

          {/* Disabled only while the question is still open \u2014 see `DeleteAttributeModal`. */}
          <AlertDialogAction
            disabled={isLoading || isImpactLoading}
            onClick={(event) => {
              event.preventDefault();
              onConfirmAction();
            }}
            destructive
          >
            Delete section
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
