import { Attribute } from "@/models/attribute/Attribute";

export type AttributeGroup = {
  id: string;
  name: string;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  attributes: Attribute[];
}
