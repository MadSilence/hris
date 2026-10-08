"use client";

import React, { useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
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

/**
 * How long a company working day is — the norm Attendance expects of anybody without a personal
 * schedule. The company's working days say *which* days; this says *how long*. Kept in the company
 * settings, edited here, beside the personal schedules that override it.
 */
export const CompanyWorkdayNorm: React.FC = () => {
  const settings = useCompanySettings();
  const update = useUpdateCompanySettings();
  const invalidateAttendance = useInvalidateAttendance();
  const canEdit = useCanAccess("SETTINGS.GENERAL", "EDIT");
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (settings.error) {
    return <ErrorState error={settings.error} compact onRetry={() => void settings.refetch()}/>;
  }

  const stored = settings.data?.dailyNormMinutes ?? DEFAULT_NORM;
  const value = draft ?? formatMinutes(stored);
  const parsed = parseDuration(value);
  const dirty = draft !== null && parsed !== stored;

  const save = async () => {
    if (!settings.data) return;
    if (parsed === null || parsed < 1 || parsed > 24 * 60) {
      setError("Enter the length of a working day as 8:00 or 7.5, up to 24:00.");
      return;
    }
    setError(null);
    try {
      await update.mutateAsync({
        timezone: settings.data.timezone,
        workingDays: settings.data.workingDays,
        weekStartDay: settings.data.weekStartDay,
        dailyNormMinutes: parsed,
        version: settings.data.version,
      });
      setDraft(null);
      void invalidateAttendance();
      showSuccess("Working day saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messageForError(caught));
    }
  };

  return (
    <section className="space-y-3" aria-labelledby="company-workday-heading">
      <div>
        <h2 id="company-workday-heading" className="text-lg font-semibold">Working Day</h2>
        <p className="text-sm text-muted-foreground">
          How long a company working day is. Attendance expects it of everybody without a personal schedule;
          anything logged beyond it is overtime.
        </p>
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
          <div className="w-32 space-y-1">
            <Label htmlFor="company-workday-length">Length</Label>
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
            <Button type="submit" disabled={!dirty || update.isPending} className="bg-brown-600 text-white hover:bg-brown-700">
              Save
            </Button>
          )}
        </form>
      )}
      {error && <FormError message={error}/>}
    </section>
  );
};
