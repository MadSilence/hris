"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";

import { ALL_ATTRIBUTE_TYPES, AttributeOption, AttributeType, isOptionsType, isUniqueType, } from "@/models/attribute";

import { TypeSelect } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/TypeSelect";
import { OptionsEditor } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/OptionsEditor";
import { NumberScaleRow } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/NumberScaleRow";
import { DateSettings } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/DateSettings";
import { UniqueSelect } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/UniqueSelect";

export interface CreateAttributeFormProps {
  isLoading?: boolean;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: CreateAttributeFormValues) => void | Promise<void>;
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
  type: yup
    .mixed<AttributeType>()
    .oneOf(ALL_ATTRIBUTE_TYPES)
    .required("Select attribute type."),
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
    name: values.name.trim(),
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

export const CreateAttributeForm: FC<CreateAttributeFormProps> = ({
  isLoading = false,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: CreateAttributeFormValues) => onSubmitAction(sanitize(values)),
    [onSubmitAction],
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
    onDirtyChangeAction?.(formik.dirty);
  }, [formik.dirty, onDirtyChangeAction]);

  useEffect(() => {
    const t = formik.values.type;

    if (!isOptionsType(t)) void formik.setFieldValue("options", []);
    if (t !== AttributeType.NUMBER) void formik.setFieldValue("decScale", null);
    if (t !== AttributeType.DATE) {
      void formik.setFieldValue("dateHideYearPublic", false);
    }
    if (!isUniqueType(t)) void formik.setFieldValue("unique", false);
  }, [formik.values.type]);

  const type = formik.values.type;
  const showOptions = isOptionsType(type);
  const showUnique = isUniqueType(type);
  const isNumber = type === AttributeType.NUMBER;
  const isDate = type === AttributeType.DATE;

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
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="attribute-name">Attribute name</Label>
          <Input
            id="attribute-name"
            value={formik.values.name}
            onChange={(e) =>
              formik.setFieldValue("name", e.currentTarget.value)
            }
            placeholder="e.g., Salary"
            required
            disabled={isLoading}
            aria-invalid={!!formik.errors.name}
          />
          {formik.errors.name && (
            <p className="text-sm text-destructive">{formik.errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <TypeSelect
            value={type}
            onChange={(nextType) => {
              void formik.setFieldValue("type", nextType);
              formik.setFieldError("options", undefined);
              formik.setFieldError("decScale", undefined);
              formik.setFieldError("dateHideYearPublic", undefined);
            }}
          />
          {formik.errors.type && (
            <p className="text-sm text-destructive">
              {String(formik.errors.type)}
            </p>
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
            error={formik.errors.decScale as string | undefined}
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
            onChangeAction={(value) => formik.setFieldValue("unique", value)}
          />
        )}
      </div>

      <DialogFooter className="mt-8">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={onCancelAction}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isLoading}>
          Create
        </Button>
      </DialogFooter>
    </form>
  );
};
