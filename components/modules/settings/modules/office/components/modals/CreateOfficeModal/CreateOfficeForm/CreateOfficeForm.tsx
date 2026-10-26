"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/public/desact/src/components/ui/button";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { FormError } from "@/components/feedback/FormError";
import { RequiredLabel } from "@/components/ui/RequiredLabel";

export type CreateOfficeFormValues = {
  name: string;
  description: string;
  email: string;
  phone: string;
  /** People here work from anywhere in the office's country: no postal address is asked for. */
  isRemote: boolean;
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
  isRemote: yup.boolean(),
  // The country always: a remote office is "anywhere in" it, and it is bound to that country's calendar.
  country: yup.string().trim().required("Please enter a country.").max(120),
  // The postal address is required exactly when the backend requires it — of an office that is not
  // remote (`OfficeAddress`, O00009). It was once optional here while the API required it, so a submit
  // without a building number came back as "check the highlighted fields" with nothing highlighted.
  city: addressPart("Please enter a city.", 120),
  street: addressPart("Please enter a street.", 200),
  building: addressPart("Please enter a building number.", 50),
  postCode: addressPart("Please enter a post code.", 50),
});

function addressPart(message: string, max: number) {
  return yup
    .string()
    .trim()
    .max(max)
    .when("isRemote", {
      is: true,
      then: (schema) => schema.optional(),
      otherwise: (schema) => schema.required(message),
    });
}

const getInitialValues = (
  initialValues?: Partial<CreateOfficeFormValues>,
): CreateOfficeFormValues => ({
  name: initialValues?.name ?? "",
  description: initialValues?.description ?? "",
  email: initialValues?.email ?? "",
  phone: initialValues?.phone ?? "",
  isRemote: initialValues?.isRemote ?? false,
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
  isRemote: values.isRemote,
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
              <RequiredLabel htmlFor="office-name" required>Name</RequiredLabel>
              <Input
                id="office-name"
                value={formik.values.name}
                onChange={(e) =>
                  formik.setFieldValue("name", e.currentTarget.value)
                }
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
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* The same field and words as the office page's own Remote checkbox. */}
            <div className="space-y-2">
              <Label htmlFor="office-remote">Remote</Label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  id="office-remote"
                  checked={formik.values.isRemote}
                  onCheckedChange={(c) => formik.setFieldValue("isRemote", c === true)}
                  disabled={isLoading}
                />
                People here work from anywhere in the office&apos;s country
              </label>
            </div>
          </div>

          {/* SECTION: ADDRESS */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Address</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {formik.values.isRemote
                ? "A remote office needs only its country; the rest of the address is optional."
                : "Physical location of the office."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel htmlFor="office-country" required>Country</RequiredLabel>
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
                <RequiredLabel htmlFor="office-city" required={!formik.values.isRemote}>City</RequiredLabel>
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
                <RequiredLabel htmlFor="office-street" required={!formik.values.isRemote}>Street</RequiredLabel>
                <Input
                  id="office-street"
                  value={formik.values.street}
                  onChange={(e) =>
                    formik.setFieldValue("street", e.currentTarget.value)
                  }
                  required={!formik.values.isRemote}
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.street}
                />
                {shownErrors.street && (
                  <p className="text-sm text-destructive">{shownErrors.street}</p>
                )}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="office-building" required={!formik.values.isRemote}>Building</RequiredLabel>
                <Input
                  id="office-building"
                  value={formik.values.building}
                  onChange={(e) =>
                    formik.setFieldValue("building", e.currentTarget.value)
                  }
                  required={!formik.values.isRemote}
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.building}
                />
                {shownErrors.building && (
                  <p className="text-sm text-destructive">{shownErrors.building}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="office-post-code" required={!formik.values.isRemote}>Post Code</RequiredLabel>
              <Input
                id="office-post-code"
                value={formik.values.postCode}
                onChange={(e) =>
                  formik.setFieldValue("postCode", e.currentTarget.value)
                }
                required={!formik.values.isRemote}
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
