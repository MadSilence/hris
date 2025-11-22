import { AttributeType } from "@/models/attribute/AttributeType";
import { AttributeOption } from "@/models/attribute/AttributeOption";

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
  options?: AttributeOption[]
}
