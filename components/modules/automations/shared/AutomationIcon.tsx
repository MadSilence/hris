"use client";

import * as React from "react";
import {
  Award01Icon,
  BeachIcon,
  BirthdayCakeIcon,
  Briefcase01Icon,
  Building03Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  ComputerIcon,
  File01Icon,
  FlashIcon,
  GiftIcon,
  GitBranchIcon,
  HourglassIcon,
  Logout01Icon,
  Mail01Icon,
  Notification01Icon,
  PencilEdit02Icon,
  RepeatIcon,
  ShieldCheckIcon,
  SignatureIcon,
  StarIcon,
  Sun03Icon,
  TaskDone01Icon,
  ThermometerIcon,
  UserAdd01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { Icon, type IconSvgElement } from "@/components/desact/icon";
import type { AutomationIconProps } from "@/components/modules/automations/contracts";
import type { AutomationStepType, TriggerSpec } from "@/models/automations";

/**
 * The icons an automation may wear — its `icon` is one of these codes. A small set on purpose: the tile on a card
 * says what kind of thing the automation is about, not which one it is.
 */
export const AUTOMATION_ICONS = {
  "user-add": UserAdd01Icon,
  users: UserGroupIcon,
  calendar: Calendar03Icon,
  flash: FlashIcon,
  clock: Clock01Icon,
  repeat: RepeatIcon,
  sun: Sun03Icon,
  beach: BeachIcon,
  thermometer: ThermometerIcon,
  document: File01Icon,
  signature: SignatureIcon,
  computer: ComputerIcon,
  briefcase: Briefcase01Icon,
  building: Building03Icon,
  mail: Mail01Icon,
  bell: Notification01Icon,
  task: TaskDone01Icon,
  shield: ShieldCheckIcon,
  edit: PencilEdit02Icon,
  cake: BirthdayCakeIcon,
  gift: GiftIcon,
  award: Award01Icon,
  star: StarIcon,
  logout: Logout01Icon,
} as const satisfies Record<string, IconSvgElement>;

export type AutomationIconCode = keyof typeof AUTOMATION_ICONS;

export const isAutomationIconCode = (code: string | null | undefined): code is AutomationIconCode =>
  Boolean(code) && Object.prototype.hasOwnProperty.call(AUTOMATION_ICONS, code as string);

/** The icon an automation has before anybody picks one: what its trigger is about. */
export const defaultIconFor = (trigger: TriggerSpec | null | undefined): AutomationIconCode => {
  if (!trigger) return "flash";
  switch (trigger.type) {
    case "PERSON_HIRED":
      return "user-add";
    case "TERMINATION_SCHEDULED":
    case "LAST_WORKING_DAY_ARRIVES":
      return "logout";
    case "DATE_OFFSET":
      return trigger.field === "DATE_OF_BIRTH" ? "cake" : "calendar";
    case "JOINS_SEGMENT":
      return "users";
    case "FIELD_CHANGED":
      return "edit";
    case "EVENT":
      return trigger.event === "PROCESS_COMPLETED" ? "task" : "beach";
    case "SCHEDULE":
      return "repeat";
  }
};

/** The 16 px icon before a "Starts when" line: a date, a schedule, or an event. */
export const triggerLineIcon = (trigger: TriggerSpec | null | undefined): IconSvgElement => {
  if (trigger?.type === "DATE_OFFSET") return Calendar03Icon;
  if (trigger?.type === "SCHEDULE") return Clock01Icon;
  return FlashIcon;
};

/** The icon of a step's kind, for a line that says what an automation does. */
export const STEP_TYPE_ICONS: Record<AutomationStepType, IconSvgElement> = {
  NOTIFY: Notification01Icon,
  SEND_EMAIL: Mail01Icon,
  CREATE_TASK: CheckmarkCircle02Icon,
  ASSIGN: UserAdd01Icon,
  UNASSIGN: UserAdd01Icon,
  GRANT_TIME_OFF_POLICY: BeachIcon,
  START_REVIEW: StarIcon,
  WAIT_UNTIL: HourglassIcon,
  REQUEST_APPROVAL: ShieldCheckIcon,
  SPLIT: GitBranchIcon,
  SIGN_DOCUMENT: SignatureIcon,
  SEND_SURVEY: File01Icon,
};

/** An automation's icon: its own code, else its trigger's. Decoration — the name beside it says what it is. */
export const AutomationIcon: React.FC<AutomationIconProps & { className?: string }> = ({ icon, trigger, size = 20, className }) => {
  const code = isAutomationIconCode(icon) ? icon : defaultIconFor(trigger);
  return <Icon icon={AUTOMATION_ICONS[code]} size={size === 16 ? "sm" : "md"} className={className} />;
};
