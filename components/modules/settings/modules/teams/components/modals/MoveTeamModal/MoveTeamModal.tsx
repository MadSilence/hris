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
import type { TeamTreeNode } from "@/models/teams";

type Props = {
  open: boolean;
  onClose: () => void;
  team: TeamTreeNode;
  /** null = dropped on the company card, i.e. make it top-level. */
  target: TeamTreeNode | null;
  isPending: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
};

/**
 * A drop never mutates on its own: moving a team carries its whole subtree and everyone in
 * it, so the person doing it gets to see exactly what travels before anything happens.
 */
export function MoveTeamModal({
  open,
  onClose,
  team,
  target,
  isPending,
  errorMessage,
  onConfirm,
}: Props) {
  const subCount = team.totalSubNodes;
  const peopleCount = team.totalPeople;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isPending) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{target ? "Move team?" : "Make top-level?"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 rounded-lg border border-brown-200 bg-brown-50 p-3">
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-brown-900">
              {team.name}
            </span>
            <ArrowRight className="h-4 w-4 flex-none text-brown-400" />
            <span className="min-w-0 flex-1 truncate text-right text-sm font-medium text-brown-900">
              {target ? target.name : "Top level"}
            </span>
          </div>

          <p className="text-sm text-brown-600">
            {peopleCount} {peopleCount === 1 ? "person" : "people"}
            {subCount > 0 && ` · ${subCount} sub-${subCount === 1 ? "team" : "teams"}`}
            {" — everything inside moves with it."}
          </p>

          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? "Moving…" : target ? "Move team" : "Make top-level"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
