export type RoleDTO = {
  id: string;
  name: string;
  description?: string;
  systemOwner: boolean;
  isDefault: boolean;
  active: boolean;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
};
