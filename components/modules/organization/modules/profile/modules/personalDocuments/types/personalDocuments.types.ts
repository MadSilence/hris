/**
 * UI-only types for the personal documents tab. Everything that crosses the wire lives in
 * `@/api/modules/documents/dto` — this file is just the browsing state on top of it.
 */

/** One hop in the folder trail. `id: null` is the root ("Documents"). */
export type BreadcrumbItem = {
  id: string | null;
  name: string;
};
