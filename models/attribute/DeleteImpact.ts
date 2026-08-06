export type AttributeDeleteImpact = {
  attributeName: string;
  valueCount: number;
  peopleCount: number;
};

export type GroupDeleteImpact = {
  groupName: string;
  attributeCount: number;
  valueCount: number;
  peopleCount: number;
};
