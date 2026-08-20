import * as React from "react";
import { Attribute } from "@/models/attribute/Attribute";
import { AttributeType } from "@/models/attribute/AttributeType";
import { getCatalogOptions } from "@/models/attribute/managedCatalogs";
import { parseCheckboxValue, parsePersonValue } from "@/models/attribute/attributeValue";
import { getObjectSchema } from "@/models/attribute/objectFields";
import {
  ObjectRecordsView,
  ObjectRecordsEditor,
  SingleRecordView,
  SingleRecordEditor,
} from "./ObjectAttributeField";
import UserChip from "@/components/ui/UserChip/UserChip";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Input } from "@/public/desact/src/components/ui/input";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";

export type PersonalInfoAttributesRowProps = {
  attribute: Attribute;
  rawValue: unknown;

  /** Sensitive field the caller may not view: the server already replaced the value with a mask. */
  masked?: boolean;
  isEdit?: boolean;
  onChange?: (v: unknown) => void;
  onValidityChange?: (error: string | null) => void;
};

export const PersonalInfoAttributesRow: React.FC<PersonalInfoAttributesRowProps> = ({
  attribute,
  rawValue,
  masked = false,
  isEdit = false,
  onChange,
  onValidityChange,
}) => {
  const error = isEdit ? fieldError(attribute, rawValue) : null;

  // Report this field's validity up so the container can block Save.
  const onValidityChangeRef = React.useRef(onValidityChange);
  onValidityChangeRef.current = onValidityChange;
  React.useEffect(() => {
    onValidityChangeRef.current?.(error);
  }, [error]);
  React.useEffect(() => () => onValidityChangeRef.current?.(null), []);

  return (
    <div className="grid grid-cols-[minmax(14rem,18rem)_1fr] gap-5 py-4">
      <div className="text-sm text-muted-foreground">
        <span>{attribute.name}</span>
        {attribute.required && (
          <span className="ml-0.5 text-destructive" title="Required">*</span>
        )}
        {attribute.description && (
          <p className="mt-0.5 text-xs text-muted-foreground/80">
            {attribute.description}
          </p>
        )}
      </div>
      <div className="text-sm text-foreground">
        {masked ? (
          // The server sent a placeholder, not a value — render it as-is. Going through the
          // type-specific renderers would turn "••••" into "Not set" for options and dates.
          <span
            className="text-muted-foreground"
            title="You don't have access to this field's value"
          >
            {rawValue == null ? "—" : String(rawValue)}
          </span>
        ) : !isEdit ? (
          <ViewValue attribute={attribute} rawValue={rawValue}/>
        ) : (
          <>
            <EditValue attribute={attribute} rawValue={rawValue} onChange={onChange!}/>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

/* ---------- View ---------- */

function ViewValue({ attribute, rawValue }: { attribute: Attribute; rawValue: unknown }) {
  const t = attribute.type;

  if (
    rawValue === null ||
    rawValue === undefined ||
    (typeof rawValue === "string" && rawValue.trim() === "")
  ) {
    return <span className="text-muted-foreground italic">Not set</span>;
  }

  switch (t) {
    case AttributeType.URL: {
      const href = String(rawValue);
      return (
        <a href={href} target="_blank" rel="noreferrer" className="text-brown-600 hover:underline break-all">
          {href}
        </a>
      );
    }

    case AttributeType.EMAIL: {
      const email = String(rawValue);
      return (
        <a href={`mailto:${email}`} className="text-brown-600 hover:underline break-all">
          {email}
        </a>
      );
    }

    case AttributeType.PHONE: {
      const phone = String(rawValue);
      return (
        <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-brown-600 hover:underline">
          {phone}
        </a>
      );
    }

    case AttributeType.DATE: {
      const s = formatDate(rawValue, !!attribute.dateHideYear);
      return <span>{s}</span>;
    }

    case AttributeType.SELECT: {
      const { label, color } = resolveSingleOption(attribute, rawValue);

      if (!label) {
        return <span className="text-muted-foreground italic">Not set</span>;
      }

      return <OptionBadge label={label} color={color}/>;
    }

    case AttributeType.MULTI_SELECT: {
      const parts = resolveMultiOptions(attribute, rawValue);

      if (!parts.length) {
        return <span className="text-muted-foreground italic">Not set</span>;
      }

      return (
        <span className="inline-flex flex-wrap gap-2">
          {parts.map((p) => (
            <OptionBadge key={p.key} label={p.label} color={p.color}/>
          ))}
        </span>
      );
    }

    case AttributeType.PERSON: {
      // The backend resolves the stored user id into {id, name}; an id it can't resolve (deleted
      // user, or free text written before values were validated) falls through as raw text.
      const person = parsePersonValue(rawValue);
      if (person) {
        return (
          <UserChip
            name={person.name}
            href={`/organization/people/${person.id}/personal`}
          />
        );
      }

      return <span>{String(rawValue)}</span>;
    }

    case AttributeType.NUMBER: {
      const n = Number(rawValue);
      return <span>{Number.isFinite(n) ? String(n) : String(rawValue)}</span>;
    }

    case AttributeType.CHECKBOX:
      // Values arrive as strings, so a stored `false` is the truthy string "false".
      return <span>{parseCheckboxValue(rawValue) ? "Yes" : "No"}</span>;

    case AttributeType.OBJECT:
      return (
        <ObjectRecordsView fields={getObjectSchema(t, attribute.objectFields)} value={rawValue} />
      );

    case AttributeType.ADDRESS:
    case AttributeType.MONEY:
      return <SingleRecordView fields={getObjectSchema(t)} value={rawValue} />;

    case AttributeType.LONG_TEXT:
      return <p className="whitespace-pre-wrap break-words">{String(rawValue)}</p>;

    case AttributeType.TEXT:
    default:
      return <span>{String(rawValue)}</span>;
  }
}

function OptionBadge({ label, color }: { label: string; color?: string }) {
  return (
    <Badge variant="secondary" className="gap-1.5 font-normal">
      {color && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      )}
      {label}
    </Badge>
  );
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
    case AttributeType.PHONE:
    case AttributeType.NUMBER: {
      const isNum = t === AttributeType.NUMBER;
      return (
        <Input
          type={
            isNum
              ? "number"
              : t === AttributeType.EMAIL
                ? "email"
                : t === AttributeType.PHONE
                  ? "tel"
                  : "text"
          }
          value={rawValue == null ? "" : String(rawValue)}
          placeholder={attribute.defaultValue ?? undefined}
          onChange={(e) => onChange(e.target.value)}
          min={isNum ? attribute.minValue ?? undefined : undefined}
          max={isNum ? attribute.maxValue ?? undefined : undefined}
          step={isNum ? (attribute.decScale != null ? String(Math.pow(10, -attribute.decScale)) : "1") : undefined}
          minLength={!isNum ? attribute.minLength ?? undefined : undefined}
          maxLength={!isNum ? attribute.maxLength ?? undefined : undefined}
          pattern={!isNum ? attribute.regex ?? undefined : undefined}
        />
      );
    }

    case AttributeType.LONG_TEXT:
      return (
        <Textarea
          value={rawValue == null ? "" : String(rawValue)}
          onChange={(e) => onChange(e.currentTarget.value)}
          minLength={attribute.minLength ?? undefined}
          maxLength={attribute.maxLength ?? undefined}
          className="min-h-24"
        />
      );

    case AttributeType.COUNTRY:
    case AttributeType.LANGUAGE:
    case AttributeType.TIMEZONE:
    case AttributeType.CURRENCY: {
      const options = getCatalogOptions(t);
      const cur = rawValue == null || rawValue === "" ? undefined : String(rawValue);

      return (
        <Select value={cur} onValueChange={(v) => onChange(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select…"/>
          </SelectTrigger>

          <SelectContent className="max-h-72">
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case AttributeType.OBJECT:
      return (
        <ObjectRecordsEditor
          fields={getObjectSchema(t, attribute.objectFields)}
          value={rawValue}
          onChange={(records) => onChange(records)}
        />
      );

    case AttributeType.ADDRESS:
    case AttributeType.MONEY:
      return (
        <SingleRecordEditor
          fields={getObjectSchema(t)}
          value={rawValue}
          onChange={(records) => onChange(records)}
        />
      );

    case AttributeType.DATE: {
      const iso = toInputDateValue(rawValue);

      return (
        <Input
          type="date"
          value={iso}
          min={attribute.minDate ?? undefined}
          max={attribute.maxDate ?? undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    case AttributeType.SELECT: {
      const options = attribute.options ?? [];
      const cur = normalizeIdOrValue(attribute, rawValue);

      return (
        <Select value={cur ?? undefined} onValueChange={(v) => onChange(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select…"/>
          </SelectTrigger>

          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case AttributeType.MULTI_SELECT: {
      const opts = attribute.options ?? [];
      const curSet = new Set<string>(normalizeArrayIdsOrValues(attribute, rawValue));

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

                    if (e.target.checked) {
                      next.add(o.id);
                    } else {
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
      return (
        <input
          type="checkbox"
          checked={parseCheckboxValue(rawValue)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );

    case AttributeType.PERSON: {
      // A PERSON value is a user id, which the server now validates. Until this field gets a real
      // people-picker, editing is disabled rather than offering a text box that can only fail.
      const person = parsePersonValue(rawValue);
      return (
        <div className="space-y-1">
          <Input value={person?.name ?? ""} disabled readOnly placeholder="No one selected" />
          <p className="text-xs text-muted-foreground">
            Choosing a person isn&apos;t available here yet.
          </p>
        </div>
      );
    }

    default:
      return (
        <Input
          value={rawValue == null ? "" : String(rawValue)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

/* ---------- validation (mirrors server-side UserAttributeValueWriter) ---------- */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const URL_RE = /^https?:\/\/\S+$/i;

function isEmptyValue(raw: unknown): boolean {
  return (
    raw === null ||
    raw === undefined ||
    (typeof raw === "string" && raw.trim() === "") ||
    (Array.isArray(raw) && raw.length === 0)
  );
}

/** Client-side pre-validation for a single attribute value. Returns an error string or null.
 *  The server (UserAttributeValueWriter) remains authoritative; this is just inline feedback. */
function fieldError(attribute: Attribute, raw: unknown): string | null {
  if (attribute.required && isEmptyValue(raw)) return "This field is required.";
  if (isEmptyValue(raw)) return null;

  switch (attribute.type) {
    case AttributeType.NUMBER: {
      const n = Number(raw);
      if (!Number.isFinite(n)) return "Must be a number.";
      if (attribute.onlyPositive && n < 0) return "Must be a positive number.";
      if (attribute.minValue != null && n < attribute.minValue) return `Must be ≥ ${attribute.minValue}.`;
      if (attribute.maxValue != null && n > attribute.maxValue) return `Must be ≤ ${attribute.maxValue}.`;
      return null;
    }
    case AttributeType.TEXT:
    case AttributeType.EMAIL:
    case AttributeType.URL: {
      const s = String(raw);
      if (attribute.minLength != null && s.length < attribute.minLength)
        return `Must be at least ${attribute.minLength} characters.`;
      if (attribute.maxLength != null && s.length > attribute.maxLength)
        return `Must be at most ${attribute.maxLength} characters.`;
      if (attribute.type === AttributeType.EMAIL && !EMAIL_RE.test(s)) return "Enter a valid email address.";
      if (attribute.type === AttributeType.URL && !URL_RE.test(s))
        return "Enter a valid URL (starting with http:// or https://).";
      if (attribute.regex) {
        try {
          if (!new RegExp(attribute.regex).test(s)) return "Doesn't match the required format.";
        } catch {
          /* invalid pattern configured — let the server decide */
        }
      }
      return null;
    }
    case AttributeType.LONG_TEXT: {
      const s = String(raw);
      if (attribute.minLength != null && s.length < attribute.minLength)
        return `Must be at least ${attribute.minLength} characters.`;
      if (attribute.maxLength != null && s.length > attribute.maxLength)
        return `Must be at most ${attribute.maxLength} characters.`;
      return null;
    }
    case AttributeType.PHONE: {
      const s = String(raw);
      const digits = s.replace(/[^0-9]/g, "");
      if (digits.length < 7 || digits.length > 15) return "Enter a valid phone number.";
      if (attribute.minLength != null && s.length < attribute.minLength)
        return `Must be at least ${attribute.minLength} characters.`;
      if (attribute.maxLength != null && s.length > attribute.maxLength)
        return `Must be at most ${attribute.maxLength} characters.`;
      if (attribute.regex) {
        try {
          if (!new RegExp(attribute.regex).test(s)) return "Doesn't match the required format.";
        } catch {
          /* invalid pattern configured — let the server decide */
        }
      }
      return null;
    }
    case AttributeType.DATE: {
      const s = String(raw);
      if (attribute.minDate && s < attribute.minDate) return `Must be on or after ${attribute.minDate}.`;
      if (attribute.maxDate && s > attribute.maxDate) return `Must be on or before ${attribute.maxDate}.`;
      return null;
    }
    case AttributeType.MULTI_SELECT: {
      const arr = Array.isArray(raw) ? raw : [raw];
      if (attribute.minSelect != null && arr.length < attribute.minSelect)
        return `Select at least ${attribute.minSelect}.`;
      if (attribute.maxSelect != null && arr.length > attribute.maxSelect)
        return `Select at most ${attribute.maxSelect}.`;
      return null;
    }
    default:
      return null;
  }
}

/* ---------- helpers ---------- */

function parseDate(raw: unknown): Date | null {
  if (!raw) return null;

  if (typeof raw === "string") {
    const dmy = raw.trim();

    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dmy);

    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const da = Number(m[3]);

      return new Date(Date.UTC(y, mo, da));
    }

    const d = new Date(dmy);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(raw as string | number | Date);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(raw: unknown, hideYear: boolean): string {
  const d = parseDate(raw);
  if (!d) return String(raw ?? "");

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

function resolveSingleOption(
  attribute: Attribute,
  raw: unknown,
): { label: string | null; color: string | undefined } {
  if (!attribute.options?.length) {
    return { label: raw ? String(raw) : null, color: undefined };
  }

  const idOrValue = normalizeIdOrValue(attribute, raw);
  const found = attribute.options.find((o) => o.id === idOrValue || o.value === idOrValue);

  return { label: found?.value ?? null, color: found?.color };
}

function resolveMultiOptions(
  attribute: Attribute,
  raw: unknown,
): Array<{ key: string; label: string; color?: string }> {
  const res: Array<{ key: string; label: string; color?: string }> = [];
  const arr = normalizeArrayIdsOrValues(attribute, raw);

  if (!arr.length) return res;

  for (const val of arr) {
    const found = attribute.options?.find((o) => o.id === val || o.value === val);

    if (found) {
      res.push({ key: found.id, label: found.value, color: found.color });
    } else {
      res.push({ key: String(val), label: String(val) });
    }
  }

  return res;
}

function normalizeIdOrValue(attribute: Attribute, raw: unknown): string | null {
  if (raw == null) return null;

  const s = String(raw);
  const ids = new Set((attribute.options ?? []).map((o) => o.id));

  return ids.has(s) ? s : s;
}

function normalizeArrayIdsOrValues(attribute: Attribute, raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map(String);

  return [String(raw)];
}
