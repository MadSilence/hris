import type { FilterDTO } from "@/models/user/fields";
import type { CompanyCalendarGrouping } from "@/models/calendar";

/**
 * A saved lens on the company calendar.
 *
 * **No period.** Opened in June, a view shows June through the same filters — it is a lens, not a
 * snapshot. `grouping` is the one dimension the rows are grouped by, or null for a flat board; a view
 * saved before grouping existed has no key at all and reopens flat. The value is read through
 * `parseCalendarGrouping`, because a payload is stored JSON and nothing on the server checks it.
 */
export type CalendarViewPayload = {
  filters: FilterDTO[];
  density?: "month" | "week";
  grouping?: CompanyCalendarGrouping | null;
};

export type CalendarView = {
  id: string;
  name: string;
  payload: CalendarViewPayload;
  createdAt?: string;
  updatedAt?: string;
};
