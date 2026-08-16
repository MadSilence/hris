"use client";

import { FC, useMemo, useState } from "react";
import { Archive, Layers, MoreVertical, Pencil, Plus, Search } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Input } from "@/public/desact/src/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { LeaveTypesSettingsSkeleton } from "../LeaveTypesSettingsSkeleton";
import { LeaveTypeCategoryChip } from "../LeaveTypeCategoryChip/LeaveTypeCategoryChip";
import { LeaveTypeCategory, LeaveTypeStatus } from "@/api/modules/timeOff/leaveTypes/dto";
import type { LeaveType } from "@/models/timeOff";

type Props = {
  leaveTypes: LeaveType[];
  isLoading: boolean;
  onCreateAction: () => void;
  onOpenAction: (leaveType: LeaveType) => void;
  onEditAction: (leaveType: LeaveType) => void;
  onArchiveAction: (leaveType: LeaveType) => void;
};

function statusBadge(status: LeaveTypeStatus) {
  switch (status) {
    case LeaveTypeStatus.Archived:
      return { label: "Archived", className: "border-amber-200 bg-amber-50 text-amber-700" };
    default:
      return { label: "Active", className: "border-green-200 bg-green-50 text-green-700" };
  }
}

const CATEGORY_LABELS: Record<LeaveTypeCategory, string> = {
  [LeaveTypeCategory.Vacation]: "Vacation",
  [LeaveTypeCategory.Sick]: "Sick",
  [LeaveTypeCategory.Parental]: "Parental",
  [LeaveTypeCategory.Unpaid]: "Unpaid",
  [LeaveTypeCategory.Other]: "Other",
};

export const LeaveTypesSettingsComponent: FC<Props> = ({
  leaveTypes,
  isLoading,
  onCreateAction,
  onOpenAction,
  onEditAction,
  onArchiveAction,
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leaveTypes;
    return leaveTypes.filter((t) =>
      [t.name, t.description, t.category ? CATEGORY_LABELS[t.category] : null]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [leaveTypes, query]);

  const hasLeaveTypes = leaveTypes.length > 0;

  const addButton = (
    <Button className="gap-1.5" onClick={onCreateAction}>
      <Plus className="h-4 w-4" />
      Add type
    </Button>
  );

  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col overflow-hidden">
      <div className="shrink-0 px-8 pt-2">
        <div className="space-y-2">
          <SettingsPageHeader title="Time off" backHref="/settings" />
          <PageDescription className="text-base text-muted-foreground/90">
            Leave types are the categories of time off in your organization — Vacation, Sick,
            Parental and more. Each type holds one or more policies with the actual rules.
          </PageDescription>
        </div>

        {/* Info block */}
        <div className="space-y-1 pb-1 pt-5">
          <h2 className="text-lg font-semibold text-foreground">Leave types</h2>
          <p className="text-sm text-muted-foreground">
            Open a type to manage its policies (quotas, accrual, carryover and approvals).
          </p>
        </div>

        {/* Toolbar: search (left) + actions (right) */}
        <div className="flex items-center justify-between gap-4 py-5">
          <div className="relative w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              className="h-9 w-[260px] pl-9"
              placeholder="Search leave types"
              inputMode="search"
            />
          </div>

          <div className="flex items-center gap-3">{addButton}</div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-8 pb-6">
        {!isLoading && !hasLeaveTypes ? (
          <EmptyState action={addButton} />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <table className="w-full caption-bottom text-sm table-fixed">
              <TableHeader className="[&_tr]:border-brown-200 sticky top-0 z-10 bg-white">
                <TableRow>
                  <TableHead className="pl-4">Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <LeaveTypesSettingsSkeleton />
                ) : filtered.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4}>
                      <SearchEmptyState query={query} noun="leave types" />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((leaveType) => {
                    const badge = statusBadge(leaveType.status);
                    return (
                      <TableRow
                        key={leaveType.id}
                        className="group border-brown-200 cursor-pointer hover:bg-brown-50 [&_td]:py-2"
                        onClick={() => onOpenAction(leaveType)}
                      >
                        <TableCell className="py-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-2.5 w-2.5 flex-none rounded-full border border-brown-200"
                              style={{ backgroundColor: leaveType.color ?? "#e7e0d8" }}
                            />
                            <div className="min-w-0">
                              <span className="font-medium text-primary">{leaveType.name}</span>
                              {leaveType.description && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {leaveType.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <LeaveTypeCategoryChip category={leaveType.category} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={badge.className}>
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-brown-500 hover:bg-brown-50 hover:text-brown-700"
                                  aria-label="Leave type actions"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 rounded-lg p-1.5">
                                <DropdownMenuItem
                                  onClick={() => onEditAction(leaveType)}
                                  className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                >
                                  <Pencil className="h-4 w-4 text-muted-foreground" />
                                  Edit
                                </DropdownMenuItem>

                                {leaveType.status === LeaveTypeStatus.Active && (
                                  <>
                                    <DropdownMenuSeparator className="my-1.5 bg-brown-100" />
                                    <DropdownMenuItem
                                      onClick={() => onArchiveAction(leaveType)}
                                      className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                    >
                                      <Archive className="h-4 w-4 text-muted-foreground" />
                                      Archive
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

function SearchEmptyState({ query, noun }: { query: string; noun: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 rounded-2xl bg-brown-50 p-3">
        <Search className="h-6 w-6 text-brown-500" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">No {noun} found</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Nothing matches{query.trim() ? ` “${query.trim()}”` : " your search"}. Try a different term.
      </p>
    </div>
  );
}

function EmptyState({ action }: { action: React.ReactNode }) {
  return (
    <div className="flex min-h-72 flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <div className="mb-4 rounded-2xl bg-brown-50 p-4">
        <Layers className="h-7 w-7 text-brown-600" />
      </div>
      <h3 className="text-base font-semibold text-foreground">No leave types yet</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Create your first leave type (e.g. Vacation or Sick) to start defining time off policies.
      </p>
      <div className="mt-5">{action}</div>
    </div>
  );
}
