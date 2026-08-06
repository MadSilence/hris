"use client";

import { FC, useCallback, useMemo, useState } from "react";
import { CalendarDays, Download, Pencil, Search, Users, X } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";

import { PublicHolidayCalendarStatus } from "@/api/modules/publicHolidays/calendars/dto";
import type { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";
import type { PublicHoliday } from "@/models/publicHolidays/holiday";
import {
  PublicHolidayDaysEditor,
  type DraftHoliday,
  type DraftHolidayErrors,
} from "../PublicHolidayDaysEditor";
import { PublicHolidayCalendarAssignedUsersTab } from "../PublicHolidayCalendarAssignedUsersTab/PublicHolidayCalendarAssignedUsersTab";
import { updatePublicHolidayCalendarAction } from "../../actions/updatePublicHolidayCalendarAction";
import { createPublicHolidayAction } from "../../actions/createPublicHolidayAction";
import { updatePublicHolidayAction } from "../../actions/updatePublicHolidayAction";
import { deletePublicHolidayAction } from "../../actions/deletePublicHolidayAction";
import { useInvalidatePublicHolidaysQuery } from "../../hooks/usePublicHolidayCalendars";
import {
  ExportDataModal,
  ExportDataFormValues,
  triggerExportDownload,
} from "@/components/modules/settings/shared/ExportDataModal";

type Props = {
  calendar: PublicHolidayCalendar;
  holidays: PublicHoliday[];
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

function holidaysToDraft(holidays: PublicHoliday[]): DraftHoliday[] {
  return holidays.map((h) => ({ localId: h.id, id: h.id, name: h.name, holidayDate: h.holidayDate }));
}

export const PublicHolidayCalendarDetailsComponent: FC<Props> = ({ calendar, holidays }) => {
  const invalidate = useInvalidatePublicHolidaysQuery();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleExport = async ({ format }: ExportDataFormValues) => {
    try {
      await triggerExportDownload(`/api/public-holiday/calendars/${calendar.id}/export`, format);
      setIsExportOpen(false);
    } catch (error) {
      console.error("Failed to export holiday calendar:", error);
    }
  };

  const [editedName, setEditedName] = useState(calendar.name);
  const [editedCountry, setEditedCountry] = useState(calendar.sourceCountryCode ?? "");
  const [editedRegion, setEditedRegion] = useState(calendar.sourceRegionCode ?? "");
  const [editedHolidays, setEditedHolidays] = useState<DraftHoliday[]>([]);
  const [nameError, setNameError] = useState("");
  const [holidayErrors, setHolidayErrors] = useState<DraftHolidayErrors>({});
  const [generalError, setGeneralError] = useState("");

  const [holidaySearch, setHolidaySearch] = useState("");

  const enterEditMode = () => {
    setEditedName(calendar.name);
    setEditedCountry(calendar.sourceCountryCode ?? "");
    setEditedRegion(calendar.sourceRegionCode ?? "");
    setEditedHolidays(holidaysToDraft(holidays));
    setNameError("");
    setHolidayErrors({});
    setGeneralError("");
    setSaveError("");
    setIsEditing(true);
  };

  const cancelEditMode = () => {
    setIsEditing(false);
    setSaveError("");
  };

  const validate = useCallback((): boolean => {
    let valid = true;

    if (!editedName.trim()) {
      setNameError("Calendar name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    if (editedHolidays.length === 0) {
      setGeneralError("At least one holiday day is required.");
      valid = false;
    } else {
      setGeneralError("");
    }

    const seenDates = new Set<string>();
    const rowErrors: DraftHolidayErrors = {};

    for (const h of editedHolidays) {
      const rowErr: { name?: string; holidayDate?: string } = {};
      if (!h.name.trim()) {
        rowErr.name = "Name is required.";
        valid = false;
      }
      if (!h.holidayDate) {
        rowErr.holidayDate = "Date is required.";
        valid = false;
      } else if (seenDates.has(h.holidayDate)) {
        rowErr.holidayDate = "Duplicate date.";
        valid = false;
      } else {
        seenDates.add(h.holidayDate);
      }
      if (rowErr.name || rowErr.holidayDate) rowErrors[h.localId] = rowErr;
    }

    setHolidayErrors(rowErrors);
    return valid;
  }, [editedName, editedHolidays]);

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    setSaveError("");

    try {
      const originalMap = new Map(holidays.map((h) => [h.id, h]));
      const editedWithId = editedHolidays.filter((h) => h.id);
      const editedWithoutId = editedHolidays.filter((h) => !h.id);

      const deletedIds = holidays
        .filter((h) => !editedHolidays.some((d) => d.id === h.id))
        .map((h) => h.id);

      const modified = editedWithId.filter((d) => {
        const orig = originalMap.get(d.id!);
        return orig && (d.name !== orig.name || d.holidayDate !== orig.holidayDate);
      });

      const nextCountry = editedCountry.trim() || null;
      const nextRegion = editedRegion.trim() || null;
      const metaChanged =
        editedName.trim() !== calendar.name ||
        nextCountry !== (calendar.sourceCountryCode ?? null) ||
        nextRegion !== (calendar.sourceRegionCode ?? null);

      if (metaChanged) {
        await updatePublicHolidayCalendarAction({
          id: calendar.id,
          body: {
            name: editedName.trim(),
            year: calendar.year,
            sourceType: calendar.sourceType,
            sourceExternalId: calendar.sourceExternalId,
            sourceCountryCode: nextCountry,
            sourceRegionCode: nextRegion,
            sourceLocale: calendar.sourceLocale,
          },
        });
      }
      for (const id of deletedIds) {
        await deletePublicHolidayAction({ id });
      }
      for (const d of modified) {
        await updatePublicHolidayAction({ id: d.id!, body: { name: d.name.trim(), holidayDate: d.holidayDate } });
      }
      for (const d of editedWithoutId) {
        await createPublicHolidayAction({ calendarId: calendar.id, body: { name: d.name.trim(), holidayDate: d.holidayDate } });
      }

      invalidate();
      setIsEditing(false);
    } catch {
      setSaveError("Something went wrong while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isEditFormValid = useMemo(() => {
    if (!editedName.trim()) return false;
    if (editedHolidays.length === 0) return false;
    return editedHolidays.every((h) => h.name.trim() && h.holidayDate);
  }, [editedName, editedHolidays]);

  const visibleHolidays = useMemo(() => {
    const sorted = [...holidays].sort((a, b) => a.holidayDate.localeCompare(b.holidayDate));
    const q = holidaySearch.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((h) => h.name.toLowerCase().includes(q) || h.holidayDate.includes(q));
  }, [holidays, holidaySearch]);

  const badge = statusBadge(calendar.status);
  const meta = [String(calendar.year), calendar.sourceCountryCode, calendar.sourceRegionCode]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col gap-5 overflow-hidden px-8 pt-2">
      {/* Header + status + description */}
      <div className="flex flex-none flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <SettingsPageHeader title={calendar.name} backHref="/settings/time/public-holidays" />
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="outline"
              aria-label="Export calendar"
              onClick={() => setIsExportOpen(true)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className={badge.className}>
              {badge.label}
            </Badge>
          </div>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {meta ? `${meta}. ` : ""}This is the holiday-days section for this calendar — review and
          edit the days below, and manage who this calendar is assigned to.
        </p>
      </div>

      <Tabs defaultValue="holidays" className="flex min-h-0 flex-1 flex-col gap-4">
        <TabsList className="grid w-full flex-none grid-cols-2 bg-brown-50">
          <TabsTrigger value="holidays" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Holidays
          </TabsTrigger>
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assigned people
          </TabsTrigger>
        </TabsList>

        <TabsContent value="holidays" className="min-h-0 flex-1">
          {isEditing ? (
            <div className="flex h-full min-h-0 flex-col gap-5">
              <div className="flex flex-none items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-foreground">Edit calendar</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-1.5" disabled={isSaving} onClick={cancelEditMode}>
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button className="gap-1.5" disabled={!isEditFormValid || isSaving} onClick={handleSave}>
                    {isSaving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>

              <div className="grid flex-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-calendar-name">Calendar name</Label>
                  <Input
                    id="edit-calendar-name"
                    value={editedName}
                    onChange={(e) => {
                      setEditedName(e.currentTarget.value);
                      if (nameError) setNameError("");
                    }}
                    disabled={isSaving}
                    aria-invalid={!!nameError}
                  />
                  {nameError && <p className="text-sm text-destructive">{nameError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-calendar-country">Country</Label>
                  <Input
                    id="edit-calendar-country"
                    value={editedCountry}
                    onChange={(e) => setEditedCountry(e.currentTarget.value)}
                    disabled={isSaving}
                    placeholder="e.g. DE"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-calendar-region">Region</Label>
                  <Input
                    id="edit-calendar-region"
                    value={editedRegion}
                    onChange={(e) => setEditedRegion(e.currentTarget.value)}
                    disabled={isSaving}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <PublicHolidayDaysEditor
                  holidays={editedHolidays}
                  onChange={setEditedHolidays}
                  errors={holidayErrors}
                  disabled={isSaving}
                />
                {generalError && <p className="mt-2 text-sm text-destructive">{generalError}</p>}
              </div>

              {saveError && <p className="flex-none text-sm text-destructive">{saveError}</p>}
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col gap-6">
              {/* Info block */}
              <div className="flex-none space-y-1 pb-1 pt-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Holidays{" "}
                  <span className="font-normal text-brown-400">({holidays.length})</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Public holiday days included in this calendar.
                </p>
              </div>

              {/* Toolbar: search (left) + edit (right) */}
              <div className="flex flex-none items-center justify-between gap-4">
                <div className="relative w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
                  <Input
                    value={holidaySearch}
                    onChange={(e) => setHolidaySearch(e.currentTarget.value)}
                    className="h-9 w-[260px] pl-9"
                    placeholder="Search holidays"
                    inputMode="search"
                  />
                </div>
                <Button className="gap-1.5" onClick={enterEditMode}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </div>

              {visibleHolidays.length > 0 ? (
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <table className="w-full caption-bottom text-sm table-fixed">
                    <TableHeader className="[&_tr]:border-brown-200 sticky top-0 z-10 bg-white">
                      <TableRow>
                        <TableHead className="w-1/2 pl-4">Holiday</TableHead>
                        <TableHead className="w-1/2">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleHolidays.map((holiday) => (
                        <TableRow key={holiday.id} className="border-brown-200 [&_td]:py-2">
                          <TableCell className="pl-4 font-medium">{holiday.name}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {holiday.holidayDate}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </table>
                </div>
              ) : holidaySearch ? (
                <div className="flex min-h-40 flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
                  <CalendarDays className="mb-3 h-6 w-6 text-brown-400" />
                  <p className="text-sm font-medium text-foreground">No holidays match your search</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try a different name or date.</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={enterEditMode}
                  className="flex min-h-40 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-brown-300 px-6 py-10 text-center transition-colors hover:border-brown-400 hover:bg-brown-50"
                >
                  <CalendarDays className="mb-3 h-6 w-6 text-brown-400" />
                  <p className="text-sm font-medium text-foreground">Click to start editing</p>
                  <p className="mt-1 text-sm text-muted-foreground">Add holiday days to this calendar.</p>
                </button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assigned" className="min-h-0 flex-1">
          <PublicHolidayCalendarAssignedUsersTab calendarId={calendar.id} calendarName={calendar.name} />
        </TabsContent>
      </Tabs>

      <ExportDataModal
        isOpen={isExportOpen}
        title={`Export ${calendar.name}`}
        description="Export this calendar's details, its holiday days, and its assigned users."
        includedText="Three sheets — General Information (name, country, region, days, year, status, created by, created at), Holidays (name, date) and Assigned Users (first name, last name, email, position)."
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </div>
  );
};
