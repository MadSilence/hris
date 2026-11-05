"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { useDisplayLanguage } from "@/lib/date";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Button } from "@/components/desact/button";
import { AttributeType } from "@/models/attribute";
import { ObjectFieldDef, ObjectRecord } from "@/models/attribute/objectFields";
import { getCatalogOptions, isManagedCatalogType } from "@/models/attribute/managedCatalogs";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

function inputType(t: AttributeType): string {
  if (t === AttributeType.NUMBER) return "number";
  if (t === AttributeType.DATE) return "date";
  return "text";
}

function asRecords(value: unknown): ObjectRecord[] {
  return Array.isArray(value) ? (value as ObjectRecord[]) : [];
}

/** One record's sub-field inputs (managed sub-types render a catalog Select). */
const RecordFieldsEditor: FC<{
  fields: ObjectFieldDef[];
  record: ObjectRecord;
  onChange: (record: ObjectRecord) => void;
}> = ({ fields, record, onChange }) => {
  const t = useTranslations("organization");
  const language = useDisplayLanguage();
  return (
  <div className="grid gap-2 sm:grid-cols-2">
    {fields.map((f) => {
      const cur = record[f.key] == null ? "" : String(record[f.key]);
      return (
        <div key={f.key} className="space-y-1">
          <Label className="text-hint">{f.labelKey ? t(f.labelKey) : f.label}</Label>
          {isManagedCatalogType(f.type) ? (
            <SearchableSelect
              options={getCatalogOptions(f.type, language)}
              value={cur || null}
              onChange={(v) => v && onChange({ ...record, [f.key]: v })}
              placeholder={t("profile.fields.selectPlaceholder")}
              clearable={false}
            />
          ) : (
            <Input
              type={inputType(f.type)}
              value={cur}
              onChange={(e) => onChange({ ...record, [f.key]: e.currentTarget.value })}
            />
          )}
        </div>
      );
    })}
  </div>
  );
};

const RecordFieldsView: FC<{ fields: ObjectFieldDef[]; record: ObjectRecord }> = ({ fields, record }) => {
  const t = useTranslations("organization");
  return (
  <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
    {fields.map((f) => {
      const v = record[f.key];
      return (
        <div key={f.key} className="flex gap-2 text-body">
          <dt className="text-tertiary">{f.labelKey ? t(f.labelKey) : f.label}:</dt>
          <dd className="text-primary">{v == null ? "" : String(v)}</dd>
        </div>
      );
    })}
  </dl>
  );
};

/* ── Repeatable OBJECT (list of records) ─────────────────────────────── */

export const ObjectRecordsView: FC<{ fields: ObjectFieldDef[]; value: unknown }> = ({ fields, value }) => {
  const tCommon = useTranslations("common");
  const records = asRecords(value);
  if (records.length === 0) return <span className="text-tertiary">{tCommon("values.none")}</span>;
  return (
    <div className="space-y-2">
      {records.map((rec, i) => (
        <div key={i} className="rounded-control border border-divider px-3 py-2">
          <RecordFieldsView fields={fields} record={rec} />
        </div>
      ))}
    </div>
  );
};

export const ObjectRecordsEditor: FC<{
  fields: ObjectFieldDef[];
  value: unknown;
  onChange: (records: ObjectRecord[]) => void;
}> = ({ fields, value, onChange }) => {
  const tCommon = useTranslations("common");
  const records = asRecords(value);
  return (
    <div className="space-y-3">
      {records.map((rec, i) => (
        <div key={i} className="space-y-2 rounded-control border border-divider p-3">
          <RecordFieldsEditor
            fields={fields}
            record={rec}
            onChange={(r) => onChange(records.map((x, idx) => (idx === i ? r : x)))}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onChange(records.filter((_, idx) => idx !== i))}
              className="flex items-center gap-1 text-hint text-tertiary hover:text-danger-text"
            >
              <Icon icon={Delete02Icon} size="sm" />
              {tCommon("actions.remove")}
            </button>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={() => onChange([...records, {}])}>
        <Icon icon={Add01Icon} size="sm" />
        {tCommon("actions.add")}
      </Button>
    </div>
  );
};

/* ── Single-record composites (ADDRESS, MONEY) ───────────────────────── */

export const SingleRecordView: FC<{ fields: ObjectFieldDef[]; value: unknown }> = ({ fields, value }) => {
  const tCommon = useTranslations("common");
  const record = asRecords(value)[0];
  const isEmpty = !record || fields.every((f) => record[f.key] == null || record[f.key] === "");
  if (isEmpty) return <span className="text-tertiary">{tCommon("values.notSet")}</span>;
  return <RecordFieldsView fields={fields} record={record} />;
};

export const SingleRecordEditor: FC<{
  fields: ObjectFieldDef[];
  value: unknown;
  onChange: (records: ObjectRecord[]) => void;
}> = ({ fields, value, onChange }) => {
  const record = asRecords(value)[0] ?? {};
  return <RecordFieldsEditor fields={fields} record={record} onChange={(r) => onChange([r])} />;
};
