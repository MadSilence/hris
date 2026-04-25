import * as React from "react";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";
import { PersonalDocumentsFolderCard } from "../PersonalDocumentsFolderCard/PersonalDocumentsFolderCard";

type PersonalDocumentsFoldersSectionProps = {
  folders: DocumentFolderDTO[];
  onOpen: (folder: DocumentFolderDTO) => void;
  onRename?: (folder: DocumentFolderDTO) => void;
  onDelete?: (folderId: string) => Promise<void> | void;
};

export const PersonalDocumentsFoldersSection: React.FC<PersonalDocumentsFoldersSectionProps> = ({
  folders,
  onOpen,
  onRename,
  onDelete,
}) => {
  if (!folders.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Folders</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {folders.map((folder) => (
          <PersonalDocumentsFolderCard
            key={folder.id}
            folder={folder}
            onOpen={onOpen}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
