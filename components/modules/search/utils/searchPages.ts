import { canAccess, type EffectiveAccess } from "@/models/access";
import { settingsGroups } from "@/components/modules/settings/config/settings.config";

/** A destination in the app, offered by name. */
export type SearchPage = {
  label: string;
  href: string;
  /** The settings area it belongs to, as a subtitle; absent for the app's top-level pages. */
  section?: string;
};

/**
 * Other words a reader types for the same page ("holidays" → Public Holidays). Keyed by href so a
 * label can be renamed without losing them.
 */
const SYNONYMS: Record<string, string[]> = {
  "/dashboard": ["home", "dashboard"],
  "/organization/people": ["people", "directory", "employees", "staff"],
  "/calendar": ["calendar", "who is out", "absences"],
  "/settings/time/public-holidays": ["holidays", "bank holidays"],
  "/settings/time/leave-type": ["leave", "vacation", "time off", "policies", "absence"],
  "/settings/people/roles": ["roles", "permissions", "access"],
  "/settings/people/attributes": ["fields", "attributes", "custom fields"],
  "/settings/general/legal-entities": ["offices", "legal entities", "companies"],
  "/settings/general/job-catalog": ["jobs", "positions", "titles", "levels"],
  "/settings/admin/logs": ["audit", "activity", "journal"],
  "/settings/automation/preboarding": ["onboarding", "offboarding", "checklists"],
};

/**
 * The pages index: the app's own destinations, as the sidebar already offers them to this reader,
 * plus every settings page whose resources the reader holds. **UX only** — `canAccess` decides what is
 * offered, and the destination refuses a reader on its own as it always has
 * (`HOME_AND_SEARCH.md` § 6, trap 8). It never decides which entities are searched.
 */
export const buildSearchPages = (
  appPages: SearchPage[],
  access: EffectiveAccess | null | undefined,
): SearchPage[] => {
  const settingsPages = settingsGroups.flatMap((group) =>
    group.items
      .filter((item) =>
        (item.resources ?? []).some((resource) => canAccess({ access, resource, action: "VIEW" })),
      )
      .map((item) => ({ label: item.label, href: item.href, section: `Settings · ${group.title}` })),
  );
  return [...appPages, ...settingsPages];
};

/** The pages a term finds — by name or by a synonym, a match at the start first. */
export const matchSearchPages = (pages: SearchPage[], term: string): SearchPage[] => {
  const needle = term.trim().toLowerCase();
  if (!needle) return pages;

  const rank = (page: SearchPage): number => {
    const names = [page.label, ...(SYNONYMS[page.href] ?? [])].map((name) => name.toLowerCase());
    if (names.some((name) => name.startsWith(needle))) return 0;
    if (names.some((name) => name.split(/\s+/).some((word) => word.startsWith(needle)))) return 1;
    if (names.some((name) => name.includes(needle))) return 2;
    return -1;
  };

  return pages
    .map((page) => ({ page, rank: rank(page) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.page.label.localeCompare(b.page.label))
    .map(({ page }) => page);
};
