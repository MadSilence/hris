"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";

/**
 * "Save your changes?" (H2), when leaving with unsaved changes. Keep editing · Save and leave (the accent button:
 * leaving loses nothing once saved). Esc and × keep editing (Ulia, 6 Nov).
 */
export const UnsavedChangesDialog: React.FC<{
  open: boolean;
  name: string;
  saving: boolean;
  onKeepEditing: () => void;
  onSaveAndLeave: () => void;
}> = ({ open, name, saving, onKeepEditing, onSaveAndLeave }) => {
  const t = useTranslations("automationsEditor");
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onKeepEditing()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t("unsavedDialog.title")}</DialogTitle>
          <DialogDescription>{t("unsavedDialog.body", { name })}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onKeepEditing}>
            {t("unsavedDialog.keepEditing")}
          </Button>
          <Button type="button" onClick={onSaveAndLeave} aria-busy={saving} disabled={saving}>
            {t("unsavedDialog.saveAndLeave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
