import { OPERATOR_LABELS } from "@/components/audience/fieldCatalog";
import { isReferenceField, type FieldDTO, type FilterDTO } from "@/models/user/fields";

/**
 * A filter row as one line a person can read — the export dialog shows what the file will be made
 * from. An option field prints its options' labels. A reference field (an office, a team) holds ids,
 * so it prints the names from `referenceNames` — the catalogue, read by the caller — and falls back to
 * how many were picked only while a name is not known yet, rather than guessing or printing an id.
 */
export const describeFilter = (
  filter: FilterDTO,
  fields: FieldDTO[],
  referenceNames?: ReadonlyMap<string, string>,
): string => {
  const field = fields.find((f) => f.id === filter.field);
  const label = field?.label ?? filter.field;
  const op = (OPERATOR_LABELS[filter.op] ?? filter.op).toLowerCase();
  const isReference = !!field && isReferenceField(field);

  const optionLabel = (value: string) => {
    const option = field?.options?.find((o) => o.id === value || o.value === value);
    return option?.label ?? option?.value ?? value;
  };
  const named = (ids: string[]) =>
    referenceNames && ids.every((id) => referenceNames.has(id)) ? ids.map((id) => referenceNames.get(id)!) : null;

  if (filter.values?.length) {
    if (isReference) {
      const names = named(filter.values);
      return names ? `${label} ${op} ${names.join(", ")}` : `${label} ${op} ${filter.values.length} selected`;
    }
    return `${label} ${op} ${filter.values.map(optionLabel).join(", ")}`;
  }
  if (filter.op === "between") return `${label} ${op} ${filter.value ?? ""} – ${filter.valueTo ?? ""}`;
  if (isReference && filter.value) {
    const names = named([filter.value]);
    return names ? `${label} ${op} ${names[0]}` : `${label} ${op} 1 selected`;
  }
  return `${label} ${op} ${filter.value ? optionLabel(filter.value) : ""}`.trim();
};
