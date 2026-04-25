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
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export interface RolesTableRowActionsProps {
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function RolesTableRowActions({
  onRename,
  onDuplicate,
  onDelete,
}: RolesTableRowActionsProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={[
            "transition-opacity",
            open ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          ].join(" ")}
          aria-label="Row actions"
        >
          <MoreHorizontal className="h-4 w-4"/>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onRename}>
          <Pencil className="h-4 w-4 mr-2"/>
          Rename
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="h-4 w-4 mr-2"/>
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuSeparator/>

        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2"/>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
