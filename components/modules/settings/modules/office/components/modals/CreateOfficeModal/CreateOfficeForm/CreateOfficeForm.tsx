"use client";

import { useTranslations } from "next-intl";
import { FC, FormEvent, useCallback, useEffect, useMemo } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";

import { Button } from "@/components/desact/button";
import { Checkbox } from "@/components/desact/checkbox";
import { DialogFooter } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FormError } from "@/components/feedback/FormError";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";

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

type OfficesTranslator = ReturnType<typeof useTranslations<"structure.offices">>;
type PlacesTranslator = ReturnType<typeof useTranslations<"structure.places">>;

const buildCreateOfficeSchema = (t: OfficesTranslator, tPlaces: PlacesTranslator) => yup.object({
  name: yup
    .string()
    .trim()
    .required(t("create.nameRequired"))
    .min(2)
    .max(200),
  description: yup.string().trim().max(1000).optional(),
  email: yup.string().trim().email().max(320).optional(),
  phone: yup.string().trim().max(120).optional(),
  isRemote: yup.boolean(),
  // The country always: a remote office is "anywhere in" it, and it is bound to that country's calendar.
  country: yup.string().trim().required(tPlaces("validation.countryRequired")).max(120),
  // The postal address is required exactly when the backend requires it — of an office that is not
  // remote (`OfficeAddress`, O00009). It was once optional here while the API required it, so a submit
  // without a building number came back as "check the highlighted fields" with nothing highlighted.
  city: addressPart(tPlaces("validation.cityRequired"), 120),
  street: addressPart(tPlaces("validation.streetRequired"), 200),
  building: addressPart(tPlaces("validation.buildingRequired"), 50),
  postCode: addressPart(tPlaces("validation.postCodeRequired"), 50),
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
  const t = useTranslations("structure.offices");
  const tPlaces = useTranslations("structure.places");
  const tCommon = useTranslations("common");
  const createOfficeSchema = useMemo(() => buildCreateOfficeSchema(t, tPlaces), [t, tPlaces]);

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
            <h3 className="text-body font-semibold">{t("create.detailsTitle")}</h3>
            <p className="mt-1 text-body text-tertiary">
              {t("create.detailsHint")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <RequiredLabel htmlFor="office-name" required>{tCommon("fields.name")}</RequiredLabel>
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
                <FieldError>{shownErrors.name}</FieldError>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="office-description">{tCommon("fields.description")}</Label>
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
                <Label htmlFor="office-email">{tCommon("fields.email")}</Label>
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
                  <FieldError>{shownErrors.email}</FieldError>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="office-phone">{t("phone")}</Label>
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
              <Label htmlFor="office-remote">{t("remote")}</Label>
              <label className="flex items-center gap-2 text-body text-primary">
                <Checkbox
                  id="office-remote"
                  checked={formik.values.isRemote}
                  onCheckedChange={(c) => formik.setFieldValue("isRemote", c === true)}
                  disabled={isLoading}
                />
                {t("remoteHint")}
              </label>
            </div>
          </div>

          {/* SECTION: ADDRESS */}
          <div className="mb-4">
            <h3 className="text-body font-semibold">{tPlaces("address")}</h3>
            <p className="mt-1 text-body text-tertiary">
              {formik.values.isRemote
                ? t("create.addressHintRemote")
                : t("create.addressHint")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel htmlFor="office-country" required>{tPlaces("country")}</RequiredLabel>
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
                  <FieldError>{shownErrors.country}</FieldError>
                )}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="office-city" required={!formik.values.isRemote}>{tPlaces("city")}</RequiredLabel>
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
                  <FieldError>{shownErrors.city}</FieldError>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel htmlFor="office-street" required={!formik.values.isRemote}>{tPlaces("street")}</RequiredLabel>
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
                  <FieldError>{shownErrors.street}</FieldError>
                )}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="office-building" required={!formik.values.isRemote}>{tPlaces("building")}</RequiredLabel>
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
                  <FieldError>{shownErrors.building}</FieldError>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="office-post-code" required={!formik.values.isRemote}>{tPlaces("postCode")}</RequiredLabel>
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
                <FieldError>{shownErrors.postCode}</FieldError>
              )}
            </div>
          </div>
        </div>
      </div>

      <FormError message={errorMessage} className="mx-6 mb-4"/>

      <DialogFooter className="border-t border-divider bg-card px-6 py-4">
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading}
          onClick={onCancelAction}
        >
          {tCommon("actions.cancel")}
        </Button>

        <Button type="submit" disabled={isLoading}>
          {tCommon("actions.create")}
        </Button>
      </DialogFooter>
    </form>
  );
};
