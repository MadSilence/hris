export type CreateOfficeRequest = {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;
};
