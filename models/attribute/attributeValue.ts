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

/**
 * A SELECT value: the option's id, and its text for reading. A MULTI_SELECT is a list of these.
 *
 * **The id is the identity** — it is what the API writes back and what a filter matches on. The
 * label is display only, and nothing resolves or falls back to it: an option's text is editable, and
 * matching on it is what let a rename quietly narrow a CUSTOM access scope. See `DECISIONS.md`
 * § "A SELECT value travels as {id, label}, and the id is the identity".
 *
 * `id` is null on a masked value — the shape survives redaction so no consumer needs a second branch.
 */
export type OptionValue = { id: string | null; label: string | null };

/** Narrows an option value. Anything else — a bare string, a number — is not one. */
export function parseOptionValue(raw: unknown): OptionValue | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Partial<OptionValue>;
    const hasId = typeof o.id === "string" || o.id === null;
    if (hasId && "label" in o) return { id: o.id ?? null, label: o.label ?? null };
  }
  return null;
}

/**
 * What to show for a SELECT value.
 *
 * An id with no label behind it renders as itself rather than as nothing: the value exists, and an
 * option deleted after it was written must not make it disappear silently.
 */
export function optionValueLabel(raw: unknown): string | null {
  const option = parseOptionValue(raw);
  if (option) return option.label ?? option.id;
  return raw == null ? null : String(raw);
}

/** What to send back, and what to compare against: the option's id. */
export function optionValueId(raw: unknown): string | null {
  const option = parseOptionValue(raw);
  if (option) return option.id;
  return typeof raw === "string" ? raw : null;
}

const OPTION_ID_PREFIX = "opt:";

/**
 * An option id without its wire prefix.
 *
 * The same option travels in two spellings: a value and the field catalogue say `opt:<uuid>`, the
 * attribute definitions (`/groups`) say `<uuid>`. The backend reads both. Comparing them as strings
 * matched nothing, and the profile printed `opt:…` where a label belonged (walk of 2026-09-21).
 */
export function bareOptionId(id: string): string {
  return id.startsWith(OPTION_ID_PREFIX) ? id.slice(OPTION_ID_PREFIX.length) : id;
}

/** Do two option ids name the same option, whichever spelling each arrived in? */
export function sameOptionId(a: string | null | undefined, b: string | null | undefined): boolean {
  return a != null && b != null && bareOptionId(a) === bareOptionId(b);
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
