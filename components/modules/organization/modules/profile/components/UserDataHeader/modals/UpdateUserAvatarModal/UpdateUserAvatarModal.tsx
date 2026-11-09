"use client";


import * as React from "react";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";
import { FC, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/desact/alert-dialog";
import { Button } from "@/components/desact/button";
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/desact/avatar";
import { Separator } from "@/components/desact/separator";
import { Alert02Icon, Cancel01Icon, CloudUploadIcon, Delete02Icon, ImageAdd01Icon, UserBlock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

export type UpdateUserAvatarSubmission =
  | {
  action: "upload";
  file: File;
}
  | {
  action: "remove";
};

type UpdateUserAvatarModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  fullName: string;
  avatarUrl?: string | null;
  /** A refused or failed avatar change, shown where the reader asked for it. */
  errorMessage?: string | null;
  onConfirmAction: (submission: UpdateUserAvatarSubmission) => void | Promise<void>;
  onRequestCloseAction: () => void;
};

export const UpdateUserAvatarModal: FC<UpdateUserAvatarModalProps> = ({
  isOpen,
  isLoading = false,
  fullName,
  avatarUrl,
  errorMessage,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [tried, setTried] = useState(false);

  const hasCurrentAvatar = Boolean(avatarUrl);

  useEffect(() => {
    return () => {
      revokePreviewUrl();
    };
  }, []);

  const revokePreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const resetState = () => {
    revokePreviewUrl();
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDeleteConfirmOpen(false);
    setTried(false);
    resetInput();
  };

  const requestClose = () => {
    if (isLoading) return;

    resetState();
    onRequestCloseAction();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    revokePreviewUrl();

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;

    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);

    event.target.value = "";
  };

  const handleClearSelection = () => {
    resetState();
  };

  const handleUploadConfirm = async () => {
    if (isLoading) return;
    setTried(true);
    if (!selectedFile) return;

    await onConfirmAction({
      action: "upload",
      file: selectedFile,
    });
  };

  const handleDeleteConfirm = async () => {
    if (isLoading) return;

    await onConfirmAction({
      action: "remove",
    });
  };

  const displayedAvatarUrl = previewUrl ?? avatarUrl ?? null;
  const avatarKey = displayedAvatarUrl ?? "avatar-fallback";

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <DialogContent hideClose className="overflow-hidden p-0 sm:max-w-2xl">
          <div className="px-8 pt-8">
            <DialogHeader>
              <DialogTitle>{t("profile.avatar.title")}</DialogTitle>
              <DialogDescription>
                {t("profile.avatar.description")}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-7 px-8 py-7">
            <div className="flex min-h-40 items-center gap-7">
              <Avatar key={avatarKey} className="size-32 shrink-0 border shadow-card">
                {displayedAvatarUrl ? (
                  <AvatarImage src={displayedAvatarUrl} alt={fullName}/>
                ) : null}
                <AvatarFallback className="text-page-title">
                  {initialsOf(fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-body font-medium">
                    {selectedFile ? t("profile.avatar.new") : t("profile.avatar.current")}
                  </p>
                  <p className="mt-2 max-w-md text-body leading-6 text-tertiary">
                    {t("profile.avatar.recommendation")}
                  </p>
                </div>

                <div className="min-h-[68px]">
                  {selectedFile ? (
                    <div className="rounded-card border bg-mist/30 px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-body font-medium">
                            {shortenFileName(selectedFile.name)}
                          </p>
                          <p className="text-hint text-tertiary">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isLoading}
                          onClick={handleClearSelection}
                          aria-label={t("profile.avatar.clearSelection")}
                        >
                          <Icon icon={Cancel01Icon} size="sm" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[68px]">
                      <FieldError>{tried ? t("profile.avatar.pickFile") : null}</FieldError>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator/>

            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isLoading}
                onClick={() => inputRef.current?.click()}
                className="h-auto items-center justify-start gap-4 rounded-card px-5 py-5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-card bg-mist">
                  {hasCurrentAvatar ? (
                    <Icon icon={ImageAdd01Icon} />
                  ) : (
                    <Icon icon={CloudUploadIcon} />
                  )}
                </span>

                <span className="min-w-0 text-left">
                  <span className="block text-body font-medium">
                    {hasCurrentAvatar ? t("profile.avatar.replace") : t("profile.avatar.upload")}
                  </span>
                  <span className="mt-1 block text-hint text-tertiary">
                    {t("profile.avatar.uploadHint")}
                  </span>
                </span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isLoading || !hasCurrentAvatar}
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="h-auto items-center justify-start gap-4 rounded-card px-5 py-5 text-danger-text hover:bg-status-declined-bg hover:text-status-declined-text"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-card bg-status-declined-bg">
                  <Icon icon={Delete02Icon} />
                </span>

                <span className="min-w-0 text-left">
                  <span className="block text-body font-medium">{t("profile.avatar.remove")}</span>
                  <span className="mt-1 block text-hint text-tertiary">
                    {t("profile.avatar.removeHint")}
                  </span>
                </span>
              </Button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="px-8 py-5">
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                disabled={isLoading}
                onClick={requestClose}
              >
                {tCommon("actions.cancel")}
              </Button>
              <Button
                type="button"
                disabled={isLoading} loading={isLoading} loadingLabel={tCommon("actions.saving")}
                onClick={handleUploadConfirm}
              >
                {tCommon("actions.saveChanges")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteUserAvatarModal
        isOpen={isDeleteConfirmOpen}
        isLoading={isLoading}
        fullName={fullName}
        errorMessage={errorMessage}
        onRequestCloseAction={() => setIsDeleteConfirmOpen(false)}
        onConfirmAction={handleDeleteConfirm}
      />
    </>
  );
};

type DeleteUserAvatarModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  fullName?: string;
  /** Kept in the dialog rather than the console — a failed delete is otherwise silent. */
  errorMessage?: string | null;
  onRequestCloseAction: () => void;
  onConfirmAction: () => void | Promise<void>;
};

const DeleteUserAvatarModal: FC<DeleteUserAvatarModalProps> = ({
  isOpen,
  isLoading = false,
  fullName,
  errorMessage,
  onRequestCloseAction,
  onConfirmAction,
}) => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          onRequestCloseAction();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon icon={UserBlock01Icon} />
            {t("profile.avatar.removeTitle")}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {t.rich("profile.avatar.removeDescription", {
              name: fullName ?? t("profile.avatar.thisUser"),
              b: (chunks) => <strong>{chunks}</strong>,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-card border border-divider bg-mist p-4">
          <div className="flex items-start gap-3">
            <Icon icon={Alert02Icon} className="mt-0.5 text-secondary" />
            <div>
              <h4 className="mb-1 font-medium text-primary">{t("profile.avatar.warning")}</h4>
              <p className="text-body text-secondary">
                {t("profile.avatar.warningText")}
              </p>
            </div>
          </div>
        </div>

        <FormError message={errorMessage} />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{tCommon("actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            // AlertDialogAction closes its dialog on click by default, which threw the failure away
            // before it could render — the third place this pattern has cost a visible error.
            onClick={(event) => {
              event.preventDefault();
              void onConfirmAction();
            }}
            destructive
          >
            {t("profile.avatar.removeTitle")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

function initialsOf(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return initials || "?";
}

function shortenFileName(fileName: string, maxLength = 24) {
  if (fileName.length <= maxLength) {
    return fileName;
  }

  const lastDotIndex = fileName.lastIndexOf(".");
  const extension = lastDotIndex > 0 ? fileName.slice(lastDotIndex) : "";
  const nameWithoutExtension =
    lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName;

  const start = nameWithoutExtension.slice(0, 11);
  const end = nameWithoutExtension.slice(-5);

  return `${start}.....${end}${extension}`;
}

/**
 * The size of the chosen avatar. Deliberately NOT `lib/formatBytes`: that one would show "347 B", while
 * here the floor is "1 KB", so the caption under the preview does not jump between units.
 */
function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
