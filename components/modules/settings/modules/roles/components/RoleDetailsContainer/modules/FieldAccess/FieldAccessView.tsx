"use client";

import * as React from "react";
import { SquareLock02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/desact/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/desact/select";
import type { FieldDTO } from "@/models/user/fields";
import type { AttributeGroup } from "@/models/attribute";
import {
  ACTION_ORDER,
  EMPTY_CELL,
  FIELD_ACTION_LABELS,
  FIELD_ACTIONS,
  FIELD_SCOPES,
  FIELD_SCOPE_LABELS,
  FieldAccessDraft,
  FieldActionLevel,
  FieldScope,
} from "@/components/modules/settings/modules/roles/utils/fieldAccessDraft";
import { TagChip } from "@/components/ui/TagChip";
import type { TagColor } from "@/lib/theme/tags";
import { Badge } from "@/components/desact/badge";

// Field · Type · Own · Direct reports · Whole company — one template for header + rows.
// Field column is ~2× the others (2fr : 1fr : 1fr : 1fr : 1fr).
const GRID = "grid grid-cols-[2fr_repeat(4,minmax(0,1fr))] items-center gap-3";
const ROW = `${GRID} min-h-[52px]`;

const SYSTEM_GROUP_ID = "__system__";
const UNGROUPED_ID = "__ungrouped__";

function dotClass(current: FieldActionLevel, server: FieldActionLevel): string {
  if (current !== server) return "bg-status-info-fill";
  if (current === "NONE") return "bg-strong";
  return "bg-status-approved-fill";
}

// Friendly labels + colored chips per attribute type (like the status/role chips elsewhere).
const TYPE_LABELS: Record<string, string> = {
  TEXT: "Text",
  EMAIL: "Email",
  URL: "URL",
  STATUS: "Status",
  NUMBER: "Number",
  DATE: "Date",
  CHECKBOX: "Checkbox",
  SELECT: "Select",
  MULTI_SELECT: "Multi select",
  PERSON: "Person",
};

// One tag colour per field type — a category, not a status, so it takes the tag palette (SPEC § 4.7).
const TYPE_TAG: Record<string, TagColor> = {
  TEXT: "gray",
  EMAIL: "ocean",
  URL: "ocean",
  STATUS: "berry",
  NUMBER: "bronze",
  DATE: "plum",
  CHECKBOX: "teal",
  SELECT: "indigo",
  MULTI_SELECT: "indigo",
  PERSON: "cocoa",
};

const TypeChip: React.FC<{ type?: string | null }> = ({ type }) => {
  const key = type ?? "";
  return (
    <TagChip color={TYPE_TAG[key] ?? "gray"}>
      {TYPE_LABELS[key] ?? key}
    </TagChip>
  );
};

export type FieldGroup = { id: string; label: string; fields: FieldDTO[] };

export function buildFieldGroups(
  fields: FieldDTO[],
  attributeGroups: AttributeGroup[] | undefined,
): FieldGroup[] {
  const groupByFieldId = new Map<string, { id: string; label: string; order: number }>();

  (attributeGroups ?? []).forEach((group, index) => {
    for (const attribute of group.attributes ?? []) {
      groupByFieldId.set(`attr:${attribute.id}`, {
        id: group.id,
        label: group.name,
        order: group.sortOrder ?? index,
      });
    }
  });

  const buckets = new Map<string, FieldGroup & { order: number }>();

  for (const field of fields) {
    const mapped = field.isSystem ? undefined : groupByFieldId.get(field.id);
    const key = field.isSystem ? SYSTEM_GROUP_ID : (mapped?.id ?? UNGROUPED_ID);
    const label = field.isSystem ? "System fields" : (mapped?.label ?? "Base attributes");
    // Base attributes (ungrouped) pinned to the very top; system fields next; then named groups.
    const order = field.isSystem ? -1 : (mapped?.order ?? -2);

    const bucket = buckets.get(key) ?? { id: key, label, order, fields: [] };
    bucket.fields.push(field);
    buckets.set(key, bucket);
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.order - b.order)
    .map(({ id, label, fields: groupFields }) => ({ id, label, fields: groupFields }));
}

const ActionSelect: React.FC<{
  value: FieldActionLevel;
  server: FieldActionLevel;
  disabled?: boolean;
  // Minimum level enforced by a broader scope (Whole company). Options below it are disabled.
  floor?: FieldActionLevel;
  onChange: (level: FieldActionLevel) => void;
}> = ({ value, server, disabled, floor = "NONE", onChange }) => {
  const floorOrd = ACTION_ORDER[floor];
  return (
    <Select value={value} onValueChange={(v) => onChange(v as FieldActionLevel)} disabled={disabled}>
      <SelectTrigger className="w-full">
        <span className="flex min-w-0 items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-pill ${dotClass(value, server)}`} />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {FIELD_ACTIONS.map((level) => {
          const blocked = ACTION_ORDER[level] < floorOrd;
          return (
            <SelectItem
              key={level}
              value={level}
              disabled={blocked}
              title={
                blocked
                  ? `Whole company is set to "${FIELD_ACTION_LABELS[floor]}". Lower it there to allow less access here.`
                  : undefined
              }
            >
              {FIELD_ACTION_LABELS[level]}
            </SelectItem>
          );
        })}
        {floorOrd > 0 && (
          <p className="mt-1 border-t border-divider px-2 pt-1.5 text-hint text-tertiary">
            Options below “{FIELD_ACTION_LABELS[floor]}” are set by Whole company access.
          </p>
        )}
      </SelectContent>
    </Select>
  );
};

export interface FieldAccessViewProps {
  groups: FieldGroup[];
  draft: FieldAccessDraft;
  serverDraft: FieldAccessDraft;
  readOnly: boolean;
  readOnlyReason?: string;
  query: string;
  openGroups: string[];
  onOpenGroupsChange: (value: string[]) => void;
  onChangeAction: (fieldId: string, scope: FieldScope, level: FieldActionLevel) => void;
}

export default function FieldAccessView({
  groups,
  draft,
  serverDraft,
  readOnly,
  readOnlyReason,
  query,
  openGroups,
  onOpenGroupsChange,
  onChangeAction,
}: FieldAccessViewProps) {
  const needle = query.trim().toLowerCase();

  const visibleGroups = React.useMemo(() => {
    if (!needle) return groups;
    return groups
      .map((group) => ({
        ...group,
        fields: group.fields.filter((field) =>
          (field.label ?? field.key).toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.fields.length > 0);
  }, [groups, needle]);

  const accordionValue = needle ? visibleGroups.map((group) => group.id) : openGroups;

  return (
    <div>
      <div className={`${GRID} sticky top-0 z-10 bg-card px-1 pb-3 pt-1 text-body font-medium text-primary`}>
        <div>Field</div>
        <div>Type</div>
        {FIELD_SCOPES.map((scope) => (
          <div key={scope}>{FIELD_SCOPE_LABELS[scope]}</div>
        ))}
      </div>

      {readOnlyReason && (
        <p className="mt-3 rounded-control bg-subtle px-4 py-3 text-body text-tertiary">
          {readOnlyReason}
        </p>
      )}

      <Accordion
        type="multiple"
        value={accordionValue}
        onValueChange={onOpenGroupsChange}
        className="w-full space-y-4"
      >
        {visibleGroups.map((group) => (
          <AccordionItem key={group.id} value={group.id} className="border-b-0">
            <AccordionTrigger className="rounded-control bg-subtle px-3 py-2.5 text-body font-semibold text-secondary hover:no-underline">
              {group.label}
            </AccordionTrigger>

            <AccordionContent>
              <div className="pb-2">
                {group.fields.map((field) => {
                  const cell = draft[field.id] ?? EMPTY_CELL;
                  const serverCell = serverDraft[field.id] ?? EMPTY_CELL;
                  const locked = field.configurable === false;

                  return (
                    <div
                      key={field.id}
                      className={`${ROW} border-b border-divider px-1 py-2 last:border-b-0`}
                    >
                      <p className="min-w-0 truncate text-body font-medium">
                        {field.label ?? field.key}
                        {field.sensitive && (
                          <Badge
                            variant="neutral"
                            size="sm"
                            className="ml-2 align-middle"
                            title="Sensitive: access is never granted automatically; without it people see a placeholder"
                          >
                            Sensitive
                          </Badge>
                        )}
                      </p>

                      <TypeChip type={field.type} />

                      {locked ? (
                        <>
                          <span aria-hidden />
                          <span aria-hidden />
                          <span className="flex items-center justify-start gap-1.5 text-body text-tertiary opacity-60">
                            <Icon icon={SquareLock02Icon} size="sm" />
                            Always visible
                          </span>
                        </>
                      ) : (
                        FIELD_SCOPES.map((scope) => (
                          <ActionSelect
                            key={scope}
                            value={cell[scope]}
                            server={serverCell[scope]}
                            disabled={readOnly}
                            floor={scope === "COMPANY" ? "NONE" : cell.COMPANY}
                            onChange={(level) => onChangeAction(field.id, scope, level)}
                          />
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}

        {visibleGroups.length === 0 && (
          <p className="px-1 py-6 text-body text-tertiary">
            No fields match “{query.trim()}”.
          </p>
        )}
      </Accordion>
    </div>
  );
}
