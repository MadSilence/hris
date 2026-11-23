"use client";

import { FC, type ReactNode, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CancelCircleIcon, Delete02Icon, Download01Icon, Folder01Icon, HourglassIcon, StarIcon, Tag01Icon, ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { InlineRename, isEditingInline } from "@/components/ui/InlineRename";
import { PdfViewer } from "@/components/ui/PdfViewer";
import { cn } from "@/lib/cn";
import { useDateFormatter } from "@/lib/date";
import { FileTypeTile } from "@/components/modules/signing/components/DocumentPieces";
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
  /** Beside Download, left of it — Cancel signing while the document is out for signature (S07). */
  footerAction?: ReactNode;
  /** "Visible to Reza" / "Hidden from Reza" in the meta line (DT16); without it, "Visible" / "Hidden". */
  personFirstName?: string | null;
  /** "In the Identity folder" (X06); without it the meta line starts with the category. */
  folderName?: string | null;
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
  footerAction,
  personFirstName,
  folderName,
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

  /*
   * The meta line (V2-Preview, X06; DT16, X7): 12/16 grey, each part with its icon — the folder or the category, who
   * can see it, the day it was uploaded. The expiry is not in it any more: it has its own strip under the header.
   */
  const metaOf = (d: DocumentDTO): ReactNode => {
    const hidden = d.visibility === "HR_ONLY";
    const visibility = personFirstName
      ? hidden ? t("documents.table.hiddenFrom", { name: personFirstName }) : t("documents.table.visibleTo", { name: personFirstName })
      : hidden ? t("documents.table.hidden") : t("documents.table.visible");
    const parts: { key: string; icon?: typeof ViewIcon; text: string }[] = [];
    if (folderName) parts.push({ key: "folder", icon: Folder01Icon, text: t("documents.preview.inFolder", { folder: folderName }) });
    else if (d.categoryName) parts.push({ key: "category", icon: Tag01Icon, text: d.categoryName });
    if (showVisibility) parts.push({ key: "visibility", icon: hidden ? ViewOffSlashIcon : ViewIcon, text: visibility });
    if (!folderName) parts.push({ key: "date", text: formatDate(d.createdAt, { style: "medium" }) });
    return (
      <span className="flex flex-wrap items-center gap-x-1.5 text-hint text-secondary">
        {parts.map((p, i) => (
          <span key={p.key} className="inline-flex items-center gap-1">
            {i > 0 && <span aria-hidden className="mr-0.5 text-tertiary">·</span>}
            {p.icon && <Icon icon={p.icon} size="sm" className="size-3.5 text-tertiary" />}
            {p.text}
          </span>
        ))}
      </span>
    );
  };
  const expiry = document?.expiresOn && (document.expiryState === "EXPIRING" || document.expiryState === "EXPIRED")
    ? { expired: document.expiryState === "EXPIRED", date: formatDate(document.expiresOn, { style: "medium" }) }
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent size="lg" className={cn(aside ? "sm:max-w-[1240px]" : "sm:max-w-[960px]")} onEscapeKeyDown={(e) => { if (isEditingInline()) e.preventDefault(); }}>
        {/* V2-Preview: the file's tile, its name (renamed in place, T26), the star, and the meta line. */}
        <DialogHeader>
          <div className="flex min-w-0 items-center gap-2 pr-8">
            {document && <FileTypeTile mimeType={document.mimeType} name={document.name} />}
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
          <DialogDescription asChild>
            <div>{document ? metaOf(document) : t("documents.preview.readOnly")}</div>
          </DialogDescription>
        </DialogHeader>

        {/* X06 (X7): the expiry as its own strip — amber while it is soon, red once it is past. */}
        {expiry && (
          <div
            className={cn(
              "flex h-10 items-center gap-2 rounded-popover px-3 text-body font-medium",
              expiry.expired ? "bg-status-declined-bg text-status-declined-text" : "bg-status-pending-bg text-status-pending-text",
            )}
          >
            <Icon icon={expiry.expired ? CancelCircleIcon : HourglassIcon} size="sm" />
            {expiry.expired ? t("documents.preview.expired", { date: expiry.date }) : t("documents.preview.expires", { date: expiry.date })}
          </div>
        )}

        <div className={cn("flex gap-4", aside ? "flex-col lg:flex-row" : "flex-col")}>
        <div className="flex min-h-[24rem] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-card bg-subtle">
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
        {/* S5: with the signing panel the preview is 1240 wide, the panel 340 on the right. */}
        {aside && <aside className="w-full shrink-0 lg:w-[340px]">{aside}</aside>}
        </div>

        {document && (
          <DialogFooter className="sm:justify-between">
            {onTrashAction ? (
              <Button type="button" variant="destructive" onClick={onTrashAction}>
                <Icon icon={Delete02Icon} size="sm" />
                {t("documents.table.moveToTrash")}
              </Button>
            ) : <span />}
            <div className="flex items-center gap-2">
              {footerAction}
              <Button type="button" variant="secondary" asChild>
                <a href={getDownloadUrl(document.id)} download>
                  <Icon icon={Download01Icon} size="sm" />
                  {tCommon("actions.download")}
                </a>
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
