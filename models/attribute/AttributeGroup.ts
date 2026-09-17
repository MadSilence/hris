import { Attribute } from "@/models/attribute/Attribute";

export type AttributeGroup = {
  id: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  /** Sent back by the edit form; a stale one is refused with E00409. */
  version?: number;
  attributes: Attribute[];
}
