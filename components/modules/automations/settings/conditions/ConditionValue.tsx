"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/desact/input";
import { DatePicker } from "@/components/ui/DatePicker";
import { UserPickerField } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { useUser } from "@/components/hooks/useUser/useUser";
import { useAudienceFieldOptions } from "@/components/audience/hooks/useAudienceFieldOptions";
import type { AudienceField, AudienceOperator } from "@/components/audience/fieldCatalog";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import { useDateFormatter } from "@/lib/date";
import { CompactMultiPick, CompactPick } from "./chrome";
import { isMultiOp, isRangeOp, type ConditionRow } from "./segmentRows";

/** A system yes/no field (On probation) has no option list; its two answers are ours. */
const useBooleanOptions = () => {
  const t = useTranslations("automationsSettings");
  return [
    { id: "true", label: t("conditions.yes") },
    { id: "false", label: t("conditions.no") },
  ];
};

/**
 * The value of one condition, by where the field's values come from — the same sources the People table's builder
 * reads (`components/audience/AudienceBuilder` → `RuleValueEditor`, which is private to it): the company's records
 * and option lists through `useAudienceFieldOptions`, people through the people search, dates through the one shared
 * date field, numbers and text typed. Drawn compact, for a condition card.
 */
export const ConditionValue: React.FC<{
  field: AudienceField;
  dto: FieldDTO | null;
  row: ConditionRow;
  onPatch: (patch: Partial<ConditionRow>) => void;
}> = ({ field, dto, row, onPatch }) => {
  const t = useTranslations("automationsSettings");
  const booleans = useBooleanOptions();
  const source = field.valueSource;
  const { options: loaded, isLoading, hasOptions } = useAudienceFieldOptions(
    source === "boolean" ? "freeText" : source,
    dto?.options ?? null,
    dto?.type ?? null,
  );
  const options = source === "boolean" ? booleans : loaded;
  const op = row.op as AudienceOperator;

  if (source === "people") {
    return (
      <div className="min-w-40 flex-1">
        {row.value ? <PickedPerson id={row.value} onPick={(id) => onPatch({ value: id })} /> : (
          <UserPickerField value={null} onChange={(u) => onPatch({ value: u?.id ?? "" })} placeholder={t("conditions.pickValue")} />
        )}
      </div>
    );
  }

  if (hasOptions || source === "boolean") {
    const list = options.map((o) => ({ value: o.id, label: o.label }));
    if (isMultiOp(op)) {
      return (
        <CompactMultiPick
          options={list}
          values={row.values}
          onChange={(values) => onPatch({ values })}
          placeholder={t("conditions.pickValue")}
          emptyLabel={t("conditions.noValues")}
          ariaLabel={t("conditions.value")}
          loading={isLoading}
        />
      );
    }
    return (
      <div className="min-w-28 flex-1">
        <CompactPick
          options={list}
          value={row.value || null}
          onChange={(value) => onPatch({ value })}
          placeholder={t("conditions.pickValue")}
          emptyLabel={t("conditions.noValues")}
          ariaLabel={t("conditions.value")}
          loading={isLoading}
        />
      </div>
    );
  }

  if (source === "date") {
    if (isRangeOp(op)) {
      return (
        <div className="flex flex-1 items-center gap-1">
          <DatePicker className="h-7" value={row.value} onChange={(value) => onPatch({ value })} ariaLabel={t("conditions.from")} />
          <DatePicker className="h-7" value={row.valueTo} onChange={(valueTo) => onPatch({ valueTo })} ariaLabel={t("conditions.to")} />
        </div>
      );
    }
    return (
      <div className="min-w-32 flex-1">
        <DatePicker className="h-7" value={row.value} onChange={(value) => onPatch({ value })} ariaLabel={t("conditions.value")} />
      </div>
    );
  }

  const numeric = source === "number";
  if (isRangeOp(op)) {
    return (
      <div className="flex flex-1 items-center gap-1">
        <Input className="h-7 text-label" inputMode={numeric ? "decimal" : undefined} value={row.value}
          aria-label={t("conditions.from")} onChange={(e) => onPatch({ value: e.target.value })} />
        <Input className="h-7 text-label" inputMode={numeric ? "decimal" : undefined} value={row.valueTo}
          aria-label={t("conditions.to")} onChange={(e) => onPatch({ valueTo: e.target.value })} />
      </div>
    );
  }
  if (isMultiOp(op)) {
    // A typed list: one value per comma.
    return (
      <Input
        className="h-7 min-w-28 flex-1 text-label"
        value={row.values.join(", ")}
        aria-label={t("conditions.value")}
        onChange={(e) => onPatch({ values: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
      />
    );
  }
  return (
    <Input
      className="h-7 min-w-28 flex-1 text-label"
      inputMode={numeric ? "decimal" : undefined}
      value={row.value}
      aria-label={t("conditions.value")}
      onChange={(e) => onPatch({ value: e.target.value })}
    />
  );
};

/** A person picked by id: their name is read back, the way the audience builder does it. */
const PickedPerson: React.FC<{ id: string; onPick: (id: string) => void }> = ({ id, onPick }) => {
  const { data } = useUser(id);
  const value = data
    ? { id, firstName: data.firstName, lastName: data.lastName, email: data.email, avatarUrl: data.avatarUrl }
    : { id };
  return <UserPickerField value={value} onChange={(u) => onPick(u?.id ?? "")} />;
};

/** What one condition says, in words: "Poland or Lithuania", "1 Mar 2027", "Marta Nowak". */
export const useFilterValueText = (field: AudienceField | null, dto: FieldDTO | null, filter: FilterDTO): string => {
  const t = useTranslations("automationsSettings");
  const formatDate = useDateFormatter();
  const booleans = useBooleanOptions();
  const source = field?.valueSource ?? "freeText";
  const { options } = useAudienceFieldOptions(source === "boolean" ? "freeText" : source, dto?.options ?? null, dto?.type ?? null);
  const person = useUser(source === "people" ? filter.value ?? "" : "");
  const label = (v: string): string => {
    if (source === "boolean") return booleans.find((o) => o.id === v)?.label ?? v;
    if (source === "date") return formatDate(v, { style: "medium" });
    if (source === "people") {
      const d = person.data;
      return d ? `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || t("conditions.aPerson") : t("conditions.aPerson");
    }
    return options.find((o) => o.id === v)?.label ?? v;
  };
  if (isMultiOp(filter.op)) return joinOr(t, (filter.values ?? []).map(label));
  if (isRangeOp(filter.op)) return t("conditions.range", { from: label(filter.value ?? ""), to: label(filter.valueTo ?? "") });
  return label(filter.value ?? "");
};

/** "A", "A or B", "A, B or C". */
export const joinOr = (t: ReturnType<typeof useTranslations<"automationsSettings">>, items: string[]): string => {
  if (items.length <= 1) return items[0] ?? "";
  return t("conditions.orList", { head: items.slice(0, -1).join(", "), last: items[items.length - 1] });
};
