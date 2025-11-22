import { AttributeType } from "@/models/attribute";

export const getAttributeTypeLabel = (attributeType: AttributeType): string => {
  switch (attributeType) {
    case AttributeType.TEXT:
      return "Text";
    case AttributeType.SELECT:
      return "Select";
    case AttributeType.STATUS:
      return "Status";
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
    default:
      return String(attributeType);
  }
};
