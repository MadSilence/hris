"use client";

import React, { useState } from "react";
import { FormError } from "@/components/feedback/FormError";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { formatDisplayDate } from "@/lib/date";
import {
  initialSelection,
  toggleSelection,
  type RestoreChild,
} from "./restoreSelection";

type Props = {
  isOpen: boolean;
  /** "Unarchive Department" — Title Case, it is a label. */
  title: string;
  /** The name of the record being restored. */
  name: string;
  /** Plural, lower case: "positions", "sub-departments", "sub-teams". */
  childNoun: string;
  items: RestoreChild[];
  /** The verb on the button; matches the row action that opened the dialog. */
  confirmLabel?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  onConfirmAction: (restoreIds: string[]) => void;
  onCancelAction: () => void;
};

/** Indentation per tree depth; past the last step everything sits at the deepest one. */
const INDENT = ["", "pl-6", "pl-12", "pl-[4.5rem]", "pl-24"];
const indentFor = (depth: number) => INDENT[Math.min(Math.max(depth - 1, 0), INDENT.length - 1)];

/**
 * Restoring a record whose archive took other records along (WALK_QUESTIONS § 1): the reader picks
 * which of them come back with it.
 *
 * What the cascade archived starts ticked; what was archived on its own starts unticked and says when,
 * because bringing it back would undo somebody's separate decision. The tree rule lives in
 * `toggleSelection` — a child cannot be chosen without its parent — so the "parent stays archived"
 * refusal cannot be produced from here.
 *
 * Mounted only while there is something to choose: the caller restores at once when the list is empty.
 */
export function RestoreWithChildrenModal({
  isOpen,
  title,
  name,
  childNoun,
  items,
  confirmLabel = "Unarchive",
  isLoading = false,
  errorMessage,
  onConfirmAction,
  onCancelAction,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => initialSelection(items));

  const submit = () => {
    if (isLoading) return;
    onConfirmAction(items.filter((item) => selected.has(item.id)).map((item) => item.id));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    // Enter on Cancel still cancels; anywhere else in the dialog — a checkbox included — it submits.
    const target = event.target as HTMLElement;
    if (target.tagName === "BUTTON" && target.getAttribute("role") !== "checkbox") return;
    event.preventDefault();
    submit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onCancelAction(); }}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Choose which archived {childNoun} come back with {name}.
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-80 space-y-1 overflow-y-auto rounded-lg border border-brown-200 p-2">
          {items.map((item) => {
            const checkboxId = `restore-child-${item.id}`;
            return (
              <li key={item.id} className={indentFor(item.depth)}>
                <label
                  htmlFor={checkboxId}
                  className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-brown-50"
                >
                  <Checkbox
                    id={checkboxId}
                    className="mt-0.5"
                    checked={selected.has(item.id)}
                    disabled={isLoading}
                    onCheckedChange={(checked) =>
                      setSelected((current) => toggleSelection(items, current, item.id, checked === true))
                    }
                  />
                  <span className="min-w-0">
                    <span className="font-medium text-brown-900">{item.name}</span>
                    {item.detail && <span className="ml-1.5 text-muted-foreground">{item.detail}</span>}
                    {!item.archivedWithParent && (
                      <span className="block text-xs text-muted-foreground">
                        {item.archivedAt
                          ? `Archived separately on ${formatDisplayDate(item.archivedAt, { style: "medium" })}`
                          : "Archived separately"}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <p className="m-0 text-sm text-muted-foreground">
          People the archive removed are not put back; assign them again where they belong.
        </p>

        <FormError message={errorMessage} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancelAction} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={isLoading}>
            {isLoading ? `${confirmLabel}…` : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
