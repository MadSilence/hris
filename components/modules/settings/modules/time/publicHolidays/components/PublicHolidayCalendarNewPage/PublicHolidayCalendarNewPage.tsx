"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PublicHolidayCalendarFields } from "../PublicHolidayCalendarFields";
import { PublicHolidayYearSelect } from "../PublicHolidayYearSelect";

import {
  PublicHolidayDaysEditor,
  type DraftHoliday,
  type DraftHolidayErrors,
} from "../PublicHolidayDaysEditor";
import { findDraftOverlaps } from "../PublicHolidayDaysEditor/holidayOverlap";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { totalDraftDays } from "../PublicHolidayDaysEditor/holidaySpan";
import { useCreatePublicHolidayCalendar } from "../../hooks/useCreatePublicHolidayCalendar";
import { usePublicHolidayTemplate } from "../../hooks/usePublicHolidayTemplate";
import { usePublicHolidayTemplatePreview } from "../../hooks/usePublicHolidayTemplatePreview";
import { useReplacePublicHolidayYear } from "../../hooks/useReplacePublicHolidayYear";
import {
  PublicHolidayCalendarSourceType,
  PublicHolidayCalendarStatus,
} from "@/api/modules/publicHolidays/calendars/dto";
import { PublicHolidayTemplateProvider } from "@/api/modules/publicHolidays/templates/dto";

const CURRENT_YEAR = new Date().getFullYear();

/** Which provider owns the days, so a later re-fill knows who to ask. */
const sourceTypeOf = (provider?: PublicHolidayTemplateProvider) => {
  if (provider === PublicHolidayTemplateProvider.NagerDate) {
    return PublicHolidayCalendarSourceType.Nager;
  }
  if (provider === PublicHolidayTemplateProvider.GoogleCalendar) {
    return PublicHolidayCalendarSourceType.Google;
  }
  return PublicHolidayCalendarSourceType.Manual;
};

/** "Poland holidays" → "Poland": a calendar is a place, so its name should read like one. */
const calendarNameFromTemplate = (templateName: string) =>
  templateName.replace(/\s+holidays$/i, "").trim() || templateName;

export function PublicHolidayCalendarNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") ?? "";
  /** Chosen in the import wizard: the template read through one subdivision. */
  const templateRegion = searchParams.get("region") ?? "";

  const [draftName, setDraftName] = useState(
    templateId ? "" : "New Public Holiday Calendar",
  );
  const [draftYear, setDraftYear] = useState(CURRENT_YEAR);
  const [draftCountry, setDraftCountry] = useState("");
  const [draftRegion, setDraftRegion] = useState("");
  const [draftHolidays, setDraftHolidays] = useState<DraftHoliday[]>([]);
  /** The year whose template days are currently in the editor; null until the first seed. */
  const [seededYear, setSeededYear] = useState<number | null>(templateId ? null : CURRENT_YEAR);
  const [nameTouched, setNameTouched] = useState(false);

  const { data: template } = usePublicHolidayTemplate({ templateId });

  /**
   * Seed country and region from the template once. They stay editable afterwards, so this only
   * fills the blanks — a value the user has already touched is never overwritten.
   */
  const [locationSeeded, setLocationSeeded] = useState(!templateId);

  useEffect(() => {
    if (!template || locationSeeded) return;

    setDraftCountry(template.countryCode === "GLOBAL" ? "" : template.countryCode);
    setDraftRegion(templateRegion || (template.regionCode ?? ""));
    setLocationSeeded(true);
  }, [template, locationSeeded, templateRegion]);

  const {
    data: templatePreview,
    isFetching: isPreviewFetching,
    // Read, at last. The backend answers this correctly \u2014 `PHT00004` after three attempts at the
    // provider \u2014 and the page threw the answer away, so an unreachable provider looked exactly like
    // a country with no holidays: an empty editor under "No holidays yet".
    error: previewError,
    refetch: refetchPreview,
  } = usePublicHolidayTemplatePreview({
    templateId,
    year: draftYear,
    regionCode: templateRegion || null,
  });

  // Only while a template is selected. Typing a calendar by hand is a legitimate empty editor.
  const previewFailed = Boolean(templateId) && !isPreviewFetching && !!previewError;

  const createCalendarMutation = useCreatePublicHolidayCalendar();
  const replaceYearMutation = useReplacePublicHolidayYear();

  const [nameError, setNameError] = useState("");
  const [holidayErrors, setHolidayErrors] = useState<DraftHolidayErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Re-seeds the editor whenever the template answers for a different year — picking another year has
   * to bring that year's days, not leave the old dates under a new label. A typed name survives.
   */
  useEffect(() => {
    if (!templatePreview || templatePreview.year === seededYear) return;

    if (!nameTouched) {
      const base = calendarNameFromTemplate(templatePreview.templateName);
      setDraftName(templateRegion ? `${base} — ${templateRegion}` : base);
    }

    setDraftHolidays(
      templatePreview.holidays.map((holiday) => ({
        localId: crypto.randomUUID(),
        name: holiday.name,
        holidayDate: holiday.holidayDate,
        // The provider merges its day-by-day listing into spans, so a multi-day holiday arrives as
        // one row. Blank means "same day" to the editor.
        endDate: holiday.endDate && holiday.endDate !== holiday.holidayDate ? holiday.endDate : "",
        sourceEventId: holiday.sourceEventId,
      })),
    );
    setSeededYear(templatePreview.year);
  }, [templatePreview, seededYear, nameTouched, templateRegion]);

  const validate = useCallback((): boolean => {
    let valid = true;

    if (!draftName.trim()) {
      setNameError("Name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    if (draftHolidays.length === 0) {
      setGeneralError("Please add at least one holiday day.");
      valid = false;
    } else {
      setGeneralError("");
    }

    const rowErrors: DraftHolidayErrors = {};
    const overlaps = findDraftOverlaps(draftHolidays);

    for (const h of draftHolidays) {
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

      if (rowErr.name || rowErr.holidayDate || rowErr.endDate) {
        rowErrors[h.localId] = rowErr;
      }
    }

    setHolidayErrors(rowErrors);
    return valid;
  }, [draftName, draftHolidays]);

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
        status: PublicHolidayCalendarStatus.Active,
        // A template-built calendar keeps the link to its source, so it can be re-filled later.
        sourceType: sourceTypeOf(template?.provider),
        sourceExternalId: template?.id ?? null,
        sourceCountryCode: draftCountry.trim() || null,
        sourceRegionCode: draftRegion.trim() || null,
        sourceLocale: template?.languageCode ?? null,
      });

      const calendarId = calendarResult.data?.id;
      if (!calendarId) throw new Error("Failed to retrieve calendar ID.");

      // One request for the whole year, not one per day.
      await replaceYearMutation.mutateAsync({
        calendarId,
        year: draftYear,
        holidays: draftHolidays.map((holiday) => ({
          id: null,
          name: holiday.name.trim(),
          holidayDate: holiday.holidayDate,
          endDate: holiday.endDate || holiday.holidayDate,
          dayPart: holiday.dayPart,
          sourceEventId: holiday.sourceEventId ?? null,
        })),
      });

      router.push(`/settings/time/public-holidays/${calendarId}`);
    } catch {
      setGeneralError(
        "Something went wrong while creating the calendar. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading =
    isSubmitting || createCalendarMutation.isPending || replaceYearMutation.isPending;
  /* `seededYear` is only set by a preview that came back, so a provider that never answers left this
     true for ever and the page sat on its skeleton — with the failure branch below written, correct and
     unreachable. A failed preview is an answer: stop waiting for one. */
  const isFirstTemplateLoad = Boolean(templateId) && seededYear === null && !previewFailed;

  if (isFirstTemplateLoad) {
    return (
      <div className="flex h-[calc(100svh-6rem)] flex-col overflow-hidden">
        <div className="shrink-0 px-8 pt-2">
          <SettingsPageHeader
            title="New Public Holiday Calendar"
            backHref="/settings/time/public-holidays"
          />
          <div className="space-y-4 pt-5">
            <Skeleton className="h-9 w-full max-w-sm" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col overflow-hidden">
      {/* Everything above the day list stays put; only the list below scrolls. */}
      <div className="shrink-0 px-8 pt-2">
        <div className="flex items-center justify-between gap-4">
          <SettingsPageHeader
            title="New Public Holiday Calendar"
            backHref="/settings/time/public-holidays"
          />
          <Button onClick={handleSubmit} disabled={!isFormValid || isLoading}>
            {isLoading ? "Saving…" : "Save"}
          </Button>
        </div>

        <div className="pt-5">
          <PublicHolidayCalendarFields
            idPrefix="new-calendar"
            name={draftName}
            onNameChange={(value) => {
              setNameTouched(true);
              setDraftName(value);
              if (nameError) setNameError("");
            }}
            nameError={nameError}
            countryCode={draftCountry}
            onCountryChange={setDraftCountry}
            regionCode={draftRegion}
            onRegionChange={setDraftRegion}
            countryName={template?.countryName}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-end justify-between gap-4 pb-4 pt-6">
          <div>
            <h2 className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">
              Holiday days
            </h2>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Add all public holiday days for this calendar.
              {templateId && isPreviewFetching ? (
                <span className="ml-2">Loading {draftYear}…</span>
              ) : previewFailed ? null : (
                draftHolidays.length > 0 && (
                  <span className="ml-2 font-medium text-[var(--color-text-primary)]">
                    {totalDraftDays(draftHolidays)}{" "}
                    {totalDraftDays(draftHolidays) === 1 ? "day" : "days"} added
                  </span>
                )
              )}
            </p>
          </div>

          <PublicHolidayYearSelect
            id="new-calendar-year"
            value={draftYear}
            onChange={setDraftYear}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-6">
        {previewFailed && draftHolidays.length === 0 ? (
          /*
            "Add your first holiday day below" is an invitation, and an invitation is the wrong
            answer to a failure: it tells somebody who picked Germany that Germany has no holidays.
            The editor stays open underneath \u2014 entering them by hand is still a way forward \u2014 but
            the reason comes first, with the retry, because the provider is usually back in a minute.
          */
          <ErrorState
            error={previewError}
            title={`${draftYear} holidays could not be loaded`}
            onRetry={() => void refetchPreview()}
            compact
          />
        ) : draftHolidays.length === 0 ? (
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

        <FormError message={generalError || null} className="mt-3" />
      </div>
    </div>
  );
}
