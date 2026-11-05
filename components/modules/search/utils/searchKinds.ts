import type { SearchItem, SearchKind } from "@/models/search";

/** Group headings, sentence case (`ui/NAMING.md` § 1) — keys of the `search` catalogue. */
export const SEARCH_KIND_LABELS = {
  PEOPLE: "kinds.people",
  DEPARTMENT: "kinds.departments",
  TEAM: "kinds.teams",
  OFFICE: "kinds.offices",
  LEGAL_ENTITY: "kinds.legalEntities",
  JOB: "kinds.jobs",
  TIME_OFF_POLICY: "kinds.timeOffPolicies",
  ROLE: "kinds.roles",
} as const satisfies Record<SearchKind, string>;

/**
 * Where a hit opens. Departments, teams and jobs have no page of their own — they open on their
 * canvas or catalogue, where the reader finds them again by name.
 */
export const searchItemHref = (kind: SearchKind, item: SearchItem): string | null => {
  switch (kind) {
    case "PEOPLE":
      return `/organization/people/${item.id}/personal`;
    case "DEPARTMENT":
      return "/settings/general/departments";
    case "TEAM":
      return "/settings/general/teams";
    case "OFFICE":
      return `/settings/general/offices/${item.id}`;
    case "LEGAL_ENTITY":
      return `/settings/general/legal-entities/${item.id}`;
    case "JOB":
      return "/settings/general/job-catalog";
    case "TIME_OFF_POLICY":
      return item.parentId ? `/settings/time/leave-type/${item.parentId}/policies/${item.id}` : null;
    case "ROLE":
      return `/settings/people/roles/${item.id}`;
  }
};
