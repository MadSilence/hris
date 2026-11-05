"use client";

import { FC, FormEvent, useCallback, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Textarea } from "@/components/desact/textarea";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";

export interface CreateGroupFormProps {
  isLoading?: boolean;
  /** Names already taken — checked here so the clash is shown before a round-trip. */
  existingNames?: string[];
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: CreateGroupFormValues) => void | Promise<void>;
}

export type CreateGroupFormValues = {
  name: string;
  /** Trimmed on submit; an empty one means the section has no description. */
  description: string;
};

type SectionFormTranslator = ReturnType<typeof useTranslations<"settings.attributes.sectionForm">>;

const buildValidationSchema = (existingNames: string[], t: SectionFormTranslator) => {
  const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()));

  return yup.object({
    name: yup
      .string()
      .trim()
      .required(t("nameRequired"))
      .min(3, t("nameMin", { min: 3 }))
      .max(120, t("nameMax", { max: 120 }))
      .nonNullable(t("nameRequired"))
      .test(
        "unique",
        t("nameTaken"),
        (value) => !value || !taken.has(value.trim().toLowerCase()),
      ),
    description: yup
      .string()
      .trim()
      .max(1000, t("descriptionMax", { max: 1000 })),
  });
};

export const CreateGroupForm: FC<CreateGroupFormProps> = ({
  isLoading = false,
  existingNames = [],
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const t = useTranslations("settings.attributes.sectionForm");
  const tCommon = useTranslations("common");
  const validationSchema = useMemo(() => buildValidationSchema(existingNames, t), [existingNames, t]);
  const handleFormSubmission = useCallback(
    (values: CreateGroupFormValues) =>
      onSubmitAction({
        name: values.name.trim(),
        description: values.description.trim(),
      }),
    [onSubmitAction],
  );

  const formik = useFormik<CreateGroupFormValues>({
    initialValues: {
      name: "",
      description: "",
    },
    validationSchema,
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

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <RequiredLabel htmlFor="group-name" required>{t("name")}</RequiredLabel>

        <Input
          id="group-name"
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

      <div className="mt-4 space-y-2">
        <RequiredLabel htmlFor="group-description">{tCommon("fields.description")}</RequiredLabel>

        <Textarea
          id="group-description"
          rows={3}
          value={formik.values.description}
          onChange={(e) => formik.setFieldValue("description", e.currentTarget.value)}
          disabled={isLoading}
          aria-invalid={!!formik.errors.description}
        />

        {formik.errors.description && (
          <FieldError>{formik.errors.description}</FieldError>
        )}
      </div>

      <DialogFooter className="mt-6 border-t border-divider pt-4">
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading}
          onClick={onCancelAction}
        >
          {tCommon("actions.cancel")}
        </Button>

        <Button type="submit" disabled={isLoading}>
          {tCommon("actions.add")}
        </Button>
      </DialogFooter>
    </form>
  );
};
