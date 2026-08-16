import { AttributeType } from "@/models/attribute/AttributeType";

/** Sub-field of a repeatable-object (OBJECT type) attribute. v1 supports scalar sub-types. */
export type ObjectSubfieldType = AttributeType.TEXT | AttributeType.NUMBER | AttributeType.DATE;

export const OBJECT_SUBFIELD_TYPES: ObjectSubfieldType[] = [
  AttributeType.TEXT,
  AttributeType.NUMBER,
  AttributeType.DATE,
];

export type ObjectFieldDef = {
  key: string;
  label: string;
  /** Sub-field render type. User-defined OBJECT sub-fields are limited to OBJECT_SUBFIELD_TYPES;
   *  the ADDRESS/MONEY presets also use COUNTRY/CURRENCY (managed pickers). */
  type: AttributeType;
  sortOrder: number;
};

/** One record of an object value = a map of sub-field key → value. */
export type ObjectRecord = Record<string, unknown>;

// ── Presets (fixed single-record composites on top of the object storage) ──────────

export const ADDRESS_FIELDS: ObjectFieldDef[] = [
  { key: "line1", label: "Address line 1", type: AttributeType.TEXT, sortOrder: 0 },
  { key: "line2", label: "Address line 2", type: AttributeType.TEXT, sortOrder: 1 },
  { key: "city", label: "City", type: AttributeType.TEXT, sortOrder: 2 },
  { key: "region", label: "State / Region", type: AttributeType.TEXT, sortOrder: 3 },
  { key: "postalCode", label: "Postal code", type: AttributeType.TEXT, sortOrder: 4 },
  { key: "country", label: "Country", type: AttributeType.COUNTRY, sortOrder: 5 },
];

export const MONEY_FIELDS: ObjectFieldDef[] = [
  { key: "amount", label: "Amount", type: AttributeType.NUMBER, sortOrder: 0 },
  { key: "currency", label: "Currency", type: AttributeType.CURRENCY, sortOrder: 1 },
];

/** OBJECT + its single-record presets all use the object-row storage (value = array of records). */
export function isObjectLike(type: AttributeType): boolean {
  return type === AttributeType.OBJECT || type === AttributeType.ADDRESS || type === AttributeType.MONEY;
}

/** ADDRESS/MONEY render as a single record (no add/remove), unlike the repeatable OBJECT. */
export function isSingleRecordObject(type: AttributeType): boolean {
  return type === AttributeType.ADDRESS || type === AttributeType.MONEY;
}

/** Sub-field schema for any object-like type: presets are fixed, OBJECT parses its stored template. */
export function getObjectSchema(type: AttributeType, objectFieldsJson?: string | null): ObjectFieldDef[] {
  if (type === AttributeType.ADDRESS) return ADDRESS_FIELDS;
  if (type === AttributeType.MONEY) return MONEY_FIELDS;
  if (type === AttributeType.OBJECT) return parseObjectFields(objectFieldsJson);
  return [];
}

/** Parse the raw `attributes.object_fields` JSON string (from the backend) into a typed schema. */
export function parseObjectFields(json: string | null | undefined): ObjectFieldDef[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((f) => f && typeof f.key === "string")
      .map((f, i): ObjectFieldDef => ({
        key: String(f.key),
        label: typeof f.label === "string" && f.label.trim() ? f.label : String(f.key),
        type: OBJECT_SUBFIELD_TYPES.includes(f.type) ? f.type : AttributeType.TEXT,
        sortOrder: typeof f.sortOrder === "number" ? f.sortOrder : i,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

/** Serialize the schema back to the JSON string the backend stores. */
export function serializeObjectFields(fields: ObjectFieldDef[]): string {
  return JSON.stringify(
    fields.map((f, i) => ({ key: f.key, label: f.label, type: f.type, sortOrder: i })),
  );
}

/** Derive a stable, unique sub-field key from a label. */
export function keyFromLabel(label: string, existingKeys: string[]): string {
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "field";
  let key = base;
  let n = 1;
  while (existingKeys.includes(key)) key = `${base}_${++n}`;
  return key;
}
