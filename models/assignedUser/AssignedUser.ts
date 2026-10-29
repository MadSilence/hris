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
  /**
   * The reader sees only part of the roster: a unit's list of people answers to the people grant and
   * its scope, like the directory — so `total` can be larger than what is listed, down to none.
   */
  limited?: boolean;
};
