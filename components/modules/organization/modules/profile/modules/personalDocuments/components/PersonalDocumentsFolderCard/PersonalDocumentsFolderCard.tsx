"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Delete02Icon, Folder01Icon, PaintBoardIcon, PencilEdit02Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { HUB_ICONS } from "@/components/modules/hub/shared";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";
import { cn } from "@/lib/cn";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";

/** The icons a folder may carry (documents-tab T03): the plain folder first, then the hub's set. */
export const FOLDER_ICON_KEYS = ["folder", "briefcase", "shield", "heart", "file", "book", "building", "calendar", "people", "laptop"] as const;

export const folderIcon = (key: string | null | undefined): IconSvgElement =>
  key && key !== "folder" && Object.prototype.hasOwnProperty.call(HUB_ICONS, key)
    ? HUB_ICONS[key as keyof typeof HUB_ICONS]
    : Folder01Icon;

type PersonalDocumentsFolderCardProps = {
  folder: DocumentFolderDTO;
  /** Files directly in it, as the reader sees them; absent, no count is shown. */
  fileCount?: number;
  onOpen: (folder: DocumentFolderDTO) => void;
  onRename?: (folder: DocumentFolderDTO) => void;
  onDelete?: (folder: DocumentFolderDTO) => void;
  onUploadHere?: (folder: DocumentFolderDTO) => void;
  onChangeLook?: (folder: DocumentFolderDTO) => void;
  /** Files dropped on the tile go into this folder (documents-tab, FolderTile's drop-target state). */
  onDropFiles?: (folder: DocumentFolderDTO, files: File[]) => void;
};

/**
 * A folder tile (documents-tab, `FolderTile`): Drive-style, above the files — the icon in the folder's colour on a white
 * 40 tile, the name, "N files", and ⋯ with Upload here · Rename · Icon and color · — Delete folder.
 */
export const PersonalDocumentsFolderCard: React.FC<PersonalDocumentsFolderCardProps> = ({
  folder,
  fileCount,
  onOpen,
  onRename,
  onDelete,
  onUploadHere,
  onChangeLook,
  onDropFiles,
}) => {
  const t = useTranslations("organization");
  const tag = TAG_CLASSES[toTagColor(folder.color)];
  const [target, setTarget] = React.useState(false);
  const takesFiles = (e: React.DragEvent) => Boolean(onDropFiles) && e.dataTransfer.types.includes("Files");

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-card bg-mist p-3 transition-colors hover:bg-subtle",
        target && "bg-accent-subtle ring-2 ring-accent",
      )}
      onDragOver={(e) => {
        if (!takesFiles(e)) return;
        e.preventDefault();
        e.stopPropagation();
        setTarget(true);
      }}
      onDragLeave={() => setTarget(false)}
      onDrop={(e) => {
        if (!takesFiles(e)) return;
        // The folder takes it, not the tab around it.
        e.preventDefault();
        e.stopPropagation();
        setTarget(false);
        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length > 0) onDropFiles?.(folder, files);
      }}
    >
      <button type="button" onClick={() => onOpen(folder)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-card">
          <Icon icon={folderIcon(folder.icon)} className={tag.text} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-body font-medium text-primary">{folder.name}</span>
          {fileCount !== undefined && (
            <span className="block text-hint text-tertiary">{t("documents.folderCard.files", { count: fileCount })}</span>
          )}
        </span>
      </button>

      {(onRename || onDelete || onUploadHere || onChangeLook) && (
        <RowActionsMenu label={t("documents.folderCard.actions")}>
          {onUploadHere ? (
            <RowAction icon={<Icon icon={Upload04Icon} size="sm" />} onClick={() => onUploadHere(folder)}>
              {t("documents.folderCard.uploadHere")}
            </RowAction>
          ) : null}
          {onRename ? (
            <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => onRename(folder)}>
              {t("documents.folderCard.rename")}
            </RowAction>
          ) : null}
          {onChangeLook ? (
            <RowAction icon={<Icon icon={PaintBoardIcon} size="sm" />} onClick={() => onChangeLook(folder)}>
              {t("documents.folderCard.look")}
            </RowAction>
          ) : null}
          {onDelete ? (
            <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => onDelete(folder)}>
              {t("documents.folderCard.delete")}
            </RowActionDestructive>
          ) : null}
        </RowActionsMenu>
      )}
    </div>
  );
};

/** The tile's look in the other places a folder is named — the Move to… list (T06). */
export const FolderGlyph: React.FC<{ folder: Pick<DocumentFolderDTO, "icon" | "color">; className?: string }> = ({ folder, className }) => (
  <Icon icon={folderIcon(folder.icon)} size="sm" className={cn(TAG_CLASSES[toTagColor(folder.color)].text, className)} />
);
