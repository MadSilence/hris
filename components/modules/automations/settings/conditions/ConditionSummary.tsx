"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { AudienceField } from "@/components/audience/fieldCatalog";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import { ConditionGroup, ConditionJoiner } from "./chrome";
import { useFilterValueText } from "./ConditionValue";

/**
 * Conditions in read mode (R4): no inputs — a Mist card per condition with the field in grey over "is **Poland or
 * Lithuania**", "and" between them, inside the outlined group.
 */
export const ConditionSummaryList: React.FC<{ filters: FilterDTO[]; catalog: AudienceField[]; dtos: FieldDTO[] }> = ({
  filters,
  catalog,
  dtos,
}) => {
  const t = useTranslations("automationsSettings");
  if (filters.length === 0) return <p className="text-body text-secondary">{t("conditions.none")}</p>;
  return (
    <ConditionGroup>
      {filters.map((f, i) => (
        <React.Fragment key={`${f.field}-${i}`}>
          {i > 0 && <ConditionJoiner value="AND" />}
          <ConditionSummaryCard filter={f} catalog={catalog} dtos={dtos} />
        </React.Fragment>
      ))}
    </ConditionGroup>
  );
};

const ConditionSummaryCard: React.FC<{ filter: FilterDTO; catalog: AudienceField[]; dtos: FieldDTO[] }> = ({ filter, catalog, dtos }) => {
  const field = catalog.find((c) => c.key === filter.field) ?? null;
  const dto = dtos.find((d) => d.id === filter.field) ?? null;
  return (
    <div className="flex flex-col gap-0.5 rounded-popover bg-mist px-3 py-2">
      <span className="text-hint text-tertiary">{field?.label ?? dto?.label ?? filter.field}</span>
      <ConditionSentence filter={filter} field={field} dto={dto} />
    </div>
  );
};

/** "is **Poland or Lithuania**" — the operator plain, the value in 500. */
export const ConditionSentence: React.FC<{ filter: FilterDTO; field: AudienceField | null; dto: FieldDTO | null }> = ({
  filter,
  field,
  dto,
}) => {
  const t = useTranslations("automationsSettings");
  const value = useFilterValueText(field, dto, filter);
  return (
    <span className="text-body text-primary">
      {t.rich("conditions.sentence", {
        op: t(`operator.${filter.op}`),
        value,
        b: (chunks) => <span className="font-medium">{chunks}</span>,
      })}
    </span>
  );
};

/** One condition on a line, in words: "Department is Engineering". */
export const ConditionLine: React.FC<{ filter: FilterDTO; catalog: AudienceField[]; dtos: FieldDTO[] }> = ({ filter, catalog, dtos }) => {
  const t = useTranslations("automationsSettings");
  const field = catalog.find((c) => c.key === filter.field) ?? null;
  const dto = dtos.find((d) => d.id === filter.field) ?? null;
  const value = useFilterValueText(field, dto, filter);
  return <>{t("conditions.line", { field: field?.label ?? dto?.label ?? filter.field, op: t(`operator.${filter.op}`), value })}</>;
};
