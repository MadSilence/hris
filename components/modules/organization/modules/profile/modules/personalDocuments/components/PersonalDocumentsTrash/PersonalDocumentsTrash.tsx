"use client";

import { FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { DocumentDTO } from "@/api/modules/documents/dto";
import {
  purgeDocumentAction,
  restoreDocumentAction,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/trashActions";
import {
  useInvalidateDocumentsContentQuery,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/document/useDocumentsContent";
import { formatBytes } from "../../utils/formatBytes";
import { formatDisplayDate } from "@/lib/date";
import { getDocumentFileIcon } from "../../utils/getDocumentFileIcon";
import {
  PurgeDocumentModal,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/PurgeDocumentModal";
import {
  PersonalDocumentsEmptyState,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/PersonalDocumentsEmptyState";

const trashKey = (userId: string) => ["DOCUMENTS_TRASH", userId];

const messageOf = (error: unknown): string | null =>
  error instanceof Error ? error.message : null;

/**
 * Deleted documents are kept — the stored file included — until someone purges them here. That is
 * what makes "Delete" recoverable and why purging is a separate, explicit action.
 */
export const PersonalDocumentsTrash: FC<{ userId: string }> = ({ userId }) => {
  const { internalApiClient } = useAppDataContext();
  const queryClient = useQueryClient();
  const invalidateDocuments = useInvalidateDocumentsContentQuery();

  const { data, isLoading, error } = useQuery<DocumentDTO[]>({
    queryKey: trashKey(userId),
    queryFn: () => internalApiClient.get<DocumentDTO[]>(`/documents/users/${userId}/trash`),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: trashKey(userId) });
    invalidateDocuments(userId);
  };

  const restore = useMutation({
    mutationFn: async (documentId: string) => {
      const result = await restoreDocumentAction({ userId, documentId });
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to restore");
      }
      return result;
    },
    onSuccess: refresh,
  });

  const purge = useMutation({
    mutationFn: async (documentId: string) => {
      const result = await purgeDocumentAction({ userId, documentId });
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to delete permanently");
      }
      return result;
    },
    onSuccess: refresh,
  });

  // Purging is irreversible, so it is confirmed — and its failure belongs in the dialog that asked,
  // not in a line above a list the reader has already left.
  const [pendingPurge, setPendingPurge] = useState<DocumentDTO | null>(null);

  const actionError = messageOf(restore.error);
  const isBusy = restore.isPending || purge.isPending;

  if (isLoading) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-white p-10 text-center">
        <h3 className="text-lg font-medium">Trash unavailable</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You don&apos;t have access to this person&apos;s deleted documents.
        </p>
      </div>
    );
  }

  const rows = data ?? [];

  if (rows.length === 0) {
    return (
      <PersonalDocumentsEmptyState
        icon={<Trash2 className="h-6 w-6"/>}
        title="Nothing in the trash"
        description="Deleted documents wait here until they are restored or permanently removed."
      />
    );
  }

  return (
    <div className="space-y-2">
      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      <div className="divide-y divide-brown-100 rounded-lg border border-brown-200">
        {rows.map((document) => (
          <div key={document.id} className="flex items-center gap-3 px-4 py-3">
            <span className="shrink-0 text-muted-foreground [&_svg]:h-5 [&_svg]:w-5">
              {getDocumentFileIcon(document.mimeType)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{document.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(document.sizeBytes)} · uploaded {formatDisplayDate(document.createdAt)}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={() => restore.mutate(document.id)}
            >
              <RotateCcw className="mr-2 h-4 w-4"/>
              Restore
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              disabled={isBusy}
              onClick={() => {
                purge.reset();
                setPendingPurge(document);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4"/>
              Delete forever
            </Button>
          </div>
        ))}
      </div>

      <PurgeDocumentModal
        isOpen={pendingPurge !== null}
        isLoading={purge.isPending}
        documentName={pendingPurge?.name}
        errorMessage={messageOf(purge.error)}
        onRequestCloseAction={() => {
          purge.reset();
          setPendingPurge(null);
        }}
        onConfirmAction={() => {
          if (!pendingPurge) return;
          purge.mutate(pendingPurge.id, { onSuccess: () => setPendingPurge(null) });
        }}
      />
    </div>
  );
};
