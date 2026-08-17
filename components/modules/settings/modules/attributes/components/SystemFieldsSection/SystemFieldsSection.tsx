"use client";

import { FC, useMemo } from "react";
import { Lock } from "lucide-react";

import { Badge } from "@/public/desact/src/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/public/desact/src/components/ui/accordion";
import { useUserFields } from "@/components/modules/organization/hooks/useUserFields/useUserFields";
import { AttributeTypeChip } from "@/components/modules/settings/modules/attributes/components/AttributeTypeChip/AttributeTypeChip";
import { isReferenceField, type FieldDTO } from "@/models/user/fields";

const GRID =
  "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_48px] items-center gap-4";

/** Display order of the registry's groups; anything unexpected sorts to the end. */
const GROUP_ORDER = ["Account", "Employment", "Organisation"];

const SOURCE_LABELS: Record<string, string> = {
  offices: "Offices",
  legalEntities: "Legal entities",
  jobs: "Job catalog",
  departments: "Departments",
  teams: "Teams",
  calendars: "Holiday calendars",
  roles: "Roles",
  people: "People",
};

/** One line of context per field — the same column the custom attributes use for their config. */
function fieldDetails(field: FieldDTO): string {
  if (isReferenceField(field)) {
    const source = SOURCE_LABELS[field.valueSource ?? ""] ?? field.valueSource ?? "";
    return field.cardinality === "MANY" ? `Many from ${source}` : `One from ${source}`;
  }

  if (field.options?.length) {
    return `${field.options.length} fixed values`;
  }

  return "Built-in";
}

/**
 * The system half of the field catalogue: columns on `users` and references to other entities.
 * Read-only on purpose — these are not created or deleted by an admin, and their values live in
 * their own modules (Offices, Departments, Job catalog…). What *is* configurable about them is
 * visibility, and that lives in Roles → Field access.
 */
export const SystemFieldsSection: FC = () => {
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
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">System fields</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Built into every person and not editable here. Their values come from the corresponding
          module — Offices, Departments, Job catalog. To control who sees them, use{" "}
          <span className="font-medium">Roles → Field access</span>.
        </p>
      </div>

      <Accordion type="multiple" defaultValue={groups.map(([name]) => name)} className="space-y-2">
        {groups.map(([name, groupFields]) => (
          <AccordionItem key={name} value={name} className="border-b-0">
            <AccordionTrigger className="rounded-md bg-brown-50 px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-brown-700 hover:no-underline">
              <span className="flex items-center gap-2">
                {name}
                <span className="normal-case tracking-normal text-brown-400">
                  ({groupFields.length})
                </span>
                <Badge variant="secondary" className="font-normal normal-case tracking-normal">
                  System
                </Badge>
              </span>
            </AccordionTrigger>

            <AccordionContent className="pt-2">
              <div className="divide-y divide-brown-100">
                {groupFields.map((field) => (
                  <div key={field.id} className={`${GRID} min-h-11 px-3 py-1.5`}>
                    <span className="truncate text-sm text-foreground">{field.label}</span>
                    <span>
                      <AttributeTypeChip type={field.type} />
                    </span>
                    <span className="truncate text-sm text-muted-foreground">
                      {fieldDetails(field)}
                    </span>
                    <span
                      className="flex justify-end text-brown-300"
                      title="System fields can't be edited or deleted"
                    >
                      <Lock className="h-4 w-4" />
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
