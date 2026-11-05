import { AttributeType } from "@/models/attribute";

export const getAttributeTypeLabel = (attributeType: AttributeType): string => {
  switch (attributeType) {
    case AttributeType.TEXT:
      return "Text";
    case AttributeType.LONG_TEXT:
      return "Long text";
    case AttributeType.SELECT:
      return "Select";
    case AttributeType.PERSON:
      return "Person";
    case AttributeType.CHECKBOX:
      return "Checkbox";
    case AttributeType.NUMBER:
      return "Number";
    case AttributeType.MULTI_SELECT:
      return "Multi select";
    case AttributeType.DATE:
      return "Date";
    case AttributeType.EMAIL:
      return "Email";
    case AttributeType.URL:
      return "URL";
    case AttributeType.PHONE:
      return "Phone";
    case AttributeType.COUNTRY:
      return "Country";
    case AttributeType.LANGUAGE:
      return "Language";
    case AttributeType.TIMEZONE:
      return "Timezone";
    case AttributeType.CURRENCY:
      return "Currency";
    case AttributeType.OBJECT:
      return "Object";
    case AttributeType.ADDRESS:
      return "Address";
    case AttributeType.MONEY:
      return "Money";
    case AttributeType.REFERENCE:
      return "Reference";
    default:
      return String(attributeType);
  }
};

/**
 * The catalogue key of a type's label in the `settings` namespace — what a screen shows
 * (`t(attributeTypeLabelKey(type))`). `getAttributeTypeLabel` stays the English name for code that is not a screen.
 */
const ATTRIBUTE_TYPE_LABEL_KEYS = {
  [AttributeType.TEXT]: "attributes.types.text",
  [AttributeType.LONG_TEXT]: "attributes.types.longText",
  [AttributeType.SELECT]: "attributes.types.select",
  [AttributeType.PERSON]: "attributes.types.person",
  [AttributeType.CHECKBOX]: "attributes.types.checkbox",
  [AttributeType.NUMBER]: "attributes.types.number",
  [AttributeType.MULTI_SELECT]: "attributes.types.multiSelect",
  [AttributeType.DATE]: "attributes.types.date",
  [AttributeType.EMAIL]: "attributes.types.email",
  [AttributeType.URL]: "attributes.types.url",
  [AttributeType.PHONE]: "attributes.types.phone",
  [AttributeType.COUNTRY]: "attributes.types.country",
  [AttributeType.LANGUAGE]: "attributes.types.language",
  [AttributeType.TIMEZONE]: "attributes.types.timezone",
  [AttributeType.CURRENCY]: "attributes.types.currency",
  [AttributeType.OBJECT]: "attributes.types.object",
  [AttributeType.ADDRESS]: "attributes.types.address",
  [AttributeType.MONEY]: "attributes.types.money",
  [AttributeType.REFERENCE]: "attributes.types.reference",
} as const satisfies Record<AttributeType, string>;

export const attributeTypeLabelKey = (attributeType: AttributeType) => ATTRIBUTE_TYPE_LABEL_KEYS[attributeType];
