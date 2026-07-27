"use client";

import { FC } from "react";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
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

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-brown-200 divide-y divide-brown-200">
          {changes.map((change) => (
            <div
              key={`${change.resourceCode}:${change.action}`}
              className="flex items-center justify-between gap-4 px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{change.resourceLabel}</p>
                <p className="text-xs text-muted-foreground">{change.action}</p>
              </div>

              <div className="flex flex-none items-center gap-2 text-sm">
                <span className="text-muted-foreground">{SCOPE_CHOICE_LABELS[change.from]}</span>
                <ArrowRight className="h-3.5 w-3.5 text-brown-400"/>
                <span className="font-medium">{SCOPE_CHOICE_LABELS[change.to]}</span>
              </div>
            </div>
          ))}
        </div>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onCancelAction} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onConfirmAction} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
