"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { FormError } from "@/components/feedback/FormError";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
import { Label } from "@/components/desact/label";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import type { TeamMoveMode } from "@/components/modules/settings/modules/teams/hooks/useMovePersonToTeam/useMovePersonToTeam";

type Props = {
  open: boolean;
  onClose: () => void;
  personName: string;
  sourceName: string | null;
  /** null = dropped on Unassigned, i.e. take them off the source team. */
  targetName: string | null;
  mode: TeamMoveMode;
  onModeChange: (mode: TeamMoveMode) => void;
  isPending: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
};

/**
 * Team membership is many, so a drop is genuinely ambiguous: move them across, or add a second
 * membership. The choice is explicit rather than guessed.
 */
export function MovePersonModal({
  open,
  onClose,
  personName,
  sourceName,
  targetName,
  mode,
  onModeChange,
  isPending,
  errorMessage,
  onConfirm,
}: Props) {
  const t = useTranslations("structure.teams");
  const tCommon = useTranslations("common");
  const isRemoval = targetName === null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isPending) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRemoval
              ? sourceName
                ? t("movePerson.removeTitle", { person: personName, source: sourceName })
                : t("movePerson.removeTitleNoSource", { person: personName })
              : `${personName} → ${targetName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isRemoval ? (
            <p className="text-body text-secondary">
              {sourceName
                ? t("movePerson.removeBody", { person: personName, source: sourceName })
                : t("movePerson.removeBodyNoSource", { person: personName })}
            </p>
          ) : (
            <RadioGroup value={mode} onValueChange={(v) => onModeChange(v as TeamMoveMode)}>
              <div className="flex items-start gap-2.5 rounded-control border border-divider p-3">
                <RadioGroupItem value="move" id="move-person-move" className="mt-0.5" />
                <div>
                  <Label htmlFor="move-person-move" className="cursor-pointer">
                    {t("movePerson.moveTo", { target: targetName ?? "" })}
                  </Label>
                  <p className="mt-0.5 text-hint text-tertiary">
                    {sourceName
                      ? t("movePerson.moveHint", { person: personName, source: sourceName, target: targetName ?? "" })
                      : t("movePerson.moveHintNoSource", { person: personName, target: targetName ?? "" })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-control border border-divider p-3">
                <RadioGroupItem value="add" id="move-person-add" className="mt-0.5" />
                <div>
                  <Label htmlFor="move-person-add" className="cursor-pointer">
                    {t("movePerson.addTo", { target: targetName ?? "" })}
                  </Label>
                  <p className="mt-0.5 text-hint text-tertiary">
                    {t("movePerson.addHint", { person: personName })}
                  </p>
                </div>
              </div>
            </RadioGroup>
          )}

          <FormError message={errorMessage} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isPending}>
            {isPending ? tCommon("actions.saving") : isRemoval ? tCommon("actions.remove") : tCommon("actions.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
