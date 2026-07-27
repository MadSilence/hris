import { AccessAction } from "./AccessAction";
import { AccessScope } from "./AccessScope";
import { ResourceCode } from "./ResourceCode";

export type ResourceDefinition = {
  code: ResourceCode;
  label: string;
  description: string;
  supportedActions: AccessAction[];
  supportedScopes: AccessScope[];
};

export type ResourceGroup = {
  id: "settings" | "people" | "organization" | "jobs" | "roles";
  label: string;
  resources: ResourceDefinition[];
};

const ALL_ACTIONS: AccessAction[] = ["VIEW", "EDIT", "MANAGE"];
const COMPANY_ONLY: AccessScope[] = ["COMPANY"];
// Backend does not support CUSTOM for any current resource (PUT with CUSTOM → 422 RA00003).
const PERSONAL_SCOPES: AccessScope[] = ["SELF", "DIRECT_REPORTS", "COMPANY"];

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: "settings",
    label: "Settings",
    resources: [
      {
        code: "SETTINGS.GENERAL",
        label: "General settings",
        description: "Company profile, appearance and general configuration.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "SETTINGS.IMPERSONATION",
        label: "Impersonation",
        description: "Impersonate other users for support purposes.",
        supportedActions: ["MANAGE"],
        supportedScopes: COMPANY_ONLY,
      },
    ],
  },
  {
    id: "people",
    label: "People",
    resources: [
      {
        code: "PEOPLE.PROFILE",
        label: "Profiles",
        description: "Employee profiles and personal information.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: PERSONAL_SCOPES,
      },
      {
        code: "PEOPLE.ATTRIBUTES",
        label: "Attributes",
        description: "Custom attribute groups and attributes configuration.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "PEOPLE.DOCUMENTS",
        label: "Documents",
        description: "Employee documents and folders.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: PERSONAL_SCOPES,
      },
      {
        code: "PEOPLE.DOCUMENT_CATEGORIES",
        label: "Document categories",
        description: "Document category configuration.",
        supportedActions: ["MANAGE"],
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "PEOPLE.TIME_OFF",
        label: "Time off",
        description: "Time off requests and balances.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: PERSONAL_SCOPES,
      },
      {
        code: "PEOPLE.TIME_OFF_POLICIES",
        label: "Time off policies",
        description: "Time off policy configuration.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "PEOPLE.CALENDAR",
        label: "Calendar",
        description: "People calendar and events.",
        supportedActions: ["VIEW", "EDIT"],
        supportedScopes: PERSONAL_SCOPES,
      },
    ],
  },
  {
    id: "organization",
    label: "Organization",
    resources: [
      {
        code: "ORG.DEPARTMENT",
        label: "Departments",
        description: "Department structure and membership.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "ORG.TEAM",
        label: "Teams",
        description: "Team structure and membership.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "ORG.OFFICE",
        label: "Offices",
        description: "Office locations.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "ORG.LEGAL_ENTITY",
        label: "Legal entities",
        description: "Registered legal entities.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "ORG.PUBLIC_HOLIDAY_CALENDAR",
        label: "Public holiday calendars",
        description: "Public holiday calendars.",
        supportedActions: ["VIEW", "MANAGE"],
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "ORG.PUBLIC_HOLIDAY_TEMPLATE",
        label: "Public holiday templates",
        description: "Public holiday calendar templates.",
        supportedActions: ["VIEW"],
        supportedScopes: COMPANY_ONLY,
      },
    ],
  },
  {
    id: "jobs",
    label: "Jobs",
    resources: [
      {
        code: "JOBS.FAMILY",
        label: "Job families",
        description: "Job family catalog.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "JOBS.LEVEL_GROUP",
        label: "Job level groups",
        description: "Job level group catalog.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "JOBS.LEVEL",
        label: "Job levels",
        description: "Job level catalog.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "JOBS.TITLE",
        label: "Job titles",
        description: "Job title catalog.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
    ],
  },
  {
    id: "roles",
    label: "Roles",
    resources: [
      {
        code: "ROLES.ROLE",
        label: "Roles",
        description: "Roles and their permissions.",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
    ],
  },
];

export const RESOURCE_DEFINITIONS: Record<ResourceCode, ResourceDefinition> =
  Object.fromEntries(
    RESOURCE_GROUPS.flatMap((group) => group.resources).map((resource) => [
      resource.code,
      resource,
    ]),
  ) as Record<ResourceCode, ResourceDefinition>;

// True only for a resource/action/scope combination the backend actually supports.
// Use this to prevent the UI from ever assembling a permission payload the backend
// would reject (422 RA00001/RA00002/RA00003).
export function isSupportedPermission(
  resource: ResourceCode,
  action: AccessAction,
  scope: AccessScope,
): boolean {
  const definition = RESOURCE_DEFINITIONS[resource];
  if (!definition) return false;
  return definition.supportedActions.includes(action) && definition.supportedScopes.includes(scope);
}
