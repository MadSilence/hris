"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { cn } from "@/public/desact/src/components/ui/utils";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { EDITABLE_TASK_KINDS, TASK_KIND_DESCRIPTIONS, TASK_KIND_LABELS, type TaskKind } from "@/models/lifecycle";
import { TASK_KIND_ICON } from "./TaskKindIcon";

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
      setError("Enter a title.");
      return;
    }
    onAddAction({ title: title.trim(), kind });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancelAction(); }}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>{where}</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <RequiredLabel htmlFor="add-task-title" required>Title</RequiredLabel>
            <Input
              id="add-task-title"
              autoFocus
              value={title}
              placeholder="Order a laptop"
              aria-invalid={error ? true : undefined}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
            />
            {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">Kind of Task</legend>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Kind">
              {KINDS.map((k) => {
                const Icon = TASK_KIND_ICON[k];
                const checked = kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setKind(k)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-3 text-left transition-colors",
                      checked ? "bg-brown-100 ring-2 ring-brown-400" : "bg-brown-50/60 hover:bg-brown-100/70",
                    )}
                  >
                    <span className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-md",
                      checked ? "bg-white text-brown-900" : "bg-white/70 text-brown-600",
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-brown-900">{TASK_KIND_LABELS[k]}</span>
                      <span className="block text-xs text-muted-foreground">{TASK_KIND_DESCRIPTIONS[k]}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancelAction}>Cancel</Button>
            <Button type="submit">Add Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
