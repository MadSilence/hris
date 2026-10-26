export type OfficeDTO = {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  isSystem: boolean;
  archived: boolean;
  archivedAt?: string | null;
  isRemote?: boolean;
  country: string;
  /** Null for a remote office that has no postal address. */
  city?: string | null;
  street?: string | null;
  building?: string | null;
  postCode?: string | null;
  assignedUsersCount?: number;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  /** Sent back by the edit form; the backend refuses a save over a newer row (E00409). */
  version?: number;
};
