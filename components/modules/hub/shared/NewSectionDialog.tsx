"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { createHubSectionAction } from "../actions";
import { HUB_COLORS } from "./hubVisuals";

/**
 * "New section", asked before a page when the hub has none (FIXES-round2 RC7, the owner's B8 of 2026-11-23): the
 * section's name — "New section" until the author types another — then Create; the page opens in it right away. A new
 * section takes the first tag colour, never gray (FIXES A14). No new words: the dialog reuses the tree's own.
 */
export const NewSectionDialog: React.FC<{ onClose: () => void; onCreated: (sectionId: string) => void }> = ({ onClose, onCreated }) => {
  const t = useTranslations("hub");
  const tCommon = useTranslations("common");
  const fallback = t("manage.pages.newSection");
  const [name, setName] = React.useState(fallback);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const create = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await createHubSectionAction({
      name: name.trim() || fallback,
      icon: "book",
      color: HUB_COLORS.find((c) => c !== "gray") ?? null,
      audience: null,
    });
    setBusy(false);
    if (result.status === ActionStatus.ERROR || !result.data) {
      setError(result.errorMessage ?? null);
      return;
    }
    onCreated(result.data.id);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void create();
          }}
        >
          <DialogHeader>
            <DialogTitle>{fallback}</DialogTitle>
            <DialogDescription className="sr-only">{t("manage.pages.emptyLine")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="hub-new-section-name">{t("manage.pages.sectionName")}</Label>
            <Input id="hub-new-section-name" value={name} autoFocus onFocus={(e) => e.currentTarget.select()} onChange={(e) => setName(e.target.value)} />
          </div>
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              {tCommon("actions.cancel")}
            </Button>
            <Button type="submit" loading={busy}>
              {tCommon("actions.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
