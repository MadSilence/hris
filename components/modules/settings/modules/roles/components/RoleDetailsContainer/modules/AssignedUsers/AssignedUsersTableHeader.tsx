"use client";

import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Download, Plus, Search } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";

export interface AssignedUsersTableHeaderProps {
  query: string;
  onQueryChange: (v: string) => void;
  /** Set to turn Assign off and say why; the backend refuses these cases anyway (R00009). */
  assignDisabledReason?: string;
  onAssignClick?: () => void;
  onExportClick: () => void;
}

export default function AssignedUsersTableHeader({
  query,
  onQueryChange,
  assignDisabledReason,
  onAssignClick,
  onExportClick,
}: AssignedUsersTableHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative w-[260px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400 w-4 h-4"/>
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search users"
          className="pl-9 w-[260px] h-9"
          inputMode="search"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Assigning roles is gated by PEOPLE.PROFILE MANAGE on the backend, not ROLES.ROLE. */}
        <PermissionGate resource="PEOPLE.PROFILE" action="MANAGE">
          <Button
            onClick={onAssignClick}
            disabled={!!assignDisabledReason}
            title={assignDisabledReason}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4"/>
            Assign
          </Button>
        </PermissionGate>

        <Button size="icon" variant="outline" onClick={onExportClick} aria-label="Export">
          <Download className="h-4 w-4"/>
        </Button>
      </div>
    </div>
  );
}
