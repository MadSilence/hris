"use client";

import * as React from "react";
import { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Label } from "@/public/desact/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";
import { FolderInput } from "lucide-react";

export type MoveDocumentFolderOption = {
  id: string;
  name: string;
};

export interface MoveDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  documentName?: string;
  folders: MoveDocumentFolderOption[];
  currentFolderId?: string;
  onRequestClose: () => void;
  onSubmit: (values: { folderId?: string }) => void;
}

export const MoveDocumentModal: FC<MoveDocumentModalProps> = ({
  isOpen,
  isLoading = false,
  documentName,
  folders,
  currentFolderId,
  onRequestClose,
  onSubmit,
}) => {
  const [folderId, setFolderId] = useState<string>("root");

  useEffect(() => {
    if (!isOpen) return;
    setFolderId(currentFolderId ?? "root");
  }, [isOpen, currentFolderId]);

  const canSubmit = folderId !== (currentFolderId ?? "root");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onRequestClose()}>
      <DialogContent className="sm:max-w-lg p-8" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderInput className="w-5 h-5 text-brown-600"/>
            Move document
          </DialogTitle>
          <DialogDescription>
            Move <strong>{documentName ?? "this document"}</strong> to another folder.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-2">
          <Label>Destination folder</Label>
          <Select value={folderId} onValueChange={setFolderId}>
            <SelectTrigger>
              <SelectValue placeholder="Select folder"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="root">No folder</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="mt-8">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            disabled={isLoading || !canSubmit}
            className="bg-brown-600 text-white hover:bg-brown-700"
            onClick={() => onSubmit({ folderId: folderId === "root" ? undefined : folderId })}
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
