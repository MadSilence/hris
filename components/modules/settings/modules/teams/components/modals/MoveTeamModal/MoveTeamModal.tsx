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
import type { TeamTreeNode } from "@/models/teams";

type Props = {
  open: boolean;
  onClose: () => void;
  team: TeamTreeNode;
  /** null = dropped on the company card, i.e. make it top-level. */
  target: TeamTreeNode | null;
  isPending: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
};

/**
 * A drop never mutates on its own: moving a team carries its whole subtree and everyone in
 * it, so the person doing it gets to see exactly what travels before anything happens.
 */
export function MoveTeamModal({
  open,
  onClose,
  team,
  target,
  isPending,
  errorMessage,
  onConfirm,
}: Props) {
  const t = useTranslations("structure.teams");
  const tShared = useTranslations("structure.shared");
  const tCommon = useTranslations("common");
  const subCount = team.totalSubNodes;
  const peopleCount = team.totalPeople;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isPending) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{target ? t("move.title") : tShared("makeTopLevelTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 rounded-control border border-divider bg-subtle p-3">
            <span className="min-w-0 flex-1 truncate text-body font-medium text-primary">
              {team.name}
            </span>
            <Icon icon={ArrowRight02Icon} size="sm" className="flex-none text-tertiary" />
            <span className="min-w-0 flex-1 truncate text-right text-body font-medium text-primary">
              {target ? target.name : tShared("topLevel")}
            </span>
          </div>

          <p className="text-body text-secondary">
            {subCount > 0
              ? t("move.summaryWithSubs", { people: peopleCount, subs: subCount })
              : tShared("moveSummary", { people: peopleCount })}
          </p>

          <FormError message={errorMessage} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isPending}>
            {isPending ? tShared("moving") : target ? t("move.confirm") : tShared("makeTopLevel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
