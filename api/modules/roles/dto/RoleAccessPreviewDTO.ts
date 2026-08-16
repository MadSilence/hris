/** What a chosen combination of roles actually grants — the union, not a list of the roles. */
export type RoleAccessPreviewDTO = {
  /** One of the roles is the owner role: everything is granted and the lists stay empty. */
  systemOwner: boolean;
  permissions: RoleAccessPreviewResource[];
  fields: RoleAccessPreviewField[];
};

export type RoleAccessPreviewResource = {
  resourceCode: string;
  label: string;
  action: string;
  scopes: string[];
};

export type RoleAccessPreviewField = {
  fieldKey: string;
  label: string;
  source: "system" | "custom";
  action: string;
  scopes: string[];
};
