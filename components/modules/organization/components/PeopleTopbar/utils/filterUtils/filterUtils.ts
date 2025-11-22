import { Operator } from "@/models/filters/operator";

export const getFilterLabel = (operator: Operator): string => {
  switch (operator) {
    case Operator.CONTAINS:
      return "Contains";
    case Operator.STARTS_WITH:
      return "Starts with";
    case Operator.EQUALS:
      return "Equals";
    case Operator.NOT_EQUALS:
      return "Not equals";
    case Operator.IN:
      return "In list";
    case Operator.NOT_IN:
      return "Not in list";
    case Operator.GREATER_THAN:
      return "Greater than";
    case Operator.LESS_THAN:
      return "Less than";
    case Operator.GREATER_OR_EQUAL:
      return "Greater or equal";
    case Operator.LESS_OR_EQUAL:
      return "Less or equal";
    case Operator.BEFORE:
      return "Before";
    case Operator.AFTER:
      return "After";
    case Operator.BETWEEN:
      return "Between";
    case Operator.IS_TRUE:
      return "Is true";
    case Operator.IS_FALSE:
      return "Is false";
    default:
      return String(operator);
  }
};
