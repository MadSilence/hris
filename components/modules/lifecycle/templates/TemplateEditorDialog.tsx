"use client";

import React, { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, TriangleAlert } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/public/desact/src/components/ui/select";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FormError } from "@/components/feedback/FormError";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { useAttributeGroups } from "@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups";
import { useDocumentCategories } from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";
import { ActionStatus } from "@/components/models/ActionStatus";
import { saveTemplateAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useInvalidateLifecycle, useLifecycleTemplate } from "@/components/modules/lifecycle/hooks";
import {
  ASSIGNEE_KIND_LABELS,
  ASSIGNEE_PROBLEM_LABELS,
  PROCESS_TYPE_LABELS,
  TASK_KIND_LABELS,
  type AssigneeKind,
  type AssigneeProblem,
  type ProcessType,
  type TaskKind,
  type TemplateItemWrite,
} from "@/models/lifecycle";

/** Field types the preboarding page cannot show — the backend refuses them there too. */
const NOT_ON_PREBOARDING_PAGE = new Set(["PERSON", "REFERENCE", "OBJECT", "ADDRESS", "MONEY"]);

type DueMode = "BEFORE" | "ON" | "AFTER" | "BEFORE_START";

type ItemDraft = {
  key: string;
  kind: TaskKind;
  title: string;
  description: string;
  dueMode: DueMode;
  days: string;
  assigneeKind: AssigneeKind;
  assignee: PickedUser | null;
  assigneeProblem: AssigneeProblem | null;
  attributeIds: string[];
  categoryId: string;
};

let keySeq = 0;
const nextKey = () => `item-${++keySeq}`;

const blankItem = (type: ProcessType): ItemDraft => ({
  key: nextKey(),
  kind: "CHECKLIST",
  title: "",
  description: "",
  dueMode: type === "PREBOARDING" ? "BEFORE_START" : "ON",
  days: "",
  assigneeKind: "TARGET",
  assignee: null,
  assigneeProblem: null,
  attributeIds: [],
  categoryId: "",
});

type Props = {
  open: boolean;
  /** Editing an existing template, or null to add one of `type`. */
  templateId: string | null;
  type: ProcessType;
  onCloseAction: () => void;
};

/**
 * Add or edit a template: a name and an ordered list of tasks.
 *
 * A task says what kind it is, when it is due relative to the start day, and who does it. A named
 * person who has left is flagged here, not only when a process is started (design § 4.5).
 */
export function TemplateEditorDialog({ open, templateId, type, onCloseAction }: Props) {
  const invalidate = useInvalidateLifecycle();
  const { data: existing, isLoading } = useLifecycleTemplate(open ? templateId : null);
  // The attribute list is read through its sections: there is no flat `/attributes` list on either
  // side of the stack, and the hook that asked for one got a 404, so "Fill In Fields" always said
  // there were no fields to ask for (found by the live run).
  const { data: groups } = useAttributeGroups();
  const attributes = groups?.flatMap((g) => g.attributes ?? []);
  const { data: categories } = useDocumentCategories();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** The template's version the fields were filled from — set together with them, below. */
  const [version, setVersion] = useState<number | undefined>(undefined);

  const effectiveType: ProcessType = existing?.type ?? type;

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNameError(null);
    if (templateId && existing) {
      setVersion(existing.version);
      setName(existing.name);
      setDescription(existing.description ?? "");
      setItems(existing.items.map((i) => ({
        key: nextKey(),
        kind: i.kind,
        title: i.title,
        description: i.description ?? "",
        dueMode: i.dueKind === "BEFORE_START" ? "BEFORE_START"
          : (i.offsetDays ?? 0) < 0 ? "BEFORE" : (i.offsetDays ?? 0) > 0 ? "AFTER" : "ON",
        days: i.offsetDays ? String(Math.abs(i.offsetDays)) : "",
        assigneeKind: i.assigneeKind,
        assignee: i.assigneeUserId ? { id: i.assigneeUserId, firstName: i.assigneeName ?? "" } : null,
        assigneeProblem: i.assigneeProblem,
        attributeIds: i.config?.attributeIds ?? [],
        categoryId: i.config?.categoryId ?? "",
      })));
    } else if (!templateId) {
      setVersion(undefined);
      setName("");
      setDescription("");
      setItems([blankItem(type)]);
    }
  }, [open, templateId, existing, type]);

  const update = (key: string, patch: Partial<ItemDraft>) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const move = (index: number, delta: number) =>
    setItems((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const toWrite = (i: ItemDraft): TemplateItemWrite => {
    const days = Number.parseInt(i.days || "0", 10) || 0;
    return {
      kind: i.kind,
      title: i.title.trim(),
      description: i.description.trim() || null,
      dueKind: i.dueMode === "BEFORE_START" ? "BEFORE_START" : "OFFSET",
      offsetDays: i.dueMode === "BEFORE_START" ? null : i.dueMode === "ON" ? 0 : i.dueMode === "BEFORE" ? -days : days,
      assigneeKind: i.assigneeKind,
      assigneeUserId: i.assigneeKind === "SPECIFIC_USER" ? i.assignee?.id ?? null : null,
      config: i.kind === "FILL_FIELDS" ? { attributeIds: i.attributeIds }
        : i.kind === "DOCUMENT" ? { categoryId: i.categoryId || null } : null,
    };
  };

  const save = async () => {
    setError(null);
    setNameError(null);
    if (!name.trim()) {
      setNameError("Enter a name.");
      return;
    }
    setBusy(true);
    try {
      const res = await saveTemplateAction({
        id: templateId,
        body: {
          type: effectiveType,
          name: name.trim(),
          description: description.trim() || null,
          items: items.map(toWrite),
          // A colleague's save since the dialog was filled is refused (E00409) and shown below; the
          // dialog stays open with what was typed rather than overwriting their change.
          ...(templateId ? { version } : {}),
        },
      });
      if (res.status !== ActionStatus.SUCCESS) {
        if (res.fieldErrors?.name) setNameError(res.fieldErrors.name);
        else setError(res.errorMessage ?? null);
        return;
      }
      await invalidate();
      onCloseAction();
    } finally {
      setBusy(false);
    }
  };

  const attributeOptions = (attributes ?? []).filter((a) =>
    effectiveType !== "PREBOARDING" || !NOT_ON_PREBOARDING_PAGE.has(String(a.type)));

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !busy) onCloseAction(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{templateId ? "Edit Template" : `Add ${PROCESS_TYPE_LABELS[type]} Template`}</DialogTitle>
          <DialogDescription>
            A process started from this template gets its own copy, so changing it later does not reach
            a process already under way.
          </DialogDescription>
        </DialogHeader>

        {templateId && isLoading ? (
          <div className="h-40 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto py-2 pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <RequiredLabel htmlFor="template-name" required>Name</RequiredLabel>
                <Input id="template-name" value={name} onChange={(e) => setName(e.target.value)} disabled={busy} />
                {nameError && <p role="alert" className="text-xs text-destructive">{nameError}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="template-description">Description</Label>
                <Input id="template-description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={busy} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Tasks</h3>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setItems((l) => [...l, blankItem(effectiveType)])}>
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>

              {items.length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks yet. A process started from this template would have nothing to do.</p>
              )}

              {items.map((item, index) => (
                <div key={item.key} className="space-y-3 rounded-md border border-brown-200 p-3" data-testid="template-item">
                  <div className="flex items-start gap-3">
                    <span className="mt-2 w-5 text-sm text-muted-foreground">{index + 1}.</span>
                    <div className="grid flex-1 grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <RequiredLabel htmlFor={`${item.key}-title`} required>Title</RequiredLabel>
                        <Input id={`${item.key}-title`} value={item.title} onChange={(e) => update(item.key, { title: e.target.value })} disabled={busy} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`${item.key}-kind`}>Kind</Label>
                        <Select value={item.kind} onValueChange={(v) => update(item.key, { kind: v as TaskKind })}>
                          <SelectTrigger id={`${item.key}-kind`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(Object.keys(TASK_KIND_LABELS) as TaskKind[]).map((k) => (
                              <SelectItem key={k} value={k}>{TASK_KIND_LABELS[k]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label htmlFor={`${item.key}-description`}>Description</Label>
                        <Input id={`${item.key}-description`} value={item.description} onChange={(e) => update(item.key, { description: e.target.value })} disabled={busy} />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`${item.key}-due`}>Due</Label>
                        <div className="flex gap-2">
                          {(item.dueMode === "BEFORE" || item.dueMode === "AFTER") && (
                            <Input
                              aria-label="Days"
                              type="number"
                              min={1}
                              className="w-20"
                              value={item.days}
                              onChange={(e) => update(item.key, { days: e.target.value })}
                              disabled={busy}
                            />
                          )}
                          <Select value={item.dueMode} onValueChange={(v) => update(item.key, { dueMode: v as DueMode })}>
                            <SelectTrigger id={`${item.key}-due`} className="flex-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BEFORE">Days Before Start</SelectItem>
                              <SelectItem value="ON">On the Start Day</SelectItem>
                              <SelectItem value="AFTER">Days After Start</SelectItem>
                              <SelectItem value="BEFORE_START">By the Start Day</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`${item.key}-assignee`}>Done By</Label>
                        <Select
                          value={item.assigneeKind}
                          onValueChange={(v) => update(item.key, { assigneeKind: v as AssigneeKind, assigneeProblem: null })}
                        >
                          <SelectTrigger id={`${item.key}-assignee`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(Object.keys(ASSIGNEE_KIND_LABELS) as AssigneeKind[]).map((k) => (
                              <SelectItem key={k} value={k}>{ASSIGNEE_KIND_LABELS[k]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {item.assigneeKind === "SPECIFIC_USER" && (
                          <UserPickerField
                            value={item.assignee}
                            onChange={(u) => update(item.key, { assignee: u, assigneeProblem: null })}
                          />
                        )}
                        {item.assigneeKind === "SPECIFIC_USER" && item.assigneeProblem && (
                          <p role="alert" className="flex items-center gap-1.5 text-xs text-warning-700">
                            <TriangleAlert className="h-3.5 w-3.5" />
                            {item.assignee?.firstName ? `${item.assignee.firstName}: ` : ""}
                            {ASSIGNEE_PROBLEM_LABELS[item.assigneeProblem]}. Choose somebody else.
                          </p>
                        )}
                      </div>

                      {item.kind === "FILL_FIELDS" && (
                        <div className="col-span-2 space-y-1.5">
                          <Label>Fields</Label>
                          <div className="max-h-36 overflow-y-auto rounded-md border border-brown-200 p-2">
                            {attributeOptions.length === 0 && (
                              <p className="text-xs text-muted-foreground">There are no fields to ask for.</p>
                            )}
                            {attributeOptions.map((a) => (
                              <label key={a.id} className="flex items-center gap-2 py-0.5 text-sm">
                                <Checkbox
                                  checked={item.attributeIds.includes(a.id)}
                                  onCheckedChange={(checked) => update(item.key, {
                                    attributeIds: checked
                                      ? [...item.attributeIds, a.id]
                                      : item.attributeIds.filter((id) => id !== a.id),
                                  })}
                                />
                                {a.name}
                              </label>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">Closes by itself once every field holds a value.</p>
                        </div>
                      )}

                      {item.kind === "DOCUMENT" && (
                        <div className="col-span-2 space-y-1.5">
                          <Label htmlFor={`${item.key}-category`}>Document Category</Label>
                          <Select value={item.categoryId} onValueChange={(v) => update(item.key, { categoryId: v })}>
                            <SelectTrigger id={`${item.key}-category`}><SelectValue placeholder="Select…" /></SelectTrigger>
                            <SelectContent>
                              {(categories ?? []).map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Closes by itself once a file of this category is uploaded.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Move Up" disabled={index === 0} onClick={() => move(index, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Move Down" disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Remove Task" onClick={() => setItems((l) => l.filter((i) => i.key !== item.key))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <FormError message={error} />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCloseAction} disabled={busy}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? "Saving…" : templateId ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
