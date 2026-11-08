"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { InlineAlert } from "@/components/desact/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/desact/radio-group";
import type { InFlightChoice } from "@/models/automations";

/** "Save changes to {name}?" (V7): step changes with runs going — keep them as they are, or move them to the changes. */
export const RunsGoingDialog: React.FC<{
  open: boolean;
  name: string;
  runsGoing: number;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (choice: InFlightChoice) => void;
}> = ({ open, name, runsGoing, saving, error, onCancel, onSave }) => {
  const t = useTranslations("automationsEditor");
  const [choice, setChoice] = React.useState<InFlightChoice>("KEEP");
  React.useEffect(() => {
    if (open) setChoice("KEEP");
  }, [open]);

  const option = (value: InFlightChoice, label: string, hint: string) => (
    <label className="flex cursor-pointer items-start gap-3">
      <RadioGroupItem value={value} className="mt-0.5" aria-label={label} />
      <span className="flex flex-col gap-0.5">
        <span className="text-body text-primary">{label}</span>
        <span className="text-hint text-tertiary">{hint}</span>
      </span>
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent size="md">
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(choice);
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("runsGoingDialog.title", { name })}</DialogTitle>
            <DialogDescription>{t("runsGoingDialog.body", { count: runsGoing })}</DialogDescription>
          </DialogHeader>
          <RadioGroup value={choice} onValueChange={(v) => setChoice(v as InFlightChoice)}>
            {option("KEEP", t("runsGoingDialog.keep"), t("runsGoingDialog.keepHint"))}
            {option("MOVE", t("runsGoingDialog.move"), t("runsGoingDialog.moveHint"))}
          </RadioGroup>
          {error && <InlineAlert tone="declined">{error}</InlineAlert>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t("runsGoingDialog.cancel")}
            </Button>
            <Button type="submit" aria-busy={saving} disabled={saving}>
              {t("runsGoingDialog.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
