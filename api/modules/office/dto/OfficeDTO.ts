export type OfficeDTO = {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  isSystem: boolean;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};
