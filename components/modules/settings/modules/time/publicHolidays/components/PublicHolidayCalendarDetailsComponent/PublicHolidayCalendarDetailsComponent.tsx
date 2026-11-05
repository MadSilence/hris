"use client";

import { type DateFormatter, useDateFormatter } from "@/lib/date";
import { useCanManagePublicHolidayCalendars } from "../../hooks/useCanManagePublicHolidayCalendars";
import { FC, useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar03Icon, CalendarAdd01Icon, Cancel01Icon, Download01Icon, PencilEdit02Icon, RssIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/desact/tabs";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/desact/table";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { CountryFlag } from "@/components/ui/CountryFlag";

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
import {
  usePublicHolidayOverrides,
  useRevertPublicHolidayOverride,
} from "../../hooks/usePublicHolidayOverrides";
import {
  PublicHolidayEditedMarker,
  PublicHolidayOverrideRowActions,
  RemovedProviderDays,
} from "../PublicHolidayOverrides";
import type { PublicHolidayOverride } from "@/models/publicHolidays/holiday";
import { showError } from "@/lib/errors/errorToast";
import { StatusBadge, type EntityStatus } from "@/components/ui/StatusBadge";
import { SearchBox } from "@/components/ui/SearchBox";
import {
  ExportDataModal,
  ExportDataFormValues,
  triggerExportDownload,
} from "@/components/modules/settings/shared/ExportDataModal";
import { FormError } from "@/components/feedback/FormError";

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
function formatHolidayDate(iso: string, formatDisplayDate: DateFormatter): string {
  return formatDisplayDate(iso, { style: "medium" });
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
  const t = useTranslations("timeOff");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");
  const invalidate = useInvalidatePublicHolidaysQuery();
  const canManage = useCanManagePublicHolidayCalendars();

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
  /**
   * The calendar's version when Edit was pressed. Captured then, not read off `calendar` at save
   * time: a refetch while the editor is open would otherwise hand the save a version the form was
   * never filled from, and a colleague's save in between would be overwritten instead of refused.
   */
  const [editedVersion, setEditedVersion] = useState<number | undefined>(calendar.version);
  const [nameError, setNameError] = useState("");
  const [holidayErrors, setHolidayErrors] = useState<DraftHolidayErrors>({});
  const [generalError, setGeneralError] = useState("");

  const [holidaySearch, setHolidaySearch] = useState("");
  const [fillMessage, setFillMessage] = useState("");

  const fillYear = useFillPublicHolidayYear();

  /**
   * The company's overrides of the provider's days. A calendar with no provider has nothing to
   * override, so it does not ask.
   */
  const overridesQuery = usePublicHolidayOverrides({
    calendarId: calendar.id,
    year,
    enabled: calendar.sourceType !== PublicHolidayCalendarSourceType.Manual,
  });
  const revertOverride = useRevertPublicHolidayOverride();
  const [revertMessage, setRevertMessage] = useState("");

  const { overrideByHoliday, removedProviderDays } = useMemo(() => {
    const overrides = overridesQuery.data ?? [];
    return {
      overrideByHoliday: new Map(
        overrides.filter((o) => o.holidayId).map((o) => [o.holidayId as string, o]),
      ),
      removedProviderDays: overrides.filter((o) => !o.holidayId && o.providerPresent),
    };
  }, [overridesQuery.data]);

  /** "Revert to Provider": the day becomes the provider's again, and the leave under it is re-priced. */
  const handleRevert = async (override: PublicHolidayOverride) => {
    setRevertMessage("");
    const name =
      holidays.find((h) => h.id === override.holidayId)?.name ?? override.providerName ?? t("publicHolidays.details.theDay");
    try {
      const result = await revertOverride.mutateAsync({ overrideId: override.id });
      const repriced = result?.recalculatedRequests ?? 0;
      setRevertMessage(
        repriced > 0
          ? t("publicHolidays.details.revertedRepriced", { name, count: repriced })
          : t("publicHolidays.details.reverted", { name }),
      );
    } catch (error) {
      showError(error);
    }
  };

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
          ? t("publicHolidays.details.loaded", { count: result.daysWritten, year: String(year) })
          : t("publicHolidays.details.alreadyHasDays", { year: String(year) }),
      );
    } catch {
      setFillMessage(t("publicHolidays.details.loadFailed"));
    }
  };

  const enterEditMode = () => {
    setEditedName(calendar.name);
    setEditedCountry(calendar.sourceCountryCode ?? "");
    setEditedRegion(calendar.sourceRegionCode ?? "");
    setEditedSubstitution(calendar.weekendSubstitution);
    setEditedHolidays(holidaysToDraft(holidays));
    setEditedVersion(calendar.version);
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
      setNameError(t("publicHolidays.days.nameRequired"));
      valid = false;
    } else {
      setNameError("");
    }

    if (editedHolidays.length === 0) {
      setGeneralError(t("publicHolidays.newCalendar.atLeastOne"));
      valid = false;
    } else {
      setGeneralError("");
    }

    const rowErrors: DraftHolidayErrors = {};
    // Covers duplicate start dates too, and unlike a date-by-date check it also catches a span
    // swallowing a day that starts elsewhere.
    const overlaps = findDraftOverlaps(editedHolidays, t);

    for (const h of editedHolidays) {
      const rowErr: { name?: string; holidayDate?: string; endDate?: string } = {};

      if (!h.name.trim()) {
        rowErr.name = t("publicHolidays.days.nameRequired");
        valid = false;
      }
      if (!h.holidayDate) {
        rowErr.holidayDate = t("publicHolidays.days.dateRequired");
        valid = false;
      } else if (overlaps[h.localId]) {
        rowErr.holidayDate = overlaps[h.localId];
        valid = false;
      }
      if (h.endDate && h.holidayDate && h.endDate < h.holidayDate) {
        rowErr.endDate = t("publicHolidays.days.endBeforeStart");
        valid = false;
      }
      if (rowErr.name || rowErr.holidayDate || rowErr.endDate) rowErrors[h.localId] = rowErr;
    }

    setHolidayErrors(rowErrors);
    return valid;
  }, [editedName, editedHolidays, t]);

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

      // Both writes are guarded on the calendar's version. The fields go first and move it, so the
      // year is sent the version that write produced rather than the one the editor was opened with.
      let version = editedVersion;

      if (metaChanged) {
        const metaResult = await updatePublicHolidayCalendarAction({
          id: calendar.id,
          body: {
            name: editedName.trim(),
            sourceType: calendar.sourceType,
            sourceExternalId: calendar.sourceExternalId,
            sourceCountryCode: nextCountry,
            sourceRegionCode: nextRegion,
            sourceLocale: calendar.sourceLocale,
            weekendSubstitution: editedSubstitution,
            version,
          },
        });

        // This result used to be ignored, so a refused rename went on to save the year and the
        // editor closed as if everything had landed. A refusal — E00409 included — keeps it open.
        if (metaResult.status === ActionStatus.ERROR) {
          setSaveError(metaResult.errorMessage || t("publicHolidays.details.saveFailed"));
          return;
        }
        version = metaResult.data?.version ?? version;
        // Kept for a retry: if the year is refused below, the editor stays open, and the next Save
        // must not be refused for the version this person's own first write moved.
        setEditedVersion(version);
      }

      // The whole year in one request: the server diffs it, so a half-written calendar is no
      // longer possible.
      const result = await replacePublicHolidayYearAction({
        calendarId: calendar.id,
        year,
        version,
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
        setSaveError(result.errorMessage || t("publicHolidays.details.saveFailed"));
        return;
      }

      invalidate();
      setIsEditing(false);
    } catch {
      setSaveError(t("publicHolidays.details.saveFailed"));
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
            <Button type="button"
              size="icon"
              variant="secondary"
              aria-label={t("publicHolidays.details.subscribe")}
              title={t("publicHolidays.details.subscribe")}
              onClick={() => setIsSubscribeOpen(true)}
            >
              <Icon icon={RssIcon} size="sm" />
            </Button>
            {canManage ? (
              <Button type="button"
                size="icon"
                variant="secondary"
                aria-label={t("publicHolidays.details.export")}
                onClick={() => setIsExportOpen(true)}
              >
                <Icon icon={Download01Icon} size="sm" />
              </Button>
            ) : null}
            <StatusBadge status={status}/>
          </div>
        </div>
        <p className="max-w-2xl text-body text-tertiary">
          {t("publicHolidays.details.intro")}
        </p>
      </div>

      <Tabs defaultValue="holidays" className="flex min-h-0 flex-1 flex-col gap-4">
        <TabsList className="flex-none">
          <TabsTrigger value="holidays" className="flex items-center gap-2">
            <Icon icon={Calendar03Icon} size="sm" />
            {t("publicHolidays.details.tabHolidays")}
          </TabsTrigger>
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <Icon icon={UserGroupIcon} size="sm" />
            {t("publicHolidays.details.tabAssigned")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="holidays" className="min-h-0 flex-1">
          {isEditing ? (
            <div className="flex h-full min-h-0 flex-col gap-5">
              <div className="flex flex-none items-center justify-between gap-4">
                <h3 className="text-body font-semibold text-primary">{t("publicHolidays.details.editTitle")}</h3>
                <div className="flex gap-2">
                  <Button type="button"
                    variant="secondary"
                    className="gap-1.5"
                    disabled={isSaving}
                    onClick={cancelEditMode}
                  >
                    <Icon icon={Cancel01Icon} size="sm" />
                    {tCommon("actions.cancel")}
                  </Button>
                  <Button type="button" disabled={!isEditFormValid || isSaving} onClick={handleSave}>
                    {isSaving ? tCommon("actions.saving") : tCommon("actions.save")}
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
                  <h2 className="mb-1 text-body font-semibold text-primary">
                    {t("publicHolidays.newCalendar.holidayDays")}
                  </h2>
                  <p className="text-body text-tertiary">
                    {t("publicHolidays.newCalendar.holidayDaysHint")}
                    {editedHolidays.length > 0 && (
                      <span className="ml-2 font-medium text-primary">
                        {t("publicHolidays.newCalendar.daysAdded", { count: totalDraftDays(editedHolidays) })}
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
                {generalError && <FormError message={generalError} />}
              </div>

              {saveError && <FormError message={saveError} />}
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col gap-6">
              {/* Info block */}
              <div className="flex-none space-y-1 pb-1 pt-2">
                <h2 className="text-section-title text-primary">
                  {t.rich("publicHolidays.details.count", {
                    count: holidays.length,
                    muted: (chunks) => <span className="font-normal text-tertiary">{chunks}</span>,
                  })}
                </h2>
                <p className="text-body text-tertiary">
                  {t("publicHolidays.details.countHint")}
                </p>
              </div>

              {/* Toolbar: search + year (left) + edit (right) */}
              <div className="flex flex-none items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <SearchBox value={holidaySearch} onChange={setHolidaySearch}/>

                  <PublicHolidayYearSelect
                    value={year}
                    onChange={(next) => {
                      setFillMessage("");
                      setRevertMessage("");
                      onYearChange(next);
                    }}
                    available={canAddYears ? undefined : calendar.years}
                  />

                  {canManage && canFillYear && (
                    <Button type="button"
                      variant="secondary"
                      className="gap-1.5"
                      disabled={fillYear.isPending}
                      onClick={handleFillYear}
                    >
                      <Icon icon={CalendarAdd01Icon} size="sm" />
                      {fillYear.isPending ? tCommon("states.loading") : t("publicHolidays.details.loadYear", { year: String(year) })}
                    </Button>
                  )}
                </div>

                {canManage ? (
                  <Button type="button" className="gap-1.5" onClick={enterEditMode}>
                    <Icon icon={PencilEdit02Icon} size="sm" />
                    {tCommon("actions.edit")}
                  </Button>
                ) : null}
              </div>

              {fillMessage && (
                <p className="flex-none text-body text-tertiary">{fillMessage}</p>
              )}
              {revertMessage && (
                <p className="flex-none text-body text-tertiary">{revertMessage}</p>
              )}

              {isHolidaysLoading ? (
                <div className="min-h-0 flex-1 pr-1 text-body text-tertiary">
                  {t("publicHolidays.details.loadingYear", { year: String(year) })}
                </div>
              ) : visibleHolidays.length > 0 ? (
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  {/* Same columns as the editor, so switching into Edit does not move anything. */}
                  <table className="w-full caption-bottom table-fixed text-body">
                    <TableHeader className="[&_tr]:border-divider sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="w-44">{t("publicHolidays.days.date")}</TableHead>
                        <TableHead className="w-44">{t("publicHolidays.days.endDate")}</TableHead>
                        <TableHead>{t("publicHolidays.days.name")}</TableHead>
                        <TableHead className="w-12">
                          <span className="sr-only">{t("publicHolidays.days.actions")}</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleHolidays.map((holiday) => {
                        const isSpan =
                          !!holiday.endDate && holiday.endDate !== holiday.holidayDate;
                        const override = overrideByHoliday.get(holiday.id);

                        return (
                          <TableRow key={holiday.id} className="border-divider [&_td]:py-2">
                            <TableCell className="text-tertiary">
                              {formatHolidayDate(holiday.holidayDate, formatDisplayDate)}
                              {holiday.observedDate &&
                                holiday.observedDate !== holiday.holidayDate && (
                                  <span className="ml-2 text-hint text-tertiary">
                                    {t("publicHolidays.details.observed", { date: formatHolidayDate(holiday.observedDate, formatDisplayDate) })}
                                  </span>
                                )}
                            </TableCell>
                            <TableCell className="text-tertiary">
                              {isSpan ? (
                                <span className="flex items-baseline gap-2">
                                  {formatHolidayDate(holiday.endDate, formatDisplayDate)}
                                  <span className="text-hint text-tertiary">
                                    {t("publicHolidays.details.spanDays", { count: holidaySpanDays(holiday.holidayDate, holiday.endDate) })}
                                  </span>
                                </span>
                              ) : (
                                null
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {holiday.name}
                              {holiday.dayPart === PublicHolidayDayPart.HalfDay && (
                                <span className="ml-2 rounded-tag bg-mist px-1.5 py-0.5 text-hint font-normal text-secondary">
                                  {t("publicHolidays.details.halfDay")}
                                </span>
                              )}
                              {override && <PublicHolidayEditedMarker override={override} />}
                            </TableCell>
                            <TableCell className="py-1">
                              {override && canManage && status !== "archived" ? (
                                <PublicHolidayOverrideRowActions
                                  override={override}
                                  disabled={revertOverride.isPending}
                                  onRevert={handleRevert}
                                />
                              ) : null}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </table>
                </div>
              ) : holidaySearch ? (
                <div className="flex min-h-40 flex-1 flex-col items-center justify-center rounded-card border border-dashed px-6 py-10 text-center">
                  <Icon icon={Calendar03Icon} size="lg" className="mb-3 text-tertiary" />
                  <p className="text-body font-medium text-primary">
                    {t("publicHolidays.details.noMatch")}
                  </p>
                  <p className="mt-1 text-body text-tertiary">{t("publicHolidays.details.noMatchHint")}</p>
                </div>
              ) : !canManage ? (
                <div className="flex min-h-40 flex-1 flex-col items-center justify-center rounded-card border border-dashed px-6 py-10 text-center">
                  <Icon icon={Calendar03Icon} size="lg" className="mb-3 text-tertiary" />
                  <p className="text-body font-medium text-primary">{t("publicHolidays.details.noneForYear", { year: String(year) })}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={enterEditMode}
                  className="flex min-h-40 flex-1 flex-col items-center justify-center rounded-card border border-dashed border-field px-6 py-10 text-center transition-colors hover:border-strong hover:bg-subtle"
                >
                  <Icon icon={Calendar03Icon} size="lg" className="mb-3 text-tertiary" />
                  <p className="text-body font-medium text-primary">{t("publicHolidays.details.startEditing")}</p>
                  <p className="mt-1 text-body text-tertiary">
                    {canFillYear
                      ? t("publicHolidays.details.addOrLoad", { year: String(year) })
                      : t("publicHolidays.details.addForYear", { year: String(year) })}
                  </p>
                </button>
              )}

              <RemovedProviderDays
                overrides={removedProviderDays}
                canRevert={canManage && status !== "archived"}
                disabled={revertOverride.isPending}
                onRevert={handleRevert}
              />
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
        title={t("publicHolidays.details.exportTitle", { name: calendar.name })}
        description={t("publicHolidays.details.exportDescription")}
        includedText={t("publicHolidays.details.exportIncluded")}
        onCancelAction={() => setIsExportOpen(false)}
        onConfirmAction={handleExport}
      />
    </div>
  );
};
