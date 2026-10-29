import type React from "react";
import { canAccess, type EffectiveAccess } from "@/models/access";
import type { HomeGroup } from "@/components/modules/home/layout";
import { WaitingOnYouWidget } from "./WaitingOnYouWidget";
import { MyTasksWidget } from "./MyTasksWidget";
import { MyLeaveWidget } from "./MyLeaveWidget";
import { WhosOutWidget } from "./WhosOutWidget";
import { CelebrationsWidget } from "./CelebrationsWidget";
import { UpcomingHolidaysWidget } from "./UpcomingHolidaysWidget";
import { ProcessesWidget } from "./ProcessesWidget";
import { AutomationsWidget } from "./AutomationsWidget";
import { QuickActionsWidget } from "./QuickActionsWidget";
import { ClockWidget } from "./ClockWidget";

export type HomeWidgetDefinition = {
  /** Stored in the person's arrangement — renaming one resets that widget to its default place. */
  id: string;
  title: string;
  /** What the widget is, in Customize. */
  description: string;
  group: HomeGroup;
  /**
   * Whether this reader may see it — the same grant the widget's own endpoint checks. UX only: the endpoint
   * refuses on its own, and a widget refused here is never drawn, never queried and never offered.
   */
  isAvailable: (access: EffectiveAccess | null) => boolean;
  Component: React.FC;
};

const everyone = () => true;
const can = (resource: Parameters<typeof canAccess>[0]["resource"], action: Parameters<typeof canAccess>[0]["action"]) =>
  (access: EffectiveAccess | null) => canAccess({ access, resource, action });

/**
 * Home's catalogue (sitting 2, H3), in its default order. Entertainment is post-MVP and recruiting has no
 * module, so neither is here.
 */
export const HOME_WIDGETS: HomeWidgetDefinition[] = [
  {
    id: "waiting-on-you",
    title: "Waiting on You",
    description: "Leave requests waiting for your decision. Shown only while something waits.",
    group: "PERSONAL",
    isAvailable: can("PEOPLE.TIME_OFF", "VIEW"),
    Component: WaitingOnYouWidget,
  },
  {
    id: "my-tasks",
    title: "My Tasks",
    description: "Open tasks assigned to you.",
    group: "PERSONAL",
    isAvailable: everyone,
    Component: MyTasksWidget,
  },
  {
    id: "my-time-off",
    title: "My Time Off",
    description: "What is left on your policies, and your next leave.",
    group: "PERSONAL",
    isAvailable: can("PEOPLE.TIME_OFF", "VIEW"),
    Component: MyLeaveWidget,
  },
  {
    id: "whos-out",
    title: "Who's Out",
    description: "Who is away today or this week, in your team or the whole company.",
    group: "COMPANY",
    isAvailable: can("PEOPLE.CALENDAR", "VIEW"),
    Component: WhosOutWidget,
  },
  {
    id: "celebrations",
    title: "Celebrations",
    description: "Birthdays, work anniversaries and new joiners.",
    group: "COMPANY",
    isAvailable: can("PEOPLE.PROFILE", "VIEW"),
    Component: CelebrationsWidget,
  },
  {
    id: "upcoming-holidays",
    title: "Upcoming Holidays",
    description: "Your next public holidays.",
    group: "COMPANY",
    isAvailable: everyone,
    Component: UpcomingHolidaysWidget,
  },
  {
    id: "processes",
    title: "Processes in Progress",
    description: "Onboarding and preboarding in flight.",
    group: "HR",
    isAvailable: can("PEOPLE.LIFECYCLE_PROCESSES", "VIEW"),
    Component: ProcessesWidget,
  },
  {
    id: "automations",
    title: "Automations",
    description: "How the company's automations are running, and which need a look.",
    group: "HR",
    isAvailable: can("SETTINGS.AUTOMATIONS", "VIEW"),
    Component: AutomationsWidget,
  },
  {
    id: "quick-actions",
    title: "Quick Actions",
    description: "Request time off or log time in one click.",
    group: "UTILITIES",
    isAvailable: (access) =>
      canAccess({ access, resource: "PEOPLE.TIME_OFF", action: "EDIT" })
      || canAccess({ access, resource: "PEOPLE.ATTENDANCE", action: "EDIT" }),
    Component: QuickActionsWidget,
  },
  {
    id: "company-time",
    title: "Company Time",
    description: "The company's local time.",
    group: "UTILITIES",
    isAvailable: everyone,
    Component: ClockWidget,
  },
];

export const availableWidgets = (access: EffectiveAccess | null) =>
  HOME_WIDGETS.filter((widget) => widget.isAvailable(access));
