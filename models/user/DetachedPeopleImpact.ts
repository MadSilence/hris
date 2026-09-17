/**
 * Who deleting an office or a legal entity detaches, shown before Delete is pressed. `people` is the
 * first few by name; `peopleCount` is everybody.
 */
export type DetachedPeopleImpact = {
  name: string;
  peopleCount: number;
  people: { id: string; firstName: string | null; lastName: string | null }[];
};
