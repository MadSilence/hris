"use client";

import { FC, useCallback, useMemo, useState } from "react";
import { CalendarDays, Pencil, Users, X } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { CardContent } from "@/public/desact/src/components/ui/card";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import {
  Table,
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
import { renamePublicHolidayCalendarAction } from "../../actions/renamePublicHolidayCalendarAction";
import { createPublicHolidayAction } from "../../actions/createPublicHolidayAction";
import { updatePublicHolidayAction } from "../../actions/updatePublicHolidayAction";
import { deletePublicHolidayAction } from "../../actions/deletePublicHolidayAction";
import { useInvalidatePublicHolidaysQuery } from "../../hooks/usePublicHolidayCalendars";

type Props = {
  calendar: PublicHolidayCalendar;
  holidays: PublicHoliday[];
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
  ARCHIVED: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const MOCK_ASSIGNED_PEOPLE = [
  {
    id: "1",
    name: "Anna Kowalska",
    email: "anna.kowalska@example.com",
    department: "Engineering",
    assignedSince: "2026-01-01",
  },
  {
    id: "2",
    name: "Piotr Nowak",
    email: "piotr.nowak@example.com",
    department: "People Operations",
    assignedSince: "2026-01-01",
  },
];

function holidaysToDraft(holidays: PublicHoliday[]): DraftHoliday[] {
  return holidays.map((h) => ({
    localId: h.id,
    id: h.id,
    name: h.name,
    holidayDate: h.holidayDate,
  }));
}

export const PublicHolidayCalendarDetailsComponent: FC<Props> = ({
  calendar,
  holidays,
}) => {
  const invalidate = useInvalidatePublicHolidaysQuery();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [editedName, setEditedName] = useState(calendar.name);
  const [editedHolidays, setEditedHolidays] = useState<DraftHoliday[]>([]);
  const [nameError, setNameError] = useState("");
  const [holidayErrors, setHolidayErrors] = useState<DraftHolidayErrors>({});
  const [generalError, setGeneralError] = useState("");

  const enterEditMode = () => {
    setEditedName(calendar.name);
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

      if (rowErr.name || rowErr.holidayDate) {
        rowErrors[h.localId] = rowErr;
      }
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

      if (editedName.trim() !== calendar.name) {
        await renamePublicHolidayCalendarAction({
          id: calendar.id,
          body: { name: editedName.trim() },
        });
      }

      for (const id of deletedIds) {
        await deletePublicHolidayAction({ id });
      }

      for (const d of modified) {
        await updatePublicHolidayAction({
          id: d.id!,
          body: { name: d.name.trim(), holidayDate: d.holidayDate },
        });
      }

      for (const d of editedWithoutId) {
        await createPublicHolidayAction({
          calendarId: calendar.id,
          body: { name: d.name.trim(), holidayDate: d.holidayDate },
        });
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

  const sortedHolidays = useMemo(
    () => [...holidays].sort((a, b) => a.holidayDate.localeCompare(b.holidayDate)),
    [holidays],
  );

  const statusLabel =
    calendar.status === PublicHolidayCalendarStatus.Active
      ? "Active"
      : calendar.status === PublicHolidayCalendarStatus.Archived
        ? "Archived"
        : "Draft";

  const meta = [
    String(calendar.year),
    calendar.sourceCountryCode,
    calendar.sourceRegionCode,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="bg-[var(--color-bg-primary)] p-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <SettingsPageHeader
          title={calendar.name}
          backHref="/settings/time/public-holidays"
        />

        <CardContent className="flex flex-col gap-3 rounded-xl border bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-semibold text-[var(--color-text-primary)]">
                {calendar.name}
              </p>
              {meta && (
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  {meta}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className={STATUS_BADGE_CLASSES[calendar.status] ?? "bg-gray-100 text-gray-800"}
            >
              {statusLabel}
            </Badge>
          </div>
        </CardContent>

        <Tabs defaultValue="holidays" className="flex flex-col gap-4">
          <TabsList className="w-fit">
            <TabsTrigger value="holidays">
              <CalendarDays className="mr-2 h-4 w-4" />
              Holidays
            </TabsTrigger>
            <TabsTrigger value="assigned">
              <Users className="mr-2 h-4 w-4" />
              Assigned people
            </TabsTrigger>
          </TabsList>

          <TabsContent value="holidays">
            {isEditing ? (
              <CardContent className="flex flex-col gap-6 rounded-xl bg-white px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Edit calendar
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSaving}
                      onClick={cancelEditMode}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!isEditFormValid || isSaving}
                      onClick={handleSave}
                    >
                      {isSaving ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </div>

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
                    className="max-w-sm"
                  />
                  {nameError && (
                    <p className="text-sm text-destructive">{nameError}</p>
                  )}
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-[var(--color-text-primary)]">
                    Holiday days
                    <span className="ml-2 font-normal text-[var(--color-text-tertiary)]">
                      {editedHolidays.length}{" "}
                      {editedHolidays.length === 1 ? "day" : "days"}
                    </span>
                  </p>
                  <div className="max-h-[50vh] overflow-y-auto pr-1">
                    <PublicHolidayDaysEditor
                      holidays={editedHolidays}
                      onChange={setEditedHolidays}
                      errors={holidayErrors}
                      disabled={isSaving}
                    />
                  </div>
                  {generalError && (
                    <p className="mt-2 text-sm text-destructive">{generalError}</p>
                  )}
                </div>

                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
              </CardContent>
            ) : (
              <CardContent className="flex flex-col gap-4 rounded-xl bg-white px-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    {sortedHolidays.length}{" "}
                    {sortedHolidays.length === 1 ? "holiday" : "holidays"}
                  </p>
                  <Button variant="outline" size="sm" onClick={enterEditMode}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>

                {sortedHolidays.length > 0 ? (
                  <div className="max-h-[50vh] overflow-y-auto rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedHolidays.map((holiday) => (
                          <TableRow key={holiday.id}>
                            <TableCell className="font-mono text-sm">
                              {holiday.holidayDate}
                            </TableCell>
                            <TableCell className="font-medium">
                              {holiday.name}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
                    <CalendarDays className="mb-3 h-6 w-6 text-[var(--color-text-tertiary)]" />
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      No holidays yet
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                      Click Edit to add holiday days.
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </TabsContent>

          <TabsContent value="assigned">
            <CardContent className="flex flex-col gap-4 rounded-xl border bg-white px-6 py-5">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Assigned people
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  People who have this calendar assigned to them.
                </p>
              </div>

              {MOCK_ASSIGNED_PEOPLE.length > 0 ? (
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Assigned since</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_ASSIGNED_PEOPLE.map((person) => (
                        <TableRow key={person.id}>
                          <TableCell className="font-medium">
                            {person.name}
                          </TableCell>
                          <TableCell className="text-[var(--color-text-tertiary)]">
                            {person.email}
                          </TableCell>
                          <TableCell>{person.department}</TableCell>
                          <TableCell className="text-[var(--color-text-tertiary)]">
                            {person.assignedSince}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
                  <Users className="mb-3 h-6 w-6 text-[var(--color-text-tertiary)]" />
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    No one assigned yet
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                    Assignment management is coming soon.
                  </p>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
