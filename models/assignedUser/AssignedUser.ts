export type AssignedUserCalendarRef = { id: string; name: string };

export type AssignedUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  avatarUrl?: string | null;
  jobName?: string | null;
  status: string;
  calendars?: AssignedUserCalendarRef[] | null;
};

export type AssignedUsersPage = {
  items: AssignedUser[];
  nextCursor?: string | null;
  total: number;
};
