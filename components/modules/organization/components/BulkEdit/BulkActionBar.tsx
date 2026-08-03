"use client";

import React from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";

type BulkActionBarProps = {
  selectedCount: number;
  allMatching: boolean;
  filterActive: boolean;
  onEdit: () => void;
  onClear: () => void;
  onSelectAllMatching: () => void;
};

export default function BulkActionBar({
  selectedCount,
  allMatching,
  filterActive,
  onEdit,
  onClear,
  onSelectAllMatching,
}: BulkActionBarProps) {
  const label = allMatching
    ? "All people matching the current filters"
    : `${selectedCount} selected`;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-brown-200 bg-brown-50 px-3 py-2">
      <span className="text-sm font-medium text-foreground">{label}</span>

      {!allMatching && filterActive ? (
        <button
          type="button"
          onClick={onSelectAllMatching}
          className="text-xs text-brown-700 underline-offset-2 hover:underline"
        >
          Select all matching filters
        </button>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" onClick={onEdit} className="gap-1.5">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={onClear} className="gap-1.5">
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
