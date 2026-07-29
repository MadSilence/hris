export type LegalEntityDTO = {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  registrationNumber?: string;
  taxId?: string;
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
};
