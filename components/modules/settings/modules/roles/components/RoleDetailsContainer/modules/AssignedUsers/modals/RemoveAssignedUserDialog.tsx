"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/public/desact/src/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

export default function RemoveAssignedUserDialog({
  trigger,
  userLabel,
  onConfirm,
}: {
  trigger: React.ReactNode;
  userLabel: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5"/>
            Move user to Always exclude
          </AlertDialogTitle>

          <AlertDialogDescription>
            This will move <strong>{userLabel}</strong> to <strong>Always exclude</strong>.
            You can change it later in Manage Rules.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5"/>
            <div>
              <h4 className="font-medium text-red-800 mb-1">Warning</h4>
              <p className="text-sm text-red-700">
                The user will no longer be assigned to this role unless included again.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>
            Move to exclude
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
