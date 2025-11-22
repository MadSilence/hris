import * as React from "react";
import { Attribute } from "@/models/attribute/Attribute";
import { AttributeType } from "@/models/attribute/AttributeType";
import styles from "./PersonalInfoAttributesRow.module.css";
import UserChip from "@/components/ui/UserChip/UserChip";
import { Input } from "@/components/ui/Input";
import { Option } from "@/components/ui/Select";
import Select from "@/components/ui/Select/Select";

export type PersonalInfoAttributesRowProps = {
  attribute: Attribute;
  rawValue: unknown;

  isEdit?: boolean;
  onChange?: (v: unknown) => void;
};

export const PersonalInfoAttributesRow: React.FC<PersonalInfoAttributesRowProps> = ({
  attribute,
  rawValue,
  isEdit = false,
  onChange,
}) => {
  return (
    <div className={styles.row}>
      <div className={styles.label}>{attribute.name}</div>
      <div className={styles.value}>
        {!isEdit ? (
          <ViewValue attribute={attribute} rawValue={rawValue}/>
        ) : (
          <EditValue attribute={attribute} rawValue={rawValue} onChange={onChange!}/>
        )}
      </div>
    </div>
  );
};

/* ---------- View ---------- */

function ViewValue({ attribute, rawValue }: { attribute: Attribute; rawValue: unknown }) {
  const t = attribute.type;

  if (rawValue === null || rawValue === undefined || (typeof rawValue === "string" && rawValue.trim() === "")) {
    return <span className={`${styles.muted} ${styles.italic}`}>Not set</span>;
  }

  switch (t) {
    case AttributeType.URL: {
      const href = String(rawValue);
      return (
        <a href={href} target="_blank" rel="noreferrer" className="attrLink">
          {href}
        </a>
      );
    }
    case AttributeType.EMAIL: {
      const email = String(rawValue);
      return (
        <a href={`mailto:${email}`} className="attrLink">
          {email}
        </a>
      );
    }

    case AttributeType.DATE: {
      const s = formatDate(rawValue, !!attribute.dateHideYear);
      return <span>{s}</span>;
    }

    case AttributeType.SELECT:
    case AttributeType.STATUS: {
      const { label, color } = resolveSingleOption(attribute, rawValue);
      if (!label) return <span className={`${styles.muted} ${styles.italic}`}>Not set</span>;
      return (
        <span style={{ backgroundColor: `${color}`, padding: "0 8px", borderRadius: "999px" }}>
          {label}
        </span>
      );
    }
    case AttributeType.MULTI_SELECT: {
      const parts = resolveMultiOptions(attribute, rawValue);
      if (!parts.length) return <span className={`${styles.muted} ${styles.italic}`}>Not set</span>;
      return (
        <span style={{ display: "inline-flex", gap: "8px", flexWrap: "wrap" }}>
          {parts.map((p) => (
            <span key={p.key} style={{ backgroundColor: `${p.color}`, padding: "0 8px", borderRadius: "999px" }}>
              {p.label}
            </span>
          ))}
        </span>
      );
    }
    case AttributeType.PERSON: {
      // гибко: если пришел объект — используем UserChip; иначе просто строка
      if (rawValue && typeof rawValue === "object") {
        const rv = rawValue as any;
        if (rv.name && rv.href) {
          return <UserChip name={rv.name} href={rv.href} initials={rv.initials} color={rv.color} subtitle={rv.subtitle}/>;
        }
      }
      return <span>{String(rawValue)}</span>;
    }
    case AttributeType.NUMBER:
      return <span>{String(Number(rawValue))}</span>;
    case AttributeType.CHECKBOX:
      return <span>{String(Boolean(rawValue))}</span>;
    case AttributeType.TEXT:
    default:
      return <span>{String(rawValue)}</span>;
  }
}

/* ---------- Edit ---------- */

function EditValue({
  attribute,
  rawValue,
  onChange,
}: {
  attribute: Attribute;
  rawValue: unknown;
  onChange: (v: unknown) => void;
}) {
  const t = attribute.type;

  switch (t) {
    case AttributeType.TEXT:
    case AttributeType.URL:
    case AttributeType.EMAIL:
    case AttributeType.NUMBER:
      return (
        <Input
          type={t === AttributeType.NUMBER ? "number" : t === AttributeType.EMAIL ? "email" : "text"}
          value={rawValue == null ? "" : String(rawValue)}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case AttributeType.DATE: {
      // в input хранится yyyy-mm-dd; при показе форматируем.
      const iso = toInputDateValue(rawValue);
      return <Input type="date" value={iso} onChange={(e) => onChange(e.target.value)}/>;
    }

    case AttributeType.SELECT:
    case AttributeType.STATUS: {
      const options: Option[] = (attribute.options ?? []).map((o) => ({ value: o.id, label: o.value }));
      const cur = normalizeIdOrValue(attribute, rawValue);
      return (
        <Select
          value={cur ?? null}
          options={options}
          onChange={(v) => onChange(v)}
          placeholder="Select…"
        />
      );
    }

    case AttributeType.MULTI_SELECT: {
      const opts = attribute.options ?? [];
      const curSet = new Set<string>(normalizeArrayIdsOrValues(attribute, rawValue));
      // простой чекбокс-лист
      return (
        <div style={{ display: "grid", gap: "6px" }}>
          {opts.map((o) => {
            const checked = curSet.has(o.id) || curSet.has(o.value);
            return (
              <label key={o.id} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = new Set(curSet);
                    if (e.target.checked) next.add(o.id);
                    else {
                      next.delete(o.id);
                      next.delete(o.value);
                    }
                    onChange(Array.from(next));
                  }}
                />
                <span>{o.value}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case AttributeType.CHECKBOX:
      return <input type="checkbox" checked={Boolean(rawValue)} onChange={(e) => onChange(e.target.checked)}/>;

    case AttributeType.PERSON:
      // временно — текстовый ввод id/имени; когда появится people-picker — заменим
      return <Input value={rawValue == null ? "" : String(rawValue)} onChange={(e) => onChange(e.target.value)}/>;

    default:
      return <Input value={rawValue == null ? "" : String(rawValue)} onChange={(e) => onChange(e.target.value)}/>;
  }
}

/* ---------- helpers ---------- */
function parseDate(raw: unknown): Date | null {
  if (!raw) return null;

  if (typeof raw === "string") {
    const dmy = raw.trim();

    // строго yyyy-mm-dd → UTC дата
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dmy);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const da = Number(m[3]);
      // Создаём через UTC, а дальше берём UTC-компоненты при форматировании
      return new Date(Date.UTC(y, mo, da));
    }

    // иначе пусть парсит движок (ISO, timestamp и т.д.)
    const d = new Date(dmy);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // число или объект Date
  const d = new Date(raw as any);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(raw: unknown, hideYear: boolean): string {
  const d = parseDate(raw);
  if (!d) return String(raw ?? "");

  // используем UTC-геттеры, чтобы не было сдвига относительно полуночи
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();

  return hideYear ? `${dd}.${mm}` : `${dd}.${mm}.${yyyy}`;
}

function toInputDateValue(raw: unknown): string {
  const d = parseDate(raw);
  if (!d) return "";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

function resolveSingleOption(attribute: Attribute, raw: unknown): { label: string | null; color: string | undefined } {
  if (!attribute.options?.length) return { label: raw ? String(raw) : null, color: undefined };
  const idOrValue = normalizeIdOrValue(attribute, raw);
  const found = attribute.options.find((o) => o.id === idOrValue || o.value === idOrValue);
  return { label: found?.value ?? null, color: found?.color };
}

function resolveMultiOptions(attribute: Attribute, raw: unknown): Array<{ key: string; label: string; color?: string }> {
  const res: Array<{ key: string; label: string; color?: string }> = [];
  const arr = normalizeArrayIdsOrValues(attribute, raw);
  if (!arr.length) return res;
  for (const val of arr) {
    const found = attribute.options?.find((o) => o.id === val || o.value === val);
    if (found) res.push({ key: found.id, label: found.value, color: found.color });
    else res.push({ key: String(val), label: String(val) });
  }
  return res;
}

function normalizeIdOrValue(attribute: Attribute, raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw);
  // если пришёл id — оставим; если value — тоже допустим (фолбэк)
  const ids = new Set((attribute.options ?? []).map((o) => o.id));
  return ids.has(s) ? s : s;
}

function normalizeArrayIdsOrValues(attribute: Attribute, raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map(String);
  return [String(raw)];
}
