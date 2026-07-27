"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/public/desact/src/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";
import { ACCESS_ACTIONS, AccessAction, RESOURCE_GROUPS, ResourceCode } from "@/models/access";
import {
  availableScopeChoices,
  isMissingViewAccess,
  RolePermissionsDraft,
  SCOPE_CHOICE_LABELS,
  ScopeChoice,
  scopesToChoice,
} from "@/components/modules/settings/modules/roles/utils/rolePermissionsPayload";

const ACTION_LABELS: Record<AccessAction, string> = {
  VIEW: "View",
  EDIT: "Edit",
  MANAGE: "Manage",
};

// Shared column template so the sticky header and every row line up.
const GRID = "grid grid-cols-[minmax(0,1fr)_190px_190px_190px] items-center gap-4";

// Dot before a cell's value: blue = unsaved change, gray = no access, green = granted.
function dotClass(current: ScopeChoice, server: ScopeChoice): string {
  if (current !== server) return "bg-blue-500";
  if (current === "NONE") return "bg-brown-300";
  return "bg-green-500";
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
        className={`${GRID} sticky top-0 z-10 bg-white px-1 pb-3 pt-1 text-sm font-medium text-foreground`}
      >
        <div>Resource</div>
        {ACCESS_ACTIONS.map((action) => (
          <div key={action}>{ACTION_LABELS[action]}</div>
        ))}
      </div>

      {readOnlyReason && (
        <p className="mt-3 rounded-md bg-brown-50 px-4 py-3 text-sm text-muted-foreground">
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
            <AccordionTrigger className="rounded-md bg-brown-50 px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-brown-700 hover:no-underline">
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
                      className={`${GRID} border-b border-brown-100 px-1 py-2 last:border-b-0`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{resource.label}</p>
                        <p className="text-xs text-muted-foreground">{resource.description}</p>

                        {missingView && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-700">
                            <AlertTriangle className="h-3.5 w-3.5"/>
                            Without view access this role cannot open the related pages.
                          </p>
                        )}
                      </div>

                      {ACCESS_ACTIONS.map((action) => {
                        const supported = resource.supportedActions.includes(action);

                        if (!supported) {
                          return (
                            <div key={action} className="text-center text-sm text-muted-foreground">
                              —
                            </div>
                          );
                        }

                        const choices = availableScopeChoices(resource.code, action);
                        const current = scopesToChoice(actions?.[action]);
                        const server = scopesToChoice(serverDraft[resource.code]?.[action]);

                        return (
                          <Select
                            key={action}
                            value={current}
                            onValueChange={(value) =>
                              onChangeAction(resource.code, action, value as ScopeChoice)
                            }
                            disabled={readOnly}
                          >
                            <SelectTrigger className="w-full">
                              <span className="flex min-w-0 items-center gap-2">
                                <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass(current, server)}`}/>
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
          <p className="px-1 py-6 text-sm text-muted-foreground">
            No permissions match “{query.trim()}”.
          </p>
        )}
      </Accordion>
    </div>
  );
}
