"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Delete02Icon, FilterHorizontalIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/desact/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/desact/avatar";
import { Badge } from "@/components/desact/badge";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/desact/popover";
import { AudienceBuilder } from "@/components/audience/AudienceBuilder";
import { useSegmentResolve } from "@/components/audience/hooks/useSegmentResolve";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import { rolesOf, type Segment, type UserRefDTO } from "@/models/segment/Segment";
import { SearchBox } from "@/components/ui/SearchBox";
import { cn } from "@/lib/cn";
import type { Messages } from "@/i18n/messages";

/** A column's title, from `access` → `audience.peoplePicker.columns`. */
export type PeopleColumnHeaderKey = keyof Messages["access"]["audience"]["peoplePicker"]["columns"];

export type PeopleColumn = {
  key: string;
  headerKey: PeopleColumnHeaderKey;
  include?: string;
  render: (user: UserRefDTO) => React.ReactNode;
};

export const rolesColumn: PeopleColumn = {
  key: "roles",
  headerKey: "roles",
  include: "roles",
  render: (u) => {
    const roles = rolesOf(u);
    if (!roles.length) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((r) => (
          <Badge key={r.id} variant="neutral" className="font-normal">
            {r.name}
          </Badge>
        ))}
      </div>
    );
  },
};

type OrgRef = { id: string; name: string };
const orgRefOf = (u: UserRefDTO, key: string): OrgRef | null =>
  (u.extras?.[key] as OrgRef | undefined) ?? null;

const orgRefColumn = (key: string, headerKey: PeopleColumnHeaderKey): PeopleColumn => ({
  key,
  headerKey,
  include: key,
  render: (u) => {
    const ref = orgRefOf(u, key);
    return ref ? (
      <Badge variant="neutral" className="font-normal">
        {ref.name}
      </Badge>
    ) : (
      null
    );
  },
});

export const officeColumn: PeopleColumn = orgRefColumn("office", "office");
export const legalEntityColumn: PeopleColumn = orgRefColumn("legalEntity", "legalEntity");
export const departmentColumn: PeopleColumn = orgRefColumn("department", "department");

const orgRefsOf = (u: UserRefDTO, key: string): OrgRef[] =>
  (u.extras?.[key] as OrgRef[] | undefined) ?? [];

export const teamColumn: PeopleColumn = {
  key: "team",
  headerKey: "team",
  include: "team",
  render: (u) => {
    const teams = orgRefsOf(u, "team");
    if (!teams.length) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {teams.map((t) => (
          <Badge key={t.id} variant="neutral" className="font-normal">
            {t.name}
          </Badge>
        ))}
      </div>
    );
  },
};

export const calendarColumn: PeopleColumn = {
  key: "calendar",
  headerKey: "calendar",
  include: "calendar",
  render: (u) => {
    const calendars = orgRefsOf(u, "calendar");
    if (!calendars.length) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {calendars.map((c) => (
          <Badge key={c.id} variant="neutral" className="font-normal">
            {c.name}
          </Badge>
        ))}
      </div>
    );
  },
};

export type PeoplePickerProps = {
  fields: FieldDTO[] | undefined;
  /** Passed straight through to the builder — see its own note on why the two look alike. */
  isLoadingFields?: boolean;
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
  /** Hidden filters merged into the resolve segment (e.g. exclude already-assigned people). Not shown in the builder. */
  extraFilters?: FilterDTO[];
  /** Must match what the caller will send on apply, or the preview count lies. */
  includeInactive?: boolean;
  onIncludeInactiveChange?: (next: boolean) => void;
  /**
   * Why a person cannot be picked here, or null when they can — "Already assigned" for somebody who
   * already holds the target. For a target with no person field to exclude by (`extraFilters`); the
   * row stays in the list, greyed, rather than disappearing.
   */
  unavailableReason?: (user: UserRefDTO) => string | null;
};

function fullName(u: UserRefDTO) {
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || "—";
}

function initials(u: UserRefDTO) {
  const a = (u.firstName ?? "").trim();
  const b = (u.lastName ?? "").trim();
  const i = (a ? a[0] : "") + (b ? b[0] : "");
  return (i || (u.email?.[0] ?? "—")).toUpperCase();
}

export const PeoplePicker: React.FC<PeoplePickerProps> = ({
  fields,
  isLoadingFields,
  filters,
  onFiltersChange,
  isSelected,
  onToggle,
  allMatchingSelected,
  onToggleAllMatching,
  onMetaChange,
  columns = [rolesColumn],
  extraFilters,
  includeInactive = false,
  onIncludeInactiveChange,
  unavailableReason,
}) => {
  const t = useTranslations("access");
  const tCommon = useTranslations("common");
  const [query, setQuery] = React.useState("");
  const q = useDebouncedValue(query.trim(), 300);

  const include = React.useMemo(
    () => columns.map((c) => c.include).filter((k): k is string => Boolean(k)),
    [columns],
  );
  const colCount = 2 + columns.length; // checkbox + user + trailing columns

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

  // The same switch widens the search in both directions: people who have left, and people who have
  // not arrived. Both are "not an employee today", both are off by default, and a picker is exactly
  // where somebody sets up an account before the first day.
  const segment: Segment = React.useMemo(
    () => ({
      filters: [...filters, ...(extraFilters ?? [])],
      excludeUserIds: [],
      includeInactive,
      drafts: includeInactive ? "INCLUDE" : "EXCLUDE",
    }),
    [filters, extraFilters, includeInactive],
  );
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
              <Button type="button" variant="secondary" className="gap-1.5">
                <Icon icon={FilterHorizontalIcon} size="sm" />
                {t("audience.filter.button")}
                {filterCount > 0 && (
                  <Badge variant="neutral" className="ml-1 h-5 min-w-5 justify-center px-1 font-normal">
                    {filterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[660px] max-w-[92vw] p-3">
              <AudienceBuilder
                key={seed}
                fields={fields}
                isLoadingFields={isLoadingFields}
                value={draft}
                onChange={setDraft}
                includeInactive={includeInactive}
                onIncludeInactiveChange={onIncludeInactiveChange}
              />
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-divider pt-3">
                <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                  {tCommon("actions.reset")}
                </Button>
                <Button type="button" size="sm" onClick={applyFilters}>
                  {tCommon("actions.apply")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {filterCount > 0 && (
            <Button type="button"
              variant="ghost"
              size="icon" className="text-danger-text hover:text-status-declined-text"
              aria-label={t("audience.peoplePicker.clearFilters")}
              onClick={clearAll}
            >
              <Icon icon={Delete02Icon} size="sm" />
            </Button>
          )}
        </div>

        <SearchBox value={query} onChange={setQuery}/>
      </div>

      {/* Fixed-height table area so the modal keeps a constant size */}
      <div className="h-[380px] overflow-y-auto">
        {resolve.isLoading || matched.length > 0 ? (
          <table className="w-full caption-bottom text-body">
            <TableHeader className="sticky top-0 z-10 bg-card [&_tr]:border-divider">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={Boolean(allMatchingSelected)}
                    onCheckedChange={(v) => onToggleAllMatching?.(Boolean(v))}
                    aria-label={t("audience.peoplePicker.selectAllMatching")}
                    title={t("audience.peoplePicker.selectAllMatching")}
                    disabled={!onToggleAllMatching || total === 0}
                  />
                </TableHead>
                <TableHead>{t("audience.peoplePicker.user")}</TableHead>
                {columns.map((c) => (
                  <TableHead key={c.key}>{t(`audience.peoplePicker.columns.${c.headerKey}`)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {resolve.isLoading && matched.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colCount} className="py-6 text-center text-body text-tertiary">
                    {tCommon("states.loading")}
                  </TableCell>
                </TableRow>
              )}

              {matched.map((u) => {
                const unavailable = unavailableReason?.(u) ?? null;
                return (
                <TableRow
                  key={u.id}
                  className={cn("border-divider [&_td]:py-2", unavailable ? "text-tertiary" : "cursor-pointer hover:bg-subtle")}
                  onClick={unavailable ? undefined : () => onToggle(u)}
                >
                  <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={!unavailable && isSelected(u)}
                      disabled={Boolean(unavailable)}
                      onCheckedChange={() => onToggle(u)}
                      aria-label={
                        unavailable
                          ? t("audience.peoplePicker.unavailable", { name: fullName(u), reason: unavailable })
                          : undefined
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7 shrink-0">
                        {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt={fullName(u)} /> : null}
                        <AvatarFallback className="text-hint">{initials(u)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-body font-medium">{fullName(u)}</span>
                        <span className="block truncate text-hint text-tertiary">
                          {unavailable ? `${u.email ?? ""}${u.email ? " · " : ""}${unavailable}` : u.email}
                        </span>
                      </span>
                    </div>
                  </TableCell>

                  {columns.map((c) => (
                    <TableCell key={c.key}>{c.render(u)}</TableCell>
                  ))}
                </TableRow>
                );
              })}

              {resolve.hasNextPage && (
                <TableRow>
                  <TableCell colSpan={colCount} className="py-2 text-center">
                    <Button type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => resolve.fetchNextPage()}
                      disabled={resolve.isFetchingNextPage}
                    >
                      {resolve.isFetchingNextPage ? tCommon("states.loading") : t("audience.peoplePicker.loadMore")}
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        ) : (
          <EmptyState hasFilters={filterCount > 0 || q.length > 0} />
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ hasFilters: boolean }> = ({ hasFilters }) => {
  const t = useTranslations("access");
  return (
  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-subtle text-tertiary">
      <Icon icon={UserGroupIcon} size="lg" />
    </div>
    <p className="text-body font-medium">{t("audience.peoplePicker.empty.title")}</p>
    <p className="max-w-[280px] text-hint text-tertiary">
      {hasFilters ? t("audience.peoplePicker.empty.filtered") : t("audience.peoplePicker.empty.none")}
    </p>
  </div>
  );
};
