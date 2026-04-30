"use client";

import { ReactNode, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";

import { Filter } from "@/components/models/filters";
import { PermissionGate } from "@/components/auth/PermissionGate";

export type FieldMeta = {
  id: string;
  key?: string;
  label?: string;
  type:
    | "TEXT"
    | "EMAIL"
    | "URL"
    | "STATUS"
    | "SELECT"
    | "MULTI_SELECT"
    | "NUMBER"
    | "DATE"
    | "CHECKBOX"
    | "PERSON";
  isSystem?: boolean;
  options?: { id: string; value: string }[] | null;
};

type ColumnItem = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  group?: "system" | "other";
  icon?: ReactNode;
};

type PeopleTopbarProps = {
  totalCount?: number;

  query: string;
  onQueryChangeAction: (v: string) => void;

  columns: ColumnItem[];
  onColumnsChangeAction?: (next: ColumnItem[]) => void;

  filters: Filter[];
  onFiltersChangeAction: (next: Filter[]) => void;

  fieldsMeta?: FieldMeta[];
  onExportAction?: () => void;

  selectedCount?: number;

  onAddManuallyAction?: () => void;
  onImportCsvAction?: () => void;
  onInviteByEmailAction?: () => void;
};

export default function PeopleTopbar({
  totalCount,
  query,
  onQueryChangeAction,
  columns,
  filters,
  onFiltersChangeAction,
  onExportAction,
  selectedCount = 0,
  onAddManuallyAction,
  onImportCsvAction,
  onInviteByEmailAction,
}: PeopleTopbarProps) {
  const selectedColumns = useMemo(
    () => columns.filter((column) => column.checked).length,
    [columns]
  );

  const [addAction, setAddAction] = useState("");

  const handleAddAction = (value: string) => {
    setAddAction(value);

    switch (value) {
      case "single":
        onAddManuallyAction?.();
        break;
      case "import":
        onImportCsvAction?.();
        break;
      case "invite":
        onInviteByEmailAction?.();
        break;
    }

    window.setTimeout(() => setAddAction(""), 0);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-background py-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground">Default</span>

        {selectedCount > 0 ? (
          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
            {selectedCount} selected
          </span>
        ) : null}

        {filters.length > 0 ? (
          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
            Filtered by {filters.length} {filters.length === 1 ? "rule" : "rules"}
            <button
              type="button"
              className="ml-2 text-muted-foreground hover:text-foreground"
              aria-label="Clear all filters"
              onClick={() => onFiltersChangeAction([])}
            >
              ×
            </button>
          </span>
        ) : null}

        <Button variant="outline" size="sm">
          Columns
          <span className="ml-1 text-muted-foreground">({selectedColumns})</span>
        </Button>

        <Button variant="outline" size="sm">
          Filter
        </Button>

        <span className="text-sm text-muted-foreground">{totalCount ?? 0}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[320px] max-w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
          <Input
            value={query}
            onChange={(e) => onQueryChangeAction(e.target.value)}
            placeholder="Search people…"
            className="h-9 pl-9"
            aria-label="Search people"
          />
        </div>

        <Button variant="outline" size="sm" onClick={onExportAction}>
          Export
        </Button>

        <PermissionGate anyOf={["PERM_PEOPLE_EDIT"]}>
          <Select value={addAction} onValueChange={handleAddAction}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Add people"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Add manually</SelectItem>
              <SelectItem value="import">Import CSV</SelectItem>
              <SelectItem value="invite">Invite by email</SelectItem>
            </SelectContent>
          </Select>
        </PermissionGate>
      </div>
    </div>
  );
}
