"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { CardContent } from "@/public/desact/src/components/ui/card";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";

import {
  PublicHolidayDaysEditor,
  type DraftHoliday,
  type DraftHolidayErrors,
} from "../PublicHolidayDaysEditor";
import { useCreatePublicHolidayCalendar } from "../../hooks/useCreatePublicHolidayCalendar";
import { usePublicHolidayTemplatePreview } from "../../hooks/usePublicHolidayTemplatePreview";
import { createPublicHolidayAction } from "../../actions/createPublicHolidayAction";
import {
  PublicHolidayCalendarSourceType,
  PublicHolidayCalendarStatus,
} from "@/api/modules/publicHolidays/calendars/dto";

const CURRENT_YEAR = new Date().getFullYear();

export function PublicHolidayCalendarNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") ?? "";

  const { data: templatePreview, isLoading: isTemplateLoading } =
    usePublicHolidayTemplatePreview({
      templateId,
      year: CURRENT_YEAR,
    });

  const createCalendarMutation = useCreatePublicHolidayCalendar();

  const [draftName, setDraftName] = useState(
    templateId ? "" : "New Public Holiday Calendar",
  );
  const [draftYear, setDraftYear] = useState(CURRENT_YEAR);
  const [draftHolidays, setDraftHolidays] = useState<DraftHoliday[]>([]);
  const [initialized, setInitialized] = useState(!templateId);

  const [nameError, setNameError] = useState("");
  const [yearError, setYearError] = useState("");
  const [holidayErrors, setHolidayErrors] = useState<DraftHolidayErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (templatePreview && !initialized) {
      setDraftName(templatePreview.templateName);
      setDraftYear(templatePreview.year);
      setDraftHolidays(
        templatePreview.holidays.map((h) => ({
          localId: crypto.randomUUID(),
          name: h.name,
          holidayDate: h.holidayDate,
          endDate: "",
        })),
      );
      setInitialized(true);
    }
  }, [templatePreview, initialized]);

  const validate = useCallback((): boolean => {
    let valid = true;

    if (!draftName.trim()) {
      setNameError("Calendar name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    const yearNum = Number(draftYear);
    if (!yearNum || yearNum < 2000 || yearNum > 2100) {
      setYearError("Please enter a valid year (2000–2100).");
      valid = false;
    } else {
      setYearError("");
    }

    if (draftHolidays.length === 0) {
      setGeneralError("Please add at least one holiday day.");
      valid = false;
    } else {
      setGeneralError("");
    }

    const seenDates = new Set<string>();
    const rowErrors: DraftHolidayErrors = {};

    for (const h of draftHolidays) {
      const rowErr: { name?: string; holidayDate?: string; endDate?: string } = {};

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
      if (h.endDate && h.holidayDate && h.endDate < h.holidayDate) {
        rowErr.endDate = "End must be on or after the start.";
        valid = false;
      }

      if (rowErr.name || rowErr.holidayDate || rowErr.endDate) {
        rowErrors[h.localId] = rowErr;
      }
    }

    setHolidayErrors(rowErrors);
    return valid;
  }, [draftName, draftYear, draftHolidays]);

  const isFormValid = useMemo(() => {
    if (!draftName.trim()) return false;
    if (draftHolidays.length === 0) return false;
    return draftHolidays.every((h) => h.name.trim() && h.holidayDate);
  }, [draftName, draftHolidays]);

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const calendarResult = await createCalendarMutation.mutateAsync({
        name: draftName.trim(),
        year: Number(draftYear),
        status: PublicHolidayCalendarStatus.Active,
        sourceType: PublicHolidayCalendarSourceType.Manual,
        sourceExternalId: null,
        sourceCountryCode: null,
        sourceRegionCode: null,
        sourceLocale: null,
      });

      const calendarId = calendarResult.data?.id;
      if (!calendarId) throw new Error("Failed to retrieve calendar ID.");

      for (const holiday of draftHolidays) {
        await createPublicHolidayAction({
          calendarId,
          body: { name: holiday.name.trim(), holidayDate: holiday.holidayDate, endDate: holiday.endDate || holiday.holidayDate },
        });
      }

      router.push("/settings/time/public-holidays");
    } catch {
      setGeneralError(
        "Something went wrong while creating the calendar. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading =
    isSubmitting || createCalendarMutation.isPending;

  if (templateId && isTemplateLoading) {
    return (
      <div className="min-h-svh bg-[var(--color-bg-primary)] p-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <SettingsPageHeader
            title="New Public Holiday Calendar"
            backHref="/settings/time/public-holidays"
          />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[var(--color-bg-primary)] p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <SettingsPageHeader
            title="New Public Holiday Calendar"
            backHref="/settings/time/public-holidays"
          />
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Creating…" : "Create Public Holiday Calendar"}
          </Button>
        </div>

        <CardContent className="flex flex-col gap-8 rounded-xl border bg-white px-6 py-6">
          <div>
            <h2 className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">
              Calendar details
            </h2>
            <p className="mb-4 text-sm text-[var(--color-text-tertiary)]">
              Give this calendar a name and specify the year it covers.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="calendar-name">Calendar name</Label>
                <Input
                  id="calendar-name"
                  value={draftName}
                  onChange={(e) => {
                    setDraftName(e.currentTarget.value);
                    if (nameError) setNameError("");
                  }}
                  placeholder="e.g., Poland 2026"
                  disabled={isLoading}
                  aria-invalid={!!nameError}
                />
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendar-year">Year</Label>
                <Input
                  id="calendar-year"
                  type="number"
                  min={2000}
                  max={2100}
                  value={draftYear}
                  onChange={(e) => {
                    setDraftYear(Number(e.currentTarget.value));
                    if (yearError) setYearError("");
                  }}
                  disabled={isLoading}
                  aria-invalid={!!yearError}
                />
                {yearError && (
                  <p className="text-sm text-destructive">{yearError}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  Holiday days
                </h2>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  Add all public holiday days for this calendar.
                  {draftHolidays.length > 0 && (
                    <span className="ml-2 text-[var(--color-text-primary)] font-medium">
                      {draftHolidays.length}{" "}
                      {draftHolidays.length === 1 ? "day" : "days"} added
                    </span>
                  )}
                </p>
              </div>
            </div>

            {draftHolidays.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
                <div className="mb-3 rounded-2xl bg-brown-50 p-3">
                  <CalendarDays className="h-6 w-6 text-[var(--color-text-tertiary)]" />
                </div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  No holidays yet
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
                  Add your first holiday day below.
                </p>
                <div className="mt-4">
                  <PublicHolidayDaysEditor
                    holidays={draftHolidays}
                    onChange={setDraftHolidays}
                    errors={holidayErrors}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <PublicHolidayDaysEditor
                holidays={draftHolidays}
                onChange={setDraftHolidays}
                errors={holidayErrors}
                disabled={isLoading}
              />
            )}

            {generalError && (
              <p className="mt-3 text-sm text-destructive">{generalError}</p>
            )}
          </div>
        </CardContent>
      </div>
    </div>
  );
}
