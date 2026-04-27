"use client";

import { setNestedObjectValues, useFormik } from "formik";
import type { RefObject } from "react";
import React, { useCallback, useEffect } from "react";
import * as yup from "yup";
import { Input } from "@/public/desact/src/components/ui/input";
import styles from "./CreateAttributeForm.module.css";

import { ALL_ATTRIBUTE_TYPES, AttributeOption, AttributeType, isOptionsType, isUniqueType, } from "@/models/attribute";

import { TypeSelect } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/TypeSelect";
import { OptionsEditor } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/OptionsEditor";
import { NumberScaleRow } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/NumberScaleRow";
import { DateSettings } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/DateSettings";
import { UniqueSelect } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/UniqueSelect";

export interface CreateAttributeFormProps {
  formRef?: RefObject<{ submitForm: () => Promise<void> } | undefined>;
  onSubmit: (values: CreateAttributeFormValues) => void | Promise<void>;
}

export type CreateAttributeFormValues = {
  name: string;
  type: AttributeType;
  unique: boolean;
  decScale: number | null;
  dateHideYearPublic: boolean;
  options?: AttributeOption[];
};

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter an attribute name.")
    .min(2)
    .max(120)
    .nonNullable(),
  type: yup.mixed<AttributeType>().oneOf(ALL_ATTRIBUTE_TYPES).required("Select attribute type."),
  unique: yup.boolean().required(),
  decScale: yup
    .number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v))
    .min(0)
    .typeError("Decimal scale must be a number"),
  dateHideYearPublic: yup.boolean().optional(),
  options: yup
    .array()
    .of(
      yup.object({
        value: yup.string().required(),
        color: yup.string().required(),
      }),
    )
    .when("type", {
      is: (t: AttributeType) => isOptionsType(t),
      then: (s) => s.optional(),
      otherwise: (s) => s.strip(),
    })
    .optional(),
});

function sanitize(values: CreateAttributeFormValues): CreateAttributeFormValues {
  const type = values.type;

  return {
    name: values.name,
    type,
    unique: isUniqueType(type) ? values.unique : false,
    decScale: type === AttributeType.NUMBER ? values.decScale : null,
    dateHideYearPublic:
      type === AttributeType.DATE ? values.dateHideYearPublic ?? false : false,
    options: isOptionsType(type)
      ? (values.options ?? []).filter(
        (o) => o && o.value.trim() !== "" && o.color.trim() !== "",
      )
      : undefined,
  };
}

export const CreateAttributeForm: React.FC<CreateAttributeFormProps> = ({
  formRef,
  onSubmit,
}) => {
  const handleFormSubmission = useCallback(
    (values: CreateAttributeFormValues) => onSubmit(sanitize(values)),
    [onSubmit],
  );

  const formik = useFormik<CreateAttributeFormValues>({
    initialValues: {
      name: "",
      type: AttributeType.TEXT,
      unique: false,
      decScale: null,
      dateHideYearPublic: false,
      options: [],
    },
    validationSchema: schema,
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

          if (errors && Object.keys(errors).length > 0) return;

          await formik.submitForm();
        },
      };
    }
  }, [formRef, formik]);

  React.useEffect(() => {
    const t = formik.values.type;

    if (!isOptionsType(t)) formik.setFieldValue("options", []);
    if (t !== AttributeType.NUMBER) formik.setFieldValue("decScale", null);
    if (t !== AttributeType.DATE) formik.setFieldValue("dateHideYearPublic", false);
    if (!isUniqueType(t)) formik.setFieldValue("unique", false);
  }, [formik.values.type]);

  const type = formik.values.type;
  const showOptions = isOptionsType(type);
  const showUnique = isUniqueType(type);
  const isNumber = type === AttributeType.NUMBER;
  const isDate = type === AttributeType.DATE;

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        void formik.submitForm();
      }}
    >
      <div className={styles.row}>
        <label>
          Attribute name
          <Input
            value={formik.values.name}
            onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
            placeholder="e.g., Salary"
            required
            aria-invalid={!!formik.errors.name}
          />
        </label>
        {formik.errors.name && (
          <div className={styles.errorText}>{formik.errors.name}</div>
        )}
      </div>

      <div className={styles.row}>
        <TypeSelect
          value={type}
          onChange={(nextType) => {
            formik.setFieldValue("type", nextType);
            formik.setFieldError("options", undefined);
            formik.setFieldError("decScale", undefined);
            formik.setFieldError("dateHideYearPublic", undefined);
          }}
        />
        {formik.errors.type && (
          <div className={styles.errorText}>{String(formik.errors.type)}</div>
        )}
      </div>

      {showOptions && (
        <OptionsEditor
          type={type}
          options={formik.values.options ?? []}
          onChange={(options) => formik.setFieldValue("options", options)}
        />
      )}

      {isNumber && (
        <NumberScaleRow
          value={formik.values.decScale}
          error={formik.errors.decScale as any}
          onChange={(value) => formik.setFieldValue("decScale", value)}
        />
      )}

      {isDate && (
        <DateSettings
          hideYearPublic={formik.values.dateHideYearPublic ?? false}
          onChangeHideYearPublic={(value) =>
            formik.setFieldValue("dateHideYearPublic", value)
          }
        />
      )}

      {showUnique && (
        <UniqueSelect
          checked={formik.values.unique}
          onChange={(value) => formik.setFieldValue("unique", value)}
        />
      )}
    </form>
  );
};
