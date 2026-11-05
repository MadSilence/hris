"use client";

import { useTranslations } from "next-intl";
import { FC, FormEvent, useCallback, useEffect, useMemo } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { JobFamily, JobLevelGroup } from "@/models/job";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FieldError } from "@/components/desact/field-error";

const DESCRIPTION_MAX = 300;
const CODE_MAX = 64;

/** Radix cannot hold an empty string as an item value, so "no level" needs a sentinel. */
export const NO_LEVEL = "__none__";

export type JobFormValues = {
  name: string;
  familyId: string;
  levelId: string;
  code: string;
  description: string;
};

export interface JobFormProps {
  isLoading?: boolean;
  submitLabel: string;
  initialValues?: Partial<JobFormValues>;
  families: JobFamily[];
  levelGroups: JobLevelGroup[];
  isLevelsLoading?: boolean;
  /**
   * Codes already used elsewhere in the company. Checked here so a clash shows before a round-trip;
   * the backend still owns the rule.
   */
  takenCodes?: string[];
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: JobFormValues) => void | Promise<void>;
}

type JobCatalogTranslator = ReturnType<typeof useTranslations<"structure.jobCatalog">>;

const buildValidationSchema = (takenCodes: string[], t: JobCatalogTranslator) => {
  const taken = new Set(takenCodes.map((c) => c.trim().toLowerCase()));

  return yup.object({
    name: yup
      .string()
      .trim()
      .required(t("validation.jobNameRequired"))
      .max(255, t("validation.nameMax")),
    familyId: yup.string().required(t("validation.familyRequired")),
    code: yup
      .string()
      .trim()
      .max(CODE_MAX, t("validation.codeMax"))
      .test(
        "unique",
        t("validation.codeTaken"),
        (value) => !value || !taken.has(value.trim().toLowerCase()),
      ),
    description: yup
      .string()
      .trim()
      .max(DESCRIPTION_MAX, t("validation.descriptionMax")),
  });
};

export const JobForm: FC<JobFormProps> = ({
  isLoading = false,
  submitLabel,
  initialValues,
  families,
  levelGroups,
  isLevelsLoading = false,
  takenCodes = [],
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const t = useTranslations("structure.jobCatalog");
  const tShared = useTranslations("structure.shared");
  const tCommon = useTranslations("common");
  const handleFormSubmission = useCallback(
    (values: JobFormValues) =>
      onSubmitAction({
        ...values,
        name: values.name.trim(),
        code: values.code.trim(),
        description: values.description.trim(),
      }),
    [onSubmitAction],
  );

  const formik = useFormik<JobFormValues>({
    initialValues: {
      name: initialValues?.name ?? "",
      familyId: initialValues?.familyId ?? "",
      levelId: initialValues?.levelId ?? NO_LEVEL,
      code: initialValues?.code ?? "",
      description: initialValues?.description ?? "",
    },
    validationSchema: buildValidationSchema(takenCodes, t),
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  useEffect(() => {
    onDirtyChangeAction?.(formik.dirty);
  }, [formik.dirty, onDirtyChangeAction]);

  // Archived families are still listed on the catalogue screen, but a new position cannot be put
  // into one — it would be born unusable.
  const selectableFamilies = useMemo(
    () => families.filter((f) => !f.archived || f.id === initialValues?.familyId),
    [families, initialValues?.familyId],
  );

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
          <RequiredLabel htmlFor="job-name" required>{tCommon("fields.name")}</RequiredLabel>

          <Input
            id="job-name"
            value={formik.values.name}
            onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
            required
            disabled={isLoading}
            aria-invalid={!!formik.errors.name}
          />

          {formik.errors.name && <FieldError>{formik.errors.name}</FieldError>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <RequiredLabel htmlFor="job-family" required>{t("jobForm.family")}</RequiredLabel>

            <SearchableSelect
              id="job-family"
              options={selectableFamilies.map((family) => ({ value: family.id, label: family.name }))}
              value={formik.values.familyId || null}
              onChange={(value) => formik.setFieldValue("familyId", value ?? "")}
              placeholder={t("jobForm.pickFamily")}
              disabled={isLoading}
              aria-invalid={!!formik.errors.familyId}
              clearable={false}
            />

            {formik.errors.familyId && (
              <FieldError>{formik.errors.familyId}</FieldError>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-level">{t("columns.level")}</Label>

            <SearchableSelect
              id="job-level"
              options={[
                { value: NO_LEVEL, label: tCommon("values.none") },
                ...levelGroups.flatMap((group) =>
                  group.levels.map((level) => ({ value: level.id, label: level.name, group: group.name })),
                ),
              ]}
              value={formik.values.levelId || null}
              onChange={(value) => formik.setFieldValue("levelId", value ?? NO_LEVEL)}
              placeholder={isLevelsLoading ? tCommon("states.loading") : tCommon("values.none")}
              disabled={isLoading || isLevelsLoading}
              clearable={false}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-code">{tShared("code")}</Label>

          <Input
            id="job-code"
            value={formik.values.code}
            onChange={(e) => formik.setFieldValue("code", e.currentTarget.value)}
            maxLength={CODE_MAX}
            disabled={isLoading}
            aria-invalid={!!formik.errors.code}
          />

          {formik.errors.code && <FieldError>{formik.errors.code}</FieldError>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-description">{tCommon("fields.description")}</Label>

          <Textarea
            id="job-description"
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
