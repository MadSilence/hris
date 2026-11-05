"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { useArchiveDepartment } from "@/components/modules/settings/modules/departments/hooks/useArchiveDepartment/useArchiveDepartment";
import type { DepartmentTreeNode } from "@/models/departments";
import type {
  DepartmentArchiveChildrenStrategy,
  DepartmentArchiveMembersStrategy,
} from "@/models/departments/ArchiveDepartmentPayload";
import { FormError } from "@/components/feedback/FormError";

type Props = {
  open: boolean;
  onClose: () => void;
  department: DepartmentTreeNode;
  allDepartments: DepartmentTreeNode[];
  onArchived: () => void;
};

function sumDescendantMembers(node: DepartmentTreeNode): number {
  let total = 0;
  for (const child of node.children ?? []) {
    total += child.memberCount + sumDescendantMembers(child);
  }
  return total;
}

export function ArchiveDepartmentModal({
  open, onClose, department, allDepartments, onArchived,
}: Props) {
  const t = useTranslations("structure.departments");
  const tShared = useTranslations("structure.shared");
  const tCommon = useTranslations("common");
  const archiveDepartment = useArchiveDepartment();

  const [childrenStrategy, setChildrenStrategy] =
    useState<DepartmentArchiveChildrenStrategy>("ARCHIVE_CASCADE");
  const [membersStrategy, setMembersStrategy] =
    useState<DepartmentArchiveMembersStrategy>("UNASSIGN");
  const [subMembersStrategy, setSubMembersStrategy] =
    useState<DepartmentArchiveMembersStrategy>("UNASSIGN");

  const hasChildren = (department.children?.length ?? 0) > 0;
  const hasMembers = department.memberCount > 0;
  const subMembersCount = sumDescendantMembers(department);
  const parent = department.parentId
    ? allDepartments.find((d) => d.id === department.parentId) ?? null
    : null;

  const cascading = hasChildren && childrenStrategy === "ARCHIVE_CASCADE";

  const effectiveMembersStrategy: DepartmentArchiveMembersStrategy =
    membersStrategy === "MOVE_TO" && !parent ? "UNASSIGN" : membersStrategy;
  const effectiveSubMembersStrategy: DepartmentArchiveMembersStrategy =
    subMembersStrategy === "MOVE_TO" && !parent ? "UNASSIGN" : subMembersStrategy;

  const wantsMove =
    (hasMembers && effectiveMembersStrategy === "MOVE_TO") ||
    (cascading && subMembersCount > 0 && effectiveSubMembersStrategy === "MOVE_TO");

  const handleArchive = async () => {
    await archiveDepartment.mutateAsync({
      id: department.id,
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
          <DialogTitle>{t("archive.title", { name: department.name })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2 text-body text-secondary">
          <p>{t("archive.intro")}</p>

          {hasChildren && (
            <div className="space-y-2">
              <Label>{t("labels.subUnits")}</Label>
              <RadioGroup
                value={childrenStrategy}
                onValueChange={(v) => setChildrenStrategy(v as DepartmentArchiveChildrenStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="ARCHIVE_CASCADE" id="acs-cascade" />
                  <Label htmlFor="acs-cascade" className="mb-0 cursor-pointer font-normal">
                    {t("archive.archiveAllSub")}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="PROMOTE" id="acs-promote" />
                  <Label htmlFor="acs-promote" className="mb-0 cursor-pointer font-normal">
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
                onValueChange={(v) => setMembersStrategy(v as DepartmentArchiveMembersStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="UNASSIGN" id="ams-unassign" />
                  <Label htmlFor="ams-unassign" className="mb-0 cursor-pointer font-normal">
                    {t("archive.unassignMembers")}
                  </Label>
                </div>
                {parent && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="MOVE_TO" id="ams-move" />
                    <Label htmlFor="ams-move" className="mb-0 cursor-pointer font-normal">
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
                onValueChange={(v) => setSubMembersStrategy(v as DepartmentArchiveMembersStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="UNASSIGN" id="asms-unassign" />
                  <Label htmlFor="asms-unassign" className="mb-0 cursor-pointer font-normal">
                    {t("archive.unassignSubMembers")}
                  </Label>
                </div>
                {parent && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="MOVE_TO" id="asms-move" />
                    <Label htmlFor="asms-move" className="mb-0 cursor-pointer font-normal">
                      {t("labels.promoteSubMembers", { parent: parent.name })}
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          )}

          {archiveDepartment.isError && (
            <FormError message={(archiveDepartment.error as Error)?.message ?? tShared("errorOccurred")} />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={archiveDepartment.isPending}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" onClick={handleArchive} disabled={archiveDepartment.isPending}>
            {archiveDepartment.isPending ? tShared("archiving") : tCommon("actions.archive")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
