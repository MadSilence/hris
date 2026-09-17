"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Textarea } from "@/public/desact/src/components/ui/textarea";
import { RequiredLabel } from "@/components/ui/RequiredLabel";

export interface CreateGroupFormProps {
  isLoading?: boolean;
  /** Names already taken — checked here so the clash is shown before a round-trip. */
  existingNames?: string[];
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: CreateGroupFormValues) => void | Promise<void>;
}

export type CreateGroupFormValues = {
  name: string;
  /** Trimmed on submit; an empty one means the section has no description. */
  description: string;
};

const buildValidationSchema = (existingNames: string[]) => {
  const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()));

  return yup.object({
    name: yup
      .string()
      .trim()
      .required("Please enter a section name.")
      .min(3, "Name must be at least 3 characters long.")
      .max(120, "Name must be 120 characters or fewer.")
      .nonNullable("Please enter a section name.")
      .test(
        "unique",
        "A section with this name already exists.",
        (value) => !value || !taken.has(value.trim().toLowerCase()),
      ),
    description: yup
      .string()
      .trim()
      .max(1000, "Description must be 1000 characters or fewer."),
  });
};

export const CreateGroupForm: FC<CreateGroupFormProps> = ({
  isLoading = false,
  existingNames = [],
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: CreateGroupFormValues) =>
      onSubmitAction({
        name: values.name.trim(),
        description: values.description.trim(),
      }),
    [onSubmitAction],
  );

  const formik = useFormik<CreateGroupFormValues>({
    initialValues: {
      name: "",
      description: "",
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

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <RequiredLabel htmlFor="group-name" required>Name Your Section</RequiredLabel>

        <Input
          id="group-name"
          value={formik.values.name}
          onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
          required
          disabled={isLoading}
          aria-invalid={!!formik.errors.name}
        />

        {formik.errors.name && (
          <p role="alert" className="text-sm text-destructive">{formik.errors.name}</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <RequiredLabel htmlFor="group-description">Description</RequiredLabel>

        <Textarea
          id="group-description"
          rows={3}
          value={formik.values.description}
          onChange={(e) => formik.setFieldValue("description", e.currentTarget.value)}
          disabled={isLoading}
          aria-invalid={!!formik.errors.description}
        />

        {formik.errors.description && (
          <p role="alert" className="text-sm text-destructive">{formik.errors.description}</p>
        )}
      </div>

      <DialogFooter className="mt-6 border-t border-brown-100 pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={onCancelAction}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isLoading}>
          Add
        </Button>
      </DialogFooter>
    </form>
  );
};
