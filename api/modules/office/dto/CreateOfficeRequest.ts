export type CreateOfficeRequest = {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  /** A remote office needs only its country; the backend refuses a missing address otherwise (O00009). */
  isRemote?: boolean;
  country: string;
  city?: string;
  street?: string;
  building?: string;
  postCode?: string;
};
