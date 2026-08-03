"use client";

import { FC, useMemo, useState } from "react";
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
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
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
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { PublicHolidaysSettingsSkeleton } from "@/components/modules/settings/modules/time/publicHolidays/components/PublicHolidaysSettingsSkeleton";
import { PublicHolidayCalendarStatus } from "@/api/modules/publicHolidays/calendars/dto";
import { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";
import { ChoosePublicHolidayTemplateModal } from "@/components/modules/settings/modules/time/publicHolidays/components/modals/ChoosePublicHolidayTemplateModal";
import { useDuplicatePublicHolidayCalendar } from "@/components/modules/settings/modules/time/publicHolidays/hooks/useDuplicatePublicHolidayCalendar";
import { useArchivePublicHolidayCalendar } from "@/components/modules/settings/modules/time/publicHolidays/hooks/useArchivePublicHolidayCalendar";
import { useRestorePublicHolidayCalendar } from "@/components/modules/settings/modules/time/publicHolidays/hooks/useRestorePublicHolidayCalendar";
import { useDeletePublicHolidayCalendar } from "@/components/modules/settings/modules/time/publicHolidays/hooks/useDeletePublicHolidayCalendar";

type Props = {
  calendars: PublicHolidayCalendar[];
  isLoading: boolean;
};

function statusBadge(status: PublicHolidayCalendarStatus) {
  switch (status) {
    case PublicHolidayCalendarStatus.Active:
      return { label: "Active", className: "border-green-200 bg-green-50 text-green-700" };
    case PublicHolidayCalendarStatus.Archived:
      return { label: "Archived", className: "border-amber-200 bg-amber-50 text-amber-700" };
    default:
      return { label: "Inactive", className: "" };
  }
}

function formatCountryRegion(calendar: PublicHolidayCalendar) {
  const { sourceCountryCode: c, sourceRegionCode: r } = calendar;
  if (c && r) return `${c} / ${r}`;
  return c || r || "—";
}

export const PublicHolidaysSettingsComponent: FC<Props> = ({ calendars, isLoading }) => {
  const router = useRouter();

  const [isChooseTemplateModalOpen, setIsChooseTemplateModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [duplicateTarget, setDuplicateTarget] = useState<PublicHolidayCalendar | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<PublicHolidayCalendar | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<PublicHolidayCalendar | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PublicHolidayCalendar | null>(null);

  const duplicate = useDuplicatePublicHolidayCalendar();
  const archive = useArchivePublicHolidayCalendar();
  const restore = useRestorePublicHolidayCalendar();
  const remove = useDeletePublicHolidayCalendar();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return calendars;
    return calendars.filter((c) =>
      [c.name, c.sourceCountryCode, c.sourceRegionCode, String(c.year)]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [calendars, query]);

  const hasCalendars = calendars.length > 0;

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
      /* surfaced via duplicate.isError */
    }
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archive.mutateAsync({ id: archiveTarget.id });
      setArchiveTarget(null);
    } catch {
      /* surfaced via archive.isError */
    }
  };

  const confirmRestore = async () => {
    if (!restoreTarget) return;
    try {
      await restore.mutateAsync({ id: restoreTarget.id });
      setRestoreTarget(null);
    } catch {
      /* surfaced via restore.isError */
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync({ id: deleteTarget.id });
      setDeleteTarget(null);
    } catch {
      /* surfaced via remove.isError */
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
        <DropdownMenuItem onSelect={handleCreateManually}>
          <FilePlus2 className="mr-2 h-4 w-4" />
          Create manually
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setIsChooseTemplateModalOpen(true)}>
          <DownloadCloud className="mr-2 h-4 w-4" />
          Choose from template
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
              Manage public holiday calendars and assign them to employees, locations or groups. Use
              the table below to review, search and navigate to specific calendars.
            </PageDescription>
          </div>

          {/* Info block */}
          <div className="space-y-1 pb-1 pt-5">
            <h2 className="text-lg font-semibold text-foreground">Holiday calendars</h2>
            <p className="text-sm text-muted-foreground">
              Every calendar in your company — active, inactive and archived.
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
                placeholder="Search calendars"
                inputMode="search"
              />
            </div>

            <div className="flex items-center gap-3">
              {addCalendarMenu}
              <Button size="icon" variant="outline" aria-label="Export calendars">
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
                    <TableHead>Year</TableHead>
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
                      const badge = statusBadge(calendar.status);
                      const isArchived = calendar.status === PublicHolidayCalendarStatus.Archived;
                      return (
                        <TableRow
                          key={calendar.id}
                          className="group border-brown-200 cursor-pointer hover:bg-brown-50 [&_td]:py-2"
                          onClick={() => openDetail(calendar.id)}
                        >
                          <TableCell className="py-3 pl-4">
                            <Link
                              href={`/settings/time/public-holidays/${calendar.id}`}
                              className="text-primary font-medium no-underline hover:no-underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {calendar.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatCountryRegion(calendar)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{calendar.holidayCount}</TableCell>
                          <TableCell className="text-muted-foreground">{calendar.year}</TableCell>
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
                                      Restore
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => setArchiveTarget(calendar)}
                                      className="gap-2.5 rounded-md px-2.5 py-2 cursor-pointer"
                                    >
                                      <Archive className="h-4 w-4 text-muted-foreground" />
                                      Archive
                                    </DropdownMenuItem>
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
              <p className="text-sm text-red-500">Failed to duplicate the calendar.</p>
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
            <DialogTitle>Archive &ldquo;{archiveTarget?.name}&rdquo;</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-brown-700">
            Archiving removes this calendar from <strong>everyone it is currently assigned to</strong> —
            those people will no longer have it. The calendar can no longer be assigned while archived,
            but you can restore it later (it comes back with no one assigned).
            {archive.isError && <p className="mt-2 text-red-500">Failed to archive the calendar.</p>}
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

      {/* Restore */}
      <Dialog open={!!restoreTarget} onOpenChange={(v) => !v && setRestoreTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Restore &ldquo;{restoreTarget?.name}&rdquo;</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-brown-700">
            This brings the calendar back as inactive. Its holiday days are kept, but no one is
            assigned to it — you can assign people again after restoring.
            {restore.isError && <p className="mt-2 text-red-500">Failed to restore the calendar.</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreTarget(null)} disabled={restore.isPending}>
              Cancel
            </Button>
            <Button onClick={confirmRestore} disabled={restore.isPending}>
              {restore.isPending ? "Restoring…" : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-brown-700">
            This permanently deletes the calendar and all its holiday days. People assigned to it will
            lose it. This action cannot be undone.
            {remove.isError && <p className="mt-2 text-red-500">Failed to delete the calendar.</p>}
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
