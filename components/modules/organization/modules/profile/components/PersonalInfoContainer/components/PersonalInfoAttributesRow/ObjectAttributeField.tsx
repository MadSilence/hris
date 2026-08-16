"use client";

import { FC } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { AttributeType } from "@/models/attribute";
import { ObjectFieldDef, ObjectRecord } from "@/models/attribute/objectFields";
import { getCatalogOptions, isManagedCatalogType } from "@/models/attribute/managedCatalogs";

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
}> = ({ fields, record, onChange }) => (
  <div className="grid gap-2 sm:grid-cols-2">
    {fields.map((f) => {
      const cur = record[f.key] == null ? "" : String(record[f.key]);
      return (
        <div key={f.key} className="space-y-1">
          <Label className="text-xs">{f.label}</Label>
          {isManagedCatalogType(f.type) ? (
            <Select value={cur || undefined} onValueChange={(v) => onChange({ ...record, [f.key]: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {getCatalogOptions(f.type).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

const RecordFieldsView: FC<{ fields: ObjectFieldDef[]; record: ObjectRecord }> = ({ fields, record }) => (
  <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
    {fields.map((f) => {
      const v = record[f.key];
      return (
        <div key={f.key} className="flex gap-2 text-sm">
          <dt className="text-muted-foreground">{f.label}:</dt>
          <dd className="text-foreground">{v == null || v === "" ? "—" : String(v)}</dd>
        </div>
      );
    })}
  </dl>
);

/* ── Repeatable OBJECT (list of records) ─────────────────────────────── */

export const ObjectRecordsView: FC<{ fields: ObjectFieldDef[]; value: unknown }> = ({ fields, value }) => {
  const records = asRecords(value);
  if (records.length === 0) return <span className="italic text-muted-foreground">None</span>;
  return (
    <div className="space-y-2">
      {records.map((rec, i) => (
        <div key={i} className="rounded-md border border-brown-100 px-3 py-2">
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
  const records = asRecords(value);
  return (
    <div className="space-y-3">
      {records.map((rec, i) => (
        <div key={i} className="space-y-2 rounded-md border border-brown-200 p-3">
          <RecordFieldsEditor
            fields={fields}
            record={rec}
            onChange={(r) => onChange(records.map((x, idx) => (idx === i ? r : x)))}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onChange(records.filter((_, idx) => idx !== i))}
              className="flex items-center gap-1 text-xs text-brown-400 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => onChange([...records, {}])}>
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </div>
  );
};

/* ── Single-record composites (ADDRESS, MONEY) ───────────────────────── */

export const SingleRecordView: FC<{ fields: ObjectFieldDef[]; value: unknown }> = ({ fields, value }) => {
  const record = asRecords(value)[0];
  const isEmpty = !record || fields.every((f) => record[f.key] == null || record[f.key] === "");
  if (isEmpty) return <span className="italic text-muted-foreground">Not set</span>;
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
