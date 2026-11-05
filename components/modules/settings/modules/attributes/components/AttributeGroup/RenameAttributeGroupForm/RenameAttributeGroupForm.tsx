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

export interface RenameAttributeGroupFormProps {
  isLoading?: boolean;
  /** The section's current name — the form edits it rather than starting blank. */
  initialName?: string;
  /** The section's current description; a missing one starts empty. */
  initialDescription?: string | null;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (
    values: RenameAttributeGroupFormValues,
  ) => void | Promise<void>;
}

export type RenameAttributeGroupFormValues = {
  name: string;
  /** Trimmed on submit; an empty one clears the section's description. */
  description: string;
};

type SectionFormTranslator = ReturnType<typeof useTranslations<"settings.attributes.sectionForm">>;

const buildRenameSchema = (t: SectionFormTranslator) => yup.object({
  name: yup
    .string()
    .trim()
    .required(t("nameRequired"))
    .min(3, t("nameMin", { min: 3 }))
    .max(120, t("nameMax", { max: 120 }))
    .nonNullable(t("nameRequired")),
  description: yup
    .string()
    .trim()
    .max(1000, t("descriptionMax", { max: 1000 })),
});

export const RenameAttributeGroupForm: FC<
  RenameAttributeGroupFormProps
> = ({
  isLoading = false,
  initialName = "",
  initialDescription,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const t = useTranslations("settings.attributes.sectionForm");
  const tCommon = useTranslations("common");
  const validationSchema = useMemo(() => buildRenameSchema(t), [t]);
  const startDescription = initialDescription ?? "";

  const handleFormSubmission = useCallback(
    (values: RenameAttributeGroupFormValues) =>
      onSubmitAction({
        name: values.name.trim(),
        description: values.description.trim(),
      }),
    [onSubmitAction],
  );

  const formik = useFormik<RenameAttributeGroupFormValues>({
    initialValues: {
      name: initialName,
      description: startDescription,
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  useEffect(() => {
    onDirtyChangeAction?.(formik.dirty);
  }, [formik.dirty, onDirtyChangeAction]);

  // Submitting an untouched form would only earn "nothing changed" from the backend, so an unchanged
  // Save closes the form instead of sending it.
  const isUnchanged =
    formik.values.name.trim() === initialName.trim()
    && formik.values.description.trim() === startDescription.trim();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;
    if (isUnchanged) {
      onCancelAction();
      return;
    }

    const errors = await formik.validateForm();

    await formik.setTouched(setNestedObjectValues(errors, true), true);

    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <RequiredLabel htmlFor="attribute-group-name" required>{t("name")}</RequiredLabel>

        <Input
          id="attribute-group-name"
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
        <RequiredLabel htmlFor="attribute-group-description">{tCommon("fields.description")}</RequiredLabel>

        <Textarea
          id="attribute-group-description"
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
          {tCommon("actions.save")}
        </Button>
      </DialogFooter>
    </form>
  );
};
