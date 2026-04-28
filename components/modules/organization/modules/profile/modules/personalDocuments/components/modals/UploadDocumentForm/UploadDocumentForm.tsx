"use client";

import { FC, FormEvent, useCallback } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Upload } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Label } from "@/public/desact/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";

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

export const UploadDocumentForm: FC<UploadDocumentFormProps> = ({
  isLoading = false,
  folders,
  defaultFolderId,
  onCancelAction,
  onSubmitAction,
}) => {
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading || !formik.values.file) return;

    const errors = await formik.validateForm();

    await formik.setTouched(setNestedObjectValues(errors, true), true);

    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>File</Label>

          <label
            className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-dashed px-4 py-3 hover:bg-muted/40">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Upload className="h-4 w-4 text-brown-600"/>
                {formik.values.file
                  ? formik.values.file.name
                  : "Choose file from device"}
              </div>

              <div className="text-xs text-muted-foreground">
                Supported formats depend on backend validation.
              </div>
            </div>

            <input
              aria-label="File"
              type="file"
              className="hidden"
              disabled={isLoading}
              onChange={(e) => {
                const nextFile = e.currentTarget.files?.[0] ?? null;

                void formik.setFieldValue("file", nextFile);
              }}
            />
          </label>

          {formik.errors.file && (
            <p className="text-sm text-destructive">
              {String(formik.errors.file)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Folder</Label>

          <Select
            value={formik.values.folderId}
            onValueChange={(value) => formik.setFieldValue("folderId", value)}
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
