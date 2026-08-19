import { SettingsLinkItem } from "@/components/modules/settings/components/SettingsCard/SettingsCard";
import { ResourceCode } from "@/models/access";
import People from "@/public/icons/people.svg";
import Calendar from "@/public/icons/calendar.svg";
import Settings from "@/public/icons/settings.svg";
import Automation from "@/public/icons/automation.svg";
import Admin from "@/public/icons/admin.svg";
import Building from "@/public/icons/building.svg";

export type SettingsGroupItem = SettingsLinkItem & {
  resources?: ResourceCode[];
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
      { label: "Dashboard", href: "/settings/general/dashboard", resources: ["SETTINGS.GENERAL"] },
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
      { label: "Import & Export", href: "/settings/general/import", resources: ["SETTINGS.GENERAL"] },
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
      { label: "Workflows", href: "/settings/timeoff", resources: ["SETTINGS.GENERAL"] },
      { label: "Preboadring & Onboarding", href: "/settings/holidays", resources: ["SETTINGS.GENERAL"] },
      { label: "Offboarding", href: "/settings/offboarding", resources: ["SETTINGS.GENERAL"] },
      { label: "Approvals", href: "/settings/approvals", resources: ["SETTINGS.GENERAL"] },
      { label: "Notifications", href: "/settings/notifications", resources: ["SETTINGS.GENERAL"] },
      { label: "Integrations", href: "/settings/integrations", resources: ["SETTINGS.GENERAL"] },
    ],
  }, {
    id: "tech",
    title: "Tech",
    icon: <Settings/>,
    items: [
      { label: "API", href: "/settings/timeoff", resources: ["SETTINGS.GENERAL"] },
      { label: "Login & SSO", href: "/settings/holidays", resources: ["SETTINGS.GENERAL"] },
    ],
  }, {
    id: "admin",
    title: "Admin",
    icon: <Admin/>,
    items: [
      { label: "Subscription management", href: "/settings/timeoff", resources: ["SETTINGS.GENERAL"] },
      { label: "Support", href: "/settings/holidays", resources: ["SETTINGS.GENERAL"] },
    ],
  },
];
