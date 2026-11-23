"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FieldError } from "@/components/desact/field-error";
import { FormError } from "@/components/feedback/FormError";
import { ActionStatus } from "@/components/models/ActionStatus";
import { HUB_COLORS } from "@/components/modules/hub/shared";
import { TAG_CLASSES, TAG_COLOR_LABELS, toTagColor, type TagColor } from "@/lib/theme/tags";
import { cn } from "@/lib/cn";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";
import { updateFolderLookAction } from "../../../actions/documentsFolder/updateFolderLookAction";
import {
  FOLDER_ICON_KEYS,
  PersonalDocumentsFolderCard,
  folderIcon,
} from "../../PersonalDocumentsFolderCard/PersonalDocumentsFolderCard";

export type FolderLook = { icon: string | null; color: string | null };

type Props = {
  userId: string;
  onCloseAction: () => void;
  onSavedAction: () => void;
} & (
  | { mode?: "look"; folder: DocumentFolderDTO }
  | {
      mode: "create";
      /** "In Reza Karimi's documents" / "In your documents". */
      subtitle: string;
      /** Makes the folder and gives it its look; resolves to an error message, or null when it is made. */
      onCreateAction: (name: string, look: FolderLook) => Promise<string | null>;
    }
);

/**
 * New folder and Icon and color (documents-tab T03, DT6, DT20): a live tile on top; Name (new folder only); Color as
 * eight round dots 22, the picked one ringed; Icon as tiles in rows of eight (58 × 38, radius 8, a hairline — the
 * picked one accent-subtle with an accent border and the icon in the accent). Every colour keeps its name for a
 * screen reader: the colour is never the only signal.
 */
export const FolderLookDialog: React.FC<Props> = (props) => {
  const { userId, onCloseAction, onSavedAction } = props;
  const creating = props.mode === "create";
  const folder = props.mode === "create" ? null : props.folder;
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const [name, setName] = React.useState(folder?.name ?? "");
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [icon, setIcon] = React.useState<string>(folder?.icon ?? "folder");
  const [color, setColor] = React.useState<TagColor>(toTagColor(folder?.color ?? null));
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const look: FolderLook = { icon: icon === "folder" ? null : icon, color: color === "gray" ? null : color };

  const save = async () => {
    if (props.mode === "create") {
      const trimmed = name.trim();
      if (trimmed.length < 2) {
        setNameError(trimmed ? t("documents.folderForm.min") : t("documents.folderForm.required"));
        return;
      }
      setBusy(true);
      const failed = await props.onCreateAction(trimmed, look);
      setBusy(false);
      if (failed) {
        setError(failed);
        return;
      }
      onSavedAction();
      return;
    }
    setBusy(true);
    const result = await updateFolderLookAction({ userId, folderId: props.folder.id, ...look });
    setBusy(false);
    if (result.status !== ActionStatus.SUCCESS) {
      setError(result.errorMessage ?? null);
      return;
    }
    onSavedAction();
  };

  // The live tile: the folder as it will look, with the name being typed.
  const preview: DocumentFolderDTO = {
    ...(folder ?? ({ id: "preview", parentId: null } as DocumentFolderDTO)),
    name: name.trim() || t("documents.createFolder.title"),
    icon: look.icon,
    color: look.color,
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent size="sm">
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <DialogHeader>
            <DialogTitle>{creating ? t("documents.createFolder.title") : t("documents.folderLook.title")}</DialogTitle>
            <DialogDescription>{props.mode === "create" ? props.subtitle : folder?.name}</DialogDescription>
          </DialogHeader>

          <div className="pointer-events-none" aria-hidden>
            <PersonalDocumentsFolderCard folder={preview} onOpen={() => undefined} />
          </div>

          {creating && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="folder-name">{tCommon("fields.name")}</Label>
              <Input
                id="folder-name"
                autoFocus
                value={name}
                maxLength={120}
                aria-invalid={nameError ? true : undefined}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(null);
                }}
              />
              <FieldError>{nameError}</FieldError>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-label font-medium text-primary">{t("documents.folderLook.color")}</p>
            <div role="radiogroup" aria-label={t("documents.folderLook.color")} className="flex flex-wrap gap-2.5">
              {HUB_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={c === color}
                  aria-label={tCommon(TAG_COLOR_LABELS[c])}
                  title={tCommon(TAG_COLOR_LABELS[c])}
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-[22px] rounded-pill",
                    TAG_CLASSES[c].bar,
                    c === color ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : "hover:ring-1 hover:ring-strong hover:ring-offset-2",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-label font-medium text-primary">{t("documents.folderLook.icon")}</p>
            <div role="radiogroup" aria-label={t("documents.folderLook.icon")} className="grid grid-cols-8 gap-1.5">
              {FOLDER_ICON_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={key === icon}
                  aria-label={t(`documents.folderLook.icons.${key}`)}
                  title={t(`documents.folderLook.icons.${key}`)}
                  onClick={() => setIcon(key)}
                  className={cn(
                    "flex h-[38px] items-center justify-center rounded-control border",
                    key === icon ? "border-accent bg-accent-subtle text-accent-text" : "border-divider text-secondary hover:bg-subtle",
                  )}
                >
                  <Icon icon={folderIcon(key)} size="sm" />
                </button>
              ))}
            </div>
          </div>

          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onCloseAction}>
              {tCommon("actions.cancel")}
            </Button>
            <Button type="submit" loading={busy}>
              {creating ? t("documents.createFolder.submit") : tCommon("actions.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
