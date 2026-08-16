/**
 * Helpers for reading raw attribute values as they come back from the API.
 *
 * Values are read through a COALESCE over the typed columns and always arrive as strings, so a
 * CHECKBOX stored as `false` comes back as the STRING "false" — which is truthy. Every consumer has
 * to go through this parser instead of testing the raw value.
 */

/** True/false for a CHECKBOX value, accepting every shape it is stored in ("true"/"false", 1/0). */
export function parseCheckboxValue(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw !== 0;
  if (typeof raw === "string") {
    const v = raw.trim().toLowerCase();
    return v === "true" || v === "1";
  }
  return false;
}

/** A PERSON value resolved by the backend into a display shape. */
export type PersonValue = { id: string; name: string };

/** Narrows a PERSON value; unresolved ids (deleted user, legacy free text) come back as null. */
export function parsePersonValue(raw: unknown): PersonValue | null {
  if (raw && typeof raw === "object") {
    const o = raw as Partial<PersonValue>;
    if (typeof o.id === "string" && typeof o.name === "string") return { id: o.id, name: o.name };
  }
  return null;
}
