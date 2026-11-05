import type { useTranslations } from "next-intl";
import type { PeopleImportFieldDTO } from "@/api/modules/peopleImport/dto";

type Translator = ReturnType<typeof useTranslations<"peopleImport">>;

/**
 * The backend's import catalogue sends an English header for its own fields ("First name"); the words are
 * the frontend's (I18N.md § 2, rule 1), so a known system field is named from the catalogue by its id.
 * An attribute is company content and keeps the name the company gave it; only the part of a money or an
 * address attribute ("Salary · Amount") is translated. Anything unknown falls back to the server's header.
 */
const SYSTEM_FIELDS = {
  "sys:first_name": "fields.personFirstName",
  "sys:last_name": "fields.personLastName",
  "sys:email": "fields.personEmail",
  "sys:hire_date": "fields.personHireDate",
  "sys:probation_end": "fields.personProbationEnd",
  "sys:employment_type": "fields.personEmploymentType",
  "sys:manager": "fields.personManager",
  "sys:department": "fields.personDepartment",
  "sys:team": "fields.personTeam",
  "sys:office": "fields.personOffice",
  "sys:legal_entity": "fields.personLegalEntity",
  "sys:job": "fields.personJob",
  "bal:email": "fields.balanceEmail",
  "bal:leave_type": "fields.balanceLeaveType",
  "bal:policy": "fields.balancePolicy",
  "bal:balance": "fields.balanceBalance",
  "bal:carried_over": "fields.balanceCarriedOver",
  "bal:as_of": "fields.balanceAsOf",
  "org:type": "fields.unitType",
  "org:name": "fields.unitName",
  "org:parent": "fields.unitParent",
  "org:lead": "fields.unitLead",
  "org:code": "fields.unitCode",
  "org:about": "fields.unitAbout",
} as const;

/** `ImportCatalogueService.MONEY_PARTS` / `ADDRESS_PARTS`: the id is `<attribute id>/<part>`. */
const PARTS = {
  amount: "fieldParts.amount",
  currency: "fieldParts.currency",
  line1: "fieldParts.line1",
  line2: "fieldParts.line2",
  city: "fieldParts.city",
  region: "fieldParts.region",
  postalCode: "fieldParts.postalCode",
  country: "fieldParts.country",
} as const;

/** The server joins an attribute's name and its part with this. */
const PART_JOINER = " · ";

const has = <T extends object>(map: T, key: string): key is Extract<keyof T, string> =>
  Object.prototype.hasOwnProperty.call(map, key);

export const fieldLabel = (t: Translator, field: Pick<PeopleImportFieldDTO, "id" | "header">): string => {
  if (has(SYSTEM_FIELDS, field.id)) return t(SYSTEM_FIELDS[field.id]);
  const slash = field.id.lastIndexOf("/");
  const joiner = field.header.lastIndexOf(PART_JOINER);
  if (slash >= 0 && joiner >= 0) {
    const part = field.id.slice(slash + 1);
    if (has(PARTS, part)) {
      return t("fieldParts.label", { attribute: field.header.slice(0, joiner), part: t(PARTS[part]) });
    }
  }
  return field.header;
};
