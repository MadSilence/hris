"use client";

import * as React from "react";
import type { DocumentDTO, DocumentFolderDTO, DocumentVisibility } from "@/api/modules/documents/dto";
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

export type DocumentSortField = "name" | "size" | "createdAt";
export type DocumentSort = { field: DocumentSortField; dir: "asc" | "desc" };

const compareDocuments = (a: DocumentDTO, b: DocumentDTO, sort: DocumentSort) => {
  const factor = sort.dir === "asc" ? 1 : -1;

  switch (sort.field) {
    case "name":
      return a.name.localeCompare(b.name) * factor;
    case "size":
      return ((a.sizeBytes ?? 0) - (b.sizeBytes ?? 0)) * factor;
    case "createdAt":
      return a.createdAt.localeCompare(b.createdAt) * factor;
  }
};

/**
 * Everything the documents tab needs: the folder the user is currently browsing, the filtered
 * contents, and every mutation. The container renders and owns modal state only — it must not
 * instantiate these mutations a second time, or each action ends up with two cache subscriptions.
 */
export function usePersonalDocuments({ userId }: UsePersonalDocumentsParams) {
  const [search, setSearch] = React.useState("");
  const [starredOnly, setStarredOnly] = React.useState(false);
  const [hrOnly, setHrOnly] = React.useState(false);
  const [sort, setSort] = React.useState<DocumentSort>({ field: "createdAt", dir: "desc" });
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

  const documents = React.useMemo(() => {
    const filtered = filterDocumentsFiles(data?.documents ?? [], search)
      .filter((doc) => !starredOnly || doc.isStarred)
      .filter((doc) => !hrOnly || doc.visibility === "HR_ONLY");
    return [...filtered].sort((a, b) => compareDocuments(a, b, sort));
  }, [data?.documents, search, starredOnly, hrOnly, sort]);

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
    (folderId: string) => deleteFolderMutation.mutateAsync({ userId, folderId }),
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
    ) => {
      const target = folderId === undefined ? currentFolderId : folderId;

      for (const file of files) {
        await uploadDocumentMutation.mutateAsync({
          userId,
          file,
          folderId: target,
          categoryId: categoryId ?? null,
          visibility: visibility ?? null,
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
    starredOnly,
    setStarredOnly,
    hrOnly,
    setHrOnly,
    sort,
    setSort,
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
