"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { useCanAccess } from "@/components/auth/useAccess";
import { showSuccess } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import { NONE_VALUE, noneOrValue, valueOrNone } from "@/models/select";
import { AttributeType } from "@/models/attribute/AttributeType";
import {
  useCompanySettings,
  useUpdateCompanySettings,
} from "@/components/modules/settings/modules/general/companyProfile/hooks/useCompanySettings";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

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
  const t = useTranslations("settings.home.birthday");
  const tCommon = useTranslations("common");

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
      showSuccess(t("saved"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : messageForError(caught));
    }
  };

  return (
    <section className="space-y-3" aria-labelledby="birthday-field-heading">
      <div>
        <h2 id="birthday-field-heading" className="text-section-title">{t("title")}</h2>
        <p className="text-body text-tertiary">
          {t.rich("description", {
            link: (chunks) => (
              <Link href="/settings/people/roles" className="font-medium text-accent-text underline-offset-4 hover:underline">{chunks}</Link>
            ),
          })}
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
            <Label htmlFor="birthday-field">{t("title")}</Label>
            <SearchableSelect
              id="birthday-field"
              options={[
                { value: NONE_VALUE, label: tCommon("values.none") },
                // The stored choice is a field this reader's access does not list — it still shows, by what it is.
                ...(storedIsHidden ? [{ value: stored, label: t("hidden") }] : []),
                ...dateFields.map((attribute) => ({ value: attribute.id, label: attribute.name })),
              ]}
              value={value || null}
              onChange={(next) => {
                setDraft(next ?? NONE_VALUE);
                setError(null);
              }}
              disabled={!canEdit || update.isPending}
              clearable={false}
            />
          </div>
          {canEdit && (
            <Button type="submit" disabled={!dirty || update.isPending} >
              {tCommon("actions.save")}
            </Button>
          )}
        </form>
      )}
      {error && <FormError message={error}/>}
    </section>
  );
};
