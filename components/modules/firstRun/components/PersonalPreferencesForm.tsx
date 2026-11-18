"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { NodRing } from "@/components/desact/nod";

import { Button } from "@/components/desact/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { updateUserSettingsAction } from "@/components/modules/firstRun/actions";
import { USER_SETTINGS_QK, useUserSettings } from "@/components/modules/firstRun/hooks";
import { setDisplayPreferences } from "@/lib/date";
import { offsetOf, timeZoneChoices } from "@/lib/timeZones";
import { LOCALES, toLanguage } from "@/i18n/locales";

/**
 * Not the shared `NONE_VALUE`: there is no "no value" state here. Everybody reads times in some zone,
 * and the question is whose — so this option is a real answer ("follow the company, wherever it
 * moves"), not an absence, and `FORMS_AND_FIELDS.md` § 5 is about absences.
 */
export const FOLLOW_COMPANY = "__company__";

/**
 * A person's time zone: "same as the company" or one of a short list of real zones written as offsets. Shared by the
 * preferences page and the welcome's last step (W4). `null` is "follow the company".
 */
export function TimeZoneSelect({
  id,
  value,
  onChange,
  companyTimeZone,
  disabled,
}: {
  id: string;
  value: string | null;
  onChange: (zone: string | null) => void;
  companyTimeZone: string | undefined;
  disabled?: boolean;
}) {
  const t = useTranslations("firstRun");
  const options = React.useMemo(() => {
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return [
      {
        value: FOLLOW_COMPANY,
        label: companyTimeZone
          ? t("preferences.timeZone.followCompanyWithOffset", { offset: offsetOf(companyTimeZone).text })
          : t("preferences.timeZone.followCompany"),
        keywords: companyTimeZone ?? "",
      },
      // A short list of real zones written as offsets — see `lib/timeZones` for why the value stays
      // a zone. The person's own stored zone is kept even when it is not one of the offered ones.
      ...timeZoneChoices(value).map((choice) => ({
        value: choice.zone,
        label: choice.label,
        keywords: choice.keywords,
        hint: choice.zone === browserZone ? t("preferences.timeZone.thisDevice") : undefined,
      })),
    ];
  }, [companyTimeZone, value, t]);

  return (
    // Searchable, not a plain Select: a reader who knows they are in Warsaw should type it rather than scroll.
    <SearchableSelect
      id={id}
      options={options}
      value={value ?? FOLLOW_COMPANY}
      onChange={(v) => onChange(v === FOLLOW_COMPANY || v === null ? null : v)}
      clearable={false}
      disabled={disabled}
    />
  );
}

/**
 * A person's own language (I18N.md § 5; first-run-welcome W4). With `followLabel` the first option is "same as the
 * company" (`null`); without it the list is the languages alone, preset to the one in effect.
 */
export function LanguageSelect({
  id,
  value,
  onChange,
  followLabel,
  disabled,
}: {
  id: string;
  value: string | null;
  onChange: (language: string | null) => void;
  followLabel?: string;
  disabled?: boolean;
}) {
  const tCommon = useTranslations("common");
  return (
    <Select
      value={value ?? FOLLOW_COMPANY}
      onValueChange={(v) => onChange(v === FOLLOW_COMPANY ? null : v)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {followLabel && <SelectItem value={FOLLOW_COMPANY}>{followLabel}</SelectItem>}
        {LOCALES.map((code) => (
          <SelectItem key={code} value={code}>{tCommon(`language.${code}`)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * The preferences a person sets about how the product reads to them: the time zone and the language. The date
 * format is not one of them — it is the company's, by its country (DECISIONS.md § "The designers' Home fixes,
 * round 1"). A time format would be the third — the column is there — but nothing in the product writes a clock
 * time yet, and `DECISIONS.md` § "A setting that is offered must work" is why it is not on this screen.
 *
 * <p>The language is also asked in the welcome (W4); it is here so a person who chose one there can change it again.
 */
export const PersonalPreferencesForm: React.FC = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("firstRun");
  const tCommon = useTranslations("common");
  const { data, isLoading } = useUserSettings();

  const [timeZone, setTimeZone] = React.useState<string | null>(null);
  const [language, setLanguage] = React.useState<string | null>(null);
  const [seeded, setSeeded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!data || seeded) return;
    setTimeZone(data.timeZone);
    setLanguage(toLanguage(data.language));
    setSeeded(true);
  }, [data, seeded]);

  const save = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setSaving(true);
    const languageChanged = (data?.language ?? null) !== language;
    const res = await updateUserSettingsAction({
      timeZone: timeZone ?? undefined,
      clearTimeZone: timeZone === null,
      // Blank is "follow the company" on the wire (UserSettingsService).
      ...(languageChanged ? { language: language ?? "" } : {}),
    });
    setSaving(false);

    if (res.status !== ActionStatus.SUCCESS) {
      showActionError(res);
      return;
    }
    // A new language is a new catalogue, read on the server: the page is loaded again in it.
    if (languageChanged) {
      window.location.reload();
      return;
    }
    // Applied at once rather than on the next full load: the person is looking at dates right now.
    setDisplayPreferences({ timeZone });
    await queryClient.invalidateQueries({ queryKey: USER_SETTINGS_QK });
  };

  const companyLanguage = toLanguage(data?.companyLanguage);

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <RequiredLabel htmlFor="settings-timezone">{t("preferences.timeZone.label")}</RequiredLabel>
        <TimeZoneSelect
          id="settings-timezone"
          value={timeZone}
          onChange={setTimeZone}
          companyTimeZone={data?.companyTimeZone}
          disabled={isLoading}
        />
        <p className="text-hint text-tertiary">
          {t("preferences.timeZone.hint")}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <RequiredLabel htmlFor="settings-language">{t("preferences.language.label")}</RequiredLabel>
        <LanguageSelect
          id="settings-language"
          value={language}
          onChange={setLanguage}
          followLabel={t("preferences.language.followCompany", {
            language: companyLanguage ? tCommon(`language.${companyLanguage}`) : "",
          })}
          disabled={isLoading}
        />
        <p className="text-hint text-tertiary">{t("preferences.language.hint")}</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving || isLoading}>
          {saving && <NodRing size="sm" label="" />}
          {tCommon("actions.save")}
        </Button>
      </div>
    </form>
  );
};
