"use client";

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
import { FolderPlus } from "lucide-react";
import { FC, useEffect, useState } from "react";

export interface CreateDocumentsFolderModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onRequestClose: () => void;
  onSubmit: (values: { name: string }) => void;
}

export const CreateDocumentsFolderModal: FC<CreateDocumentsFolderModalProps> = ({
  isOpen,
  isLoading = false,
  onRequestClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName("");
  }, [isOpen]);

  const canSubmit = name.trim().length >= 2;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onRequestClose()}>
      <DialogContent className="sm:max-w-lg p-8" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-brown-600"/>
            Create folder
          </DialogTitle>
          <DialogDescription>
            Create a new folder to organize personal documents.
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
          <div className="text-xs text-muted-foreground">Minimum 2 characters.</div>
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
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
