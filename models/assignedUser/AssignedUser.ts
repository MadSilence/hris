// Lean user reference for entity-scoped "assigned people" lists (office, legal entity, …).
export type AssignedUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  avatarUrl?: string | null;
  jobName?: string | null;
  status: string;
};

export type AssignedUsersPage = {
  items: AssignedUser[];
  nextCursor?: string | null;
  total: number;
};
