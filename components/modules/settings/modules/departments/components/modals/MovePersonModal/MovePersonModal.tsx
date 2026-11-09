"use client";

import { useTranslations } from "next-intl";
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

type Props = {
  open: boolean;
  onClose: () => void;
  personName: string;
  sourceName: string | null;
  /** null = dropped on Unassigned, i.e. take them out of the structure. */
  targetName: string | null;
  isPending: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
};

/** Department membership is single-valued, so every drop is a transfer worth confirming. */
export function MovePersonModal({
  open,
  onClose,
  personName,
  sourceName,
  targetName,
  isPending,
  errorMessage,
  onConfirm,
}: Props) {
  const t = useTranslations("structure.departments");
  const tCommon = useTranslations("common");
  const isRemoval = targetName === null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isPending) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRemoval
              ? t("movePerson.removeTitle", { person: personName })
              : t("movePerson.moveTitle", { person: personName })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 rounded-control border border-divider bg-subtle p-3">
            <span className="min-w-0 flex-1 truncate text-body text-secondary">
              {sourceName ?? t("person.none")}
            </span>
            <Icon icon={ArrowRight02Icon} size="sm" className="flex-none text-tertiary" />
            <span className="min-w-0 flex-1 truncate text-right text-body font-medium text-primary">
              {targetName ?? t("person.none")}
            </span>
          </div>

          <p className="text-body text-secondary">
            {isRemoval
              ? t("movePerson.removeBody", { person: personName })
              : sourceName
                ? t("movePerson.moveBody", { person: personName, source: sourceName })
                : t("movePerson.assignBody", { person: personName, target: targetName ?? "" })}
          </p>

          <FormError message={errorMessage} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isPending} loading={isPending} loadingLabel={tCommon("actions.saving")}>
            {isRemoval ? tCommon("actions.remove") : t("movePerson.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
