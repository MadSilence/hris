"use client";

import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/public/desact/src/components/ui/radio-group";
import { useDeleteTeam } from "@/components/modules/settings/modules/teams/hooks/useDeleteTeam/useDeleteTeam";
import type { TeamTreeNode } from "@/models/teams";
import type { TeamChildrenStrategy, TeamMembersStrategy } from "@/models/teams/DeleteTeamPayload";

type Props = {
  open: boolean;
  onClose: () => void;
  team: TeamTreeNode;
  allTeams: TeamTreeNode[];
  onDeleted: () => void;
};

export function DeleteTeamModal({ open, onClose, team, allTeams, onDeleted }: Props) {
  const deleteTeam = useDeleteTeam();
  const [childrenStrategy, setChildrenStrategy] = useState<TeamChildrenStrategy>("PROMOTE");
  const [membersStrategy, setMembersStrategy] = useState<TeamMembersStrategy>("UNASSIGN");

  const hasChildren = (team.children?.length ?? 0) > 0;
  const parent = team.parentId
    ? allTeams.find((t) => t.id === team.parentId) ?? null
    : null;

  const effectiveMembersStrategy: TeamMembersStrategy =
    membersStrategy === "MOVE_TO" && !parent ? "UNASSIGN" : membersStrategy;

  const handleDelete = async () => {
    await deleteTeam.mutateAsync({
      id: team.id,
      childrenStrategy,
      membersStrategy: effectiveMembersStrategy,
      targetId: effectiveMembersStrategy === "MOVE_TO" ? parent!.id : null,
    });
    onDeleted();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{team.name}&rdquo;</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2 text-sm text-brown-700">
          <p>This action cannot be undone. Choose how to handle existing sub-teams and members.</p>

          {hasChildren && (
            <div className="space-y-2">
              <Label>Sub-teams</Label>
              <RadioGroup
                value={childrenStrategy}
                onValueChange={(v) => setChildrenStrategy(v as TeamChildrenStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="PROMOTE" id="tcs-promote" />
                  <Label htmlFor="tcs-promote" className="mb-0 cursor-pointer font-normal">
                    Promote to parent level
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="DELETE_CASCADE" id="tcs-cascade" />
                  <Label htmlFor="tcs-cascade" className="mb-0 cursor-pointer font-normal">
                    Delete all sub-teams
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label>Members</Label>
            <RadioGroup
              value={effectiveMembersStrategy}
              onValueChange={(v) => setMembersStrategy(v as TeamMembersStrategy)}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="UNASSIGN" id="tms-unassign" />
                <Label htmlFor="tms-unassign" className="mb-0 cursor-pointer font-normal">
                  Unassign (remove from team)
                </Label>
              </div>
              {parent && (
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="MOVE_TO" id="tms-move" />
                  <Label htmlFor="tms-move" className="mb-0 cursor-pointer font-normal">
                    Move to parent team ({parent.name})
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {deleteTeam.isError && (
            <p className="text-red-500">
              {(deleteTeam.error as Error)?.message ?? "An error occurred."}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleteTeam.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteTeam.isPending}>
            {deleteTeam.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
