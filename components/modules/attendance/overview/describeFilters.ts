import { OPERATOR_LABELS } from "@/components/audience/fieldCatalog";
import { isReferenceField, type FieldDTO, type FilterDTO } from "@/models/user/fields";

/**
 * A filter row as one line a person can read — the export dialog shows what the file will be made
 * from. An option field prints its options' labels; a reference field (an office, a team) holds ids,
 * which mean nothing to a reader, so it prints how many were picked instead of guessing at names.
 */
export const describeFilter = (filter: FilterDTO, fields: FieldDTO[]): string => {
  const field = fields.find((f) => f.id === filter.field);
  const label = field?.label ?? filter.field;
  const op = (OPERATOR_LABELS[filter.op] ?? filter.op).toLowerCase();

  const optionLabel = (value: string) => {
    const option = field?.options?.find((o) => o.id === value || o.value === value);
    return option?.label ?? option?.value ?? value;
  };

  if (filter.values?.length) {
    if (field && isReferenceField(field)) return `${label} ${op} ${filter.values.length} selected`;
    return `${label} ${op} ${filter.values.map(optionLabel).join(", ")}`;
  }
  if (filter.op === "between") return `${label} ${op} ${filter.value ?? ""} – ${filter.valueTo ?? ""}`;
  if (field && isReferenceField(field) && filter.value) return `${label} ${op} 1 selected`;
  return `${label} ${op} ${filter.value ? optionLabel(filter.value) : ""}`.trim();
};
