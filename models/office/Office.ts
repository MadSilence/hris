export type Office = {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  isSystem: boolean;
  archived: boolean;
  archivedAt?: string | null;
  /** A remote office: people working anywhere in its country, bound to that country's holiday calendar. */
  isRemote?: boolean;
  country: string;
  /** Null for a remote office that has no postal address. */
  city?: string | null;
  street?: string | null;
  building?: string | null;
  postCode?: string | null;
  assignedUsersCount?: number;
  /** The row version the edit form sends back, so a save over someone else's change is refused. */
  version?: number;
};
