"use client";

import { FC, useMemo, useRef, useState } from "react";
import { FormError } from "@/components/feedback/FormError";
// Five of these dialogs printed a sentence they wrote themselves — "Failed to archive the calendar."
// — over a refusal that already said why (in use, already archived, last of its kind). The rule is
// the dictionary by `code`; the module does not get its own vocabulary.
import { messageForError } from "@/lib/errors/errorMessages";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  CalendarDays,
  Copy,
  Download,
  DownloadCloud,
  FilePlus2,
  MoreVertical,
  Plus,
  Power,
  PowerOff,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
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
import { CountryFlag } from "@/components/ui/CountryFlag";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
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
  if (!years || years.length === 0) return "—";

  const sorted = [...years].sort((a, b) => a - b);
  const isContiguous = sorted.every((y, i) => i === 0 || y === sorted[i - 1] + 1);

  if (sorted.length === 1) return String(sorted[0]);
  if (isContiguous) return `${sorted[0]}–${sorted[sorted.length - 1]}`;
  return sorted.join(", ");
}

function formatCountryRegion(calendar: PublicHolidayCalendar) {
  const { sourceCountryCode: c, sourceRegionCode: r } = calendar;
  if (c && r) return `${c} / ${r}`;
  return c || r || "—";
}

export const PublicHolidaysSettingsComponent: FC<Props> = ({ calendars, isLoading }) => {
  const router = useRouter();

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
  const [archiveTarget, setArchiveTarget] = useState<PublicHolidayCalendar | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<PublicHolidayCalendar | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<PublicHolidayCalendar | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PublicHolidayCalendar | null>(null);

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

  /** Archived calendars stay out of the list until the toggle asks for them. */
  const visible = useMemo(
    () =>
      showArchived
        ? calendars
        : calendars.filter((c) => c.status !== PublicHolidayCalendarStatus.Archived),
    [calendars, showArchived],
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
    setDuplicateName(`${c.name} copy`);
    setDuplicateTarget(c);
  };

  const confirmDuplicate = async () => {
    if (!duplicateTarget) return;
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
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setIsChooseTemplateModalOpen(true)}>
          <DownloadCloud className="mr-2 h-4 w-4" />
          Choose from template
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleCreateManually}>
          <FilePlus2 className="mr-2 h-4 w-4" />
          Create manually
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <div className="flex h-[calc(100svh-6rem)] flex-col overflow-hidden">
        <div className="shrink-0 px-8 pt-2">
          <div className="space-y-2">
            <SettingsPageHeader title="Public holidays" backHref="/settings" />
            <PageDescription className="text-base text-muted-foreground/90">
              Manage public holiday calendars and assign them to employees, locations or groups.
            </PageDescription>
          </div>

          {/* Toolbar: search (left) + actions (right) */}
          <div className="flex items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-3">
              <div className="relative w-[260px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                  className="h-9 w-[260px] pl-9"
                  placeholder="Search calendars"
                  inputMode="search"
                />
              </div>

              <Button
                type="button"
                variant={showArchived ? "default" : "outline"}
                className="h-9 gap-1.5"
                aria-pressed={showArchived}
                onClick={() => setShowArchived((current) => !current)}
              >
                <Archive className="h-4 w-4" />
                Show archived
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {addCalendarMenu}
              <Button
                size="icon"
                variant="outline"
                aria-label="Export calendars"
                onClick={() => setIsExportOpen(true)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-8 pb-6">
          {!isLoading && !hasCalendars ? (
            <EmptyState
              title="No public holiday calendars yet"
              body="Create a manual calendar or choose a template to start using public holidays in time off calculations."
              action={addCalendarMenu}
            />
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <table className="w-full caption-bottom text-sm table-fixed">
                <TableHeader className="[&_tr]:border-brown-200 sticky top-0 z-10 bg-white">
                  <TableRow>
                    <TableHead className="pl-4">Calendar</TableHead>
                    <TableHead>Country / Region</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Years</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <PublicHolidaysSettingsSkeleton />
                  ) : filtered.length === 0 ? (
                    <TableRow className="[&_td]:py-2">
                      <TableCell colSpan={6}>
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No calendars match your search.
                        </div>
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
                          className="group border-brown-200 cursor-pointer hover:bg-brown-50 [&_td]:py-2"
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
                          <TableCell className="text-muted-foreground">
                            {formatCountryRegion(calendar)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{calendar.holidayCount}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatYears(calendar.years)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={status}/>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-brown-500 hover:bg-brown-50 hover:text-brown-700"
                                    aria-label="Calendar actions"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 rounded-lg p-1.5">
                                  <DropdownMenuItem
                                    onClick={() => openDuplicate(calendar)}
                                    className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                  >
                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  {isArchived ? (
                                    <DropdownMenuItem
                                      onClick={() => setRestoreTarget(calendar)}
                                      className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                    >
                                      <RotateCcw className="h-4 w-4 text-muted-foreground" />
                                      Unarchive
                                    </DropdownMenuItem>
                                  ) : (
                                    <>
                                      {isActive ? (
                                        <DropdownMenuItem
                                          onClick={() => setDeactivateTarget(calendar)}
                                          className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                        >
                                          <PowerOff className="h-4 w-4 text-muted-foreground" />
                                          Deactivate
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem
                                          onClick={() => handleActivate(calendar)}
                                          className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                        >
                                          <Power className="h-4 w-4 text-muted-foreground" />
                                          Activate
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        onClick={() => setArchiveTarget(calendar)}
                                        className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                      >
                                        <Archive className="h-4 w-4 text-muted-foreground" />
                                        Archive
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuSeparator className="my-1.5 bg-brown-100" />
                                  <DropdownMenuItem
                                    onClick={() => setDeleteTarget(calendar)}
                                    className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
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

      <ChoosePublicHolidayTemplateModal
        isOpen={isChooseTemplateModalOpen}
        onRequestCloseAction={() => setIsChooseTemplateModalOpen(false)}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        title="Export holiday calendars"
        rowCount={calendars.length}
        rowNoun="calendars"
        description="Export all holiday calendars with their day counts and creation details."
        includedText="Included: name, country, region, days, year, status, created by, created at."
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />

      {/* Duplicate */}
      <Dialog open={!!duplicateTarget} onOpenChange={(v) => !v && setDuplicateTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Duplicate calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="duplicate-calendar-name">New calendar name</Label>
            <Input
              id="duplicate-calendar-name"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.currentTarget.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Creates an inactive copy with all holiday days from &ldquo;{duplicateTarget?.name}&rdquo;.
            </p>
            {duplicate.isError && (
              <FormError message={duplicate.error ? messageForError(duplicate.error) : null} />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateTarget(null)} disabled={duplicate.isPending}>
              Cancel
            </Button>
            <Button onClick={confirmDuplicate} disabled={duplicate.isPending || !duplicateName.trim()}>
              {duplicate.isPending ? "Duplicating…" : "Duplicate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive */}
      <Dialog open={!!archiveTarget} onOpenChange={(v) => !v && setArchiveTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Archive &ldquo;{dialogName("archive", archiveTarget)}&rdquo;</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-brown-700">
            An archived calendar <strong>stops applying to everyone assigned to it</strong> — its days
            no longer count as holidays for them — and it cannot be assigned to anybody new. The
            assignments themselves are kept, so restoring brings the calendar back with the same
            people still on it.
            <FormError message={archive.error ? messageForError(archive.error) : null} className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveTarget(null)} disabled={archive.isPending}>
              Cancel
            </Button>
            <Button onClick={confirmArchive} disabled={archive.isPending}>
              {archive.isPending ? "Archiving…" : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unarchive */}
      <Dialog open={!!restoreTarget} onOpenChange={(v) => !v && setRestoreTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Unarchive &ldquo;{dialogName("restore", restoreTarget)}&rdquo;</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-brown-700">
            This brings the calendar back <strong>as inactive</strong>, which is deliberate rather than
            a half-finished restore: nothing starts applying to anybody until you activate it. Its
            holiday days and the people assigned to it are both kept.
            <FormError message={restore.error ? messageForError(restore.error) : null} className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreTarget(null)} disabled={restore.isPending}>
              Cancel
            </Button>
            <Button onClick={confirmRestore} disabled={restore.isPending}>
              {restore.isPending ? "Unarchiving…" : "Unarchive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate */}
      <Dialog open={!!deactivateTarget} onOpenChange={(v) => !v && setDeactivateTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Deactivate &ldquo;{dialogName("deactivate", deactivateTarget)}&rdquo;</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-brown-700">
            An inactive calendar stops applying: the people assigned to it keep the assignment, but
            its days no longer count as holidays, so new leave requests over those dates will be one
            day longer. Assignments and holiday days are kept — activate it again at any time.
            {deactivate.isError && (
              <FormError message={deactivate.error ? messageForError(deactivate.error) : null} className="mt-2" />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeactivateTarget(null)}
              disabled={deactivate.isPending}
            >
              Cancel
            </Button>
            <Button onClick={confirmDeactivate} disabled={deactivate.isPending}>
              {deactivate.isPending ? "Deactivating…" : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{dialogName("delete", deleteTarget)}&rdquo;</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-brown-700">
            This permanently deletes the calendar and all its holiday days. People assigned to it will
            lose it. This action cannot be undone.
            <FormError message={remove.error ? messageForError(remove.error) : null} className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={remove.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
              {remove.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex min-h-72 flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <div className="mb-4 rounded-2xl bg-brown-50 p-4">
        <CalendarDays className="h-7 w-7 text-brown-600" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}
