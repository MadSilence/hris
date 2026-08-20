"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";

import {
  ATTRIBUTE_TYPES_CREATABLE,
  AttributeOption,
  AttributeType,
  isOptionsType,
  isTextConstrainedType,
  isUniqueType,
} from "@/models/attribute";

import { TypeSelect } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/TypeSelect";
import { OptionsEditor } from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/OptionsEditor";
import { SettingToggle } from "@/components/modules/settings/modules/attributes/components/shared/SettingToggle";
import { ObjectFieldsEditor } from "@/components/modules/settings/modules/attributes/components/Attribute/ObjectFieldsEditor/ObjectFieldsEditor";
import {
  AttributeConfigFields,
  AttributeConfig,
} from "@/components/modules/settings/modules/attributes/components/Attribute/AttributeConfigFields";
import { ObjectFieldDef } from "@/models/attribute/objectFields";

export interface CreateAttributeFormProps {
  isLoading?: boolean;
  /** Names already used in this section — checked here so the clash shows before a round-trip. */
  existingNames?: string[];
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: CreateAttributeFormValues) => void | Promise<void>;
}

export type CreateAttributeFormValues = {
  name: string;
  type: AttributeType;
  unique: boolean;
  sensitive: boolean;
  decScale: number | null;
  dateHideYearPublic: boolean;
  options?: AttributeOption[];
  objectFields?: ObjectFieldDef[];
  config: AttributeConfig;
};

function sanitizeConfig(type: AttributeType, c: AttributeConfig): AttributeConfig {
  const isNumber = type === AttributeType.NUMBER;
  const isText = isTextConstrainedType(type);
  const isLongText = type === AttributeType.LONG_TEXT;
  const isDate = type === AttributeType.DATE;
  const isMulti = type === AttributeType.MULTI_SELECT;

  return {
    required: !!c.required,
    description: c.description?.trim() ? c.description.trim() : null,
    defaultValue: (isNumber || isText || isDate) && c.defaultValue ? c.defaultValue : null,
    minValue: isNumber ? c.minValue ?? null : null,
    maxValue: isNumber ? c.maxValue ?? null : null,
    onlyPositive: isNumber ? !!c.onlyPositive : false,
    // Long text carries length limits too (the editor offers them) — stripping them here silently
    // dropped what the admin typed.
    minLength: isText || isLongText ? c.minLength ?? null : null,
    maxLength: isText || isLongText ? c.maxLength ?? null : null,
    regex: isText && c.regex?.trim() ? c.regex.trim() : null,
    minDate: isDate ? c.minDate ?? null : null,
    maxDate: isDate ? c.maxDate ?? null : null,
    minSelect: isMulti ? c.minSelect ?? null : null,
    maxSelect: isMulti ? c.maxSelect ?? null : null,
  };
}

const buildSchema = (existingNames: string[]) => {
  const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()));

  return yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter an attribute name.")
    .min(2)
    .max(120)
    .nonNullable()
    .test(
      "unique",
      "An attribute with this name already exists in this section.",
      (value) => !value || !taken.has(value.trim().toLowerCase()),
    ),
  type: yup
    .mixed<AttributeType>()
    .oneOf(ATTRIBUTE_TYPES_CREATABLE)
    .required("Select attribute type."),
  unique: yup.boolean().required(),
  sensitive: yup.boolean().required(),
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
};

function sanitize(values: CreateAttributeFormValues): CreateAttributeFormValues {
  const type = values.type;

  return {
    name: values.name.trim(),
    type,
    unique: isUniqueType(type) ? values.unique : false,
    sensitive: !!values.sensitive,
    decScale: type === AttributeType.NUMBER ? values.decScale : null,
    dateHideYearPublic:
      type === AttributeType.DATE ? values.dateHideYearPublic ?? false : false,
    options: isOptionsType(type)
      ? (values.options ?? []).filter(
        (o) => o && o.value.trim() !== "" && o.color.trim() !== "",
      )
      : undefined,
    objectFields: type === AttributeType.OBJECT ? (values.objectFields ?? []) : undefined,
    config: sanitizeConfig(type, values.config ?? {}),
  };
}

export const CreateAttributeForm: FC<CreateAttributeFormProps> = ({
  isLoading = false,
  existingNames = [],
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
      sensitive: false,
      decScale: null,
      dateHideYearPublic: false,
      options: [],
      objectFields: [],
      config: {},
    },
    validationSchema: buildSchema(existingNames),
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
    if (t !== AttributeType.OBJECT) void formik.setFieldValue("objectFields", []);
    // Reacts to the picked type only. `formik` is a new object every render, so depending on it
    // would clear these fields continuously.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      {/* Only the fields scroll — the modal keeps one size whatever type is picked. */}
      <div className="-mx-1 min-h-0 flex-1 space-y-6 overflow-y-auto px-1 py-1">
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
          <div className="space-y-1.5">
            <Label>Options</Label>
              <OptionsEditor
              type={type}
              options={formik.values.options ?? []}
              onChange={(options) => formik.setFieldValue("options", options)}
            />
          </div>
        )}

        {isNumber && (
          <div className="space-y-1.5">
            <Label htmlFor="attribute-dec-scale">Decimal scale</Label>
            <Input
              id="attribute-dec-scale"
              type="number"
              min={0}
              value={formik.values.decScale ?? ""}
              disabled={isLoading}
              placeholder="e.g. 2 — leave empty for whole numbers"
              onChange={(e) => {
                const v = e.currentTarget.value;
                void formik.setFieldValue("decScale", v === "" ? null : Number(v));
              }}
              aria-invalid={!!formik.errors.decScale}
            />
            {formik.errors.decScale && (
              <p className="text-sm text-destructive">{String(formik.errors.decScale)}</p>
            )}
          </div>
        )}

        {isDate && (
          <SettingToggle
            label="Hide the year"
            hint="Show only day and month (e.g. for birthdays)."
            checked={formik.values.dateHideYearPublic ?? false}
            disabled={isLoading}
            onCheckedChange={(value) => formik.setFieldValue("dateHideYearPublic", value)}
          />
        )}

        {showUnique && (
          <SettingToggle
            label="Unique value"
            hint="No two people can have the same value."
            checked={formik.values.unique}
            disabled={isLoading}
            onCheckedChange={(value) => formik.setFieldValue("unique", value)}
          />
        )}

        <SettingToggle
          label="Sensitive"
          hint="Nobody gets access automatically, and people without it see a placeholder instead of the value."
          checked={formik.values.sensitive}
          disabled={isLoading}
          onCheckedChange={(value) => formik.setFieldValue("sensitive", value)}
        />

        {type === AttributeType.OBJECT && (
          <ObjectFieldsEditor
            fields={formik.values.objectFields ?? []}
            onChange={(f) => formik.setFieldValue("objectFields", f)}
            disabled={isLoading}
          />
        )}

        <AttributeConfigFields
          type={type}
          value={formik.values.config}
          disabled={isLoading}
          onChange={(patch) =>
            formik.setFieldValue("config", { ...formik.values.config, ...patch })
          }
        />
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
          Create
        </Button>
      </DialogFooter>
    </form>
  );
};
