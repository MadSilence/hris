"use client";

import * as React from "react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/desact/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/desact/select";
import { ACCESS_ACTIONS, AccessAction, RESOURCE_GROUPS, ResourceCode } from "@/models/access";
import {
  availableScopeChoices,
  isMissingViewAccess,
  RolePermissionsDraft,
  RoleScopeFilters,
  SCOPE_CHOICE_LABELS,
  ScopeChoice,
  scopesToChoice,
} from "@/components/modules/settings/modules/roles/utils/rolePermissionsPayload";

const ACTION_LABELS: Record<AccessAction, string> = {
  VIEW: "View",
  EDIT: "Edit",
  MANAGE: "Manage",
  // Offered by People → Profiles only; every other row shows the cell as unsupported.
  BLOCK: "Block",
};

// Shared column template so the sticky header and every row line up. One column per ACCESS_ACTIONS.
const GRID = "grid grid-cols-[minmax(0,1fr)_170px_170px_170px_170px] items-center gap-4";

// Dot before a cell's value: blue = unsaved change, gray = no access, green = granted.
function dotClass(current: ScopeChoice, server: ScopeChoice): string {
  if (current !== server) return "bg-status-info-fill";
  if (current === "NONE") return "bg-strong";
  return "bg-status-approved-fill";
}

export interface RolePermissionsViewProps {
  draft: RolePermissionsDraft;
  serverDraft: RolePermissionsDraft;
  readOnly: boolean;
  readOnlyReason?: string;
  query: string;
  openGroups: string[];
  onOpenGroupsChange: (value: string[]) => void;
  onChangeAction: (resource: ResourceCode, action: AccessAction, choice: ScopeChoice) => void;
  scopeFilters?: RoleScopeFilters;
  onEditFilters?: (resource: ResourceCode, action: AccessAction) => void;
}

export default function RolePermissionsView({
  draft,
  serverDraft,
  readOnly,
  readOnlyReason,
  query,
  openGroups,
  onOpenGroupsChange,
  onChangeAction,
  scopeFilters,
  onEditFilters,
}: RolePermissionsViewProps) {
  const needle = query.trim().toLowerCase();

  const visibleGroups = React.useMemo(() => {
    if (!needle) return RESOURCE_GROUPS;

    return RESOURCE_GROUPS
      .map((group) => ({
        ...group,
        resources: group.resources.filter((resource) =>
          resource.label.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.resources.length > 0);
  }, [needle]);

  // While searching, force matching groups open; otherwise use the controlled state.
  const accordionValue = needle ? visibleGroups.map((group) => group.id) : openGroups;

  return (
    <div>
      <div
        className={`${GRID} sticky top-0 z-10 bg-card px-1 pb-3 pt-1 text-body font-medium text-primary`}
      >
        <div>Resource</div>
        {ACCESS_ACTIONS.map((action) => (
          <div key={action}>{ACTION_LABELS[action]}</div>
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
                {group.resources.map((resource) => {
                  const actions = draft[resource.code];
                  const missingView = isMissingViewAccess(resource.code, actions);

                  return (
                    <div
                      key={resource.code}
                      className={`${GRID} border-b border-divider px-1 py-2 last:border-b-0`}
                    >
                      <div className="min-w-0">
                        <p className="text-body font-medium">{resource.label}</p>
                        <p className="text-hint text-tertiary">{resource.description}</p>

                        {missingView && (
                          <p className="mt-1 flex items-center gap-1.5 text-hint text-status-pending-text">
                            <Icon icon={Alert02Icon} size="sm" />
                            Without view access this role cannot open the related pages.
                          </p>
                        )}
                      </div>

                      {ACCESS_ACTIONS.map((action) => {
                        const supported = resource.supportedActions.includes(action);

                        if (!supported) {
                          return (
                            <div key={action} className="text-center text-body text-tertiary">
                              —
                            </div>
                          );
                        }

                        const choices = availableScopeChoices(resource.code, action);
                        const current = scopesToChoice(actions?.[action]);
                        const server = scopesToChoice(serverDraft[resource.code]?.[action]);

                        const conditions = scopeFilters?.[resource.code]?.[action]?.filters.length ?? 0;

                        return (
                          <div key={action} className="flex min-w-0 flex-col gap-1">
                            <Select
                              value={current}
                              onValueChange={(value) =>
                                onChangeAction(resource.code, action, value as ScopeChoice)
                              }
                              disabled={readOnly}
                            >
                              <SelectTrigger className="w-full">
                                <span className="flex min-w-0 items-center gap-2">
                                  <span className={`h-2 w-2 shrink-0 rounded-pill ${dotClass(current, server)}`}/>
                                  <SelectValue/>
                                </span>
                              </SelectTrigger>

                              <SelectContent>
                                {choices.map((choice) => (
                                  <SelectItem key={choice} value={choice}>
                                    {SCOPE_CHOICE_LABELS[choice]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* A custom scope means nothing until its filter exists, so the cell
                                says so rather than looking configured. */}
                            {current === "CUSTOM" && (
                              <button
                                type="button"
                                disabled={readOnly}
                                onClick={() => onEditFilters?.(resource.code, action)}
                                className={`self-start text-hint underline-offset-2 hover:underline ${
                                  conditions === 0 ? "text-status-pending-text" : "text-tertiary"
                                }`}
                              >
                                {conditions === 0
                                  ? "Set conditions"
                                  : `${conditions} ${conditions === 1 ? "condition" : "conditions"}`}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}

        {visibleGroups.length === 0 && (
          <p className="px-1 py-6 text-body text-tertiary">
            No permissions match “{query.trim()}”.
          </p>
        )}
      </Accordion>
    </div>
  );
}
