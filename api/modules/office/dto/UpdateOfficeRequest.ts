export type UpdateOfficeRequest = {
  id: string;
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  street?: string;
  building?: string;
  postCode?: string;
  /** A remote office (people working anywhere in its country). Absent leaves it as it is. */
  isRemote?: boolean;
  /** The version the form was opened with. */
  version?: number;
};
