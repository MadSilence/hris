import { AttributeType } from "@/models/attribute/AttributeType";
import { AttributeOption } from "@/models/attribute/AttributeOption";
import { AttributeOptionUpsert } from "@/models/attribute/AttributeOptionUpsert";

export type Attribute = {
  createdAt: string,
  updatedAt: string,
  createdBy: string | null,
  updatedBy: string | null,
  version: number,
  id: string,
  companyId: string,
  groupId: string,
  name: string,
  type: AttributeType,
  sortOrder: number,
  decScale: number | null,
  dateHideYear: boolean | null,
  system: boolean,
  unique: boolean,
  /** Sensitive: no auto-granted access on create; masked for viewers without access. */
  sensitive?: boolean,
  options?: AttributeOption[],
  required?: boolean,
  description?: string | null,
  defaultValue?: string | null,
  minValue?: number | null,
  maxValue?: number | null,
  onlyPositive?: boolean,
  minLength?: number | null,
  maxLength?: number | null,
  regex?: string | null,
  minDate?: string | null,
  maxDate?: string | null,
  minSelect?: number | null,
  maxSelect?: number | null,
  objectFields?: string | null,
}

/**
 * What the attribute editor hands back on save. Beyond the attribute's own fields it carries the
 * option set (persisted through a separate endpoint) and `clearFields` — the names of nullable
 * config fields to reset, since the update is a partial patch where null means "leave as is".
 */
export type AttributePatch = Partial<Attribute> & {
  options?: AttributeOptionUpsert[];
  clearFields?: string[];
};
