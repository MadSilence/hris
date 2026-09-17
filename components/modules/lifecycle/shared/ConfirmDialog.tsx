"use client";

import React, { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/public/desact/src/components/ui/alert-dialog";
import { FormError } from "@/components/feedback/FormError";

type Props = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  /**
   * Holds the confirm button while something it depends on is still being asked — a delete's impact.
   * Only while the answer is on its way: once it arrived, or is known not to come, the decision is
   * the administrator's (technical_documentation/ERRORS.md).
   */
  confirmDisabled?: boolean;
  onCancelAction: () => void;
  /** Resolves to an error message to keep the dialog open, or null when done. */
  onConfirmAction: () => Promise<string | null>;
};

/** A confirmation that stays open on refusal and says why. */
export function ConfirmDialog({ open, title, children, confirmLabel, destructive, confirmDisabled, onCancelAction, onConfirmAction }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v && !busy) { setError(null); onCancelAction(); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">{children}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FormError message={error} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy || confirmDisabled}
            className={destructive ? "bg-danger-600 text-white hover:bg-danger-700" : undefined}
            onClick={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError(null);
              try {
                const problem = await onConfirmAction();
                if (problem) setError(problem);
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
