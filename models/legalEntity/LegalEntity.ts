export type LegalEntity = {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  archived: boolean;
  archivedAt?: string | null;
  registrationNumber?: string;
  taxId?: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;
  assignedUsersCount?: number;
};
