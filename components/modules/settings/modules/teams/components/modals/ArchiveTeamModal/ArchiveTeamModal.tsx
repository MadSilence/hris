"use client";

import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { useArchiveTeam } from "@/components/modules/settings/modules/teams/hooks/useArchiveTeam/useArchiveTeam";
import type { TeamTreeNode } from "@/models/teams";
import type {
  TeamArchiveChildrenStrategy,
  TeamArchiveMembersStrategy,
} from "@/models/teams/ArchiveTeamPayload";
import { FormError } from "@/components/feedback/FormError";

type Props = {
  open: boolean;
  onClose: () => void;
  team: TeamTreeNode;
  allTeams: TeamTreeNode[];
  onArchived: () => void;
};

function sumDescendantMembers(node: TeamTreeNode): number {
  let total = 0;
  for (const child of node.children ?? []) {
    total += child.memberCount + sumDescendantMembers(child);
  }
  return total;
}

export function ArchiveTeamModal({ open, onClose, team, allTeams, onArchived }: Props) {
  const archiveTeam = useArchiveTeam();

  const [childrenStrategy, setChildrenStrategy] =
    useState<TeamArchiveChildrenStrategy>("ARCHIVE_CASCADE");
  const [membersStrategy, setMembersStrategy] =
    useState<TeamArchiveMembersStrategy>("UNASSIGN");
  const [subMembersStrategy, setSubMembersStrategy] =
    useState<TeamArchiveMembersStrategy>("UNASSIGN");

  const hasChildren = (team.children?.length ?? 0) > 0;
  const hasMembers = team.memberCount > 0;
  const subMembersCount = sumDescendantMembers(team);
  const parent = team.parentId
    ? allTeams.find((t) => t.id === team.parentId) ?? null
    : null;

  const cascading = hasChildren && childrenStrategy === "ARCHIVE_CASCADE";

  const effectiveMembersStrategy: TeamArchiveMembersStrategy =
    membersStrategy === "MOVE_TO" && !parent ? "UNASSIGN" : membersStrategy;
  const effectiveSubMembersStrategy: TeamArchiveMembersStrategy =
    subMembersStrategy === "MOVE_TO" && !parent ? "UNASSIGN" : subMembersStrategy;

  const wantsMove =
    (hasMembers && effectiveMembersStrategy === "MOVE_TO") ||
    (cascading && subMembersCount > 0 && effectiveSubMembersStrategy === "MOVE_TO");

  const handleArchive = async () => {
    await archiveTeam.mutateAsync({
      id: team.id,
      childrenStrategy: hasChildren ? childrenStrategy : "PROMOTE",
      membersStrategy: effectiveMembersStrategy,
      subMembersStrategy: cascading ? effectiveSubMembersStrategy : undefined,
      targetId: wantsMove && parent ? parent.id : null,
    });
    onArchived();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Archive &ldquo;{team.name}&rdquo;</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2 text-body text-secondary">
          <p>
            Archiving hides this team from active views. Choose how to handle its sub-teams and
            members.
          </p>

          {hasChildren && (
            <div className="space-y-2">
              <Label>Sub-teams</Label>
              <RadioGroup
                value={childrenStrategy}
                onValueChange={(v) => setChildrenStrategy(v as TeamArchiveChildrenStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="ARCHIVE_CASCADE" id="atcs-cascade" />
                  <Label htmlFor="atcs-cascade" className="mb-0 cursor-pointer font-normal">
                    Archive all sub-teams
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="PROMOTE" id="atcs-promote" />
                  <Label htmlFor="atcs-promote" className="mb-0 cursor-pointer font-normal">
                    Promote all sub-teams to parent level
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {hasMembers && (
            <div className="space-y-2">
              <Label>Members</Label>
              <RadioGroup
                value={effectiveMembersStrategy}
                onValueChange={(v) => setMembersStrategy(v as TeamArchiveMembersStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="UNASSIGN" id="atms-unassign" />
                  <Label htmlFor="atms-unassign" className="mb-0 cursor-pointer font-normal">
                    Unassign users from this team
                  </Label>
                </div>
                {parent && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="MOVE_TO" id="atms-move" />
                    <Label htmlFor="atms-move" className="mb-0 cursor-pointer font-normal">
                      Promote to parent level ({parent.name})
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          )}

          {cascading && subMembersCount > 0 && (
            <div className="space-y-2">
              <Label>Members of Sub-teams</Label>
              <RadioGroup
                value={effectiveSubMembersStrategy}
                onValueChange={(v) => setSubMembersStrategy(v as TeamArchiveMembersStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="UNASSIGN" id="atsms-unassign" />
                  <Label htmlFor="atsms-unassign" className="mb-0 cursor-pointer font-normal">
                    Unassign users from all sub-teams
                  </Label>
                </div>
                {parent && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="MOVE_TO" id="atsms-move" />
                    <Label htmlFor="atsms-move" className="mb-0 cursor-pointer font-normal">
                      Promote all sub-team users to parent level ({parent.name})
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          )}

          {archiveTeam.isError && (
            <FormError message={(archiveTeam.error as Error)?.message ?? "An error occurred."} />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={archiveTeam.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleArchive} disabled={archiveTeam.isPending}>
            {archiveTeam.isPending ? "Archiving…" : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
