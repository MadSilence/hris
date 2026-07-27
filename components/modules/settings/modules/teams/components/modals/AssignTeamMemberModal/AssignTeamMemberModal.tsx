"use client";

import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { useAddTeamMember } from "@/components/modules/settings/modules/teams/hooks/useAddTeamMember/useAddTeamMember";

type Props = { open: boolean; onClose: () => void; teamId: string };

export function AssignTeamMemberModal({ open, onClose, teamId }: Props) {
  const [userId, setUserId] = useState("");
  const addMember = useAddTeamMember();

  const handleSubmit = async () => {
    if (!userId.trim()) return;
    await addMember.mutateAsync({ id: teamId, userId: userId.trim() });
    setUserId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setUserId(""); onClose(); } }}>
      <DialogContent onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}>
        <DialogHeader><DialogTitle>Add member</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="assign-team-member-userid">User ID</Label>
            <Input id="assign-team-member-userid" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter user ID" autoFocus />
            <p className="text-xs text-brown-400">Users can belong to multiple teams.</p>
          </div>
          {addMember.isError && <p className="text-sm text-red-500">{(addMember.error as Error)?.message ?? "An error occurred."}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setUserId(""); onClose(); }} disabled={addMember.isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={addMember.isPending || !userId.trim()}>
            {addMember.isPending ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
