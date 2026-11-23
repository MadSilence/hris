"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { ErrorState } from "@/components/feedback/ErrorState";
import {
  useCompanyCalendarAbsences,
  useCompanyCalendarMarks,
  useCompanyCalendarPeople,
} from "@/components/modules/calendar/hooks/useCompanyCalendar";
import {
  CALENDAR_SCROLL_SELECTOR,
  groupByUser,
} from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarBoard";
import {
  CompanyCalendarRow,
  CompanyCalendarSkeletonRow,
} from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarRow";
import { useBoard } from "@/components/modules/calendar/components/CompanyCalendarBoard/boardContext";
import { groupKey, groupTitle, placeholderRowCount } from "@/components/modules/calendar/lib/grouping";
import { BAND_H, NAME_COL } from "@/components/modules/calendar/lib/boardGeometry";
import { cn } from "@/lib/cn";
import type { CompanyCalendarGroup, CompanyCalendarGrouping, CompanyCalendarUser } from "@/models/calendar";
import type { FilterDTO } from "@/models/user/fields";

type Shared = {
  grouping: CompanyCalendarGrouping;
  q?: string;
  filters: FilterDTO[];
  from: string;
  to: string;
  /** See the flat board's `requestFor`. */
  requestFor?: (user: CompanyCalendarUser) => ((startISO: string, endISO: string) => void) | undefined;
};

type Props = Shared & {
  groups: CompanyCalendarGroup[] | undefined;
  isLoading: boolean;
  collapsed: ReadonlySet<string>;
  onToggle: (key: string) => void;
};

/**
 * A grouped board's body (N06c): one band per group, each with its own rows.
 *
 * Every section pages **its own** rows. Paging the whole roster and sorting it into groups here would slot each newly
 * loaded page into groups above the reader — the page would grow above the viewport and the scroll position would stop
 * meaning anything. A section that is folded, or has not yet come near the screen, fetches nothing.
 */
export const CompanyCalendarGroupedRows: FC<Props> = ({ groups, isLoading, collapsed, onToggle, ...shared }) => {
  if (isLoading && !groups) {
    return (
      <>
        {Array.from({ length: 12 }).map((_, r) => (
          <CompanyCalendarSkeletonRow key={`skel-${r}`} index={r} />
        ))}
      </>
    );
  }

  const list = groups ?? [];
  return (
    <>
      {list.map((group, i) => {
        const key = groupKey(group);
        return (
          <CompanyCalendarGroupSection
            key={key}
            group={group}
            collapsed={collapsed.has(key)}
            // Two bands in a row share one line (N06c).
            followsBand={i > 0 && collapsed.has(groupKey(list[i - 1]))}
            onToggle={() => onToggle(key)}
            {...shared}
          />
        );
      })}
    </>
  );
};

type SectionProps = Shared & {
  group: CompanyCalendarGroup;
  collapsed: boolean;
  followsBand: boolean;
  onToggle: () => void;
};

const scrollerOf = (node: HTMLElement | null): HTMLElement | null =>
  node ? (node.closest(CALENDAR_SCROLL_SELECTOR) as HTMLElement | null) : null;

const CompanyCalendarGroupSection: FC<SectionProps> = ({
  group,
  grouping,
  q,
  filters,
  from,
  to,
  collapsed,
  followsBand,
  onToggle,
  requestFor,
}) => {
  const t = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const { geometry, registry } = useBoard();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [nearScreen, setNearScreen] = useState(false);

  // A section loads once it comes within a screen of the viewport, and stays loaded. Forty open groups would otherwise
  // fire forty requests the moment the board is grouped.
  useEffect(() => {
    if (nearScreen) return;
    const node = sectionRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setNearScreen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNearScreen(true);
      },
      // The board scrolls inside its own box, so that box is the root.
      { root: scrollerOf(node), rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [nearScreen]);

  const {
    data: pages,
    isLoading,
    isError: peopleFailed,
    error: peopleError,
    refetch: refetchPeople,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCompanyCalendarPeople({
    q,
    filters,
    group: { by: grouping, id: group.id },
    enabled: !collapsed && nearScreen,
  });

  const users = useMemo(() => (pages?.pages ?? []).flatMap((p) => p.users), [pages]);
  const userIds = useMemo(() => users.map((u) => u.id), [users]);

  const { data: marks, isError: marksFailed, error: marksError, refetch: refetchMarks } = useCompanyCalendarMarks({
    from,
    to,
    userIds,
  });
  const marksByUser = useMemo(() => groupByUser(marks ?? []), [marks]);
  const {
    data: absences,
    isError: absencesFailed,
    error: absencesError,
    refetch: refetchAbsences,
  } = useCompanyCalendarAbsences({ from, to, userIds });
  const absencesByUser = useMemo(() => groupByUser(absences ?? []), [absences]);

  // The leave card's "who else is away" reads every group the board has loaded.
  const registryKey = `group:${groupKey(group)}`;
  useEffect(() => {
    registry.set(registryKey, users, absences ?? []);
    return () => registry.delete(registryKey);
  }, [registry, registryKey, users, absences]);

  // The next page of this group follows the scroll, like the flat board.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (collapsed || !node || !hasNextPage || isFetchingNextPage || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void fetchNextPage();
      },
      { root: scrollerOf(node), rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [collapsed, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Folding a group the reader is inside — its band stuck at the top, its rows scrolled past — would leave them
  // wherever the next group's rows happen to fall. Bring the band back to the top first.
  const toggle = () => {
    const section = sectionRef.current;
    const scroller = scrollerOf(section);
    if (!collapsed && section && scroller) {
      const offset = section.getBoundingClientRect().top - scroller.getBoundingClientRect().top - geometry.headerHeight;
      if (offset < 0) scroller.scrollTop += offset;
    }
    onToggle();
  };

  const title = groupTitle(t, grouping, group);
  const failed = peopleFailed || marksFailed || absencesFailed;
  const waiting = !collapsed && (!nearScreen || (isLoading && users.length === 0));
  const width = NAME_COL + geometry.dayCount * geometry.dayW;

  return (
    <div ref={sectionRef} role="group" aria-label={title}>
      {/* The group band (N06c): white, 32 high, no day cells, a 2 px line on both sides; it sticks under the header
          while its rows scroll past, and the today line runs through it. */}
      <div
        className={cn("sticky z-[15] border-y-2 border-divider bg-card", followsBand && "-mt-0.5")}
        style={{ top: geometry.headerHeight, height: BAND_H, width }}
      >
        {geometry.todayIndex >= 0 ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-accent"
            style={{ left: NAME_COL + geometry.todayIndex * geometry.dayW + geometry.dayW / 2 }}
          />
        ) : null}
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={toggle}
          className="sticky left-0 flex h-full items-center gap-2 bg-card pr-3 pl-6 text-left outline-none focus-visible:shadow-focus"
          style={{ width: NAME_COL }}
        >
          <Icon
            icon={ArrowDown01Icon}
            size="sm"
            className={cn("size-3.5 shrink-0 text-secondary transition-transform duration-(--duration-menu)", collapsed && "-rotate-90")}
          />
          <span className="min-w-0 truncate text-body font-semibold text-accent-text">{title}</span>
          <span className="text-label font-normal text-tertiary" aria-label={tCommon("people.count", { count: group.count })}>
            {group.count}
          </span>
        </button>
      </div>

      {collapsed ? null : failed ? (
        <div className="sticky left-0" style={{ width: Math.min(width, 720) }}>
          <ErrorState
            compact
            error={peopleFailed ? peopleError : marksFailed ? marksError : absencesError}
            onRetry={() => void (peopleFailed ? refetchPeople() : marksFailed ? refetchMarks() : refetchAbsences())}
          />
        </div>
      ) : waiting ? (
        Array.from({ length: placeholderRowCount(group.count) }).map((_, r) => (
          <CompanyCalendarSkeletonRow key={`skel-${r}`} index={r} />
        ))
      ) : (
        <>
          {users.map((u) => (
            <CompanyCalendarRow
              key={u.id}
              user={u}
              marks={marksByUser.get(u.id) ?? []}
              absences={absencesByUser.get(u.id)}
              onSelectRange={requestFor?.(u)}
            />
          ))}
          {hasNextPage ? (
            <div ref={sentinelRef}>
              {isFetchingNextPage ? <CompanyCalendarSkeletonRow index={1} /> : <div className="h-px" />}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
