/** Mirrors `TemplateDTOs` on the backend: the template catalogue (TEMPLATES_DESIGN.md § 4.2). */
export type TemplateKind = "FIELD_SET" | "ROLE" | "PROCESS";

export type TemplateSummaryDTO = {
  key: string;
  version: number;
  kind: TemplateKind;
  title: string;
  summary: string;
  changelog: string | null;
  itemCount: number;
  /** HR Admin and Manager, or a template for the industry the setup stored — shown first. */
  suggested: boolean;
  /** The version this company applied last — "applied", not "still there". */
  appliedVersion: number | null;
  appliedAt: string | null;
};

export type TemplateClashChoice = "SKIP" | "RENAME";

export type TemplateItemChoice = {
  templateKey: string;
  ref: string;
  include?: boolean | null;
  clash?: TemplateClashChoice | null;
  /** For a role: the keys of the grants to apply. Absent means the preview's defaults. */
  grants?: string[] | null;
};

export type TemplateChoicesRequest = {
  fingerprint?: string | null;
  excludedTemplates?: string[];
  items?: TemplateItemChoice[];
};

export type TemplateItemType = "SECTION" | "FIELD" | "ROLE" | "PROCESS";
export type TemplateOutcome = "NEW" | "EXISTING" | "CLASH" | "DROPPED";

export type TemplateGrantDTO = {
  key: string;
  permission: boolean;
  label: string;
  action: string;
  scopes: string[];
  selected: boolean;
  defaultSelected: boolean;
  /** Lands on a field the company already has: "existing field · N values". */
  existingField: boolean;
  sensitive: boolean;
  valueCount: number | null;
  dropped: boolean;
  reason: string | null;
};

export type TemplateTaskDTO = {
  key: string;
  title: string;
  kind: string;
  assignee: string;
  dueKind: string;
  offsetDays: number | null;
  dropped: boolean;
  reason: string | null;
  droppedFields: string[];
};

export type TemplateItemDTO = {
  ref: string;
  type: TemplateItemType;
  name: string;
  finalName: string;
  outcome: TemplateOutcome;
  include: boolean;
  clash: TemplateClashChoice;
  /** "… (template)" is taken too: applying refuses until it is skipped. */
  renameTaken: boolean;
  existingName: string | null;
  reason: string | null;
  fieldType: string | null;
  existingType: string | null;
  sensitive: boolean;
  valueCount: number | null;
  /** For a sensitive field created here: the roles that will read it. Empty means only the owner. */
  readers: string[];
  grants: TemplateGrantDTO[];
  tasks: TemplateTaskDTO[];
};

export type TemplatePartDTO = {
  key: string;
  title: string;
  kind: TemplateKind;
  version: number;
  root: boolean;
  included: boolean;
  appliedBefore: boolean;
  items: TemplateItemDTO[];
};

export type TemplatePreviewDTO = {
  key: string;
  version: number;
  kind: TemplateKind;
  title: string;
  summary: string;
  fingerprint: string;
  parts: TemplatePartDTO[];
  counts: { create: number; existing: number; skip: number; dropped: number };
};

export type TemplateRecordedItem = {
  templateKey: string;
  ref: string;
  type: TemplateItemType;
  /** For a process template: ONBOARDING or PREBOARDING. */
  subtype: string | null;
  outcome: "CREATED" | "EXISTING" | "SKIPPED" | "DROPPED";
  objectId: string | null;
  objectName: string;
  reason: string | null;
  notes: string[] | null;
};

export type TemplateApplicationDTO = {
  id: string;
  templateKey: string;
  templateVersion: number;
  templateTitle: string;
  appliedBy: string | null;
  createdAt: string;
  items: TemplateRecordedItem[];
};

export type TemplateApplyResponse = { id: string };
