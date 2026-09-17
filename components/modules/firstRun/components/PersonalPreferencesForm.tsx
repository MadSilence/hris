"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showActionError } from "@/lib/errors/errorToast";
import { updateUserSettingsAction } from "@/components/modules/firstRun/actions";
import { USER_SETTINGS_QK, useUserSettings } from "@/components/modules/firstRun/hooks";
import { setDisplayPreferences, type DisplayDateFormat } from "@/lib/date";
import { offsetOf, timeZoneChoices } from "@/lib/timeZones";

/**
 * Not the shared `NONE_VALUE`: there is no "no value" state here. Everybody reads times in some zone,
 * and the question is whose — so this option is a real answer ("follow the company, wherever it
 * moves"), not an absence, and `FORMS_AND_FIELDS.md` § 5 is about absences.
 */
const FOLLOW_COMPANY = "__company__";

/**
 * The preferences a person sets about how the product reads to them.
 *
 * <p>Two of them, and only two, because those are the two that do something today. A time format
 * would be the third — the column is there, and the schema keeps it — but nothing in the product
 * writes a clock time yet, and `DECISIONS.md` § "A setting that is offered must work" is why it is
 * not on this screen. Language is the same: stored when it is asked, never offered as a switch.
 *
 * <p>Used twice: on the preferences page, and as the second step of the welcome.
 */
export const PersonalPreferencesForm: React.FC<{
  /** The welcome's step 2 saves through its own footer, so it hides this one. */
  hideSubmit?: boolean;
  /** Lets the welcome drive the save from its own button. */
  onSavedAction?: () => void;
  formId?: string;
}> = ({ hideSubmit = false, onSavedAction, formId }) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useUserSettings();

  const [timeZone, setTimeZone] = React.useState<string | null>(null);
  const [dateFormat, setDateFormat] = React.useState<DisplayDateFormat>("SYSTEM");
  const [seeded, setSeeded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!data || seeded) return;
    setTimeZone(data.timeZone);
    setDateFormat(data.dateFormat as DisplayDateFormat);
    setSeeded(true);
  }, [data, seeded]);

  const zoneOptions = React.useMemo(() => {
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const companyZone = data?.companyTimeZone;

    return [
      {
        value: FOLLOW_COMPANY,
        label: companyZone
          ? `Same as the company (UTC${offsetOf(companyZone).text})`
          : "Same as the company",
        keywords: companyZone ?? "",
      },
      // A short list of real zones written as offsets — see `lib/timeZones` for why the value stays
      // a zone. The person's own stored zone is kept even when it is not one of the offered ones.
      ...timeZoneChoices(timeZone).map((choice) => ({
        value: choice.zone,
        label: choice.label,
        keywords: choice.keywords,
        hint: choice.zone === browserZone ? "this device" : undefined,
      })),
    ];
  }, [data?.companyTimeZone, timeZone]);

  const save = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setSaving(true);
    const res = await updateUserSettingsAction({
      timeZone: timeZone ?? undefined,
      clearTimeZone: timeZone === null,
      dateFormat,
    });
    setSaving(false);

    if (res.status !== ActionStatus.SUCCESS) {
      showActionError(res);
      return;
    }
    // Applied at once rather than on the next full load: the person is looking at dates right now.
    setDisplayPreferences({ timeZone, dateFormat });
    await queryClient.invalidateQueries({ queryKey: USER_SETTINGS_QK });
    onSavedAction?.();
  };

  const today = new Date();

  return (
    <form id={formId} onSubmit={save} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <RequiredLabel htmlFor="settings-timezone">Time Zone</RequiredLabel>
        {/*
          Searchable, not a plain Select: there are four hundred zones, and a reader who knows they
          are in Warsaw should type it rather than scroll past Africa.
        */}
        <SearchableSelect
          id="settings-timezone"
          options={zoneOptions}
          value={timeZone ?? FOLLOW_COMPANY}
          onChange={(v) => setTimeZone(v === FOLLOW_COMPANY || v === null ? null : v)}
          clearable={false}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          When something happened is shown in this zone. Dates in the calendar sense — a hire date, a
          day of leave — are the same day for everybody and do not move.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <RequiredLabel htmlFor="settings-date-format">Date Format</RequiredLabel>
        <Select
          value={dateFormat}
          onValueChange={(v) => setDateFormat(v as DisplayDateFormat)}
          disabled={isLoading}
        >
          <SelectTrigger id="settings-date-format" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SYSTEM">Same as this device</SelectItem>
            <SelectItem value="DMY">{sample(today, "DMY")} — day first</SelectItem>
            <SelectItem value="MDY">{sample(today, "MDY")} — month first</SelectItem>
            <SelectItem value="YMD">{sample(today, "YMD")} — year first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!hideSubmit && (
        <div className="flex justify-end">
          <Button type="submit" disabled={saving || isLoading}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      )}
    </form>
  );
};

/** What today looks like in each format, so the choice is read rather than decoded. */
const sample = (date: Date, format: Exclude<DisplayDateFormat, "SYSTEM">): string => {
  const parts = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    .formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const [d, m, y] = [value("day"), value("month"), value("year")];

  if (format === "DMY") return `${d}.${m}.${y}`;
  if (format === "MDY") return `${m}/${d}/${y}`;
  return `${y}-${m}-${d}`;
};
