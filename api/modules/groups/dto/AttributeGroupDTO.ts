import { AttributeDTO } from "@/api/modules/attributes/dto";

export type AttributeGroupDTO = {
  id: string;
  name: string;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  attributes: AttributeDTO[];
};
