import { AttributeType } from "@/models/attribute";

export type OptionDTO = {
  id: string;
  value: string;
};

export type FieldDTO = {
  id: string;
  key: string;
  label: string;
  type: AttributeType;
  isSystem: boolean;
  level: "NONE" | "READ" | "EDIT" | "ADMIN";
  options?: OptionDTO[] | null;
};

export type FilterDTO = {
  field: string;
  op: "eq" | "neq" | "contains" | "starts_with" | "in" | "has_any" | "before" | "after" | "between";
  value?: string | null;
  valueTo?: string | null;
  values?: string[] | null;
};

export type UsersSearchRequest = {
  limit?: number;
  cursor?: string | null;
  q?: string | null;
  sortField?: string | null;
  sortDir?: "asc" | "desc" | null;
  selectedFields?: string[] | null;
  filters?: FilterDTO[] | null;
};

export type UsersSearchItemDTO = {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  isEmailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  custom?: Record<string, unknown>;
};

export type UsersSearchResponseDTO = {
  items: UsersSearchItemDTO[];
  nextCursor?: string | null;
};
