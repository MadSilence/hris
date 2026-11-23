"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Calendar03Icon,
  ChartColumnIcon,
  CheckListIcon,
  Clock01Icon,
  Delete02Icon,
  FileVerifiedIcon,
  Folder01Icon,
  HourglassIcon,
  IdCardIcon,
  LaptopIcon,
  Mail01Icon,
  Mortarboard02Icon,
  PaintBoardIcon,
  PencilEdit02Icon,
  SignatureIcon,
  SquareLock02Icon,
  StarIcon,
  Upload04Icon,
  UserIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { HUB_ICONS } from "@/components/modules/hub/shared";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";
import { cn } from "@/lib/cn";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";
import type { TagColor } from "@/lib/theme/tags";

/** The folder's icon in its colour's bar shade (V2-List: Contracts' icon in Berry #8E1F5C, DT7). */
const ICON_TEXT: Record<TagColor, string> = {
  gray: "text-tag-gray-bar",
  berry: "text-tag-berry-bar",
  plum: "text-tag-plum-bar",
  indigo: "text-tag-indigo-bar",
  ocean: "text-tag-ocean-bar",
  teal: "text-tag-teal-bar",
  cocoa: "text-tag-cocoa-bar",
  bronze: "text-tag-bronze-bar",
  lilac: "text-tag-lilac-bar",
  orange: "text-tag-orange-bar",
  mustard: "text-tag-mustard-bar",
  olive: "text-tag-olive-bar",
};

/**
 * The sixteen icons a folder may carry (documents-tab T03, DT6, DT20; the owner's R15, 2026-11-23), in the designers'
 * order — two rows of eight, the plain folder first. Stored by key (`document_folders.icon`, any `[a-z0-9-]` key).
 */
export const FOLDER_ICONS = {
  folder: Folder01Icon,
  signature: SignatureIcon,
  "id-card": IdCardIcon,
  wallet: Wallet01Icon,
  education: Mortarboard02Icon,
  certificate: FileVerifiedIcon,
  calendar: Calendar03Icon,
  person: UserIcon,
  star: StarIcon,
  lock: SquareLock02Icon,
  chart: ChartColumnIcon,
  clock: Clock01Icon,
  mail: Mail01Icon,
  laptop: LaptopIcon,
  checklist: CheckListIcon,
  hourglass: HourglassIcon,
} as const satisfies Record<string, IconSvgElement>;
export type FolderIconKey = keyof typeof FOLDER_ICONS;
export const FOLDER_ICON_KEYS = Object.keys(FOLDER_ICONS) as FolderIconKey[];

const has = (map: object, key: string): boolean => Object.prototype.hasOwnProperty.call(map, key);

/**
 * A folder's icon. A key of the ten offered before R15 (the hub's set — briefcase, shield, heart, file, book, building,
 * people) is still drawn as it was, so no stored folder changes; it is only no longer offered. Unknown: the folder.
 */
export const folderIcon = (key: string | null | undefined): IconSvgElement => {
  if (!key) return Folder01Icon;
  if (has(FOLDER_ICONS, key)) return FOLDER_ICONS[key as FolderIconKey];
  if (has(HUB_ICONS, key)) return HUB_ICONS[key as keyof typeof HUB_ICONS];
  return Folder01Icon;
};

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
  const iconText = ICON_TEXT[toTagColor(folder.color)] ?? ICON_TEXT.gray;
  const [target, setTarget] = React.useState(false);
  const takesFiles = (e: React.DragEvent) => Boolean(onDropFiles) && e.dataTransfer.types.includes("Files");

  return (
    <div
      className={cn(
        // V2-List (DT7): the Drive-style folder — a tab on the top left (72 × 12), the body square under it, 68 high.
        "group relative mt-2.5 flex h-[68px] items-center gap-1 rounded-card rounded-tl-none bg-mist py-3.5 pr-2 pl-3.5",
        "before:absolute before:-top-2.5 before:left-0 before:h-3 before:w-[72px] before:rounded-t-popover before:bg-mist before:content-['']",
        target && "bg-accent-subtle ring-2 ring-accent before:bg-accent-subtle",
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
          <Icon icon={folderIcon(folder.icon)} className={iconText} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-body font-medium text-primary">{folder.name}</span>
          {fileCount !== undefined && (
            <span className="block text-hint text-secondary">{t("documents.folderCard.files", { count: fileCount })}</span>
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
