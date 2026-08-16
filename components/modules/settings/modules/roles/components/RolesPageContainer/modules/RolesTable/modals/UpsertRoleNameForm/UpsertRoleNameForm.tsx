"use client";

import { FC, FormEvent, useCallback, useMemo } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Textarea } from "@/public/desact/src/components/ui/textarea";

export type UpsertRoleNameFormValues = {
  name: string;
  description?: string;
};

export interface UpsertRoleNameFormProps {
  isLoading?: boolean;
  initialName: string;
  /** Only shown when editing: a duplicate inherits the source role's description. */
  initialDescription?: string;
  showDescription?: boolean;
  /** Names already in use, this role's own excluded — a collision is caught here, not by R00001. */
  takenNames?: string[];
  /**
   * Editing an existing role: submitting an untouched form would only earn an R00002. A duplicate
   * starts pre-filled and is meant to be submitted as is, so it does not want this.
   */
  blockUnchanged?: boolean;
  submitText: string;
  onCancelAction: () => void;
  onSubmitAction: (values: UpsertRoleNameFormValues) => void | Promise<void>;
}

const buildSchema = (takenNames: string[]) => {
  const taken = new Set(takenNames.map((n) => n.trim().toLowerCase()));

  return yup.object({
    name: yup
      .string()
      .trim()
      .required("Role name is required.")
      .min(2, "Role name must be at least 2 characters.")
      .max(100, "Role name is too long.")
      .test(
        "unique",
        "A role with this name already exists.",
        (value) => !value || !taken.has(value.trim().toLowerCase()),
      ),
  });
};

export const UpsertRoleNameForm: FC<UpsertRoleNameFormProps> = ({
  isLoading = false,
  initialName,
  initialDescription = "",
  showDescription = false,
  takenNames = [],
  blockUnchanged = false,
  submitText,
  onCancelAction,
  onSubmitAction,
}) => {
  const schema = useMemo(() => buildSchema(takenNames), [takenNames]);
  const handleSubmitAction = useCallback(
    (values: UpsertRoleNameFormValues) => {
      return onSubmitAction({
        name: values.name.trim(),
        description: showDescription ? (values.description ?? "").trim() : undefined,
      });
    },
    [onSubmitAction, showDescription],
  );

  const formik = useFormik<UpsertRoleNameFormValues>({
    initialValues: {
      name: initialName,
      description: initialDescription,
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

  // "Nothing to update" is not worth a round trip: the backend answers R00002 and the user learns
  // only that their no-op failed. Better to leave the button off until something actually changed.
  const isUnchanged =
    blockUnchanged
    && formik.values.name.trim() === initialName.trim()
    && (formik.values.description ?? "").trim() === initialDescription.trim();

  const canSubmit = formik.values.name.trim().length >= 2 && !isUnchanged;

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

      {showDescription && (
        <div className="mt-4 space-y-2">
          <Label htmlFor="role-description">Description</Label>

          <Textarea
            id="role-description"
            rows={3}
            value={formik.values.description ?? ""}
            disabled={isLoading}
            placeholder="What is this role for?"
            onChange={(e) => formik.setFieldValue("description", e.currentTarget.value)}
          />
        </div>
      )}

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
