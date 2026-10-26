"use client";

import React, { useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { useCanAccess } from "@/components/auth/useAccess";
import { showSuccess } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import { NONE_LABEL, NONE_VALUE, noneOrValue, valueOrNone } from "@/models/select";
import { AttributeType } from "@/models/attribute/AttributeType";
import {
  useCompanySettings,
  useUpdateCompanySettings,
} from "@/components/modules/settings/modules/general/companyProfile/hooks/useCompanySettings";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useInvalidateAttendance } from "@/components/modules/attendance/hooks";

/** The stored choice is a field this reader's access does not list — it still shows, by what it is. */
const HIDDEN_LABEL = "A field you cannot see";

/**
 * Which money field Attendance prices logged time from. Its value on the person is copied into each
 * entry when the time is logged, so changing the field — or a person's rate — never re-prices a day
 * already logged. None: no money in Attendance at all.
 */
export const AttendanceRateField: React.FC = () => {
  const settings = useCompanySettings();
  const groups = useAttributeGroups();
  const update = useUpdateCompanySettings();
  const invalidateAttendance = useInvalidateAttendance();
  const canEdit = useCanAccess("SETTINGS.GENERAL", "EDIT");
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (settings.error || groups.error) {
    return (
      <ErrorState
        error={settings.error ?? groups.error}
        compact
        onRetry={() => void (settings.error ? settings.refetch() : groups.refetch())}
      />
    );
  }

  const moneyFields = (groups.data ?? [])
    .flatMap((group) => group.attributes ?? [])
    .filter((attribute) => attribute.type === AttributeType.MONEY);
  const stored = noneOrValue(settings.data?.attendanceRateAttributeId);
  const value = draft ?? stored;
  const storedIsHidden = stored !== NONE_VALUE && !groups.isLoading
    && !moneyFields.some((attribute) => attribute.id === stored);
  const dirty = draft !== null && draft !== stored;

  const save = async () => {
    if (!settings.data) return;
    setError(null);
    try {
      await update.mutateAsync({
        timezone: settings.data.timezone,
        workingDays: settings.data.workingDays,
        weekStartDay: settings.data.weekStartDay,
        attendanceRate: { attributeId: valueOrNone<string>(value) },
        version: settings.data.version,
      });
      setDraft(null);
      void invalidateAttendance();
      showSuccess("Hourly rate field saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messageForError(caught));
    }
  };

  return (
    <section className="space-y-3" aria-labelledby="attendance-rate-heading">
      <div>
        <h2 id="attendance-rate-heading" className="text-lg font-semibold">Hourly Rate</h2>
        <p className="text-sm text-muted-foreground">
          The money field Attendance prices logged time from. A person&apos;s rate is copied into each entry when
          the time is logged, so a later change never re-prices a day already logged. Amounts are shown only to
          people who may see this field.
        </p>
      </div>

      {settings.isLoading || groups.isLoading ? (
        <Skeleton className="h-9 w-64"/>
      ) : (
        <form
          noValidate
          className="flex items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div className="w-64 space-y-1">
            <Label htmlFor="attendance-rate-field">Hourly Rate Field</Label>
            <Select
              value={value}
              onValueChange={(next) => {
                setDraft(next);
                setError(null);
              }}
              disabled={!canEdit || update.isPending}
            >
              <SelectTrigger id="attendance-rate-field">
                <SelectValue placeholder="Select"/>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={NONE_VALUE}>{NONE_LABEL}</SelectItem>
                {storedIsHidden && <SelectItem value={stored}>{HIDDEN_LABEL}</SelectItem>}
                {moneyFields.map((attribute) => (
                  <SelectItem key={attribute.id} value={attribute.id}>{attribute.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
