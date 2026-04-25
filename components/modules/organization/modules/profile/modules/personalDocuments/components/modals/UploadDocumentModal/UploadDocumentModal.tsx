"use client";

import { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/public/desact/src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/public/desact/src/components/ui/select";
import { FilePlus, Upload } from "lucide-react";
import { Label } from "recharts";
import { Button } from "@/public/desact/src/components/ui/button";

export type FolderOption = {
  id: string;
  name: string;
};

export interface UploadDocumentModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  folders: FolderOption[];
  defaultFolderId?: string;
  onRequestClose: () => void;
  onSubmit: (values: { file: File; folderId?: string }) => void;
}

export const UploadDocumentModal: FC<UploadDocumentModalProps> = ({
  isOpen,
  isLoading = false,
  folders,
  defaultFolderId,
  onRequestClose,
  onSubmit,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [folderId, setFolderId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) return;
    setFile(null);
    setFolderId(defaultFolderId);
  }, [isOpen, defaultFolderId]);

  const canSubmit = !!file;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onRequestClose()}>
      <DialogContent className="sm:max-w-xl p-8" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-brown-600"/>
            Add document
          </DialogTitle>
          <DialogDescription>
            Upload a document and place it into a folder.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>File</Label>
            <label
              className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-dashed px-4 py-3 hover:bg-muted/40">
              <div className="min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4 text-brown-600"/>
                  {file ? file.name : "Choose file from device"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Supported formats depend on backend validation.
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                disabled={isLoading}
                onChange={(e) => {
                  const nextFile = e.target.files?.[0] ?? null;
                  setFile(nextFile);
                }}
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label>Folder</Label>
            <Select value={folderId} onValueChange={(v) => setFolderId(v === "root" ? undefined : v)}>
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
              if (!file) return;
              onSubmit({ file, folderId });
            }}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
