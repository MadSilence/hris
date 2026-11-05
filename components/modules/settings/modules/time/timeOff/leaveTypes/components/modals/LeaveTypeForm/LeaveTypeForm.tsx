"use client";

import { FC, FormEvent, useCallback, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Baby01Icon, BeachIcon, Stethoscope02Icon, Tag01Icon, UnavailableIcon } from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { DialogFooter } from "@/components/desact/dialog";
import { Input } from "@/components/desact/input";
import { Label } from "@/components/desact/label";
import { Badge } from "@/components/desact/badge";
import { cn } from "@/lib/cn";
import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { FieldError } from "@/components/desact/field-error";
import { LEAVE_TYPE_CATEGORY_KEYS } from "../../LeaveTypeCategoryChip/LeaveTypeCategoryChip";

export type LeaveTypeFormValues = {
  name: string;
  description: string;
  category: LeaveTypeCategory | "";
};

type CategoryChip = {
  value: LeaveTypeCategory | "";
  /** `null` is "None", from `common`. */
  labelKey: (typeof LEAVE_TYPE_CATEGORY_KEYS)[LeaveTypeCategory] | null;
  icon: IconSvgElement;
};

const CATEGORY_CHIPS: CategoryChip[] = [
  { value: "", labelKey: null, icon: Tag01Icon },
  { value: LeaveTypeCategory.Vacation, labelKey: LEAVE_TYPE_CATEGORY_KEYS[LeaveTypeCategory.Vacation], icon: BeachIcon },
  { value: LeaveTypeCategory.Sick, labelKey: LEAVE_TYPE_CATEGORY_KEYS[LeaveTypeCategory.Sick], icon: Stethoscope02Icon },
  { value: LeaveTypeCategory.Parental, labelKey: LEAVE_TYPE_CATEGORY_KEYS[LeaveTypeCategory.Parental], icon: Baby01Icon },
  { value: LeaveTypeCategory.Unpaid, labelKey: LEAVE_TYPE_CATEGORY_KEYS[LeaveTypeCategory.Unpaid], icon: UnavailableIcon },
  { value: LeaveTypeCategory.Other, labelKey: LEAVE_TYPE_CATEGORY_KEYS[LeaveTypeCategory.Other], icon: Tag01Icon },
];

type Props = {
  initialValues?: Partial<LeaveTypeFormValues>;
  submitLabel: string;
  isLoading?: boolean;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: LeaveTypeFormValues) => void | Promise<void>;
};

const buildSchema = (t: ReturnType<typeof useTranslations<"timeOff">>) => yup.object({
  name: yup
    .string()
    .trim()
    .required(t("leaveTypes.form.nameRequired"))
    .min(2, t("leaveTypes.form.nameMin"))
    .max(200, t("leaveTypes.form.nameMax")),
  description: yup
    .string()
    .trim()
    .max(1000, t("leaveTypes.form.descriptionMax"))
    .optional(),
  category: yup.mixed<LeaveTypeCategory | "">().optional(),
});

export const LeaveTypeForm: FC<Props> = ({
  initialValues,
  submitLabel,
  isLoading = false,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
  const t = useTranslations("timeOff");
  const tCommon = useTranslations("common");
  const schema = useMemo(() => buildSchema(t), [t]);
  const chipLabel = (chip: CategoryChip) => (chip.labelKey ? t(chip.labelKey) : tCommon("values.none"));
  const handleFormSubmission = useCallback(
    (values: LeaveTypeFormValues) =>
      onSubmitAction({
        ...values,
        name: values.name.trim(),
        description: values.description.trim(),
      }),
    [onSubmitAction],
  );

  const formik = useFormik<LeaveTypeFormValues>({
    initialValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      category: initialValues?.category ?? "",
    },
    validationSchema: schema,
    enableReinitialize: true,
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

  const selectedChip = CATEGORY_CHIPS.find((c) => c.value === formik.values.category);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid max-h-[70vh] gap-6 overflow-y-auto px-6 py-6 sm:grid-cols-[1fr_15rem]">
        {/* Form fields */}
        <div className="space-y-5">
          <div className="space-y-2">
            <RequiredLabel htmlFor="leave-type-name" required>{t("leaveTypes.form.name")}</RequiredLabel>
            <Input
              id="leave-type-name"
              value={formik.values.name}
              onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
              required
              disabled={isLoading}
              aria-invalid={!!formik.errors.name}
            />
            {formik.errors.name && <FieldError>{formik.errors.name}</FieldError>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-type-description">{t("leaveTypes.form.description")}</Label>
            <Input
              id="leave-type-description"
              value={formik.values.description}
              onChange={(e) => formik.setFieldValue("description", e.currentTarget.value)}
              disabled={isLoading}
              aria-invalid={!!formik.errors.description}
            />
            {formik.errors.description && (
              <FieldError>{formik.errors.description}</FieldError>
            )}
          </div>

          {/* Category chips */}
          <div className="space-y-2">
            <Label>{t("leaveTypes.form.category")}</Label>
            <p className="text-hint text-tertiary">
              {t("leaveTypes.form.categoryHint")}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORY_CHIPS.map((chip) => {
                const selected = formik.values.category === chip.value;
                return (
                  <button
                    key={chip.value || "none"}
                    type="button"
                    disabled={isLoading}
                    onClick={() => formik.setFieldValue("category", chip.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-body transition-colors",
                      selected
                        ? "border-accent-ring bg-accent-subtle text-accent-text"
                        : "border-divider text-tertiary hover:bg-subtle",
                    )}
                  >
                    <Icon icon={chip.icon} size="sm" className="size-3.5" />
                    {chipLabel(chip)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <aside className="space-y-3">
          <p className="text-hint font-semibold text-tertiary">{t("leaveTypes.form.preview")}</p>
          <div className="rounded-card border border-divider bg-card p-4 shadow-card">
            <div className="flex items-center gap-2.5">
              <span className="truncate text-body font-medium text-primary">
                {formik.values.name.trim() || t("leaveTypes.form.untitled")}
              </span>
            </div>
            {formik.values.description.trim() && (
              <p className="mt-1.5 line-clamp-2 text-hint text-tertiary">
                {formik.values.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              {selectedChip && selectedChip.value !== "" ? (
                <Badge variant="outline" className="gap-1 border-divider bg-subtle text-secondary">
                  <Icon icon={selectedChip.icon} size="sm" className="size-3.5" />
                  {chipLabel(selectedChip)}
                </Badge>
              ) : (
                <span className="text-hint text-tertiary">{tCommon("values.none")}</span>
              )}
            </div>
          </div>
          <p className="text-hint leading-relaxed text-tertiary">
            {t("leaveTypes.form.policiesHint")}
          </p>
        </aside>
      </div>

      <DialogFooter className="border-t border-divider bg-card px-6 py-4">
        <Button type="button" variant="secondary" disabled={isLoading} onClick={onCancelAction}>
          {tCommon("actions.cancel")}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};
