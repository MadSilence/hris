import * as React from "react";
import { Delete02Icon, Folder01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { RowAction, RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";

type PersonalDocumentsFolderCardProps = {
  folder: DocumentFolderDTO;
  onOpen: (folder: DocumentFolderDTO) => void;
  onRename?: (folder: DocumentFolderDTO) => void;
  onDelete?: (folder: DocumentFolderDTO) => void;
};

export const PersonalDocumentsFolderCard: React.FC<PersonalDocumentsFolderCardProps> = ({
  folder,
  onOpen,
  onRename,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between rounded-card border p-4 transition-colors hover:bg-mist/40">
      <button
        type="button"
        onClick={() => onOpen(folder)}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-control bg-subtle">
          <Icon icon={Folder01Icon} />
        </div>

        <div className="min-w-0">
          <div className="truncate font-medium">{folder.name}</div>
        </div>
      </button>

      <RowActionsMenu label="Folder actions">
        {onRename ? (
          <RowAction icon={<Icon icon={PencilEdit02Icon} size="sm" />} onClick={() => onRename(folder)}>
            Rename
          </RowAction>
        ) : null}
        {onDelete ? (
          <RowActionDestructive icon={<Icon icon={Delete02Icon} size="sm" />} onClick={() => onDelete(folder)}>
            Delete
          </RowActionDestructive>
        ) : null}
      </RowActionsMenu>
    </div>
  );
};
