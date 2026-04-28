"use client";

import { FC, FormEvent, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";

export type CreateDocumentsFolderFormValues = {
  name: string;
};

export interface CreateDocumentsFolderFormProps {
  isLoading?: boolean;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (
    values: CreateDocumentsFolderFormValues,
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
  values: CreateDocumentsFolderFormValues,
): CreateDocumentsFolderFormValues {
  return {
    name: values.name.trim(),
  };
}

export const CreateDocumentsFolderForm: FC<
  CreateDocumentsFolderFormProps
> = ({
  isLoading = false,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const formik = useFormik<CreateDocumentsFolderFormValues>({
    initialValues: {
      name: "",
    },
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => onSubmitAction(sanitize(values)),
  });

  useEffect(() => {
    onDirtyChangeAction?.(formik.dirty);
  }, [formik.dirty, onDirtyChangeAction]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

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
          required
          disabled={isLoading}
          aria-invalid={!!formik.errors.name}
        />

        {formik.errors.name ? (
          <p className="text-sm text-destructive">{formik.errors.name}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Minimum 2 characters.
          </p>
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
          disabled={isLoading}
          className="bg-brown-600 text-white hover:bg-brown-700"
        >
          Create
        </Button>
      </DialogFooter>
    </form>
  );
};
