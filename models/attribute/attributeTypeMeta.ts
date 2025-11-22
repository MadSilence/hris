import { AttributeType } from "@/models/attribute/AttributeType";

export const ALL_ATTRIBUTE_TYPES = Object.values(AttributeType) as AttributeType[];

export const ATTRIBUTE_TYPES_UNIQUE = new Set<AttributeType>([
  AttributeType.URL,
  AttributeType.EMAIL,
  AttributeType.TEXT,
  AttributeType.NUMBER,
]);

export const ATTRIBUTE_TYPES_WITH_OPTIONS = new Set<AttributeType>([
  AttributeType.SELECT,
  AttributeType.MULTI_SELECT,
  AttributeType.STATUS,
]);

export const isUniqueType = (t: AttributeType) => ATTRIBUTE_TYPES_UNIQUE.has(t);
export const isOptionsType = (t: AttributeType) => ATTRIBUTE_TYPES_WITH_OPTIONS.has(t);
