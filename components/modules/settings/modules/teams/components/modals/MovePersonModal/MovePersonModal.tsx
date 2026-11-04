"use client";

import React from "react";
import { FormError } from "@/components/feedback/FormError";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
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
            <p className="text-body text-secondary">
              {personName} will be removed from {sourceName ?? "this team"}. Other team memberships
              stay as they are.
            </p>
          ) : (
            <RadioGroup value={mode} onValueChange={(v) => onModeChange(v as TeamMoveMode)}>
              <div className="flex items-start gap-2.5 rounded-control border border-divider p-3">
                <RadioGroupItem value="move" id="move-person-move" className="mt-0.5" />
                <div>
                  <Label htmlFor="move-person-move" className="cursor-pointer">
                    Move to {targetName}
                  </Label>
                  <p className="mt-0.5 text-hint text-tertiary">
                    {sourceName
                      ? `Removes ${personName} from ${sourceName} and adds them to ${targetName}.`
                      : `Adds ${personName} to ${targetName}.`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-control border border-divider p-3">
                <RadioGroupItem value="add" id="move-person-add" className="mt-0.5" />
                <div>
                  <Label htmlFor="move-person-add" className="cursor-pointer">
                    Add to {targetName} as well
                  </Label>
                  <p className="mt-0.5 text-hint text-tertiary">
                    Keeps every current team; {personName} ends up on both.
                  </p>
                </div>
              </div>
            </RadioGroup>
          )}

          <FormError message={errorMessage} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Saving…" : isRemoval ? "Remove" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
