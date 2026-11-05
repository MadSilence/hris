import type { PeopleImportKind } from "@/api/modules/peopleImport/dto";

/**
 * What each kind of import says about itself on the page (IMPORT_NEXT_DESIGN.md § 3.5). The steps are
 * shared; the words are not. Each entry holds catalogue keys of the `peopleImport` namespace.
 */
export const IMPORT_KINDS = {
  ORG_STRUCTURE: {
    /** The card's title on the first step. */
    titleKey: "kinds.orgStructure.title",
    /** One sentence under it. */
    descriptionKey: "kinds.orgStructure.description",
    /** "row", as this kind names one of its rows — a plural message with `{count}`. */
    nounKey: "kinds.orgStructure.noun",
  },
  PEOPLE_CREATE: {
    titleKey: "kinds.peopleCreate.title",
    descriptionKey: "kinds.peopleCreate.description",
    nounKey: "kinds.peopleCreate.noun",
  },
  LEAVE_BALANCES: {
    titleKey: "kinds.leaveBalances.title",
    descriptionKey: "kinds.leaveBalances.description",
    nounKey: "kinds.leaveBalances.noun",
  },
} as const satisfies Record<PeopleImportKind, { titleKey: string; descriptionKey: string; nounKey: string }>;

/** Move-in order: the structure, then the people who fill it, then their balances. */
export const KIND_ORDER: PeopleImportKind[] = ["ORG_STRUCTURE", "PEOPLE_CREATE", "LEAVE_BALANCES"];
