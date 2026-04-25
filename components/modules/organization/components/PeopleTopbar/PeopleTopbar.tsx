"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/public/desact/src/components/ui/select";

import { Filter } from "@/components/models/filters";
import { PermissionGate } from "@/components/auth/PermissionGate";

export type FieldMeta = {
  id: string;
  key?: string;
  label?: string;
  type: "TEXT" | "EMAIL" | "URL" | "STATUS" | "SELECT" | "MULTI_SELECT" | "NUMBER" | "DATE" | "CHECKBOX" | "PERSON";
  isSystem?: boolean;
  options?: { id: string; value: string }[];
};

type ColumnItem = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  group?: "system" | "other";
  icon?: React.ReactNode;
};

type PeopleTopbarProps = {
  totalCount?: number;

  query: string;
  onQueryChange: (v: string) => void;

  columns: ColumnItem[];
  onColumnsChange?: (next: ColumnItem[]) => void;

  filters: Filter[];
  onFiltersChange: (next: Filter[]) => void;

  fieldsMeta: FieldMeta[];
  onExport?: () => void;

  selectedCount?: number;
};

export default function PeopleTopbar({
  totalCount,
  query,
  onQueryChange,
  columns,
  filters,
  onFiltersChange,
  onExport,
  selectedCount,
}: PeopleTopbarProps) {
  const selectedColumns = useMemo(() => columns.filter((c) => c.checked).length, [columns]);
  const [addAction, setAddAction] = useState<string>("");

  return (
    <div className="flex items-center justify-between gap-4 py-6">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Default</span>
          {selectedCount ? (
            <span className="rounded-md border border-brown-200 bg-brown-50 px-2 py-0.5 text-xs text-muted-foreground">
              {selectedCount} selected
            </span>
          ) : null}
          {filters.length > 0 ? (
            <span className="rounded-md border border-brown-200 bg-brown-50 px-2 py-0.5 text-xs text-muted-foreground">
              Filtered by {filters.length} {filters.length === 1 ? "rule" : "rules"}
              <button
                type="button"
                className="ml-2 text-foreground/80 hover:text-foreground"
                aria-label="Clear all filters"
                onClick={() => onFiltersChange([])}
              >
                ×
              </button>
            </span>
          ) : null}
        </div>

        <Button variant="outline" size="sm">
          Columns <span className="ml-1 text-muted-foreground">({selectedColumns})</span>
        </Button>

        <Button variant="outline" size="sm">
          Filter
        </Button>

        <span className="text-sm text-muted-foreground">{totalCount ?? 0}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-[320px] max-w-[40vw]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400 w-4 h-4"/>
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search people…"
            className="pl-10"
            aria-label="Search people"
          />
        </div>

        <Button variant="outline" size="sm" onClick={onExport}>
          Export
        </Button>

        <PermissionGate anyOf={["PERM_PEOPLE_EDIT"]}>
          <div className="min-w-[180px]">
            <Select
              value={addAction}
              onValueChange={(v) => {
                setAddAction(v);
                if (v) setTimeout(() => setAddAction(""), 0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add people"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Add manually</SelectItem>
                <SelectItem value="import">Import CSV</SelectItem>
                <SelectItem value="invite">Invite by email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PermissionGate>
      </div>
    </div>
  );
}
