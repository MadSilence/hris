"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";

/** Matches the column and the backend's JobTextRules. */
const DESCRIPTION_MAX = 300;

export type JobFamilyFormValues = {
  name: string;
  description: string;
};

export interface JobFamilyFormProps {
  isLoading?: boolean;
  submitLabel: string;
  initialValues?: Partial<JobFamilyFormValues>;
  /** Names already taken — checked here so the clash shows before a round-trip. */
  existingNames?: string[];
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: JobFamilyFormValues) => void | Promise<void>;
}

const buildValidationSchema = (existingNames: string[]) => {
  const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()));

  return yup.object({
    name: yup
      .string()
      .trim()
      .required("Please enter a family name.")
      .max(255, "Name must be 255 characters or fewer.")
      .test(
        "unique",
        "A job family with this name already exists.",
        (value) => !value || !taken.has(value.trim().toLowerCase()),
      ),
    description: yup
      .string()
      .trim()
      .max(DESCRIPTION_MAX, `Description must be ${DESCRIPTION_MAX} characters or fewer.`),
  });
};

export const JobFamilyForm: FC<JobFamilyFormProps> = ({
  isLoading = false,
  submitLabel,
  initialValues,
  existingNames = [],
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: JobFamilyFormValues) =>
      onSubmitAction({
        name: values.name.trim(),
        description: values.description.trim(),
      }),
    [onSubmitAction],
  );

  const formik = useFormik<JobFamilyFormValues>({
    initialValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
    },
    validationSchema: buildValidationSchema(existingNames),
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

  const remaining = DESCRIPTION_MAX - formik.values.description.length;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="job-family-name">Name</Label>

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

        <div className="space-y-2">
          <Label htmlFor="job-family-description">Description</Label>

          <Textarea
            id="job-family-description"
            value={formik.values.description}
            onChange={(e) => formik.setFieldValue("description", e.currentTarget.value)}
            placeholder="What this family covers"
            rows={3}
            maxLength={DESCRIPTION_MAX}
            disabled={isLoading}
            aria-invalid={!!formik.errors.description}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{formik.errors.description ?? ""}</p>
            <p className="text-xs text-muted-foreground">{remaining} characters left</p>
          </div>
        </div>
      </div>

      <DialogFooter className="mt-6 border-t border-brown-100 pt-4">
        <Button type="button" variant="outline" disabled={isLoading} onClick={onCancelAction}>
          Cancel
        </Button>

        <Button type="submit" disabled={isLoading}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};
