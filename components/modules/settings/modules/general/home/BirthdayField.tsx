"use client";

import React, { useState } from "react";
import Link from "next/link";
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

/** The stored choice is a field this reader's access does not list — it still shows, by what it is. */
const HIDDEN_LABEL = "A field you cannot see";

/**
 * Which date field home reads birthdays from (sitting 2, H7) — the same shape as Attendance's hourly rate
 * field. None: no birthdays on home. Never the internal birth-date column, which no role can be refused.
 *
 * Choosing the field does not show anybody's birthday to anybody: home lists birthdays only to readers who
 * may see this field for everyone, which is set in the roles' field access — private by default.
 */
export const BirthdayField: React.FC = () => {
  const settings = useCompanySettings();
  const groups = useAttributeGroups();
  const update = useUpdateCompanySettings();
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

  const dateFields = (groups.data ?? [])
    .flatMap((group) => group.attributes ?? [])
    .filter((attribute) => attribute.type === AttributeType.DATE);
  const stored = noneOrValue(settings.data?.birthdayAttributeId);
  const value = draft ?? stored;
  const storedIsHidden = stored !== NONE_VALUE && !groups.isLoading
    && !dateFields.some((attribute) => attribute.id === stored);
  const dirty = draft !== null && draft !== stored;

  const save = async () => {
    if (!settings.data) return;
    setError(null);
    try {
      await update.mutateAsync({
        timezone: settings.data.timezone,
        workingDays: settings.data.workingDays,
        weekStartDay: settings.data.weekStartDay,
        birthdayField: { attributeId: valueOrNone<string>(value) },
        version: settings.data.version,
      });
      setDraft(null);
      showSuccess("Birthday field saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messageForError(caught));
    }
  };

  return (
    <section className="space-y-3" aria-labelledby="birthday-field-heading">
      <div>
        <h2 id="birthday-field-heading" className="text-lg font-semibold">Birthday Field</h2>
        <p className="text-sm text-muted-foreground">
          The date field home&apos;s Celebrations reads birthdays from, shown as day and month only. A birthday is
          listed only to people whose role may see this field for everyone — set that in{" "}
          <Link href="/settings/people/roles" className="font-medium text-brown-600 hover:underline">Employee Roles &amp; Access</Link>,
          under field access. By default nobody but the person sees their own.
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
            <Label htmlFor="birthday-field">Birthday Field</Label>
            <Select
              value={value}
              onValueChange={(next) => {
                setDraft(next);
                setError(null);
              }}
              disabled={!canEdit || update.isPending}
            >
              <SelectTrigger id="birthday-field">
                <SelectValue placeholder="Select"/>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={NONE_VALUE}>{NONE_LABEL}</SelectItem>
                {storedIsHidden && <SelectItem value={stored}>{HIDDEN_LABEL}</SelectItem>}
                {dateFields.map((attribute) => (
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
