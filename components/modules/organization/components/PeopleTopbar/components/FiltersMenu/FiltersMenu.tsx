import React, { useMemo, useState } from "react";
import styles from "./FiltersMenu.module.css";
import { Filter } from "@/components/models/filters";
import { FieldMeta } from "@/components/modules/organization/components/PeopleTopbar";

type FiltersMenuProps = {
  fields: FieldMeta[];
  filters: Filter[];
  onFiltersChange: (next: Filter[]) => void;
};

type Op =
  | "contains" | "starts_with" | "eq" | "neq"
  | "in" | "not_in"
  | "gt" | "lt" | "gte" | "lte"
  | "before" | "after" | "between"
  | "is_true" | "is_false";

const OPS_BY_TYPE: Record<FieldMeta["type"], Op[]> = {
  TEXT: ["contains", "starts_with", "eq", "neq"],
  EMAIL: ["contains", "starts_with", "eq"],
  URL: ["contains", "starts_with", "eq"],
  STATUS: ["in", "not_in"],
  SELECT: ["in", "not_in", "eq", "neq"],
  MULTI_SELECT: ["in", "not_in"],
  NUMBER: ["eq", "neq", "gt", "lt", "gte", "lte", "between"],
  DATE: ["before", "after", "between"],
  CHECKBOX: ["is_true", "is_false"],
  PERSON: ["eq", "neq", "contains"],
};

const OP_LABEL: Record<Op, string> = {
  contains: "Contains",
  starts_with: "Starts with",
  eq: "Equals",
  neq: "Not equals",
  in: "In list",
  not_in: "Not in list",
  gt: "Greater than",
  lt: "Less than",
  gte: "≥",
  lte: "≤",
  before: "Before",
  after: "After",
  between: "Between",
  is_true: "Is true",
  is_false: "Is false",
};

export const FiltersMenu: React.FC<FiltersMenuProps> = ({
  fields, filters, onFiltersChange
}) => {
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [pickedField, setPickedField] = useState<FieldMeta | null>(null);

  const [op, setOp] = useState<Op | null>(null);
  const [value, setValue] = useState<string>("");
  const [values, setValues] = useState<string[]>([]);
  const [valueTo, setValueTo] = useState<string>("");

  const resetEditor = () => {
    setOp(null); setValue(""); setValues([]); setValueTo("");
  };

  const openEditor = (f: FieldMeta) => {
    setPickedField(f);
    setMode("editor");
    resetEditor();
  };

  const commitRule = () => {
    if (!pickedField || !op) return;

    const base: Filter = { field: fieldKeyOf(pickedField), op } as any;

    if (op === "between") {
      onFiltersChange([...filters, { ...base, value, valueTo }]);
    } else if (op === "in" || op === "not_in") {
      onFiltersChange([...filters, { ...base, values }]);
    } else if (op === "is_true" || op === "is_false") {
      onFiltersChange([...filters, { ...base, value: op === "is_true" ? "true" : "false" }]);
    } else {
      onFiltersChange([...filters, { ...base, value }]);
    }

    setMode("list");
    setPickedField(null);
    resetEditor();
  };

  const ops = useMemo<Op[]>(() => {
    if (!pickedField) return [];
    return OPS_BY_TYPE[pickedField.type] ?? ["eq"];
  }, [pickedField]);

  return (
    <div className={styles.menuPopup} role="menu" aria-label="Filters">
      {mode === "list" && (
        <>
          <div className={styles.searchRow}>
            <input className={styles.searchInput} placeholder="Select a value" />
          </div>
          <div className={styles.fieldList} role="listbox" aria-label="Available fields">
            {fields.map((f) => (
              <button key={f.id} className={styles.fieldRow} onClick={() => openEditor(f)}>
                <span className={styles.fieldIcon}>•</span>
                <span className={styles.fieldLabel}>{f.label ?? f.key ?? f.id}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {mode === "editor" && pickedField && (
        <>
          <div className={styles.editorHeader}>
            <button className={styles.link} onClick={() => { setMode("list"); setPickedField(null); }}>← Back</button>
            <div className={styles.editorTitle}>{pickedField.label ?? pickedField.key ?? pickedField.id}</div>
          </div>

          <div className={styles.editorRow}>
            <select className={styles.select} value={op ?? ""} onChange={(e) => setOp(e.target.value as Op)}>
              <option value="" disabled>Select operator</option>
              {ops.map((o) => <option key={o} value={o}>{OP_LABEL[o]}</option>)}
            </select>

            <RuleValueInput
              field={pickedField}
              op={op}
              value={value}
              values={values}
              valueTo={valueTo}
              onValue={setValue}
              onValues={setValues}
              onValueTo={setValueTo}
            />
          </div>

          <div className={styles.editorActions}>
            <button className={styles.btnSecondary} onClick={() => { setMode("list"); setPickedField(null); }}>Cancel</button>
            <button className={styles.btnPrimary} disabled={!op || !canCommit(pickedField, op, value, values, valueTo)} onClick={commitRule}>
              Add rule
            </button>
          </div>
        </>
      )}
    </div>
  );
};

function fieldKeyOf(f: FieldMeta) {
  if (f.id.startsWith("sys:")) return f.id.slice(4);
  return f.id;
}

function canCommit(field: FieldMeta, op: Op, v: string, vs: string[], v2: string) {
  if (op === "between") return Boolean(v && v2);
  if (op === "in" || op === "not_in") return vs?.length > 0;
  if (op === "is_true" || op === "is_false") return true;
  // DATE/NUMBER eq/gt/… — простая валидация на непустое
  return Boolean(v?.trim().length);
}

const RuleValueInput: React.FC<{
  field: FieldMeta;
  op: Op | null;
  value: string;
  values: string[];
  valueTo: string;
  onValue: (v: string) => void;
  onValues: (v: string[]) => void;
  onValueTo: (v: string) => void;
}> = ({ field, op, value, values, valueTo, onValue, onValues, onValueTo }) => {
  if (!op) return <span />;

  if (op === "is_true" || op === "is_false") return <span className={styles.hint}>Will filter by {op === "is_true" ? "true" : "false"}</span>;

  if (field.type === "DATE" && op === "between") {
    return (
      <div className={styles.rangeRow}>
        <input type="date" className={styles.input} value={value} onChange={(e) => onValue(e.target.value)} />
        <span className={styles.rangeSep}>…</span>
        <input type="date" className={styles.input} value={valueTo} onChange={(e) => onValueTo(e.target.value)} />
      </div>
    );
  }

  if (field.type === "DATE") {
    return <input type="date" className={styles.input} value={value} onChange={(e) => onValue(e.target.value)} />;
  }

  if ((field.type === "SELECT" || field.type === "MULTI_SELECT" || field.type === "STATUS") && (op === "in" || op === "not_in")) {
    return (
      <MultiSelect
        options={field.options ?? []}
        values={values}
        onChange={onValues}
        placeholder="Select items"
      />
    );
  }
  if ((field.type === "SELECT" || field.type === "STATUS") && (op === "eq" || op === "neq")) {
    return (
      <select className={styles.select} value={value} onChange={(e) => onValue(e.target.value)}>
        <option value="" disabled>Select item</option>
        {(field.options ?? []).map(o => <option key={o.id} value={o.value}>{o.value}</option>)}
      </select>
    );
  }

  // NUMBER between
  if (field.type === "NUMBER" && op === "between") {
    return (
      <div className={styles.rangeRow}>
        <input type="number" className={styles.input} value={value} onChange={(e) => onValue(e.target.value)} />
        <span className={styles.rangeSep}>…</span>
        <input type="number" className={styles.input} value={valueTo} onChange={(e) => onValueTo(e.target.value)} />
      </div>
    );
  }

  return (
    <input
      className={styles.input}
      type={field.type === "NUMBER" ? "number" : "text"}
      placeholder="Value"
      value={value}
      onChange={(e) => onValue(e.target.value)}
    />
  );
};

const MultiSelect: React.FC<{
  options: { id: string; value: string }[];
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}> = ({ options, values, onChange, placeholder }) => {
  return (
    <div className={styles.multiBox}>
      <button className={styles.multiBtn} type="button">
        {values.length ? `${values.length} selected` : (placeholder ?? "Select items")}
      </button>
      <div className={styles.multiList}>
        {options.map((o) => {
          const checked = values.includes(o.value);
          return (
            <label key={o.id} className={styles.multiRow}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  if (e.target.checked) onChange([...values, o.value]);
                  else onChange(values.filter(v => v !== o.value));
                }}
              />
              <span>{o.value}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
