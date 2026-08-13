"use client";

import { FC, FormEvent, useCallback, useEffect } from "react";
import { setNestedObjectValues, useFormik } from "formik";
import * as yup from "yup";
import { Baby, Ban, Palmtree, Stethoscope, Tag } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { DialogFooter } from "@/public/desact/src/components/ui/dialog";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { cn } from "@/public/desact/src/components/ui/utils";
import { LeaveTypeCategory } from "@/api/modules/timeOff/leaveTypes/dto";

export type LeaveTypeFormValues = {
  name: string;
  description: string;
  category: LeaveTypeCategory | "";
  color: string;
};

const DEFAULT_COLOR = "#b08968";

const PRESET_COLORS = [
  "#b08968",
  "#a8674f",
  "#c9a24b",
  "#6f8f6a",
  "#5b7fa6",
  "#9a6f9c",
  "#c07b7b",
  "#7c8590",
];

type CategoryChip = {
  value: LeaveTypeCategory | "";
  label: string;
  icon: FC<{ className?: string }>;
};

const CATEGORY_CHIPS: CategoryChip[] = [
  { value: "", label: "None", icon: Tag },
  { value: LeaveTypeCategory.Vacation, label: "Vacation", icon: Palmtree },
  { value: LeaveTypeCategory.Sick, label: "Sick", icon: Stethoscope },
  { value: LeaveTypeCategory.Parental, label: "Parental", icon: Baby },
  { value: LeaveTypeCategory.Unpaid, label: "Unpaid", icon: Ban },
  { value: LeaveTypeCategory.Other, label: "Other", icon: Tag },
];

type Props = {
  initialValues?: Partial<LeaveTypeFormValues>;
  submitLabel: string;
  isLoading?: boolean;
  onCancelAction: () => void;
  onDirtyChangeAction?: (isDirty: boolean) => void;
  onSubmitAction: (values: LeaveTypeFormValues) => void | Promise<void>;
};

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Please enter a type name.")
    .min(2, "Type name must be at least 2 characters.")
    .max(200, "Type name must be at most 200 characters."),
  description: yup
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters.")
    .optional(),
  category: yup.mixed<LeaveTypeCategory | "">().optional(),
  color: yup.string().optional(),
});

export const LeaveTypeForm: FC<Props> = ({
  initialValues,
  submitLabel,
  isLoading = false,
  onCancelAction,
  onDirtyChangeAction,
  onSubmitAction,
}) => {
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
      color: initialValues?.color ?? DEFAULT_COLOR,
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
            <Label htmlFor="leave-type-name">Name</Label>
            <Input
              id="leave-type-name"
              value={formik.values.name}
              onChange={(e) => formik.setFieldValue("name", e.currentTarget.value)}
              placeholder="e.g., Paid Vacation"
              required
              disabled={isLoading}
              aria-invalid={!!formik.errors.name}
            />
            {formik.errors.name && <p className="text-sm text-destructive">{formik.errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-type-description">Description</Label>
            <Input
              id="leave-type-description"
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

          {/* Category chips */}
          <div className="space-y-2">
            <Label>Category</Label>
            <p className="text-xs text-muted-foreground">
              A system grouping used for icons and reporting.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORY_CHIPS.map((chip) => {
                const ChipIcon = chip.icon;
                const selected = formik.values.category === chip.value;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    disabled={isLoading}
                    onClick={() => formik.setFieldValue("category", chip.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selected
                        ? "border-brown-300 bg-brown-100 text-brown-800"
                        : "border-brown-200 text-brown-500 hover:bg-brown-50",
                    )}
                  >
                    <ChipIcon className="h-3.5 w-3.5" />
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <p className="text-xs text-muted-foreground">Used on the calendar and type list.</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {PRESET_COLORS.map((c) => {
                const selected = formik.values.color.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={isLoading}
                    aria-label={`Color ${c}`}
                    onClick={() => formik.setFieldValue("color", c)}
                    className={cn(
                      "h-7 w-7 rounded-full border transition-transform hover:scale-105",
                      selected ? "ring-2 ring-brown-400 ring-offset-2" : "border-brown-200",
                    )}
                    style={{ backgroundColor: c }}
                  />
                );
              })}
              <label
                className="flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-brown-300 px-2.5 text-xs text-brown-500 hover:bg-brown-50"
                title="Custom color"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-brown-200"
                  style={{ backgroundColor: formik.values.color }}
                />
                Custom
                <input
                  type="color"
                  value={formik.values.color}
                  onChange={(e) => formik.setFieldValue("color", e.currentTarget.value)}
                  disabled={isLoading}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <aside className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brown-400">Preview</p>
          <div className="rounded-xl border border-brown-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 flex-none rounded-full border border-brown-200"
                style={{ backgroundColor: formik.values.color || DEFAULT_COLOR }}
              />
              <span className="truncate text-sm font-medium text-brown-900">
                {formik.values.name.trim() || "Untitled type"}
              </span>
            </div>
            {formik.values.description.trim() && (
              <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                {formik.values.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              {selectedChip && selectedChip.value !== "" ? (
                <Badge variant="outline" className="gap-1 border-brown-200 bg-brown-50 text-brown-600">
                  <selectedChip.icon className="h-3 w-3" />
                  {selectedChip.label}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">No category</span>
              )}
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            You&apos;ll add policies (quotas, accrual, approvals) inside this type after creating it.
          </p>
        </aside>
      </div>

      <DialogFooter className="border-t border-brown-100 bg-white px-6 py-4">
        <Button type="button" variant="outline" disabled={isLoading} onClick={onCancelAction}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};
