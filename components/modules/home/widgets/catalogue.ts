import type React from "react";
import type { Messages } from "@/i18n/messages";
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

type HomeWidgetName = keyof Messages["home"]["widgets"];
export type HomeWidgetTextKey = `widgets.${HomeWidgetName}.${"title" | "description"}`;

export type HomeWidgetDefinition = {
  /** Stored in the person's arrangement — renaming one resets that widget to its default place. */
  id: string;
  /** Its title, a key of the `home` catalogue. */
  titleKey: HomeWidgetTextKey;
  /** What the widget is, in Customize — a key of the `home` catalogue. */
  descriptionKey: HomeWidgetTextKey;
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
    titleKey: "widgets.waitingOnYou.title",
    descriptionKey: "widgets.waitingOnYou.description",
    group: "PERSONAL",
    isAvailable: can("PEOPLE.TIME_OFF", "VIEW"),
    Component: WaitingOnYouWidget,
  },
  {
    id: "my-tasks",
    titleKey: "widgets.myTasks.title",
    descriptionKey: "widgets.myTasks.description",
    group: "PERSONAL",
    isAvailable: everyone,
    Component: MyTasksWidget,
  },
  {
    id: "my-time-off",
    titleKey: "widgets.myTimeOff.title",
    descriptionKey: "widgets.myTimeOff.description",
    group: "PERSONAL",
    isAvailable: can("PEOPLE.TIME_OFF", "VIEW"),
    Component: MyLeaveWidget,
  },
  {
    id: "whos-out",
    titleKey: "widgets.whosOut.title",
    descriptionKey: "widgets.whosOut.description",
    group: "COMPANY",
    isAvailable: can("PEOPLE.CALENDAR", "VIEW"),
    Component: WhosOutWidget,
  },
  {
    id: "celebrations",
    titleKey: "widgets.celebrations.title",
    descriptionKey: "widgets.celebrations.description",
    group: "COMPANY",
    isAvailable: can("PEOPLE.PROFILE", "VIEW"),
    Component: CelebrationsWidget,
  },
  {
    id: "upcoming-holidays",
    titleKey: "widgets.upcomingHolidays.title",
    descriptionKey: "widgets.upcomingHolidays.description",
    group: "COMPANY",
    isAvailable: everyone,
    Component: UpcomingHolidaysWidget,
  },
  {
    id: "processes",
    titleKey: "widgets.processes.title",
    descriptionKey: "widgets.processes.description",
    group: "HR",
    isAvailable: can("PEOPLE.LIFECYCLE_PROCESSES", "VIEW"),
    Component: ProcessesWidget,
  },
  {
    id: "automations",
    titleKey: "widgets.automations.title",
    descriptionKey: "widgets.automations.description",
    group: "HR",
    isAvailable: can("SETTINGS.AUTOMATIONS", "VIEW"),
    Component: AutomationsWidget,
  },
  {
    id: "quick-actions",
    titleKey: "widgets.quickActions.title",
    descriptionKey: "widgets.quickActions.description",
    group: "UTILITIES",
    isAvailable: (access) =>
      canAccess({ access, resource: "PEOPLE.TIME_OFF", action: "EDIT" })
      || canAccess({ access, resource: "PEOPLE.ATTENDANCE", action: "EDIT" }),
    Component: QuickActionsWidget,
  },
  {
    id: "company-time",
    titleKey: "widgets.companyTime.title",
    descriptionKey: "widgets.companyTime.description",
    group: "UTILITIES",
    isAvailable: everyone,
    Component: ClockWidget,
  },
];

export const availableWidgets = (access: EffectiveAccess | null) =>
  HOME_WIDGETS.filter((widget) => widget.isAvailable(access));
