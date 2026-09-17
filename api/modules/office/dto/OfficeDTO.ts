export type OfficeDTO = {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  isSystem: boolean;
  archived: boolean;
  archivedAt?: string | null;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;
  assignedUsersCount?: number;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  /** Sent back by the edit form; the backend refuses a save over a newer row (E00409). */
  version?: number;
};
