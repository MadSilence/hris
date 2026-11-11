/** Home's two reads of its own (`HOME_AND_SEARCH.md` §§ 4–5). Every other widget reads its module's endpoint. */

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
  policyName?: string;
  policyColor?: string;
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

/** A widget's size on Home's grid: Small 1 × 1, Medium 1 × 2, Large 2 × 2 (the home redesign). */
export type HomeWidgetSize = "S" | "M" | "L";

/** One widget in a person's own arrangement of home, in their order; `size` null is the widget's default. */
export type HomeWidgetPlacement = { id: string; hidden: boolean; size?: HomeWidgetSize | null };

/** Home's header: the accent band (`COLOUR`, the default) or plain white (`LIGHT`). */
export type HomeHeaderStyle = "COLOUR" | "LIGHT";

/** One day of the automations week on Home: the runs that finished that day. */
export type AutomationRunDay = { date: string; done: number; failed: number; skipped: number };

/** A person on a run, as the automations module shows them. */
type RunPerson = { id: string; name: string | null; avatarUrl?: string | null } | null;

/** A failed run on Home: which automation, about whom, and why. */
export type AutomationsWeekRun = { id: string; ruleId: string; ruleName: string | null; person: RunPerson; reason: string | null };

/** Home's automations week (`GET /automations/runs/week`): seven days, oldest first and today last. */
export type AutomationsWeek = {
  days: AutomationRunDay[];
  failedToday: AutomationsWeekRun[];
  failedTodayCount: number;
  next: { ruleId: string; ruleName: string | null; date: string | null; person: RunPerson } | null;
};
