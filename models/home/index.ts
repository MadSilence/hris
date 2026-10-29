/** Home's two reads of its own (`HOME_AND_SEARCH_DESIGN.md` § 4.1). Every other widget reads its module's endpoint. */

export type WhosOutRange = "TODAY" | "WEEK";
export type WhosOutAudience = "TEAM" | "EVERYONE";

/**
 * One absence on Who's Out. The leave type, its colour and the request link are the board's disclosure rule,
 * passed on as they are: **absent means "not for you"**, and the card draws "Time off" without them.
 */
export type WhosOutPerson = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  /** Trimmed to the first and last day of the window the person would have worked. */
  startDate: string;
  endDate: string;
  status: "APPROVED" | "PENDING" | "CANCELLATION_PENDING" | string;
  leaveTypeName?: string;
  leaveTypeColor?: string;
  requestId?: string;
};

export type WhosOut = {
  range: WhosOutRange;
  audience: WhosOutAudience;
  from: string;
  to: string;
  /** Whether the reader belongs to a team or a department at all. */
  hasTeam: boolean;
  people: WhosOutPerson[];
  /** Rows the cap left out. */
  more: number;
};

export type CelebrationKind = "BIRTHDAY" | "ANNIVERSARY" | "NEW_JOINER";
/** SHOWN: in the list. HIDDEN: the reader may not see the field for everyone. OFF: no field named. */
export type CelebrationVisibility = "SHOWN" | "HIDDEN" | "OFF";

export type Celebration = {
  kind: CelebrationKind;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  /** This window's occurrence — never a birth year. */
  date: string;
  /** Anniversaries only. */
  years?: number;
};

export type Celebrations = {
  from: string;
  to: string;
  birthdays: CelebrationVisibility;
  birthdayFieldName: string | null;
  hireDates: CelebrationVisibility;
  items: Celebration[];
};

/** One widget in a person's own arrangement of home (H2). */
export type HomeWidgetPlacement = { id: string; hidden: boolean };
