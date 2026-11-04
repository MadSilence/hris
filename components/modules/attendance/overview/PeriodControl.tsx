"use client";

import React from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { DateRangePicker } from "@/components/ui/DatePicker";
import { formatMonthLabel, shiftMonth } from "@/components/modules/attendance/lib";

const MAX_DAYS = 366;

type Props = {
  month: string;
  range: { start: string; end: string } | null;
  onMonthChange: (month: string) => void;
  onRangeChange: (range: { start: string; end: string } | null) => void;
};

/**
 * The window Attendance is read over: a month with its arrows, or a range picked from a calendar —
 * the 25th to the 24th for a company whose pay period runs that way (`NEED_TO_DISCUSS.md` § 26,
 * answered with a range rather than a pay period). While a range is on, the arrows step aside; the
 * range's clear button is the way back to months.
 */
export const PeriodControl: React.FC<Props> = ({ month, range, onMonthChange, onRangeChange }) => (
  <div className="flex items-center gap-2">
    {!range && (
      <>
        <Button type="button" variant="secondary" size="icon" aria-label="Previous month"
                onClick={() => onMonthChange(shiftMonth(month, -1))}>
          <Icon icon={ArrowLeft01Icon} size="sm" />
        </Button>
        <span className="min-w-36 text-center text-body font-medium" aria-live="polite">{formatMonthLabel(month)}</span>
        <Button type="button" variant="secondary" size="icon" aria-label="Next month"
                onClick={() => onMonthChange(shiftMonth(month, 1))}>
          <Icon icon={ArrowRight01Icon} size="sm" />
        </Button>
      </>
    )}
    <DateRangePicker
      value={range}
      onChange={onRangeChange}
      placeholder="Custom range"
      maxDays={MAX_DAYS}
      ariaLabel="Custom range"
      className={range ? "w-72" : "w-40"}
    />
  </div>
);
