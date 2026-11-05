"use client";

import { FC, FormEvent, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";

export type RenameDocumentsFolderFormValues = {
  name: string;
};

export interface RenameDocumentsFolderFormProps {
  isLoading?: boolean;
  folderName?: string;
  onCancelAction: () => void;
  onSubmitAction: (
    values: RenameDocumentsFolderFormValues,
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
  values: RenameDocumentsFolderFormValues,
): RenameDocumentsFolderFormValues {
  return {
    name: values.name.trim(),
  };
}

export const RenameDocumentsFolderForm: FC<
  RenameDocumentsFolderFormProps
> = ({
  isLoading = false,
  folderName,
  onCancelAction,
  onSubmitAction,
}) => {
  const t = useTranslations("organization");
  const tCommon = useTranslations("common");
  const schema = useMemo(() => buildSchema(t), [t]);
  const normalizedInitialName = folderName ?? "";

  const handleFormSubmission = useCallback(
    (values: RenameDocumentsFolderFormValues) =>
      onSubmitAction(sanitize(values)),
    [onSubmitAction],
  );

  const formik = useFormik<RenameDocumentsFolderFormValues>({
    initialValues: {
      name: normalizedInitialName,
    },
    enableReinitialize: true,
    validationSchema: schema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: handleFormSubmission,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    const errors = await formik.validateForm();

    await formik.setTouched(setNestedObjectValues(errors, true), true);

    if (Object.keys(errors).length > 0) return;

    // The same name: nothing to rename, and the dialog closes as if it had.
    if (formik.values.name.trim() === normalizedInitialName.trim()) {
      onCancelAction();
      return;
    }

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
          disabled={isLoading}
          aria-invalid={!!formik.errors.name}
        />

        {formik.errors.name && (
          <FieldError>{formik.errors.name}</FieldError>
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
          {tCommon("actions.save")}
        </Button>
      </DialogFooter>
    </form>
  );
};
