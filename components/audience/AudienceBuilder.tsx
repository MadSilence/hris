"use client";

import React, { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Badge } from "@/public/desact/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/public/desact/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/public/desact/src/components/ui/command";
import { useAccess } from "@/components/auth/useAccess";
import { canAccess } from "@/models/access";
import type { FieldDTO, FilterDTO, OptionDTO } from "@/models/user/fields";
import {
  AudienceField,
  AudienceOperator,
  AudienceValueSource,
  OPERATOR_LABELS,
  buildAudienceFields,
} from "@/components/audience/fieldCatalog";
import {
  AudienceOption,
  useAudienceFieldOptions,
} from "@/components/audience/hooks/useAudienceFieldOptions";

type Props = {
  fields: FieldDTO[] | undefined;
  value: FilterDTO[];
  onChange: (next: FilterDTO[]) => void;
};

type Row = {
  id: number;
  key: string;
  op: AudienceOperator | null;
  value: string;
  valueTo: string;
  values: string[];
};

const isMultiOp = (op: AudienceOperator) => op === "in" || op === "has_any";
const isRangeOp = (op: AudienceOperator) => op === "between";

const optionsForKey = (key: string, fields: FieldDTO[] | undefined): OptionDTO[] | null =>
  fields?.find((f) => f.id === key)?.options ?? null;

const rowComplete = (r: Row): boolean => {
  if (!r.key || !r.op) return false;
  if (isMultiOp(r.op)) return r.values.length > 0;
  if (isRangeOp(r.op)) return r.value.trim().length > 0 && r.valueTo.trim().length > 0;
  return r.value.trim().length > 0;
};

const toFilter = (r: Row): FilterDTO => {
  const base: FilterDTO = { field: r.key, op: r.op as AudienceOperator };
  if (isMultiOp(r.op as AudienceOperator)) return { ...base, values: r.values };
  if (isRangeOp(r.op as AudienceOperator)) return { ...base, value: r.value, valueTo: r.valueTo };
  return { ...base, value: r.value };
};

const fromFilter = (f: FilterDTO, id: number): Row => ({
  id,
  key: f.field,
  op: f.op,
  value: f.value ?? "",
  valueTo: f.valueTo ?? "",
  values: f.values ?? [],
});

let SEQ = 1;
const blankRow = (): Row => ({ id: SEQ++, key: "", op: null, value: "", valueTo: "", values: [] });

export const AudienceBuilder: React.FC<Props> = ({ fields, value, onChange }) => {
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
      {rows.map((r) => {
        const field = catalog.find((f) => f.key === r.key) ?? null;
        return (
          <div key={r.id} className="flex flex-wrap items-center gap-2">
            <Select value={r.key} onValueChange={(v) => onPickField(r.id, v)}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {catalog.map((f) => (
                  <SelectItem key={f.key} value={f.key}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {field && r.op && (
              <>
                <Select value={r.op} onValueChange={(v) => onPickOp(r.id, v as AudienceOperator)}>
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.operators.map((o) => (
                      <SelectItem key={o} value={o}>
                        {OPERATOR_LABELS[o]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <RuleValueEditor
                  source={field.valueSource}
                  op={r.op}
                  attributeOptions={optionsForKey(field.key, fields)}
                  value={r.value}
                  valueTo={r.valueTo}
                  values={r.values}
                  onValue={(v) => patch(r.id, { value: v })}
                  onValueTo={(v) => patch(r.id, { valueTo: v })}
                  onValues={(v) => patch(r.id, { values: v })}
                />
              </>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(r.id)}
              aria-label="Remove filter"
              className="ml-auto h-9 w-9 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      {allComplete && (
        <div>
          <Button type="button" variant="ghost" size="sm" onClick={addRow} className="gap-1.5 text-muted-foreground">
            <Plus className="h-4 w-4" />
            Add filter
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
  value: string;
  valueTo: string;
  values: string[];
  onValue: (v: string) => void;
  onValueTo: (v: string) => void;
  onValues: (v: string[]) => void;
};

const RuleValueEditor: React.FC<ValueEditorProps> = ({
  source,
  op,
  attributeOptions,
  value,
  valueTo,
  values,
  onValue,
  onValueTo,
  onValues,
}) => {
  const { options, isLoading, hasOptions } = useAudienceFieldOptions(source, attributeOptions);

  if (hasOptions) {
    if (isMultiOp(op)) {
      return <MultiSelect options={options} values={values} onChange={onValues} loading={isLoading} />;
    }
    return (
      <Select value={value} onValueChange={onValue}>
        <SelectTrigger className="h-9 w-44">
          <SelectValue placeholder={isLoading ? "Loading…" : "Select value"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const inputType = source === "date" ? "date" : source === "number" ? "number" : "text";

  if (isRangeOp(op)) {
    return (
      <div className="flex items-center gap-1">
        <Input className="h-9 w-32" type={inputType} value={value} onChange={(e) => onValue(e.target.value)} />
        <span className="text-sm text-muted-foreground">…</span>
        <Input className="h-9 w-32" type={inputType} value={valueTo} onChange={(e) => onValueTo(e.target.value)} />
      </div>
    );
  }

  return (
    <Input
      className="h-9 w-44"
      type={inputType}
      placeholder="Value"
      value={value}
      onChange={(e) => onValue(e.target.value)}
    />
  );
};

// ---- multiselect (Desact Command combobox: search + chips) --------------

const MultiSelect: React.FC<{
  options: AudienceOption[];
  values: string[];
  onChange: (v: string[]) => void;
  loading?: boolean;
}> = ({ options, values, onChange, loading }) => {
  const [open, setOpen] = useState(false);
  const toggle = (id: string) =>
    onChange(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);

  const selectedOptions = options.filter((o) => values.includes(o.id));

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="h-9 w-44 justify-between font-normal"
          >
            <span className="truncate text-muted-foreground">
              {values.length ? `${values.length} selected` : loading ? "Loading…" : "Select values"}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search…" className="h-9" />
            <CommandList>
              <CommandEmpty>No options</CommandEmpty>
              <CommandGroup>
                {options.map((o) => (
                  <CommandItem key={o.id} value={o.label} onSelect={() => toggle(o.id)}>
                    <Check
                      className={
                        values.includes(o.id) ? "mr-2 h-4 w-4 opacity-100" : "mr-2 h-4 w-4 opacity-0"
                      }
                    />
                    {o.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOptions.map((o) => (
        <Badge key={o.id} variant="secondary" className="gap-1 font-normal">
          {o.label}
          <button
            type="button"
            onClick={() => toggle(o.id)}
            aria-label={`Remove ${o.label}`}
            className="opacity-60 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
};
