"use client";

import type { FC } from "react";

import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { CountryFlag } from "@/components/ui/CountryFlag";
import {
  PublicHolidayCalendarWeekendSubstitution
} from "@/api/modules/publicHolidays/calendars/dto";

/** Wording aimed at an admin, not at the enum. */
const SUBSTITUTION_LABELS: Record<PublicHolidayCalendarWeekendSubstitution, string> = {
  [PublicHolidayCalendarWeekendSubstitution.None]: "No substitution — the day is lost",
  [PublicHolidayCalendarWeekendSubstitution.NextWorkingDay]: "Move to the next working day",
  [PublicHolidayCalendarWeekendSubstitution.PreviousWorkingDay]: "Move to the previous working day",
  [PublicHolidayCalendarWeekendSubstitution.NearestWorkingDay]: "Move to the nearest working day",
  [PublicHolidayCalendarWeekendSubstitution.ManualCompensation]: "Owe a day, choose the date by hand",
};

type Props = {
  idPrefix: string;
  name: string;
  onNameChange: (value: string) => void;
  nameError?: string;
  /** ISO 3166-1 alpha-2, or "" — also what the flag beside the name is drawn from. */
  countryCode: string;
  onCountryChange: (value: string) => void;
  /** ISO 3166-2 subdivision, e.g. DE-BY. Empty for a national calendar. */
  regionCode: string;
  onRegionChange: (value: string) => void;
  /** Shown as the flag's tooltip when the country is known by name (e.g. from a template). */
  countryName?: string;
  /** Omit on create: the rule only has days to act on once the calendar exists. */
  weekendSubstitution?: PublicHolidayCalendarWeekendSubstitution;
  onWeekendSubstitutionChange?: (value: PublicHolidayCalendarWeekendSubstitution) => void;
  disabled?: boolean;
};

/**
 * The identity of a holiday calendar — the place it describes.
 *
 * No year here on purpose: a calendar spans years now, and the year selector belongs next to the day
 * list it scopes. Shared so that creating a calendar and editing one are the same form.
 */
export const PublicHolidayCalendarFields: FC<Props> = ({
  idPrefix,
  name,
  onNameChange,
  nameError,
  countryCode,
  onCountryChange,
  regionCode,
  onRegionChange,
  countryName,
  weekendSubstitution,
  onWeekendSubstitutionChange,
  disabled = false,
}) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-name`}>Name</Label>
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-brown-200 bg-brown-50">
          <CountryFlag countryCode={countryCode} title={countryName} />
        </span>
        <Input
          id={`${idPrefix}-name`}
          value={name}
          onChange={(e) => onNameChange(e.currentTarget.value)}
          placeholder="e.g., Poland"
          disabled={disabled}
          aria-invalid={!!nameError}
        />
      </div>
      {nameError && <p className="text-sm text-destructive">{nameError}</p>}
    </div>

    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-country`}>Country</Label>
      <Input
        id={`${idPrefix}-country`}
        value={countryCode}
        // Uppercased on the way in: the field feeds both the stored code and the flag lookup.
        onChange={(e) => onCountryChange(e.currentTarget.value.toUpperCase())}
        placeholder="e.g. DE"
        maxLength={2}
        disabled={disabled}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-region`}>Region</Label>
      <Input
        id={`${idPrefix}-region`}
        value={regionCode}
        onChange={(e) => onRegionChange(e.currentTarget.value.toUpperCase())}
        placeholder="Optional, e.g. DE-BY"
        disabled={disabled}
      />
    </div>

    {weekendSubstitution !== undefined && onWeekendSubstitutionChange ? (
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-substitution`}>Holiday on a non-working day</Label>
        <Select
          value={weekendSubstitution}
          onValueChange={(next) =>
            onWeekendSubstitutionChange(next as PublicHolidayCalendarWeekendSubstitution)
          }
          disabled={disabled}
        >
          <SelectTrigger id={`${idPrefix}-substitution`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(PublicHolidayCalendarWeekendSubstitution).map((value) => (
              <SelectItem key={value} value={value}>
                {SUBSTITUTION_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ) : null}
  </div>
);
