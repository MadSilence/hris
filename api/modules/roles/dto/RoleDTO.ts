export type RoleDTO = {
  id: string;
  name: string;
  description?: string;
  systemOwner: boolean;
  isDefault: boolean;
  /** The mandatory Admin role (A-2): found by this flag, never by its name. */
  isAdmin: boolean;
  archived: boolean;
  archivedAt?: string | null;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
  /** Sent back by the edit form; a stale one is refused with E00409. */
  version?: number;
};
