"use client";

import { FC, useCallback, useMemo, useState } from "react";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
import {
  useCompanyCalendarMarks,
  useCompanyCalendarPeople,
} from "@/components/modules/calendar/hooks/useCompanyCalendar";
import {
  useCalendarViewMutations,
  useCalendarViews,
} from "@/components/modules/calendar/hooks/useCalendarViews";
import { CompanyCalendarBoard } from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarBoard";
import { CompanyCalendarToolbar } from "@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarToolbar";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import type { CalendarView } from "@/models/calendarView";
import type { FilterDTO } from "@/models/user/fields";
import {
  MONTH_NAMES,
  addDays,
  addMonths,
  eachDay,
  endOfMonth,
  endOfWeek,
  nonWorkingDayTest,
  startOfMonth,
  startOfWeek,
  toISO,
} from "@/components/modules/calendar/lib/dateRange";

type Density = "month" | "week";

export const CompanyCalendarBoardContainer: FC = () => {
  const [density, setDensity] = useState<Density>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterDTO[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  const { from, to } = useMemo(() => {
    if (density === "week") return { from: startOfWeek(anchor), to: endOfWeek(anchor) };
    return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
  }, [density, anchor]);

  const days = useMemo(() => eachDay(from, to), [from, to]);
  const todayISO = toISO(new Date());

  // Shading follows the company's configured week, not a hardcoded Saturday/Sunday. The setting was
  // introduced for this, and the backend's day counting has always used it.
  const { company } = useCompanyData();
  const isNonWorkingDay = useMemo(() => nonWorkingDayTest(company?.workingDays), [company?.workingDays]);

  const { data: fields } = useUserFields();
  const { data: views } = useCalendarViews();
  const viewMutations = useCalendarViewMutations();

  // Two queries, deliberately. The roster is keyed on the search and the filters alone, so moving
  // the window keeps every page already scrolled; the marks are keyed on the window and the rows.
  const {
    data: peoplePages,
    isLoading: peopleLoading,
    isError: peopleFailed,
    error: peopleError,
    refetch: refetchPeople,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCompanyCalendarPeople({ q, filters });

  const users = useMemo(() => (peoplePages?.pages ?? []).flatMap((p) => p.users), [peoplePages]);
  const userIds = useMemo(() => users.map((u) => u.id), [users]);

  const {
    data: marks,
    isError: marksFailed,
    error: marksError,
    refetch: refetchMarks,
  } = useCompanyCalendarMarks({ from: toISO(from), to: toISO(to), userIds });

  const goPrev = () => setAnchor((a) => (density === "week" ? addDays(a, -7) : addMonths(a, -1)));
  const goNext = () => setAnchor((a) => (density === "week" ? addDays(a, 7) : addMonths(a, 1)));
  const goToday = () => setAnchor(new Date());

  const applyView = useCallback((view: CalendarView | null) => {
    setActiveViewId(view?.id ?? null);
    setFilters(view?.payload?.filters ?? []);
    if (view?.payload?.density) setDensity(view.payload.density);
  }, []);

  const saveView = useCallback(
    (name: string) => {
      viewMutations.create.mutate(
        { name, payload: { filters, density, grouping: null } },
        { onSuccess: (created) => setActiveViewId(created.id) },
      );
    },
    [viewMutations.create, filters, density],
  );

  const deleteView = useCallback(
    (view: CalendarView) => {
      viewMutations.remove.mutate(view.id, {
        onSuccess: () => {
          if (view.id === activeViewId) applyView(null);
        },
      });
    },
    [viewMutations.remove, activeViewId, applyView],
  );

  // Editing the filters by hand detaches from the view whose filters they were.
  const changeFilters = useCallback((next: FilterDTO[]) => {
    setFilters(next);
    setActiveViewId(null);
  }, []);

  const periodLabel =
    density === "week"
      ? `${MONTH_NAMES[from.getMonth()].slice(0, 3)} ${from.getDate()} – ${MONTH_NAMES[to.getMonth()].slice(0, 3)} ${to.getDate()}, ${to.getFullYear()}`
      : `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`;

  const failed = peopleFailed || marksFailed;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <CompanyCalendarToolbar
        query={query}
        onQueryChange={setQuery}
        fields={fields}
        filters={filters}
        onFiltersChange={changeFilters}
        views={views ?? []}
        activeViewId={activeViewId}
        viewsBusy={viewMutations.create.isPending || viewMutations.remove.isPending}
        onApplyView={applyView}
        onSaveView={saveView}
        onDeleteView={deleteView}
        density={density}
        onDensityChange={setDensity}
        periodLabel={periodLabel}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
      />

      {/* A failed fetch is not an empty company. The board's empty state says "nobody matches the
          current view", which is a claim about the data rather than a report about the request — so
          the failure takes the board's place and the toolbar stays, which is how the reader retries,
          clears a filter, or moves to another period. */}
      {failed ? (
        <ErrorState
          error={peopleFailed ? peopleError : marksError}
          onRetry={() => void (peopleFailed ? refetchPeople() : refetchMarks())}
        />
      ) : (
        <CompanyCalendarBoard
          days={days}
          users={users}
          marks={marks ?? []}
          todayISO={todayISO}
          isNonWorkingDay={isNonWorkingDay}
          density={density}
          animationKey={`${density}|${toISO(from)}`}
          isLoading={peopleLoading}
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
        />
      )}
    </div>
  );
};

export default CompanyCalendarBoardContainer;
