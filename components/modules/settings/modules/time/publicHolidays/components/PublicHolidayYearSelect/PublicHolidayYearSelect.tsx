"use client";

import type { FC } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";

const CURRENT_YEAR = new Date().getFullYear();
/** How far either side of today the dropdown reaches when it has to offer every year. */
const YEAR_RANGE = 50;

const ALL_YEARS = Array.from(
  { length: YEAR_RANGE * 2 + 1 },
  (_, index) => CURRENT_YEAR - YEAR_RANGE + index,
);

type Props = {
  value: number;
  onChange: (year: number) => void;
  /**
   * Years the calendar already holds. When given, only those are offered — switching years is
   * navigation, not creation. Omit to offer the full ±50 range (creating or adding a year).
   */
  available?: number[];
  id?: string;
  disabled?: boolean;
  className?: string;
};

/** The year selector that scopes a calendar's day list. */
export const PublicHolidayYearSelect: FC<Props> = ({
  value,
  onChange,
  available,
  id,
  disabled = false,
  className,
}) => {
  // The current value always has to be selectable, even if it is outside the offered set.
  const options = available && available.length > 0
    ? Array.from(new Set([...available, value])).sort((a, b) => b - a)
    : ALL_YEARS;

  return (
    <Select
      value={String(value)}
      onValueChange={(next) => onChange(Number(next))}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={className ?? "h-9 w-[120px]"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
