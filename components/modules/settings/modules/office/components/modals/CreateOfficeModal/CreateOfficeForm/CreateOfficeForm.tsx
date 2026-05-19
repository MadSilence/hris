"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";

export type CreateOfficeFormValues = {
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

export interface CreateOfficeFormProps {
  isLoading?: boolean;
  initialValues?: Partial<CreateOfficeFormValues>;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: CreateOfficeFormValues) => void | Promise<void>;
}

const getInitialValues = (
  initialValues?: Partial<CreateOfficeFormValues>,
): CreateOfficeFormValues => ({
  name: initialValues?.name ?? "",
  description: initialValues?.description ?? "",
  email: initialValues?.email ?? "",
  phone: initialValues?.phone ?? "",
  country: initialValues?.country ?? "",
  city: initialValues?.city ?? "",
  street: initialValues?.street ?? "",
  building: initialValues?.building ?? "",
  postCode: initialValues?.postCode ?? "",
});

const sanitize = (values: CreateOfficeFormValues): CreateOfficeFormValues => ({
  name: values.name.trim(),
  description: values.description.trim(),
  email: values.email.trim(),
  phone: values.phone.trim(),
  country: values.country.trim(),
  city: values.city.trim(),
  street: values.street.trim(),
  building: values.building.trim(),
  postCode: values.postCode.trim(),
});

export const CreateOfficeForm: FC<CreateOfficeFormProps> = ({
  isLoading = false,
  initialValues,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const handleFormSubmission = useCallback(
    (values: CreateOfficeFormValues) => onSubmitAction(sanitize(values)),
    [onSubmitAction],
  );

  const formik = useFormik<CreateOfficeFormValues>({
    initialValues: getInitialValues(initialValues),
    enableReinitialize: true,
    validationSchema: createOfficeSchema,
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
      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">
            Office details
          </h3>

          <div className="space-y-2">
            <Label htmlFor="office-name">Name</Label>
            <Input
              id="office-name"
              value={formik.values.name}
              onChange={(e) =>
                formik.setFieldValue("name", e.currentTarget.value)
              }
              placeholder="e.g., London HQ"
              required
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="office-email">Email</Label>
              <Input
                id="office-email"
                type="email"
                value={formik.values.email}
                onChange={(e) =>
                  formik.setFieldValue("email", e.currentTarget.value)
                }
                placeholder="Optional"
                disabled={isLoading}
                aria-invalid={!!formik.errors.email}
              />
              {formik.errors.email && (
                <p className="text-sm text-destructive">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="office-phone">Phone</Label>
              <Input
                id="office-phone"
                value={formik.values.phone}
                onChange={(e) =>
                  formik.setFieldValue("phone", e.currentTarget.value)
                }
                placeholder="Optional"
                disabled={isLoading}
                aria-invalid={!!formik.errors.phone}
              />
              {formik.errors.phone && (
                <p className="text-sm text-destructive">
                  {formik.errors.phone}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Address</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="office-country">Country</Label>
              <Input
                id="office-country"
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
              <Label htmlFor="office-city">City</Label>
              <Input
                id="office-city"
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="office-street">Street</Label>
              <Input
                id="office-street"
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
              <Label htmlFor="office-building">Building</Label>
              <Input
                id="office-building"
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

          <div className="space-y-2">
            <Label htmlFor="office-post-code">Post code</Label>
            <Input
              id="office-post-code"
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
        </section>
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

const createOfficeSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter an office name.")
    .min(2)
    .max(200),
  description: yup.string().trim().max(1000).optional(),
  email: yup.string().trim().email().max(320).optional(),
  phone: yup.string().trim().max(120).optional(),
  country: yup.string().trim().required("Please enter a country.").max(120),
  city: yup.string().trim().required("Please enter a city.").max(120),
  street: yup.string().trim().max(200).optional(),
  building: yup.string().trim().max(50).optional(),
  postCode: yup.string().trim().max(50).optional(),
});
