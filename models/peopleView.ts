import type { FilterDTO } from "@/models/user/fields";

export type ViewSort = { fieldId: string; dir: "asc" | "desc" } | null;

export type ViewPayload = {
  columns: string[];
  filters: FilterDTO[];
  sort: ViewSort;
};

export type PeopleView = {
  id: string;
  name: string;
  payload: ViewPayload;
  createdAt?: string;
  updatedAt?: string;
};

export type SharedView = {
  payload: ViewPayload;
};
