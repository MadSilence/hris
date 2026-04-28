"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";

export type CreateLegalEntityFormValues = {
  name: string;
  description: string;
  registrationNumber: string;
  taxId: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;
};

export interface CreateLegalEntityFormProps {
  isLoading?: boolean;
  initialValues?: Partial<CreateLegalEntityFormValues>;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (
    values: CreateLegalEntityFormValues,
  ) => void | Promise<void>;
}

const createSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter a legal entity name.")
    .min(2, "Legal entity name must be at least 2 characters.")
    .max(200, "Legal entity name must be at most 200 characters."),
  description: yup
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters.")
    .optional(),
  registrationNumber: yup
    .string()
    .trim()
    .required("Please enter a registration number.")
    .max(120, "Registration number must be at most 120 characters."),
  taxId: yup
    .string()
    .trim()
    .required("Please enter a tax ID.")
    .max(120, "Tax ID must be at most 120 characters."),
  country: yup
    .string()
    .trim()
    .required("Please enter a country.")
    .max(120, "Country must be at most 120 characters."),
  city: yup
    .string()
    .trim()
    .required("Please enter a city.")
    .max(120, "City must be at most 120 characters."),
  street: yup
    .string()
    .trim()
    .max(200, "Street must be at most 200 characters.")
    .optional(),
  building: yup
    .string()
    .trim()
    .max(50, "Building must be at most 50 characters.")
    .optional(),
  postCode: yup
    .string()
    .trim()
    .max(50, "Post code must be at most 50 characters.")
    .optional(),
});

function sanitize(
  values: CreateLegalEntityFormValues,
): CreateLegalEntityFormValues {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    registrationNumber: values.registrationNumber.trim(),
    taxId: values.taxId.trim(),
    country: values.country.trim(),
    city: values.city.trim(),
    street: values.street.trim(),
    building: values.building.trim(),
    postCode: values.postCode.trim(),
  };
}

export const CreateLegalEntityForm: FC<CreateLegalEntityFormProps> = ({
  isLoading = false,
  initialValues,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: CreateLegalEntityFormValues) => onSubmitAction(sanitize(values)),
    [onSubmitAction],
  );

  const formik = useFormik<CreateLegalEntityFormValues>({
    initialValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      registrationNumber: initialValues?.registrationNumber ?? "",
      taxId: initialValues?.taxId ?? "",
      country: initialValues?.country ?? "",
      city: initialValues?.city ?? "",
      street: initialValues?.street ?? "",
      building: initialValues?.building ?? "",
      postCode: initialValues?.postCode ?? "",
    },
    enableReinitialize: true,
    validationSchema: createSchema,
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
      <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Legal entity details</h3>

          <div className="space-y-2">
            <Label htmlFor="legal-entity-name">Name</Label>
            <Input
              id="legal-entity-name"
              value={formik.values.name}
              onChange={(e) =>
                formik.setFieldValue("name", e.currentTarget.value)
              }
              placeholder="e.g., Acme LLC"
              required
              disabled={isLoading}
              aria-invalid={!!formik.errors.name}
            />
            {formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal-entity-description">Description</Label>
            <Input
              id="legal-entity-description"
              value={formik.values.description}
              onChange={(e) =>
                formik.setFieldValue("description", e.currentTarget.value)
              }
              placeholder="Optional"
              disabled={isLoading}
              aria-invalid={!!formik.errors.description}
            />
            {formik.errors.description && (
              <p className="text-sm text-destructive">
                {formik.errors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal-entity-registration-number">
              Registration number
            </Label>
            <Input
              id="legal-entity-registration-number"
              value={formik.values.registrationNumber}
              onChange={(e) =>
                formik.setFieldValue(
                  "registrationNumber",
                  e.currentTarget.value,
                )
              }
              placeholder="Registration number"
              required
              disabled={isLoading}
              aria-invalid={!!formik.errors.registrationNumber}
            />
            {formik.errors.registrationNumber && (
              <p className="text-sm text-destructive">
                {formik.errors.registrationNumber}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal-entity-tax-id">Tax ID</Label>
            <Input
              id="legal-entity-tax-id"
              value={formik.values.taxId}
              onChange={(e) =>
                formik.setFieldValue("taxId", e.currentTarget.value)
              }
              placeholder="Tax identification number"
              required
              disabled={isLoading}
              aria-invalid={!!formik.errors.taxId}
            />
            {formik.errors.taxId && (
              <p className="text-sm text-destructive">{formik.errors.taxId}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Address</h3>

          <div className="space-y-2">
            <Label htmlFor="legal-entity-country">Country</Label>
            <Input
              id="legal-entity-country"
              value={formik.values.country}
              onChange={(e) =>
                formik.setFieldValue("country", e.currentTarget.value)
              }
              placeholder="Country"
              required
              disabled={isLoading}
              aria-invalid={!!formik.errors.country}
            />
            {formik.errors.country && (
              <p className="text-sm text-destructive">
                {formik.errors.country}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal-entity-city">City</Label>
            <Input
              id="legal-entity-city"
              value={formik.values.city}
              onChange={(e) =>
                formik.setFieldValue("city", e.currentTarget.value)
              }
              placeholder="City"
              required
              disabled={isLoading}
              aria-invalid={!!formik.errors.city}
            />
            {formik.errors.city && (
              <p className="text-sm text-destructive">{formik.errors.city}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="legal-entity-street">Street</Label>
              <Input
                id="legal-entity-street"
                value={formik.values.street}
                onChange={(e) =>
                  formik.setFieldValue("street", e.currentTarget.value)
                }
                placeholder="Optional"
                disabled={isLoading}
                aria-invalid={!!formik.errors.street}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal-entity-building">Building</Label>
              <Input
                id="legal-entity-building"
                value={formik.values.building}
                onChange={(e) =>
                  formik.setFieldValue("building", e.currentTarget.value)
                }
                placeholder="Optional"
                disabled={isLoading}
                aria-invalid={!!formik.errors.building}
              />
            </div>
          </div>

          {(formik.errors.street || formik.errors.building) && (
            <div className="space-y-1">
              {formik.errors.street && (
                <p className="text-sm text-destructive">
                  {formik.errors.street}
                </p>
              )}
              {formik.errors.building && (
                <p className="text-sm text-destructive">
                  {formik.errors.building}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="legal-entity-post-code">Post code</Label>
            <Input
              id="legal-entity-post-code"
              value={formik.values.postCode}
              onChange={(e) =>
                formik.setFieldValue("postCode", e.currentTarget.value)
              }
              placeholder="Optional"
              disabled={isLoading}
              aria-invalid={!!formik.errors.postCode}
            />
            {formik.errors.postCode && (
              <p className="text-sm text-destructive">
                {formik.errors.postCode}
              </p>
            )}
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

        <Button type="submit" disabled={isLoading}>
          Create
        </Button>
      </DialogFooter>
    </form>
  );
};
