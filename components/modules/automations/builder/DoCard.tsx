"use client";

import React, { useState } from "react";
import { Add01Icon, ArrowDown01Icon, ArrowDown02Icon, ArrowRight01Icon, ArrowUp02Icon, CalendarCheckIn01Icon, CheckListIcon, Delete02Icon, Mail01Icon, Notification01Icon, TaskDone01Icon, Clock01Icon, CheckmarkBadge01Icon, UserAdd01Icon, UserRemove01Icon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/desact/dropdown-menu";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import {
  ACTION_LABELS,
  actionSentence,
  offsetText,
  type ActionSpec,
  type AutomationActionType,
  type AutomationCatalog,
  type AutomationDefinition,
} from "@/models/automations";
import { ActionEditor } from "./ActionEditor";
import type { FieldDTO } from "@/models/user/fields";
import { newAction } from "./draft";
import { SentenceCard } from "./SentenceCard";

export const ACTION_ICONS: Record<AutomationActionType, IconSvgElement> = {
  SEND_EMAIL: Mail01Icon,
  NOTIFY: Notification01Icon,
  CREATE_TASK: CheckListIcon,
  ASSIGN: UserAdd01Icon,
  UNASSIGN: UserRemove01Icon,
  GRANT_TIME_OFF_POLICY: CalendarCheckIn01Icon,
  START_REVIEW: TaskDone01Icon,
  WAIT_UNTIL: Clock01Icon,
  REQUEST_APPROVAL: CheckmarkBadge01Icon,
};

/**
 * The ordered list of actions. Steps run in date order, then in this order (design § 4), so the order
 * is the author's to set. One action is open at a time; the rest read as their one-line sentence.
 */
export function DoCard({
  definition,
  catalog,
  names,
  fields,
  isLoadingFields,
  onChange,
}: {
  definition: AutomationDefinition;
  catalog: AutomationCatalog;
  names: { targets: Map<string, string>; roles: Map<string, string> };
  /** The person fields an "only if" may filter on — the conditions' own. */
  fields?: FieldDTO[];
  isLoadingFields?: boolean;
  onChange: (patch: Partial<AutomationDefinition>) => void;
}) {
  const actions = definition.actions;
  const [open, setOpen] = useState<number | null>(actions.length === 1 ? 0 : null);
  const [removing, setRemoving] = useState<number | null>(null);

  const setActions = (next: ActionSpec[]) => onChange({ actions: next });
  const add = (type: AutomationActionType) => {
    setActions([...actions, newAction(type)]);
    setOpen(actions.length);
  };
  const move = (i: number, by: -1 | 1) => {
    const j = i + by;
    if (j < 0 || j >= actions.length) return;
    const next = [...actions];
    [next[i], next[j]] = [next[j], next[i]];
    setActions(next);
    setOpen(open === i ? j : open === j ? i : open);
  };
  const remove = (i: number) => {
    setActions(actions.filter((_, k) => k !== i));
    setOpen(null);
    setRemoving(null);
  };

  return (
    <SentenceCard word="Do" summary={actions.length ? `${actions.length} ${actions.length === 1 ? "action" : "actions"}, in this order` : "Nothing yet"} last>
      {actions.length === 0 ? (
        <p className="m-0 text-body text-tertiary">Add what should happen — an email, a task, an assignment.</p>
      ) : (
        <ol className="m-0 list-none space-y-2 p-0">
          {actions.map((action, i) => {
            const actionIcon = ACTION_ICONS[action.type];
            const isOpen = open === i;
            return (
              <li key={i} className="rounded-control border border-divider">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? <Icon icon={ArrowDown01Icon} size="sm" className="flex-none text-tertiary" /> : <Icon icon={ArrowRight01Icon} size="sm" className="flex-none text-tertiary" />}
                    <Icon icon={actionIcon} size="sm" className="flex-none text-tertiary" />
                    <span className="min-w-0">
                      <span className="block truncate text-body text-primary">
                        {actionSentence(action, { targets: names.targets, roles: names.roles })}
                      </span>
                      <span className="block text-hint text-tertiary">{offsetText(action.offsetDays)}</span>
                    </span>
                  </button>
                  <RowActionsMenu label={`Actions for step ${i + 1}`}>
                    <RowAction icon={<Icon icon={ArrowUp02Icon} size="sm" className="text-tertiary" />} onClick={() => move(i, -1)} disabled={i === 0}>
                      Move up
                    </RowAction>
                    <RowAction icon={<Icon icon={ArrowDown02Icon} size="sm" className="text-tertiary" />} onClick={() => move(i, 1)} disabled={i === actions.length - 1}>
                      Move down
                    </RowAction>
                    <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => setRemoving(i)}>
                      Remove
                    </RowActionDestructive>
                  </RowActionsMenu>
                </div>
                {isOpen && (
                  <div className="border-t border-divider px-4 py-4">
                    <ActionEditor
                      action={action}
                      index={i}
                      catalog={catalog}
                      trigger={definition.trigger}
                      actions={actions}
                      fields={fields}
                      isLoadingFields={isLoadingFields}
                      onChange={(next) => setActions(actions.map((a, k) => (k === i ? next : a)))}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="secondary" size="sm" className="gap-1.5">
            <Icon icon={Add01Icon} size="sm" />
            Add action
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 rounded-control p-1">
          {catalog.actions.map((type) => {
            const actionIcon = ACTION_ICONS[type];
            return (
              <DropdownMenuItem key={type} onClick={() => add(type)} className="gap-2.5 rounded-control px-2.5 py-1.5 cursor-pointer">
                <Icon icon={actionIcon} size="sm" className="text-tertiary" />
                {ACTION_LABELS[type]}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmActionModal
        isOpen={removing !== null}
        title="Remove action"
        description="This action is taken out of the draft. Nothing changes until you publish."
        confirmLabel="Remove"
        destructive
        onConfirmAction={() => { if (removing !== null) remove(removing); }}
        onCancelAction={() => setRemoving(null)}
      />
    </SentenceCard>
  );
}
