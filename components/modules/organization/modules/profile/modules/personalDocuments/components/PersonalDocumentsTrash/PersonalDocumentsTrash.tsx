"use client";

import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowTurnBackwardIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ForbiddenError } from "@/components/clients/exceptions";
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
import { useDateFormatter } from "@/lib/date";
import { getDocumentFileIcon } from "../../utils/getDocumentFileIcon";
import {
  PurgeDocumentModal,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/PurgeDocumentModal";
import {
  PersonalDocumentsEmptyState,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/PersonalDocumentsEmptyState";
import { NodRing } from "@/components/desact/nod";
import { FormError } from "@/components/feedback/FormError";

const trashKey = (userId: string) => ["DOCUMENTS_TRASH", userId];

const messageOf = (error: unknown): string | null =>
  error instanceof Error ? error.message : null;

/**
 * Deleted documents are kept — the stored file included — until someone purges them here. That is
 * what makes "Delete" recoverable and why purging is a separate, explicit action.
 */
export const PersonalDocumentsTrash: FC<{ userId: string }> = ({ userId }) => {
  const t = useTranslations("organization");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");
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
        throw new Error(result.errorMessage || t("documents.trash.restoreFailed"));
      }
      return result;
    },
    onSuccess: refresh,
  });

  const purge = useMutation({
    mutationFn: async (documentId: string) => {
      const result = await purgeDocumentAction({ userId, documentId });
      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || t("documents.trash.purgeFailed"));
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
    return <div className="flex justify-center py-6"><NodRing size="md" /></div>;
  }

  // Every failure used to read "You don't have access to this person's deleted documents." — the
  // inverse of the usual defect: an outage or a timeout accused the reader of lacking a permission
  // they have. Only a 403 is a refusal; anything else gets the sentence its code carries.
  if (error instanceof ForbiddenError) {
    return <AccessDenied compact/>;
  }

  if (error) {
    return <ErrorState error={error} title={t("documents.trash.unavailable")} compact/>;
  }

  const rows = data ?? [];

  if (rows.length === 0) {
    return (
      <PersonalDocumentsEmptyState
        icon={<Icon icon={Delete02Icon} size="lg" />}
        title={t("documents.trash.emptyTitle")}
        description={t("documents.trash.emptyDescription")}
      />
    );
  }

  return (
    <div className="space-y-2">
      {actionError && <FormError message={actionError} />}

      <div className="divide-y divide-divider rounded-control border border-divider">
        {rows.map((document) => (
          <div key={document.id} className="flex items-center gap-3 px-4 py-3">
            <span className="shrink-0 text-tertiary [&_svg]:h-5 [&_svg]:w-5">
              {getDocumentFileIcon(document.mimeType)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium">{document.name}</p>
              <p className="text-hint text-tertiary">
                {t("documents.trash.meta", { size: formatBytes(document.sizeBytes), date: formatDisplayDate(document.createdAt) })}
              </p>
            </div>

            <Button type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={() => restore.mutate(document.id)}
            >
              <Icon icon={ArrowTurnBackwardIcon} size="sm" />
              {tCommon("actions.restore")}
            </Button>

            <Button type="button"
              variant="ghost"
              size="sm"
              className="text-tertiary hover:text-danger-text"
              disabled={isBusy}
              onClick={() => {
                purge.reset();
                setPendingPurge(document);
              }}
            >
              <Icon icon={Delete02Icon} size="sm" />
              {t("documents.trash.deleteForever")}
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
