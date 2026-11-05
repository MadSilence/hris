"use client";

import { useTranslations } from "next-intl";
import { FC, FormEvent, useCallback, useEffect, useMemo } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { FormError } from "@/components/feedback/FormError";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";

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
  /** Why the last attempt was refused. Keeps the dialog open with what was typed still in it. */
  errorMessage?: string | null;
  /** Per-field refusals from the backend, keyed by field name — what "the highlighted fields" means. */
  fieldErrors?: Record<string, string> | null;
  initialValues?: Partial<CreateLegalEntityFormValues>;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (
    values: CreateLegalEntityFormValues,
  ) => void | Promise<void>;
}

type LegalEntitiesTranslator = ReturnType<typeof useTranslations<"structure.legalEntities">>;
type PlacesTranslator = ReturnType<typeof useTranslations<"structure.places">>;

const buildCreateSchema = (t: LegalEntitiesTranslator, tPlaces: PlacesTranslator) => yup.object({
  name: yup
    .string()
    .trim()
    .required(t("validation.nameRequired"))
    .min(2, t("validation.nameMin"))
    .max(200, t("validation.nameMax")),
  description: yup
    .string()
    .trim()
    .max(1000, tPlaces("validation.descriptionMax"))
    .optional(),
  registrationNumber: yup
    .string()
    .trim()
    .required(t("validation.registrationRequired"))
    .max(120, t("validation.registrationMax")),
  taxId: yup
    .string()
    .trim()
    .required(t("validation.taxIdRequired"))
    .max(120, t("validation.taxIdMax")),
  country: yup
    .string()
    .trim()
    .required(tPlaces("validation.countryRequired"))
    .max(120, tPlaces("validation.countryMax")),
  city: yup
    .string()
    .trim()
    .required(tPlaces("validation.cityRequired"))
    .max(120, tPlaces("validation.cityMax")),
  // Required because the backend requires them: `LegalEntityCreateRequest` marks the whole
  // registered address `@NotBlank`. They used to be optional here and labelled "Optional", so a
  // submit without a building number came back as "check the highlighted fields" with nothing
  // highlighted — the form was promising something the API would refuse.
  street: yup
    .string()
    .trim()
    .required(tPlaces("validation.streetRequired"))
    .max(200, tPlaces("validation.streetMax")),
  building: yup
    .string()
    .trim()
    .required(tPlaces("validation.buildingRequired"))
    .max(50, tPlaces("validation.buildingMax")),
  postCode: yup
    .string()
    .trim()
    .required(tPlaces("validation.postCodeRequired"))
    .max(50, tPlaces("validation.postCodeMax")),
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
  errorMessage,
  fieldErrors,
  initialValues,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const t = useTranslations("structure.legalEntities");
  const tPlaces = useTranslations("structure.places");
  const tCommon = useTranslations("common");
  const createSchema = useMemo(() => buildCreateSchema(t, tPlaces), [t, tPlaces]);

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

  /**
   * What each field shows: this form's own validation first, then whatever the backend said about
   * that field. Without the second half a refusal could name a field ("check the highlighted
   * fields") while nothing on screen was highlighted.
   */
  const shownErrors: Partial<Record<keyof CreateLegalEntityFormValues, string>> = {
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
          <div className="mb-4">
            <h3 className="text-body font-semibold">{t("create.detailsTitle")}</h3>
            <p className="mt-1 text-body text-tertiary">
              {t("create.detailsHint")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <RequiredLabel htmlFor="legal-entity-name" required>{tCommon("fields.name")}</RequiredLabel>
              <Input
                id="legal-entity-name"
                value={formik.values.name}
                onChange={(e) =>
                  formik.setFieldValue("name", e.currentTarget.value)
                }
                required
                disabled={isLoading}
                aria-invalid={!!shownErrors.name}
              />
              {shownErrors.name && (
                <FieldError>{shownErrors.name}</FieldError>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal-entity-description">{tCommon("fields.description")}</Label>
              <Input
                id="legal-entity-description"
                value={formik.values.description}
                onChange={(e) =>
                  formik.setFieldValue("description", e.currentTarget.value)
                }
                disabled={isLoading}
                aria-invalid={!!shownErrors.description}
              />
              {shownErrors.description && (
                <FieldError>{shownErrors.description}</FieldError>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel htmlFor="legal-entity-registration-number" required>
                  {t("registrationNumber")}
                </RequiredLabel>
                <Input
                  id="legal-entity-registration-number"
                  value={formik.values.registrationNumber}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "registrationNumber",
                      e.currentTarget.value,
                    )
                  }
                  required
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.registrationNumber}
                />
                {shownErrors.registrationNumber && (
                  <FieldError>{shownErrors.registrationNumber}</FieldError>
                )}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="legal-entity-tax-id" required>{t("taxId")}</RequiredLabel>
                <Input
                  id="legal-entity-tax-id"
                  value={formik.values.taxId}
                  onChange={(e) =>
                    formik.setFieldValue("taxId", e.currentTarget.value)
                  }
                  required
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.taxId}
                />
                {shownErrors.taxId && (
                  <FieldError>{shownErrors.taxId}</FieldError>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-body font-semibold">{tPlaces("address")}</h3>
            <p className="mt-1 text-body text-tertiary">
              {t("create.addressHint")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel htmlFor="legal-entity-country" required>{tPlaces("country")}</RequiredLabel>
                <Input
                  id="legal-entity-country"
                  value={formik.values.country}
                  onChange={(e) =>
                    formik.setFieldValue("country", e.currentTarget.value)
                  }
                  required
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.country}
                />
                {shownErrors.country && (
                  <FieldError>{shownErrors.country}</FieldError>
                )}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="legal-entity-city" required>{tPlaces("city")}</RequiredLabel>
                <Input
                  id="legal-entity-city"
                  value={formik.values.city}
                  onChange={(e) =>
                    formik.setFieldValue("city", e.currentTarget.value)
                  }
                  required
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.city}
                />
                {shownErrors.city && (
                  <FieldError>{shownErrors.city}</FieldError>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <RequiredLabel htmlFor="legal-entity-street" required>{tPlaces("street")}</RequiredLabel>
                <Input
                  id="legal-entity-street"
                  value={formik.values.street}
                  onChange={(e) =>
                    formik.setFieldValue("street", e.currentTarget.value)
                  }
                  required
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.street}
                />
                {shownErrors.street && (
                  <FieldError>{shownErrors.street}</FieldError>
                )}
              </div>

              <div className="space-y-2">
                <RequiredLabel htmlFor="legal-entity-building" required>{tPlaces("building")}</RequiredLabel>
                <Input
                  id="legal-entity-building"
                  value={formik.values.building}
                  onChange={(e) =>
                    formik.setFieldValue("building", e.currentTarget.value)
                  }
                  required
                  disabled={isLoading}
                  aria-invalid={!!shownErrors.building}
                />
                {shownErrors.building && (
                  <FieldError>{shownErrors.building}</FieldError>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <RequiredLabel htmlFor="legal-entity-post-code" required>{tPlaces("postCode")}</RequiredLabel>
              <Input
                id="legal-entity-post-code"
                value={formik.values.postCode}
                onChange={(e) =>
                  formik.setFieldValue("postCode", e.currentTarget.value)
                }
                required
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
