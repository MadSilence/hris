"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { ErrorState } from "@/components/feedback/ErrorState";
import {
  useCompanyCalendarMarks,
  useCompanyCalendarPeople,
} from "@/components/modules/calendar/hooks/useCompanyCalendar";
import {
  CALENDAR_HEADER_HEIGHT_VAR,
  CALENDAR_SCROLL_SELECTOR,
} from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarBoard";
import {
  CompanyCalendarRow,
  CompanyCalendarSkeletonRow,
  useMarksByUser,
  type CompanyCalendarRowGeometry,
} from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarRow";
import {
  groupKey,
  groupTitle,
  placeholderRowCount,
} from "@/components/modules/calendar/lib/grouping";
import type { CompanyCalendarGroup, CompanyCalendarGrouping } from "@/models/calendar";
import type { FilterDTO } from "@/models/user/fields";

type Shared = {
  grouping: CompanyCalendarGrouping;
  q?: string;
  filters: FilterDTO[];
  from: string;
  to: string;
  geometry: CompanyCalendarRowGeometry;
};

type Props = Shared & {
  groups: CompanyCalendarGroup[] | undefined;
  isLoading: boolean;
  collapsed: ReadonlySet<string>;
  onToggle: (key: string) => void;
};

/**
 * A grouped board's body: one section per group, each with its own header, count and rows.
 *
 * Every section pages **its own** rows. Paging the whole roster and sorting it into groups here
 * would slot each newly loaded page into groups above the reader — the page would grow above the
 * viewport and the scroll position would stop meaning anything. A section that is collapsed, or
 * has not yet come near the screen, fetches nothing.
 */
export const CompanyCalendarGroupedRows: FC<Props> = ({
  groups,
  isLoading,
  collapsed,
  onToggle,
  ...shared
}) => {
  if (isLoading && !groups) {
    return (
      <>
        {Array.from({ length: 12 }).map((_, r) => (
          <CompanyCalendarSkeletonRow
            key={`skel-${r}`}
            dayISOs={shared.geometry.dayISOs}
            gridTemplateColumns={shared.geometry.gridTemplateColumns}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {(groups ?? []).map((group) => {
        const key = groupKey(group);
        return (
          <CompanyCalendarGroupSection
            key={key}
            group={group}
            collapsed={collapsed.has(key)}
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
  geometry,
  collapsed,
  onToggle,
}) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [nearScreen, setNearScreen] = useState(false);

  // A section loads once it comes within a screen of the viewport, and stays loaded. Forty expanded
  // groups would otherwise fire forty requests the moment the board is grouped.
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
      // The board scrolls inside its own box, so that box is the root: a margin on the viewport
      // would not reach past the box's clipping.
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

  const {
    data: marks,
    isError: marksFailed,
    error: marksError,
    refetch: refetchMarks,
  } = useCompanyCalendarMarks({ from, to, userIds });
  const marksByUser = useMarksByUser(marks ?? []);

  // The next page of this group follows the scroll, like the flat board.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (collapsed || !node || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void fetchNextPage();
      },
      { root: scrollerOf(node), rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [collapsed, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Collapsing a group the reader is inside — its header stuck at the top, its rows scrolled past —
  // would leave them wherever the next group's rows happen to fall. Bring the header back to the top
  // first, so after the collapse they are looking at the group they just closed.
  const toggle = () => {
    const section = sectionRef.current;
    const scroller = scrollerOf(section);
    if (!collapsed && section && scroller) {
      const headerHeight =
        parseFloat(getComputedStyle(scroller).getPropertyValue(CALENDAR_HEADER_HEIGHT_VAR)) || 0;
      const offset =
        section.getBoundingClientRect().top - scroller.getBoundingClientRect().top - headerHeight;
      if (offset < 0) scroller.scrollTop += offset;
    }
    onToggle();
  };

  const title = groupTitle(grouping, group);
  const failed = peopleFailed || marksFailed;
  const waiting = !collapsed && (!nearScreen || (isLoading && users.length === 0));

  return (
    <div ref={sectionRef} role="group" aria-label={title}>
      {/* Sticks under the day header while its rows scroll past, so the reader always knows whose
          rows they are looking at; the next group's header pushes it out. */}
      <div
        className="sticky z-[15] border-b border-brown-200 bg-brown-50"
        style={{ top: `var(${CALENDAR_HEADER_HEIGHT_VAR}, 0px)` }}
      >
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={toggle}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-brown-100"
        >
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-brown-500 transition-transform ${collapsed ? "" : "rotate-90"}`}
          />
          <span className="truncate font-medium text-brown-800">{title}</span>
          <Badge variant="secondary" className="px-1.5" aria-label={`${group.count} people`}>
            {group.count}
          </Badge>
        </button>
      </div>

      {collapsed ? null : failed ? (
        <ErrorState
          compact
          error={peopleFailed ? peopleError : marksError}
          onRetry={() => void (peopleFailed ? refetchPeople() : refetchMarks())}
        />
      ) : waiting ? (
        Array.from({ length: placeholderRowCount(group.count) }).map((_, r) => (
          <CompanyCalendarSkeletonRow
            key={`skel-${r}`}
            dayISOs={geometry.dayISOs}
            gridTemplateColumns={geometry.gridTemplateColumns}
          />
        ))
      ) : (
        <>
          {users.map((u) => (
            <CompanyCalendarRow key={u.id} user={u} marks={marksByUser.get(u.id) ?? []} {...geometry} />
          ))}
          {hasNextPage ? (
            <div ref={sentinelRef} className="flex justify-center py-3 text-xs text-muted-foreground">
              {isFetchingNextPage ? "Loading…" : ""}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
