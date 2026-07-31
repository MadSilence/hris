"use client";

import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/public/desact/src/components/ui/radio-group";
import { useDeleteDepartment } from "@/components/modules/settings/modules/departments/hooks/useDeleteDepartment/useDeleteDepartment";
import type { DepartmentTreeNode } from "@/models/departments";
import type { DepartmentChildrenStrategy, DepartmentMembersStrategy } from "@/models/departments/DeleteDepartmentPayload";

type Props = {
  open: boolean;
  onClose: () => void;
  department: DepartmentTreeNode;
  allDepartments: DepartmentTreeNode[];
  onDeleted: () => void;
};

export function DeleteDepartmentModal({ open, onClose, department, allDepartments, onDeleted }: Props) {
  const deleteDepartment = useDeleteDepartment();
  const [childrenStrategy, setChildrenStrategy] = useState<DepartmentChildrenStrategy>("PROMOTE");
  const [membersStrategy, setMembersStrategy] = useState<DepartmentMembersStrategy>("UNASSIGN");

  const hasChildren = (department.children?.length ?? 0) > 0;
  const parent = department.parentId
    ? allDepartments.find((d) => d.id === department.parentId) ?? null
    : null;

  const effectiveMembersStrategy: DepartmentMembersStrategy =
    membersStrategy === "MOVE_TO" && !parent ? "UNASSIGN" : membersStrategy;

  const handleDelete = async () => {
    await deleteDepartment.mutateAsync({
      id: department.id,
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
          <DialogTitle>Delete &ldquo;{department.name}&rdquo;</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2 text-sm text-brown-700">
          <p>This action cannot be undone. Choose how to handle existing children and members.</p>

          {hasChildren && (
            <div className="space-y-2">
              <Label>Sub-departments</Label>
              <RadioGroup
                value={childrenStrategy}
                onValueChange={(v) => setChildrenStrategy(v as DepartmentChildrenStrategy)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="PROMOTE" id="cs-promote" />
                  <Label htmlFor="cs-promote" className="mb-0 cursor-pointer font-normal">
                    Promote to parent level
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="DELETE_CASCADE" id="cs-cascade" />
                  <Label htmlFor="cs-cascade" className="mb-0 cursor-pointer font-normal">
                    Delete all sub-departments
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label>Members</Label>
            <RadioGroup
              value={effectiveMembersStrategy}
              onValueChange={(v) => setMembersStrategy(v as DepartmentMembersStrategy)}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="UNASSIGN" id="ms-unassign" />
                <Label htmlFor="ms-unassign" className="mb-0 cursor-pointer font-normal">
                  Unassign (remove from department)
                </Label>
              </div>
              {parent && (
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="MOVE_TO" id="ms-move" />
                  <Label htmlFor="ms-move" className="mb-0 cursor-pointer font-normal">
                    Move to parent department ({parent.name})
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {deleteDepartment.isError && (
            <p className="text-red-500">
              {(deleteDepartment.error as Error)?.message ?? "An error occurred."}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleteDepartment.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteDepartment.isPending}>
            {deleteDepartment.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
