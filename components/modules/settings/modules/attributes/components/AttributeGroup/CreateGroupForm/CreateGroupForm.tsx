"use client";

import { setNestedObjectValues, useFormik } from "formik";
import type { RefObject } from "react";
import React, { useCallback, useEffect } from "react";
import * as yup from "yup";
import { Input } from "@/public/desact/src/components/ui/input";

export interface CreateGroupFormProps {
  formRef?: RefObject<{ submitForm: () => Promise<void> } | undefined>;
  onSubmit: (values: CreateGroupFormValues) => void | Promise<void>;
}

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  formRef,
  onSubmit,
}) => {
  const handleFormSubmission = useCallback(
    (values: CreateGroupFormValues) => onSubmit(values),
    [onSubmit],
  );

  const formik = useFormik<CreateGroupFormValues>({
    initialValues: {
      name: "",
    },
    validationSchema: createGroupFormValidationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  useEffect(() => {
    if (formRef) {
      formRef.current = {
        submitForm: async () => {
          const errors = await formik.validateForm();

          await formik.setTouched({ ...setNestedObjectValues(errors, true) }, true);

          const isValid = errors && Object.keys(errors).length === 0;

          if (!isValid) return;

          await formik.submitForm();
        },
      };
    }
  }, [formRef, formik]);

  return (
    <form className="space-y-4">
      <label>
        Name your section
        <Input
          value={formik.values.name}
          onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
          placeholder="e.g., HR information"
          required
          aria-invalid={!!formik.errors.name}
        />
      </label>

      {formik.errors.name && <p>{formik.errors.name}</p>}
    </form>
  );
};

const createGroupFormValidationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter a section name.")
    .min(3, "Name must be at least 3 characters long.")
    .max(120, "Name must be 120 characters or fewer.")
    .nonNullable("Please enter a section name."),
});

export type CreateGroupFormValues = {
  name: string;
};
