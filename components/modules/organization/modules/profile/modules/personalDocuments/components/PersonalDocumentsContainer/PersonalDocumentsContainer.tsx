"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Card } from "@/public/desact/src/components/ui/card";
import { PersonalDocumentsBreadcrumbs } from "../PersonalDocumentsBreadcrumbs/PersonalDocumentsBreadcrumbs";
import { PersonalDocumentsToolbar } from "../PersonalDocumentsToolbar/PersonalDocumentsToolbar";
import { PersonalDocumentsFoldersSection } from "../PersonalDocumentsFoldersSection/PersonalDocumentsFoldersSection";
import { PersonalDocumentsFilesTable } from "../PersonalDocumentsFilesTable/PersonalDocumentsFilesTable";
import { PersonalDocumentsEmptyState } from "../PersonalDocumentsEmptyState/PersonalDocumentsEmptyState";
import { PersonalDocumentsSkeleton } from "../PersonalDocumentsSkeleton/PersonalDocumentsSkeleton";
import { documentService } from "../../services/documentService/documentService";
import {
  usePersonalDocuments,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/usePersonalDocuments";

import {
  CreateDocumentsFolderModal,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/CreateDocumentsFolderModal";
import {
  RenameDocumentsFolderModal,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/RenameDoucmentsFolderModal";
import {
  DeleteDocumentsFolderModal,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/DeleteDocumentsFolderModal";
import {
  UploadDocumentModal,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/UploadDocumentModal";
import {
  DeleteDocumentModal,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/DeleteDocumentModal";
import {
  MoveDocumentModal,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/MoveDocumentModal/MoveDocumentModal";
import {
  useCreateDocumentsFolder
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/documentsFolder/useCreateDocumentsFolder";
import {
  useUpdateDocumentsFolder
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/documentsFolder/useUpdateDocumentsFolder";
import {
  useDeleteDocumentsFolder
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/documentsFolder/useDeleteDocumentsFolder";
import {
  useUploadPersonalDocument
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/useUploadPersonalDocument";
import {
  useDeletePersonalDocument
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/useDeletePersonalDocument";


type PersonalDocumentsContainerProps = {
  userId: string;
};

type FolderEntity = {
  id: string;
  name: string;
  documentsCount?: number;
};

type DocumentEntity = {
  id: string;
  name: string;
  folderId?: string | null;
};

export const PersonalDocumentsContainer: React.FC<PersonalDocumentsContainerProps> = ({
  userId,
}) => {
  const {
    search,
    setSearch,
    isLoading,
    isEmpty,
    breadcrumbs,
    folders,
    documents,
    openFolder,
    goToBreadcrumb,
    toggleStar,
  } = usePersonalDocuments({ userId });

  const { mutateAsync: createFolder, isPending: isCreatingFolder } = useCreateDocumentsFolder();
  const { mutateAsync: updateFolder, isPending: isUpdatingFolder } = useUpdateDocumentsFolder();
  const { mutateAsync: removeFolder, isPending: isDeletingFolder } = useDeleteDocumentsFolder();
  const { mutateAsync: uploadDocument, isPending: isUploadingDocument } = useUploadPersonalDocument();
  const { mutateAsync: removeDocument, isPending: isDeletingDocument } = useDeletePersonalDocument();

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);

  const [renameFolderState, setRenameFolderState] = useState<FolderEntity | null>(null);
  const [deleteFolderState, setDeleteFolderState] = useState<FolderEntity | null>(null);
  const [deleteDocumentState, setDeleteDocumentState] = useState<DocumentEntity | null>(null);
  const [moveDocumentState, setMoveDocumentState] = useState<DocumentEntity | null>(null);

  const folderOptions = useMemo(
    () => folders.map((folder) => ({ id: folder.id, name: folder.name })),
    [folders]
  );

  const currentFolderId = React.useMemo(() => {
    const current = breadcrumbs[breadcrumbs.length - 1];
    if (!current) return null;

    if ("id" in current) {
      return current.id ?? null;
    }

    return null;
  }, [breadcrumbs]);

  const isAnyFolderMutationLoading =
    isCreatingFolder || isUpdatingFolder || isDeletingFolder;

  return (
    <>
      <Card className="border-0 px-8 pt-8 pb-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <PersonalDocumentsBreadcrumbs
              items={breadcrumbs}
              onNavigate={goToBreadcrumb}
            />

            <PersonalDocumentsToolbar
              search={search}
              onSearchChange={setSearch}
              onUploadFromLocal={() => setAddDocumentOpen(true)}
              onCreateFolder={() => setCreateFolderOpen(true)}
            />
          </div>

          {isLoading ? (
            <PersonalDocumentsSkeleton/>
          ) : isEmpty ? (
            <PersonalDocumentsEmptyState/>
          ) : (
            <div className="space-y-8">
              <PersonalDocumentsFoldersSection
                folders={folders}
                onOpen={openFolder}
                onRename={(folder) => setRenameFolderState(folder)}
                onDelete={(folder) => setDeleteFolderState(folder)}
              />

              <PersonalDocumentsFilesTable
                documents={documents}
                onToggleStar={toggleStar}
                onDelete={(document) => setDeleteDocumentState(document)}
                onMove={(document) => setMoveDocumentState(document)}
                getDownloadUrl={documentService.getPersonalDocumentDownloadUrl}
              />
            </div>
          )}
        </div>
      </Card>

      <CreateDocumentsFolderModal
        isOpen={createFolderOpen}
        isLoading={isCreatingFolder}
        onRequestClose={() => setCreateFolderOpen(false)}
        onSubmit={async ({ name }) => {
          const payload = {
            userId,
            name,
            parentId: currentFolderId ?? null,
          };

          await createFolder(payload);
          setCreateFolderOpen(false);
        }}
      />

      <RenameDocumentsFolderModal
        isOpen={!!renameFolderState}
        isLoading={isUpdatingFolder}
        folderName={renameFolderState?.name}
        onRequestClose={() => setRenameFolderState(null)}
        onSubmit={async ({ name }) => {
          if (!renameFolderState) return;

          await updateFolder({
            userId,
            folderId: renameFolderState.id,
            name,
          });

          setRenameFolderState(null);
        }}
      />

      <DeleteDocumentsFolderModal
        isOpen={!!deleteFolderState}
        isLoading={isDeletingFolder}
        folderName={deleteFolderState?.name}
        documentsCount={deleteFolderState?.documentsCount ?? 0}
        onRequestCloseAction={() => setDeleteFolderState(null)}
        onConfirmAction={async () => {
          if (!deleteFolderState) return;

          await removeFolder({
            userId,
            folderId: deleteFolderState,
          });

          setDeleteFolderState(null);
        }}
      />

      <UploadDocumentModal
        isOpen={addDocumentOpen}
        isLoading={isUploadingDocument}
        folders={folderOptions}
        defaultFolderId={currentFolderId ?? undefined}
        onRequestClose={() => setAddDocumentOpen(false)}
        onSubmit={async ({ file, folderId }) => {
          await uploadDocument({
            userId,
            file,
            folderId: folderId ?? null,
            categoryId: null,
          });

          setAddDocumentOpen(false);
        }}
      />

      <DeleteDocumentModal
        isOpen={!!deleteDocumentState}
        isLoading={isDeletingDocument}
        documentName={deleteDocumentState?.name}
        onRequestCloseAction={() => setDeleteDocumentState(null)}
        onConfirmAction={async () => {
          if (!deleteDocumentState) return;

          await removeDocument({
            documentId: deleteDocumentState,
          });

          setDeleteDocumentState(null);
        }}
      />

      <MoveDocumentModal
        isOpen={!!moveDocumentState}
        isLoading={false}
        documentName={moveDocumentState?.name}
        folders={folderOptions}
        currentFolderId={moveDocumentState?.folderId ?? undefined}
        onRequestClose={() => setMoveDocumentState(null)}
        onSubmit={async ({ folderId }) => {
          if (!moveDocumentState) return;

          console.log("Need move document hook here:", {
            userId,
            documentId: moveDocumentState.id,
            folderId,
          });

          setMoveDocumentState(null);
        }}
      />
    </>
  );
};
