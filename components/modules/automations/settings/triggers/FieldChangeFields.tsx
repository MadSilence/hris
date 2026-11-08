"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/desact/input";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import { DatePicker } from "@/components/ui/DatePicker";
import { UserPickerField } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { useReferenceOptions } from "@/components/hooks/useReferenceOptions";
import { useUser } from "@/components/hooks/useUser/useUser";
import type { ReferenceValueSource } from "@/models/user/fields";
import type { AutomationCatalog } from "@/models/automations";
import { CompactPick } from "../conditions/chrome";
import { Field, FieldStack, Hint, PartDivider } from "../parts/parts";
import { errorFor, type SettingsTranslator } from "../parts/problems";
import type { TriggerPartProps } from "./triggerPartProps";

const SYSTEM_FIELDS = [
  "hireDate",
  "probationEnd",
  "firstName",
  "lastName",
  "email",
  "manager",
  "job",
  "department",
  "office",
  "legalEntity",
  "team",
  "status",
] as const;
type SystemField = (typeof SYSTEM_FIELDS)[number];
const isSystemField = (v: string): v is SystemField => (SYSTEM_FIELDS as readonly string[]).includes(v);

/** Where an organisation field's values come from — the reference catalogues the profile picks from. */
const REFERENCE: Partial<Record<SystemField, ReferenceValueSource>> = {
  job: "jobs",
  department: "departments",
  office: "offices",
  legalEntity: "legalEntities",
  team: "teams",
};

const STATUSES = { PROSPECTIVE: "prospective", ACTIVE: "active", ARCHIVED: "archived" } as const;

/** A changeable field's name: the shared catalogue's for the system's own, the company's own name for theirs. */
export const changeableFieldLabel = (
  tA: ReturnType<typeof useTranslations<"automations">>,
  catalog: Pick<AutomationCatalog, "changeableFields">,
  value: string | null | undefined,
): string => {
  if (!value) return "";
  if (isSystemField(value)) return tA(`changeableField.${value}`);
  return catalog.changeableFields.find((f) => f.value === value)?.label ?? value;
};

/** "Any office": the system's names lower-cased inside the sentence, the company's own left as written. */
const anyOf = (t: SettingsTranslator, field: string, label: string) =>
  t("fieldChange.any", { field: isSystemField(field) ? label.toLocaleLowerCase() : label });

/**
 * A field changes (T2): which field, from what and to what (any, or a value — an organisation field's values from the
 * reference catalogues), and whether a change dated ahead runs on its day or when it is entered.
 */
export const FieldChangeFields: React.FC<TriggerPartProps> = ({ trigger, catalog, problems, onTrigger }) => {
  const t = useTranslations("automationsSettings");
  const tA = useTranslations("automations");
  const field = trigger.field ?? "";
  const label = changeableFieldLabel(tA, catalog, field);
  const custom = field.startsWith("attr:");
  const gone = Boolean(field) && !catalog.changeableFields.some((f) => f.value === field) && !isSystemField(field);

  const options = catalog.changeableFields.map((f) => ({
    value: f.value,
    label: changeableFieldLabel(tA, catalog, f.value),
    custom: f.value.startsWith("attr:"),
    group: f.value.startsWith("attr:") ? t("date.companyFields") : t("fieldChange.aboutPerson"),
  }));

  return (
    <FieldStack>
      <Field label={t("fieldChange.field")} required error={gone ? t("problems.removed") : errorFor(t, problems, "trigger.field")}>
        <CompactPick
          size="md"
          options={options}
          value={gone ? null : field || null}
          onChange={(value) => onTrigger({ field: value, from: null, to: null })}
          placeholder={t("fieldChange.pickField")}
          emptyLabel={t("common.noFieldsMatch")}
          ariaLabel={t("fieldChange.field")}
        />
      </Field>
      {field && !gone && (
        <>
          {custom ? (
            <Hint>{t("fieldChange.customFromHint")}</Hint>
          ) : (
            <Field label={t("fieldChange.from")} error={errorFor(t, problems, "trigger.from")}>
              <ChangeValue field={field} label={label} value={trigger.from ?? null} onChange={(from) => onTrigger({ from })}
                aria={t("fieldChange.from")} />
            </Field>
          )}
          <Field label={t("fieldChange.to")} error={errorFor(t, problems, "trigger.to")}>
            <ChangeValue field={field} label={label} value={trigger.to ?? null} onChange={(to) => onTrigger({ to })}
              aria={t("fieldChange.to")} />
          </Field>
        </>
      )}
      <PartDivider />
      <Field label={t("fieldChange.later")}>
        <RadioGroup
          value={trigger.when ?? "EFFECTIVE"}
          onValueChange={(v) => onTrigger({ when: v === "RECORDED" ? "RECORDED" : "EFFECTIVE" })}
          aria-label={t("fieldChange.later")}
        >
          {(["EFFECTIVE", "RECORDED"] as const).map((v) => (
            <label key={v} className="flex cursor-pointer items-start gap-2.5">
              <RadioGroupItem value={v} className="mt-0.5" />
              <span className="flex flex-col gap-0.5">
                <span className="text-body">{t(`fieldChange.when.${v}`)}</span>
                <Hint>{t(`fieldChange.whenHint.${v}`)}</Hint>
              </span>
            </label>
          ))}
        </RadioGroup>
      </Field>
    </FieldStack>
  );
};

/** From / To: "Any {field}" or a value of the field's kind. Null is any. */
const ChangeValue: React.FC<{
  field: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  aria: string;
}> = ({ field, label, value, onChange, aria }) => {
  const t = useTranslations("automationsSettings");
  const tCommon = useTranslations("common");
  const source = isSystemField(field) ? REFERENCE[field] : undefined;
  const reference = useReferenceOptions(source, Boolean(source));
  const any = anyOf(t, field, label);

  if (source) {
    return (
      <CompactPick
        size="md"
        options={[{ value: "", label: any }, ...reference.options.map((o) => ({ value: o.id, label: o.label }))]}
        value={value ?? ""}
        onChange={(v) => onChange(v || null)}
        placeholder={any}
        emptyLabel={t("common.noResults")}
        ariaLabel={aria}
        loading={reference.isLoading}
      />
    );
  }
  if (field === "status") {
    return (
      <CompactPick
        size="md"
        options={[{ value: "", label: any }, ...(Object.keys(STATUSES) as (keyof typeof STATUSES)[]).map((s) => ({ value: s, label: tCommon(`userStatus.${STATUSES[s]}`) }))]}
        value={value ?? ""}
        onChange={(v) => onChange(v || null)}
        placeholder={any}
        emptyLabel={t("common.noResults")}
        ariaLabel={aria}
      />
    );
  }
  if (field === "manager") return <ManagerValue value={value} onChange={onChange} any={any} />;
  if (field === "hireDate" || field === "probationEnd") {
    return <DatePicker value={value ?? ""} onChange={(v) => onChange(v || null)} placeholder={any} ariaLabel={aria} />;
  }
  // A typed value; empty is any — said in the field while it is empty, the one place this window does that.
  return <Input value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} placeholder={any} aria-label={aria} />;
};

const ManagerValue: React.FC<{ value: string | null; onChange: (v: string | null) => void; any: string }> = ({ value, onChange, any }) => {
  const { data } = useUser(value ?? "");
  const picked = value
    ? data
      ? { id: value, firstName: data.firstName, lastName: data.lastName, email: data.email, avatarUrl: data.avatarUrl }
      : { id: value }
    : null;
  return <UserPickerField value={picked} onChange={(u) => onChange(u?.id ?? null)} placeholder={any} />;
};
