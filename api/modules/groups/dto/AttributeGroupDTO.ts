import { AttributeDTO } from "@/api/modules/attributes/dto";

export type AttributeGroupDTO = {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  /** Sent back by the edit form; a stale one is refused with E00409. */
  version?: number;
  attributes: AttributeDTO[];
};
