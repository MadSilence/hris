"use client";

import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
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
  const [targetTeamId, setTargetTeamId] = useState("");

  const hasChildren = (team.children?.length ?? 0) > 0;
  const hasMoved = membersStrategy === "MOVE_TO";
  const canSubmit = !hasMoved || !!targetTeamId;

  const moveTargetOptions = allTeams.filter((t) => t.id !== team.id && t.status === "ACTIVE");

  const handleDelete = async () => {
    await deleteTeam.mutateAsync({
      id: team.id,
      childrenStrategy,
      membersStrategy,
      targetId: hasMoved ? targetTeamId : null,
    });
    onDeleted();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Delete &ldquo;{team.name}&rdquo;</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2 text-sm text-brown-700">
          <p>This action cannot be undone. Choose how to handle existing sub-teams and members.</p>
          {hasChildren && (
            <div className="space-y-1.5">
              <Label>Sub-teams</Label>
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="teamChildrenStrategy" value="PROMOTE" checked={childrenStrategy === "PROMOTE"} onChange={() => setChildrenStrategy("PROMOTE")} />
                  Promote to parent level
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="teamChildrenStrategy" value="DELETE_CASCADE" checked={childrenStrategy === "DELETE_CASCADE"} onChange={() => setChildrenStrategy("DELETE_CASCADE")} />
                  Delete all sub-teams
                </label>
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Members</Label>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="teamMembersStrategy" value="UNASSIGN" checked={membersStrategy === "UNASSIGN"} onChange={() => setMembersStrategy("UNASSIGN")} />
                Unassign (remove from team)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="teamMembersStrategy" value="MOVE_TO" checked={membersStrategy === "MOVE_TO"} onChange={() => setMembersStrategy("MOVE_TO")} />
                Move to another team
              </label>
            </div>
            {hasMoved && (
              <select value={targetTeamId} onChange={(e) => setTargetTeamId(e.target.value)}
                className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
                <option value="">Select target team…</option>
                {moveTargetOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
          </div>
          {deleteTeam.isError && <p className="text-red-500">{(deleteTeam.error as Error)?.message ?? "An error occurred."}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleteTeam.isPending}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteTeam.isPending || !canSubmit}>
            {deleteTeam.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
