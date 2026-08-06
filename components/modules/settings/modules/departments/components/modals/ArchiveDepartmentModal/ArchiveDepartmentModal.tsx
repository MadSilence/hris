"use client";

import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/public/desact/src/components/ui/radio-group";
import { useArchiveDepartment } from "@/components/modules/settings/modules/departments/hooks/useArchiveDepartment/useArchiveDepartment";
import type { DepartmentTreeNode } from "@/models/departments";
import type {
  DepartmentArchiveChildrenStrategy,
  DepartmentArchiveMembersStrategy,
} from "@/models/departments/ArchiveDepartmentPayload";

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
          <DialogTitle>Archive &ldquo;{department.name}&rdquo;</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2 text-sm text-brown-700">
          <p>
            Archiving hides this department from active views. Choose how to handle its
            sub-departments and members.
          </p>

          {hasChildren && (
            <div className="space-y-2">
              <Label>Sub-departments</Label>
              <RadioGroup
                value={childrenStrategy}
                onValueChange={(v) => setChildrenStrategy(v as DepartmentArchiveChildrenStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="ARCHIVE_CASCADE" id="acs-cascade" />
                  <Label htmlFor="acs-cascade" className="mb-0 cursor-pointer font-normal">
                    Archive all sub-departments
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="PROMOTE" id="acs-promote" />
                  <Label htmlFor="acs-promote" className="mb-0 cursor-pointer font-normal">
                    Promote all sub-departments to parent level
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
                onValueChange={(v) => setMembersStrategy(v as DepartmentArchiveMembersStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="UNASSIGN" id="ams-unassign" />
                  <Label htmlFor="ams-unassign" className="mb-0 cursor-pointer font-normal">
                    Unassign users from this department
                  </Label>
                </div>
                {parent && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="MOVE_TO" id="ams-move" />
                    <Label htmlFor="ams-move" className="mb-0 cursor-pointer font-normal">
                      Promote to parent level ({parent.name})
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          )}

          {cascading && subMembersCount > 0 && (
            <div className="space-y-2">
              <Label>Members of sub-departments</Label>
              <RadioGroup
                value={effectiveSubMembersStrategy}
                onValueChange={(v) => setSubMembersStrategy(v as DepartmentArchiveMembersStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="UNASSIGN" id="asms-unassign" />
                  <Label htmlFor="asms-unassign" className="mb-0 cursor-pointer font-normal">
                    Unassign users from all sub-departments
                  </Label>
                </div>
                {parent && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="MOVE_TO" id="asms-move" />
                    <Label htmlFor="asms-move" className="mb-0 cursor-pointer font-normal">
                      Promote all sub-department users to parent level ({parent.name})
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          )}

          {archiveDepartment.isError && (
            <p className="text-red-500">
              {(archiveDepartment.error as Error)?.message ?? "An error occurred."}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={archiveDepartment.isPending}>
            Cancel
          </Button>
          <Button onClick={handleArchive} disabled={archiveDepartment.isPending}>
            {archiveDepartment.isPending ? "Archiving…" : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
