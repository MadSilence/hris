import type { CompanyCalendarGrouping } from "@/models/calendar";
import type { FilterDTO } from "@/models/user/fields";
import { parseCalendarGrouping } from "@/components/modules/calendar/lib/grouping";
import type { BoardScale } from "@/components/modules/calendar/lib/boardGeometry";

/**
 * A calendar state as an address (N10c, F0.2): what the link of Share carries, and what Home's Who's out opens. Read
 * once on load, written back as the reader changes it, so the address bar is always a link to what is on screen.
 *
 *   view    `everyone`, `my-team`, or a saved view's id — a saved view is personal, so another reader's link
 *           keeps only its filters, which travel beside it
 *   f       the filters, as JSON
 *   group   `department` | `team` | `office`
 *   scale   `week` (month is the default and is left out)
 *   from    the first day on screen, `YYYY-MM-DD`
 *   person  one person's id — the board shows that person alone (N21)
 *
 * **It carries no right.** The receiver sees what their own access lets them see: the same reads, the same scope.
 */
export type CalendarUrlState = {
  view: string | null;
  filters: FilterDTO[];
  grouping: CompanyCalendarGrouping | null;
  scale: BoardScale;
  from: string | null;
  person: string | null;
};

export const BUILT_IN_VIEWS = { everyone: "everyone", myTeam: "my-team" } as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[\w-]{1,64}$/;

/** Stored JSON from a link: kept only where it has the shape of a filter, anything else is dropped. */
const parseFilters = (raw: string | null): FilterDTO[] => {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (f): f is FilterDTO =>
        typeof f === "object" && f !== null && typeof (f as FilterDTO).field === "string" && typeof (f as FilterDTO).op === "string",
    );
  } catch {
    return [];
  }
};

export const parseCalendarUrl = (params: Pick<URLSearchParams, "get">): CalendarUrlState => {
  const view = params.get("view");
  const from = params.get("from");
  const person = params.get("person");
  return {
    view: view && ID.test(view) ? view : null,
    filters: parseFilters(params.get("f")),
    grouping: parseCalendarGrouping(params.get("group")?.toUpperCase()),
    scale: params.get("scale") === "week" ? "week" : "month",
    from: from && ISO_DATE.test(from) ? from : null,
    person: person && ID.test(person) ? person : null,
  };
};

/** The query string for a state — empty parts left out, so a plain board is a plain `/calendar`. */
export const calendarUrlQuery = (state: CalendarUrlState): string => {
  const params = new URLSearchParams();
  if (state.view) params.set("view", state.view);
  if (state.filters.length > 0) params.set("f", JSON.stringify(state.filters));
  if (state.grouping) params.set("group", state.grouping.toLowerCase());
  if (state.scale === "week") params.set("scale", "week");
  if (state.from) params.set("from", state.from);
  if (state.person) params.set("person", state.person);
  const query = params.toString();
  return query ? `?${query}` : "";
};

/** Home's Who's out opens the calendar on one person (F0.2). */
export const calendarPersonHref = (userId: string): string =>
  `/calendar${calendarUrlQuery({ view: null, filters: [], grouping: null, scale: "month", from: null, person: userId })}`;
