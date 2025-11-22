"use client"

import React, { RefObject, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Input } from "@/components/ui/Input";

export interface RenameAttributeGroupFormProps {
  formRef?: RefObject<{ submitForm: () => Promise<void> } | undefined>;
  onSubmit: (values: RenameAttributeGroupFormValues) => void | Promise<void>;
}

export const RenameAttributeGroupForm: React.FC<RenameAttributeGroupFormProps> = ({
  formRef,
  onSubmit,
}) => {
  const handleFormSubmission = useCallback(
    (values: RenameAttributeGroupFormValues) => onSubmit(values),
    [onSubmit]
  );

  const formik = useFormik<RenameAttributeGroupFormValues>({
    initialValues: {
      name: "",
    },
    validationSchema: renameAttributeGroupFormValidationSchema,
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
          if (!isValid) {
            return;
          }

          await formik.submitForm();
        },
      };
    }
  }, [formRef, formik]);

  return (
    <form>
      <Input
        label="Name your section"
        error={formik.errors.name}
        value={formik.values.name}
        onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
        placeholder="e.g., HR information"
        required
      />
    </form>
  )
}

const renameAttributeGroupFormValidationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Please enter a section name.')
    .min(3, 'Name must be at least 3 characters long.')
    .max(120, 'Name must be 120 characters or fewer.')
    .nonNullable("Please enter a section name."),
});

export type RenameAttributeGroupFormValues = {
  name: string;
};
