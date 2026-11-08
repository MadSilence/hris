import { AUTOMATION_PLACEHOLDERS, type AutomationCatalog, type AutomationDefinition, type StepSpec } from "@/models/automations";
import type { FieldDTO } from "@/models/user/fields";

/** An automation catalogue as `GET /automations/catalog` sends it, with a little of everything. */
export const automationCatalogFixture = (): AutomationCatalog => ({
  triggers: ["PERSON_HIRED", "TERMINATION_SCHEDULED", "LAST_WORKING_DAY_ARRIVES", "DATE_OFFSET", "JOINS_SEGMENT", "FIELD_CHANGED", "EVENT", "SCHEDULE"],
  dateFields: [
    { value: "HIRE_DATE", label: null },
    { value: "PROBATION_END", label: null },
    { value: "LAST_WORKING_DAY", label: null },
    { value: "DATE_OF_BIRTH", label: null },
  ],
  dateAttributes: [{ value: "a-visa", label: "Visa expires" }],
  changeableFields: [
    { value: "office", label: null },
    { value: "department", label: null },
    { value: "manager", label: null },
    { value: "status", label: null },
    { value: "attr:a-contact", label: "Emergency contact" },
  ],
  actions: ["CREATE_TASK", "REQUEST_APPROVAL", "START_REVIEW", "SIGN_DOCUMENT", "SEND_SURVEY", "NOTIFY", "SEND_EMAIL", "ASSIGN",
    "UNASSIGN", "GRANT_TIME_OFF_POLICY", "WAIT_UNTIL", "SPLIT"],
  assignableTypes: ["ROLE", "TEAM", "DEPARTMENT", "OFFICE", "PUBLIC_HOLIDAY_CALENDAR", "TIME_OFF_POLICY"],
  placeholders: [...AUTOMATION_PLACEHOLDERS],
  recipientKinds: ["PERSON", "MANAGER", "MANAGERS_MANAGER", "DEPARTMENT_HEAD", "ONBOARDING_MANAGER", "ROLE", "USER"],
  roles: [
    { id: "r-mkt", name: "Marketing lead" },
    { id: "r-hr", name: "HR Admin" },
  ],
  relations: ["OFFICE_CALENDAR", "COUNTRY_CALENDAR", "LEGAL_ENTITY_CALENDAR"],
  defaultLateWindowDays: 30,
  events: [
    ...(["TIME_OFF_REQUESTED", "TIME_OFF_APPROVED", "TIME_OFF_REJECTED", "TIME_OFF_CANCELLED"] as const).map((value) => ({
      value,
      family: "TIME_OFF" as const,
      fields: [
        { name: "days", type: "NUMBER" },
        { name: "leaveType", type: "TEXT" },
      ],
      placeholders: ["leaveType", "leaveStart", "leaveEnd", "leaveDays"],
      countsFromLeave: true,
      recipientKinds: ["APPROVER" as const],
    })),
    {
      value: "PROCESS_COMPLETED",
      family: "PROCESS",
      fields: [
        { name: "daysToComplete", type: "NUMBER" },
        { name: "processType", type: "PREBOARDING,ONBOARDING,OFFBOARDING" },
      ],
      placeholders: ["processName", "processType"],
      countsFromLeave: false,
      recipientKinds: [],
    },
  ],
  processTemplates: [{ value: "t-eng", label: "Engineering onboarding" }],
  reviewForms: [{ value: "f-prob", label: "Probation review" }],
});

/** The People table's field catalogue, as `GET /users/fields` answers a company admin. */
export const userFieldsFixture = (): FieldDTO[] => [
  {
    id: "sys:office",
    key: "office",
    label: "Office",
    type: "REFERENCE",
    isSystem: true,
    level: "EDIT",
    viewScopes: ["COMPANY"],
    valueSource: "offices",
    cardinality: "ONE",
  } as FieldDTO,
  {
    id: "sys:hire_date",
    key: "hire_date",
    label: "Hire date",
    type: "DATE",
    isSystem: true,
    level: "EDIT",
    viewScopes: ["COMPANY"],
  } as FieldDTO,
];

export const definitionFixture = (patch: Partial<AutomationDefinition> = {}): AutomationDefinition => ({
  trigger: { type: "PERSON_HIRED" },
  conditions: { filters: [], excludeUserIds: [] },
  steps: [],
  latePolicy: "RUN_LATE",
  lateWindowDays: null,
  ...patch,
});

export const stepFixture = (patch: Partial<StepSpec> & Pick<StepSpec, "type">): StepSpec => ({ id: "s1", ...patch });
