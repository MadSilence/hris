"use client";

import * as React from "react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import type { SetupCountryDTO } from "@/api/modules/firstRun/dto";

/**
 * One country out of two hundred and forty.
 *
 * <p>The list is searched by name and by code, because somebody typing "UK" and somebody typing
 * "United Kingdom" are the same person in a hurry.
 */
export const CountryPicker: React.FC<{
  countries: SetupCountryDTO[];
  value: string | null;
  onChange: (code: string | null) => void;
  id?: string;
  disabled?: boolean;
}> = ({ countries, value, onChange, id, disabled }) => {
  const options = React.useMemo(
    () =>
      countries.map((country) => ({
        value: country.code,
        label: country.name,
        keywords: country.code,
        icon: <CountryFlag countryCode={country.code} />,
      })),
    [countries],
  );

  return (
    <SearchableSelect
      id={id}
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select a country"
      emptyLabel="No country matches that."
      disabled={disabled}
    />
  );
};
