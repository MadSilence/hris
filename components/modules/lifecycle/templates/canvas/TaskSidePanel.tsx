"use client";

import React, { useEffect, useState } from "react";
import { Hourglass, Trash2, TriangleAlert, X } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/public/desact/src/components/ui/select";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { UserPickerField } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import {
  ASSIGNEE_KIND_LABELS,
  ASSIGNEE_PROBLEM_LABELS,
  TASK_KIND_LABELS,
  type ProcessType,
  type TaskKind,
  type TemplateAssigneeKind,
} from "@/models/lifecycle";
import { dayLabel, wouldCreateCycle, type DraftItem } from "./draft";
import { TaskKindConfigFields } from "./TaskKindConfigFields";

type DueMode = "BEFORE" | "ON" | "AFTER" | "BEFORE_START";

const dueModeOf = (i: DraftItem): DueMode => {
  if (i.dueKind === "BEFORE_START") return "BEFORE_START";
  const n = i.offsetDays ?? 0;
  return n < 0 ? "BEFORE" : n > 0 ? "AFTER" : "ON";
};

const timingOf = (mode: DueMode, days: number): Pick<DraftItem, "dueKind" | "offsetDays"> => {
  switch (mode) {
    case "BEFORE_START": return { dueKind: "BEFORE_START", offsetDays: null };
    case "ON": return { dueKind: "OFFSET", offsetDays: 0 };
    case "BEFORE": return { dueKind: "OFFSET", offsetDays: -Math.max(1, days) };
    case "AFTER": return { dueKind: "OFFSET", offsetDays: Math.max(1, days) };
  }
};

type Props = {
  item: DraftItem;
  /** Every task of the template — the ones "Waits For" may name. */
  items: DraftItem[];
  type: ProcessType;
  readOnly?: boolean;
  onChange: (patch: Partial<DraftItem>) => void;
  onRemove: () => void;
  onClose: () => void;
};

/**
 * The side panel: every field of the selected task, beside the canvas rather than over it (design
 * direction). It is also the non-drag path for every drag (WCAG 2.5.7) — the day and the assignee here
 * are what moving a block changes. Edits apply as they are made; the template's Save keeps them.
 */
export function TaskSidePanel({ item, items, type, readOnly, onChange, onRemove, onClose }: Props) {
  const id = `task-${item.key}`;
  const mode = dueModeOf(item);
  const [daysText, setDaysText] = useState(String(Math.abs(item.offsetDays ?? 0) || 1));
  useEffect(() => {
    setDaysText(String(Math.abs(item.offsetDays ?? 0) || 1));
  }, [item.key, item.offsetDays]);

  const others = items.filter((i) => i.key !== item.key);

  return (
    <aside
      aria-label="Task Details"
      className="flex h-full w-full flex-col border-l border-brown-100 bg-white md:w-[400px]"
    >
      <div className="flex items-center justify-between gap-2 px-5 pb-2 pt-4">
        <h2 className="text-base font-semibold text-brown-900">Task</h2>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Close Panel" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-5">
        <div className="space-y-1.5">
          <RequiredLabel htmlFor={`${id}-title`} required>Title</RequiredLabel>
          <Input
            id={`${id}-title`}
            value={item.title}
            disabled={readOnly}
            // A task added from the list arrives untitled; the title is where to start.
            autoFocus={!item.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-description`}>Description</Label>
          <Textarea
            id={`${id}-description`}
            value={item.description}
            disabled={readOnly}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-kind`}>Kind</Label>
          <Select value={item.kind} disabled={readOnly} onValueChange={(v) => onChange({ kind: v as TaskKind })}>
            <SelectTrigger id={`${id}-kind`}><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(TASK_KIND_LABELS) as TaskKind[]).map((k) => (
                <SelectItem key={k} value={k}>{TASK_KIND_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TaskKindConfigFields
          idPrefix={id}
          kind={item.kind}
          type={type}
          attributeIds={item.attributeIds}
          categoryId={item.categoryId}
          disabled={readOnly}
          onChange={onChange}
        />

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-due`}>When</Label>
          <div className="flex gap-2">
            {(mode === "BEFORE" || mode === "AFTER") && (
              <Input
                aria-label="Days"
                type="number"
                min={1}
                className="w-20"
                value={daysText}
                disabled={readOnly}
                onChange={(e) => {
                  setDaysText(e.target.value);
                  const n = Number.parseInt(e.target.value, 10);
                  if (Number.isFinite(n) && n > 0) onChange(timingOf(mode, n));
                }}
              />
            )}
            <Select
              value={mode}
              disabled={readOnly}
              onValueChange={(v) => onChange(timingOf(v as DueMode, Number.parseInt(daysText, 10) || 1))}
            >
              <SelectTrigger id={`${id}-due`} className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BEFORE">Days Before Start</SelectItem>
                <SelectItem value="ON">On the Start Day</SelectItem>
                <SelectItem value="AFTER">Days After Start</SelectItem>
                <SelectItem value="BEFORE_START">By the Start Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            {dayLabel(item)}. Calendar days; a date on a weekend stays where it falls.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-assignee`}>Done By</Label>
          <Select
            value={item.assigneeKind}
            disabled={readOnly}
            onValueChange={(v) => onChange({
              assigneeKind: v as TemplateAssigneeKind,
              assigneeUserId: v === "SPECIFIC_USER" ? item.assigneeUserId : null,
              assigneeName: v === "SPECIFIC_USER" ? item.assigneeName : null,
              assigneeProblem: null,
            })}
          >
            <SelectTrigger id={`${id}-assignee`}><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(ASSIGNEE_KIND_LABELS) as TemplateAssigneeKind[]).map((k) => (
                <SelectItem key={k} value={k}>{ASSIGNEE_KIND_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {item.assigneeKind === "SPECIFIC_USER" && (
            <UserPickerField
              value={item.assigneeUserId ? { id: item.assigneeUserId, firstName: item.assigneeName ?? "" } : null}
              disabled={readOnly}
              onChange={(u) => onChange({
                assigneeUserId: u?.id ?? null,
                assigneeName: u ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || null : null,
                assigneeProblem: null,
              })}
            />
          )}
          {item.assigneeKind === "SPECIFIC_USER" && item.assigneeProblem && (
            <p role="alert" className="flex items-center gap-1.5 text-xs text-warning-700">
              <TriangleAlert className="h-3.5 w-3.5" />
              {item.assigneeName ? `${item.assigneeName}: ` : ""}
              {ASSIGNEE_PROBLEM_LABELS[item.assigneeProblem]}. Choose somebody else.
            </p>
          )}
          {item.assigneeKind === "SPECIFIC_USER" && !item.assigneeProblem && (
            <p className="text-xs text-muted-foreground">
              A named person makes the template depend on them; the start of a process asks again if they have left.
            </p>
          )}
        </div>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium">Waits For</legend>
          {others.length === 0 ? (
            <p className="text-xs text-muted-foreground">There are no other tasks to wait for.</p>
          ) : (
            <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-md border border-brown-200 p-2">
              {others.map((other) => {
                const checked = item.waitsFor.includes(other.key);
                const circle = !checked && wouldCreateCycle(items, item.key, other.key);
                return (
                  <label key={other.key} className={`flex items-start gap-2 py-0.5 text-sm ${circle ? "text-muted-foreground" : ""}`}>
                    <Checkbox
                      className="mt-0.5"
                      checked={checked}
                      disabled={readOnly || circle}
                      aria-label={`Waits for ${other.title || "Untitled task"}`}
                      onCheckedChange={(on) => onChange({
                        waitsFor: on ? [...item.waitsFor, other.key] : item.waitsFor.filter((k) => k !== other.key),
                      })}
                    />
                    <span className="min-w-0">
                      <span className="block truncate">{other.title || "Untitled task"}</span>
                      <span className="block text-xs text-muted-foreground">
                        {circle ? "Waits for this task already, so it would make a circle" : dayLabel(other)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Hourglass className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Until those are done, this task shows as waiting and its assignee is not told.
          </p>
        </fieldset>
      </div>

      {!readOnly && (
        <div className="border-t border-brown-100 px-5 py-3">
          <Button type="button" variant="ghost" className="gap-1.5 text-danger-600 hover:text-danger-700" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
            Remove Task
          </Button>
        </div>
      )}
    </aside>
  );
}
