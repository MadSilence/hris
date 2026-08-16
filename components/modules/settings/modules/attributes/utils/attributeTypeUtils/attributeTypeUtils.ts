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
    default:
      return String(attributeType);
  }
};
