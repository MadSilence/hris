"use client";

import { FC } from "react";
import { FormError } from "@/components/feedback/FormError";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import {
  RolePermissionChange,
  SCOPE_CHOICE_LABELS,
} from "@/components/modules/settings/modules/roles/utils/rolePermissionsPayload";

export interface RolePermissionsSummaryModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  errorMessage?: string;
  changes: RolePermissionChange[];
  onCancelAction: () => void;
  onConfirmAction: () => void;
}

export const RolePermissionsSummaryModal: FC<RolePermissionsSummaryModalProps> = ({
  isOpen,
  isSaving = false,
  errorMessage,
  changes,
  onCancelAction,
  onConfirmAction,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isSaving) onCancelAction(); }}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Review permission changes</DialogTitle>
          <DialogDescription>
            {changes.length === 1
              ? "1 change will be applied to this role."
              : `${changes.length} changes will be applied to this role.`}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-control border border-divider divide-y divide-divider">
          {changes.map((change) => (
            <div
              key={`${change.resourceCode}:${change.action}`}
              className="flex items-center justify-between gap-4 px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-body font-medium">{change.resourceLabel}</p>
                <p className="text-hint text-tertiary">{change.action}</p>
              </div>

              <div className="flex flex-none items-center gap-2 text-body">
                <span className="text-tertiary">{SCOPE_CHOICE_LABELS[change.from]}</span>
                <Icon icon={ArrowRight02Icon} size="sm" className="text-tertiary" />
                <span className="font-medium">{SCOPE_CHOICE_LABELS[change.to]}</span>
              </div>
            </div>
          ))}
        </div>

        <FormError message={errorMessage} />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancelAction} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirmAction} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
