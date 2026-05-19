"use client";

import React from "react";
import { Button } from "@/public/desact/src/components/ui/button";
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
import { Office } from "@/models/office";

type DeleteOfficeModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  office: Office;
};

export const DeleteOfficeModal: React.FC<DeleteOfficeModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onRequestClose,
  office,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Permanently delete "{office?.name ?? ""}" office?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This office will be permanently removed from the system. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={() => !isLoading && onRequestClose()}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={() => !isLoading && onConfirm()}>Delete</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
