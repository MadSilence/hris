"use client";

import { FC, FormEvent, useCallback, useMemo } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Label } from "@/public/desact/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";

export type MoveDocumentFolderOption = {
  id: string;
  name: string;
};

export type MoveDocumentFormValues = {
  folderId?: string;
};

type MoveDocumentInternalFormValues = {
  folderId: string;
};

export interface MoveDocumentFormProps {
  isLoading?: boolean;
  folders: MoveDocumentFolderOption[];
  currentFolderId?: string;
  onCancelAction: () => void;
  onSubmitAction: (values: MoveDocumentFormValues) => void | Promise<void>;
}

const ROOT_FOLDER_ID = "root";

const schema = yup.object({
  folderId: yup.string().required("Please select destination folder."),
});

function sanitize(values: MoveDocumentInternalFormValues): MoveDocumentFormValues {
  return {
    folderId: values.folderId === ROOT_FOLDER_ID ? undefined : values.folderId,
  };
}

export const MoveDocumentForm: FC<MoveDocumentFormProps> = ({
  isLoading = false,
  folders,
  currentFolderId,
  onCancelAction,
  onSubmitAction,
}) => {
  const normalizedCurrentFolderId = currentFolderId ?? ROOT_FOLDER_ID;

  const handleFormSubmission = useCallback(
    (values: MoveDocumentInternalFormValues) => onSubmitAction(sanitize(values)),
    [onSubmitAction],
  );

  const formik = useFormik<MoveDocumentInternalFormValues>({
    initialValues: {
      folderId: normalizedCurrentFolderId,
    },
    enableReinitialize: true,
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  const canSubmit = useMemo(
    () => formik.values.folderId !== normalizedCurrentFolderId,
    [formik.values.folderId, normalizedCurrentFolderId],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading || !canSubmit) return;

    const errors = await formik.validateForm();

    await formik.setTouched(setNestedObjectValues(errors, true), true);

    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label>Destination folder</Label>

        <Select
          value={formik.values.folderId}
          onValueChange={(value) => formik.setFieldValue("folderId", value)}
          disabled={isLoading}
        >
          <SelectTrigger aria-invalid={!!formik.errors.folderId}>
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

        {formik.errors.folderId && (
          <p className="text-sm text-destructive">{formik.errors.folderId}</p>
        )}
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
          disabled={isLoading || !canSubmit}
          className="bg-brown-600 text-white hover:bg-brown-700"
        >
          Move
        </Button>
      </DialogFooter>
    </form>
  );
};
