import { AttributeOption, AttributeType } from "@/models/attribute";

export type CreateAttributeRequest = {
  name: string,
  groupId: string,
  type: AttributeType,
  isUnique: boolean,
  decScale: number | null,
  hideYear: boolean,
  options?: AttributeOption[]
};
