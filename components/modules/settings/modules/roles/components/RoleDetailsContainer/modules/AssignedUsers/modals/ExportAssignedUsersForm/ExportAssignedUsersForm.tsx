"use client";

import { FC, FormEvent, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { FileTextIcon, Xls01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Badge } from "@/components/desact/badge";
import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { FieldError } from "@/components/desact/field-error";

export type ExportAssignedUsersFormat = "csv" | "xlsx";

export type ExportAssignedUsersFormValues = {
  format: ExportAssignedUsersFormat;
};

export interface ExportAssignedUsersFormProps {
  isLoading?: boolean;
  onCancelAction: () => void;
  onSubmitAction: (
    values: ExportAssignedUsersFormValues,
  ) => void | Promise<void>;
}

const buildSchema = (t: ReturnType<typeof useTranslations<"settings">>) => yup.object({
  format: yup
    .mixed<ExportAssignedUsersFormat>()
    .oneOf(["csv", "xlsx"])
    .required(t("shared.exportFormat.required")),
});

export const ExportAssignedUsersForm: FC<ExportAssignedUsersFormProps> = ({
  isLoading = false,
  onCancelAction,
  onSubmitAction,
}) => {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const schema = useMemo(() => buildSchema(t), [t]);

  const handleFormSubmission = useCallback(
    (values: ExportAssignedUsersFormValues) => onSubmitAction(values),
    [onSubmitAction],
  );

  const formik = useFormik<ExportAssignedUsersFormValues>({
    initialValues: {
      format: "xlsx",
    },
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

    await formik.submitForm();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <div className="text-body font-medium">{t("shared.exportFormat.format")}</div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => formik.setFieldValue("format", "csv")}
            disabled={isLoading}
            className={[
              "rounded-card border p-4 text-left transition",
              formik.values.format === "csv"
                ? "border-accent-ring bg-accent-subtle"
                : "border-divider hover:bg-subtle",
            ].join(" ")}
 >
            <div className="flex items-center gap-2">
              <Icon icon={FileTextIcon} size="sm" className="text-secondary" />
              <div className="font-medium">CSV</div>
              <Badge variant="neutral" className="ml-auto">
                {t("shared.exportFormat.csvBadge")}
              </Badge>
            </div>

            <div className="mt-2 text-hint text-tertiary">
              {t("shared.exportFormat.csvHint")}
            </div>
          </button>

          <button
            type="button"
            onClick={() => formik.setFieldValue("format", "xlsx")}
            disabled={isLoading}
            className={[
              "rounded-card border p-4 text-left transition",
              formik.values.format === "xlsx"
                ? "border-accent-ring bg-accent-subtle"
                : "border-divider hover:bg-subtle",
            ].join(" ")}
 >
            <div className="flex items-center gap-2">
              <Icon icon={Xls01Icon} size="sm" className="text-secondary" />
              <div className="font-medium">XLSX</div>
              <Badge variant="neutral" className="ml-auto">
                {t("shared.exportFormat.xlsxBadge")}
              </Badge>
            </div>

            <div className="mt-2 text-hint text-tertiary">
              {t("shared.exportFormat.xlsxHint")}
            </div>
          </button>
        </div>

        {formik.errors.format && (
          <FieldError>{String(formik.errors.format)}</FieldError>
        )}

        <div className="rounded-tag bg-subtle px-4 py-3 text-hint text-tertiary">
          {t("roles.exportAssigned.included")}
        </div>
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
          {tCommon("actions.export")}
        </Button>
      </DialogFooter>
    </form>
  );
};
