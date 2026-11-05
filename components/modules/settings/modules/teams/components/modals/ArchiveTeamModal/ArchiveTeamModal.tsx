"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("structure.teams");
  const tShared = useTranslations("structure.shared");
  const tCommon = useTranslations("common");
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
          <DialogTitle>{t("archive.title", { name: team.name })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2 text-body text-secondary">
          <p>{t("archive.intro")}</p>

          {hasChildren && (
            <div className="space-y-2">
              <Label>{t("labels.subUnits")}</Label>
              <RadioGroup
                value={childrenStrategy}
                onValueChange={(v) => setChildrenStrategy(v as TeamArchiveChildrenStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="ARCHIVE_CASCADE" id="atcs-cascade" />
                  <Label htmlFor="atcs-cascade" className="mb-0 cursor-pointer font-normal">
                    {t("archive.archiveAllSub")}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="PROMOTE" id="atcs-promote" />
                  <Label htmlFor="atcs-promote" className="mb-0 cursor-pointer font-normal">
                    {t("archive.promoteAllSub")}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {hasMembers && (
            <div className="space-y-2">
              <Label>{tShared("members")}</Label>
              <RadioGroup
                value={effectiveMembersStrategy}
                onValueChange={(v) => setMembersStrategy(v as TeamArchiveMembersStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="UNASSIGN" id="atms-unassign" />
                  <Label htmlFor="atms-unassign" className="mb-0 cursor-pointer font-normal">
                    {t("archive.unassignMembers")}
                  </Label>
                </div>
                {parent && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="MOVE_TO" id="atms-move" />
                    <Label htmlFor="atms-move" className="mb-0 cursor-pointer font-normal">
                      {tShared("promoteToParentNamed", { parent: parent.name })}
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          )}

          {cascading && subMembersCount > 0 && (
            <div className="space-y-2">
              <Label>{t("labels.subMembers")}</Label>
              <RadioGroup
                value={effectiveSubMembersStrategy}
                onValueChange={(v) => setSubMembersStrategy(v as TeamArchiveMembersStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="UNASSIGN" id="atsms-unassign" />
                  <Label htmlFor="atsms-unassign" className="mb-0 cursor-pointer font-normal">
                    {t("archive.unassignSubMembers")}
                  </Label>
                </div>
                {parent && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="MOVE_TO" id="atsms-move" />
                    <Label htmlFor="atsms-move" className="mb-0 cursor-pointer font-normal">
                      {t("labels.promoteSubMembers", { parent: parent.name })}
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          )}

          {archiveTeam.isError && (
            <FormError message={(archiveTeam.error as Error)?.message ?? tShared("errorOccurred")} />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={archiveTeam.isPending}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" onClick={handleArchive} disabled={archiveTeam.isPending}>
            {archiveTeam.isPending ? tShared("archiving") : tCommon("actions.archive")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
