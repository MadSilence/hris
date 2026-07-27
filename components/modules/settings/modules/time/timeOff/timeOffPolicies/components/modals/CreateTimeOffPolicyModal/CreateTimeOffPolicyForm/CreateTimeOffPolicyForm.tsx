"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { TimeOffPolicyUnit } from "@/api/modules/timeOff/timeOffPolicies/dto";

export type CreateTimeOffPolicyFormValues = {
  name: string;
  description: string;
  unit: TimeOffPolicyUnit;
  paid: boolean;
};

type Props = {
  isLoading?: boolean;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: CreateTimeOffPolicyFormValues) => void | Promise<void>;
};

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter a policy name.")
    .min(2, "Policy name must be at least 2 characters.")
    .max(200, "Policy name must be at most 200 characters."),
  description: yup
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters.")
    .optional(),
  unit: yup
    .mixed<TimeOffPolicyUnit>()
    .oneOf(Object.values(TimeOffPolicyUnit), "Please select a unit.")
    .required("Please select a unit."),
  paid: yup.boolean().required(),
});

export const CreateTimeOffPolicyForm: FC<Props> = ({
  isLoading = false,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: CreateTimeOffPolicyFormValues) =>
      onSubmitAction({ ...values, name: values.name.trim(), description: values.description.trim() }),
    [onSubmitAction],
  );

  const formik = useFormik<CreateTimeOffPolicyFormValues>({
    initialValues: {
      name: "",
      description: "",
      unit: TimeOffPolicyUnit.Days,
      paid: true,
    },
    validationSchema: schema,
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
      <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="policy-name">Name</Label>
            <Input
              id="policy-name"
              value={formik.values.name}
              onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
              placeholder="e.g., Annual Leave"
              required
              disabled={isLoading}
              aria-invalid={!!formik.errors.name}
            />
            {formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy-description">Description</Label>
            <Input
              id="policy-description"
              value={formik.values.description}
              onChange={(e) => formik.setFieldValue("description", e.currentTarget.value)}
              placeholder="Optional"
              disabled={isLoading}
              aria-invalid={!!formik.errors.description}
            />
            {formik.errors.description && (
              <p className="text-sm text-destructive">{formik.errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="policy-unit">Unit</Label>
              <Select
                value={formik.values.unit}
                onValueChange={(value) =>
                  formik.setFieldValue("unit", value as TimeOffPolicyUnit)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="policy-unit" aria-invalid={!!formik.errors.unit}>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TimeOffPolicyUnit.Days}>Days</SelectItem>
                  <SelectItem value={TimeOffPolicyUnit.Hours}>Hours</SelectItem>
                </SelectContent>
              </Select>
              {formik.errors.unit && (
                <p className="text-sm text-destructive">{formik.errors.unit}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy-paid">Pay type</Label>
              <Select
                value={formik.values.paid ? "paid" : "unpaid"}
                onValueChange={(value) =>
                  formik.setFieldValue("paid", value === "paid")
                }
                disabled={isLoading}
              >
                <SelectTrigger id="policy-paid">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="border-t border-brown-100 bg-white px-6 py-4">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={onCancelAction}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          Create policy
        </Button>
      </DialogFooter>
    </form>
  );
};
