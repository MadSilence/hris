"use client";

import { useEffect, useState } from "react";
import { Columns3, Filter as FilterIcon, Plus, Search } from "lucide-react";

import { Input } from "@/public/desact/src/components/ui/input";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/public/desact/src/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";

import { PermissionGate } from "@/components/auth/PermissionGate";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import { ColumnsManager } from "@/components/modules/organization/components/PeopleTopbar/components/ColumnsManager";
import type { ColumnItem } from "@/models/userTable";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";

export type FieldMeta = Pick<FieldDTO, "id" | "key" | "label" | "type" | "isSystem" | "options">;

const PINNED_COLUMN_ID = "sys:first_name";

type PeopleTopbarProps = {
  query: string;
  onQueryChangeAction: (v: string) => void;
  columns: ColumnItem[];
  onColumnsChangeAction: (next: ColumnItem[]) => void;
  filters: FilterDTO[];
  onFiltersChangeAction: (next: FilterDTO[]) => void;
  fields: FieldDTO[];
  selectedCount?: number;
  onAddManuallyAction?: () => void;
  onImportCsvAction?: () => void;
  onInviteByEmailAction?: () => void;
};

export default function PeopleTopbar({
  query,
  onQueryChangeAction,
  columns,
  onColumnsChangeAction,
  filters,
  onFiltersChangeAction,
  fields,
  selectedCount = 0,
  onAddManuallyAction,
  onImportCsvAction,
  onInviteByEmailAction,
}: PeopleTopbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDTO[]>(filters);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    if (filterOpen) {
      setDraft(filters);
      setSeed((s) => s + 1);
    }
  }, [filterOpen, filters]);

  const applyFilters = () => {
    onFiltersChangeAction(draft);
    setFilterOpen(false);
  };
  const resetFilters = () => setDraft([]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-background py-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {selectedCount > 0 ? (
          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
            {selectedCount} selected
          </span>
        ) : null}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Columns3 className="h-4 w-4" />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-2">
            <ColumnsManager
              columns={columns}
              onChange={onColumnsChangeAction}
              pinnedId={PINNED_COLUMN_ID}
            />
          </PopoverContent>
        </Popover>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FilterIcon className="h-4 w-4" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[660px] max-w-[92vw] p-3">
            <AudienceBuilder key={seed} fields={fields} value={draft} onChange={setDraft} />
            <div className="mt-3 flex items-center justify-end gap-2 border-t pt-3">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[320px] max-w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChangeAction(e.target.value)}
            placeholder="Search people…"
            className="h-9 pl-9"
            aria-label="Search people"
          />
        </div>

        <PermissionGate resource="PEOPLE.PROFILE" action="EDIT">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add people
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAddManuallyAction?.()}>Add manually</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onImportCsvAction?.()}>Import CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInviteByEmailAction?.()}>Invite by email</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </PermissionGate>
      </div>
    </div>
  );
}
