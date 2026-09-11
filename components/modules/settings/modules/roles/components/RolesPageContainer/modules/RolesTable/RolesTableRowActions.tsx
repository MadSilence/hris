"use client";

import * as React from "react";
import { Archive, ArchiveRestore, Copy, Pencil, Trash2 } from "lucide-react";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { PermissionGate } from "@/components/auth/PermissionGate";

export interface RolesTableRowActionsProps {
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onRestore: () => void;
  // System owner / default roles can't be renamed, archived or deleted.
  locked?: boolean;
  archived?: boolean;
}

export default function RolesTableRowActions({
  onRename,
  onDuplicate,
  onDelete,
  onArchive,
  onRestore,
  locked = false,
  archived = false,
}: RolesTableRowActionsProps) {
  return (
    <RowActionsMenu label="Role Actions">
      <PermissionGate resource="ROLES.ROLE" action="EDIT">
        <RowAction icon={<Pencil className="h-4 w-4" />} onClick={onRename} disabled={locked}>
          Rename
        </RowAction>

        <RowAction icon={<Copy className="h-4 w-4" />} onClick={onDuplicate}>
          Duplicate
        </RowAction>

        {archived ? (
          <RowAction icon={<ArchiveRestore className="h-4 w-4" />} onClick={onRestore}>
            Unarchive
          </RowAction>
        ) : (
          <RowAction icon={<Archive className="h-4 w-4" />} onClick={onArchive} disabled={locked}>
            Archive
          </RowAction>
        )}
      </PermissionGate>

      <PermissionGate resource="ROLES.ROLE" action="MANAGE">
        <RowActionDestructive
          icon={<Trash2 className="h-4 w-4" />}
          onClick={onDelete}
          disabled={locked}
        >
          Delete
        </RowActionDestructive>
      </PermissionGate>
    </RowActionsMenu>
  );
}
