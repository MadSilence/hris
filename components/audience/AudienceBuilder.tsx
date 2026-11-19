"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { useAccess } from "@/components/auth/useAccess";
import {
  UserPickerField,
} from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { useUser } from "@/components/hooks/useUser/useUser";
import { canAccess } from "@/models/access";
import type { FieldDTO, FilterDTO, OptionDTO } from "@/models/user/fields";
import type { AttributeType } from "@/models/attribute/AttributeType";
import { DatePicker } from "@/components/ui/DatePicker";
import { Combobox } from "@/components/ui/Combobox";
import { Checkbox } from "@/components/desact/checkbox";
import {
  AudienceField,
  AudienceOperator,
  AudienceValueSource,
  buildAudienceFields,
  isNegativeOperator,
} from "@/components/audience/fieldCatalog";
import {
  AudienceOption,
  useAudienceFieldOptions,
} from "@/components/audience/hooks/useAudienceFieldOptions";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

type Props = {
  fields: FieldDTO[] | undefined;
  /**
   * Whether `fields` is still on its way.
   *
   * An empty field list and an unanswered field list look identical in a dropdown, and the reader
   * draws the wrong conclusion from the same picture: "there is nothing I can filter on" rather
   * than "wait a second". Four of the five callers fetch the fields themselves and none of them
   * passed the flag on.
   */
  isLoadingFields?: boolean;
  value: FilterDTO[];
  onChange: (next: FilterDTO[]) => void;
  /**
   * Segment-level, so it lives above the rows rather than on one of them. Omit the handler and the
   * control is not rendered at all — for callers where the population is not theirs to choose.
   */
  includeInactive?: boolean;
  onIncludeInactiveChange?: (next: boolean) => void;
  /** The checkbox's words — "search" fits a picker, not an access scope, which reaches people. */
  includeInactiveLabel?: string;
};

type Row = {
  id: number;
  key: string;
  op: AudienceOperator | null;
  value: string;
  valueTo: string;
  values: string[];
  includeEmpty: boolean;
};

const isMultiOp = (op: AudienceOperator) =>
  op === "in" || op === "has_any" || op === "not_in" || op === "not_has_any";
const isRangeOp = (op: AudienceOperator) => op === "between";

const optionsForKey = (key: string, fields: FieldDTO[] | undefined): OptionDTO[] | null =>
  fields?.find((f) => f.id === key)?.options ?? null;

const typeForKey = (key: string, fields: FieldDTO[] | undefined): AttributeType | null =>
  fields?.find((f) => f.id === key)?.type ?? null;

const rowComplete = (r: Row): boolean => {
  if (!r.key || !r.op) return false;
  if (isMultiOp(r.op)) return r.values.length > 0;
  if (isRangeOp(r.op)) return r.value.trim().length > 0 && r.valueTo.trim().length > 0;
  return r.value.trim().length > 0;
};

const toFilter = (r: Row): FilterDTO => {
  const op = r.op as AudienceOperator;
  // Only sent where it means something, so a positive filter's payload stays as it was.
  const base: FilterDTO = isNegativeOperator(op)
    ? { field: r.key, op, includeEmpty: r.includeEmpty }
    : { field: r.key, op };
  if (isMultiOp(op)) return { ...base, values: r.values };
  if (isRangeOp(op)) return { ...base, value: r.value, valueTo: r.valueTo };
  return { ...base, value: r.value };
};

const fromFilter = (f: FilterDTO, id: number): Row => ({
  id,
  key: f.field,
  op: f.op,
  value: f.value ?? "",
  valueTo: f.valueTo ?? "",
  values: f.values ?? [],
  includeEmpty: f.includeEmpty === true,
});

let SEQ = 1;
const blankRow = (): Row => ({
  id: SEQ++, key: "", op: null, value: "", valueTo: "", values: [], includeEmpty: false,
});

export const AudienceBuilder: React.FC<Props> = ({
  fields,
  isLoadingFields = false,
  value,
  onChange,
  includeInactive = false,
  onIncludeInactiveChange,
  includeInactiveLabel,
}) => {
  const t = useTranslations("access");
  const { access } = useAccess();
  // Only offer fields the caller can actually see (e.g. no JOBS.TITLE VIEW → no Job filter).
  const catalog = useMemo(
    () => buildAudienceFields(fields, (resource) => canAccess({ access, resource, action: "VIEW" })),
    [fields, access],
  );
  const [rows, setRows] = useState<Row[]>(() =>
    value.length ? value.map((f, i) => fromFilter(f, SEQ + i)) : [blankRow()],
  );

  const commit = (next: Row[]) => {
    setRows(next);
    onChange(next.filter(rowComplete).map(toFilter));
  };

  const patch = (id: number, changes: Partial<Row>) =>
    commit(rows.map((r) => (r.id === id ? { ...r, ...changes } : r)));

  const onPickField = (id: number, key: string) => {
    const field = catalog.find((f) => f.key === key) ?? null;
    patch(id, { key, op: field?.operators[0] ?? null, value: "", valueTo: "", values: [] });
  };

  const onPickOp = (id: number, op: AudienceOperator) =>
    patch(id, { op, value: "", valueTo: "", values: [] });

  const addRow = () => commit([...rows, blankRow()]);
  const removeRow = (id: number) => {
    const next = rows.filter((r) => r.id !== id);
    commit(next.length ? next : [blankRow()]);
  };

  const allComplete = rows.every(rowComplete);

  return (
    <div className="flex flex-col gap-2">
      {onIncludeInactiveChange && (
        <label className="flex cursor-pointer items-center gap-2 self-end text-hint text-tertiary">
          <Checkbox
            checked={includeInactive}
            onCheckedChange={(checked) => onIncludeInactiveChange(checked === true)}
          />
          {includeInactiveLabel ?? t("audience.builder.includeInactive")}
        </label>
      )}

      {rows.map((r) => {
        const field = catalog.find((f) => f.key === r.key) ?? null;
        // CM07 O4: the field 160, the operator as a word ("is"), the value taking the rest, then remove.
        return (
          <div key={r.id} className="flex flex-wrap items-center gap-2">
            <FieldPicker
              fields={catalog}
              value={r.key}
              onChange={(v) => onPickField(r.id, v)}
              loading={isLoadingFields}
            />

            {field && r.op && (
              <>
                {field.operators.length === 1 ? (
                  <span className="text-hint text-tertiary">{t(`audience.operatorWords.${r.op}`)}</span>
                ) : (
                  <Select value={r.op} onValueChange={(v) => onPickOp(r.id, v as AudienceOperator)}>
                    {/* The operator reads as a word in the sentence, 12/16 tertiary; it opens the full list. */}
                    <SelectTrigger
                      aria-label={t("audience.builder.operator")}
                      className="h-9 w-auto gap-1 border-transparent bg-transparent px-1 text-hint text-tertiary shadow-none hover:border-transparent [&_svg]:size-3"
                    >
                      <SelectValue>{t(`audience.operatorWords.${r.op}`)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {field.operators.map((o) => (
                        <SelectItem key={o} value={o}>
                          {t(`audience.operators.${o}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="min-w-48 flex-1">
                  <RuleValueEditor
                  source={field.valueSource}
                  op={r.op}
                  attributeOptions={optionsForKey(field.key, fields)}
                  attributeType={typeForKey(field.key, fields)}
                  value={r.value}
                  valueTo={r.valueTo}
                  values={r.values}
                  onValue={(v) => patch(r.id, { value: v })}
                  onValueTo={(v) => patch(r.id, { valueTo: v })}
                  onValues={(v) => patch(r.id, { values: v })}
                  />
                </div>

                {/* Only an exclusion has an opinion about people with no value at all. */}
                {isNegativeOperator(r.op) && (
                  <label className="flex cursor-pointer items-center gap-2 text-hint text-tertiary">
                    <Checkbox
                      checked={r.includeEmpty}
                      onCheckedChange={(checked) => patch(r.id, { includeEmpty: checked === true })}
                    />
                    {t("audience.builder.includeEmpty")}
                  </label>
                )}
              </>
            )}

            {/* O4: removing a row is not destructive — a 32 icon button, secondary, never red. */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeRow(r.id)}
              aria-label={t("audience.builder.removeFilter")}
              className="ml-auto text-secondary"
            >
              <Icon icon={Cancel01Icon} size="md" />
            </Button>
          </div>
        );
      })}

      {/* O5: ghost sm 32, + 16, 13/18 500 secondary, 10 under the last row. */}
      {allComplete && (
        <div className="mt-0.5">
          <Button type="button" variant="ghost" size="sm" onClick={addRow} className="gap-1.5 text-secondary">
            <Icon icon={Add01Icon} size="sm" />
            {t("audience.builder.addFilter")}
          </Button>
        </div>
      )}
    </div>
  );
};

// ---- value editor -------------------------------------------------------

type ValueEditorProps = {
  source: AudienceValueSource;
  op: AudienceOperator;
  attributeOptions: OptionDTO[] | null;
  attributeType: AttributeType | null;
  value: string;
  valueTo: string;
  values: string[];
  onValue: (v: string) => void;
  onValueTo: (v: string) => void;
  onValues: (v: string[]) => void;
};

/**
 * A rule stores only the person's id, so the picker was handed `{ id }` and drew "Unknown" for
 * whoever had just been chosen. The name is read back the way the policy wizard's approver field does.
 */
const PickedPersonField: React.FC<{ id: string; onValue: (v: string) => void }> = ({ id, onValue }) => {
  const t = useTranslations("access");
  const { data } = useUser(id);
  const value = data
    ? { id, firstName: data.firstName, lastName: data.lastName, email: data.email, avatarUrl: data.avatarUrl }
    : { id };
  return (
    <UserPickerField
      value={value}
      onChange={(user) => onValue(user?.id ?? "")}
      placeholder={t("audience.builder.selectPerson")}
    />
  );
};

const RuleValueEditor: React.FC<ValueEditorProps> = ({
  source,
  op,
  attributeOptions,
  attributeType,
  value,
  valueTo,
  values,
  onValue,
  onValueTo,
  onValues,
}) => {
  const t = useTranslations("access");
  const tCommon = useTranslations("common");
  const { options, isLoading, hasOptions } = useAudienceFieldOptions(source, attributeOptions, attributeType);

  // People are searched, not enumerated — a company-wide dropdown of employees is unusable.
  if (source === "people") {
    return (
      <div className="w-full">
        {value ? (
          <PickedPersonField id={value} onValue={onValue} />
        ) : (
          <UserPickerField
            value={null}
            onChange={(user) => onValue(user?.id ?? "")}
            placeholder={t("audience.builder.selectPerson")}
          />
        )}
      </div>
    );
  }

  if (hasOptions) {
    if (isMultiOp(op)) {
      return <MultiSelect options={options} values={values} onChange={onValues} loading={isLoading} />;
    }
    // Every option list here is data — the company's records, its own option lists, the world's
    // countries and zones — so every one is searched (FORMS_AND_FIELDS.md § 7).
    return (
      <SearchableSelect
        className="h-9 w-full"
        aria-label={t("audience.builder.value")}
        options={options.map((o) => ({ value: o.id, label: o.label }))}
        value={value || null}
        onChange={(v) => v && onValue(v)}
        placeholder={isLoading ? tCommon("states.loading") : t("audience.builder.selectValue")}
        clearable={false}
      />
    );
  }

  // The one shared date field — a raw `<input type="date">` is the browser's control, not ours.
  if (source === "date") {
    if (isRangeOp(op)) {
      return (
        <div className="flex items-center gap-1">
          <DatePicker className="h-9 min-w-0 flex-1" value={value} onChange={onValue} ariaLabel={t("audience.builder.from")} />
          <span className="text-body text-tertiary">…</span>
          <DatePicker className="h-9 min-w-0 flex-1" value={valueTo} onChange={onValueTo} ariaLabel={t("audience.builder.to")} />
        </div>
      );
    }
    return <DatePicker className="h-9 w-full" value={value} onChange={onValue} />;
  }

  const inputType = source === "number" ? "number" : "text";

  if (isRangeOp(op)) {
    return (
      <div className="flex items-center gap-1">
        <Input className="h-9 min-w-0 flex-1" type={inputType} value={value} onChange={(e) => onValue(e.target.value)} />
        <span className="text-body text-tertiary">…</span>
        <Input className="h-9 min-w-0 flex-1" type={inputType} value={valueTo} onChange={(e) => onValueTo(e.target.value)} />
      </div>
    );
  }

  return (
    <Input
      className="h-9 w-full"
      type={inputType}
      value={value}
      onChange={(e) => onValue(e.target.value)}
    />
  );
};

// ---- the field of a condition: searchable and grouped ------------------

const FIELD_GROUP_ORDER: AudienceField["group"][] = ["System", "Org", "Custom"];

/**
 * Fifty-odd fields do not fit a plain list (WALK_QUESTIONS § 17, answering NEED_TO_DISCUSS § 19 for
 * this case): the shared combobox the value pickers use — the field is its own search — with the fields in
 * their groups.
 */
const FieldPicker: React.FC<{
  fields: AudienceField[];
  value: string;
  onChange: (key: string) => void;
  loading: boolean;
}> = ({ fields, value, onChange, loading }) => {
  const t = useTranslations("access");
  // Alphabetical inside each group: the catalogue's own order is the registry's, which nobody reads by.
  const options = FIELD_GROUP_ORDER.flatMap((g) =>
    fields
      .filter((f) => f.group === g)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((f) => ({ value: f.key, label: f.label, keywords: f.key, group: t(`audience.builder.fieldGroups.${g}`) })),
  );

  // Hub A18: the field is the search — no search row inside the list.
  return (
    <Combobox
      options={options}
      value={value || null}
      onChange={(key) => {
        if (key) onChange(key);
      }}
      clearable={false}
      aria-label={t("audience.builder.field")}
      placeholder={loading ? t("audience.builder.loadingFields") : t("audience.builder.selectField")}
      emptyLabel={fields.length === 0 ? t("audience.builder.noFields") : undefined}
      disabled={loading}
      className="w-40"
    />
  );
};

// ---- multiselect (the shared combobox: the field searches, the picks are tags inside it) ------------

const MultiSelect: React.FC<{
  options: AudienceOption[];
  values: string[];
  onChange: (v: string[]) => void;
  loading?: boolean;
}> = ({ options, values, onChange, loading }) => {
  const t = useTranslations("access");
  const tCommon = useTranslations("common");
  // Hub A18: the field is the search. CM07 O4: the picks are tags inside the field, which takes the rest of the row.
  return (
    <Combobox
      multiple
      chips
      options={options.map((o) => ({ value: o.id, label: o.label }))}
      value={values}
      onChange={onChange}
      aria-label={t("audience.builder.value")}
      placeholder={loading ? tCommon("states.loading") : t("audience.builder.selectValues")}
      emptyLabel={options.length === 0 ? t("audience.builder.noOptions") : undefined}
      className="w-full"
      listClassName="min-w-56"
    />
  );
};
