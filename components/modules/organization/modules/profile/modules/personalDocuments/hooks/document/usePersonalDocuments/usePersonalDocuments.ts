"use client";

import * as React from "react";
import type {
  DocumentDTO,
  DocumentFolderDeleteStrategy,
  DocumentFolderContentDTO,
  DocumentFolderDTO,
  DocumentVisibility,
} from "@/api/modules/documents/dto";
import type { BreadcrumbItem } from "@/components/modules/organization/modules/profile/modules/personalDocuments/types/personalDocuments.types";
import { useDocumentsContent } from "../useDocumentsContent/useDocumentsContent";
import { useUploadPersonalDocument } from "../useUploadPersonalDocument/useUploadPersonalDocument";
import { useDeletePersonalDocument } from "../useDeletePersonalDocument/useDeletePersonalDocument";
import { useMoveDocument } from "../useMoveDocument/useMoveDocument";
import { useRenameDocument } from "../useRenameDocument/useRenameDocument";
import { useStarPersonalDocument } from "../useStarPersonalDocument/useStarPersonalDocument";
import { useUnstarPersonalDocument } from "../useUnstarPersonalDocument/useUnstarPersonalDocument";
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
  filterDocumentsFiles,
  filterDocumentsFolders
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/utils";

type UsePersonalDocumentsParams = {
  userId: string;
};

export type DocumentSortField = "name" | "category" | "visibility" | "expiresOn" | "size" | "createdAt";
export type DocumentSort = { field: DocumentSortField; dir: "asc" | "desc" };
/** The root's views (documents-tab § 3): files in no folder (the default), every file, the starred ones. */
export type DocumentsView = "LOOSE" | "ALL" | "STARRED" | "EXPIRING";

const expiring = (d: DocumentDTO) => d.expiryState === "EXPIRING" || d.expiryState === "EXPIRED";

/** Empty last in either direction (documents-tab: "files with no category go last"). */
const emptyLast = (x: string | null | undefined, y: string | null | undefined, factor: number) => {
  if (!x && !y) return 0;
  if (!x) return 1;
  if (!y) return -1;
  return x.localeCompare(y) * factor;
};

const compareDocuments = (a: DocumentDTO, b: DocumentDTO, sort: DocumentSort) => {
  const factor = sort.dir === "asc" ? 1 : -1;

  switch (sort.field) {
    case "name":
      return a.name.localeCompare(b.name) * factor;
    case "category":
      return emptyLast(a.categoryName, b.categoryName, factor);
    case "visibility":
      return a.visibility.localeCompare(b.visibility) * factor;
    case "expiresOn":
      return emptyLast(a.expiresOn, b.expiresOn, factor);
    case "size":
      return ((a.sizeBytes ?? 0) - (b.sizeBytes ?? 0)) * factor;
    case "createdAt":
      return a.createdAt.localeCompare(b.createdAt) * factor;
  }
};

/**
 * The name of every folder a file of the listing sits in: the root's folders, and — for All documents, which lists
 * files at any depth — the deeper ones the backend names in `folderNames` (a nested folder used to head its group with
 * nothing but its id).
 */
export const folderNamesOf = (
  content: Pick<DocumentFolderContentDTO, "folders" | "folderNames"> | undefined,
): Map<string, string> => {
  const names = new Map<string, string>(Object.entries(content?.folderNames ?? {}));
  for (const f of content?.folders ?? []) names.set(f.id, f.name);
  return names;
};

/**
 * Everything the documents tab needs: the folder the user is currently browsing, the filtered
 * contents, and every mutation. The container renders and owns modal state only — it must not
 * instantiate these mutations a second time, or each action ends up with two cache subscriptions.
 */
export function usePersonalDocuments({ userId }: UsePersonalDocumentsParams) {
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<DocumentSort>({ field: "createdAt", dir: "desc" });
  const [view, setView] = React.useState<DocumentsView>("LOOSE");
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([
    { id: null, name: "Documents" },
  ]);

  const { data, isLoading, error } = useDocumentsContent({
    userId,
    folderId: currentFolderId,
  });

  const createFolderMutation = useCreateDocumentsFolder();
  const updateFolderMutation = useUpdateDocumentsFolder();
  const deleteFolderMutation = useDeleteDocumentsFolder();
  const uploadDocumentMutation = useUploadPersonalDocument();
  const deleteDocumentMutation = useDeletePersonalDocument();
  const moveDocumentMutation = useMoveDocument();
  const renameDocumentMutation = useRenameDocument();
  const starDocumentMutation = useStarPersonalDocument();
  const unstarDocumentMutation = useUnstarPersonalDocument();

  const folders = React.useMemo(
    () => filterDocumentsFolders(data?.folders ?? [], search),
    [data?.folders, search]
  );

  // At the root the listing carries every document of the person (the views and the folders' counts come from it);
  // inside a folder, only that folder's. A search at the root looks in every folder (documents-tab, No results).
  const atRoot = currentFolderId === null;
  const viewCounts = React.useMemo(() => {
    const all = data?.documents ?? [];
    return {
      LOOSE: all.filter((d) => !d.folderId).length,
      ALL: all.length,
      STARRED: all.filter((d) => d.isStarred).length,
      EXPIRING: all.filter(expiring).length,
    };
  }, [data?.documents]);
  const folderFileCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    if (!atRoot) return counts;
    for (const d of data?.documents ?? []) if (d.folderId) counts.set(d.folderId, (counts.get(d.folderId) ?? 0) + 1);
    return counts;
  }, [atRoot, data?.documents]);

  // The heading of each group in All documents: the root's folders, and any deeper folder a listed file sits in.
  const folderNames = React.useMemo(() => folderNamesOf(data), [data]);

  const documents = React.useMemo(() => {
    const inView = (doc: DocumentDTO) => {
      if (!atRoot) return true;
      if (search.trim()) return true;
      if (view === "STARRED") return doc.isStarred;
      if (view === "EXPIRING") return expiring(doc);
      if (view === "ALL") return true;
      return !doc.folderId;
    };
    const filtered = filterDocumentsFiles(data?.documents ?? [], search)
      .filter(inView);
    // The Expiring view reads soonest first (documents-expiry X02), whatever the table was sorted by.
    const order: DocumentSort = atRoot && view === "EXPIRING" && !search.trim() ? { field: "expiresOn", dir: "asc" } : sort;
    return [...filtered].sort((a, b) => compareDocuments(a, b, order));
  }, [atRoot, view, data?.documents, search, sort]);

  const openFolder = React.useCallback((folder: DocumentFolderDTO) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  }, []);

  const goToBreadcrumb = React.useCallback(
    (index: number) => {
      const nextPath = breadcrumbs.slice(0, index + 1);
      const target = nextPath[nextPath.length - 1];

      setBreadcrumbs(nextPath);
      setCurrentFolderId(target.id);
    },
    [breadcrumbs]
  );

  const createFolder = React.useCallback(
    (name: string) =>
      createFolderMutation.mutateAsync({
        userId,
        name,
        parentId: currentFolderId,
      }),
    [createFolderMutation, currentFolderId, userId]
  );

  const renameFolder = React.useCallback(
    (folderId: string, name: string) =>
      updateFolderMutation.mutateAsync({ userId, folderId, name }),
    [updateFolderMutation, userId]
  );

  const deleteFolder = React.useCallback(
    (folderId: string, strategy: DocumentFolderDeleteStrategy = "MOVE_TO_PARENT") =>
      deleteFolderMutation.mutateAsync({ userId, folderId, strategy }),
    [deleteFolderMutation, userId]
  );

  /**
   * Uploads run one after another rather than in parallel: the backend writes each file to storage
   * and the row in one transaction, and a burst of ten concurrent multipart requests is a good way
   * to find that out the hard way. The first failure stops the batch and surfaces.
   */
  const uploadFiles = React.useCallback(
    async (
      files: File[],
      folderId?: string | null,
      categoryId?: string | null,
      visibility?: DocumentVisibility | null,
      expiresOn?: string | null,
    ) => {
      const target = folderId === undefined ? currentFolderId : folderId;

      for (const file of files) {
        await uploadDocumentMutation.mutateAsync({
          userId,
          file,
          folderId: target,
          categoryId: categoryId ?? null,
          visibility: visibility ?? null,
          expiresOn: expiresOn ?? null,
        });
      }
    },
    [currentFolderId, uploadDocumentMutation, userId]
  );

  const deleteDocument = React.useCallback(
    (documentId: string) =>
      deleteDocumentMutation.mutateAsync({ userId, documentId }),
    [deleteDocumentMutation, userId]
  );

  const moveDocument = React.useCallback(
    (documentId: string, folderId: string | null) =>
      moveDocumentMutation.mutateAsync({ userId, documentId, folderId }),
    [moveDocumentMutation, userId]
  );

  const renameDocument = React.useCallback(
    (documentId: string, name: string) =>
      renameDocumentMutation.mutateAsync({ userId, documentId, name }),
    [renameDocumentMutation, userId]
  );

  const toggleStar = React.useCallback(
    async (doc: DocumentDTO) => {
      if (doc.isStarred) {
        await unstarDocumentMutation.mutateAsync({ documentId: doc.id });
      } else {
        await starDocumentMutation.mutateAsync({ documentId: doc.id });
      }
    },
    [starDocumentMutation, unstarDocumentMutation]
  );

  const isEmpty = !isLoading && !error && folders.length === 0 && documents.length === 0;

  return {
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
    currentFolderId,
    parentId: data?.parentId ?? null,
    breadcrumbs,
    folders,
    documents,

    openFolder,
    goToBreadcrumb,

    createFolder,
    renameFolder,
    deleteFolder,
    uploadFiles,
    deleteDocument,
    moveDocument,
    renameDocument,
    toggleStar,

    isCreatingFolder: createFolderMutation.isPending,
    isRenamingFolder: updateFolderMutation.isPending,
    isDeletingFolder: deleteFolderMutation.isPending,
    isUploadingFile: uploadDocumentMutation.isPending,
    isDeletingDocument: deleteDocumentMutation.isPending,
    isMovingDocument: moveDocumentMutation.isPending,
    isRenamingDocument: renameDocumentMutation.isPending,

    createFolderError: createFolderMutation.error,
    renameFolderError: updateFolderMutation.error,
    deleteFolderError: deleteFolderMutation.error,
    uploadFileError: uploadDocumentMutation.error,
    deleteDocumentError: deleteDocumentMutation.error,
    moveDocumentError: moveDocumentMutation.error,
    renameDocumentError: renameDocumentMutation.error,

    resetCreateFolder: createFolderMutation.reset,
    resetRenameFolder: updateFolderMutation.reset,
    resetDeleteFolder: deleteFolderMutation.reset,
    resetUploadFile: uploadDocumentMutation.reset,
    resetDeleteDocument: deleteDocumentMutation.reset,
    resetMoveDocument: moveDocumentMutation.reset,
    resetRenameDocument: renameDocumentMutation.reset,
  };
}
