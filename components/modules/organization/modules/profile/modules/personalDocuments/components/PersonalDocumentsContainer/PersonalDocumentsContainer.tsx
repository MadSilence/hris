"use client";

import { messageForError } from "@/lib/errors/errorMessages";
import { ErrorState } from "@/components/feedback/ErrorState";
import {
  useDocumentsFolderDeleteImpact,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/documentsFolder/useDocumentsFolderDeleteImpact";
import * as React from "react";
import { useMemo, useState } from "react";
import { Card } from "@/public/desact/src/components/ui/card";
import type { DocumentDTO, DocumentFolderDTO } from "@/api/modules/documents/dto";
import { PersonalDocumentsBreadcrumbs } from "../PersonalDocumentsBreadcrumbs/PersonalDocumentsBreadcrumbs";
import { PersonalDocumentsToolbar } from "../PersonalDocumentsToolbar/PersonalDocumentsToolbar";
import { PersonalDocumentsFoldersSection } from "../PersonalDocumentsFoldersSection/PersonalDocumentsFoldersSection";
import { PersonalDocumentsFilesTable } from "../PersonalDocumentsFilesTable/PersonalDocumentsFilesTable";
import { PersonalDocumentsEmptyState } from "../PersonalDocumentsEmptyState/PersonalDocumentsEmptyState";
import { PersonalDocumentsSkeleton } from "../PersonalDocumentsSkeleton/PersonalDocumentsSkeleton";
import { documentService } from "../../services/documentService/documentService";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
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
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/MoveDocumentModal";
import {
  RenameDocumentModal,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/RenameDocumentModal";
import {
  PreviewDocumentModal,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/PreviewDocumentModal";
import {
  useDocumentCategories,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories";
import {
  PersonalDocumentsTrash,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/PersonalDocumentsTrash";
import { Button } from "@/public/desact/src/components/ui/button";
import { Trash2 } from "lucide-react";

type PersonalDocumentsContainerProps = {
  userId: string;
};

/** The dialogs show what the dictionary says, not the backend's technical wording. */
const messageOf = (error: unknown): string | null =>
  error ? messageForError(error) : null;

export const PersonalDocumentsContainer: React.FC<PersonalDocumentsContainerProps> = ({
  userId,
}) => {
  const {
    search,
    setSearch,
    starredOnly,
    setStarredOnly,
    hrOnly,
    setHrOnly,
    sort,
    setSort,
    isLoading,
    error,
    isEmpty,
    breadcrumbs,
    currentFolderId,
    folders,
    documents,
    openFolder,
    goToBreadcrumb,
    toggleStar,

    createFolder,
    renameFolder,
    deleteFolder,
    uploadFiles,
    deleteDocument,
    moveDocument,
    renameDocument,

    isCreatingFolder,
    isRenamingFolder,
    isDeletingFolder,
    isUploadingFile,
    isDeletingDocument,
    isMovingDocument,
    isRenamingDocument,

    createFolderError,
    renameFolderError,
    deleteFolderError,
    uploadFileError,
    deleteDocumentError,
    moveDocumentError,
    renameDocumentError,

    resetCreateFolder,
    resetRenameFolder,
    resetDeleteFolder,
    resetUploadFile,
    resetDeleteDocument,
    resetMoveDocument,
    resetRenameDocument,
  } = usePersonalDocuments({ userId });

  const { data: categories } = useDocumentCategories();

  // Mirrors what the backend allows: your own document space is always yours to manage, anyone
  // else's needs the role permission. Pure UX — the storage authorization layer is the real gate.
  const { userId: currentUserId } = useCurrentUser();
  const isOwnSpace = currentUserId === userId;
  const hasEditPermission = useCanAccess("PEOPLE.DOCUMENTS", "EDIT");
  const hasManagePermission = useCanAccess("PEOPLE.DOCUMENTS", "MANAGE");
  const canEdit = isOwnSpace || hasEditPermission;
  const canManage = isOwnSpace || hasManagePermission;

  const [showTrash, setShowTrash] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);

  const [renameFolderState, setRenameFolderState] = useState<DocumentFolderDTO | null>(null);
  const [deleteFolderState, setDeleteFolderState] = useState<DocumentFolderDTO | null>(null);
  // Counted when the dialog opens, not carried along with the listing: a folder that was empty two
  // minutes ago is not a promise about now.
  const folderImpact = useDocumentsFolderDeleteImpact(userId, deleteFolderState?.id ?? null);
  const [deleteDocumentState, setDeleteDocumentState] = useState<DocumentDTO | null>(null);
  const [moveDocumentState, setMoveDocumentState] = useState<DocumentDTO | null>(null);
  const [renameDocumentState, setRenameDocumentState] = useState<DocumentDTO | null>(null);
  const [previewState, setPreviewState] = useState<DocumentDTO | null>(null);

  // Dropping anywhere on the tab uploads into the folder currently open, which is what people
  // expect from a file browser. The modal stays for picking a folder or a category explicitly.
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragDepth = React.useRef(0);

  const folderOptions = useMemo(
    () => folders.map((folder) => ({ id: folder.id, name: folder.name })),
    [folders]
  );

  // Every modal closes on success only. A rejected call (no permission, duplicate name, size limit)
  // keeps the dialog open with the message in it, instead of looking like nothing happened.
  const runAndClose = async (action: Promise<unknown>, close: () => void) => {
    try {
      await action;
      close();
    } catch {
      // Surfaced through the mutation's error, rendered inside the dialog.
    }
  };

  return (
    <>
      <Card
        className="relative flex h-full flex-col border-0 px-8 pt-8 pb-8"
        onDragEnter={(e) => {
          if (!canEdit || !e.dataTransfer.types.includes("Files")) return;
          dragDepth.current += 1;
          setIsDraggingOver(true);
        }}
        onDragOver={(e) => {
          if (canEdit && e.dataTransfer.types.includes("Files")) e.preventDefault();
        }}
        onDragLeave={() => {
          // Dragging over a child fires leave on the parent; count depth instead of flickering.
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setIsDraggingOver(false);
        }}
        onDrop={(e) => {
          if (!canEdit) return;
          e.preventDefault();
          dragDepth.current = 0;
          setIsDraggingOver(false);

          const dropped = Array.from(e.dataTransfer.files ?? []);
          if (dropped.length > 0) void uploadFiles(dropped);
        }}
      >
        {isDraggingOver && (
          <div className="pointer-events-none absolute inset-4 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-brown-400 bg-brown-50/90">
            <p className="font-medium text-brown-800">
              Drop to upload into this folder
            </p>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-6">
          <div className="flex flex-none items-center gap-4">
            <PersonalDocumentsToolbar
              search={search}
              onSearchChange={setSearch}
              starredOnly={starredOnly}
              onStarredOnlyChange={setStarredOnly}
              hrOnly={hrOnly}
              onHrOnlyChange={setHrOnly}
              showHrOnlyFilter={canManage}
              onUploadFromLocal={() => setAddDocumentOpen(true)}
              onCreateFolder={() => setCreateFolderOpen(true)}
              canEdit={canEdit}
            />

            <div className="ml-auto flex items-center gap-3">
              {canManage && (
                <Button
                  variant={showTrash ? "secondary" : "outline"}
                  size="icon"
                  aria-label="Trash"
                  aria-pressed={showTrash}
                  title="Trash"
                  onClick={() => setShowTrash((v) => !v)}
                >
                  <Trash2 className="h-4 w-4"/>
                </Button>
              )}
            </div>
          </div>

          {/*
            The trail is the only thing that says which folder is open, so it appears once there is
            one. At the root it said "Documents" above a tab already called Documents.
          */}
          {!showTrash && breadcrumbs.length > 1 && (
            <div className="flex-none">
              <PersonalDocumentsBreadcrumbs
                items={breadcrumbs}
                onNavigate={goToBreadcrumb}
              />
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {showTrash ? (
              <PersonalDocumentsTrash userId={userId}/>
            ) : isLoading ? (
              <PersonalDocumentsSkeleton/>
            ) : error ? (
              <div className="rounded-lg border bg-white">
                <ErrorState error={error} compact/>
              </div>
            ) : isEmpty ? (
              <PersonalDocumentsEmptyState/>
            ) : (
              <div className="space-y-8">
                <PersonalDocumentsFoldersSection
                  folders={folders}
                  onOpen={openFolder}
                  onRename={canEdit ? (folder) => setRenameFolderState(folder) : undefined}
                  onDelete={canManage ? (folder) => setDeleteFolderState(folder) : undefined}
                />

                <PersonalDocumentsFilesTable
                  documents={documents}
                  sort={sort}
                  onSortChange={setSort}
                  onToggleStar={toggleStar}
                  onDelete={canManage ? (document) => setDeleteDocumentState(document) : undefined}
                  onMove={canEdit ? (document) => setMoveDocumentState(document) : undefined}
                  onRename={canEdit ? (document) => setRenameDocumentState(document) : undefined}
                  onPreview={(document) => setPreviewState(document)}
                  getDownloadUrl={documentService.getPersonalDocumentDownloadUrl}
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      <CreateDocumentsFolderModal
        isOpen={createFolderOpen}
        isLoading={isCreatingFolder}
        errorMessage={messageOf(createFolderError)}
        onCancelAction={() => {
          setCreateFolderOpen(false);
          resetCreateFolder();
        }}
        onConfirmAction={({ name }) =>
          runAndClose(createFolder(name), () => {
            setCreateFolderOpen(false);
            resetCreateFolder();
          })
        }
      />

      <RenameDocumentsFolderModal
        isOpen={!!renameFolderState}
        isLoading={isRenamingFolder}
        folderName={renameFolderState?.name}
        errorMessage={messageOf(renameFolderError)}
        onCancelAction={() => {
          setRenameFolderState(null);
          resetRenameFolder();
        }}
        onConfirmAction={({ name }) => {
          if (!renameFolderState) return;

          void runAndClose(renameFolder(renameFolderState.id, name), () => {
            setRenameFolderState(null);
            resetRenameFolder();
          });
        }}
      />

      <DeleteDocumentsFolderModal
        isOpen={!!deleteFolderState}
        isLoading={isDeletingFolder}
        folderName={deleteFolderState?.name}
        impact={folderImpact.data ?? null}
        isImpactLoading={folderImpact.isLoading}
        errorMessage={messageOf(deleteFolderError)}
        onRequestCloseAction={() => {
          setDeleteFolderState(null);
          resetDeleteFolder();
        }}
        onConfirmAction={(strategy) => {
          if (!deleteFolderState) return;

          void runAndClose(deleteFolder(deleteFolderState.id, strategy), () => {
            setDeleteFolderState(null);
            resetDeleteFolder();
          });
        }}
      />

      <UploadDocumentModal
        isOpen={addDocumentOpen}
        isLoading={isUploadingFile}
        folders={folderOptions}
        categories={categories?.filter((c) => c.isActive)}
        defaultFolderId={currentFolderId ?? undefined}
        defaultVisibility={isOwnSpace ? "VISIBLE_TO_EMPLOYEE" : "HR_ONLY"}
        errorMessage={messageOf(uploadFileError)}
        onCancelAction={() => {
          setAddDocumentOpen(false);
          resetUploadFile();
        }}
        onConfirmAction={({ files, folderId, categoryId, visibility }) =>
          runAndClose(uploadFiles(files, folderId ?? null, categoryId ?? null, visibility), () => {
            setAddDocumentOpen(false);
            resetUploadFile();
          })
        }
      />

      <DeleteDocumentModal
        isOpen={!!deleteDocumentState}
        isLoading={isDeletingDocument}
        documentName={deleteDocumentState?.name}
        errorMessage={messageOf(deleteDocumentError)}
        onRequestCloseAction={() => {
          setDeleteDocumentState(null);
          resetDeleteDocument();
        }}
        onConfirmAction={() => {
          if (!deleteDocumentState) return;

          void runAndClose(deleteDocument(deleteDocumentState.id), () => {
            setDeleteDocumentState(null);
            resetDeleteDocument();
          });
        }}
      />

      <MoveDocumentModal
        isOpen={!!moveDocumentState}
        isLoading={isMovingDocument}
        documentName={moveDocumentState?.name}
        folders={folderOptions}
        currentFolderId={moveDocumentState?.folderId ?? undefined}
        errorMessage={messageOf(moveDocumentError)}
        onCancelAction={() => {
          setMoveDocumentState(null);
          resetMoveDocument();
        }}
        onConfirmAction={({ folderId }) => {
          if (!moveDocumentState) return;

          void runAndClose(moveDocument(moveDocumentState.id, folderId ?? null), () => {
            setMoveDocumentState(null);
            resetMoveDocument();
          });
        }}
      />

      <RenameDocumentModal
        isOpen={!!renameDocumentState}
        isLoading={isRenamingDocument}
        documentName={renameDocumentState?.name}
        errorMessage={messageOf(renameDocumentError)}
        onCancelAction={() => {
          setRenameDocumentState(null);
          resetRenameDocument();
        }}
        onConfirmAction={(name) => {
          if (!renameDocumentState) return;

          void runAndClose(renameDocument(renameDocumentState.id, name), () => {
            setRenameDocumentState(null);
            resetRenameDocument();
          });
        }}
      />

      <PreviewDocumentModal
        isOpen={!!previewState}
        document={previewState}
        getDownloadUrl={documentService.getPersonalDocumentDownloadUrl}
        fetchDocument={documentService.fetchPersonalDocument}
        onCloseAction={() => setPreviewState(null)}
      />
    </>
  );
};
