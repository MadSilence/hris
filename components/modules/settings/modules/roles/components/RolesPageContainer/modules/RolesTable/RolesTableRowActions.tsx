"use client";

import * as React from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { PermissionGate } from "@/components/auth/PermissionGate";

export interface RolesTableRowActionsProps {
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  // System owner / default roles can't be renamed or deleted.
  locked?: boolean;
}

export default function RolesTableRowActions({
  onRename,
  onDuplicate,
  onDelete,
  locked = false,
}: RolesTableRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-brown-500 hover:bg-brown-50 hover:text-brown-700"
          aria-label="Row actions"
        >
          <MoreVertical className="h-4 w-4"/>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44 rounded-lg p-1.5">
        <PermissionGate resource="ROLES.ROLE" action="EDIT">
          <DropdownMenuItem
            onClick={onRename}
            disabled={locked}
            className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
          >
            <Pencil className="h-4 w-4 text-muted-foreground"/>
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onDuplicate} className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer">
            <Copy className="h-4 w-4 text-muted-foreground"/>
            Duplicate
          </DropdownMenuItem>
        </PermissionGate>

        <PermissionGate resource="ROLES.ROLE" action="MANAGE">
          <DropdownMenuSeparator className="my-1.5 bg-brown-100"/>

          <DropdownMenuItem
            onClick={onDelete}
            disabled={locked}
            className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
          >
            <Trash2 className="h-4 w-4"/>
            Delete
          </DropdownMenuItem>
        </PermissionGate>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
