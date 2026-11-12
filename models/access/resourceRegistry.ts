import { AccessAction } from "./AccessAction";
import { AccessScope } from "./AccessScope";
import { ResourceCode } from "./ResourceCode";
import type { Messages } from "@/i18n/messages";

/**
 * The words of a resource live in the `access` catalogue: `resources.<messageKey>.label` and
 * `.description`, and a group's title is `resourceGroups.<id>` — the registry holds no English.
 */
export type ResourceMessageKey = keyof Messages["access"]["resources"];

export type ResourceDefinition = {
  code: ResourceCode;
  messageKey: ResourceMessageKey;
  supportedActions: AccessAction[];
  supportedScopes: AccessScope[];
};

export type ResourceGroup = {
  id: "settings" | "people" | "organization" | "jobs" | "roles" | "notifications";
  resources: ResourceDefinition[];
};

const ALL_ACTIONS: AccessAction[] = ["VIEW", "EDIT", "MANAGE"];
// Mirrors ResourceRegistry.PEOPLE_ACTIONS: only a person can be blocked, so only the person resource
// offers BLOCK — the circle who may end someone's sign-in, which is usually smaller than MANAGE's.
const PEOPLE_ACTIONS: AccessAction[] = ["VIEW", "EDIT", "MANAGE", "BLOCK"];
const MANAGE_ONLY: AccessAction[] = ["MANAGE"];
/** Read by everyone without a right (the company hub): only writing and running it are granted. */
const EDIT_MANAGE: AccessAction[] = ["EDIT", "MANAGE"];
const COMPANY_ONLY: AccessScope[] = ["COMPANY"];
// Mirrors ResourceRegistry.ALL_SCOPES on the backend — resourceRegistry.test.ts fails if they drift.
// CUSTOM must arrive with its filters (RA00006), and filters without CUSTOM are rejected (RA00007).
const PERSONAL_SCOPES: AccessScope[] = [
  "SELF",
  "DIRECT_REPORTS",
  "COMPANY",
  "MY_DEPARTMENT",
  "MY_DEPARTMENT_SUBTREE",
  "MY_TEAM",
  "MY_TEAM_SUBTREE",
  "MY_OFFICE",
  "MY_LEGAL_ENTITY",
  "CUSTOM",
];

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: "settings",
    resources: [
      {
        code: "SETTINGS.GENERAL",
        messageKey: "settingsGeneral",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "SETTINGS.IMPERSONATION",
        messageKey: "settingsImpersonation",
        supportedActions: ["MANAGE"],
        supportedScopes: COMPANY_ONLY,
      },
      {
        // ENTERPRISE_ACCESS_DESIGN.md § 4.5 (A9): who decides who can sign in as whom.
        code: "SETTINGS.IDENTITY",
        messageKey: "settingsIdentity",
        supportedActions: ["MANAGE"],
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "SETTINGS.AUDIT_LOG",
        messageKey: "settingsAuditLog",
        supportedActions: ["VIEW"],
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "SETTINGS.AUTOMATIONS",
        messageKey: "settingsAutomations",
        supportedActions: ["VIEW", "MANAGE"],
        supportedScopes: COMPANY_ONLY,
      },
    ],
  },
  {
    id: "people",
    resources: [
      {
        code: "PEOPLE.PROFILE",
        messageKey: "peopleProfile",
        supportedActions: PEOPLE_ACTIONS,
        supportedScopes: PERSONAL_SCOPES,
      },
      {
        code: "PEOPLE.ATTRIBUTES",
        messageKey: "peopleAttributes",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "PEOPLE.DOCUMENTS",
        messageKey: "peopleDocuments",
        supportedActions: ALL_ACTIONS,
        supportedScopes: PERSONAL_SCOPES,
      },
      {
        code: "PEOPLE.DOCUMENT_CATEGORIES",
        messageKey: "peopleDocumentCategories",
        supportedActions: ["MANAGE"],
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "PEOPLE.TIME_OFF",
        messageKey: "peopleTimeOff",
        supportedActions: ALL_ACTIONS,
        supportedScopes: PERSONAL_SCOPES,
      },
      {
        code: "PEOPLE.TIME_OFF_POLICIES",
        messageKey: "peopleTimeOffPolicies",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "PEOPLE.CALENDAR",
        messageKey: "peopleCalendar",
        supportedActions: ["VIEW"],
        supportedScopes: PERSONAL_SCOPES,
      },
      {
        code: "PEOPLE.LIFECYCLE_TEMPLATES",
        messageKey: "peopleLifecycleTemplates",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "PEOPLE.LIFECYCLE_PROCESSES",
        messageKey: "peopleLifecycleProcesses",
        supportedActions: ALL_ACTIONS,
        supportedScopes: PERSONAL_SCOPES,
      },
      {
        code: "REVIEWS.FORM",
        messageKey: "reviewsForm",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "REVIEWS.CYCLE",
        messageKey: "reviewsCycle",
        supportedActions: ["VIEW", "MANAGE"],
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "REVIEWS.RESULT",
        messageKey: "reviewsResult",
        supportedActions: ["VIEW"],
        supportedScopes: PERSONAL_SCOPES,
      },
      {
        code: "PEOPLE.ATTENDANCE",
        messageKey: "peopleAttendance",
        supportedActions: ALL_ACTIONS,
        supportedScopes: PERSONAL_SCOPES,
      },
      {
        code: "REPORTS.REPORT",
        messageKey: "reportsReport",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "HUB.CONTENT",
        messageKey: "hubContent",
        supportedActions: EDIT_MANAGE,
        supportedScopes: COMPANY_ONLY,
      },
    ],
  },
  {
    id: "organization",
    resources: [
      {
        code: "ORG.DEPARTMENT",
        messageKey: "orgDepartment",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "ORG.TEAM",
        messageKey: "orgTeam",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "ORG.OFFICE",
        messageKey: "orgOffice",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "ORG.LEGAL_ENTITY",
        messageKey: "orgLegalEntity",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "ORG.PUBLIC_HOLIDAY_CALENDAR",
        messageKey: "orgPublicHolidayCalendar",
        supportedActions: ["VIEW", "MANAGE"],
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "ORG.PUBLIC_HOLIDAY_TEMPLATE",
        messageKey: "orgPublicHolidayTemplate",
        supportedActions: ["VIEW"],
        supportedScopes: COMPANY_ONLY,
      },
    ],
  },
  {
    id: "jobs",
    resources: [
      {
        code: "JOBS.FAMILY",
        messageKey: "jobsFamily",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "JOBS.LEVEL_GROUP",
        messageKey: "jobsLevelGroup",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "JOBS.LEVEL",
        messageKey: "jobsLevel",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "JOBS.TITLE",
        messageKey: "jobsTitle",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
    ],
  },
  {
    id: "roles",
    resources: [
      {
        code: "ROLES.ROLE",
        messageKey: "rolesRole",
        supportedActions: ALL_ACTIONS,
        supportedScopes: COMPANY_ONLY,
      },
    ],
  },
  {
    id: "notifications",
    resources: [
      {
        code: "NOTIFICATION.APPROVALS",
        messageKey: "notificationApprovals",
        supportedActions: MANAGE_ONLY,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "NOTIFICATION.ORG_CHANGES",
        messageKey: "notificationOrgChanges",
        supportedActions: MANAGE_ONLY,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "NOTIFICATION.POLICIES",
        messageKey: "notificationPolicies",
        supportedActions: MANAGE_ONLY,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "NOTIFICATION.DOCUMENTS",
        messageKey: "notificationDocuments",
        supportedActions: MANAGE_ONLY,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "NOTIFICATION.COMPANY_NEWS",
        messageKey: "notificationCompanyNews",
        supportedActions: MANAGE_ONLY,
        supportedScopes: COMPANY_ONLY,
      },
      {
        code: "NOTIFICATION.SYSTEM",
        messageKey: "notificationSystem",
        supportedActions: MANAGE_ONLY,
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
