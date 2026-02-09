"use client";

import { setNestedObjectValues, useFormik } from "formik";
import type { RefObject } from "react";
import React, { useCallback, useEffect } from "react";
import * as yup from "yup";
import Input from "@/components/ui/Input/Input";
import styles from "./CreateLegalEntityForm.module.css";

export type CreateLegalEntityFormValues = {
  name: string;
  description: string;
  registrationNumber: string;
  taxId: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;
};

export type CreateLegalEntityFormHandle = {
  submitForm: () => Promise<void>;
  isDirty: () => boolean;
  reset: () => void;
};

export interface CreateLegalEntityFormProps {
  formRef?: RefObject<CreateLegalEntityFormHandle | undefined>;
  onSubmit: (values: CreateLegalEntityFormValues) => void | Promise<void>;
  initialValues?: Partial<CreateLegalEntityFormValues>;
}

export const CreateLegalEntityForm: React.FC<CreateLegalEntityFormProps> = ({
  formRef,
  onSubmit,
  initialValues,
}) => {
  const handleFormSubmission = useCallback(
    (values: CreateLegalEntityFormValues) => onSubmit(values),
    [onSubmit],
  );

  const formik = useFormik<CreateLegalEntityFormValues>({
    initialValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      registrationNumber: initialValues?.registrationNumber ?? "",
      taxId: initialValues?.taxId ?? "",
      country: initialValues?.country ?? "",
      city: initialValues?.city ?? "",
      street: initialValues?.street ?? "",
      building: initialValues?.building ?? "",
      postCode: initialValues?.postCode ?? "",
    },
    enableReinitialize: true,
    validationSchema: createSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  useEffect(() => {
    if (!formRef) return;

    formRef.current = {
      submitForm: async () => {
        const errors = await formik.validateForm();
        await formik.setTouched(
          { ...setNestedObjectValues(errors, true) },
          true,
        );
        if (errors && Object.keys(errors).length > 0) return;
        await formik.submitForm();
      },
      isDirty: () => formik.dirty,
      reset: () => formik.resetForm(),
    };
  }, [formRef, formik]);

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        void formik.submitForm();
      }}
    >
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Legal entity details</h3>

        <div className={styles.row}>
          <Input
            label="Name"
            error={formik.errors.name}
            value={formik.values.name}
            onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
            placeholder="e.g., Acme LLC"
            required
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Description"
            error={formik.errors.description}
            value={formik.values.description}
            onChange={(e) =>
              formik.setFieldValue("description", e.currentTarget.value)
            }
            placeholder="Optional"
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Registration number"
            error={formik.errors.registrationNumber}
            value={formik.values.registrationNumber}
            onChange={(e) =>
              formik.setFieldValue("registrationNumber", e.currentTarget.value)
            }
            placeholder="Registration number"
            required
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Tax ID"
            error={formik.errors.taxId}
            value={formik.values.taxId}
            onChange={(e) =>
              formik.setFieldValue("taxId", e.currentTarget.value)
            }
            placeholder="Tax identification number"
            required
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Address</h3>

        <div className={styles.row}>
          <Input
            label="Country"
            error={formik.errors.country}
            value={formik.values.country}
            onChange={(e) =>
              formik.setFieldValue("country", e.currentTarget.value)
            }
            placeholder="Country"
            required
          />
        </div>

        <div className={styles.row}>
          <Input
            label="City"
            error={formik.errors.city}
            value={formik.values.city}
            onChange={(e) =>
              formik.setFieldValue("city", e.currentTarget.value)
            }
            placeholder="City"
            required
          />
        </div>

        <div className={styles.rowTwoCols}>
          <Input
            label="Street"
            error={formik.errors.street}
            value={formik.values.street}
            onChange={(e) =>
              formik.setFieldValue("street", e.currentTarget.value)
            }
            placeholder="Optional"
          />
          <Input
            label="Building"
            error={formik.errors.building}
            value={formik.values.building}
            onChange={(e) =>
              formik.setFieldValue("building", e.currentTarget.value)
            }
            placeholder="Optional"
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Post code"
            error={formik.errors.postCode}
            value={formik.values.postCode}
            onChange={(e) =>
              formik.setFieldValue("postCode", e.currentTarget.value)
            }
            placeholder="Optional"
          />
        </div>
      </div>
    </form>
  );
};

const createSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter a legal entity name.")
    .min(2)
    .max(200),
  description: yup.string().trim().max(1000).optional(),
  registrationNumber: yup
    .string()
    .trim()
    .required("Please enter a registration number.")
    .max(120),
  taxId: yup
    .string()
    .trim()
    .required("Please enter a tax ID.")
    .max(120),
  country: yup
    .string()
    .trim()
    .required("Please enter a country.")
    .max(120),
  city: yup
    .string()
    .trim()
    .required("Please enter a city.")
    .max(120),
  street: yup.string().trim().max(200).optional(),
  building: yup.string().trim().max(50).optional(),
  postCode: yup.string().trim().max(50).optional(),
});
