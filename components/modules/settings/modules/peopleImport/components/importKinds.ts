import type { PeopleImportKind } from "@/api/modules/peopleImport/dto";

/**
 * What each kind of import says about itself on the page (IMPORT_NEXT_DESIGN.md § 3.5). The steps are
 * shared; the words are not.
 */
export type ImportKindCopy = {
  /** The card's title on the first step. */
  title: string;
  /** One sentence under it. */
  description: string;
  /** "row", as this kind names one of its rows: a person, a unit, a balance. */
  noun: (n: number) => string;
};

const plural = (one: string, many: string) => (n: number) => `${n} ${n === 1 ? one : many}`;

export const IMPORT_KINDS: Record<PeopleImportKind, ImportKindCopy> = {
  ORG_STRUCTURE: {
    title: "Structure",
    description:
      "Departments and teams, with their parents, leads and codes. Units are only created: a name the company already has is an error.",
    noun: plural("unit", "units"),
  },
  PEOPLE_CREATE: {
    title: "People",
    description:
      "Every row becomes a new person, as a draft. Nobody already here is changed: an email that already belongs to somebody is an error.",
    noun: plural("person", "people"),
  },
  LEAVE_BALANCES: {
    title: "Leave Balances",
    description:
      "Each person's balance on a date, per policy — a target, not an addition, so the same file twice changes nothing. The policy must be assigned first.",
    noun: plural("balance", "balances"),
  },
};

/** Move-in order: the structure, then the people who fill it, then their balances. */
export const KIND_ORDER: PeopleImportKind[] = ["ORG_STRUCTURE", "PEOPLE_CREATE", "LEAVE_BALANCES"];
