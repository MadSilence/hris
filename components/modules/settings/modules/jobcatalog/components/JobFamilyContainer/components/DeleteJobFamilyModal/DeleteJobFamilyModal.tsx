"use client";

import { FC } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
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

type JobFamily = {
  id: string;
  name: string;
  isSystem?: boolean;
};

type DeleteJobFamilyModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onConfirmAction: () => void;
  onRequestCloseAction: () => void;
  jobFamily: JobFamily | null
};

export const DeleteJobFamilyModal: FC<
  DeleteJobFamilyModalProps
> = ({
  isOpen,
  isLoading = false,
  onConfirmAction,
  onRequestCloseAction,
  jobFamily,
}) => {
  const jobFamilyName = jobFamily?.name ?? "Untitled job family";

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
            <Trash2 className="h-5 w-5"/>
            Delete job family
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. Job family{" "}
            <strong>{jobFamilyName}</strong> will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600"/>

            <div>
              <h4 className="mb-1 font-medium text-red-800">Warning</h4>

              <div className="space-y-1 text-sm text-red-700">
                <p>
                  All jobs assigned to this job family will also be deleted.
                </p>

                <p>
                  Any employee data or structures referencing these jobs may be
                  lost.
                </p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isLoading}
            onClick={onConfirmAction}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete job family
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
