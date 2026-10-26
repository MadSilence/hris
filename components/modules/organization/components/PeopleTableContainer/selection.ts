import type { BulkEditTarget } from "@/components/modules/organization/components/BulkEdit/BulkEditModal";
import type { DraftVisibility, FilterDTO } from "@/models/user/fields";

type TableQuery = { filters: FilterDTO[]; q?: string | null; drafts?: DraftVisibility | null };

/**
 * Whether to offer "Select All N Matching": every loaded row is held and the table holds more than
 * that — or the whole set is already chosen, so the strip says so and offers to clear it.
 */
export function offersAllMatching(
  loadedIds: string[],
  selectedIds: ReadonlySet<string>,
  matchingCount: number | null,
  allMatching: boolean,
): boolean {
  const allLoadedHeld = loadedIds.length > 0 && loadedIds.every((id) => selectedIds.has(id));
  return allLoadedHeld && matchingCount != null && (allMatching || matchingCount > selectedIds.size);
}

/**
 * What a bulk operation is sent: the ids held, or — once the whole set is chosen — the table's own
 * query, which the backend resolves exactly as the table shows it (`Mode.TABLE`). The ids would be
 * only the rows loaded so far.
 */
export function bulkTargetFor(allMatching: boolean, selectedIds: ReadonlySet<string>, query: TableQuery): BulkEditTarget {
  return allMatching
    ? { kind: "segment", filters: query.filters, q: query.q ?? null, drafts: query.drafts ?? null }
    : { kind: "ids", userIds: Array.from(selectedIds) };
}

/** The number the topbar and the confirmation show. */
export function heldCountFor(allMatching: boolean, selectedIds: ReadonlySet<string>, matchingCount: number | null): number {
  return allMatching && matchingCount != null ? matchingCount : selectedIds.size;
}
