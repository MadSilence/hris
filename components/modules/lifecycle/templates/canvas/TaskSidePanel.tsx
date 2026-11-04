"use client";

import React, { useEffect, useState } from "react";
import { Alert02Icon, Cancel01Icon, Delete02Icon, HourglassIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/desact/select";
import { UserPickerField } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import {
  ACCESS_PROBLEM_LABELS,
  ASSIGNEE_KIND_LABELS,
  ASSIGNEE_PROBLEM_LABELS,
  EDITABLE_TASK_KINDS,
  TASK_KIND_LABELS,
  assigneeKindLabel,
  type ProcessType,
  type TaskKind,
  type TemplateAssigneeKind,
} from "@/models/lifecycle";
import { dayLabel, wouldCreateCycle, type DraftItem } from "./draft";
import { TaskKindConfigFields } from "./TaskKindConfigFields";

type DueMode = "BEFORE" | "ON" | "AFTER" | "BEFORE_START";

/** A field that reads as text until it is pointed at or typed in — the template name's own look. */
const INLINE = "border-transparent bg-transparent px-2 py-1 shadow-none hover:border-divider focus-visible:border-field focus-visible:bg-card";

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
  const leaving = type === "OFFBOARDING";

  return (
    <aside
      aria-label="Task details"
      className="flex h-full w-full flex-col bg-subtle/40 md:w-[400px]"
    >
      {/* The task's own title heads the panel and is edited where it stands, like the template's name: no
          "Task" heading, no "Title" or "Description" label — a box appears on hover and while typing. */}
      <div className="flex items-start gap-1 px-3 pb-1 pt-3">
        <Textarea
          id={`${id}-title`}
          aria-label="Task title"
          rows={1}
          value={item.title}
          disabled={readOnly}
          placeholder="Untitled task"
          // A task added from the list arrives untitled; the title is where to start.
          autoFocus={!item.title}
          // A title is one line: a pasted line break becomes a space, and Enter adds none.
          onChange={(e) => onChange({ title: e.target.value.replace(/[\r\n]+/g, " ") })}
          onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
          className={`${INLINE} min-h-0 resize-none text-section-title leading-6 text-primary [field-sizing:content]`}
        />
        <Button type="button" variant="ghost" size="icon-sm" className="mt-0.5 shrink-0" aria-label="Close panel" onClick={onClose}>
          <Icon icon={Cancel01Icon} size="sm" />
        </Button>
      </div>

      {/* A little room at the top: an edited field's focus ring is drawn outside it, and the scroll box
          clips whatever sticks out. */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-5 pb-5 pt-1">
        <Textarea
          id={`${id}-description`}
          aria-label="Task description"
          value={item.description}
          disabled={readOnly}
          placeholder={readOnly ? "" : "Add a description"}
          onChange={(e) => onChange({ description: e.target.value })}
          className={`${INLINE} -mx-2 min-h-0 resize-none text-body text-secondary [field-sizing:content]`}
        />

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-kind`}>Kind</Label>
          {/* A document's category does not make a to-do require a file by accident: it is chosen again. */}
          <Select value={item.kind} disabled={readOnly}
            onValueChange={(v) => onChange({ kind: v as TaskKind, categoryId: v === "DOCUMENT" && item.kind === "DOCUMENT" ? item.categoryId : null })}>
            <SelectTrigger id={`${id}-kind`}><SelectValue /></SelectTrigger>
            <SelectContent>
              {EDITABLE_TASK_KINDS.map((k) => (
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
          materials={item.materials}
          questions={item.questions}
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
                <SelectItem value="BEFORE">{leaving ? "Days before the last day" : "Days before start"}</SelectItem>
                <SelectItem value="ON">{leaving ? "On the last day" : "On the start day"}</SelectItem>
                <SelectItem value="AFTER">{leaving ? "Days after the last day" : "Days after start"}</SelectItem>
                <SelectItem value="BEFORE_START">{leaving ? "By the last day" : "By the start day"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-hint text-tertiary">
            {dayLabel(item, type)}. Calendar days; a date on a weekend stays where it falls.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-assignee`}>Done by</Label>
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
                <SelectItem key={k} value={k}>{assigneeKindLabel(k, type)}</SelectItem>
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
            <p role="alert" className="flex items-center gap-1.5 text-hint text-status-pending-text">
              <Icon icon={Alert02Icon} size="sm" />
              {item.assigneeName ? `${item.assigneeName}: ` : ""}
              {ASSIGNEE_PROBLEM_LABELS[item.assigneeProblem]}. Choose somebody else.
            </p>
          )}
          {item.assigneeKind === "SPECIFIC_USER" && !item.assigneeProblem && item.accessProblem && (
            <p role="status" className="flex items-center gap-1.5 text-hint text-status-pending-text">
              <Icon icon={Alert02Icon} size="sm" />
              {item.assigneeName ? `${item.assigneeName}: ` : ""}
              {ACCESS_PROBLEM_LABELS[item.accessProblem]} for anybody. Grant it, or give the task to somebody who can.
            </p>
          )}
          {item.assigneeKind === "SPECIFIC_USER" && !item.assigneeProblem && (
            <p className="text-hint text-tertiary">
              A named person makes the template depend on them; the start of a process asks again if they have left.
            </p>
          )}
        </div>

        <fieldset className="space-y-1.5">
          <legend className="text-body font-medium">Waits for</legend>
          {others.length === 0 ? (
            <p className="text-hint text-tertiary">There are no other tasks to wait for.</p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {others.map((other) => {
                const checked = item.waitsFor.includes(other.key);
                const circle = !checked && wouldCreateCycle(items, item.key, other.key);
                return (
                  <label key={other.key} className={`flex items-start gap-2 py-0.5 text-body ${circle ? "text-tertiary" : ""}`}>
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
                      <span className="block text-hint text-tertiary">
                        {circle ? "Waits for this task already, so it would make a circle" : dayLabel(other, type)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          <p className="flex items-start gap-1.5 text-hint text-tertiary">
            <Icon icon={HourglassIcon} size="sm" className="mt-0.5 shrink-0" />
            Until those are done, this task shows as waiting and its assignee is not told.
          </p>
        </fieldset>
      </div>

      {!readOnly && (
        <div className="border-t border-divider px-5 py-3">
          <Button type="button" variant="ghost" className="gap-1.5 text-danger-text hover:text-status-declined-text" onClick={onRemove}>
            <Icon icon={Delete02Icon} size="sm" />
            Remove task
          </Button>
        </div>
      )}
    </aside>
  );
}
