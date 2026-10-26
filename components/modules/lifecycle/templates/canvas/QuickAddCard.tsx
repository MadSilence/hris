"use client";

import React, { useState } from "react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/public/desact/src/components/ui/select";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { TASK_KIND_LABELS, type TaskKind } from "@/models/lifecycle";

type Props = {
  /** Where the card sits, relative to the canvas it was opened on. */
  left: number;
  top: number;
  /** "Onboarding Manager · Day 3" — where the task will be. */
  where: string;
  onAddAction: (task: { title: string; kind: TaskKind }) => void;
  onCancelAction: () => void;
};

/**
 * Clicking an empty cell of the canvas: a title and a kind, and the task is there — the rest is the side
 * panel, which opens on it. The single-pointer path to adding a task (research § B.3, WCAG 2.5.7).
 */
export function QuickAddCard({ left, top, where, onAddAction, onCancelAction }: Props) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TaskKind>("CHECKLIST");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Enter a title.");
      return;
    }
    onAddAction({ title: title.trim(), kind });
  };

  return (
    <div
      role="dialog"
      aria-label="Add Task"
      className="absolute z-20 w-72 rounded-xl border border-brown-100 bg-white p-4 shadow-lg"
      style={{ left, top }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onCancelAction();
        }
      }}
    >
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-muted-foreground">{where}</p>
        <div className="space-y-1.5">
          <RequiredLabel htmlFor="quick-add-title" required>Title</RequiredLabel>
          <Input
            id="quick-add-title"
            autoFocus
            value={title}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
          />
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quick-add-kind">Kind</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as TaskKind)}>
            <SelectTrigger id="quick-add-kind"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(TASK_KIND_LABELS) as TaskKind[]).map((k) => (
                <SelectItem key={k} value={k}>{TASK_KIND_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancelAction}>Cancel</Button>
          <Button type="submit" size="sm">Add</Button>
        </div>
      </form>
    </div>
  );
}
