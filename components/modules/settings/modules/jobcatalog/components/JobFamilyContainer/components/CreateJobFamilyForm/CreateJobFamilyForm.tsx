"use client";

import { setNestedObjectValues, useFormik } from "formik";
import type { RefObject } from "react";
import React, { useCallback, useEffect } from "react";
import * as yup from "yup";
import { Input } from "@/components/ui/Input";

export interface CreateJobFamilyFormProps {
  formRef?: RefObject<{ submitForm: () => Promise<void> } | undefined>;
  onSubmit: (values: CreateJobFamilyFormValues) => void | Promise<void>;
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

export const CreateJobFamilyForm: React.FC<CreateJobFamilyFormProps> = ({
  formRef,
  onSubmit,
}) => {
  const handleFormSubmission = useCallback(
    (values: CreateJobFamilyFormValues) => onSubmit(values),
    [onSubmit]
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
    if (formRef) {
      formRef.current = {
        submitForm: async () => {
          const errors = await formik.validateForm();
          await formik.setTouched(
            { ...setNestedObjectValues(errors, true) },
            true
          );
          const isValid = errors && Object.keys(errors).length === 0;
          if (!isValid) {
            return;
          }

          await formik.submitForm();
        },
      };
    }
  }, [formRef, formik]);

  return (
    <form className="space-y-4">
      <Input
        label="Name your job family"
        error={formik.errors.name}
        value={formik.values.name}
        onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
        placeholder="e.g., Engineering"
        required
      />
    </form>
  );
};
