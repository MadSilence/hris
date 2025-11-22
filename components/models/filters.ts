export type FilterOp =
  | "eq" | "neq" | "contains" | "starts_with"
  | "in" | "before" | "after" | "between";

export type Filter = {
  field: "first_name" | "last_name" | "email" | "status" | "created_at" | "updated_at" | "is_email_verified";
  op: FilterOp;
  value?: string;     // ISO для дат, "true"/"false" для boolean
  valueTo?: string;   // для between
  values?: string[];  // для in
};
