"use client";

import React, { RefObject, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/public/desact/src/components/ui/input";

export interface RenameJobFamilyFormProps {
  formRef?: RefObject<{ submitForm: () => Promise<void> } | undefined>;
  onSubmit: (values: RenameJobFamilyFormValues) => void | Promise<void>;
}

export type RenameJobFamilyFormValues = {
  name: string;
};

const renameJobFamilyFormValidationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter a job family name.")
    .min(3, "Name must be at least 3 characters long.")
    .max(120, "Name must be 120 characters or fewer.")
    .nonNullable("Please enter a job family name."),
});

export const RenameJobFamilyForm: React.FC<RenameJobFamilyFormProps> = ({
  formRef,
  onSubmit,
}) => {
  const handleFormSubmission = useCallback(
    (values: RenameJobFamilyFormValues) => onSubmit(values),
    [onSubmit],
  );

  const formik = useFormik<RenameJobFamilyFormValues>({
    initialValues: {
      name: "",
    },
    validationSchema: renameJobFamilyFormValidationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  useEffect(() => {
    if (formRef) {
      formRef.current = {
        submitForm: async () => {
          const errors = await formik.validateForm();

          await formik.setTouched(
            { ...setNestedObjectValues(errors, true) },
            true,
          );

          const isValid = errors && Object.keys(errors).length === 0;

          if (!isValid) return;

          await formik.submitForm();
        },
      };
    }
  }, [formRef, formik]);

  return (
    <form>
      <label>
        Name your job family
        <Input
          value={formik.values.name}
          onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
          placeholder="e.g., Engineering"
          required
          aria-invalid={!!formik.errors.name}
        />
      </label>

      {formik.errors.name && <p>{formik.errors.name}</p>}
    </form>
  );
};
