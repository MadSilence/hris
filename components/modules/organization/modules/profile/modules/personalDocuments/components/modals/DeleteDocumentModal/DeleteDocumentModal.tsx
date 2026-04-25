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
import { AlertTriangle, FileX2 } from "lucide-react";

export interface DeleteDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  documentName?: string;
  onRequestClose: () => void;
  onConfirm: () => void;
}

export const DeleteDocumentModal: FC<DeleteDocumentModalProps> = ({
  isOpen,
  isLoading = false,
  documentName,
  onRequestClose,
  onConfirm,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onRequestClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <FileX2 className="w-5 h-5"/>
            Delete document
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Document <strong>{documentName ?? "Untitled document"}</strong> will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5"/>
            <div>
              <h4 className="font-medium text-red-800 mb-1">Warning</h4>
              <p className="text-sm text-red-700">
                Deleted files cannot be restored unless your backend supports recovery.
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
            Delete document
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
