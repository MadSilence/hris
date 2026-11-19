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
  /** The leave's own first working day, not clipped to the window: a day off that is only today reads "today". */
  firstDay?: string | null;
  /** The leave's own last working day, not clipped to the window (Today's card cuts `endDate` to today). */
  lastDay?: string | null;
  /** The person's next working day after the leave — "back Mon" (widgets O4). */
  backOn?: string | null;
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
  /** WEEK only: leave starting in the two weeks after this one — "Upcoming" under the lanes (H12). */
  upcoming?: WhosOutPerson[];
};

export type CelebrationKind = "BIRTHDAY" | "ANNIVERSARY" | "NEW_JOINER";
/** SHOWN: in the list. HIDDEN: the reader may not see the field for everyone. */
export type CelebrationVisibility = "SHOWN" | "HIDDEN";

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
  /** The person's team, first by name; absent when none or the reader may not see teams (the hub's tiles, B4). */
  teamName?: string | null;
};

export type Celebrations = {
  from: string;
  to: string;
  /** Anniversaries and joiners (`sys:hire_date`). A birthday has no flag: whether it is listed is its person's choice. */
  hireDates: CelebrationVisibility;
  items: Celebration[];
};

/** A widget's size on Home's grid: Small 1 × 1, Medium 1 × 2, Large 2 × 2 (the home redesign). */
export type HomeWidgetSize = "S" | "M" | "L";

/**
 * One widget in a person's own arrangement of home; `size` null is the widget's default. `col` and `row` are the cell
 * it was dropped on in the four-column grid, 1-based — null for an arrangement saved before cells existed, which is
 * placed in its order (the designers' Home fixes, E15: empty cells are allowed).
 */
export type HomeWidgetPlacement = {
  id: string;
  hidden: boolean;
  size?: HomeWidgetSize | null;
  col?: number | null;
  row?: number | null;
};

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
