"use client";

import { messageForError } from "@/lib/errors/errorMessages";
import { ErrorState } from "@/components/feedback/ErrorState";
import {
  useDocumentsFolderDeleteImpact,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/documentsFolder/useDocumentsFolderDeleteImpact";
import * as React from "react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/desact/dialog";
import { SendForSignatureDialog, stepsFrom } from "@/components/modules/signing/components/SendForSignatureDialog";
import { SigningPanel } from "@/components/modules/signing/components/SigningPanel";
import { latestByDocument, useEnvelopesForPerson, useInvalidateSigning } from "@/components/modules/signing/hooks/useSigning";
import type { EnvelopeDTO } from "@/api/modules/signing/dto";
import { RequestDocumentsDialog } from "@/components/modules/signing/components/RequestDocumentsDialog";
import { EditExpiryDialog } from "@/components/modules/signing/components/ExpiryPieces";
import { RequestBoxes, isDocumentRequest } from "@/components/modules/signing/components/RequestBox";
import { useMyTasks } from "@/components/modules/lifecycle/hooks/useLifecycleQueries";
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
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { useHiddenColumns } from "@/components/hooks/useHiddenColumns";
import { DOCUMENT_COLUMNS } from "../PersonalDocumentsFilesTable/PersonalDocumentsFilesTable";
import type { DocumentsView } from "../../hooks/document/usePersonalDocuments/usePersonalDocuments";
import { FolderLookDialog } from "../modals/FolderLookDialog";
import { uploadFileKey, type UploadFileStatus } from "../modals/UploadDocumentForm";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { useUser } from "@/components/hooks/useUser/useUser";
import { useIsDemo } from "@/components/modules/demo";

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
    sort,
    setSort,
    view,
    setView,
    viewCounts,
    folderFileCounts,
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
  const isDemo = useIsDemo();
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const tSigning = useTranslations("signing");
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
  const isFiltered = search.trim() !== "";
  const atRoot = breadcrumbs.length <= 1;
  // Blank is the person having nothing at all — every view empty, not just the one open.
  const isBlank = atRoot && !isFiltered && !isLoading && !error && folders.length === 0 && viewCounts.ALL === 0;
  const viewIsEmpty = atRoot && !isFiltered && documents.length === 0;
  const { hidden: hiddenColumns, setHidden: setHiddenColumns } = useHiddenColumns("documents");
  const showVisibility = hasManagePermission || !isOwnSpace;
  const [lookState, setLookState] = useState<DocumentFolderDTO | null>(null);
  const [uploadFolderId, setUploadFolderId] = useState<string | null | undefined>(undefined);
  // M3: what was dropped before the window opened, each file's progress, and a key that gives each opening a fresh form.
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<Record<string, UploadFileStatus>>({});
  const [uploadRound, setUploadRound] = useState(0);
  const [uploading, setUploading] = useState(false);
  const openUpload = (folderId: string | null | undefined, files: File[] = []) => {
    setUploadFolderId(folderId);
    setDroppedFiles(files);
    setUploadStatuses({});
    setUploadRound((n) => n + 1);
    setAddDocumentOpen(true);
  };
  /** One file after another, each with its own outcome: a refused one stays in the list with why; the rest go in. */
  const uploadEach = async (values: { files: File[]; folderId?: string; categoryId?: string; visibility: DocumentVisibility; expiresOn?: string }) => {
    const todo = values.files.filter((f) => uploadStatuses[uploadFileKey(f)]?.state !== "done");
    setUploading(true);
    setUploadStatuses((prev) => ({ ...prev, ...Object.fromEntries(todo.map((f) => [uploadFileKey(f), { state: "waiting" as const }])) }));
    let failed = 0;
    for (const file of todo) {
      const key = uploadFileKey(file);
      setUploadStatuses((prev) => ({ ...prev, [key]: { state: "uploading" } }));
      try {
        await uploadFiles([file], values.folderId ?? null, values.categoryId ?? null, values.visibility, values.expiresOn ?? null);
        setUploadStatuses((prev) => ({ ...prev, [key]: { state: "done" } }));
      } catch (e) {
        failed++;
        setUploadStatuses((prev) => ({ ...prev, [key]: { state: "failed", message: messageForError(e) ?? "" } }));
      }
    }
    setUploading(false);
    resetUploadFile();
    if (failed === 0) setAddDocumentOpen(false);
  };

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
  // Sending for signature and following it (documents-send-for-signature S01–S13).
  const envelopes = useEnvelopesForPerson(userId);
  const signingByDocument = useMemo(() => latestByDocument(envelopes.data), [envelopes.data]);
  const invalidateSigning = useInvalidateSigning();
  const [sendState, setSendState] = useState<{ document: DocumentDTO; again: EnvelopeDTO | null } | null>(null);
  const [signingState, setSigningState] = useState<DocumentDTO | null>(null);
  const ownerName = owner ? `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim() : "";
  // Requests (documents-requests): asking from here (R05, R01), and on one's own tab, what one is asked for (R07).
  const [requestState, setRequestState] = useState<{ replacing: DocumentDTO | null } | null>(null);
  const [expiryState, setExpiryState] = useState<DocumentDTO | null>(null);
  const myTasks = useMyTasks(false);
  const myRequests = isOwnSpace ? (myTasks.data ?? []).filter(isDocumentRequest) : [];

  // Dropping anywhere on the tab uploads into the folder currently open, which is what people
  // expect from a file browser. The modal stays for picking a folder or a category explicitly.
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragDepth = React.useRef(0);

  // Folder headings of All documents (F4): the root's folders; a file deeper down is headed by its own folder's id.
  const allFolderNames = useMemo(() => folders.map((f) => [f.id, f.name] as [string, string]), [folders]);

  const folderOptions = useMemo(
    () => folders.map((folder) => ({ id: folder.id, name: folder.name, icon: folder.icon ?? null, color: folder.color ?? null })),
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
          // T07: letting go opens Upload with the files in it, into the folder open now.
          if (dropped.length > 0) openUpload(undefined, dropped);
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
          {myRequests.length > 0 && !showTrash && (
            <RequestBoxes tasks={myRequests} onUploadedAction={() => void myTasks.refetch()} />
          )}
          {/* The toolbar stays while rows are picked; the selection bar sits above the list it acts on (T05b). */}
          {!showTrash && !isBlank && (
            <div className="flex flex-none items-center gap-4">
              <PersonalDocumentsToolbar
                search={search}
                onSearchChange={setSearch}
                onUploadFromLocal={() => openUpload(undefined)}
                onCreateFolder={() => setCreateFolderOpen(true)}
                canEdit={canEdit}
                onRequest={hasEditPermission && !isOwnSpace ? () => setRequestState({ replacing: null }) : undefined}
                onOpenTrash={canManage ? () => { clearSelection(); setShowTrash(true); } : undefined}
              />
            </div>
          )}

          {/*
            The trail says which folder is open — and the trash opens like a folder: Documents › Trash (T10).
            At the root it said "Documents" above a tab already called Documents.
          */}
          {(showTrash || breadcrumbs.length > 1) && (
            <div className="flex-none">
              <PersonalDocumentsBreadcrumbs
                items={showTrash ? [breadcrumbs[0], { id: null, name: t("documents.container.trash") }] : breadcrumbs}
                onNavigate={(index) => {
                  if (showTrash) {
                    if (index === 0) setShowTrash(false);
                    return;
                  }
                  goToBreadcrumb(index);
                }}
              />
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {showTrash ? (
              <PersonalDocumentsTrash userId={userId}/>
            ) : isLoading ? (
              <PersonalDocumentsSkeleton/>
            ) : error ? (
              <ErrorState error={error} />
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
            ) : isFiltered && documents.length === 0 ? (
              <NoResults
                title={t("documents.container.noResultsTitle", { query: search.trim() })}
                hint={t("documents.container.noResultsHint")}
                onClearSearch={() => setSearch("")}
              />
            ) : isEmpty ? (
              <PersonalDocumentsEmptyState title={t("documents.container.emptyFolderTitle")} description={t("documents.container.emptyFolderDescription")} />
            ) : (
              <div className="flex flex-col gap-6">
                {/* Folders hide while searching: the search looks in every folder (T14). */}
                {!isFiltered && (
                  <PersonalDocumentsFoldersSection
                    folders={folders}
                    fileCounts={atRoot ? folderFileCounts : undefined}
                    onOpen={(folder) => { clearSelection(); openFolder(folder); }}
                    onRename={canEdit ? (folder) => setRenameFolderState(folder) : undefined}
                    onDelete={canManage ? (folder) => setDeleteFolderState(folder) : undefined}
                    onUploadHere={canEdit ? (folder) => openUpload(folder.id) : undefined}
                    onDropFiles={canEdit ? (folder, files) => openUpload(folder.id, files) : undefined}
                    onChangeLook={canEdit ? (folder) => setLookState(folder) : undefined}
                  />
                )}

                {atRoot && !isFiltered && (
                  <SegmentedControl
                    aria-label={t("documents.views.label")}
                    fill={false}
                    className="self-start"
                    value={view}
                    onChange={(next: DocumentsView) => { clearSelection(); setView(next); }}
                    options={(["LOOSE", "ALL", "STARRED", "EXPIRING"] as const)
                      .filter((v) => v !== "EXPIRING" || viewCounts.EXPIRING > 0 || view === "EXPIRING")
                      .map((v) => ({
                      value: v,
                      label: `${t(`documents.views.${v}`)} ${viewCounts[v]}`,
                    }))}
                  />
                )}

                {selectedIds.length > 0 && (
                  <SelectionBar
                    count={selectedIds.length}
                    onClear={clearSelection}
                    extra={selectedIds.length < documents.length ? (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set(visibleIds))}>
                        {t("documents.container.selectAll", { count: documents.length })}
                      </Button>
                    ) : undefined}
                    actions={[
                      { key: "download", label: tCommon("actions.download"), icon: Download01Icon, href: zipUrl },
                      ...(canEdit ? [{ key: "move", label: t("documents.table.move"), icon: FolderTransferIcon, onClick: () => setBatchMoveOpen(true) }] : []),
                      { key: "star", label: t("documents.table.star"), icon: StarIcon, onClick: () => void runBatch("star").then((ok) => ok && clearSelection()) },
                      ...(canManage ? [{ key: "delete", label: t("documents.table.moveToTrash"), icon: Delete02Icon, danger: true, onClick: () => void batchDelete() }] : []),
                    ]}
                  />
                )}

                {viewIsEmpty ? (
                  <PersonalDocumentsEmptyState title={t("documents.container.emptyFolderTitle")} description={t("documents.container.emptyFolderDescription")} />
                ) : (
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
                  signingOf={(document) => signingByDocument.get(document.id)}
                  onSendForSignature={hasEditPermission && !isOwnSpace ? (document) => setSendState({ document, again: null }) : undefined}
                  onOpenSigning={(document) => setSigningState(document)}
                  onRequestNew={hasEditPermission && !isOwnSpace ? (document) => setRequestState({ replacing: document }) : undefined}
                  onEditExpiry={canEdit ? (document) => setExpiryState(document) : undefined}
                  getDownloadUrl={documentService.getPersonalDocumentDownloadUrl}
                  selectedIds={new Set(selectedIds)}
                  onToggleSelected={toggleSelected}
                  onToggleAllSelected={toggleAllSelected}
                  hiddenColumns={hiddenColumns}
                  showVisibility={showVisibility}
                  groupByFolder={atRoot && !isFiltered && view === "ALL"
                    ? { names: new Map(allFolderNames), looseLabel: t("documents.views.LOOSE") }
                    : undefined}
                  columnPicker={
                    <ColumnPicker
                      columns={DOCUMENT_COLUMNS.filter((c) => c !== "visibility" || showVisibility).map((c) => ({
                        key: c,
                        label: c === "expires" ? tSigning("expiry.expires") : c === "visibility" ? t("documents.table.whoCanSee") : t(`documents.table.${c}`),
                      }))}
                      hidden={hiddenColumns}
                      onChange={(next) => void setHiddenColumns(next)}
                    />
                  }
                />
                )}
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
        key={uploadRound}
        isOpen={addDocumentOpen}
        isLoading={uploading || isUploadingFile}
        initialFiles={droppedFiles}
        statuses={uploadStatuses}
        folders={folderOptions}
        categories={categories?.filter((c) => c.isActive)}
        defaultFolderId={(uploadFolderId === undefined ? currentFolderId : uploadFolderId) ?? undefined}
        defaultVisibility={isOwnSpace ? "VISIBLE_TO_EMPLOYEE" : "HR_ONLY"}
        errorMessage={null}
        onCancelAction={() => {
          setAddDocumentOpen(false);
          resetUploadFile();
        }}
        onConfirmAction={(values) => void uploadEach(values)}
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

      {expiryState && (
        <EditExpiryDialog
          document={expiryState}
          personName={ownerName}
          onCloseAction={() => setExpiryState(null)}
          onSavedAction={() => {
            setExpiryState(null);
            void queryClient.invalidateQueries();
          }}
        />
      )}

      {requestState && (
        <RequestDocumentsDialog
          open
          person={{ id: userId, name: ownerName }}
          documents={documents}
          replacing={requestState.replacing}
          onCloseAction={() => setRequestState(null)}
          onSentAction={() => setRequestState(null)}
        />
      )}

      {sendState && (
        <SendForSignatureDialog
          open
          documentId={sendState.document.id}
          fileName={sendState.document.name}
          person={{ id: userId, name: ownerName }}
          manager={owner?.manager ?? null}
          demo={isDemo}
          initialSteps={sendState.again ? stepsFrom(sendState.again) : undefined}
          initialTitle={sendState.again?.title}
          onCloseAction={() => setSendState(null)}
          onSentAction={() => {
            setSendState(null);
            void invalidateSigning();
          }}
        />
      )}

      <Dialog open={!!signingState} onOpenChange={(next) => !next && setSigningState(null)}>
        <DialogContent size="sm">
          <DialogTitle className="sr-only">{signingState?.name ?? ""}</DialogTitle>
          {signingState && signingByDocument.get(signingState.id) && (
            <SigningPanel
              envelope={signingByDocument.get(signingState.id)!}
              canSend={hasEditPermission && !isOwnSpace}
              onChangedAction={() => void invalidateSigning()}
              onSendAgainAction={() => {
                const again = signingByDocument.get(signingState.id) ?? null;
                setSigningState(null);
                setSendState({ document: signingState, again });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* The preview (V2-Preview): rename in place, star, Move to trash, and the signing panel in its right column. */}
      <PreviewDocumentModal
        isOpen={!!previewState}
        document={previewState}
        getDownloadUrl={documentService.getPersonalDocumentDownloadUrl}
        fetchDocument={documentService.fetchPersonalDocument}
        onCloseAction={() => setPreviewState(null)}
        showVisibility={showVisibility}
        onRenameAction={previewState && canEdit && !previewState.signedAt && signingByDocument.get(previewState.id)?.status !== "SENT"
          ? async (name) => {
            try {
              await renameDocument(previewState.id, name);
              setPreviewState({ ...previewState, name });
              return true;
            } catch (e) {
              showError(e);
              return false;
            }
          }
          : undefined}
        onToggleStarAction={previewState ? () => {
          void toggleStar(previewState);
          setPreviewState({ ...previewState, isStarred: !previewState.isStarred });
        } : undefined}
        onTrashAction={previewState && canManage ? () => {
          const doc = previewState;
          setPreviewState(null);
          void deleteWithUndo(doc);
        } : undefined}
        aside={previewState && signingByDocument.get(previewState.id) ? (
          <SigningPanel
            envelope={signingByDocument.get(previewState.id)!}
            canSend={hasEditPermission && !isOwnSpace}
            onChangedAction={() => void invalidateSigning()}
            onSendAgainAction={() => {
              const again = signingByDocument.get(previewState.id) ?? null;
              const doc = previewState;
              setPreviewState(null);
              setSendState({ document: doc, again });
            }}
          />
        ) : undefined}
      />

      {lookState && (
        <FolderLookDialog
          userId={userId}
          folder={lookState}
          onCloseAction={() => setLookState(null)}
          onSavedAction={() => {
            setLookState(null);
            refreshAll();
          }}
        />
      )}
    </>
  );
};
