"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/desact/dialog";
import { cn } from "@/lib/cn";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { EDITABLE_TASK_KINDS, type TaskKind } from "@/models/lifecycle";
import { TASK_KIND_ICON } from "./TaskKindIcon";
import { Icon } from "@/components/desact/icon";
import { FormError } from "@/components/feedback/FormError";

type Props = {
  open: boolean;
  /** "Onboarding Manager · Day 3" — where the task will be. */
  where: string;
  onAddAction: (task: { title: string; kind: TaskKind }) => void;
  onCancelAction: () => void;
};

const KINDS: TaskKind[] = EDITABLE_TASK_KINDS;

/**
 * Adding a task from the timeline — a cell clicked, or a lane's own add button: a title and a kind, and the
 * task is there; the rest is the side panel, which opens on it. A dialog in the middle of the screen like the
 * others; the kinds are laid out to be read, each with its icon and what it asks for. A click outside, Escape
 * or Cancel closes it; nothing has been written yet, so nothing is asked.
 */
export function AddTaskDialog({ open, where, onAddAction, onCancelAction }: Props) {
  const t = useTranslations("lifecycle");
  const tCommon = useTranslations("common");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TaskKind>("TODO");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setKind("TODO");
    setError(null);
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t("addTask.enterTitle"));
      return;
    }
    onAddAction({ title: title.trim(), kind });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancelAction(); }}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{t("shared.addTask")}</DialogTitle>
            <DialogDescription>{where}</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <RequiredLabel htmlFor="add-task-title" required>{t("shared.title")}</RequiredLabel>
            <Input
              id="add-task-title"
              autoFocus
              value={title}
              placeholder={t("addTask.titlePlaceholder")}
              aria-invalid={error ? true : undefined}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
            />
            {error && <FormError message={error} />}
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-body font-medium">{t("addTask.kindLegend")}</legend>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t("shared.kind")}>
              {KINDS.map((k) => {
                const shownIcon = TASK_KIND_ICON[k];
                const checked = kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setKind(k)}
                    className={cn(
                      "flex items-start gap-3 rounded-control p-3 text-left transition-colors",
                      checked ? "bg-accent-subtle ring-2 ring-accent-ring" : "bg-subtle hover:bg-mist",
                    )}
                  >
                    <span className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-control",
                      checked ? "bg-card text-primary" : "bg-card/70 text-secondary",
                    )}>
                      <Icon icon={shownIcon} size="sm" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-body font-medium text-primary">{t(`taskKind.${k}`)}</span>
                      <span className="block text-hint text-tertiary">{t(`taskKindDescription.${k}`)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onCancelAction}>{tCommon("actions.cancel")}</Button>
            <Button type="submit">{t("shared.addTask")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
