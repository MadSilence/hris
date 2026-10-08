import type { CompanyCalendarGroup, CompanyCalendarGrouping } from "@/models/calendar";
import type { FieldDTO } from "@/models/user/fields";

/**
 * Row grouping on the company calendar — the pure half, so it can be tested without a board.
 *
 * One dimension at a time: department, team or office. Each is a registry field, and grouping by it
 * prints its value on every header, so it is offered only where the reader could filter by it — a
 * company-wide VIEW on the field. The server enforces the same rule; this only keeps the menu honest.
 */

export const CALENDAR_GROUPINGS: readonly CompanyCalendarGrouping[] = ["DEPARTMENT", "TEAM", "OFFICE"];

const FIELD_ID: Record<CompanyCalendarGrouping, string> = {
  DEPARTMENT: "sys:department",
  TEAM: "sys:team",
  OFFICE: "sys:office",
};

const LABEL: Record<CompanyCalendarGrouping, string> = {
  DEPARTMENT: "Department",
  TEAM: "Team",
  OFFICE: "Office",
};

export const groupingLabel = (grouping: CompanyCalendarGrouping): string => LABEL[grouping];

/**
 * A saved view's `grouping`, read defensively. The payload is stored JSON that nothing on the server
 * checks, so an unknown value — or none, from a view saved before grouping existed — reads as flat.
 */
export const parseCalendarGrouping = (value: unknown): CompanyCalendarGrouping | null =>
  typeof value === "string" && (CALENDAR_GROUPINGS as readonly string[]).includes(value)
    ? (value as CompanyCalendarGrouping)
    : null;

/**
 * The groupings this reader may use: the field must be in their catalogue with a company-wide read.
 * Until the catalogue has loaded nothing is offered — offering and then withdrawing an option is
 * worse than a menu that fills in a moment later.
 */
export const availableGroupings = (fields: FieldDTO[] | undefined): CompanyCalendarGrouping[] => {
  if (!fields) return [];
  return CALENDAR_GROUPINGS.filter((g) => {
    const field = fields.find((f) => f.id === FIELD_ID[g]);
    return Boolean(field && (field.viewScopes ?? []).includes("COMPANY"));
  });
};

/** The header text. The "no value" group is named after the dimension: "No team", never "None". */
export const groupTitle = (grouping: CompanyCalendarGrouping, group: CompanyCalendarGroup): string =>
  group.id === null ? `No ${LABEL[grouping].toLowerCase()}` : group.name?.trim() || "Untitled";

/** A stable key per group — the "no value" group has no id of its own. */
export const groupKey = (group: Pick<CompanyCalendarGroup, "id">): string => group.id ?? "__none__";

/** How many rows a group shows as placeholders while its first page loads. */
export const placeholderRowCount = (count: number): number => Math.max(1, Math.min(count, 5));
