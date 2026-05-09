"use client";

import * as React from "react";
import { FC, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/public/desact/src/components/ui/alert-dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage, } from "@/public/desact/src/components/ui/avatar";
import { Separator } from "@/public/desact/src/components/ui/separator";
import { AlertTriangle, ImagePlus, Trash2, UploadCloud, UserRoundX, X, } from "lucide-react";

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
  onConfirmAction: (submission: UpdateUserAvatarSubmission) => void | Promise<void>;
  onRequestCloseAction: () => void;
};

export const UpdateUserAvatarModal: FC<UpdateUserAvatarModalProps> = ({
  isOpen,
  isLoading = false,
  fullName,
  avatarUrl,
  onConfirmAction,
  onRequestCloseAction,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const hasCurrentAvatar = Boolean(avatarUrl);
  const canSave = Boolean(selectedFile);

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
    if (isLoading || !selectedFile) return;

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
              <DialogTitle>Profile picture</DialogTitle>
              <DialogDescription>
                Upload a new avatar or remove the current profile picture.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-7 px-8 py-7">
            <div className="flex min-h-40 items-center gap-7">
              <Avatar key={avatarKey} className="size-32 shrink-0 border shadow-sm">
                {displayedAvatarUrl ? (
                  <AvatarImage src={displayedAvatarUrl} alt={fullName}/>
                ) : null}
                <AvatarFallback className="text-3xl">
                  {initialsOf(fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium">
                    {selectedFile ? "New avatar" : "Current avatar"}
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Recommended: square image, at least 400×400px. PNG, JPG or WEBP works best.
                  </p>
                </div>

                <div className="min-h-[68px]">
                  {selectedFile ? (
                    <div className="rounded-xl border bg-muted/30 px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {shortenFileName(selectedFile.name)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={isLoading}
                          onClick={handleClearSelection}
                          aria-label="Clear selected image"
                        >
                          <X className="size-4"/>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[68px]" aria-hidden="true"/>
                  )}
                </div>
              </div>
            </div>

            <Separator/>

            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => inputRef.current?.click()}
                className="h-auto items-center justify-start gap-4 rounded-2xl px-5 py-5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
                  {hasCurrentAvatar ? (
                    <ImagePlus className="size-5"/>
                  ) : (
                    <UploadCloud className="size-5"/>
                  )}
                </span>

                <span className="min-w-0 text-left">
                  <span className="block text-sm font-medium">
                    {hasCurrentAvatar ? "Replace photo" : "Upload photo"}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Choose an image from your device.
                  </span>
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isLoading || !hasCurrentAvatar}
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="h-auto items-center justify-start gap-4 rounded-2xl px-5 py-5 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                  <Trash2 className="size-5"/>
                </span>

                <span className="min-w-0 text-left">
                  <span className="block text-sm font-medium">Remove photo</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Use initials instead of an avatar.
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
                variant="outline"
                disabled={isLoading}
                onClick={requestClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isLoading || !canSave}
                onClick={handleUploadConfirm}
              >
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteUserAvatarModal
        isOpen={isDeleteConfirmOpen}
        isLoading={isLoading}
        fullName={fullName}
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
  onRequestCloseAction: () => void;
  onConfirmAction: () => void | Promise<void>;
};

const DeleteUserAvatarModal: FC<DeleteUserAvatarModalProps> = ({
  isOpen,
  isLoading = false,
  fullName,
  onRequestCloseAction,
  onConfirmAction,
}) => {
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
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <UserRoundX className="h-5 w-5"/>
            Remove avatar
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action will remove the profile picture for{" "}
            <strong>{fullName ?? "this user"}</strong>. The profile will use
            initials instead.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600"/>
            <div>
              <h4 className="mb-1 font-medium text-red-800">Warning</h4>
              <p className="text-sm text-red-700">
                The current avatar will be permanently removed.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={onConfirmAction}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Remove avatar
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

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
