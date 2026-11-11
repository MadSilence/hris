import type { Messages } from "@/i18n/messages";
import { canAccess, type AccessAction, type AccessScope, type EffectiveAccess, type ResourceCode } from "@/models/access";
import {
  Building03Icon,
  Calendar03Icon,
  Settings01Icon,
  ShieldUserIcon,
  UserGroupIcon,
  WorkflowSquare03Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

/** A right that shows a settings item — for the items a VIEW does not describe. */
export type SettingsGrant = { resource: ResourceCode; action: AccessAction; scope?: AccessScope };

/** A key of the settings menu in the `settings` catalogue (`menu.items.*`, `menu.groups.*`). */
export type SettingsMenuItemKey = `menu.items.${keyof Messages["settings"]["menu"]["items"] & string}`;
export type SettingsMenuGroupKey = `menu.groups.${keyof Messages["settings"]["menu"]["groups"] & string}`;

/**
 * An entry of the menu. It holds the **key** of its label, not the label: whoever renders it translates
 * (`useTranslations("settings")`), since this module runs outside React.
 */
type SettingsMenuEntry = {
  labelKey: SettingsMenuItemKey;
  href: string;
  external?: boolean;
  /** The item shows to a reader who may VIEW any of these. */
  resources?: ResourceCode[];
  /** Instead of `resources`: the item shows to a reader holding any of these rights. */
  grants?: SettingsGrant[];
};

/**
 * Whether the menu offers an item to this reader — UX only; every page asks the backend again. The one
 * check the settings hub, the sidebar's Settings entry and quick search share, so the three cannot disagree.
 */
export const canSeeSettingsItem = (access: EffectiveAccess | null | undefined, item: SettingsMenuEntry): boolean => {
  if (item.grants?.length) return item.grants.some((grant) => canAccess({ access, ...grant }));
  if (!item.resources?.length) return true;
  return item.resources.some((resource) => canAccess({ access, resource, action: "VIEW" }));
};

type SettingsMenuGroup = {
  id: string;
  titleKey: SettingsMenuGroupKey;
  icon?: React.ReactNode;
  items: SettingsMenuEntry[];
};

/** The settings menu — keys only; the hub, the sidebar and quick search translate them. */
export const settingsGroups: SettingsMenuGroup[] = [
  {
    id: "general",
    titleKey: "menu.groups.general",
    icon: <Icon icon={Building03Icon} />,
    items: [
      { labelKey: "menu.items.company", href: "/settings/general/company", resources: ["SETTINGS.GENERAL"] },
      { labelKey: "menu.items.appearance", href: "/settings/general/customisation", resources: ["SETTINGS.GENERAL"] },
      {
        labelKey: "menu.items.legalEntitiesOffices",
        href: "/settings/general/legal-entities",
        resources: ["ORG.LEGAL_ENTITY", "ORG.OFFICE"],
      },
      {
        labelKey: "menu.items.departments",
        href: "/settings/general/departments",
        resources: ["ORG.DEPARTMENT"],
      },
      {
        labelKey: "menu.items.teams",
        href: "/settings/general/teams",
        resources: ["ORG.TEAM"],
      },
      {
        labelKey: "menu.items.jobCatalog",
        href: "/settings/general/job-catalog",
        resources: ["JOBS.FAMILY", "JOBS.LEVEL_GROUP", "JOBS.LEVEL", "JOBS.TITLE"],
      },
      {
        labelKey: "menu.items.importExport",
        href: "/settings/general/import",
        // The rights of the three import kinds (I-B6): whoever may run one finds the page.
        grants: [
          { resource: "PEOPLE.PROFILE", action: "EDIT", scope: "COMPANY" },
          { resource: "ORG.DEPARTMENT", action: "EDIT" },
          { resource: "ORG.TEAM", action: "EDIT" },
          { resource: "PEOPLE.TIME_OFF_POLICIES", action: "EDIT" },
        ],
      },
      {
        labelKey: "menu.items.templates",
        href: "/settings/general/templates",
        resources: ["ROLES.ROLE", "PEOPLE.ATTRIBUTES", "PEOPLE.LIFECYCLE_TEMPLATES"],
      },
    ],
  },
  {
    id: "people",
    titleKey: "menu.groups.people",
    icon: <Icon icon={UserGroupIcon} />,
    items: [
      { labelKey: "menu.items.employeeInformation", href: "/settings/people/attributes", resources: ["PEOPLE.ATTRIBUTES"] },
      { labelKey: "menu.items.rolesAccess", href: "/settings/people/roles", resources: ["ROLES.ROLE"] },
      { labelKey: "menu.items.documents", href: "/settings/people/documents", resources: ["PEOPLE.DOCUMENT_CATEGORIES"] },
    ],
  },
  {
    id: "time",
    titleKey: "menu.groups.time",
    icon: <Icon icon={Calendar03Icon} />,
    items: [
      { labelKey: "menu.items.timeOff", href: "/settings/time/leave-type", resources: ["PEOPLE.TIME_OFF_POLICIES"] },
      {
        labelKey: "menu.items.publicHolidays",
        href: "/settings/time/public-holidays",
        resources: ["ORG.PUBLIC_HOLIDAY_CALENDAR", "ORG.PUBLIC_HOLIDAY_TEMPLATE"],
      },
      { labelKey: "menu.items.attendance", href: "/settings/time/attendance", resources: ["SETTINGS.GENERAL"] },
    ],
  },
  {
    id: "automation",
    titleKey: "menu.groups.automation",
    icon: <Icon icon={WorkflowSquare03Icon} />,
    // Automations themselves left for the main navigation (`/automations`, AUTOMATIONS_REDESIGN_PLAN batch 8).
    items: [
      {
        labelKey: "menu.items.lifecycle",
        href: "/settings/automation/preboarding",
        resources: ["PEOPLE.LIFECYCLE_TEMPLATES", "SETTINGS.GENERAL"],
      },
      { labelKey: "menu.items.approvals", href: "/settings/automation/approvals", resources: ["SETTINGS.GENERAL"] },
      { labelKey: "menu.items.notifications", href: "/settings/automation/notifications", resources: ["SETTINGS.GENERAL"] },
      { labelKey: "menu.items.integrations", href: "/settings/automation/integrations", resources: ["SETTINGS.GENERAL"] },
    ],
  }, {
    id: "tech",
    titleKey: "menu.groups.tech",
    icon: <Icon icon={Settings01Icon} />,
    items: [
      { labelKey: "menu.items.api", href: "/settings/tech/api", resources: ["SETTINGS.GENERAL"] },
      { labelKey: "menu.items.loginSso", href: "/settings/tech/login-and-sso", resources: ["SETTINGS.GENERAL"] },
    ],
  }, {
    id: "admin",
    titleKey: "menu.groups.admin",
    icon: <Icon icon={ShieldUserIcon} />,
    items: [
      { labelKey: "menu.items.logs", href: "/settings/admin/logs", resources: ["SETTINGS.AUDIT_LOG"] },
      { labelKey: "menu.items.subscription", href: "/settings/admin/subscription", resources: ["SETTINGS.GENERAL"] },
      { labelKey: "menu.items.support", href: "/settings/admin/support", resources: ["SETTINGS.GENERAL"] },
    ],
  },
];
