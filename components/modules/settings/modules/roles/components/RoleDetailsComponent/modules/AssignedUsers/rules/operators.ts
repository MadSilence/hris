export type OperatorId =
  | "eq"
  | "in"
  | "has_any"
  | "contains"
  | "gt"
  | "lt"
  | "between"
  | "before"
  | "after";

export const OP_LABEL: Record<OperatorId, string> = {
  eq: "Equals",
  in: "In list",
  has_any: "Has any",
  contains: "Contains",
  gt: "Greater than",
  lt: "Less than",
  between: "Between",
  before: "Before",
  after: "After",
};

export type AttributeKind =
  | "TEXT"
  | "SELECT"
  | "STATUS"
  | "PERSON"
  | "CHECKBOX"
  | "NUMBER"
  | "MULTI_SELECT"
  | "DATE"
  | "EMAIL"
  | "URL";

export const OPS_BY_TYPE: Record<AttributeKind, OperatorId[]> = {
  SELECT: ["eq", "in"],
  STATUS: ["eq", "in"],
  MULTI_SELECT: ["has_any"],
  CHECKBOX: ["eq"],
  TEXT: ["contains", "eq"],
  EMAIL: ["contains", "eq"],
  URL: ["contains", "eq"],
  NUMBER: ["eq", "gt", "lt", "between"],
  DATE: ["before", "after", "between"],
  PERSON: ["eq"],
};
