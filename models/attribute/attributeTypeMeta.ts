import { AttributeType } from "@/models/attribute/AttributeType";

/**
 * Types an admin may pick when creating a custom attribute. Deliberately an allow-list, not
 * `Object.values(AttributeType)`: the enum also carries types that only system fields use
 * (REFERENCE), and deriving the picker from the enum silently offered every new type the moment
 * it was added.
 */
export const ATTRIBUTE_TYPES_CREATABLE: AttributeType[] = [
  AttributeType.TEXT,
  AttributeType.LONG_TEXT,
  AttributeType.SELECT,
  AttributeType.MULTI_SELECT,
  AttributeType.NUMBER,
  AttributeType.DATE,
  AttributeType.CHECKBOX,
  AttributeType.EMAIL,
  AttributeType.URL,
  AttributeType.PHONE,
  AttributeType.PERSON,
  AttributeType.COUNTRY,
  AttributeType.LANGUAGE,
  AttributeType.TIMEZONE,
  AttributeType.CURRENCY,
  AttributeType.MONEY,
  AttributeType.ADDRESS,
  AttributeType.OBJECT,
];

/** @deprecated Use ATTRIBUTE_TYPES_CREATABLE for pickers. Kept as the full enum listing. */
export const ALL_ATTRIBUTE_TYPES = Object.values(AttributeType) as AttributeType[];

// Uniqueness is enforced on `user_attribute_values.string_value` (app check + the partial unique
// index `ux_uav_unique_string`), so only types stored as a string can be unique. NUMBER lands in
// int_value/dec_value and was never actually enforced — offering it here was a lie.
export const ATTRIBUTE_TYPES_UNIQUE = new Set<AttributeType>([
  AttributeType.URL,
  AttributeType.EMAIL,
  AttributeType.TEXT,
  AttributeType.PHONE,
]);

export const ATTRIBUTE_TYPES_WITH_OPTIONS = new Set<AttributeType>([
  AttributeType.SELECT,
  AttributeType.MULTI_SELECT,
]);

// String-backed types that carry length + pattern constraints (mirrors the TEXT/EMAIL/URL/PHONE
// branch of the server-side `UserAttributeValueWriter.validateScalar`).
export const ATTRIBUTE_TYPES_TEXT_CONSTRAINED = new Set<AttributeType>([
  AttributeType.TEXT,
  AttributeType.EMAIL,
  AttributeType.URL,
  AttributeType.PHONE,
]);

export const isUniqueType = (t: AttributeType) => ATTRIBUTE_TYPES_UNIQUE.has(t);
export const isOptionsType = (t: AttributeType) => ATTRIBUTE_TYPES_WITH_OPTIONS.has(t);
export const isTextConstrainedType = (t: AttributeType) => ATTRIBUTE_TYPES_TEXT_CONSTRAINED.has(t);

/**
 * Types whose editor offers a `defaultValue`. The profile prefills empty fields from it, so the two
 * sides have to agree — an option-backed type has no unambiguous string default (the value stored
 * is an option id), which is why SELECT/MULTI_SELECT are absent.
 */
export const hasDefaultValueSupport = (t: AttributeType) =>
  t === AttributeType.NUMBER || t === AttributeType.DATE || isTextConstrainedType(t);
