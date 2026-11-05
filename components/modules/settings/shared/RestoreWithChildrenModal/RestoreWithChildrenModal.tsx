"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FormError } from "@/components/feedback/FormError";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { useDateFormatter } from "@/lib/date";
import {
  initialSelection,
  toggleSelection,
  type RestoreChild,
} from "./restoreSelection";

type Props = {
  isOpen: boolean;
  /** "Unarchive department" — sentence case, like every label (SPEC § 1). */
  title: string;
  /** The name of the record being restored. */
  name: string;
  /** What comes back with it — each kind has its own sentence in the catalogue. */
  childKind: RestoreChildKind;
  items: RestoreChild[];
  /** The verb on the button; matches the row action that opened the dialog. */
  confirmLabel?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  onConfirmAction: (restoreIds: string[]) => void;
  onCancelAction: () => void;
};

export type RestoreChildKind = "positions" | "subDepartments" | "subTeams";

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
  childKind,
  items,
  confirmLabel: confirmLabelProp,
  isLoading = false,
  errorMessage,
  onConfirmAction,
  onCancelAction,
}: Props) {
  const t = useTranslations("settings");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");
  const confirmLabel = confirmLabelProp ?? t("shared.restore.unarchive");
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
            {t(`shared.restore.description.${childKind}`, { name })}
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-80 space-y-1 overflow-y-auto rounded-control border border-divider p-2">
          {items.map((item) => {
            const checkboxId = `restore-child-${item.id}`;
            return (
              <li key={item.id} className={indentFor(item.depth)}>
                <label
                  htmlFor={checkboxId}
                  className="flex cursor-pointer items-start gap-3 rounded-control px-2 py-1.5 text-body hover:bg-subtle"
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
                    <span className="font-medium text-primary">{item.name}</span>
                    {item.detail && <span className="ml-1.5 text-tertiary">{item.detail}</span>}
                    {!item.archivedWithParent && (
                      <span className="block text-hint text-tertiary">
                        {item.archivedAt
                          ? t("shared.restore.archivedOn", { date: formatDisplayDate(item.archivedAt, { style: "medium" }) })
                          : t("shared.restore.archived")}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <p className="m-0 text-body text-tertiary">
          {t("shared.restore.peopleNote")}
        </p>

        <FormError message={errorMessage} />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancelAction} disabled={isLoading}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" onClick={submit} disabled={isLoading}>
            {isLoading ? t("shared.restore.busy", { label: confirmLabel }) : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
