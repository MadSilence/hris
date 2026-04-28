"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";

export type OfficeDetailsFormValues = {
  name: string;
  description: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;
};

export interface OfficeDetailsFormProps {
  isLoading?: boolean;
  initialValues: OfficeDetailsFormValues;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: OfficeDetailsFormValues) => void | Promise<void>;
}

const schema = yup.object({
  name: yup.string().trim().required("Please enter an office name.").min(2).max(200),
  description: yup.string().trim().max(1000).optional(),
  email: yup.string().trim().email("Please enter a valid email.").max(200).optional(),
  phone: yup.string().trim().max(50).optional(),
  country: yup.string().trim().required("Please enter a country.").max(120),
  city: yup.string().trim().required("Please enter a city.").max(120),
  street: yup.string().trim().max(200).optional(),
  building: yup.string().trim().max(50).optional(),
  postCode: yup.string().trim().max(50).optional(),
});

function sanitize(values: OfficeDetailsFormValues): OfficeDetailsFormValues {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    country: values.country.trim(),
    city: values.city.trim(),
    street: values.street.trim(),
    building: values.building.trim(),
    postCode: values.postCode.trim(),
  };
}

export const OfficeDetailsForm: FC<OfficeDetailsFormProps> = ({
  isLoading = false,
  initialValues,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: OfficeDetailsFormValues) => onSubmitAction(sanitize(values)),
    [onSubmitAction],
  );

  const formik = useFormik<OfficeDetailsFormValues>({
    initialValues,
    enableReinitialize: true,
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

    if (isLoading || !formik.dirty) return;

    const errors = await formik.validateForm();

    await formik.setTouched(setNestedObjectValues(errors, true), true);

    if (Object.keys(errors).length > 0) return;

    await formik.submitForm();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Office details</h3>

          <div className="space-y-2">
            <Label htmlFor="office-name">Name</Label>
            <Input
              id="office-name"
              value={formik.values.name}
              onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
              disabled={isLoading}
              aria-invalid={!!formik.errors.name}
            />
            {formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-description">Description</Label>
            <Input
              id="office-description"
              value={formik.values.description}
              onChange={(e) =>
                formik.setFieldValue("description", e.currentTarget.value)
              }
              disabled={isLoading}
              aria-invalid={!!formik.errors.description}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-email">Email</Label>
            <Input
              id="office-email"
              value={formik.values.email}
              onChange={(e) => formik.setFieldValue("email", e.currentTarget.value)}
              disabled={isLoading}
              aria-invalid={!!formik.errors.email}
            />
            {formik.errors.email && (
              <p className="text-sm text-destructive">{formik.errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-phone">Phone</Label>
            <Input
              id="office-phone"
              value={formik.values.phone}
              onChange={(e) => formik.setFieldValue("phone", e.currentTarget.value)}
              disabled={isLoading}
              aria-invalid={!!formik.errors.phone}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Address</h3>

          <div className="space-y-2">
            <Label htmlFor="office-country">Country</Label>
            <Input
              id="office-country"
              value={formik.values.country}
              onChange={(e) =>
                formik.setFieldValue("country", e.currentTarget.value)
              }
              disabled={isLoading}
              aria-invalid={!!formik.errors.country}
            />
            {formik.errors.country && (
              <p className="text-sm text-destructive">{formik.errors.country}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-city">City</Label>
            <Input
              id="office-city"
              value={formik.values.city}
              onChange={(e) => formik.setFieldValue("city", e.currentTarget.value)}
              disabled={isLoading}
              aria-invalid={!!formik.errors.city}
            />
            {formik.errors.city && (
              <p className="text-sm text-destructive">{formik.errors.city}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="office-street">Street</Label>
              <Input
                id="office-street"
                value={formik.values.street}
                onChange={(e) =>
                  formik.setFieldValue("street", e.currentTarget.value)
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="office-building">Building</Label>
              <Input
                id="office-building"
                value={formik.values.building}
                onChange={(e) =>
                  formik.setFieldValue("building", e.currentTarget.value)
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-post-code">Post code</Label>
            <Input
              id="office-post-code"
              value={formik.values.postCode}
              onChange={(e) =>
                formik.setFieldValue("postCode", e.currentTarget.value)
              }
              disabled={isLoading}
            />
          </div>
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

        <Button type="submit" disabled={isLoading || !formik.dirty}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
};
