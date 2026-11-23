"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/desact/input";
import { Checkbox } from "@/components/desact/checkbox";
import { useAccess } from "@/components/auth/useAccess";
import { UserPickerField } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { useUser } from "@/components/hooks/useUser/useUser";
import { canAccess } from "@/models/access";
import type { FieldDTO, FilterDTO } from "@/models/user/fields";
import { DatePicker, DateRangePicker } from "@/components/ui/DatePicker";
import { Combobox } from "@/components/ui/Combobox";
import { cn } from "@/lib/cn";
import {
  AudienceField,
  AudienceOperator,
  buildAudienceFields,
  isNegativeOperator,
} from "@/components/audience/fieldCatalog";
import { useAudienceFieldOptions } from "@/components/audience/hooks/useAudienceFieldOptions";
import {
  AddConditionButton,
  CompactSelect,
  ConditionCard,
  ConditionJoiner,
  PendingPick,
  type ConditionLayout,
} from "@/components/audience/ConditionChrome";

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
   * Segment-level, so it lives in the foot rather than on a condition. Omit the handler and the
   * control is not rendered at all — for callers where the population is not theirs to choose.
   */
  includeInactive?: boolean;
  onIncludeInactiveChange?: (next: boolean) => void;
  /** The checkbox's words — "search" fits a picker, not an access scope, which reaches people. */
  includeInactiveLabel?: string;
  /**
   * `line` (the default): each condition on one line — a popover 620 wide, a dialog. `stacked`: two lines, for a
   * narrow side panel (~320–400).
   */
  layout?: ConditionLayout;
  /**
   * The popover's buttons — Reset and Apply. Given, the builder is the popover's whole body: the conditions scroll
   * inside it and the foot (the checkboxes, then these) stays under a hairline.
   */
  actions?: React.ReactNode;
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

/**
 * The conditions of a list of people — the People table, the calendar, Attendance, a picker, an audience, an access
 * scope — in the product's one filter design (`hris/design/screens/filter`, N09b–N09d): a flat AND list of Mist cards,
 * each field 150 · operator 96 · value the rest · ×, "and" between them, "Add a condition" under them.
 *
 * <p>What one line has no room for (AQ-17, as the designers answered it): **include inactive** and **include empty**
 * are checkboxes in the foot, left of Reset; a **range of dates** is the shared date field in range mode; several
 * values from a list are the list's own dropdown, the picks ticked, the closed field reading the names that fit and
 * "+N" (MULTI-VALUE). Include empty is one choice for every excluding condition ("is not", "has none of").
 */
export const AudienceBuilder: React.FC<Props> = ({
  fields,
  isLoadingFields = false,
  value,
  onChange,
  includeInactive = false,
  onIncludeInactiveChange,
  includeInactiveLabel,
  layout = "line",
  actions,
}) => {
  const t = useTranslations("access");
  const { access } = useAccess();
  // Only offer fields the caller can actually see (e.g. no JOBS.TITLE VIEW → no Job filter).
  const catalog = useMemo(
    () => buildAudienceFields(fields, (resource) => canAccess({ access, resource, action: "VIEW" })),
    [fields, access],
  );
  const [rows, setRows] = useState<Row[]>(() =>
    value.length ? value.map((f) => fromFilter(f, SEQ++)) : [blankRow()],
  );
  // The row whose field list is open: a new condition opens it at once, and so does its operator or value pressed
  // before the field is picked (D5).
  const [fieldOpenFor, setFieldOpenFor] = useState<number | null>(null);

  const commit = (next: Row[]) => {
    setRows(next);
    onChange(next.filter(rowComplete).map(toFilter));
  };

  const patch = (id: number, changes: Partial<Row>) =>
    commit(rows.map((r) => (r.id === id ? { ...r, ...changes } : r)));

  const excluding = rows.filter((r) => r.op && isNegativeOperator(r.op));
  const includeEmpty = excluding.length > 0 && excluding.every((r) => r.includeEmpty);

  const onPickField = (id: number, key: string) => {
    const field = catalog.find((f) => f.key === key) ?? null;
    const op = field?.operators[0] ?? null;
    patch(id, { key, op, value: "", valueTo: "", values: [], includeEmpty: op ? isNegativeOperator(op) && includeEmpty : false });
  };

  const onPickOp = (id: number, op: AudienceOperator) =>
    patch(id, { op, value: "", valueTo: "", values: [], includeEmpty: isNegativeOperator(op) && includeEmpty });

  const addRow = () => {
    const row = blankRow();
    commit([...rows, row]);
    setFieldOpenFor(row.id);
  };
  const removeRow = (id: number) => {
    const next = rows.filter((r) => r.id !== id);
    commit(next.length ? next : [blankRow()]);
  };
  const setIncludeEmpty = (next: boolean) =>
    commit(rows.map((r) => (r.op && isNegativeOperator(r.op) ? { ...r, includeEmpty: next } : r)));

  const allComplete = rows.every(rowComplete);
  const popover = actions !== undefined;

  const checkboxes = (
    <>
      {onIncludeInactiveChange && (
        <FootCheckbox
          checked={includeInactive}
          onChange={onIncludeInactiveChange}
          label={includeInactiveLabel ?? t("audience.builder.includeInactive")}
        />
      )}
      {/* Only an exclusion has an opinion about people with no value at all. */}
      {excluding.length > 0 && (
        <FootCheckbox checked={includeEmpty} onChange={setIncludeEmpty} label={t("audience.builder.includeEmpty")} />
      )}
    </>
  );
  const hasCheckboxes = Boolean(onIncludeInactiveChange) || excluding.length > 0;

  const list = (
    <div className={cn("flex flex-col gap-2", popover && "min-h-0 flex-1 overflow-y-auto p-3")}>
      {rows.map((r, i) => {
        const field = catalog.find((f) => f.key === r.key) ?? null;
        const openField = () => setFieldOpenFor(r.id);
        return (
          <React.Fragment key={r.id}>
            {i > 0 && <ConditionJoiner />}
            <ConditionCard
              layout={layout}
              removeLabel={t("audience.builder.removeFilter")}
              onRemove={() => removeRow(r.id)}
              first={
                <FieldPicker
                  fields={catalog}
                  value={r.key}
                  onChange={(v) => {
                    onPickField(r.id, v);
                    setFieldOpenFor(null);
                  }}
                  loading={isLoadingFields}
                  open={fieldOpenFor === r.id ? true : undefined}
                  onOpenChange={(open) => setFieldOpenFor(open ? r.id : null)}
                />
              }
              second={
                field && r.op ? (
                  <>
                    <div className="w-24 shrink-0">
                      <CompactSelect
                        ariaLabel={t("audience.builder.operator")}
                        options={field.operators.map((o) => ({ value: o, label: t(`audience.operators.${o}`) }))}
                        value={r.op}
                        triggerLabel={t(`audience.operatorWords.${r.op}`)}
                        onChange={(v) => onPickOp(r.id, v as AudienceOperator)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <ValueCell
                        field={field}
                        dto={fields?.find((f) => f.id === field.key) ?? null}
                        row={r}
                        onPatch={(changes) => patch(r.id, changes)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-24 shrink-0">
                      <PendingPick placeholder={t("audience.operatorWords.eq")} ariaLabel={t("audience.builder.operator")} onPress={openField} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <PendingPick placeholder={t("audience.builder.selectValue")} ariaLabel={t("audience.builder.value")} onPress={openField} />
                    </div>
                  </>
                )
              }
            />
          </React.Fragment>
        );
      })}

      {allComplete && (
        <div className="py-1">
          <AddConditionButton onClick={addRow}>{t("audience.builder.addCondition")}</AddConditionButton>
        </div>
      )}
    </div>
  );

  if (popover) {
    // N09d: the list scrolls, the foot stays — the one place a divider stays.
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {list}
        <div className="flex flex-none flex-wrap items-center gap-x-4 gap-y-2 border-t border-divider px-3 py-2.5">
          {checkboxes}
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {list}
      {hasCheckboxes && <div className="flex flex-wrap items-center gap-x-4 gap-y-2">{checkboxes}</div>}
    </div>
  );
};

const FootCheckbox: React.FC<{ checked: boolean; onChange: (next: boolean) => void; label: string }> = ({
  checked,
  onChange,
  label,
}) => (
  <label className="flex cursor-pointer items-center gap-2 text-hint text-secondary">
    <Checkbox checked={checked} onCheckedChange={(c) => onChange(c === true)} />
    {label}
  </label>
);

// ---- the value of a condition ---------------------------------------------

const ValueCell: React.FC<{
  field: AudienceField;
  dto: FieldDTO | null;
  row: Row;
  onPatch: (changes: Partial<Row>) => void;
}> = ({ field, dto, row, onPatch }) => {
  const t = useTranslations("access");
  const tCommon = useTranslations("common");
  const source = field.valueSource;
  const { options: loaded, isLoading, hasOptions } = useAudienceFieldOptions(
    source === "boolean" ? "freeText" : source,
    dto?.options ?? null,
    dto?.type ?? null,
  );
  const op = row.op as AudienceOperator;
  const booleans = [
    { id: "true", label: tCommon("values.yes") },
    { id: "false", label: tCommon("values.no") },
  ];
  const options = source === "boolean" ? booleans : loaded;

  // People are searched, not enumerated — a company-wide dropdown of employees is unusable.
  if (source === "people") {
    return row.value ? (
      <PickedPersonField id={row.value} onValue={(v) => onPatch({ value: v })} />
    ) : (
      <UserPickerField value={null} onChange={(u) => onPatch({ value: u?.id ?? "" })} placeholder={t("audience.builder.selectPerson")} />
    );
  }

  // Every option list here is data — the company's records, its option lists, the world's countries — so every one
  // is searched (FORMS_AND_FIELDS.md § 7). Several values are the list's multi-pick, named on the closed field.
  if (hasOptions || source === "boolean") {
    const list = options.map((o) => ({ value: o.id, label: o.label }));
    if (isMultiOp(op)) {
      return (
        <Combobox
          multiple
          size="sm"
          options={list}
          value={row.values}
          onChange={(values) => onPatch({ values })}
          aria-label={t("audience.builder.value")}
          placeholder={isLoading ? tCommon("states.loading") : t("audience.builder.selectValues")}
          emptyLabel={list.length === 0 ? t("audience.builder.noOptions") : undefined}
          className="w-full"
          listClassName="min-w-56"
        />
      );
    }
    return (
      <Combobox
        size="sm"
        options={list}
        value={row.value || null}
        onChange={(v) => v && onPatch({ value: v })}
        clearable={false}
        aria-label={t("audience.builder.value")}
        placeholder={isLoading ? tCommon("states.loading") : t("audience.builder.selectValue")}
        emptyLabel={list.length === 0 ? t("audience.builder.noOptions") : undefined}
        className="w-full"
        listClassName="min-w-56"
      />
    );
  }

  if (isRangeOp(op) || isMultiOp(op)) {
    return <SummaryValue field={field} row={row} onPatch={onPatch} />;
  }

  // The one shared date field — a raw `<input type="date">` is the browser's control, not ours.
  if (source === "date") {
    return <DatePicker className="h-7 w-full" value={row.value} onChange={(v) => onPatch({ value: v })} ariaLabel={t("audience.builder.value")} />;
  }

  return (
    <Input
      className="h-7 w-full bg-card text-label"
      inputMode={source === "number" ? "decimal" : undefined}
      value={row.value}
      aria-label={t("audience.builder.value")}
      onChange={(e) => onPatch({ value: e.target.value })}
    />
  );
};

/**
 * A range ("between"), or several typed values, in the value cell itself (AQ-17, MULTI-VALUE — no separate popover):
 * a range of dates is the shared date field in range mode, reading "1 Jan – 31 Mar" and opening the one picker; a
 * range of numbers is its two ends side by side; several typed values are one field, comma-separated.
 */
const SummaryValue: React.FC<{
  field: AudienceField;
  row: Row;
  onPatch: (changes: Partial<Row>) => void;
}> = ({ field, row, onPatch }) => {
  const t = useTranslations("access");
  const op = row.op as AudienceOperator;

  if (isRangeOp(op) && field.valueSource === "date") {
    return (
      <DateRangePicker
        className="h-7 px-2 text-label"
        value={row.value && row.valueTo ? { start: row.value, end: row.valueTo } : null}
        onChange={(range) => onPatch({ value: range?.start ?? "", valueTo: range?.end ?? "" })}
        clearable={false}
        placeholder={t("audience.builder.selectValue")}
        ariaLabel={t("audience.builder.value")}
      />
    );
  }

  if (isRangeOp(op)) {
    const numeric = field.valueSource === "number";
    const end = (part: "value" | "valueTo", label: string) => (
      <Input
        className="h-7 min-w-0 flex-1 bg-card text-label"
        inputMode={numeric ? "decimal" : undefined}
        value={row[part]}
        aria-label={label}
        onChange={(e) => onPatch({ [part]: e.target.value })}
      />
    );
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        {end("value", t("audience.builder.from"))}
        {end("valueTo", t("audience.builder.to"))}
      </div>
    );
  }

  return <TypedValues values={row.values} onChange={(values) => onPatch({ values })} />;
};

/** Several typed values in one field, comma-separated; the text is kept as typed until the field is left. */
const TypedValues: React.FC<{ values: string[]; onChange: (values: string[]) => void }> = ({ values, onChange }) => {
  const t = useTranslations("access");
  const [text, setText] = useState<string | null>(null);
  const split = (raw: string) => raw.split(",").map((v) => v.trim()).filter(Boolean);
  return (
    <Input
      className="h-7 w-full bg-card text-label"
      value={text ?? values.join(", ")}
      aria-label={t("audience.builder.typedValues")}
      onChange={(e) => {
        setText(e.target.value);
        onChange(split(e.target.value));
      }}
      onBlur={() => setText(null)}
    />
  );
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

// ---- the field of a condition: searchable and grouped ------------------

const FIELD_GROUP_ORDER: AudienceField["group"][] = ["System", "Org", "Custom"];

/**
 * Fifty-odd fields do not fit a plain list (WALK_QUESTIONS § 17, answering NEED_TO_DISCUSS § 19 for
 * this case): the shared combobox the value pickers use — the field is its own search — with the fields in
 * their groups, 28 high inside the card.
 */
const FieldPicker: React.FC<{
  fields: AudienceField[];
  value: string;
  onChange: (key: string) => void;
  loading: boolean;
  open?: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ fields, value, onChange, loading, open, onOpenChange }) => {
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
      size="sm"
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
      className="w-full"
      listClassName="min-w-64"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
};
