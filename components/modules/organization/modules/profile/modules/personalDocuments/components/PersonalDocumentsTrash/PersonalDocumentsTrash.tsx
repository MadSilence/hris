"use client";

import { Checkbox } from "@/components/desact/checkbox";
import { SelectionBar } from "@/components/ui/SelectionBar";
import { cn } from "@/lib/cn";
import { batchDocumentsAction } from "@/components/modules/organization/modules/profile/modules/personalDocuments/actions/document/batchDocumentsAction";
import { FC, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowTurnBackwardIcon, Delete02Icon, Folder01Icon } from "@hugeicons/core-free-icons";
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
import { useDateFormatter } from "@/lib/date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { RowActionDestructive, RowActionsMenu } from "@/components/ui/RowActionsMenu";
import { EmptyState, NoResults } from "@/components/feedback/EmptyState";
import { DocumentName, FileTypeTile } from "@/components/modules/signing/components/DocumentPieces";
import {
  PurgeDocumentModal,
} from "@/components/modules/organization/modules/profile/modules/personalDocuments/components/modals/PurgeDocumentModal";
import { NodRing } from "@/components/desact/nod";
import { FormError } from "@/components/feedback/FormError";

const trashKey = (userId: string) => ["DOCUMENTS_TRASH", userId];

const messageOf = (error: unknown): string | null =>
  error instanceof Error ? error.message : null;

/**
 * Deleted documents are kept — the stored file included — until someone purges them here. That is
 * what makes "Delete" recoverable and why purging is a separate, explicit action.
 *
 * T10 (DT18): the trail "Documents › Trash" with the count, a hint, then a frameless table — Name (the file tile) ·
 * Was in · Moved to trash — with Restore on hover and Delete forever in ⋯ (confirmed). T11 (DT19): the empty trash
 * is the illustration, centred, with no frame.
 */
export const PersonalDocumentsTrash: FC<{
  userId: string;
  /** The toolbar's search — the trash is searched like a folder. */
  search?: string;
  /** "Documents › Trash", drawn here so the count can sit beside it. */
  trail?: React.ReactNode;
  /** Folder names by id, for "Was in". */
  folderNames?: Map<string, string>;
}> = ({ userId, search = "", trail, folderNames }) => {
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

  // Bulk selection in the trash (D2): restore or erase several at once.
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [purgeMany, setPurgeMany] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const clearPicked = useCallback(() => setPicked(new Set()), []);
  const togglePicked = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const batch = async (operation: "restore" | "purge") => {
    const ids = [...picked];
    const result = await batchDocumentsAction({ operation, ids });
    if (result.status === ActionStatus.ERROR) {
      setBatchError(result.errorMessage ?? t("documents.table.batchFailed"));
      return false;
    }
    setBatchError(null);
    clearPicked();
    refresh();
    return true;
  };

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

  const all = data ?? [];
  const query = search.trim().toLowerCase();
  const rows = query ? all.filter((r) => r.name.toLowerCase().includes(query)) : all;

  if (all.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {trail}
        <EmptyState scene="trash" title={t("documents.trash.emptyTitle")} description={t("documents.trash.emptyDescription")} />
      </div>
    );
  }

  const pickedRows = rows.filter((r) => picked.has(r.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {trail}
          <span className="text-body text-tertiary">{t("documents.folderCard.files", { count: all.length })}</span>
        </div>
        <p className="text-body text-tertiary">{t("documents.trash.hint")}</p>
      </div>
      {pickedRows.length > 0 && (
        <SelectionBar
          count={pickedRows.length}
          onClear={clearPicked}
          actions={[
            { key: "restore", label: tCommon("actions.restore"), icon: ArrowTurnBackwardIcon, onClick: () => void batch("restore") },
            { key: "purge", label: t("documents.trash.deleteForever"), icon: Delete02Icon, danger: true, onClick: () => setPurgeMany(true) },
          ]}
        />
      )}
      {actionError && <FormError message={actionError} />}
      {batchError && <FormError message={batchError} />}

      {rows.length === 0 ? (
        <NoResults title={t("documents.container.noResultsTitle", { query: search.trim() })} hint={t("documents.container.noResultsHint")} />
      ) : (
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">
              <Checkbox
                aria-label={t("documents.table.selectAll")}
                checked={rows.every((r) => picked.has(r.id)) ? true : rows.some((r) => picked.has(r.id)) ? "indeterminate" : false}
                onCheckedChange={() => setPicked(rows.every((r) => picked.has(r.id)) ? new Set() : new Set(rows.map((r) => r.id)))}
              />
            </TableHead>
            <TableHead>{tCommon("fields.name")}</TableHead>
            <TableHead className="w-48">{t("documents.trash.wasIn")}</TableHead>
            <TableHead className="w-40">{t("documents.trash.movedToTrash")}</TableHead>
            <TableHead className="w-36" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((document) => {
            const folder = document.folderId ? folderNames?.get(document.folderId) : undefined;
            return (
              <TableRow key={document.id} className={cn("group/row h-12", picked.has(document.id) && "bg-accent-subtle")}>
                <TableCell className="w-8">
                  <Checkbox
                    aria-label={t("documents.table.select", { name: document.name })}
                    checked={picked.has(document.id)}
                    onCheckedChange={() => togglePicked(document.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <FileTypeTile mimeType={document.mimeType} name={document.name} />
                    <DocumentName name={document.name} className="group-hover/row:bg-transparent group-hover/row:shadow-none" />
                  </div>
                </TableCell>
                <TableCell className="text-secondary">
                  {folder ? (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Icon icon={Folder01Icon} size="sm" className="text-tertiary" />
                      <span className="truncate">{folder}</span>
                    </span>
                  ) : (
                    <span className="text-tertiary">—</span>
                  )}
                </TableCell>
                <TableCell className="tabular-nums text-tertiary">
                  {formatDisplayDate(document.deletedAt ?? document.createdAt, { style: "medium" })}
                </TableCell>
                <TableCell className="text-right">
                  {/* Restore on hover (T10), and always to the keyboard; Delete forever in ⋯, confirmed. */}
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="opacity-0 focus-visible:opacity-100 group-hover/row:opacity-100 touch:opacity-100"
                      disabled={isBusy}
                      onClick={() => restore.mutate(document.id)}
                    >
                      {tCommon("actions.restore")}
                    </Button>
                    <RowActionsMenu label={t("documents.table.actions")}>
                      <RowActionDestructive
                        icon={<Icon icon={Delete02Icon} size="sm" />}
                        onClick={() => {
                          purge.reset();
                          setPendingPurge(document);
                        }}
                      >
                        {t("documents.trash.deleteForever")}
                      </RowActionDestructive>
                    </RowActionsMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      )}

      {/* Erasing is irreversible: a selection is confirmed like a single file. */}
      <PurgeDocumentModal
        isOpen={purgeMany}
        documentName={t("documents.moveDocument.nDocuments", { count: pickedRows.length })}
        onRequestCloseAction={() => setPurgeMany(false)}
        onConfirmAction={() => {
          void batch("purge").then((ok) => ok && setPurgeMany(false));
        }}
      />

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
