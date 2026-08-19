"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  personName: string;
  sourceName: string | null;
  /** null = dropped on Unassigned, i.e. take them out of the structure. */
  targetName: string | null;
  isPending: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
};

/** Department membership is single-valued, so every drop is a transfer worth confirming. */
export function MovePersonModal({
  open,
  onClose,
  personName,
  sourceName,
  targetName,
  isPending,
  errorMessage,
  onConfirm,
}: Props) {
  const isRemoval = targetName === null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isPending) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRemoval ? `Remove ${personName} from the department?` : `Move ${personName}?`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 rounded-lg border border-brown-200 bg-brown-50 p-3">
            <span className="min-w-0 flex-1 truncate text-sm text-brown-700">
              {sourceName ?? "No department"}
            </span>
            <ArrowRight className="h-4 w-4 flex-none text-brown-400" />
            <span className="min-w-0 flex-1 truncate text-right text-sm font-medium text-brown-900">
              {targetName ?? "No department"}
            </span>
          </div>

          <p className="text-sm text-brown-600">
            {isRemoval
              ? `${personName} will no longer belong to any department.`
              : sourceName
                ? `A person can belong to one department only, so ${personName} will be removed from ${sourceName}.`
                : `${personName} will be assigned to ${targetName}.`}
          </p>

          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? "Saving…" : isRemoval ? "Remove" : "Move here"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
