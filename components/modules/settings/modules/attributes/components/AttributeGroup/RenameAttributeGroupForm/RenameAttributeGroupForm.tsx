"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Textarea } from "@/components/desact/textarea";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";

export interface RenameAttributeGroupFormProps {
  isLoading?: boolean;
  /** The section's current name — the form edits it rather than starting blank. */
  initialName?: string;
  /** The section's current description; a missing one starts empty. */
  initialDescription?: string | null;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (
    values: RenameAttributeGroupFormValues,
  ) => void | Promise<void>;
}

export type RenameAttributeGroupFormValues = {
  name: string;
  /** Trimmed on submit; an empty one clears the section's description. */
  description: string;
};

const renameAttributeGroupFormValidationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter a section name.")
    .min(3, "Name must be at least 3 characters long.")
    .max(120, "Name must be 120 characters or fewer.")
    .nonNullable("Please enter a section name."),
  description: yup
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or fewer."),
});

export const RenameAttributeGroupForm: FC<
  RenameAttributeGroupFormProps
> = ({
  isLoading = false,
  initialName = "",
  initialDescription,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const startDescription = initialDescription ?? "";

  const handleFormSubmission = useCallback(
    (values: RenameAttributeGroupFormValues) =>
      onSubmitAction({
        name: values.name.trim(),
        description: values.description.trim(),
      }),
    [onSubmitAction],
  );

  const formik = useFormik<RenameAttributeGroupFormValues>({
    initialValues: {
      name: initialName,
      description: startDescription,
    },
    validationSchema: renameAttributeGroupFormValidationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  useEffect(() => {
    onDirtyChangeAction?.(formik.dirty);
  }, [formik.dirty, onDirtyChangeAction]);

  // Submitting an untouched form would only earn "nothing changed" from the backend, so Save stays
  // off until the name or the description actually moved.
  const isUnchanged =
    formik.values.name.trim() === initialName.trim()
    && formik.values.description.trim() === startDescription.trim();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading || isUnchanged) return;

    const errors = await formik.validateForm();

    await formik.setTouched(setNestedObjectValues(errors, true), true);

    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <RequiredLabel htmlFor="attribute-group-name" required>Name your section</RequiredLabel>

        <Input
          id="attribute-group-name"
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

      <div className="mt-4 space-y-2">
        <RequiredLabel htmlFor="attribute-group-description">Description</RequiredLabel>

        <Textarea
          id="attribute-group-description"
          rows={3}
          value={formik.values.description}
          onChange={(e) => formik.setFieldValue("description", e.currentTarget.value)}
          disabled={isLoading}
          aria-invalid={!!formik.errors.description}
        />

        {formik.errors.description && (
          <FieldError>{formik.errors.description}</FieldError>
        )}
      </div>

      <DialogFooter className="mt-6 border-t border-divider pt-4">
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading}
          onClick={onCancelAction}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isLoading || isUnchanged}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
};
