import type { FilterDTO } from "@/models/user/fields";

export type ViewSort = { fieldId: string; dir: "asc" | "desc" } | null;

export type ViewPayload = {
  columns: string[];
  filters: FilterDTO[];
  sort: ViewSort;
};

/** What the reader may do with a view: their own, or shared with them to edit or to view. */
export type PeopleViewAccess = "OWNER" | "EDIT" | "VIEW";

export type PeopleView = {
  id: string;
  name: string;
  /** Already stripped by the server to what this reader may see. */
  payload: ViewPayload;
  createdAt?: string;
  updatedAt?: string;
  ownerUserId?: string;
  ownerName?: string | null;
  access?: PeopleViewAccess;
  /** How many fields of the definition the server took out for this reader. The ids are not sent. */
  hiddenFieldCount?: number;
};

export type ShareGranteeType = "PERSON" | "TEAM" | "DEPARTMENT" | "ROLE";

export type SharePermission = "VIEW" | "EDIT";

export type ShareGrantee = {
  granteeType: ShareGranteeType;
  granteeId: string;
  permission: SharePermission;
};

export type PeopleViewShare = {
  id: string;
  granteeType: ShareGranteeType;
  granteeId: string;
  /** Null when the person, team, department or role no longer exists. */
  granteeName: string | null;
  permission: SharePermission;
  createdAt?: string;
};

export type SharePreviewHiddenField = {
  fieldId: string;
  label: string;
  peopleCount: number;
  sampleNames: string[];
};

export type SharePreview = {
  recipientCount: number;
  noPeopleAccessCount: number;
  hiddenFields: SharePreviewHiddenField[];
};
