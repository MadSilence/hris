"use client";

import { FC, useMemo, useState } from "react";
import { Archive, ArchiveRestore, Layers, Pencil, Plus } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { RowAction, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
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
import { StatusBadge, type EntityStatus } from "@/components/ui/StatusBadge";

type Props = {
  leaveTypes: LeaveType[];
  isLoading: boolean;
  onCreateAction: () => void;
  onOpenAction: (leaveType: LeaveType) => void;
  onEditAction: (leaveType: LeaveType) => void;
  onArchiveAction: (leaveType: LeaveType) => void;
  onRestoreAction: (leaveType: LeaveType) => void;
};

const leaveTypeStatus = (status: LeaveTypeStatus): EntityStatus =>
  status === LeaveTypeStatus.Archived ? "archived" : "active";

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
  onRestoreAction,
}) => {
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const archivedCount = useMemo(
    () => leaveTypes.filter((t) => t.status === LeaveTypeStatus.Archived).length,
    [leaveTypes],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // A switch between two views, not a widening of one. Rule:
    // `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 5.
    const base = leaveTypes.filter((t) =>
      showArchived
        ? t.status === LeaveTypeStatus.Archived
        : t.status !== LeaveTypeStatus.Archived,
    );

    if (!q) return base;
    return base.filter((t) =>
      [t.name, t.description, t.category ? CATEGORY_LABELS[t.category] : null]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [leaveTypes, query, showArchived]);

  const hasLeaveTypes = leaveTypes.length > 0;

  const addButton = (
    <Button className="gap-1.5" onClick={onCreateAction}>
      <Plus className="h-4 w-4" />
      Add Leave Type
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

        <ListToolbar
          className="py-5"
          search={{ value: query, onChange: setQuery }}
          archived={{ count: archivedCount, showing: showArchived, onChange: setShowArchived }}
          primary={addButton}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-8 pb-6">
        {!isLoading && !hasLeaveTypes ? (
          <ListEmptyState
            icon={<Layers className="h-7 w-7" />}
            title="No leave types yet"
            description="A leave type is a category of time off — Vacation, Sick, Parental. Add the first one to start defining policies."
            onCreate={onCreateAction}
            createLabel="Add Leave Type"
            className="min-h-72 flex-1"
          />
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
                      <ListEmptyState
                        query={query}
                        archivedView={showArchived}
                        icon={<Layers className="h-7 w-7" />}
                        title="No leave types yet"
                        description="A leave type is a category of time off — Vacation, Sick, Parental. Add the first one to start defining policies."
                        noResultsHint="Try a different name or category."
                        archivedDescription="Archived leave types will appear here."
                        onCreate={onCreateAction}
                        createLabel="Add Leave Type"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((leaveType) => {
                    const status = leaveTypeStatus(leaveType.status);
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
                          <StatusBadge status={status}/>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end">
                            <RowActionsMenu label="Leave Type Actions">
                              <RowAction
                                icon={<Pencil className="h-4 w-4" />}
                                onClick={() => onEditAction(leaveType)}
                              >
                                Edit
                              </RowAction>

                              {/*
                                No separator before Archive. It had one, which is what happens when
                                the separator means "near the bottom" rather than "past this line it
                                is permanent" \u2014 and every archive in this product is reversible.
                              */}
                              {leaveType.status === LeaveTypeStatus.Active ? (
                                <RowAction
                                  icon={<Archive className="h-4 w-4" />}
                                  onClick={() => onArchiveAction(leaveType)}
                                >
                                  Archive
                                </RowAction>
                              ) : (
                                <RowAction
                                  icon={<ArchiveRestore className="h-4 w-4" />}
                                  onClick={() => onRestoreAction(leaveType)}
                                >
                                  Unarchive
                                </RowAction>
                              )}
                            </RowActionsMenu>
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


