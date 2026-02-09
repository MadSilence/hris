export type UpdateLegalEntityRequest = {
  id: string;
  name?: string;
  description?: string;
  registrationNumber?: string;
  taxId?: string;
  country?: string;
  city?: string;
  street?: string;
  building?: string;
  postCode?: string;
};
