import * as React from "react";
import { useTranslations } from "next-intl";
import type { DocumentFolderDTO } from "@/api/modules/documents/dto";
import { PersonalDocumentsFolderCard } from "../PersonalDocumentsFolderCard/PersonalDocumentsFolderCard";

type PersonalDocumentsFoldersSectionProps = {
  folders: DocumentFolderDTO[];
  /** Files directly in each folder, by its id; a folder missing from it shows no count. */
  fileCounts?: Map<string, number>;
  onOpen: (folder: DocumentFolderDTO) => void;
  onRename?: (folder: DocumentFolderDTO) => void;
  onDelete?: (folder: DocumentFolderDTO) => void;
  onUploadHere?: (folder: DocumentFolderDTO) => void;
  onChangeLook?: (folder: DocumentFolderDTO) => void;
  onDropFiles?: (folder: DocumentFolderDTO, files: File[]) => void;
};

/** "Folders 4" and a row of tiles above the files, never as rows in the list (documents-tab § 2). */
export const PersonalDocumentsFoldersSection: React.FC<PersonalDocumentsFoldersSectionProps> = ({
  folders,
  fileCounts,
  onOpen,
  onRename,
  onDelete,
  onUploadHere,
  onChangeLook,
  onDropFiles,
}) => {
  const t = useTranslations("organization");
  if (!folders.length) return null;

  return (
    <section className="flex flex-col gap-2">
      <p className="text-label text-secondary">
        {t("documents.folders")} <span className="text-tertiary tabular-nums">{folders.length}</span>
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {folders.map((folder) => (
          <PersonalDocumentsFolderCard
            key={folder.id}
            folder={folder}
            fileCount={fileCounts ? fileCounts.get(folder.id) ?? 0 : undefined}
            onOpen={onOpen}
            onRename={onRename}
            onDelete={onDelete}
            onUploadHere={onUploadHere}
            onChangeLook={onChangeLook}
            onDropFiles={onDropFiles}
          />
        ))}
      </div>
    </section>
  );
};
