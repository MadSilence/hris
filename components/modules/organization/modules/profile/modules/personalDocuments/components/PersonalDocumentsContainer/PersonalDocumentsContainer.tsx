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
import { CancelSigningButton, SigningPanel } from "@/components/modules/signing/components/SigningPanel";
import { ViewLabel } from "@/components/modules/signing/components/DocumentPieces";
import { useRouter, useSearchParams } from "next/navigation";
import { updateFolderLookAction } from "../../actions/documentsFolder/updateFolderLookAction";
import { latestByDocument, useEnvelopesForPerson, useInvalidateSigning } from "@/components/modules/signing/hooks/useSigning";
import type { EnvelopeDTO } from "@/api/modules/signing/dto";
import { RequestDocumentsDialog } from "@/components/modules/signing/components/RequestDocumentsDialog";
import { EditExpiryDialog } from "@/components/modules/signing/components/ExpiryPieces";
import { RequestBoxes, isDocumentRequest } from "@/components/modules/signing/components/RequestBox";
import { useMyTasks } from "@/components/modules/lifecycle/hooks/useLifecycleQueries";
import type { DocumentDTO, DocumentFolderDTO } from "@/api/modules/documents/dto";
import { PersonalDocumentsBreadcrumbs } from "../PersonalDocumentsBreadcrumbs/PersonalDocumentsBreadcrumbs";
import { PersonalDocumentsToolbar } from "../PersonalDocumentsToolbar/PersonalDocumentsToolbar";
import { PersonalDocumentsFoldersSection } from "../PersonalDocumentsFoldersSection/PersonalDocumentsFoldersSection";
import { PersonalDocumentsFilesTable } from "../PersonalDocumentsFilesTable/PersonalDocumentsFilesTable";
import { PersonalDocumentsSkeleton } from "../PersonalDocumentsSkeleton/PersonalDocumentsSkeleton";
import { documentService } from "../../services/documentService/documentService";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import {
  usePersonalDocuments,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/usePersonalDocuments";

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
import { showError, showSuccess } from "@/lib/errors/errorToast";
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
import { Delete02Icon, Download01Icon, FolderAddIcon, FolderTransferIcon, HourglassIcon, StarIcon, Upload01Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import { SelectionBar } from "@/components/ui/SelectionBar";
import { batchDocumentsAction } from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/batchDocumentsAction";
import { Icon } from "@/components/desact/icon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ColumnPicker } from "@/components/ui/ColumnPicker";
import { useHiddenColumns } from "@/components/hooks/useHiddenColumns";
import { DOCUMENT_COLUMNS, DOCUMENT_COLUMNS_HIDDEN_BY_DEFAULT } from "../PersonalDocumentsFilesTable/PersonalDocumentsFilesTable";
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
    folderNames,
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
  const ownerFirstName = owner?.firstName?.trim() || null;
  const router = useRouter();
  const searchParams = useSearchParams();
  // The Home card's Upload lands here with `?request=` (R7): its upload opens at once.
  const requestToOpen = searchParams?.get("request") ?? null;
  const clearRequestParam = React.useCallback(() => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    next.delete("request");
    const query = next.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }, [router, searchParams]);
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
  const { hidden: hiddenColumns, setHidden: setHiddenColumns } = useHiddenColumns("documents", DOCUMENT_COLUMNS_HIDDEN_BY_DEFAULT);
  // The folder open now, for its tile in the trail (DT29).
  const [openedFolder, setOpenedFolder] = useState<DocumentFolderDTO | null>(null);
  const categoryOf = (id: string | null | undefined) => (id ? categories?.find((c) => c.id === id) ?? null : null);
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
    // DT12: the change says itself — "Visible to Reza" / "Hidden from Reza".
    showSuccess(
      ownerFirstName
        ? visibility === "HR_ONLY" ? t("documents.table.hiddenFrom", { name: ownerFirstName }) : t("documents.table.visibleTo", { name: ownerFirstName })
        : visibility === "HR_ONLY" ? t("documents.table.hidden") : t("documents.table.visible"),
    );
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
  // S08a: the signed copy's card at the foot of a completed signing, and opening it.
  const signedCopyOf = (envelope: EnvelopeDTO) => {
    const copy = envelope.signedDocumentId ? documents.find((d) => d.id === envelope.signedDocumentId) : undefined;
    return copy ? { name: copy.name, folderName: copy.folderId ? folderNames.get(copy.folderId) ?? null : null } : null;
  };
  const openSigned = (documentId: string, before?: () => void) => {
    const copy = documents.find((d) => d.id === documentId);
    if (!copy) return;
    before?.();
    setPreviewState(copy);
  };
  // Requests (documents-requests): asking from here (R05, R01), and on one's own tab, what one is asked for (R07).
  const [requestState, setRequestState] = useState<{ replacing: DocumentDTO | null } | null>(null);
  const [expiryState, setExpiryState] = useState<DocumentDTO | null>(null);
  const myTasks = useMyTasks(false);
  // R7: the requests I am asked to upload about this person — mine on my own tab, or someone else's I upload for.
  const myRequests = (myTasks.data ?? []).filter((task) => isDocumentRequest(task) && task.subject.id === userId);

  // Dropping anywhere on the tab uploads into the folder currently open, which is what people
  // expect from a file browser. The modal stays for picking a folder or a category explicitly.
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragDepth = React.useRef(0);

  const folderOptions = useMemo(
    () => folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      icon: folder.icon ?? null,
      color: folder.color ?? null,
      fileCount: atRoot ? folderFileCounts.get(folder.id) ?? 0 : undefined,
    })),
    [folders, atRoot, folderFileCounts]
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
      {/* DT5: no card around the tab — the toolbar sits under the tab row, flush with the tabs' left edge. */}
      <div
        className="relative flex h-full flex-col"
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
        {/* The drop target (SPEC § 2: the accent's subtle tint and its outline). Nothing marks the zone at rest (DT32). */}
        {isDraggingOver && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-card border-[1.5px] border-accent bg-accent-subtle text-accent-text">
            <Icon icon={Upload04Icon} />
            <p className="text-body font-semibold">{t("documents.container.dropTitle")}</p>
            <p className="text-hint text-secondary">{dropTarget}</p>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-6">
          {myRequests.length > 0 && !showTrash && (
            <RequestBoxes
              tasks={myRequests}
              openTaskId={requestToOpen}
              onOpenedAction={clearRequestParam}
              onUploadedAction={() => {
                void myTasks.refetch();
                refreshAll();
              }}
            />
          )}
          {/* T17: a tab that did not load shows no toolbar; T12: nor does a tab with nothing in it. */}
          {!isBlank && !(error && !showTrash) && (
            <div className="flex flex-none items-center gap-4">
              <PersonalDocumentsToolbar
                search={search}
                onSearchChange={setSearch}
                onUploadFromLocal={() => openUpload(undefined)}
                onCreateFolder={() => setCreateFolderOpen(true)}
                canEdit={canEdit && !showTrash}
                onRequest={hasEditPermission && !isOwnSpace && !showTrash ? () => setRequestState({ replacing: null }) : undefined}
                onOpenTrash={canManage && !showTrash ? () => { clearSelection(); setShowTrash(true); } : undefined}
              />
            </div>
          )}

          {/* Inside a folder the trail says which (T01, DT29): Documents › its tile and name, and its count. */}
          {!showTrash && breadcrumbs.length > 1 && (
            <div className="flex-none">
              <PersonalDocumentsBreadcrumbs
                items={breadcrumbs}
                current={openedFolder && openedFolder.id === currentFolderId ? openedFolder : { icon: null, color: null }}
                count={isFiltered ? undefined : documents.length}
                onNavigate={(index) => {
                  clearSelection();
                  goToBreadcrumb(index);
                }}
              />
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {showTrash ? (
              <PersonalDocumentsTrash
                userId={userId}
                search={search}
                folderNames={new Map([...folderOptions.map((f) => [f.id, f.name] as const), ...folderNames])}
                trail={
                  <PersonalDocumentsBreadcrumbs
                    items={[breadcrumbs[0], { id: null, name: t("documents.container.trash") }]}
                    onNavigate={(index) => {
                      if (index === 0) setShowTrash(false);
                    }}
                  />
                }
              />
            ) : isLoading ? (
              <PersonalDocumentsSkeleton/>
            ) : error ? (
              <ErrorState error={error} title={t("documents.container.loadFailed")} message={t("documents.container.loadFailedBody")} />
            ) : isBlank ? (
              <EmptyState
                scene="documents"
                title={t("documents.container.blankTitle")}
                description={canEdit
                  ? t("documents.container.blankDescriptionEditable")
                  : t("documents.container.blankDescription")}
                action={canEdit ? (
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => openUpload(undefined)}>
                      <Icon icon={Upload01Icon} size="sm" />
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
              />
            ) : isEmpty && !atRoot ? (
              // Only inside a folder. At the root an empty list is a view with nothing in it (Starred, Expiring) and
              // keeps its switch with its own words (V2b) — this branch took it when the person had no folders, and
              // empty Starred read "This folder is empty" with the switch gone (walk of 2026-11-23).
              <EmptyState
                scene="documents"
                title={t("documents.container.emptyFolderTitle")}
                description={canEdit ? t("documents.container.emptyFolderDescription") : ""}
                action={canEdit ? (
                  <Button type="button" variant="secondary" onClick={() => openUpload(currentFolderId ?? undefined)}>
                    <Icon icon={Upload01Icon} size="sm" />
                    {t("documents.folderCard.uploadHere")}
                  </Button>
                ) : undefined}
              />
            ) : (
              <div className="flex min-h-full flex-col gap-6">
                {/* Folders hide while searching: the search looks in every folder (T14). */}
                {!isFiltered && (
                  <PersonalDocumentsFoldersSection
                    folders={folders}
                    fileCounts={atRoot ? folderFileCounts : undefined}
                    onOpen={(folder) => { clearSelection(); setOpenedFolder(folder); openFolder(folder); }}
                    onRename={canEdit ? (folder) => setRenameFolderState(folder) : undefined}
                    onDelete={canManage ? (folder) => setDeleteFolderState(folder) : undefined}
                    onUploadHere={canEdit ? (folder) => openUpload(folder.id) : undefined}
                    onDropFiles={canEdit ? (folder, files) => openUpload(folder.id, files) : undefined}
                    onChangeLook={canEdit ? (folder) => setLookState(folder) : undefined}
                  />
                )}

                {/* WALK_QUESTIONS § 50: the bar takes the view tabs' row while rows are selected, so the list does not move
                    under the pointer at the first tick (a second click landed on the header's box and took all 16). */}
                {selectedIds.length > 0 ? (
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
                      ...(canEdit ? [{ key: "move", label: t("documents.table.moveTo"), icon: FolderTransferIcon, onClick: () => setBatchMoveOpen(true) }] : []),
                      { key: "star", label: t("documents.table.star"), icon: StarIcon, onClick: () => void runBatch("star").then((ok) => ok && clearSelection()) },
                      ...(canManage ? [{ key: "delete", label: t("documents.table.moveToTrash"), icon: Delete02Icon, danger: true, onClick: () => void batchDelete() }] : []),
                    ]}
                  />
                ) : atRoot && !isFiltered ? (
                  // DT8, X2, DT31: each count in its pill, Starred and Expiring with their icons; Expiring is always there
                  // ("Expiring 0"), and the switch stays in every view while the person has any file at all.
                  <div className="flex h-12 items-center">
                    <SegmentedControl
                      aria-label={t("documents.views.label")}
                      fill={false}
                      size="window"
                      className="self-start"
                      value={view}
                      onChange={(next: DocumentsView) => { clearSelection(); setView(next); }}
                      options={(["LOOSE", "ALL", "STARRED", "EXPIRING"] as const).map((v) => ({
                        value: v,
                        label: (
                          <ViewLabel
                            icon={v === "STARRED" ? StarIcon : v === "EXPIRING" ? HourglassIcon : undefined}
                            label={t(`documents.views.${v}`)}
                            count={viewCounts[v]}
                          />
                        ),
                      }))}
                    />
                  </div>
                ) : null}

                {viewIsEmpty ? (
                  // V2b (DT33): an empty view keeps the switch above it and says what the view is for.
                  view === "STARRED" ? (
                    <EmptyState scene="documents" title={t("documents.container.starredEmptyTitle")} description={t("documents.container.starredEmptyBody")} />
                  ) : view === "EXPIRING" ? (
                    <EmptyState scene="documents" title={tSigning("section.empty.expiring")} description={tSigning("section.empty.expiringBody")} />
                  ) : (
                    <EmptyState
                      scene="documents"
                      title={t("documents.container.looseEmptyTitle")}
                      description={canEdit ? t("documents.container.emptyFolderDescription") : ""}
                    />
                  )
                ) : (
                <PersonalDocumentsFilesTable
                  documents={documents}
                  sort={sort}
                  onSortChange={setSort}
                  onToggleStar={toggleStar}
                  onDelete={canManage ? (document) => void deleteWithUndo(document) : undefined}
                  onChangeVisibility={hasManagePermission ? (document, next) => void changeVisibility(document, next) : undefined}
                  personFirstName={isOwnSpace ? null : ownerFirstName}
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
                  folderNames={atRoot && !isFiltered && view === "STARRED" ? folderNames : undefined}
                  groupByFolder={atRoot && !isFiltered && view === "ALL"
                    ? { names: folderNames, looseLabel: t("documents.views.LOOSE") }
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
      </div>

      {/* T03 (DT6): New folder — "In Reza's documents", a live tile, Name, Color, Icon · Cancel · Add folder. */}
      {createFolderOpen && (
        <FolderLookDialog
          mode="create"
          userId={userId}
          subtitle={isOwnSpace
            ? t("documents.createFolder.inOwn")
            : t("documents.createFolder.inPerson", { name: ownerName || t("documents.root") })}
          onCreateAction={async (name, look) => {
            try {
              const made = (await createFolder(name)) as { data?: { id?: string } } | undefined;
              const id = made?.data?.id;
              if (id && (look.icon || look.color)) {
                const r = await updateFolderLookAction({ userId, folderId: id, icon: look.icon, color: look.color });
                if (r.status !== ActionStatus.SUCCESS) return r.errorMessage ?? null;
              }
              resetCreateFolder();
              refreshAll();
              return null;
            } catch (e) {
              return messageOf(e) ?? messageOf(createFolderError) ?? "";
            }
          }}
          onCloseAction={() => {
            setCreateFolderOpen(false);
            resetCreateFolder();
          }}
          onSavedAction={() => setCreateFolderOpen(false)}
        />
      )}

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
        personFirstName={isOwnSpace ? null : ownerFirstName}
        personName={isOwnSpace ? null : ownerName}
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
        onNewFolderAction={canEdit ? () => setCreateFolderOpen(true) : undefined}
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
        onNewFolderAction={canEdit ? () => setCreateFolderOpen(true) : undefined}
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
          personName={ownerFirstName ?? ownerName}
          remindDaysBefore={categoryOf(expiryState.categoryId)?.remindDaysBefore ?? null}
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
              managerId={owner?.manager?.id ?? null}
              signedCopy={signedCopyOf(signingByDocument.get(signingState.id)!)}
              onOpenSignedAction={(id) => openSigned(id, () => setSigningState(null))}
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
        personFirstName={isOwnSpace ? null : ownerFirstName}
        folderName={previewState?.folderId ? folderNames.get(previewState.folderId) ?? null : null}
        footerAction={previewState && signingByDocument.get(previewState.id)?.status === "SENT" && hasEditPermission && !isOwnSpace ? (
          <CancelSigningButton envelope={signingByDocument.get(previewState.id)!} onDoneAction={() => void invalidateSigning()} />
        ) : undefined}
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
            cancelInFooter
            managerId={owner?.manager?.id ?? null}
            signedCopy={signedCopyOf(signingByDocument.get(previewState.id)!)}
            onOpenSignedAction={(id) => openSigned(id)}
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
