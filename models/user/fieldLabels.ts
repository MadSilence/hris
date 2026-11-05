import type { useTranslations } from "next-intl";

import type { FieldDTO } from "@/models/user/fields";
import { EMPLOYMENT_TYPES } from "@/models/user/employmentType";
import { USER_STATUS_KEYS } from "@/models/user/status";

type AccessT = ReturnType<typeof useTranslations<"access">>;
type CommonT = ReturnType<typeof useTranslations<"common">>;
type OrganizationT = ReturnType<typeof useTranslations<"organization">>;

/**
 * The product's own names for its system fields, in the reader's language.
 *
 * `GET /users/fields` sends the backend registry's English (`FieldRegistry`: "Hire date", the groups
 * "Account" / "Employment" / "Organization", the status and employment-type options). Those are the product's
 * words, not the company's, so they are translated here — once, where the list is read — and every screen that
 * renders a field (the People table's columns and filters, the profile, bulk edit, views) gets them. A field the
 * map does not know, and every attribute a company created, keeps the label it came with (I18N.md § 9).
 * Found on the i18n walk of 2026-11-05: the People table's headers were English on a Russian company.
 */
export const SYSTEM_FIELD_KEYS = {
  "sys:first_name": "systemFields.firstName",
  "sys:last_name": "systemFields.lastName",
  "sys:email": "systemFields.email",
  "sys:status": "systemFields.status",
  "sys:created_at": "systemFields.createdAt",
  "sys:updated_at": "systemFields.updatedAt",
  "sys:hire_date": "systemFields.hireDate",
  "sys:employment_type": "systemFields.employmentType",
  "sys:probation_end": "systemFields.probationEnd",
  "sys:termination_date": "systemFields.terminationDate",
  "sys:job": "systemFields.job",
  "sys:level": "systemFields.level",
  "sys:department": "systemFields.department",
  "sys:team": "systemFields.team",
  "sys:office": "systemFields.office",
  "sys:legal_entity": "systemFields.legalEntity",
  "sys:manager": "systemFields.manager",
  "sys:calendar": "systemFields.calendar",
  "sys:role": "systemFields.role",
  "sys:policy": "systemFields.policy",
} as const;

/** The registry's group names, as the backend sends them. */
const FIELD_GROUP_KEYS = {
  Account: "fieldGroups.account",
  Employment: "fieldGroups.employment",
  Organization: "fieldGroups.organization",
} as const;

const has = <T extends object>(map: T, key: string): key is Extract<keyof T, string> =>
  Object.prototype.hasOwnProperty.call(map, key);

const localizeOptions = (
  field: FieldDTO,
  tCommon: CommonT,
  tOrg: OrganizationT,
): FieldDTO["options"] => {
  if (!field.options) return field.options;
  if (field.id === "sys:status") {
    return field.options.map((o) =>
      has(USER_STATUS_KEYS, o.value) ? { ...o, label: tCommon(USER_STATUS_KEYS[o.value]) } : o,
    );
  }
  if (field.id === "sys:employment_type") {
    return field.options.map((o) => {
      const type = EMPLOYMENT_TYPES.find((e) => e.id === o.value);
      return type ? { ...o, label: tOrg(type.labelKey) } : o;
    });
  }
  return field.options;
};

/**
 * A registry group's name for a section header. The group itself stays English on the field: code orders and
 * places sections by it (`SystemFieldsSection.GROUP_ORDER`, the profile's position-history slot).
 */
export const fieldGroupLabel = (tAccess: AccessT, group: string): string =>
  has(FIELD_GROUP_KEYS, group) ? tAccess(FIELD_GROUP_KEYS[group]) : group;

/** One field with the product's own words in the reader's language; a company's attribute is returned as it is. */
export const localizeField = (
  field: FieldDTO,
  tAccess: AccessT,
  tCommon: CommonT,
  tOrg: OrganizationT,
): FieldDTO => {
  if (!field.isSystem) return field;
  return {
    ...field,
    label: has(SYSTEM_FIELD_KEYS, field.id) ? tAccess(SYSTEM_FIELD_KEYS[field.id]) : field.label,
    options: localizeOptions(field, tCommon, tOrg),
  };
};
