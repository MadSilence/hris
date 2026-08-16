export type RoleDTO = {
  id: string;
  name: string;
  description?: string;
  systemOwner: boolean;
  isDefault: boolean;
  archived: boolean;
  archivedAt?: string | null;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
};
