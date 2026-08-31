"use client";

import { useQuery } from "@tanstack/react-query";

import { useAppDataContext } from "@/components/providers/AppDataProvider";
import type { DocumentFolderDeleteImpactDTO } from "@/api/modules/documents/dto";

export const documentsFolderDeleteImpactKey = (userId: string, folderId: string) => [
  "DOCUMENTS_FOLDER_DELETE_IMPACT",
  userId,
  folderId,
];

/**
 * What deleting this folder would touch, asked at the moment of asking.
 *
 * Enabled only while a folder is actually up for deletion — the counts belong to the dialog, and a
 * number that travelled with the listing is a number that has had time to go stale.
 */
export const useDocumentsFolderDeleteImpact = (userId: string, folderId: string | null) => {
  const { internalApiClient } = useAppDataContext();

  return useQuery<DocumentFolderDeleteImpactDTO>({
    queryKey: documentsFolderDeleteImpactKey(userId, folderId ?? "none"),
    enabled: Boolean(folderId),
    queryFn: () =>
      internalApiClient.get<DocumentFolderDeleteImpactDTO>(
        `/documents/users/${userId}/folders/${folderId}/delete-impact`
      ),
  });
};
