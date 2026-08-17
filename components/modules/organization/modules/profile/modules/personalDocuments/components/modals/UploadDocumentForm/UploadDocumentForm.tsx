"use client";

import { FC, FormEvent, useRef, useState } from "react";
import { CloudUpload, FileText, Upload, X } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Label } from "@/public/desact/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";
import { cn } from "@/public/desact/src/components/ui/utils";
import { formatBytes } from "../../../utils/formatBytes";

export type FolderOption = {
  id: string;
  name: string;
};

export type CategoryOption = {
  id: string;
  name: string;
};

export type UploadDocumentFormValues = {
  files: File[];
  folderId?: string;
  categoryId?: string;
};

export interface UploadDocumentFormProps {
  isLoading?: boolean;
  folders: FolderOption[];
  categories?: CategoryOption[];
  defaultFolderId?: string;
  onCancelAction: () => void;
  onSubmitAction: (values: UploadDocumentFormValues) => void | Promise<void>;
}

const ROOT_FOLDER_ID = "root";
const NO_CATEGORY_ID = "none";
const MAX_FILE_NAME_LENGTH = 56;

function shortenFileName(fileName: string) {
  if (fileName.length <= MAX_FILE_NAME_LENGTH) return fileName;

  const lastDotIndex = fileName.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0 && lastDotIndex < fileName.length - 1;

  if (!hasExtension) {
    return `${fileName.slice(0, MAX_FILE_NAME_LENGTH - 3)}...`;
  }

  const extension = fileName.slice(lastDotIndex);
  const baseName = fileName.slice(0, lastDotIndex);
  const availableBaseLength = MAX_FILE_NAME_LENGTH - extension.length - 3;

  return `${baseName.slice(0, availableBaseLength)}...${extension}`;
}

export const UploadDocumentForm: FC<UploadDocumentFormProps> = ({
  isLoading = false,
  folders,
  categories = [],
  defaultFolderId,
  onCancelAction,
  onSubmitAction,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [folderId, setFolderId] = useState(defaultFolderId ?? ROOT_FOLDER_ID);
  const [categoryId, setCategoryId] = useState(NO_CATEGORY_ID);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;

    // Same file picked twice (drag then browse) should not queue two uploads.
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}:${f.size}:${f.lastModified}`));
      const next = [...prev];

      for (const file of Array.from(incoming)) {
        const key = `${file.name}:${file.size}:${file.lastModified}`;
        if (!seen.has(key)) {
          seen.add(key);
          next.push(file);
        }
      }

      return next;
    });
    setError(null);
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    if (files.length === 0) {
      setError("Please choose at least one file.");
      return;
    }

    void onSubmitAction({
      files,
      folderId: folderId === ROOT_FOLDER_ID ? undefined : folderId,
      categoryId: categoryId === NO_CATEGORY_ID ? undefined : categoryId,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Files</Label>

          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!isLoading) inputRef.current?.click();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!isLoading) inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isLoading) setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (isLoading) return;
              addFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all",
              isLoading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:border-brown-300 hover:bg-brown-50/50",
              isDragging ? "border-brown-400 bg-brown-50" : "border-brown-200",
            )}
          >
            <input
              ref={inputRef}
              aria-label="Files"
              type="file"
              multiple
              className="hidden"
              disabled={isLoading}
              onChange={(e) => {
                addFiles(e.currentTarget.files);
                e.currentTarget.value = "";
              }}
            />

            <div className="flex w-full max-w-md flex-col items-center">
              {isDragging ? (
                <>
                  <CloudUpload className="mb-4 h-12 w-12 text-brown-600"/>
                  <p className="mb-2 font-medium text-brown-800">Drop files to upload</p>
                  <p className="text-sm text-brown-600">Release to add them</p>
                </>
              ) : (
                <>
                  <CloudUpload className="mb-4 h-12 w-12 text-brown-400"/>
                  <p className="mb-2 font-medium text-stone-900">Drag files here to upload</p>
                  <p className="mb-4 text-sm text-stone-500">or click to browse</p>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      inputRef.current?.click();
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4"/>
                    Choose files
                  </Button>
                </>
              )}
            </div>
          </div>

          {files.length > 0 && (
            <ul className="divide-y divide-brown-100 rounded-lg border border-brown-200">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <FileText className="h-4 w-4 shrink-0 text-brown-500"/>
                  <span className="min-w-0 flex-1 truncate text-sm" title={file.name}>
                    {shortenFileName(file.name)}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    aria-label={`Remove ${file.name}`}
                    disabled={isLoading}
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3.5 w-3.5"/>
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="space-y-2">
          <Label>Folder</Label>

          <Select value={folderId} onValueChange={setFolderId} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select folder"/>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={ROOT_FOLDER_ID}>No folder</SelectItem>

              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {categories.length > 0 && (
          <div className="space-y-2">
            <Label>Category</Label>

            <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category"/>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={NO_CATEGORY_ID}>No category</SelectItem>

                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <DialogFooter className="mt-8">
        <Button type="button" variant="outline" disabled={isLoading} onClick={onCancelAction}>
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isLoading || files.length === 0}
          className="bg-brown-600 text-white hover:bg-brown-700"
        >
          {files.length > 1 ? `Upload ${files.length} files` : "Upload"}
        </Button>
      </DialogFooter>
    </form>
  );
};
