"use client";

import { FC, useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, CalendarPlus, Download, Pencil, Rss, Search, Users, X } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public/desact/src/components/ui/table";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { isoToDate } from "@/components/ui/DatePicker";

import {
  PublicHolidayCalendarSourceType,
  PublicHolidayCalendarStatus,
  PublicHolidayCalendarWeekendSubstitution,
} from "@/api/modules/publicHolidays/calendars/dto";
import { PublicHolidayDayPart } from "@/api/modules/publicHolidays/holidays/dto";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { PublicHolidayCalendar } from "@/models/publicHolidays/calendar";
import type { PublicHoliday } from "@/models/publicHolidays/holiday";
import {
  PublicHolidayDaysEditor,
  type DraftHoliday,
  type DraftHolidayErrors,
} from "../PublicHolidayDaysEditor";
import { PublicHolidayCalendarFields } from "../PublicHolidayCalendarFields";
import { PublicHolidayYearSelect } from "../PublicHolidayYearSelect";
import { PublicHolidayCalendarAssignedUsersTab } from "../PublicHolidayCalendarAssignedUsersTab/PublicHolidayCalendarAssignedUsersTab";
import { SubscribeCalendarModal } from "../modals/SubscribeCalendarModal";
import { updatePublicHolidayCalendarAction } from "../../actions/updatePublicHolidayCalendarAction";
import { replacePublicHolidayYearAction } from "../../actions/replacePublicHolidayYearAction";
import { findDraftOverlaps } from "../PublicHolidayDaysEditor/holidayOverlap";
import { holidaySpanDays, totalDraftDays } from "../PublicHolidayDaysEditor/holidaySpan";
import { mapServerFieldErrors } from "../PublicHolidayDaysEditor/serverFieldErrors";
import { useInvalidatePublicHolidaysQuery } from "../../hooks/usePublicHolidayCalendars";
import { useFillPublicHolidayYear } from "../../hooks/useFillPublicHolidayYear";
import { StatusBadge, type EntityStatus } from "@/components/ui/StatusBadge";
import {
  ExportDataModal,
  ExportDataFormValues,
  triggerExportDownload,
} from "@/components/modules/settings/shared/ExportDataModal";

type Props = {
  calendar: PublicHolidayCalendar;
  /** Days of the selected year only. */
  holidays: PublicHoliday[];
  year: number;
  onYearChange: (year: number) => void;
  isHolidaysLoading: boolean;
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

/** Matches how the editor's date fields read a day back to you. */
function formatHolidayDate(iso: string): string {
  const date = isoToDate(iso);
  return Number.isNaN(date.getTime()) ? iso : format(date, "MMM d, yyyy");
}

function holidaysToDraft(holidays: PublicHoliday[]): DraftHoliday[] {
  return holidays.map((h) => ({
    localId: h.id,
    id: h.id,
    name: h.name,
    holidayDate: h.holidayDate,
    endDate: h.endDate && h.endDate !== h.holidayDate ? h.endDate : "",
    dayPart: h.dayPart,
    sourceEventId: h.sourceEventId,
  }));
}

export const PublicHolidayCalendarDetailsComponent: FC<Props> = ({
  calendar,
  holidays,
  year,
  onYearChange,
  isHolidaysLoading,
}) => {
  const invalidate = useInvalidatePublicHolidaysQuery();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleExport = async ({ format: exportFormat }: ExportDataFormValues) => {
    try {
      await triggerExportDownload(
        `/api/public-holiday/calendars/${calendar.id}/export`,
        exportFormat,
      );
      setIsExportOpen(false);
    } catch (error) {
      console.error("Failed to export holiday calendar:", error);
    }
  };

  const [editedName, setEditedName] = useState(calendar.name);
  const [editedCountry, setEditedCountry] = useState(calendar.sourceCountryCode ?? "");
  const [editedRegion, setEditedRegion] = useState(calendar.sourceRegionCode ?? "");
  const [editedSubstitution, setEditedSubstitution] =
    useState<PublicHolidayCalendarWeekendSubstitution>(calendar.weekendSubstitution);
  const [editedHolidays, setEditedHolidays] = useState<DraftHoliday[]>([]);
  const [nameError, setNameError] = useState("");
  const [holidayErrors, setHolidayErrors] = useState<DraftHolidayErrors>({});
  const [generalError, setGeneralError] = useState("");

  const [holidaySearch, setHolidaySearch] = useState("");
  const [fillMessage, setFillMessage] = useState("");

  const fillYear = useFillPublicHolidayYear();

  /**
   * A sourced calendar can pull a year it does not have yet. The backend refuses to touch a year
   * that already has days, so this is only offered for an empty one.
   */
  const canFillYear =
    calendar.sourceType !== PublicHolidayCalendarSourceType.Manual &&
    !!calendar.sourceExternalId &&
    !calendar.years.includes(year);

  const handleFillYear = async () => {
    setFillMessage("");
    try {
      const result = await fillYear.mutateAsync({ calendarId: calendar.id, year });

      setFillMessage(
        result.applied
          ? `Loaded ${result.daysWritten} ${result.daysWritten === 1 ? "day" : "days"} for ${year}.`
          : `${year} already has days — nothing was changed.`,
      );
    } catch {
      setFillMessage("Could not load that year. Please try again.");
    }
  };

  const enterEditMode = () => {
    setEditedName(calendar.name);
    setEditedCountry(calendar.sourceCountryCode ?? "");
    setEditedRegion(calendar.sourceRegionCode ?? "");
    setEditedSubstitution(calendar.weekendSubstitution);
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
      setNameError("Name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    if (editedHolidays.length === 0) {
      setGeneralError("Please add at least one holiday day.");
      valid = false;
    } else {
      setGeneralError("");
    }

    const rowErrors: DraftHolidayErrors = {};
    // Covers duplicate start dates too, and unlike a date-by-date check it also catches a span
    // swallowing a day that starts elsewhere.
    const overlaps = findDraftOverlaps(editedHolidays);

    for (const h of editedHolidays) {
      const rowErr: { name?: string; holidayDate?: string; endDate?: string } = {};

      if (!h.name.trim()) {
        rowErr.name = "Name is required.";
        valid = false;
      }
      if (!h.holidayDate) {
        rowErr.holidayDate = "Date is required.";
        valid = false;
      } else if (overlaps[h.localId]) {
        rowErr.holidayDate = overlaps[h.localId];
        valid = false;
      }
      if (h.endDate && h.holidayDate && h.endDate < h.holidayDate) {
        rowErr.endDate = "End must be on or after the start.";
        valid = false;
      }
      if (rowErr.name || rowErr.holidayDate || rowErr.endDate) rowErrors[h.localId] = rowErr;
    }

    setHolidayErrors(rowErrors);
    return valid;
  }, [editedName, editedHolidays]);

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    setSaveError("");

    try {
      const nextCountry = editedCountry.trim() || null;
      const nextRegion = editedRegion.trim() || null;
      const metaChanged =
        editedName.trim() !== calendar.name ||
        nextCountry !== (calendar.sourceCountryCode ?? null) ||
        nextRegion !== (calendar.sourceRegionCode ?? null) ||
        editedSubstitution !== calendar.weekendSubstitution;

      if (metaChanged) {
        await updatePublicHolidayCalendarAction({
          id: calendar.id,
          body: {
            name: editedName.trim(),
            sourceType: calendar.sourceType,
            sourceExternalId: calendar.sourceExternalId,
            sourceCountryCode: nextCountry,
            sourceRegionCode: nextRegion,
            sourceLocale: calendar.sourceLocale,
            weekendSubstitution: editedSubstitution,
          },
        });
      }

      // The whole year in one request: the server diffs it, so a half-written calendar is no
      // longer possible.
      const result = await replacePublicHolidayYearAction({
        calendarId: calendar.id,
        year,
        holidays: editedHolidays.map((h) => ({
          id: h.id ?? null,
          name: h.name.trim(),
          holidayDate: h.holidayDate,
          endDate: h.endDate || h.holidayDate,
          dayPart: h.dayPart,
          sourceEventId: h.sourceEventId ?? null,
        })),
      });

      if (result.status === ActionStatus.ERROR) {
        // The backend points at the row it refused — a collision with the neighbouring year is
        // something the editor cannot see on its own, since it only holds one year.
        setHolidayErrors(mapServerFieldErrors(result.fieldErrors, editedHolidays));
        setSaveError(result.errorMessage || "Something went wrong while saving. Please try again.");
        return;
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

  const status = calendarStatus(calendar.status);

  /** Only a sourced calendar has anywhere to get an unseen year from. */
  const canAddYears =
    calendar.sourceType !== PublicHolidayCalendarSourceType.Manual && !!calendar.sourceExternalId;

  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col gap-5 overflow-hidden px-8 pt-2">
      {/* Header + status + description */}
      <div className="flex flex-none flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <SettingsPageHeader
            title={calendar.name}
            backHref="/settings/time/public-holidays"
            leading={
              calendar.sourceCountryCode ? (
                <CountryFlag countryCode={calendar.sourceCountryCode} className="h-6 w-9" />
              ) : null
            }
          />
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="outline"
              aria-label="Subscribe in your calendar app"
              title="Subscribe in your calendar app"
              onClick={() => setIsSubscribeOpen(true)}
            >
              <Rss className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Export calendar"
              onClick={() => setIsExportOpen(true)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <StatusBadge status={status}/>
          </div>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This is the holiday-days section for this calendar — review and edit the days below, and
          manage who this calendar is assigned to.
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
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    disabled={isSaving}
                    onClick={cancelEditMode}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button disabled={!isEditFormValid || isSaving} onClick={handleSave}>
                    {isSaving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>

              <div className="flex-none">
                <PublicHolidayCalendarFields
                  idPrefix="edit-calendar"
                  name={editedName}
                  onNameChange={(value) => {
                    setEditedName(value);
                    if (nameError) setNameError("");
                  }}
                  nameError={nameError}
                  countryCode={editedCountry}
                  onCountryChange={setEditedCountry}
                  regionCode={editedRegion}
                  onRegionChange={setEditedRegion}
                  weekendSubstitution={editedSubstitution}
                  onWeekendSubstitutionChange={setEditedSubstitution}
                  disabled={isSaving}
                />
              </div>

              <div className="flex flex-none items-end justify-between gap-4">
                <div>
                  <h2 className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">
                    Holiday days
                  </h2>
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    Add all public holiday days for this calendar.
                    {editedHolidays.length > 0 && (
                      <span className="ml-2 font-medium text-[var(--color-text-primary)]">
                        {totalDraftDays(editedHolidays)}{" "}
                        {totalDraftDays(editedHolidays) === 1 ? "day" : "days"} added
                      </span>
                    )}
                  </p>
                </div>

                {/* Editing is scoped to one year, so the year is fixed while the form is open. */}
                <PublicHolidayYearSelect value={year} onChange={onYearChange} disabled />
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
                  <span className="font-normal text-brown-400">{holidays.length}</span> Holidays
                </h2>
                <p className="text-sm text-muted-foreground">
                  Public holiday days included in this calendar.
                </p>
              </div>

              {/* Toolbar: search + year (left) + edit (right) */}
              <div className="flex flex-none items-center justify-between gap-4">
                <div className="flex items-center gap-3">
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

                  <PublicHolidayYearSelect
                    value={year}
                    onChange={(next) => {
                      setFillMessage("");
                      onYearChange(next);
                    }}
                    available={canAddYears ? undefined : calendar.years}
                  />

                  {canFillYear && (
                    <Button
                      variant="outline"
                      className="gap-1.5"
                      disabled={fillYear.isPending}
                      onClick={handleFillYear}
                    >
                      <CalendarPlus className="h-4 w-4" />
                      {fillYear.isPending ? "Loading…" : `Load ${year}`}
                    </Button>
                  )}
                </div>

                <Button className="gap-1.5" onClick={enterEditMode}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </div>

              {fillMessage && (
                <p className="flex-none text-sm text-muted-foreground">{fillMessage}</p>
              )}

              {isHolidaysLoading ? (
                <div className="min-h-0 flex-1 pr-1 text-sm text-muted-foreground">
                  Loading {year}…
                </div>
              ) : visibleHolidays.length > 0 ? (
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  {/* Same columns as the editor, so switching into Edit does not move anything. */}
                  <table className="w-full caption-bottom table-fixed text-sm">
                    <TableHeader className="[&_tr]:border-brown-200 sticky top-0 z-10 bg-white">
                      <TableRow>
                        <TableHead className="w-44">Date</TableHead>
                        <TableHead className="w-44">End date</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleHolidays.map((holiday) => {
                        const isSpan =
                          !!holiday.endDate && holiday.endDate !== holiday.holidayDate;

                        return (
                          <TableRow key={holiday.id} className="border-brown-100 [&_td]:py-2">
                            <TableCell className="text-muted-foreground">
                              {formatHolidayDate(holiday.holidayDate)}
                              {holiday.observedDate &&
                                holiday.observedDate !== holiday.holidayDate && (
                                  <span className="ml-2 text-xs text-brown-400">
                                    observed {formatHolidayDate(holiday.observedDate)}
                                  </span>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {isSpan ? (
                                <span className="flex items-baseline gap-2">
                                  {formatHolidayDate(holiday.endDate)}
                                  <span className="text-xs text-brown-400">
                                    {holidaySpanDays(holiday.holidayDate, holiday.endDate)} days
                                  </span>
                                </span>
                              ) : (
                                <span className="text-brown-300">—</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {holiday.name}
                              {holiday.dayPart === PublicHolidayDayPart.HalfDay && (
                                <span className="ml-2 rounded bg-brown-100 px-1.5 py-0.5 text-[10px] font-normal text-brown-600">
                                  Half day
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </table>
                </div>
              ) : holidaySearch ? (
                <div className="flex min-h-40 flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
                  <CalendarDays className="mb-3 h-6 w-6 text-brown-400" />
                  <p className="text-sm font-medium text-foreground">
                    No holidays match your search
                  </p>
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
                  <p className="mt-1 text-sm text-muted-foreground">
                    {canFillYear
                      ? `Add holiday days for ${year}, or load them from the source above.`
                      : `Add holiday days for ${year} to this calendar.`}
                  </p>
                </button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assigned" className="min-h-0 flex-1">
          <PublicHolidayCalendarAssignedUsersTab
            calendarId={calendar.id}
            calendarName={calendar.name}
            isArchived={status === "archived"}
          />
        </TabsContent>
      </Tabs>

      <SubscribeCalendarModal
        isOpen={isSubscribeOpen}
        onCloseAction={() => setIsSubscribeOpen(false)}
        calendarId={calendar.id}
        calendarName={calendar.name}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        title={`Export ${calendar.name}`}
        description="Export this calendar's details, its holiday days, and its assigned users."
        includedText="Three sheets — General Information (name, country, region, days, status, created by, created at), Holidays (name, dates, year) and Assigned Users (first name, last name, email, position)."
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </div>
  );
};
