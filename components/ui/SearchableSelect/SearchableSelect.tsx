"use client";

import * as React from "react";

import { Combobox, type ComboboxOption } from "@/components/ui/Combobox";

export type SearchableOption = ComboboxOption;

/**
 * A select for a list nobody can scan.
 *
 * <p>The rule of thumb this exists for: past a screenful, a `Select` is a scrollbar and a guess.
 * Two hundred and forty countries and four hundred time zones are both well past it, and the one
 * thing everybody knows about their own country or city is how it is spelled.
 *
 * <p>Deliberately not a replacement for `Select`. A list of four employment types is better as a
 * plain select — a search box in front of four options is furniture. Reach for this when the list is
 * long enough that the reader would otherwise scroll looking for something they can already name.
 *
 * <p>Since the designers' hub fixes A18 (2026-11-19) the field itself is the search — the shared {@link Combobox}.
 */
export const SearchableSelect: React.FC<{
  options: SearchableOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** Shown on the trigger while nothing is chosen. A select's one allowed placeholder. */
  placeholder?: string;
  /** Sentence for the empty result. */
  emptyLabel?: string;
  /** Clicking the chosen option again clears it. Off where the field must hold a value. */
  clearable?: boolean;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
}> = ({
  options,
  value,
  onChange,
  placeholder,
  emptyLabel,
  clearable = true,
  id,
  disabled,
  className,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}) => (
  <Combobox
    options={options}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    emptyLabel={emptyLabel}
    clearable={clearable}
    id={id}
    disabled={disabled}
    className={className}
    aria-label={ariaLabel}
    invalid={ariaInvalid}
  />
);
