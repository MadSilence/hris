"use client";

import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowExpand01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ForbiddenError } from "@/components/clients/exceptions";
import { useDebouncedValue } from "@/components/modules/organization/modules/profile/hooks/useDebouncedValue";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
import { useUser } from "@/components/hooks/useUser/useUser";
import {
  COMPANY_CALENDAR_ABSENCES_QUERY_KEY,
  useCompanyCalendarAbsences,
  useCompanyCalendarGroups,
  useCompanyCalendarViewCounts,
  useCompanyCalendarMarks,
  useCompanyCalendarPeople,
} from "@/components/modules/calendar/hooks/useCompanyCalendar";
import { useCalendarViewMutations, useCalendarViews } from "@/components/modules/calendar/hooks/useCalendarViews";
import { CompanyCalendarBoard } from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarBoard";
import type { LeaveDecisions } from "@/components/modules/calendar/components/CompanyCalendarBoard/boardContext";
import { displayName } from "@/components/modules/calendar/components/CompanyCalendarBoard/boardContext";
import { CompanyCalendarGroupedRows } from "@/components/modules/calendar/components/CompanyCalendarGroupedRows/CompanyCalendarGroupedRows";
import {
  CompanyCalendarToolbar,
  usePersonField,
} from "@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarToolbar";
import { CompanyCalendarViewsRow, type ViewPill } from "@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarViewsRow";
import { CompanyCalendarShare } from "@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarShare";
import { CompanyCalendarExport } from "@/components/modules/calendar/components/CompanyCalendarToolbar/CompanyCalendarExport";
import {
  BoardRequestTimeOff,
  type BoardRequest,
} from "@/components/modules/calendar/components/CompanyCalendarBoardContainer/BoardRequestTimeOff";
import { DeclineLeaveDialog, type DeclineTarget } from "@/components/modules/timeOff";
import { REQUEST_PARAM } from "@/components/modules/timeOff/lib/requestLink";
import { useLeaveRequestHref } from "@/components/modules/timeOff/lib/useLeaveRequestHref";
import { useInvalidateLeaveAnswer } from "@/components/modules/timeOff/lib/useInvalidateLeaveAnswer";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { showError } from "@/lib/errors/errorToast";
import { holdWithUndo } from "@/lib/feedback/holdWithUndo";
import { isoToDate, useWeekStartsOn } from "@/lib/date";
import type { CalendarView } from "@/models/calendarView";
import type { CompanyCalendarAbsence, CompanyCalendarGrouping, CompanyCalendarUser } from "@/models/calendar";
import type { FilterDTO } from "@/models/user/fields";
import { availableGroupings, parseCalendarGrouping } from "@/components/modules/calendar/lib/grouping";
import { addDays, nonWorkingDayTest, toISO } from "@/components/modules/calendar/lib/dateRange";
import {
  extendRange,
  initialRange,
  landingDay,
  rangeEnd,
  rangeISO,
  type BoardScale,
} from "@/components/modules/calendar/lib/boardGeometry";
import { BUILT_IN_VIEWS, calendarUrlQuery, parseCalendarUrl } from "@/components/modules/calendar/lib/calendarUrlState";

const NO_COLLAPSED: ReadonlySet<string> = new Set();
/** The export's window is a quarter at most (`COMPANY_CALENDAR.md` § 10). */
const EXPORT_MAX_DAYS = 93;

/** "My team" (N01): the reader's own teams — not stored, so it follows them when they move. */
const teamFilter = (teamIds: string[]): FilterDTO[] => [{ field: "sys:team", op: "has_any", values: teamIds }];

/**
 * The company calendar (`hris/design/screens/company-calendar`, N01–N25): the header with Share and Export, the views
 * row, the toolbar and the board — and the state between them, which is also the page's address (F0.2): a link opens
 * the same view, filters, grouping, scale and days, within the receiver's own access.
 */
export const CompanyCalendarBoardContainer: FC = () => {
  const t = useTranslations("calendar");
  const searchParams = useSearchParams();
  // The address is read once, on load; from then on the board writes it.
  const [initial] = useState(() => parseCalendarUrl(searchParams ?? new URLSearchParams()));
  const weekStartsOn = useWeekStartsOn();
  const todayISO = toISO(new Date());
  const queryClient = useQueryClient();

  const [scale, setScale] = useState<BoardScale>(initial.scale);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterDTO[]>(initial.filters);
  const [grouping, setGrouping] = useState<CompanyCalendarGrouping | null>(initial.grouping);
  const [person, setPerson] = useState<string | null>(initial.person);
  const [activeView, setActiveView] = useState<string | null>(
    initial.view ?? (initial.filters.length > 0 || initial.person ? null : BUILT_IN_VIEWS.everyone),
  );
  // Which groups are folded. Not saved with a view and reset whenever the grouping changes.
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(NO_COLLAPSED);

  // ── The days: a run that grows at either end as the reader scrolls (the owner's R5) ──
  const [range, setRange] = useState(() =>
    initialRange(initial.from ? isoToDate(initial.from) : new Date(), weekStartsOn),
  );
  const [target, setTarget] = useState(() => ({
    iso: initial.from ?? toISO(landingDay(new Date(), weekStartsOn)),
    nonce: 0,
  }));
  const [visible, setVisible] = useState({ first: target.iso, last: target.iso });
  const { from, to } = rangeISO(range);

  const extend = useCallback((direction: "forward" | "back", days: number) => {
    setRange((r) => extendRange(r, direction, days));
  }, []);
  const goToday = () => {
    const landing = landingDay(new Date(), weekStartsOn);
    if (landing < range.start || landing > rangeEnd(range)) setRange(initialRange(new Date(), weekStartsOn));
    setTarget((t0) => ({ iso: toISO(landing), nonce: t0.nonce + 1 }));
  };
  const changeScale = (next: BoardScale) => {
    setScale(next);
    // The first day on screen stays first: a week from where the month was.
    setTarget((t0) => ({ iso: visible.first, nonce: t0.nonce + 1 }));
  };
  const onVisibleChange = useCallback((first: string, last: string) => {
    setVisible((v) => (v.first === first && v.last === last ? v : { first, last }));
  }, []);

  const debounced = useDebouncedValue(query.trim(), 300);
  const q = debounced.length >= 2 ? debounced : "";

  // Shading follows the company's configured week, not a hardcoded Saturday/Sunday.
  const { company } = useCompanyData();
  const isNonWorkingDay = useMemo(() => nonWorkingDayTest(company?.workingDays), [company?.workingDays]);

  const { data: fields } = useUserFields();
  const groupingOptions = useMemo(() => availableGroupings(fields), [fields]);
  const { data: views } = useCalendarViews();
  const viewMutations = useCalendarViewMutations();
  const { userId: me, user: meUser } = useCurrentUser();
  const myTeamIds = useMemo(() => (meUser?.teams ?? []).map((team) => team.id), [meUser?.teams]);

  // ── One person (N21): the board shows that person alone, read from their own record ──
  const onePerson = person !== null;
  const { data: personRecord, error: personError } = useUser(person ?? "");
  const personUsers = useMemo<CompanyCalendarUser[]>(
    () =>
      person && personRecord
        ? [{ id: person, firstName: personRecord.firstName, lastName: personRecord.lastName, email: personRecord.email ?? "", avatarUrl: personRecord.avatarUrl }]
        : [],
    [person, personRecord],
  );
  const effectiveGrouping = onePerson ? null : grouping;

  // Two queries, deliberately: the roster is keyed on the search and the filters alone, so loading more days keeps
  // every page already scrolled; the marks and the leave are keyed on the days and the rows.
  const {
    data: peoplePages,
    isLoading: peopleLoading,
    isError: peopleFailed,
    error: peopleError,
    refetch: refetchPeople,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCompanyCalendarPeople({ q, filters, enabled: effectiveGrouping === null && !onePerson });

  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsFailed,
    error: groupsError,
    refetch: refetchGroups,
  } = useCompanyCalendarGroups({ q, filters, groupBy: effectiveGrouping });

  const users = useMemo(
    () => (onePerson ? personUsers : (peoplePages?.pages ?? []).flatMap((p) => p.users)),
    [onePerson, personUsers, peoplePages],
  );
  const userIds = useMemo(() => users.map((u) => u.id), [users]);
  const flatIds = effectiveGrouping === null ? userIds : [];

  const { data: marks, isError: marksFailed, error: marksError, refetch: refetchMarks } = useCompanyCalendarMarks({
    from,
    to,
    userIds: flatIds,
  });
  const {
    data: absences,
    isError: absencesFailed,
    error: absencesError,
    refetch: refetchAbsences,
  } = useCompanyCalendarAbsences({ from, to, userIds: flatIds });

  // ── Requesting from the board (C7): one's own row; any row for a reader who may file leave for others ──
  const mayFileForOthers = useCanAccess("PEOPLE.TIME_OFF_POLICIES", "EDIT");
  const [boardRequest, setBoardRequest] = useState<BoardRequest | null>(null);
  const requestFor = useCallback(
    (u: CompanyCalendarUser) =>
      u.id === me || mayFileForOthers
        ? (start: string, end: string) => setBoardRequest({ userId: u.id, name: displayName(u), start, end })
        : undefined,
    [me, mayFileForOthers],
  );

  // ── Deciding from the card (N05; the owner reversed C7 on 2026-11-20) ──
  const [declining, setDeclining] = useState<DeclineTarget | null>(null);
  const router = useRouter();
  const leaveHref = useLeaveRequestHref();
  // Approve is held on the server with Undo (DECISIONS.md § "Undo and the Admin role"); while held, the board reads the
  // card as answered for its reader (`awaitingYou` false), so re-reading it is all the page does.
  const invalidateLeave = useInvalidateLeaveAnswer();
  const refreshLeave = useCallback(
    () => void queryClient.invalidateQueries({ queryKey: [COMPANY_CALENDAR_ABSENCES_QUERY_KEY] }),
    [queryClient],
  );
  const decisions = useMemo<LeaveDecisions>(
    () => ({
      canDecide: (a: CompanyCalendarAbsence) => Boolean(a.awaitingYou && a.status === "PENDING" && a.requestId),
      approve: (a: CompanyCalendarAbsence) => {
        if (!a.requestId) return;
        void holdWithUndo({
          kind: "TIME_OFF_APPROVE",
          targetId: a.requestId,
          message: t("card.approvedToast"),
          invalidate: invalidateLeave,
        });
      },
      // Decline is its own small window with an optional comment (AQ-13).
      decline: (a: CompanyCalendarAbsence, name?: string) =>
        a.requestId &&
        setDeclining({
          requestId: a.requestId,
          startDate: a.requestStartDate ?? a.startDate,
          endDate: a.requestEndDate ?? a.endDate,
          policyName: a.policyName ?? a.leaveTypeName ?? null,
          policyColor: a.policyColor ?? null,
          firstName: name?.split(" ")[0] ?? null,
        }),
      openFull: (a: CompanyCalendarAbsence) =>
        a.requestId ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-mr-1.5 size-7 text-tertiary"
            aria-label={t("card.openFull")}
            // The request in full over the board (AQ-12 b): `?leaveRequest=` on this page, which the app shell opens.
            onClick={() => router.push(leaveHref(a.requestId!), { scroll: false })}
          >
            <Icon icon={ArrowExpand01Icon} size="sm" />
          </Button>
        ) : null,
    }),
    [invalidateLeave, t, router, leaveHref],
  );

  // ── Views: "Everyone" and "My team" are built in; the reader's own are stored, in their order ──
  const builtIns = useMemo<ViewPill[]>(
    () => [
      { id: BUILT_IN_VIEWS.everyone, name: t("views.everyone") },
      ...(myTeamIds.length > 0 ? [{ id: BUILT_IN_VIEWS.myTeam, name: t("views.myTeam") }] : []),
    ],
    [t, myTeamIds.length],
  );
  const savedViews = useMemo(() => views ?? [], [views]);
  // The count beside each view (B5): the people its filters show, within the reader's own scope.
  const viewFilters = useMemo(
    () => [
      { id: BUILT_IN_VIEWS.everyone, filters: [] as FilterDTO[] },
      ...(myTeamIds.length > 0 ? [{ id: BUILT_IN_VIEWS.myTeam, filters: teamFilter(myTeamIds) }] : []),
      ...savedViews.map((v) => ({ id: v.id, filters: v.payload?.filters ?? [] })),
    ],
    [myTeamIds, savedViews],
  );
  const viewCounts = useCompanyCalendarViewCounts(viewFilters);

  const changeGrouping = useCallback((next: CompanyCalendarGrouping | null) => {
    setGrouping(next);
    setCollapsed(NO_COLLAPSED);
  }, []);

  // A view reopens in the shape it was saved in; a view saved before grouping existed carries no key: flat.
  const applyView = useCallback(
    (id: string) => {
      setPerson(null);
      setActiveView(id);
      if (id === BUILT_IN_VIEWS.everyone) {
        setFilters([]);
        return;
      }
      if (id === BUILT_IN_VIEWS.myTeam) {
        setFilters(teamFilter(myTeamIds));
        return;
      }
      const view = savedViews.find((v) => v.id === id);
      if (!view) return;
      setFilters(view.payload?.filters ?? []);
      if (view.payload?.density && view.payload.density !== scale) changeScale(view.payload.density);
      changeGrouping(parseCalendarGrouping(view.payload?.grouping));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedViews, myTeamIds, scale, changeGrouping],
  );

  // A link that names a view: "My team" once the reader's teams are known; one of their own once the views are.
  const appliedFromLink = useRef(false);
  useEffect(() => {
    if (appliedFromLink.current || !initial.view || initial.filters.length > 0) return;
    if (initial.view === BUILT_IN_VIEWS.myTeam && myTeamIds.length > 0) {
      appliedFromLink.current = true;
      setFilters(teamFilter(myTeamIds));
    } else if (views && views.some((v) => v.id === initial.view)) {
      appliedFromLink.current = true;
      applyView(initial.view);
    }
  }, [initial, myTeamIds, views, applyView]);

  const saveView = (name: string) =>
    viewMutations.create.mutate(
      { name, payload: { filters, density: scale, grouping } },
      { onSuccess: (created) => setActiveView(created.id), onError: showError },
    );
  const renameView = (view: CalendarView, name: string) =>
    viewMutations.update.mutate({ id: view.id, name, payload: view.payload }, { onError: showError });
  const deleteView = (view: CalendarView) =>
    viewMutations.remove.mutate(view.id, {
      onSuccess: () => {
        if (view.id === activeView) applyView(BUILT_IN_VIEWS.everyone);
      },
      onError: showError,
    });
  const reorderViews = (ids: string[]) => viewMutations.reorder.mutate(ids, { onError: showError });

  // Editing the filters by hand detaches from the view whose filters they were.
  const changeFilters = useCallback((next: FilterDTO[]) => {
    setFilters(next);
    setActiveView(next.length === 0 ? BUILT_IN_VIEWS.everyone : null);
  }, []);
  const clearPerson = () => {
    setPerson(null);
    if (filters.length === 0) setActiveView(BUILT_IN_VIEWS.everyone);
  };

  const toggleGroup = useCallback((key: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // ── The address follows the board (F0.2): a link to what is on screen ──
  const urlState = useMemo(
    () => ({
      view: activeView,
      filters,
      grouping: effectiveGrouping,
      scale,
      from: visible.first,
      person,
    }),
    [activeView, filters, effectiveGrouping, scale, visible.first, person],
  );
  useEffect(() => {
    const id = window.setTimeout(() => {
      // A request open over the board (`?leaveRequest=`) stays in the address while the board rewrites the rest.
      const open = new URLSearchParams(window.location.search).get(REQUEST_PARAM);
      const query = calendarUrlQuery(urlState);
      const next = `${window.location.pathname}${query}${
        open ? `${query ? "&" : "?"}${REQUEST_PARAM}=${encodeURIComponent(open)}` : ""
      }`;
      if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(window.history.state, "", next);
    }, 300);
    return () => window.clearTimeout(id);
  }, [urlState]);

  // ── What the board says when it has no rows ──
  const failed = onePerson
    ? Boolean(personError) || marksFailed || absencesFailed
    : effectiveGrouping === null
      ? peopleFailed || marksFailed || absencesFailed
      : groupsFailed;
  const failure = onePerson
    ? personError ?? (marksFailed ? marksError : absencesError)
    : effectiveGrouping === null
      ? peopleFailed
        ? peopleError
        : marksFailed
          ? marksError
          : absencesError
      : groupsError;
  const retry = () =>
    void (effectiveGrouping !== null
      ? refetchGroups()
      : peopleFailed
        ? refetchPeople()
        : marksFailed
          ? refetchMarks()
          : refetchAbsences());
  const loading = onePerson ? !personRecord && !personError : effectiveGrouping === null ? peopleLoading : groupsLoading;
  const empty =
    !loading && (effectiveGrouping === null ? users.length === 0 : (groups?.length ?? 0) === 0);

  const overlay = failed ? (
    failure instanceof ForbiddenError ? (
      <EmptyState fill scene="policies" title={t("states.noAccessTitle")} description={t("states.noAccessHint")} />
    ) : (
      <EmptyState
        fill
        scene="something-broke"
        title={t("states.errorTitle")}
        description={t("states.errorHint")}
        action={
          <Button type="button" variant="secondary" onClick={retry}>
            {t("states.tryAgain")}
          </Button>
        }
      />
    )
  ) : empty ? (
    q ? (
      <EmptyState fill scene="no-results" title={t("states.noResultsTitle")} description={t("states.noResultsHint")} />
    ) : filters.length > 0 ? (
      <EmptyState
        fill
        scene="no-match"
        title={t("states.noMatchTitle")}
        description={t("states.noMatchHint")}
        action={
          <Button type="button" variant="secondary" onClick={() => changeFilters([])}>
            {t("states.clearAll")}
          </Button>
        }
      />
    ) : (
      <EmptyState fill scene="no-results" title={t("states.noResultsTitle")} description="" />
    )
  ) : undefined;

  const personField = usePersonField();
  const activeName =
    activeView === null ? null : [...builtIns, ...savedViews].find((v) => v.id === activeView)?.name ?? null;
  const exportTo = (() => {
    const last = addDays(isoToDate(visible.first), EXPORT_MAX_DAYS - 1);
    return visible.last < toISO(last) ? visible.last : toISO(last);
  })();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="flex flex-none items-start gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-page-title">{t("page.title")}</h1>
          <p className="text-body text-secondary">{t("page.description")}</p>
        </div>
        <span className="flex-1" />
        <CompanyCalendarShare
          href={() => `${window.location.pathname}${calendarUrlQuery(urlState)}`}
          viewName={activeName}
          fields={fields}
          filters={filters}
          personField={personField}
          person={person}
          scale={scale}
          from={visible.first}
        />
        <CompanyCalendarExport from={visible.first} to={exportTo} q={q} filters={filters} />
      </section>

      <div className="flex-none pt-4">
        <CompanyCalendarViewsRow
          builtIns={builtIns}
          views={savedViews}
          activeId={activeView}
          counts={viewCounts}
          onPick={applyView}
          onSave={saveView}
          onRename={renameView}
          onDelete={deleteView}
          onReorder={reorderViews}
          busy={viewMutations.create.isPending || viewMutations.remove.isPending || viewMutations.update.isPending}
        />
      </div>

      <div className="flex-none pt-5">
        <CompanyCalendarToolbar
          query={query}
          onQueryChange={setQuery}
          fields={fields}
          filters={filters}
          onFiltersChange={changeFilters}
          person={person}
          onClearPerson={clearPerson}
          grouping={effectiveGrouping}
          groupingOptions={onePerson ? [] : groupingOptions}
          onGroupingChange={changeGrouping}
          scale={scale}
          onScaleChange={changeScale}
          onToday={goToday}
        />
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <CompanyCalendarBoard
          range={range}
          scale={scale}
          todayISO={todayISO}
          isNonWorkingDay={isNonWorkingDay}
          onExtend={extend}
          scrollTarget={target}
          onVisibleChange={onVisibleChange}
          users={users}
          marks={marks ?? []}
          absences={absences ?? []}
          isLoading={loading}
          hasMore={!onePerson && hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
          requestFor={requestFor}
          decisions={decisions}
          overlay={overlay}
          scrollResetKey={effectiveGrouping ?? "flat"}
          {...(effectiveGrouping !== null
            ? {
                grouped: (
                  <CompanyCalendarGroupedRows
                    grouping={effectiveGrouping}
                    groups={groups}
                    isLoading={groupsLoading}
                    collapsed={collapsed}
                    onToggle={toggleGroup}
                    requestFor={requestFor}
                    q={q}
                    filters={filters}
                    from={from}
                    to={to}
                  />
                ),
              }
            : {})}
        />
      </div>

      {boardRequest ? <BoardRequestTimeOff request={boardRequest} onClose={() => setBoardRequest(null)} /> : null}
      <DeclineLeaveDialog target={declining} onClose={() => setDeclining(null)} onDeclined={refreshLeave} />
    </div>
  );
};

export default CompanyCalendarBoardContainer;
