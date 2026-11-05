"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
import { assigneeKindText } from "@/components/modules/lifecycle/i18n";
import {
  ASSIGNEE_KINDS,
  EDITABLE_TASK_KINDS,
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
  const t = useTranslations("lifecycle");
  const id = `task-${item.key}`;
  const mode = dueModeOf(item);
  const [daysText, setDaysText] = useState(String(Math.abs(item.offsetDays ?? 0) || 1));
  useEffect(() => {
    setDaysText(String(Math.abs(item.offsetDays ?? 0) || 1));
  }, [item.key, item.offsetDays]);

  const others = items.filter((i) => i.key !== item.key);
  const leaving = type === "OFFBOARDING";
  const untitled = t("shared.untitledTask");
  const named = (text: string) => (item.assigneeName ? t("shared.namedProblem", { name: item.assigneeName, problem: text }) : text);

  return (
    <aside
      aria-label={t("sidePanel.label")}
      className="flex h-full w-full flex-col bg-subtle/40 md:w-[400px]"
    >
      {/* The task's own title heads the panel and is edited where it stands, like the template's name: no
          "Task" heading, no "Title" or "Description" label — a box appears on hover and while typing. */}
      <div className="flex items-start gap-1 px-3 pb-1 pt-3">
        <Textarea
          id={`${id}-title`}
          aria-label={t("shared.taskTitle")}
          rows={1}
          value={item.title}
          disabled={readOnly}
          placeholder={untitled}
          // A task added from the list arrives untitled; the title is where to start.
          autoFocus={!item.title}
          // A title is one line: a pasted line break becomes a space, and Enter adds none.
          onChange={(e) => onChange({ title: e.target.value.replace(/[\r\n]+/g, " ") })}
          onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
          className={`${INLINE} min-h-0 resize-none text-section-title leading-6 text-primary [field-sizing:content]`}
        />
        <Button type="button" variant="ghost" size="icon-sm" className="mt-0.5 shrink-0" aria-label={t("sidePanel.closePanel")} onClick={onClose}>
          <Icon icon={Cancel01Icon} size="sm" />
        </Button>
      </div>

      {/* A little room at the top: an edited field's focus ring is drawn outside it, and the scroll box
          clips whatever sticks out. */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-5 pb-5 pt-1">
        <Textarea
          id={`${id}-description`}
          aria-label={t("sidePanel.description")}
          value={item.description}
          disabled={readOnly}
          placeholder={readOnly ? "" : t("sidePanel.addDescription")}
          onChange={(e) => onChange({ description: e.target.value })}
          className={`${INLINE} -mx-2 min-h-0 resize-none text-body text-secondary [field-sizing:content]`}
        />

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-kind`}>{t("shared.kind")}</Label>
          {/* A document's category does not make a to-do require a file by accident: it is chosen again. */}
          <Select value={item.kind} disabled={readOnly}
            onValueChange={(v) => onChange({ kind: v as TaskKind, categoryId: v === "DOCUMENT" && item.kind === "DOCUMENT" ? item.categoryId : null })}>
            <SelectTrigger id={`${id}-kind`}><SelectValue /></SelectTrigger>
            <SelectContent>
              {EDITABLE_TASK_KINDS.map((k) => (
                <SelectItem key={k} value={k}>{t(`taskKind.${k}`)}</SelectItem>
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
          <Label htmlFor={`${id}-due`}>{t("sidePanel.when")}</Label>
          <div className="flex gap-2">
            {(mode === "BEFORE" || mode === "AFTER") && (
              <Input
                aria-label={t("sidePanel.days")}
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
                <SelectItem value="BEFORE">{leaving ? t("sidePanel.daysBeforeLastDay") : t("sidePanel.daysBeforeStart")}</SelectItem>
                <SelectItem value="ON">{leaving ? t("due.onLastDay") : t("due.onStartDay")}</SelectItem>
                <SelectItem value="AFTER">{leaving ? t("sidePanel.daysAfterLastDay") : t("sidePanel.daysAfterStart")}</SelectItem>
                <SelectItem value="BEFORE_START">{leaving ? t("due.byLastDay") : t("due.byStartDay")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-hint text-tertiary">{t("sidePanel.whenHint", { day: dayLabel(item, t, type) })}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${id}-assignee`}>{t("shared.doneBy")}</Label>
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
              {ASSIGNEE_KINDS.map((k) => (
                <SelectItem key={k} value={k}>{assigneeKindText(t, k, type)}</SelectItem>
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
              {named(t("sidePanel.assigneeProblem", { problem: t(`assigneeProblem.${item.assigneeProblem}`) }))}
            </p>
          )}
          {item.assigneeKind === "SPECIFIC_USER" && !item.assigneeProblem && item.accessProblem && (
            <p role="status" className="flex items-center gap-1.5 text-hint text-status-pending-text">
              <Icon icon={Alert02Icon} size="sm" />
              {named(t("sidePanel.accessProblem", { problem: t(`accessProblem.${item.accessProblem}`) }))}
            </p>
          )}
          {item.assigneeKind === "SPECIFIC_USER" && !item.assigneeProblem && (
            <p className="text-hint text-tertiary">{t("sidePanel.namedHint")}</p>
          )}
        </div>

        <fieldset className="space-y-1.5">
          <legend className="text-body font-medium">{t("sidePanel.waitsFor")}</legend>
          {others.length === 0 ? (
            <p className="text-hint text-tertiary">{t("sidePanel.noOthers")}</p>
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
                      aria-label={t("sidePanel.waitsForTask", { title: other.title || untitled })}
                      onCheckedChange={(on) => onChange({
                        waitsFor: on ? [...item.waitsFor, other.key] : item.waitsFor.filter((k) => k !== other.key),
                      })}
                    />
                    <span className="min-w-0">
                      <span className="block truncate">{other.title || untitled}</span>
                      <span className="block text-hint text-tertiary">
                        {circle ? t("sidePanel.circle") : dayLabel(other, t, type)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          <p className="flex items-start gap-1.5 text-hint text-tertiary">
            <Icon icon={HourglassIcon} size="sm" className="mt-0.5 shrink-0" />
            {t("sidePanel.waitsHint")}
          </p>
        </fieldset>
      </div>

      {!readOnly && (
        <div className="border-t border-divider px-5 py-3">
          <Button type="button" variant="ghost" className="gap-1.5 text-danger-text hover:text-status-declined-text" onClick={onRemove}>
            <Icon icon={Delete02Icon} size="sm" />
            {t("shared.removeTask")}
          </Button>
        </div>
      )}
    </aside>
  );
}
