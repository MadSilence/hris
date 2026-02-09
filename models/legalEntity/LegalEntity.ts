export type LegalEntity = {
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
};
