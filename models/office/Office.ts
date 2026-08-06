export type Office = {
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
};
