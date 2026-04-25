"use client";

import * as React from "react";
import { FC } from "react";
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
import { AlertTriangle, FolderX } from "lucide-react";

export interface DeleteDocumentsFolderModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  folderName?: string;
  documentsCount?: number;
  onRequestClose: () => void;
  onConfirm: () => void;
}

export const DeleteDocumentsFolderModal: FC<DeleteDocumentsFolderModalProps> = ({
  isOpen,
  isLoading = false,
  folderName,
  documentsCount = 0,
  onRequestClose,
  onConfirm,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onRequestClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <FolderX className="w-5 h-5"/>
            Delete folder
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Folder <strong>{folderName ?? "Untitled folder"}</strong> will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5"/>
            <div>
              <h4 className="font-medium text-red-800 mb-1">Warning</h4>
              <p className="text-sm text-red-700">
                {documentsCount > 0
                  ? `All ${documentsCount} document(s) inside this folder may also be affected. Make sure they are moved before deletion.`
                  : "This folder will be removed from the user documents list."}
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete folder
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
