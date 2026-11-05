"use client";

import { FC, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, Archive02Icon, ArchiveArrowUpIcon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { RowAction, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/desact/table";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { LeaveTypesSettingsSkeleton } from "../LeaveTypesSettingsSkeleton";
import { LEAVE_TYPE_CATEGORY_KEYS, LeaveTypeCategoryChip } from "../LeaveTypeCategoryChip/LeaveTypeCategoryChip";
import { LeaveTypeStatus } from "@/api/modules/timeOff/leaveTypes/dto";
import type { LeaveType } from "@/models/timeOff";
import { StatusBadge, type EntityStatus } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";

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

export const LeaveTypesSettingsComponent: FC<Props> = ({
  leaveTypes,
  isLoading,
  onCreateAction,
  onOpenAction,
  onEditAction,
  onArchiveAction,
  onRestoreAction,
}) => {
  const t = useTranslations("timeOff");
  const tCommon = useTranslations("common");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const archivedCount = useMemo(
    () => leaveTypes.filter((lt) => lt.status === LeaveTypeStatus.Archived).length,
    [leaveTypes],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // A switch between two views, not a widening of one. Rule:
    // `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 5.
    const base = leaveTypes.filter((lt) =>
      showArchived
        ? lt.status === LeaveTypeStatus.Archived
        : lt.status !== LeaveTypeStatus.Archived,
    );

    if (!q) return base;
    return base.filter((lt) =>
      [lt.name, lt.description, lt.category ? t(LEAVE_TYPE_CATEGORY_KEYS[lt.category]) : null]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [leaveTypes, query, showArchived, t]);

  const hasLeaveTypes = leaveTypes.length > 0;

  const addButton = (
    <Button type="button" className="gap-1.5" onClick={onCreateAction}>
      <Icon icon={Add01Icon} size="sm" />
      {t("leaveTypes.list.add")}
    </Button>
  );

  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col overflow-hidden">
      <div className="shrink-0 px-8 pt-2">
        <div className="space-y-2">
          <SettingsPageHeader title={t("leaveTypes.list.title")} backHref="/settings" />
          <PageDescription className="text-body text-tertiary/90">
            {t("leaveTypes.list.description")}
          </PageDescription>
        </div>

        {/* Info block */}
        <div className="space-y-1 pb-1 pt-5">
          <h2 className="text-section-title text-primary">{t("leaveTypes.list.heading")}</h2>
          <p className="text-body text-tertiary">
            {t("leaveTypes.list.headingHint")}
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
            scene="time-off"
            title={t("leaveTypes.list.emptyTitle")}
            description={t("leaveTypes.list.emptyDescription")}
            onCreate={onCreateAction}
            createLabel={t("leaveTypes.list.add")}
            className="min-h-72 flex-1"
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <table className="w-full caption-bottom text-body table-fixed">
              <TableHeader className="[&_tr]:border-divider sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="pl-4">{t("leaveTypes.list.colType")}</TableHead>
                  <TableHead>{t("leaveTypes.list.colCategory")}</TableHead>
                  <TableHead>{t("leaveTypes.list.colStatus")}</TableHead>
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
                        scene="time-off"
                        title={t("leaveTypes.list.emptyTitle")}
                        description={t("leaveTypes.list.emptyDescription")}
                        noResultsHint={t("leaveTypes.list.noResultsHint")}
                        archivedDescription={t("leaveTypes.list.archivedDescription")}
                        onCreate={onCreateAction}
                        createLabel={t("leaveTypes.list.add")}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((leaveType) => {
                    const status = leaveTypeStatus(leaveType.status);
                    return (
                      <TableRow
                        key={leaveType.id}
                        className="group border-divider cursor-pointer hover:bg-subtle [&_td]:py-2"
                        onClick={() => onOpenAction(leaveType)}
                      >
                        <TableCell className="py-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              aria-hidden
                              className={cn("size-2.5 flex-none rounded-pill", TAG_CLASSES[toTagColor(leaveType.color)].dot)}
                            />
                            <div className="min-w-0">
                              <span className="font-medium text-primary">{leaveType.name}</span>
                              {leaveType.description && (
                                <p className="truncate text-hint text-tertiary">
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
                            <RowActionsMenu label={t("leaveTypes.list.rowActions")}>
                              <RowAction
                                icon={<Icon icon={PencilEdit02Icon} size="sm" />}
                                onClick={() => onEditAction(leaveType)}
                              >
                                {tCommon("actions.edit")}
                              </RowAction>

                              {/*
                                No separator before Archive. It had one, which is what happens when
                                the separator means "near the bottom" rather than "past this line it
                                is permanent" \u2014 and every archive in this product is reversible.
                              */}
                              {leaveType.status === LeaveTypeStatus.Active ? (
                                <RowAction
                                  icon={<Icon icon={Archive02Icon} size="sm" />}
                                  onClick={() => onArchiveAction(leaveType)}
                                >
                                  {tCommon("actions.archive")}
                                </RowAction>
                              ) : (
                                <RowAction
                                  icon={<Icon icon={ArchiveArrowUpIcon} size="sm" />}
                                  onClick={() => onRestoreAction(leaveType)}
                                >
                                  {t("leaveTypes.list.unarchive")}
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

