"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";

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
          <RequiredLabel htmlFor="job-family-name" required>Name</RequiredLabel>

          <Input
            id="job-family-name"
            value={formik.values.name}
            onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
            required
            disabled={isLoading}
            aria-invalid={!!formik.errors.name}
          />

          {formik.errors.name && (
            <FieldError>{formik.errors.name}</FieldError>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-family-description">Description</Label>

          <Textarea
            id="job-family-description"
            value={formik.values.description}
            onChange={(e) => formik.setFieldValue("description", e.currentTarget.value)}
            rows={3}
            maxLength={DESCRIPTION_MAX}
            disabled={isLoading}
            aria-invalid={!!formik.errors.description}
          />

          <div className="flex items-center justify-between">
            <FieldError>{formik.errors.description ?? ""}</FieldError>
            <p className="text-hint text-tertiary">{remaining} characters left</p>
          </div>
        </div>
      </div>

      <DialogFooter className="mt-6 border-t border-divider pt-4">
        <Button type="button" variant="secondary" disabled={isLoading} onClick={onCancelAction}>
          Cancel
        </Button>

        <Button type="submit" disabled={isLoading}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};
