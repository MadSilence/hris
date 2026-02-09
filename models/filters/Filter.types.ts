AttributeType

export type OperatorId =
  | "eq"
  | "neq"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "is_empty"
  | "is_not_empty"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in"
  | "not_in"
  | "is_true"
  | "is_false"
  | "before"
  | "after"
  | "on";

export type OperatorDef = { id: OperatorId; label: string };

export type FilterRule = {
  id: string;
  attributeId?: string;
  attributeType?: AttributeType;
  operator?: OperatorId;
  value?: unknown;
};
