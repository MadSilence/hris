import type { FilterDTO } from "@/models/user/fields";

/**
 * A saved lens on the company calendar.
 *
 * **No period.** Opened in June, a view shows June through the same filters — it is a lens, not a
 * snapshot. `grouping` has a slot although nothing writes it yet: whether the board groups rows by
 * department, team or office is an open product question, and views saved before the field exists
 * would otherwise need a second reader once it does.
 */
export type CalendarViewPayload = {
  filters: FilterDTO[];
  density?: "month" | "week";
  grouping?: string | null;
};

export type CalendarView = {
  id: string;
  name: string;
  payload: CalendarViewPayload;
  createdAt?: string;
  updatedAt?: string;
};
