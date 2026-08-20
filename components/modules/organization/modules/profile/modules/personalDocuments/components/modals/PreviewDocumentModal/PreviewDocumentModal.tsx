"use client";

import { FC, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import type { DocumentDTO } from "@/api/modules/documents/dto";

export interface PreviewDocumentModalProps {
  isOpen: boolean;
  document: DocumentDTO | null;
  getDownloadUrl: (documentId: string) => string;
  onCloseAction: () => void;
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
  onCloseAction,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !document) return;

    let cancelled = false;
    let created: string | null = null;

    setIsLoading(true);
    setError(null);

    fetch(getDownloadUrl(document.id))
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setObjectUrl(created);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load the document.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      setObjectUrl(null);
      if (created) URL.revokeObjectURL(created);
    };
  }, [isOpen, document, getDownloadUrl]);

  const isImage = document?.mimeType?.startsWith("image/") ?? false;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="truncate">{document?.name ?? "Preview"}</DialogTitle>
          <DialogDescription>
            {document?.categoryName ? `${document.categoryName} · ` : ""}
            Read-only preview.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[24rem] items-center justify-center overflow-hidden rounded-lg border border-brown-200 bg-brown-50">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

          {!isLoading && error && (
            <div className="space-y-3 p-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              {document && (
                <Button variant="outline" size="sm" asChild>
                  <a href={getDownloadUrl(document.id)} download>Download instead</a>
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
            ) : (
              <iframe src={objectUrl} title={document.name} className="h-[70vh] w-full"/>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
