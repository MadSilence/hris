"use client";

import { FC, FormEvent, useCallback } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";

export type ExportRolesFormat = "csv" | "xlsx";

export type ExportRolesFormValues = {
  format: ExportRolesFormat;
};

export interface ExportRolesFormProps {
  isLoading?: boolean;
  onCancelAction: () => void;
  onSubmitAction: (values: ExportRolesFormValues) => void | Promise<void>;
}

const schema = yup.object({
  format: yup
    .mixed<ExportRolesFormat>()
    .oneOf(["csv", "xlsx"])
    .required("Select export format."),
});

export const ExportRolesForm: FC<ExportRolesFormProps> = ({
  isLoading = false,
  onCancelAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: ExportRolesFormValues) => onSubmitAction(values),
    [onSubmitAction],
  );

  const formik = useFormik<ExportRolesFormValues>({
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
        <div className="text-sm font-medium">Format</div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => formik.setFieldValue("format", "csv")}
            disabled={isLoading}
            className={[
              "rounded-lg border p-4 text-left transition",
              formik.values.format === "csv"
                ? "border-brown-600 bg-brown-50"
                : "border-brown-200 hover:bg-brown-50",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brown-600"/>
              <div className="font-medium">CSV</div>
              <Badge variant="secondary" className="ml-auto">
                Lightweight
              </Badge>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Best for simple imports and quick viewing.
            </div>
          </button>

          <button
            type="button"
            onClick={() => formik.setFieldValue("format", "xlsx")}
            disabled={isLoading}
            className={[
              "rounded-lg border p-4 text-left transition",
              formik.values.format === "xlsx"
                ? "border-brown-600 bg-brown-50"
                : "border-brown-200 hover:bg-brown-50",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-brown-600"/>
              <div className="font-medium">XLSX</div>
              <Badge variant="secondary" className="ml-auto">
                Recommended
              </Badge>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Better for structured data and multiple sheets.
            </div>
          </button>
        </div>

        {formik.errors.format && (
          <p className="text-sm text-destructive">
            {String(formik.errors.format)}
          </p>
        )}

        <div className="rounded-md bg-brown-50 px-4 py-3 text-xs text-muted-foreground">
          Included: role name, status, system flag, permissions, assigned users.
        </div>
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

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-brown-600 text-white hover:bg-brown-700"
        >
          Export
        </Button>
      </DialogFooter>
    </form>
  );
};
