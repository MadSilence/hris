"use client";

import { FC, FormEvent, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon, CloudUploadIcon, FileTextIcon, Upload01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { Label } from "@/components/desact/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/desact/select";
import { cn } from "@/lib/cn";
import { formatBytes } from "../../../utils/formatBytes";
import type { DocumentVisibility } from "@/api/modules/documents/dto";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FieldError } from "@/components/desact/field-error";

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
  visibility: DocumentVisibility;
};

export interface UploadDocumentFormProps {
  isLoading?: boolean;
  folders: FolderOption[];
  categories?: CategoryOption[];
  defaultFolderId?: string;
  /** Own space defaults to employee-visible; filing into someone else's defaults to HR-only. */
  defaultVisibility?: DocumentVisibility;
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
  defaultVisibility = "HR_ONLY",
  onCancelAction,
  onSubmitAction,
}) => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [folderId, setFolderId] = useState(defaultFolderId ?? ROOT_FOLDER_ID);
  const [categoryId, setCategoryId] = useState(NO_CATEGORY_ID);
  const [visibility, setVisibility] = useState<DocumentVisibility>(defaultVisibility);
  const [tried, setTried] = useState(false);

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
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;
    setTried(true);
    if (files.length === 0) return;

    void onSubmitAction({
      files,
      folderId: folderId === ROOT_FOLDER_ID ? undefined : folderId,
      categoryId: categoryId === NO_CATEGORY_ID ? undefined : categoryId,
      visibility,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-5">
        <div className="space-y-2">
          <RequiredLabel required>{t("documents.upload.files")}</RequiredLabel>

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
              "flex min-h-[200px] items-center justify-center rounded-card border-2 border-dashed p-6 text-center transition-all",
              isLoading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:border-field hover:bg-subtle/50",
              isDragging ? "border-accent-ring bg-accent-subtle" : "border-field",
            )}
 >
            <input
              ref={inputRef}
              aria-label={t("documents.upload.files")}
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
                  <Icon icon={CloudUploadIcon} size="lg" className="mb-4 text-secondary" />
                  <p className="mb-2 font-medium text-primary">{t("documents.upload.dropTitle")}</p>
                  <p className="text-body text-secondary">{t("documents.upload.dropHint")}</p>
                </>
              ) : (
                <>
                  <Icon icon={CloudUploadIcon} size="lg" className="mb-4 text-tertiary" />
                  <p className="mb-2 font-medium text-primary">{t("documents.upload.dragTitle")}</p>
                  <p className="mb-4 text-body text-tertiary">{t("documents.upload.dragHint")}</p>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      inputRef.current?.click();
                    }}
 >
                    <Icon icon={Upload01Icon} size="sm" />
                    {t("documents.upload.chooseFiles")}
                  </Button>
                </>
              )}
            </div>
          </div>

          {files.length > 0 && (
            <ul className="divide-y divide-divider rounded-control border border-divider">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center gap-3 px-3 py-2"
 >
                  <Icon icon={FileTextIcon} size="sm" className="shrink-0 text-tertiary" />
                  <span className="min-w-0 flex-1 truncate text-body" title={file.name}>
                    {shortenFileName(file.name)}
                  </span>
                  <span className="shrink-0 text-hint text-tertiary">
                    {formatBytes(file.size)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    aria-label={t("documents.upload.removeFile", { name: file.name })}
                    disabled={isLoading}
                    onClick={() => removeFile(index)}
 >
                    <Icon icon={Cancel01Icon} size="sm" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <FieldError>{tried && files.length === 0 ? t("documents.upload.chooseAtLeastOne") : null}</FieldError>
        </div>

        <div className="space-y-2">
          <Label>{t("documents.upload.folder")}</Label>

          <SearchableSelect
            aria-label={t("documents.upload.folder")}
            options={[
              { value: ROOT_FOLDER_ID, label: tCommon("values.none") },
              ...folders.map((folder) => ({ value: folder.id, label: folder.name })),
            ]}
            value={folderId || null}
            onChange={(v) => setFolderId(v ?? ROOT_FOLDER_ID)}
            placeholder={t("documents.selectFolder")}
            disabled={isLoading}
            clearable={false}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("documents.upload.visibility")}</Label>

          <Select
            value={visibility}
            onValueChange={(v) => setVisibility(v as DocumentVisibility)}
            disabled={isLoading}
 >
            <SelectTrigger>
              <SelectValue/>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="HR_ONLY">{t("documents.upload.visibilityHrOnly")}</SelectItem>
              <SelectItem value="VISIBLE_TO_EMPLOYEE">
                {t("documents.upload.visibilityEmployee")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {categories.length > 0 && (
          <div className="space-y-2">
            <Label>{t("documents.upload.category")}</Label>

            <SearchableSelect
              aria-label={t("documents.upload.category")}
              options={[
                { value: NO_CATEGORY_ID, label: tCommon("values.none") },
                ...categories.map((category) => ({ value: category.id, label: category.name })),
              ]}
              value={categoryId || null}
              onChange={(v) => setCategoryId(v ?? NO_CATEGORY_ID)}
              placeholder={t("documents.upload.selectCategory")}
              disabled={isLoading}
              clearable={false}
            />
          </div>
        )}
      </div>

      <DialogFooter className="mt-8">
        <Button type="button" variant="secondary" disabled={isLoading} onClick={onCancelAction}>
          {tCommon("actions.cancel")}
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
 >
          {t("documents.upload.submit", { count: files.length })}
        </Button>
      </DialogFooter>
    </form>
  );
};
