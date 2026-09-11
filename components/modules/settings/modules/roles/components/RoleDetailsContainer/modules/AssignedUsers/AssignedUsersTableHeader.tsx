"use client";

import { Button } from "@/public/desact/src/components/ui/button";
import { Download, Plus } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { SearchBox } from "@/components/ui/SearchBox";

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
      <SearchBox value={query} onChange={onQueryChange}/>

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
