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
  FIELD_ACTION_LABELS,
  FIELD_SCOPE_LABELS,
  FieldAccessChange,
} from "@/components/modules/settings/modules/roles/utils/fieldAccessDraft";

export interface FieldAccessSummaryModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  errorMessage?: string;
  changes: FieldAccessChange[];
  onCancelAction: () => void;
  onConfirmAction: () => void;
}

export const FieldAccessSummaryModal: FC<FieldAccessSummaryModalProps> = ({
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
          <DialogTitle>Review field access changes</DialogTitle>
          <DialogDescription>
            {changes.length === 1
              ? "1 change will be applied to this role."
              : `${changes.length} changes will be applied to this role.`}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-brown-200 divide-y divide-brown-200">
          {changes.map((change) => (
            <div key={change.key} className="flex items-center justify-between gap-4 px-4 py-2.5">
              <p className="min-w-0 truncate text-sm font-medium">
                {change.fieldLabel}
                <span className="text-muted-foreground"> · {FIELD_SCOPE_LABELS[change.scope]}</span>
              </p>

              <div className="flex flex-none items-center gap-2 text-sm">
                <span className="text-muted-foreground">{FIELD_ACTION_LABELS[change.from]}</span>
                <ArrowRight className="h-3.5 w-3.5 text-brown-400"/>
                <span className="font-medium">{FIELD_ACTION_LABELS[change.to]}</span>
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
