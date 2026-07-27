"use client";

import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { useSetDepartmentLead } from "@/components/modules/settings/modules/departments/hooks/useSetDepartmentLead/useSetDepartmentLead";

type Props = {
  open: boolean;
  onClose: () => void;
  departmentId: string;
  currentLeadId: string | null;
};

export function SetDepartmentLeadModal({ open, onClose, departmentId, currentLeadId }: Props) {
  const [userId, setUserId] = useState(currentLeadId ?? "");
  const setLead = useSetDepartmentLead();

  const handleSubmit = async () => {
    if (!userId.trim()) return;
    await setLead.mutateAsync({ id: departmentId, userId: userId.trim() });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set department lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="dept-lead-userid">User ID</Label>
            <Input
              id="dept-lead-userid"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              autoFocus
            />
            <p className="text-xs text-brown-400">
              The lead does not need to be a member of this department.
            </p>
          </div>

          {setLead.isError && (
            <p className="text-sm text-red-500">
              {(setLead.error as Error)?.message ?? "An error occurred."}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={setLead.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={setLead.isPending || !userId.trim()}>
            {setLead.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
