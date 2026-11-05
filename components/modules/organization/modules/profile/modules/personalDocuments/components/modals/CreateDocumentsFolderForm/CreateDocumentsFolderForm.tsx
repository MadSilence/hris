"use client";

import { FC, FormEvent, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";

export type CreateDocumentsFolderFormValues = {
  name: string;
};

export interface CreateDocumentsFolderFormProps {
  isLoading?: boolean;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (
    values: CreateDocumentsFolderFormValues,
  ) => void | Promise<void>;
}

type Translator = ReturnType<typeof useTranslations<"organization">>;

const buildSchema = (t: Translator) =>
  yup.object({
    name: yup
      .string()
      .trim()
      .required(t("documents.folderForm.required"))
      .min(2, t("documents.folderForm.min"))
      .max(120, t("documents.folderForm.max")),
  });

function sanitize(
  values: CreateDocumentsFolderFormValues,
): CreateDocumentsFolderFormValues {
  return {
    name: values.name.trim(),
  };
}

export const CreateDocumentsFolderForm: FC<
  CreateDocumentsFolderFormProps
> = ({
  isLoading = false,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const schema = useMemo(() => buildSchema(t), [t]);

  const formik = useFormik<CreateDocumentsFolderFormValues>({
    initialValues: {
      name: "",
    },
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => onSubmitAction(sanitize(values)),
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
        <RequiredLabel htmlFor="folder-name" required>{t("documents.folderForm.label")}</RequiredLabel>

        <Input
          id="folder-name"
          value={formik.values.name}
          onChange={(e) =>
            formik.setFieldValue("name", e.currentTarget.value)
          }
          required
          disabled={isLoading}
          aria-invalid={!!formik.errors.name}
        />

        {formik.errors.name ? (
          <FieldError>{formik.errors.name}</FieldError>
        ) : (
          <p className="text-hint text-tertiary">
            {t("documents.folderForm.hint")}
          </p>
        )}
      </div>

      <DialogFooter className="mt-8">
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading}
          onClick={onCancelAction}
 >
          {tCommon("actions.cancel")}
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
 >
          {tCommon("actions.create")}
        </Button>
      </DialogFooter>
    </form>
  );
};
