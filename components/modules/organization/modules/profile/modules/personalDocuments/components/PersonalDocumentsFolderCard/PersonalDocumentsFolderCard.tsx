import * as React from "react";
import { Folder, MoreHorizontal } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/public/desact/src/components/ui/dropdown-menu";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";

type PersonalDocumentsFolderCardProps = {
  folder: DocumentFolderDTO;
  onOpen: (folder: DocumentFolderDTO) => void;
  onRename?: (folder: DocumentFolderDTO) => void;
  onDelete?: (folderId: string) => Promise<void> | void;
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onRename ? (
            <DropdownMenuItem onClick={() => onRename(folder)}>
              Rename
            </DropdownMenuItem>
          ) : null}
          {onDelete ? (
            <DropdownMenuItem onClick={() => onDelete(folder.id)}>
              Delete
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
