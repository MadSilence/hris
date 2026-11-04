"use client";

import React from "react";
import { FormError } from "@/components/feedback/FormError";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import type { DepartmentTreeNode } from "@/models/departments";

type Props = {
  open: boolean;
  onClose: () => void;
  department: DepartmentTreeNode;
  /** null = dropped on the company card, i.e. make it top-level. */
  target: DepartmentTreeNode | null;
  isPending: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
};

/**
 * A drop never mutates on its own: moving a department carries its whole subtree and everyone in
 * it, so the person doing it gets to see exactly what travels before anything happens.
 */
export function MoveDepartmentModal({
  open,
  onClose,
  department,
  target,
  isPending,
  errorMessage,
  onConfirm,
}: Props) {
  const subCount = department.totalSubNodes;
  const peopleCount = department.totalPeople;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isPending) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{target ? "Move department?" : "Make top-level?"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 rounded-control border border-divider bg-subtle p-3">
            <span className="min-w-0 flex-1 truncate text-body font-medium text-primary">
              {department.name}
            </span>
            <Icon icon={ArrowRight02Icon} size="sm" className="flex-none text-tertiary" />
            <span className="min-w-0 flex-1 truncate text-right text-body font-medium text-primary">
              {target ? target.name : "Top level"}
            </span>
          </div>

          <p className="text-body text-secondary">
            {peopleCount} {peopleCount === 1 ? "person" : "people"}
            {subCount > 0 && ` · ${subCount} sub-${subCount === 1 ? "department" : "departments"}`}
            {" — everything inside moves with it."}
          </p>

          <FormError message={errorMessage} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Moving…" : target ? "Move department" : "Make top-level"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
