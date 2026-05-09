"use client";

import { FC, FormEvent, useCallback, useRef, useState } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { CloudUpload, FileText, Upload, X } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Label } from "@/public/desact/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";
import { cn } from "@/public/desact/src/components/ui/utils";

export type FolderOption = {
  id: string;
  name: string;
};

export type UploadDocumentFormValues = {
  file: File;
  folderId?: string;
};

type UploadDocumentInternalFormValues = {
  file: File | null;
  folderId: string;
};

export interface UploadDocumentFormProps {
  isLoading?: boolean;
  folders: FolderOption[];
  defaultFolderId?: string;
  onCancelAction: () => void;
  onSubmitAction: (values: UploadDocumentFormValues) => void | Promise<void>;
}

const ROOT_FOLDER_ID = "root";
const MAX_FILE_NAME_LENGTH = 56;

const schema = yup.object({
  file: yup.mixed<File>().required("Please choose a file."),
  folderId: yup.string().required(),
});

function sanitize(
  values: UploadDocumentInternalFormValues,
): UploadDocumentFormValues | null {
  if (!values.file) return null;

  return {
    file: values.file,
    folderId: values.folderId === ROOT_FOLDER_ID ? undefined : values.folderId,
  };
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

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
  defaultFolderId,
  onCancelAction,
  onSubmitAction,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFormSubmission = useCallback(
    (values: UploadDocumentInternalFormValues) => {
      const sanitized = sanitize(values);

      if (!sanitized) return;

      return onSubmitAction(sanitized);
    },
    [onSubmitAction],
  );

  const formik = useFormik<UploadDocumentInternalFormValues>({
    initialValues: {
      file: null,
      folderId: defaultFolderId ?? ROOT_FOLDER_ID,
    },
    enableReinitialize: true,
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  const setFile = (file: File | null) => {
    void formik.setFieldValue("file", file);
    void formik.setFieldTouched("file", true, false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    const errors = await formik.validateForm();

    await formik.setTouched(setNestedObjectValues(errors, true), true);

    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  const selectedFile = formik.values.file;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>File</Label>

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

              const nextFile = e.dataTransfer.files?.[0] ?? null;

              setFile(nextFile);
            }}
            className={cn(
              "flex min-h-[260px] items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all",
              isLoading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:border-brown-300 hover:bg-brown-50/50",
              isDragging
                ? "border-brown-400 bg-brown-50"
                : "border-brown-200",
            )}
          >
            <input
              ref={inputRef}
              aria-label="File"
              type="file"
              className="hidden"
              disabled={isLoading}
              onChange={(e) => {
                const nextFile = e.currentTarget.files?.[0] ?? null;

                setFile(nextFile);
              }}
            />

            <div className="flex w-full max-w-md flex-col items-center">
              {isDragging ? (
                <>
                  <CloudUpload className="mb-4 h-12 w-12 text-brown-600"/>
                  <p className="mb-2 font-medium text-brown-800">
                    Drop file to upload
                  </p>
                  <p className="text-sm text-brown-600">
                    Release to choose this file
                  </p>
                </>
              ) : selectedFile ? (
                <>
                  <FileText className="mb-4 h-12 w-12 text-brown-500"/>

                  <p
                    title={selectedFile.name}
                    className="mb-1 max-w-full break-words text-center font-medium text-stone-900"
                  >
                    {shortenFileName(selectedFile.name)}
                  </p>

                  <p className="mb-4 text-sm text-stone-500">
                    {formatFileSize(selectedFile.size)}
                  </p>

                  <div className="flex justify-center gap-2">
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
                      Choose another
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();

                        if (inputRef.current) {
                          inputRef.current.value = "";
                        }

                        setFile(null);
                      }}
                    >
                      <X className="mr-2 h-4 w-4"/>
                      Remove
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <CloudUpload className="mb-4 h-12 w-12 text-brown-400"/>

                  <p className="mb-2 font-medium text-stone-900">
                    Drag file here to upload
                  </p>

                  <p className="mb-4 text-sm text-stone-500">
                    or click to browse files
                  </p>

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
                    Choose file
                  </Button>

                  <p className="mt-3 text-xs text-stone-500">
                    Supports PDF, DOC, JPG, PNG files up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          {formik.errors.file && formik.touched.file && (
            <p className="text-sm text-destructive">
              {String(formik.errors.file)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Folder</Label>

          <Select
            value={formik.values.folderId}
            onValueChange={(value) => {
              void formik.setFieldValue("folderId", value);
            }}
            disabled={isLoading}
          >
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
      </div>

      <DialogFooter className="mt-8">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={onCancelAction}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isLoading || !formik.values.file}
          className="bg-brown-600 text-white hover:bg-brown-700"
        >
          Upload
        </Button>
      </DialogFooter>
    </form>
  );
};
