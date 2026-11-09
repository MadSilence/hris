"use client";

import { messageForError } from "@/lib/errors/errorMessages";
import { ErrorState } from "@/components/feedback/ErrorState";
import {
  useDocumentsFolderDeleteImpact,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/documentsFolder/useDocumentsFolderDeleteImpact";
import * as React from "react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Card } from "@/components/desact/card";
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
import { showUndoToast } from "@/lib/feedback/undoToast";
import { showError } from "@/lib/errors/errorToast";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useQueryClient } from "@tanstack/react-query";
import { restoreDocumentAction } from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/trashActions";
import { changeDocumentVisibilityAction } from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/changeDocumentVisibilityAction";
import type { DocumentVisibility } from "@/api/modules/documents/dto";
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
import { Button } from "@/components/desact/button";
import { Delete02Icon, Download01Icon, FolderAddIcon, FolderTransferIcon, StarIcon, Upload04Icon } from "@hugeicons/core-free-icons";
import { SelectionBar } from "@/components/ui/SelectionBar";
import { batchDocumentsAction } from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/batchDocumentsAction";
import { Icon } from "@/components/desact/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/desact/tooltip";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { useUser } from "@/components/hooks/useUser/useUser";

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
    isMovingDocument,
    isRenamingDocument,

    createFolderError,
    renameFolderError,
    deleteFolderError,
    uploadFileError,
    moveDocumentError,
    renameDocumentError,

    resetCreateFolder,
    resetRenameFolder,
    resetDeleteFolder,
    resetUploadFile,
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

  // The drop overlay says whose documents a file lands in.
  const { data: owner } = useUser(userId);
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const dropTarget = breadcrumbs.length > 1
    ? t("documents.container.dropToFolder", { folder: breadcrumbs[breadcrumbs.length - 1].name })
    : isOwnSpace
      ? t("documents.container.dropToOwn")
      : owner?.firstName
        ? t("documents.container.dropToPerson", { name: owner.firstName })
        : t("documents.container.dropToThese");

  /*
   * Nothing at all in this person's space — not a folder that happens to be empty, not a search that missed.
   * Then the toolbar has nothing to act on and goes (design fixes of 2026-11-04, fix 7); the empty state
   * carries the two actions instead.
   */
  const isFiltered = search.trim() !== "" || starredOnly || hrOnly;
  const isBlank = isEmpty && !isFiltered && breadcrumbs.length <= 1;

  const [showTrash, setShowTrash] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);

  const [renameFolderState, setRenameFolderState] = useState<DocumentFolderDTO | null>(null);
  const [deleteFolderState, setDeleteFolderState] = useState<DocumentFolderDTO | null>(null);
  // Counted when the dialog opens, not carried along with the listing: a folder that was empty two
  // minutes ago is not a promise about now.
  const folderImpact = useDocumentsFolderDeleteImpact(userId, deleteFolderState?.id ?? null);
  const queryClient = useQueryClient();
  // The list and the trash both change when a document goes or comes back.
  const refreshAll = () => void queryClient.invalidateQueries();

  /**
   * Delete moves to the trash, which can be undone — so no dialog asking first, but a toast with Undo (the owner,
   * 2026-11-05, D1; `lib/feedback/undoToast` says why the two are not the same thing).
   */
  const deleteWithUndo = async (document: DocumentDTO) => {
    try {
      await deleteDocument(document.id);
    } catch (error) {
      showError(error);
      return;
    }
    showUndoToast({
      message: t("documents.table.movedToTrash", { name: document.name }),
      onUndo: async () => {
        const result = await restoreDocumentAction({ userId, documentId: document.id });
        if (result.status === ActionStatus.ERROR) throw new Error(result.errorMessage);
        refreshAll();
      },
    });
  };

  // Bulk selection (D2): the rows picked in the open folder; cleared when the folder or the filter changes.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchMoveOpen, setBatchMoveOpen] = useState(false);
  const visibleIds = useMemo(() => documents.map((d) => d.id), [documents]);
  const selectedIds = useMemo(() => [...selected].filter((id) => visibleIds.includes(id)), [selected, visibleIds]);
  const clearSelection = React.useCallback(() => setSelected(new Set()), []);
  const toggleSelected = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAllSelected = () =>
    setSelected((prev) => (visibleIds.every((id) => prev.has(id)) ? new Set() : new Set(visibleIds)));

  const runBatch = async (operation: "delete" | "restore" | "star" | "move", extra?: { folderId?: string | null }) => {
    const ids = selectedIds;
    const result = await batchDocumentsAction({ operation, ids, targetUserId: userId, starred: true, ...extra });
    if (result.status === ActionStatus.ERROR) {
      showError(new Error(result.errorMessage ?? t("documents.table.batchFailed")));
      return false;
    }
    refreshAll();
    return ids;
  };

  const batchDelete = async () => {
    const ids = await runBatch("delete");
    if (!ids) return;
    clearSelection();
    showUndoToast({
      message: t("documents.table.movedManyToTrash", { count: ids.length }),
      onUndo: async () => {
        const result = await batchDocumentsAction({ operation: "restore", ids });
        if (result.status === ActionStatus.ERROR) throw new Error(result.errorMessage);
        refreshAll();
      },
    });
  };

  const zipUrl = `/api/documents/batch/zip?${new URLSearchParams(selectedIds.map((id) => ["ids", id])).toString()}`;

  const changeVisibility = async (document: DocumentDTO, visibility: DocumentVisibility) => {
    if (visibility === document.visibility) return;
    const result = await changeDocumentVisibilityAction({ documentId: document.id, visibility });
    if (result.status === ActionStatus.ERROR) {
      showError(new Error(result.errorMessage ?? t("documents.table.visibilityFailed")));
      return;
    }
    refreshAll();
  };
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
        className="relative flex h-full flex-col border-0 px-8 pt-6 pb-8"
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
        {/* The drop target (SPEC § 2: the accent's subtle tint and its outline). Nothing marks the zone at rest. */}
        {isDraggingOver && (
          <div className="pointer-events-none absolute inset-x-8 top-4 bottom-4 z-10 flex flex-col items-center justify-center gap-2 rounded-card border-[1.5px] border-accent bg-accent-subtle text-accent-text">
            <Icon icon={Upload04Icon} />
            <p className="text-body font-semibold">{t("documents.container.dropTitle")}</p>
            <p className="text-hint text-secondary">{dropTarget}</p>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-6">
          {/* While rows are picked, the bar takes the toolbar's place (D2). */}
          {selectedIds.length > 0 && !showTrash ? (
            <SelectionBar
              count={selectedIds.length}
              onClear={clearSelection}
              actions={[
                { key: "download", label: tCommon("actions.download"), icon: Download01Icon, href: zipUrl },
                { key: "star", label: t("documents.table.star"), icon: StarIcon, onClick: () => void runBatch("star").then((ok) => ok && clearSelection()) },
                ...(canEdit ? [{ key: "move", label: t("documents.table.move"), icon: FolderTransferIcon, onClick: () => setBatchMoveOpen(true) }] : []),
                ...(canManage ? [{ key: "delete", label: tCommon("actions.delete"), icon: Delete02Icon, danger: true, onClick: () => void batchDelete() }] : []),
              ]}
            />
          ) : (
          /* The trash stays reachable while the space is blank: what was deleted is still in it. */
          <div className="flex flex-none items-center gap-4">
            {!(isBlank && !showTrash) && <PersonalDocumentsToolbar
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
            />}

            <div className="ml-auto flex items-center gap-3">
              {canManage && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button"
                      variant="secondary"
                      size="icon"
                      aria-label={t("documents.container.trash")}
                      aria-pressed={showTrash}
                      onClick={() => setShowTrash((v) => !v)}
                    >
                      <Icon icon={Delete02Icon} size="sm" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("documents.container.trash")}</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          )}

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
              <div className="rounded-control border bg-card">
                <ErrorState error={error} compact/>
              </div>
            ) : isBlank ? (
              <EmptyState
                scene="documents"
                className="pt-8"
                title={t("documents.container.blankTitle")}
                description={canEdit
                  ? t("documents.container.blankDescriptionEditable")
                  : t("documents.container.blankDescription")}
                action={canEdit ? (
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => setAddDocumentOpen(true)}>
                      <Icon icon={Upload04Icon} size="sm" />
                      {t("documents.container.uploadFile")}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setCreateFolderOpen(true)}>
                      <Icon icon={FolderAddIcon} size="sm" />
                      {t("documents.container.newFolder")}
                    </Button>
                  </div>
                ) : undefined}
              />
            ) : isEmpty && isFiltered ? (
              <NoResults title={t("documents.container.noMatchTitle")} hint={t("documents.container.noMatchHint")} onClearSearch={search.trim() ? () => setSearch("") : undefined} />
            ) : isEmpty ? (
              <PersonalDocumentsEmptyState title={t("documents.container.emptyFolderTitle")} description={t("documents.container.emptyFolderDescription")} />
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
                  onDelete={canManage ? (document) => void deleteWithUndo(document) : undefined}
                  onChangeVisibility={hasManagePermission ? (document, next) => void changeVisibility(document, next) : undefined}
                  onMove={canEdit ? (document) => setMoveDocumentState(document) : undefined}
                  onRename={canEdit ? (document) => setRenameDocumentState(document) : undefined}
                  onPreview={(document) => setPreviewState(document)}
                  getDownloadUrl={documentService.getPersonalDocumentDownloadUrl}
                  selectedIds={new Set(selectedIds)}
                  onToggleSelected={toggleSelected}
                  onToggleAllSelected={toggleAllSelected}
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

      {/* The same dialog moves a selection: "Move 3 documents to another folder". */}
      <MoveDocumentModal
        isOpen={batchMoveOpen}
        documentName={t("documents.moveDocument.nDocuments", { count: selectedIds.length })}
        count={selectedIds.length}
        folders={folderOptions}
        onCancelAction={() => setBatchMoveOpen(false)}
        onConfirmAction={({ folderId }) => {
          void runBatch("move", { folderId: folderId ?? null }).then((ok) => {
            if (!ok) return;
            setBatchMoveOpen(false);
            clearSelection();
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
