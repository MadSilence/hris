"use client";

import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { useAddDepartmentMember } from "@/components/modules/settings/modules/departments/hooks/useAddDepartmentMember/useAddDepartmentMember";

type Props = {
  open: boolean;
  onClose: () => void;
  departmentId: string;
};

export function AssignDepartmentMemberModal({ open, onClose, departmentId }: Props) {
  const [userId, setUserId] = useState("");
  const addMember = useAddDepartmentMember();

  const handleSubmit = async () => {
    if (!userId.trim()) return;
    await addMember.mutateAsync({ id: departmentId, userId: userId.trim() });
    setUserId("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setUserId(""); onClose(); } }}>
      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="assign-dept-member-userid">User ID</Label>
            <Input
              id="assign-dept-member-userid"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              autoFocus
            />
            <p className="text-xs text-brown-400">
              Assigning a user to this department will replace their current department assignment.
            </p>
          </div>

          {addMember.isError && (
            <p className="text-sm text-red-500">
              {(addMember.error as Error)?.message ?? "An error occurred."}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { setUserId(""); onClose(); }} disabled={addMember.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={addMember.isPending || !userId.trim()}>
            {addMember.isPending ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
