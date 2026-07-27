"use client";

import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
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
  const [targetDepartmentId, setTargetDepartmentId] = useState("");

  const hasChildren = (department.children?.length ?? 0) > 0;
  const hasMoved = membersStrategy === "MOVE_TO";
  const canSubmit = !hasMoved || !!targetDepartmentId;

  const moveTargetOptions = allDepartments.filter(
    (d) => d.id !== department.id && d.status === "ACTIVE",
  );

  const handleDelete = async () => {
    await deleteDepartment.mutateAsync({
      id: department.id,
      childrenStrategy,
      membersStrategy,
      targetDepartmentId: hasMoved ? targetDepartmentId : null,
    });
    onDeleted();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{department.name}&rdquo;</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm text-brown-700">
          <p>This action cannot be undone. Choose how to handle existing children and members.</p>

          {hasChildren && (
            <div className="space-y-1.5">
              <Label>Sub-departments</Label>
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="childrenStrategy"
                    value="PROMOTE"
                    checked={childrenStrategy === "PROMOTE"}
                    onChange={() => setChildrenStrategy("PROMOTE")}
                  />
                  Promote to parent level
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="childrenStrategy"
                    value="DELETE_CASCADE"
                    checked={childrenStrategy === "DELETE_CASCADE"}
                    onChange={() => setChildrenStrategy("DELETE_CASCADE")}
                  />
                  Delete all sub-departments
                </label>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Members</Label>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="membersStrategy"
                  value="UNASSIGN"
                  checked={membersStrategy === "UNASSIGN"}
                  onChange={() => setMembersStrategy("UNASSIGN")}
                />
                Unassign (remove from department)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="membersStrategy"
                  value="MOVE_TO"
                  checked={membersStrategy === "MOVE_TO"}
                  onChange={() => setMembersStrategy("MOVE_TO")}
                />
                Move to another department
              </label>
            </div>

            {hasMoved && (
              <select
                value={targetDepartmentId}
                onChange={(e) => setTargetDepartmentId(e.target.value)}
                className="mt-2 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Select target department…</option>
                {moveTargetOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
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
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteDepartment.isPending || !canSubmit}
          >
            {deleteDepartment.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
