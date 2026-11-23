"use client";

import { FC, FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { FolderAddIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";
import { FolderGlyph } from "../../PersonalDocumentsFolderCard/PersonalDocumentsFolderCard";

export type MoveDocumentFolderOption = {
  id: string;
  name: string;
  /** The folder's look (T06): its icon in its colour beside the name. */
  icon?: string | null;
  color?: string | null;
  /** Files in it, as the reader sees them — "4 files"; absent, no count. */
  fileCount?: number;
};

export type MoveDocumentFormValues = {
  folderId?: string;
};

export interface MoveDocumentFormProps {
  isLoading?: boolean;
  folders: MoveDocumentFolderOption[];
  currentFolderId?: string;
  onCancelAction: () => void;
  onSubmitAction: (values: MoveDocumentFormValues) => void | Promise<void>;
  /** "New folder" on the left of the footer (T06); absent for a reader who may not make one. */
  onNewFolderAction?: () => void;
}

const ROOT_FOLDER_ID = "root";

/**
 * Move to… (documents-tab T06, DT21): no select with a search inside it — a list of where the files can go. Not in a
 * folder, then each folder with its icon tile and its count; the one picked is accent-subtle with a tick. New folder on
 * the left of the footer, Cancel · Move here on the right.
 */
export const MoveDocumentForm: FC<MoveDocumentFormProps> = ({
  isLoading = false,
  folders,
  currentFolderId,
  onCancelAction,
  onSubmitAction,
  onNewFolderAction,
}) => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const current = currentFolderId ?? ROOT_FOLDER_ID;
  const [picked, setPicked] = useState(current);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    // Moving it where it already is: nothing to do, and the dialog closes as if it had.
    if (picked === current) {
      onCancelAction();
      return;
    }
    void onSubmitAction({ folderId: picked === ROOT_FOLDER_ID ? undefined : picked });
  };

  const options = [
    { id: ROOT_FOLDER_ID, name: t("documents.views.LOOSE"), icon: null, color: null, fileCount: undefined },
    ...folders,
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div
        role="radiogroup"
        aria-label={t("documents.moveDocument.destination")}
        className="max-h-[288px] overflow-y-auto rounded-card border border-divider"
      >
        {options.map((folder) => {
          const on = folder.id === picked;
          return (
            <button
              key={folder.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPicked(folder.id)}
              className={cn(
                "flex h-12 w-full items-center gap-3 border-b border-divider px-3.5 text-left last:border-b-0",
                on ? "bg-accent-subtle" : "hover:bg-subtle",
              )}
            >
              <span className="grid size-7 flex-none place-items-center rounded-control bg-mist">
                <FolderGlyph folder={folder} />
              </span>
              <span className={cn("min-w-0 flex-1 truncate text-body font-medium", on ? "text-accent-text" : "text-primary")}>
                {folder.name}
              </span>
              {folder.fileCount !== undefined && (
                <span className="text-hint text-tertiary">{t("documents.folderCard.files", { count: folder.fileCount })}</span>
              )}
              {on && <Icon icon={Tick02Icon} size="sm" className="text-accent-text" />}
            </button>
          );
        })}
      </div>

      <DialogFooter className="sm:justify-between">
        {onNewFolderAction ? (
          <Button type="button" variant="secondary" onClick={onNewFolderAction}>
            <Icon icon={FolderAddIcon} size="sm" />
            {t("documents.container.newFolder")}
          </Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onCancelAction}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="submit" loading={isLoading}>
            {t("documents.moveDocument.moveHere")}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
};
