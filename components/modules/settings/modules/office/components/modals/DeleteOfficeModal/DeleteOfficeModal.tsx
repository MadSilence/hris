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
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
  office: Office;
};

export const DeleteOfficeModal: React.FC<DeleteOfficeModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirmAction,
  onRequestCloseAction,
  office,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onRequestCloseAction()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Permanently delete "{office?.name ?? ""}" office?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This office will be permanently removed from the system. This action cannot be undone.
            {office?.assignedUsersCount
              ? ` ${office.assignedUsersCount} ${office.assignedUsersCount === 1 ? "person" : "people"} currently assigned to this office will lose that assignment.`
              : " Anyone currently assigned to this office will lose that assignment."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={() => !isLoading && onRequestCloseAction()}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={() => !isLoading && onConfirmAction()}>Delete</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
