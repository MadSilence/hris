"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { DateRangePicker } from "@/components/ui/DatePicker";
import { formatMonthLabel, shiftMonth } from "@/components/modules/attendance/lib";
import { useDisplayLocale } from "@/lib/date";

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
export const PeriodControl: React.FC<Props> = ({ month, range, onMonthChange, onRangeChange }) => {
  const t = useTranslations("attendance");
  const locale = useDisplayLocale();
  return (
  <div className="flex items-center gap-2">
    {!range && (
      <>
        <Button type="button" variant="secondary" size="icon" aria-label={t("period.previousMonth")}
                onClick={() => onMonthChange(shiftMonth(month, -1))}>
          <Icon icon={ArrowLeft01Icon} size="sm" />
        </Button>
        <span className="min-w-36 text-center text-body font-medium" aria-live="polite">{formatMonthLabel(month, locale)}</span>
        <Button type="button" variant="secondary" size="icon" aria-label={t("period.nextMonth")}
                onClick={() => onMonthChange(shiftMonth(month, 1))}>
          <Icon icon={ArrowRight01Icon} size="sm" />
        </Button>
      </>
    )}
    <DateRangePicker
      value={range}
      onChange={onRangeChange}
      placeholder={t("period.customRange")}
      maxDays={MAX_DAYS}
      ariaLabel={t("period.customRange")}
      className={range ? "w-72" : "w-40"}
    />
  </div>
  );
};
