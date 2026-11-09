"use client";

import { useCanManagePublicHolidayCalendars } from "../../hooks/useCanManagePublicHolidayCalendars";
import { usePublicHolidayCalendarDeleteImpact } from "../../hooks/usePublicHolidayCalendarDeleteImpact";
import { FC, type ReactNode, useMemo, useRef, useState } from "react";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";
// Five of these dialogs printed a sentence they wrote themselves — "Failed to archive the calendar."
// — over a refusal that already said why (in use, already archived, last of its kind). The rule is
// the dictionary by `code`; the module does not get its own vocabulary.
import { messageForError } from "@/lib/errors/errorMessages";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Add01Icon, Archive02Icon, ArchiveArrowUpIcon, CloudDownloadIcon, Copy01Icon, Delete02Icon, Download01Icon, FileAddIcon, PowerIcon, PowerOffIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/desact/dropdown-menu";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/desact/table";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListEmptyState } from "@/components/feedback/ListEmptyState";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { HolidayCalendarBindingSection } from "@/components/modules/settings/modules/time/publicHolidays/components/HolidayCalendarBinding";
import { PublicHolidaysSettingsSkeleton } from "@/components/modules/settings/modules/time/publicHolidays/components/PublicHolidaysSettingsSkeleton";
import { PublicHolidayCalendarStatus } from "@/api/modules/publicHolidays/calendars/dto";
import { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";
import { ChoosePublicHolidayTemplateModal } from "@/components/modules/settings/modules/time/publicHolidays/components/modals/ChoosePublicHolidayTemplateModal";
import { useDuplicatePublicHolidayCalendar } from "@/components/modules/settings/modules/time/publicHolidays/hooks/useDuplicatePublicHolidayCalendar";
import { useArchivePublicHolidayCalendar } from "@/components/modules/settings/modules/time/publicHolidays/hooks/useArchivePublicHolidayCalendar";
import { useRestorePublicHolidayCalendar } from "@/components/modules/settings/modules/time/publicHolidays/hooks/useRestorePublicHolidayCalendar";
import { useDeletePublicHolidayCalendar } from "@/components/modules/settings/modules/time/publicHolidays/hooks/useDeletePublicHolidayCalendar";
import { useActivatePublicHolidayCalendar } from "@/components/modules/settings/modules/time/publicHolidays/hooks/useActivatePublicHolidayCalendar";
import { useDeactivatePublicHolidayCalendar } from "@/components/modules/settings/modules/time/publicHolidays/hooks/useDeactivatePublicHolidayCalendar";
import { StatusBadge, type EntityStatus } from "@/components/ui/StatusBadge";
import {
  ExportDataModal,
  ExportDataFormValues,
  triggerExportDownload,
} from "@/components/modules/settings/shared/ExportDataModal";
import { RequiredLabel } from "@/components/ui/RequiredLabel";

type Props = {
  calendars: PublicHolidayCalendar[];
  isLoading: boolean;
};

const calendarStatus = (status: PublicHolidayCalendarStatus): EntityStatus => {
  switch (status) {
    case PublicHolidayCalendarStatus.Active:
      return "active";
    case PublicHolidayCalendarStatus.Archived:
      return "archived";
    default:
      return "inactive";
  }
};

/** "2025–2027" for a run of years, "2025, 2027" when there is a gap. */
function formatYears(years: number[]) {
  if (!years || years.length === 0) return "";

  const sorted = [...years].sort((a, b) => a - b);
  const isContiguous = sorted.every((y, i) => i === 0 || y === sorted[i - 1] + 1);

  if (sorted.length === 1) return String(sorted[0]);
  if (isContiguous) return `${sorted[0]}–${sorted[sorted.length - 1]}`;
  return sorted.join(", ");
}

function formatCountryRegion(calendar: PublicHolidayCalendar) {
  const { sourceCountryCode: c, sourceRegionCode: r } = calendar;
  if (c && r) return `${c} / ${r}`;
  return c || r;
}

export const PublicHolidaysSettingsComponent: FC<Props> = ({ calendars, isLoading }) => {
  const t = useTranslations("timeOff");
  const tCommon = useTranslations("common");
  const strong = (chunks: ReactNode) => <strong>{chunks}</strong>;
  const router = useRouter();
  const canManage = useCanManagePublicHolidayCalendars();

  const [isChooseTemplateModalOpen, setIsChooseTemplateModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const handleExport = async ({ format }: ExportDataFormValues) => {
    try {
      await triggerExportDownload("/api/public-holiday/calendars/export", format);
      setIsExportOpen(false);
    } catch (error) {
      console.error("Failed to export holiday calendars:", error);
    }
  };

  const [duplicateTarget, setDuplicateTarget] = useState<PublicHolidayCalendar | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateTried, setDuplicateTried] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<PublicHolidayCalendar | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<PublicHolidayCalendar | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<PublicHolidayCalendar | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PublicHolidayCalendar | null>(null);
  const deleteImpact = usePublicHolidayCalendarDeleteImpact(deleteTarget?.id ?? null);

  /**
   * The name a confirmation dialog shows, kept alive while the dialog closes.
   *
   * Every one of these dialogs reads `target?.name` and every handler clears the target on success —
   * so the heading became `Deactivate ""` for the length of the close animation, which is exactly
   * when the reader is still looking at it. Observed on the calendar run of 2026-08-29.
   *
   * The last non-empty name is retained instead: while the dialog is open it is the current one, and
   * while it closes it is the one the dialog was about.
   */
  const retainedNames = useRef<Record<string, string>>({});
  const dialogName = (key: string, target: PublicHolidayCalendar | null) => {
    if (target?.name) retainedNames.current[key] = target.name;
    return target?.name ?? retainedNames.current[key] ?? "";
  };

  const duplicate = useDuplicatePublicHolidayCalendar();
  const archive = useArchivePublicHolidayCalendar();
  const restore = useRestorePublicHolidayCalendar();
  const remove = useDeletePublicHolidayCalendar();
  const activate = useActivatePublicHolidayCalendar();
  const deactivate = useDeactivatePublicHolidayCalendar();

  /**
   * Two views, not one that widens: on shows **only** archived, off shows everything else.
   * Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 5.
   */
  const visible = useMemo(
    () =>
      calendars.filter((c) =>
        showArchived
          ? c.status === PublicHolidayCalendarStatus.Archived
          : c.status !== PublicHolidayCalendarStatus.Archived,
      ),
    [calendars, showArchived],
  );

  const archivedCount = useMemo(
    () => calendars.filter((c) => c.status === PublicHolidayCalendarStatus.Archived).length,
    [calendars],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((c) =>
      [c.name, c.sourceCountryCode, c.sourceRegionCode, c.years.join(" ")]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [visible, query]);

  const hasCalendars = visible.length > 0;

  const openDetail = (id: string) => router.push(`/settings/time/public-holidays/${id}`);
  const handleCreateManually = () => router.push("/settings/time/public-holidays/new");

  const openDuplicate = (c: PublicHolidayCalendar) => {
    setDuplicateName(t("publicHolidays.list.copyName", { name: c.name }));
    setDuplicateTried(false);
    setDuplicateTarget(c);
  };

  const confirmDuplicate = async () => {
    setDuplicateTried(true);
    if (!duplicateTarget || !duplicateName.trim()) return;
    try {
      await duplicate.mutateAsync({ id: duplicateTarget.id, name: duplicateName.trim() });
      setDuplicateTarget(null);
    } catch {
    }
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archive.mutateAsync({ id: archiveTarget.id });
      setArchiveTarget(null);
    } catch {
    }
  };

  const confirmRestore = async () => {
    if (!restoreTarget) return;
    try {
      await restore.mutateAsync({ id: restoreTarget.id });
      setRestoreTarget(null);
    } catch {
    }
  };

  /**
   * Switching a calendar on only ever gives people days, and the row shows the new status straight
   * away — asking "are you sure" for that is noise. Switching one off is the opposite: everyone
   * assigned silently starts working those days again, so that one gets a dialog saying so.
   */
  const handleActivate = async (calendar: PublicHolidayCalendar) => {
    try {
      await activate.mutateAsync({ id: calendar.id });
    } catch {
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivate.mutateAsync({ id: deactivateTarget.id });
      setDeactivateTarget(null);
    } catch {
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync({ id: deleteTarget.id });
      setDeleteTarget(null);
    } catch {
    }
  };

  const addCalendarMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" className="gap-1.5">
          <Icon icon={Add01Icon} size="sm" />
          {t("publicHolidays.list.addCalendar")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-control p-1">
        <DropdownMenuItem
          onSelect={() => setIsChooseTemplateModalOpen(true)}
          className="gap-2.5 rounded-control px-2.5 py-1.5 cursor-pointer"
        >
          <Icon icon={CloudDownloadIcon} size="sm" className="text-tertiary" />
          {t("publicHolidays.list.fromTemplate")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={handleCreateManually}
          className="gap-2.5 rounded-control px-2.5 py-1.5 cursor-pointer"
        >
          <Icon icon={FileAddIcon} size="sm" className="text-tertiary" />
          {t("publicHolidays.list.manually")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <div className="flex h-[calc(100svh-6rem)] flex-col overflow-hidden">
        <div className="shrink-0 px-8 pt-2">
          <div className="space-y-2">
            <SettingsPageHeader title={t("publicHolidays.list.title")} backHref="/settings" />
            <PageDescription className="text-body text-tertiary/90">
              {t("publicHolidays.list.description")}
            </PageDescription>
          </div>

          <div className="mt-5 rounded-control bg-subtle/60 px-4 py-4">
            <HolidayCalendarBindingSection kind="COMPANY_DEFAULT" refId={null} placeName={t("binding.theCompany")} />
          </div>

          <ListToolbar
            className="py-5"
            search={{ value: query, onChange: setQuery }}
            archived={{ count: archivedCount, showing: showArchived, onChange: setShowArchived }}
            secondary={
              canManage ? (
                <Button type="button"
                  size="icon"
                  variant="secondary"
                  aria-label={t("publicHolidays.list.exportAria")}
                  onClick={() => setIsExportOpen(true)}
                >
                  <Icon icon={Download01Icon} size="sm" />
                </Button>
              ) : undefined
            }
            primary={canManage ? addCalendarMenu : undefined}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-8 pb-6">
          {!isLoading && !hasCalendars ? (
            <ListEmptyState
              scene="calendar"
              title={t("publicHolidays.list.emptyTitle")}
              description={t("publicHolidays.list.emptyDescription")}
              action={addCalendarMenu}
              className="min-h-72 flex-1"
            />
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <table className="w-full caption-bottom text-body table-fixed">
                <TableHeader className="[&_tr]:border-divider sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="pl-4">{t("publicHolidays.list.colCalendar")}</TableHead>
                    <TableHead>{t("publicHolidays.list.colCountryRegion")}</TableHead>
                    <TableHead>{t("publicHolidays.list.colDays")}</TableHead>
                    <TableHead>{t("publicHolidays.list.colYears")}</TableHead>
                    <TableHead>{t("publicHolidays.list.colStatus")}</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <PublicHolidaysSettingsSkeleton />
                  ) : filtered.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6}>
                        <ListEmptyState
                          query={query}
                          onClearSearch={() => setQuery("")}
                          archivedView={showArchived}
                          scene="calendar"
                          title={t("publicHolidays.list.emptyTitle")}
                          description={t("publicHolidays.list.emptyDescription")}
                          noResultsHint={t("publicHolidays.list.noResultsHint")}
                          archivedDescription={t("publicHolidays.list.archivedDescription")}
                          action={addCalendarMenu}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((calendar) => {
                      const status = calendarStatus(calendar.status);
                      const isArchived = calendar.status === PublicHolidayCalendarStatus.Archived;
                      const isActive = calendar.status === PublicHolidayCalendarStatus.Active;
                      return (
                        <TableRow
                          key={calendar.id}
                          className="group border-divider cursor-pointer hover:bg-subtle [&_td]:py-2"
                          onClick={() => openDetail(calendar.id)}
                        >
                          <TableCell className="py-3 pl-4">
                            <span className="flex min-w-0 items-center gap-2">
                              <CountryFlag countryCode={calendar.sourceCountryCode} />
                              <Link
                                href={`/settings/time/public-holidays/${calendar.id}`}
                                className="text-primary truncate font-medium no-underline hover:no-underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {calendar.name}
                              </Link>
                            </span>
                          </TableCell>
                          <TableCell className="text-tertiary">
                            {formatCountryRegion(calendar)}
                          </TableCell>
                          <TableCell className="text-tertiary">{calendar.holidayCount}</TableCell>
                          <TableCell className="text-tertiary">
                            {formatYears(calendar.years)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={status}/>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end">
                              {canManage ? (
                              <RowActionsMenu label={t("publicHolidays.list.rowActions")}>
                                <RowAction
                                  icon={<Icon icon={Copy01Icon} size="sm" />}
                                  onClick={() => openDuplicate(calendar)}
                                >
                                  {tCommon("actions.duplicate")}
                                </RowAction>
                                {isArchived ? (
                                  <RowAction
                                    icon={<Icon icon={ArchiveArrowUpIcon} size="sm" />}
                                    onClick={() => setRestoreTarget(calendar)}
                                  >
                                    {t("publicHolidays.list.unarchive")}
                                  </RowAction>
                                ) : (
                                  <>
                                    {isActive ? (
                                      <RowAction
                                        icon={<Icon icon={PowerOffIcon} size="sm" />}
                                        onClick={() => setDeactivateTarget(calendar)}
                                      >
                                        {t("publicHolidays.list.deactivate")}
                                      </RowAction>
                                    ) : (
                                      <RowAction
                                        icon={<Icon icon={PowerIcon} size="sm" />}
                                        onClick={() => handleActivate(calendar)}
                                      >
                                        {t("publicHolidays.list.activate")}
                                      </RowAction>
                                    )}
                                    <RowAction
                                      icon={<Icon icon={Archive02Icon} size="sm" />}
                                      onClick={() => setArchiveTarget(calendar)}
                                    >
                                      {tCommon("actions.archive")}
                                    </RowAction>
                                  </>
                                )}
                                <RowActionDestructive
                                  icon={<Icon icon={Delete02Icon} size="sm" />}
                                  onClick={() => setDeleteTarget(calendar)}
                                >
                                  {tCommon("actions.delete")}
                                </RowActionDestructive>
                              </RowActionsMenu>
                              ) : null}
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

      <ChoosePublicHolidayTemplateModal
        isOpen={isChooseTemplateModalOpen}
        onRequestCloseAction={() => setIsChooseTemplateModalOpen(false)}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        title={t("publicHolidays.list.exportTitle")}
        rowCount={calendars.length}
        rowKind="calendars"
        description={t("publicHolidays.list.exportDescription")}
        includedText={t("publicHolidays.list.exportIncluded")}
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />

      {/* Duplicate */}
      <Dialog open={!!duplicateTarget} onOpenChange={(v) => !v && setDuplicateTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("publicHolidays.list.duplicate.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <RequiredLabel htmlFor="duplicate-calendar-name" required>{t("publicHolidays.list.duplicate.name")}</RequiredLabel>
            <Input
              id="duplicate-calendar-name"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.currentTarget.value)}
              autoFocus
            />
            <FieldError>{duplicateTried && !duplicateName.trim() ? tCommon("validation.enterName") : null}</FieldError>
            <p className="text-hint text-tertiary">
              {t("publicHolidays.list.duplicate.hint", { name: duplicateTarget?.name ?? "" })}
            </p>
            {duplicate.isError && (
              <FormError message={duplicate.error ? messageForError(duplicate.error) : null} />
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDuplicateTarget(null)} disabled={duplicate.isPending}>
              {tCommon("actions.cancel")}
            </Button>
            <Button type="button" onClick={confirmDuplicate} disabled={duplicate.isPending}>
              {duplicate.isPending ? t("publicHolidays.list.duplicate.pending") : tCommon("actions.duplicate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive */}
      <Dialog open={!!archiveTarget} onOpenChange={(v) => !v && setArchiveTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("publicHolidays.list.archive.title", { name: dialogName("archive", archiveTarget) })}</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-body text-secondary">
            {t.rich("publicHolidays.list.archive.body", { b: strong })}
            <FormError message={archive.error ? messageForError(archive.error) : null} className="mt-2" />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setArchiveTarget(null)} disabled={archive.isPending}>
              {tCommon("actions.cancel")}
            </Button>
            <Button type="button" onClick={confirmArchive} disabled={archive.isPending}>
              {archive.isPending ? t("publicHolidays.list.archive.pending") : tCommon("actions.archive")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unarchive */}
      <Dialog open={!!restoreTarget} onOpenChange={(v) => !v && setRestoreTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("publicHolidays.list.restore.title", { name: dialogName("restore", restoreTarget) })}</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-body text-secondary">
            {t.rich("publicHolidays.list.restore.body", { b: strong })}
            <FormError message={restore.error ? messageForError(restore.error) : null} className="mt-2" />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setRestoreTarget(null)} disabled={restore.isPending}>
              {tCommon("actions.cancel")}
            </Button>
            <Button type="button" onClick={confirmRestore} disabled={restore.isPending}>
              {restore.isPending ? t("publicHolidays.list.restore.pending") : t("publicHolidays.list.unarchive")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate */}
      <Dialog open={!!deactivateTarget} onOpenChange={(v) => !v && setDeactivateTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("publicHolidays.list.deactivateDialog.title", { name: dialogName("deactivate", deactivateTarget) })}</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-body text-secondary">
            {t("publicHolidays.list.deactivateDialog.body")}
            {deactivate.isError && (
              <FormError message={deactivate.error ? messageForError(deactivate.error) : null} className="mt-2" />
            )}
          </div>
          <DialogFooter>
            <Button type="button"
              variant="secondary"
              onClick={() => setDeactivateTarget(null)}
              disabled={deactivate.isPending}
            >
              {tCommon("actions.cancel")}
            </Button>
            <Button type="button" onClick={confirmDeactivate} disabled={deactivate.isPending}>
              {deactivate.isPending ? t("publicHolidays.list.deactivateDialog.pending") : t("publicHolidays.list.deactivate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("publicHolidays.list.delete.title", { name: dialogName("delete", deleteTarget) })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2 text-body text-secondary">
            <p className="m-0">
              {t("publicHolidays.list.delete.body")}
            </p>
            {deleteImpact.isLoading ? (
              <p className="m-0 text-tertiary">{t("publicHolidays.list.delete.checking")}</p>
            ) : deleteImpact.isError ? (
              <p className="m-0 text-tertiary">
                {t("publicHolidays.list.delete.checkFailed")}
              </p>
            ) : deleteImpact.data ? (
              <ul className="m-0 list-disc space-y-1 pl-5">
                <li>
                  {t("publicHolidays.list.delete.people", { count: deleteImpact.data.peopleAssigned })}
                </li>
                <li>
                  {t("publicHolidays.list.delete.days", { count: deleteImpact.data.holidayDays })}
                </li>
                {deleteImpact.data.feedLinks > 0 ? (
                  <li>
                    {t("publicHolidays.list.delete.links", { count: deleteImpact.data.feedLinks })}
                  </li>
                ) : null}
              </ul>
            ) : null}
            <FormError message={remove.error ? messageForError(remove.error) : null} className="mt-2" />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)} disabled={remove.isPending}>
              {tCommon("actions.cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={remove.isPending || deleteImpact.isLoading}>
              {remove.isPending ? tCommon("actions.deleting") : tCommon("actions.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

