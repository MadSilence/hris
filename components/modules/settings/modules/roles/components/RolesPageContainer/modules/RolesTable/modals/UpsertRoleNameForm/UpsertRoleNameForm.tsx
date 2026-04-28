"use client";

import { FC, FormEvent, useCallback } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";

export type UpsertRoleNameFormValues = {
  name: string;
};

export interface UpsertRoleNameFormProps {
  isLoading?: boolean;
  initialName: string;
  submitText: string;
  onCancelAction: () => void;
  onSubmitAction: (values: UpsertRoleNameFormValues) => void | Promise<void>;
}

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Role name is required.")
    .min(2, "Role name must be at least 2 characters.")
    .max(100, "Role name is too long."),
});

export const UpsertRoleNameForm: FC<UpsertRoleNameFormProps> = ({
  isLoading = false,
  initialName,
  submitText,
  onCancelAction,
  onSubmitAction,
}) => {
  const handleSubmitAction = useCallback(
    (values: UpsertRoleNameFormValues) => {
      return onSubmitAction({
        name: values.name.trim(),
      });
    },
    [onSubmitAction],
  );

  const formik = useFormik<UpsertRoleNameFormValues>({
    initialValues: {
      name: initialName,
    },
    enableReinitialize: true,
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: schema,
    onSubmit: handleSubmitAction,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    await formik.submitForm();
  };

  const canSubmit = formik.values.name.trim().length >= 2;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="role-name">Role name</Label>

        <Input
          id="role-name"
          value={formik.values.name}
          disabled={isLoading}
          aria-invalid={!!formik.errors.name}
          onChange={(e) =>
            formik.setFieldValue("name", e.currentTarget.value)
          }
        />

        {formik.errors.name && (
          <p className="text-sm text-destructive">
            {formik.errors.name}
          </p>
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

        <Button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="bg-brown-600 text-white hover:bg-brown-700"
        >
          {submitText}
        </Button>
      </DialogFooter>
    </form>
  );
};
