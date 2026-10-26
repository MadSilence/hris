"use client";

import React, { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  ListChecks,
  Mail,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
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
import { newAction } from "./draft";
import { SentenceCard } from "./SentenceCard";

export const ACTION_ICONS: Record<AutomationActionType, React.ComponentType<{ className?: string }>> = {
  SEND_EMAIL: Mail,
  NOTIFY: Bell,
  CREATE_TASK: ListChecks,
  ASSIGN: UserPlus,
  UNASSIGN: UserMinus,
  GRANT_TIME_OFF_POLICY: CalendarCheck,
};

/**
 * The ordered list of actions. Steps run in date order, then in this order (design § 4), so the order
 * is the author's to set. One action is open at a time; the rest read as their one-line sentence.
 */
export function DoCard({
  definition,
  catalog,
  names,
  onChange,
}: {
  definition: AutomationDefinition;
  catalog: AutomationCatalog;
  names: { targets: Map<string, string>; roles: Map<string, string> };
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
        <p className="m-0 text-sm text-muted-foreground">Add what should happen — an email, a task, an assignment.</p>
      ) : (
        <ol className="m-0 list-none space-y-2 p-0">
          {actions.map((action, i) => {
            const Icon = ACTION_ICONS[action.type];
            const isOpen = open === i;
            return (
              <li key={i} className="rounded-lg border border-brown-100">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4 flex-none text-muted-foreground" /> : <ChevronRight className="h-4 w-4 flex-none text-muted-foreground" />}
                    <Icon className="h-4 w-4 flex-none text-brown-500" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">
                        {actionSentence(action, { targets: names.targets, roles: names.roles })}
                      </span>
                      <span className="block text-xs text-muted-foreground">{offsetText(action.offsetDays)}</span>
                    </span>
                  </button>
                  <RowActionsMenu label={`Actions for step ${i + 1}`}>
                    <RowAction icon={<ArrowUp className="h-4 w-4 text-muted-foreground" />} onClick={() => move(i, -1)} disabled={i === 0}>
                      Move Up
                    </RowAction>
                    <RowAction icon={<ArrowDown className="h-4 w-4 text-muted-foreground" />} onClick={() => move(i, 1)} disabled={i === actions.length - 1}>
                      Move Down
                    </RowAction>
                    <RowActionDestructive icon={<Trash2 className="h-4 w-4" />} onClick={() => setRemoving(i)}>
                      Remove
                    </RowActionDestructive>
                  </RowActionsMenu>
                </div>
                {isOpen && (
                  <div className="border-t border-brown-100 px-4 py-4">
                    <ActionEditor
                      action={action}
                      index={i}
                      catalog={catalog}
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
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Action
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 rounded-lg p-1">
          {catalog.actions.map((type) => {
            const Icon = ACTION_ICONS[type];
            return (
              <DropdownMenuItem key={type} onClick={() => add(type)} className="gap-2.5 rounded-md px-2.5 py-1.5 cursor-pointer">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {ACTION_LABELS[type]}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmActionModal
        isOpen={removing !== null}
        title="Remove Action"
        description="This action is taken out of the draft. Nothing changes until you publish."
        confirmLabel="Remove"
        destructive
        onConfirmAction={() => { if (removing !== null) remove(removing); }}
        onCancelAction={() => setRemoving(null)}
      />
    </SentenceCard>
  );
}
