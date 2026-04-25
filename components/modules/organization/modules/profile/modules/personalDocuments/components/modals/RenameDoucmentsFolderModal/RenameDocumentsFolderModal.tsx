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
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { PencilLine } from "lucide-react";

export interface RenameDocumentsFolderModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  folderName?: string;
  onRequestClose: () => void;
  onSubmit: (values: { name: string }) => void;
}

export const RenameDocumentsFolderModal: FC<RenameDocumentsFolderModalProps> = ({
  isOpen,
  isLoading = false,
  folderName,
  onRequestClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(folderName ?? "");
  }, [isOpen, folderName]);

  const canSubmit = name.trim().length >= 2 && name.trim() !== (folderName ?? "").trim();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onRequestClose()}>
      <DialogContent className="sm:max-w-lg p-8" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilLine className="w-5 h-5 text-brown-600"/>
            Rename folder
          </DialogTitle>
          <DialogDescription>
            Update the folder name. All documents inside will stay in place.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-2">
          <Label>Folder name</Label>
          <Input
            placeholder="e.g. Contracts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
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
            onClick={() => {
              if (!canSubmit) return;
              onSubmit({ name: name.trim() });
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
