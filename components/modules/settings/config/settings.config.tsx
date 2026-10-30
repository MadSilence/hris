import { SettingsLinkItem } from "@/components/modules/settings/components/SettingsCard/SettingsCard";
import { canAccess, type AccessAction, type AccessScope, type EffectiveAccess, type ResourceCode } from "@/models/access";
import People from "@/public/icons/people.svg";
import Calendar from "@/public/icons/calendar.svg";
import Settings from "@/public/icons/settings.svg";
import Automation from "@/public/icons/automation.svg";
import Admin from "@/public/icons/admin.svg";
import Building from "@/public/icons/building.svg";

/** A right that shows a settings item — for the items a VIEW does not describe. */
export type SettingsGrant = { resource: ResourceCode; action: AccessAction; scope?: AccessScope };

export type SettingsGroupItem = SettingsLinkItem & {
  /** The item shows to a reader who may VIEW any of these. */
  resources?: ResourceCode[];
  /** Instead of `resources`: the item shows to a reader holding any of these rights. */
  grants?: SettingsGrant[];
};

/**
 * Whether the menu offers an item to this reader — UX only; every page asks the backend again. The one
 * check the settings hub, the sidebar's Settings entry and quick search share, so the three cannot disagree.
 */
export const canSeeSettingsItem = (access: EffectiveAccess | null | undefined, item: SettingsGroupItem): boolean => {
  if (item.grants?.length) return item.grants.some((grant) => canAccess({ access, ...grant }));
  if (!item.resources?.length) return true;
  return item.resources.some((resource) => canAccess({ access, resource, action: "VIEW" }));
};

type SettingsGroup = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  items: SettingsGroupItem[];
};

export const settingsGroups: SettingsGroup[] = [
  {
    id: "general",
    title: "General",
    icon: <Building/>,
    items: [
      { label: "Company", href: "/settings/general/company", resources: ["SETTINGS.GENERAL"] },
      { label: "Appearance", href: "/settings/general/customisation", resources: ["SETTINGS.GENERAL"] },
      { label: "Home", href: "/settings/general/dashboard", resources: ["SETTINGS.GENERAL"] },
      {
        label: "Legal Entities & Offices",
        href: "/settings/general/legal-entities",
        resources: ["ORG.LEGAL_ENTITY", "ORG.OFFICE"],
      },
      {
        label: "Departments",
        href: "/settings/general/departments",
        resources: ["ORG.DEPARTMENT"],
      },
      {
        label: "Teams",
        href: "/settings/general/teams",
        resources: ["ORG.TEAM"],
      },
      {
        label: "Job Catalog",
        href: "/settings/general/job-catalog",
        resources: ["JOBS.FAMILY", "JOBS.LEVEL_GROUP", "JOBS.LEVEL", "JOBS.TITLE"],
      },
      {
        label: "Import & Export",
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
        label: "Templates",
        href: "/settings/general/templates",
        resources: ["ROLES.ROLE", "PEOPLE.ATTRIBUTES", "PEOPLE.LIFECYCLE_TEMPLATES"],
      },
    ],
  },
  {
    id: "people",
    title: "People",
    icon: <People/>,
    items: [
      { label: "Employee Information", href: "/settings/people/attributes", resources: ["PEOPLE.ATTRIBUTES"] },
      { label: "Employee Roles & Access", href: "/settings/people/roles", resources: ["ROLES.ROLE"] },
      { label: "Documents", href: "/settings/people/documents", resources: ["PEOPLE.DOCUMENT_CATEGORIES"] },
    ],
  },
  {
    id: "time",
    title: "Time & Time-Off",
    icon: <Calendar/>,
    items: [
      { label: "Time off", href: "/settings/time/leave-type", resources: ["PEOPLE.TIME_OFF_POLICIES"] },
      {
        label: "Public Holidays",
        href: "/settings/time/public-holidays",
        resources: ["ORG.PUBLIC_HOLIDAY_CALENDAR", "ORG.PUBLIC_HOLIDAY_TEMPLATE"],
      },
      { label: "Attendance", href: "/settings/time/attendance", resources: ["SETTINGS.GENERAL"] },
    ],
  },
  {
    id: "automation",
    title: "Automation",
    icon: <Automation/>,
    items: [
      { label: "Automations", href: "/settings/automation/automations", resources: ["SETTINGS.AUTOMATIONS"] },
      { label: "Workflows", href: "/settings/automation/workflows", resources: ["SETTINGS.GENERAL"] },
      {
        label: "Preboarding, Onboarding & Offboarding",
        href: "/settings/automation/preboarding",
        resources: ["PEOPLE.LIFECYCLE_TEMPLATES", "SETTINGS.GENERAL"],
      },
      { label: "Approvals", href: "/settings/automation/approvals", resources: ["SETTINGS.GENERAL"] },
      { label: "Notifications", href: "/settings/automation/notifications", resources: ["SETTINGS.GENERAL"] },
      { label: "Integrations", href: "/settings/automation/integrations", resources: ["SETTINGS.GENERAL"] },
    ],
  }, {
    id: "tech",
    title: "Tech",
    icon: <Settings/>,
    items: [
      { label: "API", href: "/settings/tech/api", resources: ["SETTINGS.GENERAL"] },
      { label: "Login & SSO", href: "/settings/tech/login-and-sso", resources: ["SETTINGS.GENERAL"] },
    ],
  }, {
    id: "admin",
    title: "Admin",
    icon: <Admin/>,
    items: [
      { label: "Logs", href: "/settings/admin/logs", resources: ["SETTINGS.AUDIT_LOG"] },
      { label: "Subscription Management", href: "/settings/admin/subscription", resources: ["SETTINGS.GENERAL"] },
      { label: "Support", href: "/settings/admin/support", resources: ["SETTINGS.GENERAL"] },
    ],
  },
];
