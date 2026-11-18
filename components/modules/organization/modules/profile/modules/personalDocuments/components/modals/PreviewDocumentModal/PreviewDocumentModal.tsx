"use client";

import { FC, type ReactNode, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Delete02Icon, Download01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { InlineRename, isEditingInline } from "@/components/ui/InlineRename";
import { PdfViewer } from "@/components/ui/PdfViewer";
import { cn } from "@/lib/cn";
import { useDateFormatter } from "@/lib/date";
import { getDocumentFileIcon } from "../../../utils/getDocumentFileIcon";
import { Button } from "@/components/desact/button";
import type { DocumentDTO } from "@/api/modules/documents/dto";
import { messageForError } from "@/lib/errors/errorMessages";
import { NodRing } from "@/components/desact/nod";
import { FormError } from "@/components/feedback/FormError";

export interface PreviewDocumentModalProps {
  isOpen: boolean;
  document: DocumentDTO | null;
  getDownloadUrl: (documentId: string) => string;
  /** Reads the bytes through the shared client; see documentService.fetchPersonalDocument. */
  fetchDocument: (documentId: string) => Promise<Blob>;
  onCloseAction: () => void;
  /** T26: the name renames in place; resolves true once saved. Absent (no right to rename, or out for signature), it is text. */
  onRenameAction?: (name: string) => Promise<boolean>;
  onToggleStarAction?: () => void;
  /** Move to trash, on the left of the footer, apart (V2-Preview). */
  onTrashAction?: () => void;
  /** Who can see — left out of the meta line on the person's own tab (T18). */
  showVisibility?: boolean;
  /** The right column beside the document — the signing panel while it has one (documents-send-for-signature S07). */
  aside?: ReactNode;
}

/**
 * Fetches the bytes and renders them from an object URL rather than pointing an iframe at the
 * download route: that route answers with `Content-Disposition: attachment`, which makes a framed
 * PDF download instead of display.
 */
export const PreviewDocumentModal: FC<PreviewDocumentModalProps> = ({
  isOpen,
  document,
  getDownloadUrl,
  fetchDocument,
  onCloseAction,
  onRenameAction,
  onToggleStarAction,
  onTrashAction,
  showVisibility = true,
  aside,
}) => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const formatDate = useDateFormatter();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !document) return;

    let cancelled = false;
    let created: string | null = null;

    setIsLoading(true);
    setError(null);

    fetchDocument(document.id)
      .then((blob) => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setObjectUrl(created);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // The dictionary, by code — the raw fetch could only ever produce "Failed to load (403)".
        setError(messageForError(e));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      setObjectUrl(null);
      if (created) URL.revokeObjectURL(created);
    };
    // Keyed by the id: a rename hands in a new object for the same file, which needs no second fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, document?.id, fetchDocument]);

  const isImage = document?.mimeType?.startsWith("image/") ?? false;

  // The meta line (V2-Preview; documents-expiry X06 adds the date): category · who can see.
  const metaOf = (d: DocumentDTO) => {
    const visibility = d.visibility === "HR_ONLY" ? t("documents.table.hidden") : t("documents.table.visible");
    const until = d.expiresOn ? t("documents.preview.validUntil", { date: formatDate(d.expiresOn, { style: "medium" }) }) : null;
    const parts = [d.categoryName, showVisibility ? visibility : null, until].filter(Boolean) as string[];
    return parts.length ? parts.join(" · ") : t("documents.preview.readOnly");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent size="lg" className="sm:max-w-[960px]" onEscapeKeyDown={(e) => { if (isEditingInline()) e.preventDefault(); }}>
        {/* V2-Preview: the file's tile, its name (renamed in place, T26), the star, and the meta line. */}
        <DialogHeader>
          <div className="flex min-w-0 items-center gap-2 pr-8">
            {document && (
              <span className="shrink-0 text-tertiary [&_svg]:h-5 [&_svg]:w-5">{getDocumentFileIcon(document.mimeType)}</span>
            )}
            <DialogTitle className="flex min-w-0 items-center gap-1">
              {document ? <InlineRename name={document.name} onRename={onRenameAction} /> : tCommon("actions.preview")}
            </DialogTitle>
            {document && onToggleStarAction && (
              <button
                type="button"
                onClick={onToggleStarAction}
                aria-pressed={document.isStarred}
                aria-label={document.isStarred ? t("documents.table.unstar") : t("documents.table.star")}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-control hover:bg-mist"
              >
                <Icon icon={StarIcon} size="sm" className={cn(document.isStarred ? "fill-current text-status-pending-icon" : "text-tertiary")} />
              </button>
            )}
          </div>
          <DialogDescription>
            {document ? metaOf(document) : t("documents.preview.readOnly")}
          </DialogDescription>
        </DialogHeader>

        <div className={cn("flex gap-4", aside ? "flex-col lg:flex-row" : "flex-col")}>
        <div className="flex min-h-[24rem] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-control border border-divider bg-subtle">
          {isLoading && <NodRing size="md" />}

          {!isLoading && error && (
            <div className="space-y-3 p-6 text-center">
              <FormError message={error} />
              {document && (
                <Button variant="secondary" size="sm" asChild>
                  <a href={getDownloadUrl(document.id)} download>{t("documents.preview.downloadInstead")}</a>
                </Button>
              )}
            </div>
          )}

          {!isLoading && !error && objectUrl && document && (
            isImage ? (
              /* A blob URL for a user-uploaded file of unknown dimensions — next/image cannot
                 optimise it and would need a remote pattern it will never match. */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={objectUrl}
                alt={document.name}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            ) : document.mimeType === "application/pdf" ? (
              // A2 (2026-11-18): our own viewer — the same in every browser, and readable on a phone.
              <PdfViewer src={objectUrl} title={document.name} className="h-[70vh] w-full" />
            ) : (
              <iframe src={objectUrl} title={document.name} className="h-[70vh] w-full"/>
            )
          )}
        </div>
        {aside && <aside className="w-full shrink-0 lg:w-80">{aside}</aside>}
        </div>

        {document && (
          <DialogFooter className="sm:justify-between">
            {onTrashAction ? (
              <Button type="button" variant="ghost" onClick={onTrashAction}>
                <Icon icon={Delete02Icon} size="sm" />
                {t("documents.table.moveToTrash")}
              </Button>
            ) : <span />}
            <Button type="button" variant="secondary" asChild>
              <a href={getDownloadUrl(document.id)} download>
                <Icon icon={Download01Icon} size="sm" />
                {tCommon("actions.download")}
              </a>
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
