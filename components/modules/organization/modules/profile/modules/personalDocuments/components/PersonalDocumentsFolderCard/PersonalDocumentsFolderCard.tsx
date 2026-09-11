import * as React from "react";
import { Folder, Pencil, Trash2 } from "lucide-react";
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
    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/40">
      <button
        type="button"
        onClick={() => onOpen(folder)}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brown-50">
          <Folder className="h-5 w-5"/>
        </div>

        <div className="min-w-0">
          <div className="truncate font-medium">{folder.name}</div>
        </div>
      </button>

      <RowActionsMenu label="Folder Actions">
        {onRename ? (
          <RowAction icon={<Pencil className="h-4 w-4"/>} onClick={() => onRename(folder)}>
            Rename
          </RowAction>
        ) : null}
        {onDelete ? (
          <RowActionDestructive icon={<Trash2 className="h-4 w-4"/>} onClick={() => onDelete(folder)}>
            Delete
          </RowActionDestructive>
        ) : null}
      </RowActionsMenu>
    </div>
  );
};
