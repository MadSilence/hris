"use client";

import * as React from "react";
import { Archive02Icon, ArchiveArrowUpIcon, Copy01Icon, Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
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
    <RowActionsMenu label="Role actions">
      <PermissionGate resource="ROLES.ROLE" action="EDIT">
        <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={onRename} disabled={locked}>
          Rename
        </RowAction>

        <RowAction icon={<Icon icon={Copy01Icon} size="sm" />} onClick={onDuplicate}>
          Duplicate
        </RowAction>

        {archived ? (
          <RowAction icon={<Icon icon={ArchiveArrowUpIcon} size="sm" />} onClick={onRestore}>
            Unarchive
          </RowAction>
        ) : (
          <RowAction icon={<Icon icon={Archive02Icon} size="sm" />} onClick={onArchive} disabled={locked}>
            Archive
          </RowAction>
        )}
      </PermissionGate>

      <PermissionGate resource="ROLES.ROLE" action="MANAGE">
        <RowActionDestructive
          icon={<Icon icon={Delete02Icon} size="sm" />}
          onClick={onDelete}
          disabled={locked}
        >
          Delete
        </RowActionDestructive>
      </PermissionGate>
    </RowActionsMenu>
  );
}
