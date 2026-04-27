"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";

export interface CreateJobFamilyFormProps {
  isLoading?: boolean;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: CreateJobFamilyFormValues) => void | Promise<void>;
}

export type CreateJobFamilyFormValues = {
  name: string;
};

const createJobFamilyFormValidationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter a job family name.")
    .min(3, "Name must be at least 3 characters long.")
    .max(120, "Name must be 120 characters or fewer.")
    .nonNullable("Please enter a job family name."),
});

export const CreateJobFamilyForm: FC<CreateJobFamilyFormProps> = ({
  isLoading = false,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: CreateJobFamilyFormValues) =>
      onSubmitAction({
        name: values.name.trim(),
      }),
    [onSubmitAction],
  );

  const formik = useFormik<CreateJobFamilyFormValues>({
    initialValues: {
      name: "",
    },
    validationSchema: createJobFamilyFormValidationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
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
        <Label htmlFor="job-family-name">Name your job family</Label>

        <Input
          id="job-family-name"
          value={formik.values.name}
          onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
          placeholder="e.g., Engineering"
          required
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

        <Button type="submit" disabled={isLoading}>
          Create
        </Button>
      </DialogFooter>
    </form>
  );
};
