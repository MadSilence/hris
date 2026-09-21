import { AttributeType } from "@/models/attribute/AttributeType";
import type { FieldDTO } from "@/models/user/fields";

/**
 * What the People table can be ordered by. One list for the header, the saved views and the share
 * link — the views used to keep their own copy, six columns long, and quietly dropped a saved sort
 * by hire date.
 *
 * System columns are sent without their prefix (`hire_date`); it has to match `ALLOWED_SORT_FIELDS`
 * in `UserGetService`, which falls back to `last_name` silently for anything else. The employment
 * columns were withdrawn from here once: paging by a nullable column dropped everyone with no value.
 * The keyset now sorts NULLs last and carries them through the cursor
 * (`UserRepositoryImpl.appendKeyset`), so they are back — and Email, nullable for a draft, no longer
 * loses drafts either.
 */
export const SORTABLE_SYS_KEYS: ReadonlySet<string> = new Set([
  "first_name",
  "last_name",
  "email",
  "status",
  "created_at",
  "updated_at",
  "hire_date",
  "employment_type",
  "probation_end",
  "termination_date",
]);

/**
 * Custom attribute types the backend orders by (`AttributeSortKey.kindOf`) — the ones with a single
 * scalar value. A SELECT sorts by the option's position in its list, not by its text; a CHECKBOX puts
 * No before Yes. MULTI_SELECT has no one value to order by, a PERSON stores an id, LONG_TEXT is prose,
 * and MONEY / ADDRESS / OBJECT are records.
 */
export const SORTABLE_ATTRIBUTE_TYPES: ReadonlySet<AttributeType> = new Set([
  AttributeType.TEXT,
  AttributeType.EMAIL,
  AttributeType.URL,
  AttributeType.PHONE,
  AttributeType.COUNTRY,
  AttributeType.LANGUAGE,
  AttributeType.TIMEZONE,
  AttributeType.CURRENCY,
  AttributeType.CHECKBOX,
  AttributeType.NUMBER,
  AttributeType.DATE,
  AttributeType.SELECT,
]);

type SortableMeta = Pick<FieldDTO, "type" | "isSystem">;

/**
 * The sort key a column's header sends, or null when the column does not sort.
 *
 * A system column sorts by its bare key; a custom attribute by its full column id (`attr:<uuid>`),
 * which is what the backend reads as "join this attribute". An attribute needs its field metadata to
 * know the type — without it the header stays inert rather than offering a sort that would fall back
 * to the surname.
 */
export function sortKeyForColumn(columnId: string, meta?: SortableMeta | null): string | null {
  if (columnId.startsWith("sys:")) {
    const key = columnId.slice(4);
    return SORTABLE_SYS_KEYS.has(key) ? key : null;
  }
  if (columnId.startsWith("attr:")) {
    if (!meta || meta.isSystem) return null;
    return SORTABLE_ATTRIBUTE_TYPES.has(meta.type) ? columnId : null;
  }
  return null;
}

/**
 * Whether a saved sort still applies for this reader. An attribute sort survives only if the field is
 * among the fields they may see as a column (`visibleFields`) — otherwise the backend refuses it
 * (SG00005), because the order of the rows would read the hidden value out.
 */
export function isSortKeyAvailable(sortKey: string, visibleFields: FieldDTO[]): boolean {
  if (sortKey.startsWith("attr:")) {
    const field = visibleFields.find((f) => f.id === sortKey);
    return !!field && sortKeyForColumn(field.id, field) === sortKey;
  }
  return SORTABLE_SYS_KEYS.has(sortKey);
}
