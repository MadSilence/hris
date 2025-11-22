import { AttributeOption, AttributeType } from "@/models/attribute";

export type UpdateAttributeRequest = {
  id: string,
  name: string,
  type: AttributeType,
  unique: boolean,
  decScale: number | null,
  dateHideYear: boolean,
  options?: AttributeOption[]
};
