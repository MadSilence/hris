/**
 * What the quick-search window can find on the server, in the order it shows the groups. Pages are
 * not here: their index lives on the client (`components/modules/search/utils/searchPages`).
 */
export const SEARCH_KINDS = [
  "PEOPLE",
  "DEPARTMENT",
  "TEAM",
  "OFFICE",
  "LEGAL_ENTITY",
  "JOB",
  "TIME_OFF_POLICY",
  "ROLE",
] as const;

export type SearchKind = (typeof SEARCH_KINDS)[number];

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string | null;
  avatarUrl?: string | null;
  /** A person's employment status — absent when the reader may not see it. */
  status?: string | null;
  /** A person's account status (Draft / Invited / Blocked are the ones with a chip). */
  accountStatus?: string | null;
  /** The entity the hit's page sits under: a time-off policy's leave type. */
  parentId?: string | null;
}

export interface SearchGroup {
  kind: SearchKind;
  /** Every match the server looked at. */
  total: number;
  /** The server stopped looking: the real number is larger than `total`. */
  truncated: boolean;
  items: SearchItem[];
}

/** A kind the reader may not search is absent, not empty. */
export interface SearchResponse {
  groups: SearchGroup[];
}

export interface SearchParams {
  q: string;
  kinds?: SearchKind[];
  limit?: number;
}
