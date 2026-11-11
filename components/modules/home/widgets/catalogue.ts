import type React from "react";
import type { Messages } from "@/i18n/messages";
import { canAccess, isSystemOwner, type EffectiveAccess } from "@/models/access";
import type { HomeWidgetSize } from "@/models/home";
import type { ArrangeableWidget, HomeCategory, HomeRole } from "@/components/modules/home/layout";
import { WaitingOnYouWidget } from "./WaitingOnYouWidget";
import { TimeOffWidget } from "./TimeOffWidget";
import { NextTimeOffWidget } from "./NextTimeOffWidget";
import { WhosOutWidget } from "./WhosOutWidget";
import { ThisWeekWidget } from "./ThisWeekWidget";
import { MyTasksWidget } from "./MyTasksWidget";
import { ProcessesWidget } from "./ProcessesWidget";
import { AutomationsWidget } from "./AutomationsWidget";

type HomeWidgetName = keyof Messages["home"]["widgets"];
export type HomeWidgetTextKey = `widgets.${HomeWidgetName}.${"title" | "description"}`;

/** What every widget is drawn with: its size, and whether it is a preview in Edit home's panel (nothing acts). */
export type HomeWidgetProps = { size: HomeWidgetSize; preview?: boolean };

export type HomeWidgetDefinition = ArrangeableWidget & {
  /** Stored in the person's arrangement — renaming one loses its place and size. */
  id: string;
  titleKey: HomeWidgetTextKey;
  descriptionKey: HomeWidgetTextKey;
  /** Its chip in Edit home's panel. */
  category: HomeCategory;
  /** It cannot be removed in Edit home (Waiting on you, as drawn — `home-edit`, `WidgetEditChrome` "locked"). */
  locked?: boolean;
  /**
   * Whether this reader may see it — the same grant the widget's own reads check. UX only: the endpoints refuse on
   * their own, and a widget refused here is never drawn, never queried and never offered in the panel.
   */
  isAvailable: (access: EffectiveAccess | null) => boolean;
  Component: React.FC<HomeWidgetProps>;
};

const everyone = () => true;
const can = (resource: Parameters<typeof canAccess>[0]["resource"], action: Parameters<typeof canAccess>[0]["action"]) =>
  (access: EffectiveAccess | null) => canAccess({ access, resource, action });

/**
 * Home's widgets (`home-widgets`), less My time and To sign, which the owner left out (DECISIONS.md § "The home
 * redesign"). The ids of the widgets that were on Home before keep their names, so a saved arrangement keeps them.
 */
export const HOME_WIDGETS: HomeWidgetDefinition[] = [
  {
    id: "waiting-on-you",
    titleKey: "widgets.waitingOnYou.title",
    descriptionKey: "widgets.waitingOnYou.description",
    category: "FOR_ME",
    sizes: ["S", "M", "L"],
    defaultSize: "L",
    locked: true,
    // Everyone may be waited on — a task, an approval, a run to look at; each source reads only what it may.
    isAvailable: everyone,
    Component: WaitingOnYouWidget,
  },
  {
    id: "my-time-off",
    titleKey: "widgets.timeOff.title",
    descriptionKey: "widgets.timeOff.description",
    category: "FOR_ME",
    sizes: ["S", "M", "L"],
    defaultSize: "M",
    isAvailable: can("PEOPLE.TIME_OFF", "VIEW"),
    Component: TimeOffWidget,
  },
  {
    id: "next-time-off",
    titleKey: "widgets.nextTimeOff.title",
    descriptionKey: "widgets.nextTimeOff.description",
    category: "FOR_ME",
    sizes: ["S", "M"],
    defaultSize: "S",
    isAvailable: can("PEOPLE.TIME_OFF", "VIEW"),
    Component: NextTimeOffWidget,
  },
  {
    id: "my-tasks",
    titleKey: "widgets.myTasks.title",
    descriptionKey: "widgets.myTasks.description",
    category: "FOR_ME",
    sizes: ["S", "M", "L"],
    defaultSize: "L",
    isAvailable: everyone,
    Component: MyTasksWidget,
  },
  {
    id: "whos-out",
    titleKey: "widgets.whosOut.title",
    descriptionKey: "widgets.whosOut.description",
    category: "MY_TEAM",
    sizes: ["S", "M", "L"],
    defaultSize: "L",
    isAvailable: can("PEOPLE.CALENDAR", "VIEW"),
    Component: WhosOutWidget,
  },
  {
    id: "celebrations",
    titleKey: "widgets.thisWeek.title",
    descriptionKey: "widgets.thisWeek.description",
    category: "COMPANY",
    sizes: ["S", "M", "L"],
    defaultSize: "M",
    isAvailable: can("PEOPLE.PROFILE", "VIEW"),
    Component: ThisWeekWidget,
  },
  {
    id: "processes",
    titleKey: "widgets.processes.title",
    descriptionKey: "widgets.processes.description",
    category: "COMPANY",
    sizes: ["S", "M", "L"],
    defaultSize: "M",
    isAvailable: can("PEOPLE.LIFECYCLE_PROCESSES", "VIEW"),
    Component: ProcessesWidget,
  },
  {
    id: "automations",
    titleKey: "widgets.automations.title",
    descriptionKey: "widgets.automations.description",
    category: "COMPANY",
    sizes: ["S", "M", "L"],
    defaultSize: "M",
    isAvailable: can("SETTINGS.AUTOMATIONS", "VIEW"),
    Component: AutomationsWidget,
  },
];

export const availableWidgets = (access: EffectiveAccess | null) =>
  HOME_WIDGETS.filter((widget) => widget.isAvailable(access));

/**
 * Which default home a reader starts with (`home` spec, "Default layout"): HR runs processes or automations; a manager
 * sees somebody's leave beyond their own — the seeded employee sees every profile but only their own leave, so the
 * profile right would make everyone a manager; everybody else is an employee.
 */
export const homeRoleOf = (access: EffectiveAccess | null): HomeRole => {
  if (!access) return "EMPLOYEE";
  if (isSystemOwner(access)) return "HR";
  if (canAccess({ access, resource: "PEOPLE.LIFECYCLE_PROCESSES", action: "VIEW" })
    || canAccess({ access, resource: "SETTINGS.AUTOMATIONS", action: "VIEW" })) return "HR";
  const leaveScopes = access.permissions?.["PEOPLE.TIME_OFF"]?.VIEW ?? [];
  return leaveScopes.some((scope) => scope !== "SELF") ? "MANAGER" : "EMPLOYEE";
};
