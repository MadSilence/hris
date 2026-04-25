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
import { LegalEntity } from "@/models/legalEntity";

type DeleteLegalEntityModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onRequestClose: () => void;
  entity: LegalEntity;
};

export const DeleteLegalEntityModal: React.FC<DeleteLegalEntityModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onRequestClose,
  entity,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Permanently delete "{entity?.name ?? ""}" legal entity?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This legal entity will be permanently removed from the system. This action cannot be undone.
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
