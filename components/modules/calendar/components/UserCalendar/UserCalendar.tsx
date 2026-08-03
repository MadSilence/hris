"use client";

import { FC, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";

export type CalendarHolidayEvent = {
  id: string;
  name: string;
  date: string;
  calendarName?: string | null;
};

export type CalendarTimeOffEvent = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  tone: "approved" | "pending";
};

type Props = {
  holidays: CalendarHolidayEvent[];
  timeOff: CalendarTimeOffEvent[];
  isLoading?: boolean;
  variant?: "full" | "compact";
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const weekdayOffset = (jsDay: number) => (jsDay + 6) % 7;

const timeOffToneClass: Record<CalendarTimeOffEvent["tone"], string> = {
  approved: "border-green-200 bg-green-100 text-green-800",
  pending: "border-amber-200 bg-amber-100 text-amber-800",
};

export const UserCalendar: FC<Props> = ({ holidays, timeOff, isLoading = false, variant = "full" }) => {
  const compact = variant === "compact";
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const holidaysByDay = useMemo(() => {
    const map = new Map<string, CalendarHolidayEvent[]>();
    for (const h of holidays) {
      const list = map.get(h.date) ?? [];
      list.push(h);
      map.set(h.date, list);
    }
    return map;
  }, [holidays]);

  const cells = useMemo(() => {
    const { year, month } = cursor;
    const firstOffset = weekdayOffset(new Date(year, month, 1).getDay());
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: 42 }).map((_, i) => {
      const dayNum = i - firstOffset + 1;
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      const date = new Date(year, month, dayNum);
      const iso = toISO(date.getFullYear(), date.getMonth(), date.getDate());
      const jsDay = date.getDay();
      const isWeekend = jsDay === 0 || jsDay === 6;
      const isToday = iso === toISO(today.getFullYear(), today.getMonth(), today.getDate());

      const dayHolidays = holidaysByDay.get(iso) ?? [];
      const dayTimeOff = timeOff.filter((t) => t.startDate <= iso && iso <= t.endDate);

      return { iso, dayNumber: date.getDate(), inMonth, isWeekend, isToday, dayHolidays, dayTimeOff };
    });
  }, [cursor, holidaysByDay, timeOff, today]);

  const goPrev = () =>
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 }));
  const goNext = () =>
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 }));
  const goToday = () => setCursor({ year: today.getFullYear(), month: today.getMonth() });

  const cellMinH = compact ? "min-h-[64px]" : "min-h-[96px]";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Toolbar */}
      <div className="flex flex-none items-center justify-between gap-4 pb-4">
        <h2 className={compact ? "text-base font-semibold text-foreground" : "text-lg font-semibold text-foreground"}>
          {MONTHS[cursor.month]} {cursor.year}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Previous month" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Next month" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="overflow-hidden rounded-lg border border-brown-200">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-brown-200 bg-brown-50">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-xs font-medium text-brown-600">
                {d}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-7">
              {Array.from({ length: 42 }).map((_, i) => (
                <div key={`cal-skel-${i}`} className={`${cellMinH} border-b border-r border-brown-100 p-2`}>
                  <Skeleton className="h-4 w-5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {cells.map((cell) => (
                <div
                  key={cell.iso}
                  className={[
                    cellMinH,
                    "border-b border-r border-brown-100 p-1.5",
                    cell.inMonth ? "" : "bg-brown-50/40",
                    cell.isWeekend && cell.inMonth ? "bg-brown-50/60" : "",
                  ].join(" ")}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={[
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                        cell.inMonth ? "text-foreground" : "text-brown-300",
                        cell.isToday ? "bg-brown-700 font-semibold text-white" : "",
                      ].join(" ")}
                    >
                      {cell.dayNumber}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {cell.dayHolidays.map((h) => (
                      <div
                        key={h.id}
                        title={h.calendarName ? `${h.name} · ${h.calendarName}` : h.name}
                        className="truncate rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[11px] leading-tight text-rose-700"
                      >
                        {h.name}
                      </div>
                    ))}
                    {cell.dayTimeOff.map((t) => (
                      <div
                        key={t.id}
                        title={t.label}
                        className={`truncate rounded border px-1.5 py-0.5 text-[11px] leading-tight ${timeOffToneClass[t.tone]}`}
                      >
                        {t.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {!compact && (
        <div className="flex flex-none flex-wrap items-center gap-4 pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border border-rose-200 bg-rose-100" />
            Public holiday
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border border-green-200 bg-green-100" />
            Time off — approved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border border-amber-200 bg-amber-100" />
            Time off — pending
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {holidays.length} holidays · {timeOff.length} time-off entries
          </span>
        </div>
      )}
    </div>
  );
};
