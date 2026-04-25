"use client";

import * as React from "react";
import { useDocumentsContent } from "../useDocumentsContent/useDocumentsContent";
import { useUploadPersonalDocument } from "../useUploadPersonalDocument/useUploadPersonalDocument";
import { useDeletePersonalDocument } from "../useDeletePersonalDocument/useDeletePersonalDocument";
import { useStarPersonalDocument } from "../useStarPersonalDocument/useStarPersonalDocument";
import { useUnstarPersonalDocument } from "../useUnstarPersonalDocument/useUnstarPersonalDocument";
import { BreadcrumbItem, DocumentDTO, DocumentFolderDTO } from "@/app/(app)/organization/people/[id]/(tabs)/documents/documents.types";
import {
  useCreateDocumentsFolder
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/documentsFolder/useCreateDocumentsFolder";
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

export function usePersonalDocuments({ userId }: UsePersonalDocumentsParams) {
  const [search, setSearch] = React.useState("");
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([
    { id: null, name: "Documents" },
  ]);

  const { data, isLoading } = useDocumentsContent({
    userId,
    folderId: currentFolderId,
  });

  const createFolderMutation = useCreateDocumentsFolder();
  const uploadDocumentMutation = useUploadPersonalDocument();
  const deleteFolderMutation = useDeleteDocumentsFolder();
  const deleteDocumentMutation = useDeletePersonalDocument();
  const starDocumentMutation = useStarPersonalDocument();
  const unstarDocumentMutation = useUnstarPersonalDocument();

  const folders = React.useMemo(
    () => filterDocumentsFolders(data?.folders ?? [], search),
    [data?.folders, search]
  );

  const documents = React.useMemo(
    () => filterDocumentsFiles(data?.documents ?? [], search),
    [data?.documents, search]
  );

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
    async (name: string) => {
      await createFolderMutation.mutateAsync({
        userId,
        name,
        parentId: currentFolderId,
      });
    },
    [createFolderMutation, currentFolderId, userId]
  );

  const uploadFile = React.useCallback(
    async (file: File) => {
      await uploadDocumentMutation.mutateAsync({
        userId,
        file,
        folderId: currentFolderId,
      });
    },
    [currentFolderId, uploadDocumentMutation, userId]
  );

  const toggleStar = React.useCallback(
    async (doc: DocumentDTO) => {
      if (doc.isStarred) {
        await unstarDocumentMutation.mutateAsync({
          documentId: doc.id,
        });
      } else {
        await starDocumentMutation.mutateAsync({
          documentId: doc.id,
        });
      }
    },
    [starDocumentMutation, unstarDocumentMutation]
  );

  const deleteDocument = React.useCallback(
    async (documentId: string) => {
      await deleteDocumentMutation.mutateAsync({
        userId,
        documentId,
      });
    },
    [deleteDocumentMutation]
  );

  const deleteFolder = React.useCallback(
    async (folderId: string) => {
      await deleteFolderMutation.mutateAsync({
        userId,
        folderId,
      });
    },
    [deleteFolderMutation, userId]
  );

  const isEmpty = !isLoading && folders.length === 0 && documents.length === 0;

  return {
    search,
    setSearch,
    isLoading,
    isEmpty,
    currentFolderId,
    parentId: data?.parentId ?? null,
    breadcrumbs,
    folders,
    documents,
    openFolder,
    goToBreadcrumb,
    createFolder,
    uploadFile,
    toggleStar,
    deleteDocument,
    deleteFolder,
    isCreatingFolder: createFolderMutation.isPending,
    isUploadingFile: uploadDocumentMutation.isPending,
    isDeletingFolder: deleteFolderMutation.isPending,
    isDeletingDocument: deleteDocumentMutation.isPending,
  };
}
