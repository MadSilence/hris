"use client";

import { FC, useMemo } from "react";
import { fieldGroupLabel } from "@/models/user/fieldLabels";
import { useTranslations } from "next-intl";
import { SquareLock02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Badge } from "@/components/desact/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/desact/accordion";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { AttributeTypeChip } from "@/components/modules/settings/modules/attributes/components/AttributeTypeChip/AttributeTypeChip";
import { isReferenceField, type FieldDTO } from "@/models/user/fields";

const GRID =
  "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_48px] items-center gap-4";

/** Display order of the registry's groups; anything unexpected sorts to the end. */
const GROUP_ORDER = ["Account", "Employment", "Organization"];

const SOURCE_LABELS = {
  offices: "sources.offices",
  legalEntities: "sources.legalEntities",
  jobs: "sources.jobs",
  departments: "sources.departments",
  teams: "sources.teams",
  calendars: "sources.calendars",
  roles: "sources.roles",
  policies: "sources.policies",
  people: "sources.people",
} as const;

type SourceLabelKey = (typeof SOURCE_LABELS)[keyof typeof SOURCE_LABELS];

type SystemFieldsTranslator = ReturnType<typeof useTranslations<"settings.attributes.systemFields">>;

/** One line of context per field — the same column the custom attributes use for their config. */
function fieldDetails(field: FieldDTO, t: SystemFieldsTranslator): string {
  if (isReferenceField(field)) {
    const key: SourceLabelKey | undefined = SOURCE_LABELS[(field.valueSource ?? "") as keyof typeof SOURCE_LABELS];
    const source = key ? t(key) : field.valueSource ?? "";
    return field.cardinality === "MANY" ? t("manyFrom", { source }) : t("oneFrom", { source });
  }

  if (field.options?.length) {
    return t("fixedValues", { count: field.options.length });
  }

  return t("builtIn");
}

/**
 * The system half of the field catalogue: columns on `users` and references to other entities.
 * Read-only on purpose — these are not created or deleted by an admin, and their values live in
 * their own modules (Offices, Departments, Job catalog…). What *is* configurable about them is
 * visibility, and that lives in Roles → Field access.
 */
export const SystemFieldsSection: FC = () => {
  const t = useTranslations("settings.attributes.systemFields");
  const tList = useTranslations("settings.attributes.list");
  const tAccess = useTranslations("access");
  const { data: fields, isLoading } = useUserFields();

  const groups = useMemo(() => {
    const systemFields = (fields ?? []).filter((f) => f.isSystem);

    const byGroup = new Map<string, FieldDTO[]>();
    for (const field of systemFields) {
      const key = field.group ?? "Other";
      const list = byGroup.get(key) ?? [];
      list.push(field);
      byGroup.set(key, list);
    }

    return [...byGroup.entries()].sort(([a], [b]) => {
      const ai = GROUP_ORDER.indexOf(a);
      const bi = GROUP_ORDER.indexOf(b);
      return (ai === -1 ? GROUP_ORDER.length : ai) - (bi === -1 ? GROUP_ORDER.length : bi);
    });
  }, [fields]);

  if (isLoading || groups.length === 0) return null;

  return (
    /* The heading and its explanation live on the page now: the tab says which half this is, and a
       second title under it said it twice. */
    <section className="space-y-3">
      <Accordion type="multiple" defaultValue={groups.map(([name]) => name)} className="space-y-2">
        {groups.map(([name, groupFields]) => (
          <AccordionItem key={name} value={name} className="border-b-0">
            <AccordionTrigger className="rounded-control bg-subtle px-3 py-2.5 text-body font-semibold text-secondary hover:no-underline">
              <span className="flex items-center gap-2">
                {fieldGroupLabel(tAccess, name)}
                <span className="normal-case text-tertiary">
                  ({groupFields.length})
                </span>
                <Badge variant="neutral" className="font-normal normal-case">
                  {tList("system")}
                </Badge>
              </span>
            </AccordionTrigger>

            <AccordionContent className="pt-2">
              <div className="divide-y divide-divider">
                {groupFields.map((field) => (
                  <div key={field.id} className={`${GRID} min-h-11 px-3 py-1.5`}>
                    <span className="truncate text-body text-primary">{field.label}</span>
                    <span>
                      <AttributeTypeChip type={field.type} />
                    </span>
                    <span className="truncate text-body text-tertiary">
                      {fieldDetails(field, t)}
                    </span>
                    <span
                      className="flex justify-end text-disabled"
                      title={t("locked")}
                    >
                      <Icon icon={SquareLock02Icon} size="sm" />
                    </span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
