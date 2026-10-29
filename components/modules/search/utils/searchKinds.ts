import type { SearchItem, SearchKind } from "@/models/search";

/** Group headings, Title Case (`ui/NAMING.md` § 1). */
export const SEARCH_KIND_LABELS: Record<SearchKind, string> = {
  PEOPLE: "People",
  DEPARTMENT: "Departments",
  TEAM: "Teams",
  OFFICE: "Offices",
  LEGAL_ENTITY: "Legal Entities",
  JOB: "Jobs",
  TIME_OFF_POLICY: "Time Off Policies",
  ROLE: "Roles",
};

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
