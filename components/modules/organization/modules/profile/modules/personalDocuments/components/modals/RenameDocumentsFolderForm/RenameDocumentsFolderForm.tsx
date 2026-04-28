"use client";

import { FC, FormEvent, useCallback, useMemo } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";

export type RenameDocumentsFolderFormValues = {
  name: string;
};

export interface RenameDocumentsFolderFormProps {
  isLoading?: boolean;
  folderName?: string;
  onCancelAction: () => void;
  onSubmitAction: (
    values: RenameDocumentsFolderFormValues,
  ) => void | Promise<void>;
}

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter a folder name.")
    .min(2, "Folder name must be at least 2 characters.")
    .max(120, "Folder name must be at most 120 characters."),
});

function sanitize(
  values: RenameDocumentsFolderFormValues,
): RenameDocumentsFolderFormValues {
  return {
    name: values.name.trim(),
  };
}

export const RenameDocumentsFolderForm: FC<
  RenameDocumentsFolderFormProps
> = ({
  isLoading = false,
  folderName,
  onCancelAction,
  onSubmitAction,
}) => {
  const normalizedInitialName = folderName ?? "";

  const handleFormSubmission = useCallback(
    (values: RenameDocumentsFolderFormValues) =>
      onSubmitAction(sanitize(values)),
    [onSubmitAction],
  );

  const formik = useFormik<RenameDocumentsFolderFormValues>({
    initialValues: {
      name: normalizedInitialName,
    },
    enableReinitialize: true,
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  const canSubmit = useMemo(
    () =>
      formik.values.name.trim().length >= 2 &&
      formik.values.name.trim() !== normalizedInitialName.trim(),
    [formik.values.name, normalizedInitialName],
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
        <Label htmlFor="folder-name">Folder name</Label>

        <Input
          id="folder-name"
          value={formik.values.name}
          onChange={(e) =>
            formik.setFieldValue("name", e.currentTarget.value)
          }
          placeholder="e.g. Contracts"
          disabled={isLoading}
          aria-invalid={!!formik.errors.name}
        />

        {formik.errors.name && (
          <p className="text-sm text-destructive">{formik.errors.name}</p>
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
          Save
        </Button>
      </DialogFooter>
    </form>
  );
};
