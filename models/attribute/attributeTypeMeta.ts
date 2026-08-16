import { AttributeType } from "@/models/attribute/AttributeType";

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
