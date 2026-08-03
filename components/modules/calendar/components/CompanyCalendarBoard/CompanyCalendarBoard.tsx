"use client";

import { FC, Fragment, useMemo } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Users } from "lucide-react";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import type { CompanyCalendarHoliday, CompanyCalendarUser } from "@/models/calendar";
import { WEEKDAY_SHORT, isWeekend, toISO } from "@/components/modules/calendar/lib/dateRange";

type Props = {
  days: Date[];
  users: CompanyCalendarUser[];
  holidays: CompanyCalendarHoliday[];
  todayISO: string;
  density: "month" | "week";
  animationKey: string;
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

const NAME_COL = 200;
const WEEKDAY_NARROW = ["S", "M", "T", "W", "T", "F", "S"];

export const CompanyCalendarBoard: FC<Props> = ({
  days,
  users,
  holidays,
  todayISO,
  density,
  animationKey,
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}) => {
  const holidaysByCell = useMemo(() => {
    const map = new Map<string, CompanyCalendarHoliday[]>();
    for (const h of holidays) {
      const key = `${h.userId}|${h.date}`;
      const list = map.get(key) ?? [];
      list.push(h);
      map.set(key, list);
    }
    return map;
  }, [holidays]);

  const gridTemplateColumns = `${NAME_COL}px repeat(${days.length}, minmax(0, 1fr))`;

  const showEmpty = !isLoading && users.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <style>{`@keyframes calFade{from{opacity:0}to{opacity:1}}`}</style>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          key={animationKey}
          className="grid w-full text-sm"
          style={{ gridTemplateColumns, animation: "calFade 220ms ease-out" }}
        >
          {/* Corner */}
          <div className="sticky left-0 top-0 z-30 flex items-center border-b border-r border-brown-200 bg-white px-3 py-2 text-xs font-medium text-brown-600">
            People
          </div>
          {/* Day headers */}
          {days.map((d) => {
            const iso = toISO(d);
            const today = iso === todayISO;
            const weekend = isWeekend(d);
            return (
              <div
                key={`h-${iso}`}
                className={[
                  "sticky top-0 z-20 border-b border-r border-brown-100 px-1 py-1.5 text-center",
                  today ? "bg-brown-100" : weekend ? "bg-brown-50" : "bg-white",
                ].join(" ")}
              >
                <div className={`text-[10px] uppercase ${today ? "text-brown-700" : "text-brown-400"}`}>
                  {density === "week" ? WEEKDAY_SHORT[d.getDay()] : WEEKDAY_NARROW[d.getDay()]}
                </div>
                <div className={`text-xs ${today ? "font-semibold text-brown-800" : "text-foreground"}`}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}

          {/* Rows */}
          {isLoading && users.length === 0
            ? Array.from({ length: 8 }).map((_, r) => (
                <Fragment key={`skel-${r}`}>
                  <div className="sticky left-0 z-10 border-b border-r border-brown-200 bg-white px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  {days.map((d) => (
                    <div key={`skel-${r}-${toISO(d)}`} className="border-b border-r border-brown-100" />
                  ))}
                </Fragment>
              ))
            : users.map((u) => {
                const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email;
                return (
                  <Fragment key={u.id}>
                    <div className="sticky left-0 z-10 border-b border-r border-brown-200 bg-white px-3 py-2">
                      <UserChip
                        id={u.id}
                        name={fullName}
                        avatarUrl={u.avatarUrl}
                        firstName={u.firstName}
                        lastName={u.lastName}
                        email={u.email}
                      />
                    </div>
                    {days.map((d) => {
                      const iso = toISO(d);
                      const today = iso === todayISO;
                      const weekend = isWeekend(d);
                      const dayHolidays = holidaysByCell.get(`${u.id}|${iso}`);
                      return (
                        <div
                          key={`${u.id}-${iso}`}
                          className={[
                            "relative min-h-[40px] border-b border-r border-brown-100 p-1",
                            today ? "bg-brown-50" : weekend ? "bg-brown-50/50" : "",
                          ].join(" ")}
                        >
                          {dayHolidays?.length ? (
                            <div
                              title={dayHolidays
                                .map((h) => (h.calendarName ? `${h.name} · ${h.calendarName}` : h.name))
                                .join("\n")}
                              className="flex h-full w-full items-center justify-center rounded bg-rose-100 text-[10px] leading-tight text-rose-700"
                            >
                              {density === "week" ? (
                                <span className="truncate px-1">{dayHolidays[0].name}</span>
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </Fragment>
                );
              })}
        </div>
      </div>

      {showEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brown-50 text-brown-400">
            <Users className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">No people to show</p>
          <p className="max-w-sm text-sm text-muted-foreground">Nobody matches the current view.</p>
        </div>
      ) : null}

      {hasMore ? (
        <div className="flex flex-none justify-center py-3">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? "Loading…" : "Load more people"}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
