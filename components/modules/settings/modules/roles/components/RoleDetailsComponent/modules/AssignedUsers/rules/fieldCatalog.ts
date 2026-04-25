import { AttributeKind } from "./operators";

export type FieldOption = { id: string; label: string };
export type FieldMeta = {
  fieldId: string;
  label: string;
  type: AttributeKind;
  options?: FieldOption[];
};

export type FieldGroup = {
  id: string;
  name: string;
  attributes: FieldMeta[];
};

export const buildFieldCatalog = (groups: any[]): FieldGroup[] => {
  const sortedGroups = [...(groups || [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
  return sortedGroups.map((g) => ({
    id: g.id,
    name: g.name,
    attributes: [...(g.attributes || [])]
      .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((attr: any) => ({
        fieldId: `attr:${attr.id}`,
        label: attr.name,
        type: attr.type as AttributeKind,
        options: (attr.options || []).map((o: any) => ({
          id: o.id,
          label: o.value,
        })),
      })),
  }));
};
