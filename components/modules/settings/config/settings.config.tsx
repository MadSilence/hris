import { SettingsLinkItem } from "@/components/modules/settings/components/SettingsCard/SettingsCard";
import People from "@/public/icons/people.svg";
import Calendar from "@/public/icons/calendar.svg";
import Settings from "@/public/icons/settings.svg";
import Automation from "@/public/icons/automation.svg";
import Admin from "@/public/icons/admin.svg";
import Building from "@/public/icons/building.svg";

type SettingsGroup = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  items: SettingsLinkItem[];
};

export const settingsGroups: SettingsGroup[] = [
  {
    id: "general",
    title: "General",
    icon: <Building/>,
    items: [
      { label: "Company", href: "/settings/general/company" },
      { label: "Customisation", href: "/settings/general/customisation" },
      { label: "Dashboard", href: "/settings/general/dashboard" },
      { label: "Legal Entities & Offices", href: "/settings/general/legal-entities" },
      { label: "Departments & Teams", href: "/settings/general/departments" },
      { label: "Job Catalog", href: "/settings/general/job-catalog" },
      { label: "Import & Export", href: "/settings/general/import" },
    ],
  },
  {
    id: "people",
    title: "People",
    icon: <People/>,
    items: [
      { label: "Employee Information", href: "/settings/people/attributes" },
      { label: "Employee Roles & Access", href: "/settings/people/roles" },
      { label: "Documents", href: "/settings/people/documents" },
    ],
  },
  {
    id: "time",
    title: "Time & Time-Off",
    icon: <Calendar/>,
    items: [
      { label: "Time off", href: "/settings/timeoff" },
      { label: "Public Holidays", href: "/settings/holidays" },
      { label: "Attendance", href: "/settings/attendance" },
    ],
  },
  {
    id: "automation",
    title: "Automation",
    icon: <Automation/>,
    items: [
      { label: "Workflows", href: "/settings/timeoff" },
      { label: "Preboadring & Onboarding", href: "/settings/holidays" },
      { label: "Offboarding", href: "/settings/offboarding" },
      { label: "Approvals", href: "/settings/approvals" },
      { label: "Notifications", href: "/settings/notifications" },
      { label: "Integrations", href: "/settings/integrations" },
    ],
  }, {
    id: "tech",
    title: "Tech",
    icon: <Settings/>,
    items: [
      { label: "API", href: "/settings/timeoff" },
      { label: "Login & SSO", href: "/settings/holidays" },
    ],
  }, {
    id: "admin",
    title: "Admin",
    icon: <Admin/>,
    items: [
      { label: "Subscription management", href: "/settings/timeoff" },
      { label: "Support", href: "/settings/holidays" },
    ],
  },
];
