"use client";

import { FC, useCallback, useMemo, useState } from "react";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
import {
  useCompanyCalendarGroups,
  useCompanyCalendarAbsences,
  useCompanyCalendarCapacity,
  useCompanyCalendarMarks,
  useCompanyCalendarPeople,
} from "@/components/modules/calendar/hooks/useCompanyCalendar";
import {
  useCalendarViewMutations,
  useCalendarViews,
} from "@/components/modules/calendar/hooks/useCalendarViews";
import { CompanyCalendarBoard } from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarBoard";
import { CompanyCalendarGroupedRows } from "@/components/modules/calendar/components/CompanyCalendarGroupedRows/CompanyCalendarGroupedRows";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useCanAccess } from "@/components/auth/useAccess";
import { PermissionGate } from "@/components/auth/PermissionGate";
import {
  BoardRequestTimeOff,
  type BoardRequest,
} from "@/components/modules/calendar/components/CompanyCalendarBoardContainer/BoardRequestTimeOff";
import { AwaitingApprovalLine } from "@/components/modules/calendar/components/CompanyCalendarBoardContainer/AwaitingApprovalLine";
import { CompanyCalendarExport } from "@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarExport";
import { boardGridTemplate } from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarRow";
import { CompanyCalendarToolbar } from "@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarToolbar";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import type { CalendarView } from "@/models/calendarView";
import type { CompanyCalendarGrouping, CompanyCalendarUser } from "@/models/calendar";
import { availableGroupings, parseCalendarGrouping } from "@/components/modules/calendar/lib/grouping";
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

const NO_COLLAPSED: ReadonlySet<string> = new Set();

type Density = "month" | "week";

export const CompanyCalendarBoardContainer: FC = () => {
  const [density, setDensity] = useState<Density>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterDTO[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [grouping, setGrouping] = useState<CompanyCalendarGrouping | null>(null);
  // Which groups are closed. Not saved with a view and reset whenever the grouping changes: a new
  // dimension has different groups, and "closed" is a moment's reading, not a lens.
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(NO_COLLAPSED);

  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  const { from, to } = useMemo(() => {
    if (density === "week") return { from: startOfWeek(anchor), to: endOfWeek(anchor) };
    return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
  }, [density, anchor]);

  const days = useMemo(() => eachDay(from, to), [from, to]);
  const dayISOs = useMemo(() => days.map(toISO), [days]);
  const todayISO = toISO(new Date());

  // Shading follows the company's configured week, not a hardcoded Saturday/Sunday. The setting was
  // introduced for this, and the backend's day counting has always used it.
  const { company } = useCompanyData();
  const isNonWorkingDay = useMemo(() => nonWorkingDayTest(company?.workingDays), [company?.workingDays]);

  const { data: fields } = useUserFields();
  const groupingOptions = useMemo(() => availableGroupings(fields), [fields]);
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
  } = useCompanyCalendarPeople({ q, filters, enabled: grouping === null });

  // A grouped board reads its headers here and each group's rows inside its own section. The flat
  // roster query above is switched off meanwhile, so the two shapes never both load.
  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsFailed,
    error: groupsError,
    refetch: refetchGroups,
  } = useCompanyCalendarGroups({ q, filters, groupBy: grouping });

  const users = useMemo(() => (peoplePages?.pages ?? []).flatMap((p) => p.users), [peoplePages]);
  const userIds = useMemo(() => users.map((u) => u.id), [users]);

  const {
    data: marks,
    isError: marksFailed,
    error: marksError,
    refetch: refetchMarks,
  } = useCompanyCalendarMarks({
    from: toISO(from),
    to: toISO(to),
    userIds: grouping === null ? userIds : [],
  });
  const {
    data: absences,
    isError: absencesFailed,
    error: absencesError,
    refetch: refetchAbsences,
  } = useCompanyCalendarAbsences({
    from: toISO(from),
    to: toISO(to),
    userIds: grouping === null ? userIds : [],
  });

  // The capacity mark is a hint, not part of the board: a failed read draws no dot rather than
  // replacing the board with an error, and the request form still decides.
  const groupIds = useMemo(
    () => (groups ?? []).map((g) => g.id).filter((id): id is string => id !== null),
    [groups],
  );
  const { data: capacity } = useCompanyCalendarCapacity({
    from: toISO(from),
    to: toISO(to),
    groupBy: grouping,
    groupIds,
  });

  // Acting from the board (sitting 2, C7): anyone on their own row; on someone else's, a reader who may
  // file leave for others. The server checks the person, row by row — this only decides what to offer.
  const { userId: me } = useCurrentUser();
  const mayFileForOthers = useCanAccess("PEOPLE.TIME_OFF_POLICIES", "EDIT");
  const [boardRequest, setBoardRequest] = useState<BoardRequest | null>(null);
  const requestFor = useCallback(
    (u: CompanyCalendarUser) =>
      u.id === me || mayFileForOthers
        ? (start: string, end: string) =>
            setBoardRequest({
              userId: u.id,
              name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
              start,
              end,
            })
        : undefined,
    [me, mayFileForOthers],
  );

  const goPrev = () => setAnchor((a) => (density === "week" ? addDays(a, -7) : addMonths(a, -1)));
  const goNext = () => setAnchor((a) => (density === "week" ? addDays(a, 7) : addMonths(a, 1)));
  const goToday = () => setAnchor(new Date());

  const changeGrouping = useCallback((next: CompanyCalendarGrouping | null) => {
    setGrouping(next);
    setCollapsed(NO_COLLAPSED);
  }, []);

  const toggleGroup = useCallback((key: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // A view reopens in the shape it was saved in — a grouped view that reopened flat would read as a
  // bug, and so would the reverse. A view saved before grouping existed carries no key: flat.
  // "All people" (null) clears the filters and leaves the grouping as it is, like the density.
  const applyView = useCallback(
    (view: CalendarView | null) => {
      setActiveViewId(view?.id ?? null);
      setFilters(view?.payload?.filters ?? []);
      if (view?.payload?.density) setDensity(view.payload.density);
      if (view) changeGrouping(parseCalendarGrouping(view.payload?.grouping));
    },
    [changeGrouping],
  );

  const saveView = useCallback(
    (name: string) => {
      viewMutations.create.mutate(
        { name, payload: { filters, density, grouping } },
        { onSuccess: (created) => setActiveViewId(created.id) },
      );
    },
    [viewMutations.create, filters, density, grouping],
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

  const failed = grouping === null ? peopleFailed || marksFailed || absencesFailed : groupsFailed;
  const failure =
    grouping === null ? (peopleFailed ? peopleError : marksFailed ? marksError : absencesError) : groupsError;
  const retry = () =>
    void (grouping !== null
      ? refetchGroups()
      : peopleFailed
        ? refetchPeople()
        : marksFailed
          ? refetchMarks()
          : refetchAbsences());

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 print:h-auto">
      <CompanyCalendarToolbar
        query={query}
        onQueryChange={setQuery}
        fields={fields}
        filters={filters}
        onFiltersChange={changeFilters}
        grouping={grouping}
        groupingOptions={groupingOptions}
        onGroupingChange={changeGrouping}
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
        actions={<CompanyCalendarExport from={toISO(from)} to={toISO(to)} q={q} filters={filters} />}
      />

      {/* A failed fetch is not an empty company. The board's empty state says "nobody matches the
          current view", which is a claim about the data rather than a report about the request — so
          the failure takes the board's place and the toolbar stays, which is how the reader retries,
          clears a filter, or moves to another period. */}
      <PermissionGate resource="PEOPLE.TIME_OFF" action="VIEW">
        <AwaitingApprovalLine />
      </PermissionGate>

      {failed ? (
        <ErrorState error={failure} onRetry={retry} />
      ) : (
        <CompanyCalendarBoard
          days={days}
          users={users}
          marks={marks ?? []}
          absences={absences ?? []}
          todayISO={todayISO}
          isNonWorkingDay={isNonWorkingDay}
          density={density}
          animationKey={`${density}|${toISO(from)}`}
          isLoading={peopleLoading}
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
          scrollResetKey={grouping ?? "flat"}
          requestFor={requestFor}
          capacity={grouping === null ? (capacity ?? []) : []}
          {...(grouping !== null
            ? {
                isEmpty: !groupsLoading && (groups?.length ?? 0) === 0,
                grouped: (
                  <CompanyCalendarGroupedRows
                    grouping={grouping}
                    groups={groups}
                    isLoading={groupsLoading}
                    collapsed={collapsed}
                    onToggle={toggleGroup}
                    capacity={capacity ?? []}
                    requestFor={requestFor}
                    q={q}
                    filters={filters}
                    from={toISO(from)}
                    to={toISO(to)}
                    geometry={{
                      days,
                      dayISOs,
                      todayISO,
                      isNonWorkingDay,
                      density,
                      gridTemplateColumns: boardGridTemplate(days.length),
                    }}
                  />
                ),
              }
            : {})}
        />
      )}

      {boardRequest ? <BoardRequestTimeOff request={boardRequest} onClose={() => setBoardRequest(null)} /> : null}
    </div>
  );
};

export default CompanyCalendarBoardContainer;
