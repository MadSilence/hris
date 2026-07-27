"use client";

import * as React from "react";
import { Filter, Search, Trash2, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/public/desact/src/components/ui/avatar";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Input } from "@/public/desact/src/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/public/desact/src/components/ui/popover";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import { useSegmentResolve } from "@/components/audience/hooks/useSegmentResolve";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import { rolesOf, type Segment, type UserRefDTO } from "@/models/segment/Segment";

// A configurable trailing column. `include` (optional) is the resolver key whose value the
// column renders from `u.extras` — so each place can show whatever it needs (roles, a custom
// attribute, …) without hardcoding it into the picker.
export type PeopleColumn = {
  key: string;
  header: string;
  include?: string;
  render: (user: UserRefDTO) => React.ReactNode;
};

// Default column: the user's current roles.
export const rolesColumn: PeopleColumn = {
  key: "roles",
  header: "Current roles",
  include: "roles",
  render: (u) => {
    const roles = rolesOf(u);
    if (!roles.length) return <span className="text-sm text-muted-foreground">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((r) => (
          <Badge key={r.id} variant="secondary" className="font-normal">
            {r.name}
          </Badge>
        ))}
      </div>
    );
  },
};

export type PeoplePickerProps = {
  fields: FieldDTO[] | undefined;
  filters: FilterDTO[];
  onFiltersChange: (next: FilterDTO[]) => void;
  /** Whether a given row is selected (lets the parent model manual sets or all-minus-excluded). */
  isSelected: (user: UserRefDTO) => boolean;
  onToggle: (user: UserRefDTO) => void;
  /** Header checkbox = "select everyone who matches" (across all pages, not just the loaded one). */
  allMatchingSelected?: boolean;
  onToggleAllMatching?: (checked: boolean) => void;
  onMetaChange?: (meta: { total: number }) => void;
  /** Trailing columns after the fixed User column. Defaults to the roles column. */
  columns?: PeopleColumn[];
};

function fullName(u: UserRefDTO) {
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
}

function initials(u: UserRefDTO) {
  const a = (u.firstName ?? "").trim();
  const b = (u.lastName ?? "").trim();
  const i = (a ? a[0] : "") + (b ? b[0] : "");
  return (i || (u.email[0] ?? "—")).toUpperCase();
}

export const PeoplePicker: React.FC<PeoplePickerProps> = ({
  fields,
  filters,
  onFiltersChange,
  isSelected,
  onToggle,
  allMatchingSelected,
  onToggleAllMatching,
  onMetaChange,
  columns = [rolesColumn],
}) => {
  const [query, setQuery] = React.useState("");
  const q = useDebouncedValue(query.trim(), 300);

  const include = React.useMemo(
    () => columns.map((c) => c.include).filter((k): k is string => Boolean(k)),
    [columns],
  );
  const colCount = 2 + columns.length; // checkbox + user + trailing columns

  // Filter dropdown edits a draft; it only hits the table on Apply.
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<FilterDTO[]>(filters);
  const [seed, setSeed] = React.useState(0); // remounts the builder to reseed from draft

  const openChange = (o: boolean) => {
    if (o) {
      setDraft(filters);
      setSeed((s) => s + 1);
    }
    setOpen(o);
  };

  const applyFilters = () => {
    onFiltersChange(draft);
    setOpen(false);
  };
  const resetFilters = () => {
    setDraft([]);
    onFiltersChange([]);
    setSeed((s) => s + 1);
  };
  const clearAll = () => {
    setDraft([]);
    onFiltersChange([]);
  };

  const segment: Segment = React.useMemo(() => ({ filters, excludeUserIds: [] }), [filters]);
  const resolve = useSegmentResolve(segment, true, q, include);
  const matched = resolve.items;
  const total = resolve.total;

  React.useEffect(() => {
    onMetaChange?.({ total });
  }, [total, onMetaChange]);

  const filterCount = filters.length;

  return (
    <div className="flex flex-col gap-3 p-1">
      {/* Toolbar: filter (left) + clear, search (right) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Popover open={open} onOpenChange={openChange}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1.5">
                <Filter className="h-4 w-4" />
                Filter
                {filterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center px-1 font-normal">
                    {filterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[660px] max-w-[92vw] p-3">
              <AudienceBuilder key={seed} fields={fields} value={draft} onChange={setDraft} />
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-brown-100 pt-3">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
                <Button size="sm" onClick={applyFilters}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {filterCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-red-600 hover:text-red-700"
              aria-label="Clear all filters"
              onClick={clearAll}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="relative w-[260px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            className="h-9 w-[260px] pl-9"
            inputMode="search"
          />
        </div>
      </div>

      {/* Fixed-height table area so the modal keeps a constant size */}
      <div className="h-[380px] overflow-y-auto">
        {resolve.isLoading || matched.length > 0 ? (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white [&_tr]:border-brown-200">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={Boolean(allMatchingSelected)}
                    onCheckedChange={(v) => onToggleAllMatching?.(Boolean(v))}
                    aria-label="Select everyone who matches"
                    title="Select everyone who matches"
                    disabled={!onToggleAllMatching || total === 0}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                {columns.map((c) => (
                  <TableHead key={c.key}>{c.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {resolve.isLoading && matched.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colCount} className="py-6 text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}

              {matched.map((u) => (
                <TableRow
                  key={u.id}
                  className="cursor-pointer border-brown-200 hover:bg-brown-50 [&_td]:py-2"
                  onClick={() => onToggle(u)}
                >
                  <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={isSelected(u)} onCheckedChange={() => onToggle(u)} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7 shrink-0">
                        {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt={fullName(u)} /> : null}
                        <AvatarFallback className="text-[11px]">{initials(u)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{fullName(u)}</span>
                        <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
                      </span>
                    </div>
                  </TableCell>

                  {columns.map((c) => (
                    <TableCell key={c.key}>{c.render(u)}</TableCell>
                  ))}
                </TableRow>
              ))}

              {resolve.hasNextPage && (
                <TableRow>
                  <TableCell colSpan={colCount} className="py-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolve.fetchNextPage()}
                      disabled={resolve.isFetchingNextPage}
                    >
                      {resolve.isFetchingNextPage ? "Loading…" : "Load more"}
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <EmptyState hasFilters={filterCount > 0 || q.length > 0} />
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ hasFilters: boolean }> = ({ hasFilters }) => (
  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brown-50 text-brown-400">
      <Users className="h-6 w-6" />
    </div>
    <p className="text-sm font-medium">No people found</p>
    <p className="max-w-[280px] text-xs text-muted-foreground">
      {hasFilters
        ? "Nobody matches the current filters or search. Try loosening them."
        : "There are no people to show yet."}
    </p>
  </div>
);
