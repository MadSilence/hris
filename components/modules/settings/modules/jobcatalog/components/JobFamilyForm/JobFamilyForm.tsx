"use client";

import { useTranslations } from "next-intl";
import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";

/** Matches the column and the backend's JobTextRules. */
const DESCRIPTION_MAX = 300;

export type JobFamilyFormValues = {
  name: string;
  description: string;
};

export interface JobFamilyFormProps {
  isLoading?: boolean;
  submitLabel: string;
  initialValues?: Partial<JobFamilyFormValues>;
  /** Names already taken — checked here so the clash shows before a round-trip. */
  existingNames?: string[];
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: JobFamilyFormValues) => void | Promise<void>;
}

type JobCatalogTranslator = ReturnType<typeof useTranslations<"structure.jobCatalog">>;

const buildValidationSchema = (existingNames: string[], t: JobCatalogTranslator) => {
  const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()));

  return yup.object({
    name: yup
      .string()
      .trim()
      .required(t("validation.familyNameRequired"))
      .max(255, t("validation.nameMax"))
      .test(
        "unique",
        t("validation.familyNameTaken"),
        (value) => !value || !taken.has(value.trim().toLowerCase()),
      ),
    description: yup
      .string()
      .trim()
      .max(DESCRIPTION_MAX, t("validation.descriptionMax")),
  });
};

export const JobFamilyForm: FC<JobFamilyFormProps> = ({
  isLoading = false,
  submitLabel,
  initialValues,
  existingNames = [],
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const t = useTranslations("structure.jobCatalog");
  const tCommon = useTranslations("common");
  const handleFormSubmission = useCallback(
    (values: JobFamilyFormValues) =>
      onSubmitAction({
        name: values.name.trim(),
        description: values.description.trim(),
      }),
    [onSubmitAction],
  );

  const formik = useFormik<JobFamilyFormValues>({
    initialValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
    },
    validationSchema: buildValidationSchema(existingNames, t),
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

  const remaining = DESCRIPTION_MAX - formik.values.description.length;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <div className="space-y-2">
          <RequiredLabel htmlFor="job-family-name" required>{tCommon("fields.name")}</RequiredLabel>

          <Input
            id="job-family-name"
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

        <div className="space-y-2">
          <Label htmlFor="job-family-description">{tCommon("fields.description")}</Label>

          <Textarea
            id="job-family-description"
            value={formik.values.description}
            onChange={(e) => formik.setFieldValue("description", e.currentTarget.value)}
            rows={3}
            maxLength={DESCRIPTION_MAX}
            disabled={isLoading}
            aria-invalid={!!formik.errors.description}
          />

          <div className="flex items-center justify-between">
            <FieldError>{formik.errors.description ?? ""}</FieldError>
            <p className="text-hint text-tertiary">{t("charactersLeft", { count: remaining })}</p>
          </div>
        </div>
      </div>

      <DialogFooter className="mt-6 border-t border-divider pt-4">
        <Button type="button" variant="secondary" disabled={isLoading} onClick={onCancelAction}>
          {tCommon("actions.cancel")}
        </Button>

        <Button type="submit" disabled={isLoading}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};
