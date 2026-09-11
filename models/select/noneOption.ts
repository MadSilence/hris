/**
 * The "no value" option in a Select.
 *
 * Radix `Select` cannot hold an empty string, so every module invented its own sentinel **and** its
 * own label: `ROOT_VALUE = "none"` on departments and teams, `"No category"` on leave types and
 * documents, `"No folder"` on the document dialogs, `"No level"` on jobs. Four labels for one idea.
 *
 * The sentinel stays an implementation detail; **what the reader sees is the word `None`**.
 *
 * Rule: `technical_documentation/ui/FORMS_AND_FIELDS.md` § 5.
 */
export const NONE_VALUE = "none";

/** The label, so nobody writes "No category" again. */
export const NONE_LABEL = "None";

/** `undefined` for the sentinel, the value otherwise — for reading a Select back into a request. */
export const valueOrNone = <T extends string>(value: string): T | null =>
  value === NONE_VALUE ? null : (value as T);

/** The inverse, for seeding a Select from a nullable value. */
export const noneOrValue = (value: string | null | undefined): string => value ?? NONE_VALUE;
