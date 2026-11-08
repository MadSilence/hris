"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess } from "@/models/access";
import { buildAudienceFields, type AudienceField, type AudienceOperator } from "@/components/audience/fieldCatalog";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields";
import type { FieldDTO } from "@/models/user/fields";
import type { ConditionBuilderProps } from "../../contracts";
import { AddConditionButton, CompactPick, ConditionCard, ConditionGroup, ConditionJoiner, type PickOption } from "./chrome";
import { ConditionValue } from "./ConditionValue";
import { ConditionSummaryList } from "./ConditionSummary";
import { MatchCount } from "./MatchCount";
import {
  blankRow,
  rowsFromSegment,
  sameFilters,
  segmentFromRows,
  type ConditionRow,
} from "./segmentRows";

/** The fields a condition can be about, as the People table offers them, with the caller's access applied. */
export const useConditionFields = () => {
  const fields = useUserFields();
  const { access } = useAccess();
  const catalog = React.useMemo(
    () => buildAudienceFields(fields.data, (resource) => canAccess({ access, resource, action: "VIEW" })),
    [fields.data, access],
  );
  return { catalog, dtos: fields.data ?? [], isLoading: fields.isLoading, isError: fields.isError, refetch: fields.refetch };
};

/** The groups the design names: Job (the organisation's references), Person (the system's own), the company's. */
export const useFieldOptions = (catalog: AudienceField[]): PickOption[] => {
  const t = useTranslations("automationsSettings");
  const groupLabel = (g: AudienceField["group"]) =>
    g === "Org" ? t("conditions.groups.job") : g === "System" ? t("conditions.groups.person") : t("conditions.groups.company");
  const order: AudienceField["group"][] = ["Org", "System", "Custom"];
  return order.flatMap((g) =>
    catalog
      .filter((f) => f.group === g)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((f) => ({ value: f.key, label: f.label, group: groupLabel(g), custom: g === "Custom" })),
  );
};

/**
 * The condition builder of automations (K12) — Who it runs for, a step's Only if, a split's paths, Activity's
 * Filters — over the People table's field catalogue, writing the `Segment` filter DSL.
 *
 * <p>**What the DSL can say, and so what is drawn.** A segment is a flat list of filters that must all hold (hris-api
 * `SegmentDTO`). There is no OR between filters and no nested group, so the joiner is the word "and", not an And / Or
 * switch, and there is no "Add a group"; "Poland or Lithuania" is one condition with "is any of". The time-off and
 * process "Only when" is a different DSL with both — `EventConditionBuilder`.
 */
export const ConditionBuilder: React.FC<
  ConditionBuilderProps & {
    /** Start with one condition whose field list is open — "Add a condition" was just pressed. */
    autoOpen?: boolean;
    /** The last condition was removed — a caller that shows "Add a condition" in its place goes back to it. */
    onEmpty?: () => void;
  }
> = ({ value, readOnly = false, onChange, count, autoOpen = false, onEmpty }) => {
  const t = useTranslations("automationsSettings");
  const { catalog, dtos, isLoading } = useConditionFields();
  const fieldOptions = useFieldOptions(catalog);
  const [rows, setRows] = React.useState<ConditionRow[]>(() => {
    const seeded = rowsFromSegment(value);
    return seeded.length ? seeded : autoOpen ? [blankRow()] : [];
  });
  const [openRow, setOpenRow] = React.useState<number | null>(() => (autoOpen && rows[0] && !rows[0].key ? rows[0].id : null));
  const emitted = React.useRef<typeof value>(value);

  // A change from outside (Undo, another version) re-seeds the rows; our own echo does not.
  React.useEffect(() => {
    if (!sameFilters(value, emitted.current)) {
      emitted.current = value;
      setRows(rowsFromSegment(value));
    }
  }, [value]);

  if (readOnly) {
    return (
      <div className="flex flex-col gap-3">
        <ConditionSummaryList filters={value?.filters ?? []} catalog={catalog} dtos={dtos} />
        {count && <MatchCount count={count} />}
      </div>
    );
  }

  const commit = (next: ConditionRow[]) => {
    setRows(next);
    const segment = segmentFromRows(next, value);
    emitted.current = segment;
    onChange(segment);
  };
  const patch = (id: number, changes: Partial<ConditionRow>) => commit(rows.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  const pickField = (id: number, key: string) => {
    const field = catalog.find((f) => f.key === key);
    patch(id, { key, op: field?.operators[0] ?? null, value: "", valueTo: "", values: [] });
  };
  const add = () => {
    const row = blankRow();
    setOpenRow(row.id);
    setRows([...rows, row]);
  };
  const remove = (id: number) => {
    const next = rows.filter((r) => r.id !== id);
    commit(next);
    if (next.length === 0) onEmpty?.();
  };
  const canAdd = rows.every((r) => r.key);

  return (
    <div className="flex flex-col gap-3">
      <ConditionGroup>
        {rows.map((row, i) => (
          <React.Fragment key={row.id}>
            {i > 0 && <ConditionJoiner value="AND" />}
            <ConditionRowCard
              row={row}
              catalog={catalog}
              dtos={dtos}
              fieldOptions={fieldOptions}
              loading={isLoading}
              autoOpen={openRow === row.id}
              onPickField={(key) => pickField(row.id, key)}
              onPatch={(changes) => patch(row.id, changes)}
              onRemove={() => remove(row.id)}
            />
          </React.Fragment>
        ))}
        {canAdd && <AddConditionButton onClick={add}>{t("conditions.add")}</AddConditionButton>}
      </ConditionGroup>
      {count && <MatchCount count={count} />}
    </div>
  );
};

const ConditionRowCard: React.FC<{
  row: ConditionRow;
  catalog: AudienceField[];
  dtos: FieldDTO[];
  fieldOptions: PickOption[];
  loading: boolean;
  autoOpen: boolean;
  onPickField: (key: string) => void;
  onPatch: (changes: Partial<ConditionRow>) => void;
  onRemove: () => void;
}> = ({ row, catalog, dtos, fieldOptions, loading, autoOpen, onPickField, onPatch, onRemove }) => {
  const t = useTranslations("automationsSettings");
  const field = catalog.find((f) => f.key === row.key) ?? null;
  const dto = dtos.find((d) => d.id === row.key) ?? null;
  return (
    <ConditionCard
      removeLabel={t("conditions.remove")}
      onRemove={onRemove}
      first={
        <CompactPick
          options={fieldOptions}
          value={row.key || null}
          onChange={onPickField}
          placeholder={t("conditions.pickField")}
          emptyLabel={t("common.noFieldsMatch")}
          ariaLabel={t("conditions.field")}
          defaultOpen={autoOpen}
          loading={loading}
        />
      }
      second={
        field && row.op ? (
          <>
            <div className="w-28 shrink-0">
              <CompactPick
                options={field.operators.map((op) => ({ value: op, label: t(`operator.${op}`) }))}
                value={row.op}
                onChange={(op) => onPatch({ op: op as AudienceOperator, value: "", valueTo: "", values: [] })}
                placeholder={t("conditions.pickOperator")}
                emptyLabel={t("conditions.noValues")}
                ariaLabel={t("conditions.operator")}
              />
            </div>
            <ConditionValue field={field} dto={dto} row={row} onPatch={onPatch} />
          </>
        ) : (
          // Dimmed until a field is picked (PRODUCT-RULES § Controls).
          <>
            <div className="w-28 shrink-0">
              <CompactPick options={[]} value={null} onChange={() => undefined} placeholder={t("conditions.is")}
                emptyLabel="" ariaLabel={t("conditions.operator")} disabled />
            </div>
            <div className="min-w-28 flex-1">
              <CompactPick options={[]} value={null} onChange={() => undefined} placeholder={t("conditions.pickValue")}
                emptyLabel="" ariaLabel={t("conditions.value")} disabled />
            </div>
          </>
        )
      }
    />
  );
};
