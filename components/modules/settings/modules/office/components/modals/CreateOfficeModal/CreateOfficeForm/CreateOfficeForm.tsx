"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { FormError } from "@/components/feedback/FormError";

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
  /** Why the last attempt was refused. Keeps the dialog open with what was typed still in it. */
  errorMessage?: string | null;
  /** Per-field refusals from the backend, keyed by field name — what "the highlighted fields" means. */
  fieldErrors?: Record<string, string> | null;
  initialValues?: Partial<CreateOfficeFormValues>;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: CreateOfficeFormValues) => void | Promise<void>;
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
  // Required because the backend requires them: `OfficeCreateRequest` marks the whole address
  // `@NotBlank`. They used to be optional here and labelled "Optional", so a submit without a
  // building number came back as "check the highlighted fields" with nothing highlighted.
  street: yup.string().trim().required("Please enter a street.").max(200),
  building: yup.string().trim().required("Please enter a building number.").max(50),
  postCode: yup.string().trim().required("Please enter a post code.").max(50),
});

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

const sanitize = (
  values: CreateOfficeFormValues,
): CreateOfficeFormValues => ({
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
  errorMessage,
  fieldErrors,
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

  /**
   * What each field shows: this form's own validation first, then whatever the backend said about
   * that field. Without the second half a refusal could name a field ("check the highlighted
   * fields") while nothing on screen was highlighted.
   */
  const shownErrors: Partial<Record<keyof CreateOfficeFormValues, string>> = {
    ...(fieldErrors ?? {}),
    ...formik.errors,
  };

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
      <div className="max-h-[65vh] overflow-y-auto px-6 py-5 pr-8">
        <div className="space-y-5">
          {/* SECTION: DETAILS */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Office details</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Basic information about this office location.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="office-name">Name</Label>
              <Input
                id="office-name"
                value={formik.values.name}
                onChange={(e) =>
                  formik.setFieldValue("name", e.currentTarget.value)
                }
                placeholder="e.g., London HQ"
                disabled={isLoading}
                aria-invalid={!!shownErrors.name}
              />
              {shownErrors.name && (
                <p className="text-sm text-destructive">
                  {shownErrors.name}
                </p>
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
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="office-email">Email</Label>
                <Input
                  id="office-email"
                  value={formik.values.email}
                  onChange={(e) =>
                    formik.setFieldValue("email", e.currentTarget.value)
                  }
                  placeholder="Optional"
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.email}
                />
                {shownErrors.email && (
                  <p className="text-sm text-destructive">
                    {shownErrors.email}
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
                />
              </div>
            </div>
          </div>

          {/* SECTION: ADDRESS */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Address</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Physical location of the office.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="office-country">Country</Label>
                <Input
                  id="office-country"
                  value={formik.values.country}
                  onChange={(e) =>
                    formik.setFieldValue("country", e.currentTarget.value)
                  }
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.country}
                />
                {shownErrors.country && (
                  <p className="text-sm text-destructive">
                    {shownErrors.country}
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
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.city}
                />
                {shownErrors.city && (
                  <p className="text-sm text-destructive">
                    {shownErrors.city}
                  </p>
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
                  placeholder="e.g., Baker Street"
                  required
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.street}
                />
                {shownErrors.street && (
                  <p className="text-sm text-destructive">{shownErrors.street}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="office-building">Building</Label>
                <Input
                  id="office-building"
                  value={formik.values.building}
                  onChange={(e) =>
                    formik.setFieldValue("building", e.currentTarget.value)
                  }
                  placeholder="e.g., 221B"
                  required
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.building}
                />
                {shownErrors.building && (
                  <p className="text-sm text-destructive">{shownErrors.building}</p>
                )}
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
                placeholder="e.g., NW1 6XE"
                required
                disabled={isLoading}
                aria-invalid={!!shownErrors.postCode}
              />
              {shownErrors.postCode && (
                <p className="text-sm text-destructive">{shownErrors.postCode}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <FormError message={errorMessage} className="mx-6 mb-4"/>

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
          Create
        </Button>
      </DialogFooter>
    </form>
  );
};
