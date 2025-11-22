import { AttributeOptionDTO } from "@/api/modules/attributes/dto/AttributeOptionDTO";
import { AttributeType } from "@/models/attribute";

export type AttributeDTO = {
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
  unique: boolean
  options?: AttributeOptionDTO[],
};
