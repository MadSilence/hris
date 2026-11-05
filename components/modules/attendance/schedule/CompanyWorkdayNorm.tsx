"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Skeleton } from "@/components/desact/skeleton";
import { TimePicker } from "@/components/ui/TimePicker";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { useCanAccess } from "@/components/auth/useAccess";
import { showSuccess } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import { formatMinutes } from "@/models/attendance";
import {
  useCompanySettings,
  useUpdateCompanySettings,
} from "@/components/modules/settings/modules/general/companyProfile/hooks/useCompanySettings";
import { parseDuration } from "@/components/modules/attendance/lib";
import { useInvalidateAttendance } from "@/components/modules/attendance/hooks";

const DEFAULT_NORM = 480;
const DEFAULT_START = 540;

const toClock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
const fromClock = (clock: string): number | null => {
  const m = /^(\d{2}):(\d{2})$/.exec(clock);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

/**
 * When a company working day starts and how long it is — the norm Attendance expects of anybody without a
 * personal schedule, and the start Log hours' Full day and Half day presets begin at (the owner, 2026-11-05, C3).
 * The company's working days say *which* days; this says *when* and *how long*. Kept in the company settings,
 * edited here, beside the personal schedules that override the length.
 */
export const CompanyWorkdayNorm: React.FC = () => {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const settings = useCompanySettings();
  const update = useUpdateCompanySettings();
  const invalidateAttendance = useInvalidateAttendance();
  const canEdit = useCanAccess("SETTINGS.GENERAL", "EDIT");
  const [draft, setDraft] = useState<string | null>(null);
  const [startDraft, setStartDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (settings.error) {
    return <ErrorState error={settings.error} compact onRetry={() => void settings.refetch()}/>;
  }

  const stored = settings.data?.dailyNormMinutes ?? DEFAULT_NORM;
  const value = draft ?? formatMinutes(stored);
  const parsed = parseDuration(value);
  const storedStart = settings.data?.workdayStartMinutes ?? DEFAULT_START;
  const startValue = startDraft ?? toClock(storedStart);
  const parsedStart = fromClock(startValue);
  const dirty = (draft !== null && parsed !== stored) || (startDraft !== null && parsedStart !== storedStart);

  const save = async () => {
    // Saving what is already stored is a no-op, not a request.
    if (!settings.data || !dirty) return;
    if (parsed === null || parsed < 1 || parsed > 24 * 60) {
      setError(t("workday.invalid"));
      return;
    }
    setError(null);
    try {
      await update.mutateAsync({
        timezone: settings.data.timezone,
        workingDays: settings.data.workingDays,
        weekStartDay: settings.data.weekStartDay,
        dailyNormMinutes: parsed,
        workdayStartMinutes: parsedStart ?? storedStart,
        version: settings.data.version,
      });
      setDraft(null);
      setStartDraft(null);
      void invalidateAttendance();
      showSuccess(t("workday.saved"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messageForError(caught));
    }
  };

  return (
    <section className="space-y-3" aria-labelledby="company-workday-heading">
      <div>
        <h2 id="company-workday-heading" className="text-section-title">{t("workday.title")}</h2>
        <p className="text-body text-tertiary">{t("workday.description")}</p>
      </div>

      {settings.isLoading ? (
        <Skeleton className="h-9 w-40"/>
      ) : (
        <form
          noValidate
          className="flex items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
 >
          <div className="w-36 space-y-1">
            <Label htmlFor="company-workday-start">{t("workday.startsAt")}</Label>
            <TimePicker
              id="company-workday-start"
              value={startValue}
              disabled={!canEdit || update.isPending}
              onChange={(next) => {
                setStartDraft(next);
                setError(null);
              }}
            />
          </div>
          <div className="w-32 space-y-1">
            <Label htmlFor="company-workday-length">{t("workday.length")}</Label>
            <Input
              id="company-workday-length"
              className="tabular-nums"
              value={value}
              disabled={!canEdit || update.isPending}
              onChange={(event) => {
                setDraft(event.target.value);
                setError(null);
              }}
            />
          </div>
          {canEdit && (
            <Button type="submit" disabled={update.isPending}>
              {tCommon("actions.save")}
            </Button>
          )}
        </form>
      )}
      {error && <FormError message={error}/>}
    </section>
  );
};
