import { AttributeType } from "@/models/attribute/AttributeType";
import { getObjectSchema, type ObjectRecord } from "@/models/attribute/objectFields";

/** The mask the backend writes in place of a value the reader may not see (`AttributeValueMasker.MASK`). */
export const MASKED_VALUE = "••••";

/** A masked value: the bare mask, or the mask with a visible tail ("•••• 1234"). */
export function isMaskedValue(value: unknown): boolean {
  return typeof value === "string" && value.startsWith(MASKED_VALUE);
}

function records(value: unknown): ObjectRecord[] {
  if (Array.isArray(value)) return value.filter((r): r is ObjectRecord => !!r && typeof r === "object");
  if (value && typeof value === "object") return [value as ObjectRecord];
  return [];
}

function text(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function formatMoney(record: ObjectRecord): string {
  const amount = text(record.amount);
  const currency = text(record.currency).toUpperCase();
  if (!amount) return "";
  const n = Number(amount);
  if (Number.isNaN(n)) return currency ? `${amount} ${currency}` : amount;
  if (/^[A-Z]{3}$/.test(currency)) {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
    } catch {
      // An unknown ISO code: fall through to the plain form rather than lose the value.
    }
  }
  const formatted = new Intl.NumberFormat().format(n);
  return currency ? `${formatted} ${currency}` : formatted;
}

/**
 * One line for a MONEY, ADDRESS or OBJECT value — for a table cell or a file, where the profile's
 * record view does not fit. These values are stored as a list of records, and a list cell used to
 * print the JSON.
 *
 * MONEY reads "€48,000.00"; ADDRESS joins its non-empty parts; OBJECT shows its one record's values,
 * or "N entries" when there are several.
 */
export function objectValueSummary(
  type: AttributeType | string,
  value: unknown,
  objectFieldsJson?: string | null,
): string {
  const rows = records(value);
  if (rows.length === 0) return "";

  if (type === AttributeType.MONEY) return formatMoney(rows[0]);

  const schema = getObjectSchema(type as AttributeType, objectFieldsJson);
  const keys = schema.length > 0 ? schema.map((f) => f.key) : Object.keys(rows[0]);
  const line = (r: ObjectRecord) => keys.map((k) => text(r[k])).filter(Boolean).join(", ");

  if (type === AttributeType.ADDRESS) return line(rows[0]);
  if (rows.length > 1) return `${rows.length} entries`;
  return line(rows[0]);
}
