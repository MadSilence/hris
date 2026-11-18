"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { HUB_COLORS } from "@/components/modules/hub/shared";
import { TAG_CLASSES, TAG_COLOR_LABELS, toTagColor, type TagColor } from "@/lib/theme/tags";
import { cn } from "@/lib/cn";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";
import { updateFolderLookAction } from "../../../actions/documentsFolder/updateFolderLookAction";
import { FOLDER_ICON_KEYS, folderIcon } from "../../PersonalDocumentsFolderCard/PersonalDocumentsFolderCard";

/**
 * Icon and color (documents-tab T03): one of the folder icons, one of the package's eight colours, each colour named —
 * the colour is never the only signal.
 */
export const FolderLookDialog: React.FC<{
  userId: string;
  folder: DocumentFolderDTO;
  onCloseAction: () => void;
  onSavedAction: () => void;
}> = ({ userId, folder, onCloseAction, onSavedAction }) => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const [icon, setIcon] = React.useState<string>(folder.icon ?? "folder");
  const [color, setColor] = React.useState<TagColor>(toTagColor(folder.color));
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    const result = await updateFolderLookAction({
      userId,
      folderId: folder.id,
      icon: icon === "folder" ? null : icon,
      color: color === "gray" ? null : color,
    });
    setBusy(false);
    if (result.status !== ActionStatus.SUCCESS) {
      setError(result.errorMessage ?? null);
      return;
    }
    onSavedAction();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t("documents.folderLook.title")}</DialogTitle>
          <DialogDescription>{folder.name}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <p className="text-label text-secondary">{t("documents.folderLook.icon")}</p>
          <div role="radiogroup" aria-label={t("documents.folderLook.icon")} className="grid grid-cols-5 gap-1.5">
            {FOLDER_ICON_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={key === icon}
                aria-label={t(`documents.folderLook.icons.${key}`)}
                onClick={() => setIcon(key)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-tint",
                  TAG_CLASSES[color].chip,
                  key === icon ? "ring-2 ring-accent ring-offset-1" : "hover:ring-1 hover:ring-strong",
                )}
              >
                <Icon icon={folderIcon(key)} size="md" />
              </button>
            ))}
          </div>
          <p className="text-label text-secondary">{t("documents.folderLook.color")}</p>
          <div role="radiogroup" aria-label={t("documents.folderLook.color")} className="flex flex-wrap gap-2">
            {HUB_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={c === color}
                onClick={() => setColor(c)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-tag px-2.5 text-hint font-medium",
                  TAG_CLASSES[c].chip,
                  c === color ? "ring-2 ring-accent ring-offset-1" : "hover:ring-1 hover:ring-strong",
                )}
              >
                {c === color ? (
                  <Icon icon={Tick02Icon} size="sm" className="size-3.5" />
                ) : (
                  <span aria-hidden className={cn("size-1.5 rounded-pill", TAG_CLASSES[c].dot)} />
                )}
                {tCommon(TAG_COLOR_LABELS[c])}
              </button>
            ))}
          </div>
        </div>
        <FormError message={error} />
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCloseAction}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" loading={busy} onClick={() => void save()}>
            {tCommon("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
