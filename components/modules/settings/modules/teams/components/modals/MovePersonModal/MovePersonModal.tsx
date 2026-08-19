"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/public/desact/src/components/ui/radio-group";
import type { TeamMoveMode } from "@/components/modules/settings/modules/teams/hooks/useMovePersonToTeam/useMovePersonToTeam";

type Props = {
  open: boolean;
  onClose: () => void;
  personName: string;
  sourceName: string | null;
  /** null = dropped on Unassigned, i.e. take them off the source team. */
  targetName: string | null;
  mode: TeamMoveMode;
  onModeChange: (mode: TeamMoveMode) => void;
  isPending: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
};

/**
 * Team membership is many, so a drop is genuinely ambiguous: move them across, or add a second
 * membership. The choice is explicit rather than guessed.
 */
export function MovePersonModal({
  open,
  onClose,
  personName,
  sourceName,
  targetName,
  mode,
  onModeChange,
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
            {isRemoval
              ? `Remove ${personName} from ${sourceName ?? "the team"}?`
              : `${personName} → ${targetName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isRemoval ? (
            <p className="text-sm text-brown-600">
              {personName} will be removed from {sourceName ?? "this team"}. Other team memberships
              stay as they are.
            </p>
          ) : (
            <RadioGroup value={mode} onValueChange={(v) => onModeChange(v as TeamMoveMode)}>
              <div className="flex items-start gap-2.5 rounded-lg border border-brown-200 p-3">
                <RadioGroupItem value="move" id="move-person-move" className="mt-0.5" />
                <div>
                  <Label htmlFor="move-person-move" className="cursor-pointer">
                    Move to {targetName}
                  </Label>
                  <p className="mt-0.5 text-xs text-brown-500">
                    {sourceName
                      ? `Removes ${personName} from ${sourceName} and adds them to ${targetName}.`
                      : `Adds ${personName} to ${targetName}.`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-brown-200 p-3">
                <RadioGroupItem value="add" id="move-person-add" className="mt-0.5" />
                <div>
                  <Label htmlFor="move-person-add" className="cursor-pointer">
                    Add to {targetName} as well
                  </Label>
                  <p className="mt-0.5 text-xs text-brown-500">
                    Keeps every current team; {personName} ends up on both.
                  </p>
                </div>
              </div>
            </RadioGroup>
          )}

          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? "Saving…" : isRemoval ? "Remove" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
