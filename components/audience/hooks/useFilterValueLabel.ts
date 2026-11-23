"use client";

import { useTranslations } from "next-intl";
import type { AudienceField } from "@/components/audience/fieldCatalog";
import { useAudienceFieldOptions } from "@/components/audience/hooks/useAudienceFieldOptions";
import { useUser } from "@/components/hooks/useUser/useUser";
import { useDateFormatter } from "@/lib/date";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";

const isMulti = (op: FilterDTO["op"]) => op === "in" || op === "has_any" || op === "not_in" || op === "not_has_any";

/**
 * What one condition's value says, in words — an applied chip ("Design"), a range or several values summarised in a
 * condition's value cell ("1 Mar 2027 – 5 Apr 2027", "Poland, Lithuania"). The value is stored by id; the label is
 * read back the way the value picker lists it, so a renamed option shows its new name.
 */
export const useFilterValueLabel = (field: AudienceField | null, dto: FieldDTO | null, filter: FilterDTO): string => {
  const t = useTranslations("access");
  const tCommon = useTranslations("common");
  const formatDate = useDateFormatter();
  const source = field?.valueSource ?? "freeText";
  const { options } = useAudienceFieldOptions(source === "boolean" ? "freeText" : source, dto?.options ?? null, dto?.type ?? null);
  const person = useUser(source === "people" ? (filter.value ?? "") : "");

  const label = (v: string): string => {
    if (!v) return "";
    if (source === "boolean") return v === "true" ? tCommon("values.yes") : v === "false" ? tCommon("values.no") : v;
    if (source === "date") return formatDate(v, { style: "medium" });
    if (source === "people") {
      const d = person.data;
      return d ? `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() : "";
    }
    return options.find((o) => o.id === v)?.label ?? v;
  };

  if (isMulti(filter.op)) return (filter.values ?? []).map(label).join(", ");
  if (filter.op === "between") return t("audience.builder.range", { from: label(filter.value ?? ""), to: label(filter.valueTo ?? "") });
  return label(filter.value ?? "");
};
