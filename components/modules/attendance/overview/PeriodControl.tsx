"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
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
        <Button type="button" variant="outline" size="icon" aria-label="Previous Month"
                onClick={() => onMonthChange(shiftMonth(month, -1))}>
          <ChevronLeft className="h-4 w-4"/>
        </Button>
        <span className="min-w-36 text-center text-sm font-medium" aria-live="polite">{formatMonthLabel(month)}</span>
        <Button type="button" variant="outline" size="icon" aria-label="Next Month"
                onClick={() => onMonthChange(shiftMonth(month, 1))}>
          <ChevronRight className="h-4 w-4"/>
        </Button>
      </>
    )}
    <DateRangePicker
      value={range}
      onChange={onRangeChange}
      placeholder="Custom Range"
      maxDays={MAX_DAYS}
      ariaLabel="Custom range"
      className={range ? "w-72" : "w-40"}
    />
  </div>
);
